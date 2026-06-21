using Microsoft.EntityFrameworkCore;
using Syndic.Api.Infrastructure.Persistence;
using Syndic.Modules.Copropriete.Application.DTOs;
using Syndic.Modules.Copropriete.Application.Services;
using Syndic.Modules.Copropriete.Domain.Entities;

namespace Syndic.Api.Modules.Copropriete.Services;

public sealed class ResidenceService(SyndicDbContext db) : IResidenceService
{
    public async Task<IReadOnlyList<ResidenceResponse>> GetAllResidencesAsync(CancellationToken ct = default)
    {
        var residences = await db.Residences
            .Include(r => r.GroupesHabitation)
                .ThenInclude(gh => gh.Immeubles)
            .AsNoTracking()
            .OrderBy(r => r.Name)
            .ToListAsync(ct);

        return residences.Select(ToResponse).ToList();
    }

    public async Task<ResidenceResponse> GetResidenceByIdAsync(Guid id, CancellationToken ct = default)
    {
        var residence = await db.Residences
            .Include(r => r.GroupesHabitation)
                .ThenInclude(gh => gh.Immeubles)
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw new KeyNotFoundException("Résidence introuvable.");

        return ToResponse(residence);
    }

    public async Task<ResidenceResponse> CreateResidenceAsync(CreateResidenceRequest request, CancellationToken ct = default)
    {
        var residence = Residence.Create(request.Name, request.Address, request.City);
        db.Residences.Add(residence);
        await db.SaveChangesAsync(ct);
        return ToResponse(residence);
    }

    public async Task<ResidenceResponse> UpdateResidenceAsync(Guid id, UpdateResidenceRequest request, CancellationToken ct = default)
    {
        var residence = await db.Residences.FindAsync([id], ct)
            ?? throw new KeyNotFoundException("Résidence introuvable.");

        residence.Update(request.Name, request.Address, request.City);
        await db.SaveChangesAsync(ct);
        return await GetResidenceByIdAsync(id, ct);
    }

    public async Task DeleteResidenceAsync(Guid id, CancellationToken ct = default)
    {
        var residence = await db.Residences.FindAsync([id], ct)
            ?? throw new KeyNotFoundException("Résidence introuvable.");

        db.Residences.Remove(residence);
        await db.SaveChangesAsync(ct);
    }

    // ── GroupeHabitation ──────────────────────────────────────────────────────

    public async Task<GroupeHabitationResponse> GetGroupeHabitationByIdAsync(Guid id, CancellationToken ct = default)
    {
        var gh = await db.GroupesHabitation
            .Include(g => g.Immeubles)
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.Id == id, ct)
            ?? throw new KeyNotFoundException("Groupe d'habitation introuvable.");

        return ToGroupeHabitationResponse(gh);
    }

    public async Task<GroupeHabitationResponse> CreateGroupeHabitationAsync(Guid residenceId, CreateGroupeHabitationRequest request, CancellationToken ct = default)
    {
        var residenceExists = await db.Residences.AnyAsync(r => r.Id == residenceId, ct);
        if (!residenceExists) throw new KeyNotFoundException("Résidence introuvable.");

        var gh = GroupeHabitation.Create(residenceId, request.Name);
        db.GroupesHabitation.Add(gh);
        await db.SaveChangesAsync(ct);
        return ToGroupeHabitationResponse(gh);
    }

    public async Task<GroupeHabitationResponse> UpdateGroupeHabitationAsync(Guid id, UpdateGroupeHabitationRequest request, CancellationToken ct = default)
    {
        var gh = await db.GroupesHabitation.FindAsync([id], ct)
            ?? throw new KeyNotFoundException("Groupe d'habitation introuvable.");

        gh.Update(request.Name);
        await db.SaveChangesAsync(ct);
        return await GetGroupeHabitationByIdAsync(id, ct);
    }

    public async Task DeleteGroupeHabitationAsync(Guid id, CancellationToken ct = default)
    {
        var gh = await db.GroupesHabitation.FindAsync([id], ct)
            ?? throw new KeyNotFoundException("Groupe d'habitation introuvable.");

        db.GroupesHabitation.Remove(gh);
        await db.SaveChangesAsync(ct);
    }

    // ── Immeuble ──────────────────────────────────────────────────────────────

    public async Task<ImmeubleResponse> GetImmeubleByIdAsync(Guid id, CancellationToken ct = default)
    {
        var immeuble = await db.Immeubles
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id, ct)
            ?? throw new KeyNotFoundException("Immeuble introuvable.");

        return ToImmeubleResponse(immeuble);
    }

    public async Task<ImmeubleResponse> CreateImmeubleAsync(Guid groupeHabitationId, CreateImmeubleRequest request, CancellationToken ct = default)
    {
        var ghExists = await db.GroupesHabitation.AnyAsync(g => g.Id == groupeHabitationId, ct);
        if (!ghExists) throw new KeyNotFoundException("Groupe d'habitation introuvable.");

        var immeuble = Immeuble.Create(groupeHabitationId, request.BlockName, request.NbFloors, request.Address);
        db.Immeubles.Add(immeuble);
        await db.SaveChangesAsync(ct);
        return ToImmeubleResponse(immeuble);
    }

    public async Task<ImmeubleResponse> UpdateImmeubleAsync(Guid id, UpdateImmeubleRequest request, CancellationToken ct = default)
    {
        var immeuble = await db.Immeubles.FindAsync([id], ct)
            ?? throw new KeyNotFoundException("Immeuble introuvable.");

        immeuble.Update(request.BlockName, request.NbFloors, request.Address);
        await db.SaveChangesAsync(ct);
        return ToImmeubleResponse(immeuble);
    }

    public async Task DeleteImmeubleAsync(Guid id, CancellationToken ct = default)
    {
        var immeuble = await db.Immeubles.FindAsync([id], ct)
            ?? throw new KeyNotFoundException("Immeuble introuvable.");

        db.Immeubles.Remove(immeuble);
        await db.SaveChangesAsync(ct);
    }

    // ── Mapping ───────────────────────────────────────────────────────────────

    private static ResidenceResponse ToResponse(Residence r) => new(
        r.Id, r.Name, r.Address, r.City, r.CreatedAt,
        r.GroupesHabitation.Select(ToGroupeHabitationResponse).ToList());

    private static GroupeHabitationResponse ToGroupeHabitationResponse(GroupeHabitation gh) => new(
        gh.Id, gh.ResidenceId, gh.Name, gh.CreatedAt,
        gh.Immeubles.Select(ToImmeubleResponse).ToList());

    private static ImmeubleResponse ToImmeubleResponse(Immeuble i) => new(
        i.Id, i.GroupeHabitationId, i.BlockName, i.Address, i.NbFloors, i.CreatedAt);
}
