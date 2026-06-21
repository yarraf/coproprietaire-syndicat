using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Syndic.Modules.Copropriete.Domain.Entities;
using Syndic.Modules.Copropriete.Domain.Enums;

namespace Syndic.Modules.Copropriete.Persistence.Configurations;

public class ResidentConfiguration : IEntityTypeConfiguration<Resident>
{
    public void Configure(EntityTypeBuilder<Resident> builder)
    {
        builder.ToTable("residents");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.LastName).HasColumnName("nom").HasMaxLength(100).IsRequired();
        builder.Property(x => x.FirstName).HasColumnName("prenom").HasMaxLength(100).IsRequired();
        builder.Property(x => x.Email).HasColumnName("email").HasMaxLength(256).IsRequired();
        builder.Property(x => x.Phone).HasColumnName("telephone").HasMaxLength(30);
        builder.Property(x => x.Type)
            .HasColumnName("type")
            .HasMaxLength(20)
            .IsRequired()
            .HasConversion(
                v => v == ResidentType.Owner ? "proprietaire" : "locataire",
                v => v == "proprietaire" ? ResidentType.Owner : ResidentType.Tenant);
        builder.Property(x => x.Status)
            .HasColumnName("statut")
            .HasMaxLength(20)
            .IsRequired()
            .HasConversion(
                v => v == ResidentStatus.Active ? "actif" : "inactif",
                v => v == "actif" ? ResidentStatus.Active : ResidentStatus.Inactive);
        builder.Property(x => x.IsAccountActivated).HasColumnName("compte_active").IsRequired();
        builder.Property(x => x.UserId).HasColumnName("user_id");

        builder.HasIndex(x => x.Email).IsUnique().HasDatabaseName("ix_residents_email");
        builder.HasIndex(x => x.UserId)
            .IsUnique()
            .HasDatabaseName("ix_residents_user_id")
            .HasFilter("user_id IS NOT NULL");
    }
}
