using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Syndic.Modules.Paiement.Domain.Enums;
using PaiementEntity = Syndic.Modules.Paiement.Domain.Entities.Paiement;

namespace Syndic.Modules.Paiement.Persistence.Configurations;

public class PaiementConfiguration : IEntityTypeConfiguration<PaiementEntity>
{
    public void Configure(EntityTypeBuilder<PaiementEntity> builder)
    {
        builder.ToTable("paiements");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.LotId).HasColumnName("lot_id").IsRequired();
        builder.Property(x => x.ResidentId).HasColumnName("resident_id").IsRequired();
        builder.Property(x => x.Montant).HasColumnName("montant").HasColumnType("numeric(14,2)").IsRequired();
        builder.Property(x => x.Periode).HasColumnName("periode").HasMaxLength(20).IsRequired();
        builder.Property(x => x.ModePaiement).HasColumnName("mode_paiement").HasMaxLength(50).IsRequired();
        builder.Property(x => x.JustificatifPath).HasColumnName("justificatif_path").HasMaxLength(500);
        builder.Property(x => x.Statut)
            .HasColumnName("statut")
            .HasMaxLength(20)
            .IsRequired()
            .HasConversion(
                v => v == PaymentStatus.EnAttente ? "en_attente"
                   : v == PaymentStatus.Valide    ? "valide"
                   :                                "rejete",
                v => v == "valide"  ? PaymentStatus.Valide
                   : v == "rejete"  ? PaymentStatus.Rejete
                   :                  PaymentStatus.EnAttente);
        builder.Property(x => x.ValidePar).HasColumnName("valide_par");
        builder.Property(x => x.DateValidation).HasColumnName("date_validation");
        builder.Property(x => x.MotifRejet).HasColumnName("motif_rejet").HasMaxLength(500);

        builder.HasIndex(x => x.LotId).HasDatabaseName("ix_paiements_lot_id");
        builder.HasIndex(x => x.ResidentId).HasDatabaseName("ix_paiements_resident_id");
        builder.HasIndex(x => x.Statut).HasDatabaseName("ix_paiements_statut");
    }
}
