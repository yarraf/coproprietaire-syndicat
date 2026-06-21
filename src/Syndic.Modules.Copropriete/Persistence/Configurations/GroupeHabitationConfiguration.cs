using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Syndic.Modules.Copropriete.Domain.Entities;

namespace Syndic.Modules.Copropriete.Persistence.Configurations;

public class GroupeHabitationConfiguration : IEntityTypeConfiguration<GroupeHabitation>
{
    public void Configure(EntityTypeBuilder<GroupeHabitation> builder)
    {
        builder.ToTable("groupes_habitation");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ResidenceId).HasColumnName("residence_id").IsRequired();
        builder.Property(x => x.Name).HasColumnName("nom").HasMaxLength(200).IsRequired();

        builder.HasIndex(x => x.ResidenceId).HasDatabaseName("ix_groupes_habitation_residence_id");

        builder.HasMany(x => x.Immeubles)
            .WithOne(x => x.GroupeHabitation)
            .HasForeignKey(x => x.GroupeHabitationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
