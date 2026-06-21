using MediatR;
using Syndic.Modules.Notification.Application.Services;
using Syndic.Shared.Events;

namespace Syndic.Modules.Notification.Handlers;

internal sealed class SignalementMisAJourHandler(INotificationService notificationService)
    : INotificationHandler<SignalementMisAJour>
{
    public async Task Handle(SignalementMisAJour notification, CancellationToken cancellationToken)
    {
        var titre = "Mise à jour de votre signalement";
        var body = $"« {notification.Titre} » — Statut : {notification.NouveauStatut}";

        await notificationService.SendPushAsync(notification.ResidentId, titre, body, "signalement_mis_a_jour", ct: cancellationToken);
    }
}
