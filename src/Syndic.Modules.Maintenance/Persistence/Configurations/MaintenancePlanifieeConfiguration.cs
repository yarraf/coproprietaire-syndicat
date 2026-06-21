using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Syndic.Modules.Maintenance.Domain.Entities;
using Syndic.Modules.Maintenance.Domain.Enums;

namespace Syndic.Modules.Maintenance.Persistence.Configurations;

public class MaintenancePlanifieeConfiguration : IEntityTypeConfiguration<MaintenancePlanifiee>
{
    public void Configure(EntityTypeBuilder<MaintenancePlanifiee> builder)
    {
        builder.ToTable("maintenance_planifiee");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ResidenceId).HasColumnName("residence_id").IsRequired();
        builder.Property(x => x.ImmeubleId).HasColumnName("immeuble_id");
        builder.Property(x => x.Type).HasColumnName("type").HasMaxLength(100).IsRequired();
        builder.Property(x => x.Libelle).HasColumnName("libelle").HasMaxLength(300).IsRequired();
        builder.Property(x => x.DatePrevue).HasColumnName("date_prevue").IsRequired();
        builder.Property(x => x.Recurrence).HasColumnName("recurrence").HasMaxLength(100);
        builder.Property(x => x.Statut)
            .HasColumnName("statut")
            .HasMaxLength(20)
            .IsRequired()
            .HasConversion(
                v => v == MaintenanceStatut.AVenir  ? "a_venir"
                   : v == MaintenanceStatut.EnCours ? "en_cours"
                   :                                  "terminee",
                v => v == "a_venir"  ? MaintenanceStatut.AVenir
                   : v == "en_cours" ? MaintenanceStatut.EnCours
                   :                   MaintenanceStatut.Terminee);
        builder.Property(x => x.VisibleResidents).HasColumnName("visible_residents").IsRequired();

        builder.HasIndex(x => x.ResidenceId).HasDatabaseName("ix_maintenance_planifiee_residence_id");
    }
}
