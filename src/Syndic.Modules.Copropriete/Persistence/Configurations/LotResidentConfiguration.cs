using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Syndic.Modules.Copropriete.Domain.Entities;
using Syndic.Modules.Copropriete.Domain.Enums;

namespace Syndic.Modules.Copropriete.Persistence.Configurations;

public class LotResidentConfiguration : IEntityTypeConfiguration<LotResident>
{
    public void Configure(EntityTypeBuilder<LotResident> builder)
    {
        builder.ToTable("lot_residents");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.LotId).HasColumnName("lot_id").IsRequired();
        builder.Property(x => x.ResidentId).HasColumnName("resident_id").IsRequired();
        builder.Property(x => x.Type)
            .HasColumnName("type")
            .HasMaxLength(20)
            .IsRequired()
            .HasConversion(
                v => v == ResidentType.Owner ? "proprietaire" : "locataire",
                v => v == "proprietaire" ? ResidentType.Owner : ResidentType.Tenant);
        builder.Property(x => x.StartDate).HasColumnName("date_debut").IsRequired();
        builder.Property(x => x.EndDate).HasColumnName("date_fin");

        builder.HasIndex(x => x.LotId).HasDatabaseName("ix_lot_residents_lot_id");
        builder.HasIndex(x => x.ResidentId).HasDatabaseName("ix_lot_residents_resident_id");

        builder.HasOne(x => x.Resident)
            .WithMany(x => x.LotResidents)
            .HasForeignKey(x => x.ResidentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
