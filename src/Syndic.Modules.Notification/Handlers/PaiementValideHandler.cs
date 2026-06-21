using MediatR;
using Syndic.Modules.Notification.Application.Services;
using Syndic.Shared.Events;

namespace Syndic.Modules.Notification.Handlers;

public sealed class PaiementValideHandler(INotificationService notifService)
    : INotificationHandler<PaiementValide>
{
    public async Task Handle(PaiementValide ev, CancellationToken ct)
    {
        var body = $"Votre paiement de {ev.Montant:N2} MAD pour la période {ev.Periode} "
                 + $"a été validé. Nouveau solde : {ev.NouveauSolde:N2} MAD.";

        await notifService.SendPushAsync(
            ev.ResidentId,
            title: "Paiement confirmé",
            body,
            typeEvenement: "paiement_valide",
            data: new Dictionary<string, string>
            {
                ["paiement_id"] = ev.PaiementId.ToString(),
                ["lot_id"]      = ev.LotId.ToString()
            },
            ct);
    }
}
