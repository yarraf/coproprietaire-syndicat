using Syndic.Modules.Copropriete.Application.DTOs;

namespace Syndic.Modules.Copropriete.Application.Services;

public interface IResidenceService
{
    Task<IReadOnlyList<ResidenceResponse>> GetAllResidencesAsync(CancellationToken ct = default);
    Task<ResidenceResponse> GetResidenceByIdAsync(Guid id, CancellationToken ct = default);
    Task<ResidenceResponse> CreateResidenceAsync(CreateResidenceRequest request, CancellationToken ct = default);
    Task<ResidenceResponse> UpdateResidenceAsync(Guid id, UpdateResidenceRequest request, CancellationToken ct = default);
    Task DeleteResidenceAsync(Guid id, CancellationToken ct = default);

    Task<GroupeHabitationResponse> GetGroupeHabitationByIdAsync(Guid id, CancellationToken ct = default);
    Task<GroupeHabitationResponse> CreateGroupeHabitationAsync(Guid residenceId, CreateGroupeHabitationRequest request, CancellationToken ct = default);
    Task<GroupeHabitationResponse> UpdateGroupeHabitationAsync(Guid id, UpdateGroupeHabitationRequest request, CancellationToken ct = default);
    Task DeleteGroupeHabitationAsync(Guid id, CancellationToken ct = default);

    Task<ImmeubleResponse> GetImmeubleByIdAsync(Guid id, CancellationToken ct = default);
    Task<ImmeubleResponse> CreateImmeubleAsync(Guid groupeHabitationId, CreateImmeubleRequest request, CancellationToken ct = default);
    Task<ImmeubleResponse> UpdateImmeubleAsync(Guid id, UpdateImmeubleRequest request, CancellationToken ct = default);
    Task DeleteImmeubleAsync(Guid id, CancellationToken ct = default);
}
