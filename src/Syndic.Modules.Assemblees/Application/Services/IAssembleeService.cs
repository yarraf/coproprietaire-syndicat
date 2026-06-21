using Syndic.Modules.Assemblees.Application.DTOs;

namespace Syndic.Modules.Assemblees.Application.Services;

public interface IAssembleeService
{
    Task<AssembleeResponse> CreerAsync(CreerAssembleeRequest req, CancellationToken ct = default);
    Task<IReadOnlyList<AssembleeResponse>> GetByResidenceAsync(Guid residenceId, CancellationToken ct = default);
    Task<AssembleeResponse> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<AssembleeResponse> ModifierAsync(Guid id, ModifierAssembleeRequest req, CancellationToken ct = default);
    Task SupprimerAsync(Guid id, CancellationToken ct = default);
    Task<AssembleeResponse> AttacherPvAsync(Guid id, string pvPath, CancellationToken ct = default);
    Task ConvoquerAsync(Guid id, CancellationToken ct = default);
}
