using MediatR;

namespace Syndic.Shared.Events;

public record PaiementValide(
    Guid PaiementId,
    Guid LotId,
    Guid ResidentId,
    decimal Montant,
    string Periode,
    decimal NouveauSolde
) : INotification;
