using Syndic.Modules.Ged.Domain.Enums;

namespace Syndic.Modules.Ged.Application.DTOs;

public record DocumentResponse(
    Guid Id,
    Guid? ResidenceId,
    Guid? ImmeubleId,
    string Type,
    string Titre,
    string FichierPath,
    DateOnly Date,
    bool VisibleResidents,
    DateTimeOffset CreatedAt);

public record CreerDocumentRequest(
    Guid? ResidenceId,
    Guid? ImmeubleId,
    DocumentType Type,
    string Titre,
    DateOnly Date,
    bool VisibleResidents);
