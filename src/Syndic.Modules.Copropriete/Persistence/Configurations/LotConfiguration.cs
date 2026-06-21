using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Syndic.Modules.Copropriete.Domain.Entities;
using Syndic.Modules.Copropriete.Domain.Enums;

namespace Syndic.Modules.Copropriete.Persistence.Configurations;

public class LotConfiguration : IEntityTypeConfiguration<Lot>
{
    public void Configure(EntityTypeBuilder<Lot> builder)
    {
        builder.ToTable("lots");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ImmeubleId).HasColumnName("immeuble_id").IsRequired();
        builder.Property(x => x.Number).HasColumnName("numero").HasMaxLength(50).IsRequired();
        builder.Property(x => x.Type)
            .HasColumnName("type")
            .HasMaxLength(30)
            .IsRequired()
            .HasConversion(
                v => v == LotType.Apartment ? "appartement" : "local_commercial",
                v => v == "appartement" ? LotType.Apartment : LotType.CommercialSpace);
        builder.Property(x => x.Floor).HasColumnName("etage").IsRequired();
        builder.Property(x => x.Area).HasColumnName("superficie").HasColumnType("numeric(10,2)");
        builder.Property(x => x.Balance).HasColumnName("solde").HasColumnType("numeric(14,2)").IsRequired();

        builder.HasIndex(x => x.ImmeubleId).HasDatabaseName("ix_lots_immeuble_id");

        builder.HasMany(x => x.LotResidents)
            .WithOne(x => x.Lot)
            .HasForeignKey(x => x.LotId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
