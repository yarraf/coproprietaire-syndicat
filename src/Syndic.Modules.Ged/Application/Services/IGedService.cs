using Syndic.Modules.Ged.Application.DTOs;

namespace Syndic.Modules.Ged.Application.Services;

public interface IGedService
{
    Task<DocumentResponse> CreerAsync(CreerDocumentRequest req, string fichierPath, CancellationToken ct = default);

    Task<DocumentResponse> ArchiverPvAsync(
        Guid? residenceId,
        string titre,
        DateOnly date,
        string fichierPath,
        CancellationToken ct = default);

    Task<IReadOnlyList<DocumentResponse>> GetAllAsync(bool agentView, CancellationToken ct = default);

    Task<DocumentResponse> GetByIdAsync(Guid id, bool agentView, CancellationToken ct = default);
}
