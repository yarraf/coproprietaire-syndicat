using Syndic.Modules.Copropriete.Domain.Enums;

namespace Syndic.Modules.Copropriete.Application.DTOs;

public record CreateLotRequest(string Number, LotType Type, int Floor, decimal? Area);
public record UpdateLotRequest(string Number, LotType Type, int Floor, decimal? Area);
public record LotResponse(
    Guid Id,
    Guid ImmeubleId,
    string Number,
    LotType Type,
    int Floor,
    decimal? Area,
    decimal Balance,
    DateTimeOffset CreatedAt,
    IReadOnlyList<LotResidentResponse> ActiveResidents);

public record AssignResidentToLotRequest(Guid ResidentId, ResidentType Type, DateOnly StartDate);
public record TerminateLotResidentRequest(DateOnly EndDate);
public record LotResidentResponse(
    Guid Id,
    Guid LotId,
    Guid ResidentId,
    string ResidentFullName,
    ResidentType Type,
    DateOnly StartDate,
    DateOnly? EndDate,
    bool IsActive);
