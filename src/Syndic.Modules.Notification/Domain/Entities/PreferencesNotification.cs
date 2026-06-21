using Syndic.Shared.Domain;

namespace Syndic.Modules.Notification.Domain.Entities;

public class PreferencesNotification : BaseEntity
{
    private PreferencesNotification() { }

    public Guid ResidentId { get; private set; }
    public bool PushActive { get; private set; }

    public static PreferencesNotification Create(Guid residentId)
    {
        if (residentId == Guid.Empty) throw new ArgumentException("ResidentId invalide.", nameof(residentId));

        return new PreferencesNotification
        {
            ResidentId = residentId,
            PushActive = true
        };
    }

    public void Update(bool pushActive)
    {
        PushActive = pushActive;
        SetUpdated();
    }
}
