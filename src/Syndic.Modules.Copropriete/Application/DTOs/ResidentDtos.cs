using Syndic.Modules.Copropriete.Domain.Enums;

namespace Syndic.Modules.Copropriete.Application.DTOs;

public record CreateResidentRequest(
    string LastName,
    string FirstName,
    string Email,
    ResidentType Type,
    string? Phone);

public record UpdateResidentRequest(
    string LastName,
    string FirstName,
    string Email,
    ResidentType Type,
    string? Phone);

public record ResidentResponse(
    Guid Id,
    string LastName,
    string FirstName,
    string Email,
    string? Phone,
    ResidentType Type,
    ResidentStatus Status,
    bool IsAccountActivated,
    DateTimeOffset CreatedAt);

public record InvitationResponse(string Email, string Token, DateTimeOffset ExpiresAt);
