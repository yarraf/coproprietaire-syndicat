using MediatR;

namespace Syndic.Shared.Events;

public record SignalementMisAJour(
    Guid SignalementId,
    Guid? CreatedByUserId,
    string Titre,
    string NouveauStatut
) : INotification;
