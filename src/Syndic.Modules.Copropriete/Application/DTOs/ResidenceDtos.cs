namespace Syndic.Modules.Copropriete.Application.DTOs;

public record CreateResidenceRequest(string Name, string Address, string City);
public record UpdateResidenceRequest(string Name, string Address, string City);
public record ResidenceResponse(
    Guid Id,
    string Name,
    string Address,
    string City,
    DateTimeOffset CreatedAt,
    IReadOnlyList<GroupeHabitationResponse> GroupesHabitation);

public record CreateGroupeHabitationRequest(string Name);
public record UpdateGroupeHabitationRequest(string Name);
public record GroupeHabitationResponse(
    Guid Id,
    Guid ResidenceId,
    string Name,
    DateTimeOffset CreatedAt,
    IReadOnlyList<ImmeubleResponse> Immeubles);

public record CreateImmeubleRequest(string BlockName, int NbFloors, string? Address);
public record UpdateImmeubleRequest(string BlockName, int NbFloors, string? Address);
public record ImmeubleResponse(
    Guid Id,
    Guid GroupeHabitationId,
    string BlockName,
    string? Address,
    int NbFloors,
    DateTimeOffset CreatedAt);
