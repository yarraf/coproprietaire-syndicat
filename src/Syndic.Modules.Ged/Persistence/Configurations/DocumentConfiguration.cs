using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Syndic.Modules.Ged.Domain.Entities;
using Syndic.Modules.Ged.Domain.Enums;

namespace Syndic.Modules.Ged.Persistence.Configurations;

public class DocumentConfiguration : IEntityTypeConfiguration<Document>
{
    public void Configure(EntityTypeBuilder<Document> builder)
    {
        builder.ToTable("documents");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ResidenceId).HasColumnName("residence_id");
        builder.Property(x => x.ImmeubleId).HasColumnName("immeuble_id");
        builder.Property(x => x.Type)
            .HasColumnName("type")
            .HasMaxLength(20)
            .IsRequired()
            .HasConversion(
                v => v == DocumentType.Reglement ? "reglement"
                   : v == DocumentType.PvAg      ? "pv_ag"
                   :                               "autre",
                v => v == "reglement" ? DocumentType.Reglement
                   : v == "pv_ag"     ? DocumentType.PvAg
                   :                    DocumentType.Autre);
        builder.Property(x => x.Titre).HasColumnName("titre").HasMaxLength(300).IsRequired();
        builder.Property(x => x.FichierPath).HasColumnName("fichier_path").HasMaxLength(500).IsRequired();
        builder.Property(x => x.Date).HasColumnName("date").IsRequired();
        builder.Property(x => x.VisibleResidents).HasColumnName("visible_residents").IsRequired();

        builder.HasIndex(x => x.ResidenceId).HasDatabaseName("ix_documents_residence_id");
        builder.HasIndex(x => x.Type).HasDatabaseName("ix_documents_type");
    }
}
