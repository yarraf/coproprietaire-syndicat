using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Syndic.Modules.Copropriete.Domain.Entities;

namespace Syndic.Modules.Copropriete.Persistence.Configurations;

public class ResidenceConfiguration : IEntityTypeConfiguration<Residence>
{
    public void Configure(EntityTypeBuilder<Residence> builder)
    {
        builder.ToTable("residences");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).HasColumnName("nom").HasMaxLength(200).IsRequired();
        builder.Property(x => x.Address).HasColumnName("adresse").IsRequired();
        builder.Property(x => x.City).HasColumnName("ville").HasMaxLength(100).IsRequired();

        builder.HasMany(x => x.GroupesHabitation)
            .WithOne(x => x.Residence)
            .HasForeignKey(x => x.ResidenceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
