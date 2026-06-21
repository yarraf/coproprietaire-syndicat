using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Syndic.Modules.Notification.Domain.Entities;

namespace Syndic.Modules.Notification.Persistence.Configurations;

public class PreferencesNotificationConfiguration : IEntityTypeConfiguration<PreferencesNotification>
{
    public void Configure(EntityTypeBuilder<PreferencesNotification> builder)
    {
        builder.ToTable("preferences_notification");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ResidentId).HasColumnName("resident_id").IsRequired();
        builder.Property(x => x.PushActive).HasColumnName("canal_push").IsRequired();

        builder.HasIndex(x => x.ResidentId).IsUnique().HasDatabaseName("ix_preferences_notification_resident_id");
    }
}
