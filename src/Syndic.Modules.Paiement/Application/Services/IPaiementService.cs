using Syndic.Modules.Paiement.Application.DTOs;
using Syndic.Modules.Paiement.Domain.Enums;

namespace Syndic.Modules.Paiement.Application.Services;

public interface IPaiementService
{
    Task<PaiementResponse> SoumettreAsync(
        Guid lotId,
        Guid residentId,
        decimal montant,
        string periode,
        string modePaiement,
        string? justificatifPath,
        CancellationToken ct = default);

    Task<IReadOnlyList<PaiementResponse>> GetHistoriqueAsync(
        Guid? lotId,
        Guid? residentId,
        PaymentStatus? statut,
        CancellationToken ct = default);

    Task<PaiementResponse> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<PaiementResponse> ValiderAsync(Guid id, Guid agentId, CancellationToken ct = default);

    Task<PaiementResponse> RejeterAsync(Guid id, string motif, CancellationToken ct = default);

    Task<AjustementSoldeResponse> CreerAjustementAsync(
        CreerAjustementRequest request,
        Guid agentId,
        CancellationToken ct = default);
}
