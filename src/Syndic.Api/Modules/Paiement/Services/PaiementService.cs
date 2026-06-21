using MediatR;
using Microsoft.EntityFrameworkCore;
using Syndic.Api.Infrastructure.Persistence;
using Syndic.Modules.Paiement.Application.DTOs;
using Syndic.Modules.Paiement.Application.Services;
using PaiementEntity = Syndic.Modules.Paiement.Domain.Entities.Paiement;
using Syndic.Modules.Paiement.Domain.Entities;
using Syndic.Modules.Paiement.Domain.Enums;
using Syndic.Shared.Events;

namespace Syndic.Api.Modules.Paiement.Services;

public sealed class PaiementService(SyndicDbContext db, IPublisher publisher) : IPaiementService
{
    public async Task<PaiementResponse> SoumettreAsync(
        Guid lotId, Guid residentId, decimal montant, string periode,
        string modePaiement, string? justificatifPath, CancellationToken ct = default)
    {
        var lotExists = await db.Lots.AnyAsync(l => l.Id == lotId, ct);
        if (!lotExists) throw new KeyNotFoundException("Lot introuvable.");

        var residentExists = await db.Residents.AnyAsync(r => r.Id == residentId, ct);
        if (!residentExists) throw new KeyNotFoundException("Résident introuvable.");

        var paiement = PaiementEntity.Create(lotId, residentId, montant, periode, modePaiement, justificatifPath);
        db.Paiements.Add(paiement);
        await db.SaveChangesAsync(ct);
        return ToResponse(paiement);
    }

    public async Task<IReadOnlyList<PaiementResponse>> GetHistoriqueAsync(
        Guid? lotId, Guid? residentId, PaymentStatus? statut, CancellationToken ct = default)
    {
        var query = db.Paiements.AsNoTracking().AsQueryable();

        if (lotId.HasValue)      query = query.Where(p => p.LotId == lotId.Value);
        if (residentId.HasValue) query = query.Where(p => p.ResidentId == residentId.Value);
        if (statut.HasValue)     query = query.Where(p => p.Statut == statut.Value);

        var list = await query.OrderByDescending(p => p.CreatedAt).ToListAsync(ct);
        return list.Select(ToResponse).ToList();
    }

    public async Task<PaiementResponse> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var paiement = await db.Paiements.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new KeyNotFoundException("Paiement introuvable.");
        return ToResponse(paiement);
    }

    public async Task<PaiementResponse> ValiderAsync(Guid id, Guid agentId, CancellationToken ct = default)
    {
        var paiement = await db.Paiements.FindAsync([id], ct)
            ?? throw new KeyNotFoundException("Paiement introuvable.");

        var lot = await db.Lots.FindAsync([paiement.LotId], ct)
            ?? throw new KeyNotFoundException("Lot introuvable.");

        paiement.Valider(agentId);
        lot.ApplyBalanceAdjustment(-paiement.Montant);
        await db.SaveChangesAsync(ct);

        await publisher.Publish(new PaiementValide(
            paiement.Id, paiement.LotId, paiement.ResidentId,
            paiement.Montant, paiement.Periode, lot.Balance), ct);

        return ToResponse(paiement);
    }

    public async Task<PaiementResponse> RejeterAsync(Guid id, string motif, CancellationToken ct = default)
    {
        var paiement = await db.Paiements.FindAsync([id], ct)
            ?? throw new KeyNotFoundException("Paiement introuvable.");

        paiement.Rejeter(motif);
        await db.SaveChangesAsync(ct);
        return ToResponse(paiement);
    }

    public async Task<AjustementSoldeResponse> CreerAjustementAsync(
        CreerAjustementRequest request, Guid agentId, CancellationToken ct = default)
    {
        var lot = await db.Lots.FindAsync([request.LotId], ct)
            ?? throw new KeyNotFoundException("Lot introuvable.");

        var ajustement = AjustementSolde.Create(
            request.LotId, request.Montant, request.Type,
            request.Libelle, request.Periode, agentId);

        db.AjustementsSolde.Add(ajustement);
        lot.ApplyBalanceAdjustment(request.Montant);
        await db.SaveChangesAsync(ct);
        return ToResponse(ajustement);
    }

    // ── Mapping ───────────────────────────────────────────────────────────────

    private static PaiementResponse ToResponse(PaiementEntity p) => new(
        p.Id, p.LotId, p.ResidentId, p.Montant, p.Periode, p.ModePaiement,
        p.JustificatifPath,
        p.Statut == PaymentStatus.EnAttente ? "en_attente"
            : p.Statut == PaymentStatus.Valide ? "valide" : "rejete",
        p.ValidePar, p.DateValidation, p.MotifRejet, p.CreatedAt);

    private static AjustementSoldeResponse ToResponse(AjustementSolde a) => new(
        a.Id, a.LotId, a.Montant,
        a.Type == AjustementType.Charge ? "charge" : "regularisation",
        a.Libelle, a.Periode, a.CreePar, a.CreatedAt);
}
