using Syndic.Modules.Notification.Domain.Enums;
using Syndic.Shared.Domain;

namespace Syndic.Modules.Notification.Domain.Entities;

public class NotificationLog : BaseEntity
{
    private NotificationLog() { }

    public Guid ResidentId { get; private set; }
    public NotificationCanal Canal { get; private set; }
    public string TypeEvenement { get; private set; } = null!;
    public NotificationStatut Statut { get; private set; }
    public string? Payload { get; private set; }

    public static NotificationLog Create(
        Guid residentId,
        NotificationCanal canal,
        string typeEvenement,
        NotificationStatut statut,
        string? payload = null)
    {
        if (residentId == Guid.Empty) throw new ArgumentException("ResidentId invalide.", nameof(residentId));
        ArgumentException.ThrowIfNullOrWhiteSpace(typeEvenement);

        return new NotificationLog
        {
            ResidentId = residentId,
            Canal = canal,
            TypeEvenement = typeEvenement.Trim(),
            Statut = statut,
            Payload = payload
        };
    }
}
