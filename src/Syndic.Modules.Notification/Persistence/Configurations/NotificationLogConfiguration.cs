using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Syndic.Modules.Notification.Domain.Entities;
using Syndic.Modules.Notification.Domain.Enums;

namespace Syndic.Modules.Notification.Persistence.Configurations;

public class NotificationLogConfiguration : IEntityTypeConfiguration<NotificationLog>
{
    public void Configure(EntityTypeBuilder<NotificationLog> builder)
    {
        builder.ToTable("notifications_log");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ResidentId).HasColumnName("resident_id").IsRequired();
        builder.Property(x => x.Canal)
            .HasColumnName("canal")
            .HasMaxLength(20)
            .IsRequired()
            .HasConversion(
                v => "push",
                v => NotificationCanal.Push);
        builder.Property(x => x.TypeEvenement).HasColumnName("type_evenement").HasMaxLength(100).IsRequired();
        builder.Property(x => x.Statut)
            .HasColumnName("statut")
            .HasMaxLength(20)
            .IsRequired()
            .HasConversion(
                v => v == NotificationStatut.Envoye ? "envoye"
                   : v == NotificationStatut.Livre  ? "livre"
                   :                                  "echec",
                v => v == "livre" ? NotificationStatut.Livre
                   : v == "echec" ? NotificationStatut.Echec
                   :                NotificationStatut.Envoye);
        builder.Property(x => x.Payload).HasColumnName("payload").HasColumnType("text");

        builder.HasIndex(x => x.ResidentId).HasDatabaseName("ix_notifications_log_resident_id");
    }
}
