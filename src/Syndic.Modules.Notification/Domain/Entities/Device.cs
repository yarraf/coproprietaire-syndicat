using Syndic.Modules.Notification.Domain.Enums;
using Syndic.Shared.Domain;

namespace Syndic.Modules.Notification.Domain.Entities;

public class Device : BaseEntity
{
    private Device() { }

    public Guid ResidentId { get; private set; }
    public string PushToken { get; private set; } = null!;
    public Plateforme Plateforme { get; private set; }
    public DateTimeOffset DerniereActivite { get; private set; }

    public static Device Create(Guid residentId, string pushToken, Plateforme plateforme)
    {
        if (residentId == Guid.Empty) throw new ArgumentException("ResidentId invalide.", nameof(residentId));
        ArgumentException.ThrowIfNullOrWhiteSpace(pushToken);

        return new Device
        {
            ResidentId = residentId,
            PushToken = pushToken.Trim(),
            Plateforme = plateforme,
            DerniereActivite = DateTimeOffset.UtcNow
        };
    }

    public void Refresh()
    {
        DerniereActivite = DateTimeOffset.UtcNow;
        SetUpdated();
    }
}
