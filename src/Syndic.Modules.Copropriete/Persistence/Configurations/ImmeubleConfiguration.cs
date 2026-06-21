using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Syndic.Modules.Copropriete.Domain.Entities;

namespace Syndic.Modules.Copropriete.Persistence.Configurations;

public class ImmeubleConfiguration : IEntityTypeConfiguration<Immeuble>
{
    public void Configure(EntityTypeBuilder<Immeuble> builder)
    {
        builder.ToTable("immeubles");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.GroupeHabitationId).HasColumnName("groupe_habitation_id").IsRequired();
        builder.Property(x => x.BlockName).HasColumnName("nom_bloc").HasMaxLength(100).IsRequired();
        builder.Property(x => x.Address).HasColumnName("adresse");
        builder.Property(x => x.NbFloors).HasColumnName("nb_etages").IsRequired();

        builder.HasIndex(x => x.GroupeHabitationId).HasDatabaseName("ix_immeubles_groupe_habitation_id");

        builder.HasMany(x => x.Lots)
            .WithOne(x => x.Immeuble)
            .HasForeignKey(x => x.ImmeubleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
