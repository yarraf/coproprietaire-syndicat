using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Syndic.Modules.Notification.Domain.Entities;
using Syndic.Modules.Notification.Domain.Enums;

namespace Syndic.Modules.Notification.Persistence.Configurations;

public class DeviceConfiguration : IEntityTypeConfiguration<Device>
{
    public void Configure(EntityTypeBuilder<Device> builder)
    {
        builder.ToTable("devices");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ResidentId).HasColumnName("resident_id").IsRequired();
        builder.Property(x => x.PushToken).HasColumnName("push_token").HasMaxLength(500).IsRequired();
        builder.Property(x => x.Plateforme)
            .HasColumnName("plateforme")
            .HasMaxLength(10)
            .IsRequired()
            .HasConversion(
                v => v == Plateforme.iOS ? "ios" : "android",
                v => v == "ios" ? Plateforme.iOS : Plateforme.Android);
        builder.Property(x => x.DerniereActivite).HasColumnName("derniere_activite").IsRequired();

        builder.HasIndex(x => x.PushToken).IsUnique().HasDatabaseName("ix_devices_push_token");
        builder.HasIndex(x => x.ResidentId).HasDatabaseName("ix_devices_resident_id");
    }
}
