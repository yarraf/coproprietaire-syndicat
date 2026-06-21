using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Syndic.Modules.Assemblees.Domain.Entities;
using Syndic.Modules.Assemblees.Domain.Enums;

namespace Syndic.Modules.Assemblees.Persistence.Configurations;

public class AssembleeConfiguration : IEntityTypeConfiguration<Assemblee>
{
    public void Configure(EntityTypeBuilder<Assemblee> builder)
    {
        builder.ToTable("assemblees");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ResidenceId).HasColumnName("residence_id").IsRequired();
        builder.Property(x => x.Titre).HasColumnName("titre").HasMaxLength(300).IsRequired();
        builder.Property(x => x.Date).HasColumnName("date").IsRequired();
        builder.Property(x => x.Lieu).HasColumnName("lieu").HasMaxLength(300).IsRequired();
        builder.Property(x => x.OrdreDuJour).HasColumnName("ordre_du_jour").HasColumnType("text").IsRequired();
        builder.Property(x => x.Statut)
            .HasColumnName("statut")
            .HasMaxLength(20)
            .IsRequired()
            .HasConversion(
                v => v == AssembleeStatut.Planifiee ? "planifiee"
                   : v == AssembleeStatut.Tenue     ? "tenue"
                   :                                  "annulee",
                v => v == "planifiee" ? AssembleeStatut.Planifiee
                   : v == "tenue"     ? AssembleeStatut.Tenue
                   :                    AssembleeStatut.Annulee);
        builder.Property(x => x.PvDocumentId).HasColumnName("pv_document_id");

        builder.HasIndex(x => x.ResidenceId).HasDatabaseName("ix_assemblees_residence_id");
    }
}
