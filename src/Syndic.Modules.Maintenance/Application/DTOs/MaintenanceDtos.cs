using Syndic.Modules.Maintenance.Domain.Enums;

namespace Syndic.Modules.Maintenance.Application.DTOs;

public record SignalementResponse(
    Guid Id,
    string Type,
    Guid? LotId,
    Guid? ImmeubleId,
    Guid ResidentId,
    string Titre,
    string Description,
    string? PhotoPath,
    string Statut,
    Guid? AssigneA,
    string? Reponse,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt);

public record CreerSignalementRequest(
    SignalementType Type,
    Guid? LotId,
    Guid? ImmeubleId,
    string Titre,
    string Description);

public record MettreAJourSignalementRequest(
    SignalementStatut Statut,
    string? Reponse,
    Guid? AssigneA);

public record MaintenancePlanifieeResponse(
    Guid Id,
    Guid ResidenceId,
    Guid? ImmeubleId,
    string Type,
    string Libelle,
    DateTimeOffset DatePrevue,
    string? Recurrence,
    string Statut,
    bool VisibleResidents,
    DateTimeOffset CreatedAt);

public record CreerMaintenanceRequest(
    Guid ResidenceId,
    Guid? ImmeubleId,
    string Type,
    string Libelle,
    DateTimeOffset DatePrevue,
    string? Recurrence,
    bool VisibleResidents);

public record ModifierMaintenanceRequest(
    string Type,
    string Libelle,
    DateTimeOffset DatePrevue,
    string? Recurrence,
    bool VisibleResidents,
    MaintenanceStatut? NouveauStatut);
