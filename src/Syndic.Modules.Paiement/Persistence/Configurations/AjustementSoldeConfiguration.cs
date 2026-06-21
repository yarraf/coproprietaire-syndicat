using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Syndic.Modules.Paiement.Domain.Entities;
using Syndic.Modules.Paiement.Domain.Enums;

namespace Syndic.Modules.Paiement.Persistence.Configurations;

public class AjustementSoldeConfiguration : IEntityTypeConfiguration<AjustementSolde>
{
    public void Configure(EntityTypeBuilder<AjustementSolde> builder)
    {
        builder.ToTable("ajustements_solde");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.LotId).HasColumnName("lot_id").IsRequired();
        builder.Property(x => x.Montant).HasColumnName("montant").HasColumnType("numeric(14,2)").IsRequired();
        builder.Property(x => x.Type)
            .HasColumnName("type")
            .HasMaxLength(20)
            .IsRequired()
            .HasConversion(
                v => v == AjustementType.Charge ? "charge" : "regularisation",
                v => v == "charge" ? AjustementType.Charge : AjustementType.Regularisation);
        builder.Property(x => x.Libelle).HasColumnName("libelle").HasMaxLength(200).IsRequired();
        builder.Property(x => x.Periode).HasColumnName("periode").HasMaxLength(20).IsRequired();
        builder.Property(x => x.CreePar).HasColumnName("cree_par").IsRequired();

        builder.HasIndex(x => x.LotId).HasDatabaseName("ix_ajustements_solde_lot_id");
    }
}
