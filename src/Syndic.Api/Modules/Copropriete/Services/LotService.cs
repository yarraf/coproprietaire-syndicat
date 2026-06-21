using Microsoft.EntityFrameworkCore;
using Syndic.Api.Infrastructure.Persistence;
using Syndic.Modules.Copropriete.Application.DTOs;
using Syndic.Modules.Copropriete.Application.Services;
using Syndic.Modules.Copropriete.Domain.Entities;
using Syndic.Modules.Copropriete.Domain.Enums;

namespace Syndic.Api.Modules.Copropriete.Services;

public sealed class LotService(SyndicDbContext db) : ILotService
{
    public async Task<IReadOnlyList<LotResponse>> GetLotsByImmeubleAsync(Guid immeubleId, CancellationToken ct = default)
    {
        var lots = await db.Lots
            .Where(l => l.ImmeubleId == immeubleId)
            .Include(l => l.LotResidents)
                .ThenInclude(lr => lr.Resident)
            .AsNoTracking()
            .OrderBy(l => l.Number)
            .ToListAsync(ct);

        return lots.Select(ToResponse).ToList();
    }

    public async Task<LotResponse> GetLotByIdAsync(Guid id, CancellationToken ct = default)
    {
        var lot = await db.Lots
            .Include(l => l.LotResidents)
                .ThenInclude(lr => lr.Resident)
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.Id == id, ct)
            ?? throw new KeyNotFoundException("Lot introuvable.");

        return ToResponse(lot);
    }

    public async Task<LotResponse> CreateLotAsync(Guid immeubleId, CreateLotRequest request, CancellationToken ct = default)
    {
        var immeubleExists = await db.Immeubles.AnyAsync(i => i.Id == immeubleId, ct);
        if (!immeubleExists) throw new KeyNotFoundException("Immeuble introuvable.");

        var lot = Lot.Create(immeubleId, request.Number, request.Type, request.Floor, request.Area);
        db.Lots.Add(lot);
        await db.SaveChangesAsync(ct);
        return ToResponse(lot);
    }

    public async Task<LotResponse> UpdateLotAsync(Guid id, UpdateLotRequest request, CancellationToken ct = default)
    {
        var lot = await db.Lots.FindAsync([id], ct)
            ?? throw new KeyNotFoundException("Lot introuvable.");

        lot.Update(request.Number, request.Type, request.Floor, request.Area);
        await db.SaveChangesAsync(ct);
        return await GetLotByIdAsync(id, ct);
    }

    public async Task DeleteLotAsync(Guid id, CancellationToken ct = default)
    {
        var lot = await db.Lots.FindAsync([id], ct)
            ?? throw new KeyNotFoundException("Lot introuvable.");

        db.Lots.Remove(lot);
        await db.SaveChangesAsync(ct);
    }

    public async Task<LotResidentResponse> AssignResidentAsync(Guid lotId, AssignResidentToLotRequest request, CancellationToken ct = default)
    {
        var lotExists = await db.Lots.AnyAsync(l => l.Id == lotId, ct);
        if (!lotExists) throw new KeyNotFoundException("Lot introuvable.");

        var residentExists = await db.Residents.AnyAsync(r => r.Id == request.ResidentId, ct);
        if (!residentExists) throw new KeyNotFoundException("Résident introuvable.");

        if (request.Type == ResidentType.Owner)
        {
            var activeOwner = await db.LotResidents
                .AnyAsync(lr => lr.LotId == lotId
                    && lr.Type == ResidentType.Owner
                    && !lr.EndDate.HasValue, ct);
            if (activeOwner)
                throw new InvalidOperationException("Ce lot a déjà un propriétaire actif.");
        }

        var lotResident = LotResident.Create(lotId, request.ResidentId, request.Type, request.StartDate);
        db.LotResidents.Add(lotResident);
        await db.SaveChangesAsync(ct);

        await db.Entry(lotResident).Reference(lr => lr.Resident).LoadAsync(ct);
        return ToLotResidentResponse(lotResident);
    }

    public async Task<LotResidentResponse> TerminateAssignmentAsync(Guid lotResidentId, TerminateLotResidentRequest request, CancellationToken ct = default)
    {
        var lr = await db.LotResidents
            .Include(x => x.Resident)
            .FirstOrDefaultAsync(x => x.Id == lotResidentId, ct)
            ?? throw new KeyNotFoundException("Liaison lot–résident introuvable.");

        lr.Terminate(request.EndDate);
        await db.SaveChangesAsync(ct);
        return ToLotResidentResponse(lr);
    }

    public async Task AdjustBalanceAsync(Guid lotId, decimal amount, CancellationToken ct = default)
    {
        var lot = await db.Lots.FindAsync([lotId], ct)
            ?? throw new KeyNotFoundException("Lot introuvable.");

        lot.ApplyBalanceAdjustment(amount);
        await db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<LotResponse>> GetLotsByResidentAsync(Guid residentId, CancellationToken ct = default)
    {
        var lotIds = await db.LotResidents
            .Where(lr => lr.ResidentId == residentId && !lr.EndDate.HasValue)
            .Select(lr => lr.LotId)
            .ToListAsync(ct);

        var lots = await db.Lots
            .Where(l => lotIds.Contains(l.Id))
            .Include(l => l.LotResidents)
                .ThenInclude(lr => lr.Resident)
            .AsNoTracking()
            .ToListAsync(ct);

        return lots.Select(ToResponse).ToList();
    }

    // ── Mapping ───────────────────────────────────────────────────────────────

    private static LotResponse ToResponse(Lot l) => new(
        l.Id,
        l.ImmeubleId,
        l.Number,
        l.Type,
        l.Floor,
        l.Area,
        l.Balance,
        l.CreatedAt,
        l.LotResidents
            .Where(lr => lr.IsActive)
            .Select(ToLotResidentResponse)
            .ToList());

    private static LotResidentResponse ToLotResidentResponse(LotResident lr) => new(
        lr.Id,
        lr.LotId,
        lr.ResidentId,
        $"{lr.Resident.FirstName} {lr.Resident.LastName}",
        lr.Type,
        lr.StartDate,
        lr.EndDate,
        lr.IsActive);
}
