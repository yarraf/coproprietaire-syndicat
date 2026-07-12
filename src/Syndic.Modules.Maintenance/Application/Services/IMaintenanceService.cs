using Syndic.Modules.Maintenance.Application.DTOs;
using Syndic.Modules.Maintenance.Domain.Enums;

namespace Syndic.Modules.Maintenance.Application.Services;

public interface IMaintenanceService
{
    Task<SignalementResponse> CreerSignalementAsync(CreerSignalementRequest req, string? photoPath, Guid? createdByUserId, CancellationToken ct = default);
    Task<SignalementResponse> CreerSignalementAgentAsync(CreerSignalementAgentRequest req, Guid agentUserId, CancellationToken ct = default);
    Task<IReadOnlyList<SignalementResponse>> GetSignalementsAsync(SignalementStatut? statut, CancellationToken ct = default);
    Task<SignalementResponse> GetSignalementByIdAsync(Guid id, CancellationToken ct = default);
    Task<SignalementResponse> MettreAJourSignalementAsync(Guid id, MettreAJourSignalementRequest req, CancellationToken ct = default);
    Task<IReadOnlyList<SignalementResponse>> GetMesSignalementsAsync(Guid userId, CancellationToken ct = default);
    Task SupprimerSignalementAsync(Guid id, CancellationToken ct = default);

    Task<MaintenancePlanifieeResponse> CreerMaintenanceAsync(CreerMaintenanceRequest req, CancellationToken ct = default);
    Task<IReadOnlyList<MaintenancePlanifieeResponse>> GetMaintenancesAsync(bool agentView, CancellationToken ct = default);
    Task<MaintenancePlanifieeResponse> ModifierMaintenanceAsync(Guid id, ModifierMaintenanceRequest req, CancellationToken ct = default);
    Task SupprimerMaintenanceAsync(Guid id, CancellationToken ct = default);
}
