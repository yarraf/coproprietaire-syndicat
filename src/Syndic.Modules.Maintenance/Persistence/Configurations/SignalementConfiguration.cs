using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Syndic.Modules.Maintenance.Domain.Entities;
using Syndic.Modules.Maintenance.Domain.Enums;

namespace Syndic.Modules.Maintenance.Persistence.Configurations;

public class SignalementConfiguration : IEntityTypeConfiguration<Signalement>
{
    public void Configure(EntityTypeBuilder<Signalement> builder)
    {
        builder.ToTable("signalements");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Type)
            .HasColumnName("type")
            .HasMaxLength(20)
            .IsRequired()
            .HasConversion(
                v => v == SignalementType.Reclamation ? "reclamation" : "incident",
                v => v == "reclamation" ? SignalementType.Reclamation : SignalementType.Incident);

        builder.Property(x => x.LotId).HasColumnName("lot_id");
        builder.Property(x => x.ImmeubleId).HasColumnName("immeuble_id");
        builder.Property(x => x.ResidentId).HasColumnName("resident_id").IsRequired();
        builder.Property(x => x.Titre).HasColumnName("titre").HasMaxLength(300).IsRequired();
        builder.Property(x => x.Description).HasColumnName("description").HasColumnType("text").IsRequired();
        builder.Property(x => x.PhotoPath).HasColumnName("photo_path").HasMaxLength(500);
        builder.Property(x => x.Statut)
            .HasColumnName("statut")
            .HasMaxLength(20)
            .IsRequired()
            .HasConversion(
                v => v == SignalementStatut.Recu    ? "recu"
                   : v == SignalementStatut.EnCours ? "en_cours"
                   : v == SignalementStatut.Resolu  ? "resolu"
                   :                                  "cloture",
                v => v == "recu"     ? SignalementStatut.Recu
                   : v == "en_cours" ? SignalementStatut.EnCours
                   : v == "resolu"   ? SignalementStatut.Resolu
                   :                   SignalementStatut.Cloture);
        builder.Property(x => x.AssigneA).HasColumnName("assigne_a");
        builder.Property(x => x.Reponse).HasColumnName("reponse").HasColumnType("text");

        builder.HasIndex(x => x.ResidentId).HasDatabaseName("ix_signalements_resident_id");
        builder.HasIndex(x => x.Statut).HasDatabaseName("ix_signalements_statut");
    }
}
