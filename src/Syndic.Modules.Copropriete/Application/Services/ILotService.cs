using Syndic.Modules.Copropriete.Application.DTOs;

namespace Syndic.Modules.Copropriete.Application.Services;

public interface ILotService
{
    Task<IReadOnlyList<LotResponse>> GetLotsByImmeubleAsync(Guid immeubleId, CancellationToken ct = default);
    Task<LotResponse> GetLotByIdAsync(Guid id, CancellationToken ct = default);
    Task<LotResponse> CreateLotAsync(Guid immeubleId, CreateLotRequest request, CancellationToken ct = default);
    Task<LotResponse> UpdateLotAsync(Guid id, UpdateLotRequest request, CancellationToken ct = default);
    Task DeleteLotAsync(Guid id, CancellationToken ct = default);

    Task<LotResidentResponse> AssignResidentAsync(Guid lotId, AssignResidentToLotRequest request, CancellationToken ct = default);
    Task<LotResidentResponse> TerminateAssignmentAsync(Guid lotResidentId, TerminateLotResidentRequest request, CancellationToken ct = default);
    Task AdjustBalanceAsync(Guid lotId, decimal amount, CancellationToken ct = default);

    Task<IReadOnlyList<LotResponse>> GetLotsByResidentAsync(Guid residentId, CancellationToken ct = default);
}
