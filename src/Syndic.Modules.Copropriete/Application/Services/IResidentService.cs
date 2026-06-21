using Syndic.Modules.Copropriete.Application.DTOs;

namespace Syndic.Modules.Copropriete.Application.Services;

public interface IResidentService
{
    Task<IReadOnlyList<ResidentResponse>> GetAllResidentsAsync(CancellationToken ct = default);
    Task<ResidentResponse> GetResidentByIdAsync(Guid id, CancellationToken ct = default);
    Task<ResidentResponse> CreateResidentAsync(CreateResidentRequest request, CancellationToken ct = default);
    Task<ResidentResponse> UpdateResidentAsync(Guid id, UpdateResidentRequest request, CancellationToken ct = default);
    Task DeactivateResidentAsync(Guid id, CancellationToken ct = default);
    Task<InvitationResponse> InviteResidentAsync(Guid residentId, CancellationToken ct = default);
}
