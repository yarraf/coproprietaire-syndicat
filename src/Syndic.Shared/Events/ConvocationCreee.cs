using MediatR;

namespace Syndic.Shared.Events;

public record ConvocationCreee(
    Guid AssembleeId,
    Guid ResidenceId,
    IReadOnlyList<Guid> ResidentIds,
    string Titre,
    DateTimeOffset DateAg
) : INotification;
