using MediatR;
using Syndic.Modules.Notification.Application.Services;
using Syndic.Shared.Events;

namespace Syndic.Modules.Notification.Handlers;

internal sealed class SignalementMisAJourHandler(INotificationService notificationService)
    : INotificationHandler<SignalementMisAJour>
{
    public async Task Handle(SignalementMisAJour notification, CancellationToken cancellationToken)
    {
        if (!notification.CreatedByUserId.HasValue) return;

        var titre = "Mise à jour de votre signalement";
        var body = $"« {notification.Titre} » — Statut : {notification.NouveauStatut}";

        await notificationService.SendPushAsync(notification.CreatedByUserId.Value, titre, body, "signalement_mis_a_jour", ct: cancellationToken);
    }
}
