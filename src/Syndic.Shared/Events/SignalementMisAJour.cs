using MediatR;

namespace Syndic.Shared.Events;

public record SignalementMisAJour(
    Guid SignalementId,
    Guid ResidentId,
    string Titre,
    string NouveauStatut
) : INotification;
