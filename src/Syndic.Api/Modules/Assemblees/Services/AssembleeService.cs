using MediatR;
using Microsoft.EntityFrameworkCore;
using Syndic.Api.Infrastructure.Persistence;
using Syndic.Modules.Assemblees.Application.DTOs;
using Syndic.Modules.Assemblees.Application.Services;
using Syndic.Modules.Assemblees.Domain.Entities;
using Syndic.Modules.Assemblees.Domain.Enums;
using Syndic.Modules.Ged.Application.Services;
using Syndic.Shared.Events;

namespace Syndic.Api.Modules.Assemblees.Services;

public sealed class AssembleeService(SyndicDbContext db, IPublisher publisher, IGedService gedService) : IAssembleeService
{
    public async Task<AssembleeResponse> CreerAsync(CreerAssembleeRequest req, CancellationToken ct = default)
    {
        var ag = Assemblee.Create(req.ResidenceId, req.Titre, req.Date, req.Lieu, req.OrdreDuJour);
        db.Assemblees.Add(ag);
        await db.SaveChangesAsync(ct);
        return ToResponse(ag);
    }

    public async Task<IReadOnlyList<AssembleeResponse>> GetAllAsync(CancellationToken ct = default)
    {
        var list = await db.Assemblees
            .AsNoTracking()
            .OrderByDescending(a => a.Date)
            .ToListAsync(ct);
        return list.Select(ToResponse).ToList();
    }

    public async Task<IReadOnlyList<AssembleeResponse>> GetByResidenceAsync(Guid residenceId, CancellationToken ct = default)
    {
        var list = await db.Assemblees
            .AsNoTracking()
            .Where(a => a.ResidenceId == residenceId)
            .OrderByDescending(a => a.Date)
            .ToListAsync(ct);
        return list.Select(ToResponse).ToList();
    }

    public async Task<AssembleeResponse> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var ag = await db.Assemblees.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new KeyNotFoundException($"Assemblée {id} introuvable.");
        return ToResponse(ag);
    }

    public async Task<AssembleeResponse> ModifierAsync(Guid id, ModifierAssembleeRequest req, CancellationToken ct = default)
    {
        var ag = await db.Assemblees.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"Assemblée {id} introuvable.");
        ag.Update(req.Titre, req.Date, req.Lieu, req.OrdreDuJour);
        await db.SaveChangesAsync(ct);
        return ToResponse(ag);
    }

    public async Task SupprimerAsync(Guid id, CancellationToken ct = default)
    {
        var ag = await db.Assemblees.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"Assemblée {id} introuvable.");
        db.Assemblees.Remove(ag);
        await db.SaveChangesAsync(ct);
    }

    public async Task<AssembleeResponse> AttacherPvAsync(Guid id, string pvPath, CancellationToken ct = default)
    {
        var ag = await db.Assemblees.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"Assemblée {id} introuvable.");

        var date = DateOnly.FromDateTime(ag.Date.UtcDateTime);
        var doc = await gedService.ArchiverPvAsync(ag.ResidenceId, $"PV — {ag.Titre}", date, pvPath, ct);

        ag.AttacherPv(doc.Id);
        await db.SaveChangesAsync(ct);
        return ToResponse(ag);
    }

    public async Task ConvoquerAsync(Guid id, CancellationToken ct = default)
    {
        var ag = await db.Assemblees.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new KeyNotFoundException($"Assemblée {id} introuvable.");

        var ghIds = await db.GroupesHabitation
            .AsNoTracking()
            .Where(gh => gh.ResidenceId == ag.ResidenceId)
            .Select(gh => gh.Id)
            .ToListAsync(ct);

        var immeubleIds = await db.Immeubles
            .AsNoTracking()
            .Where(im => ghIds.Contains(im.GroupeHabitationId))
            .Select(im => im.Id)
            .ToListAsync(ct);

        var lotIds = await db.Lots
            .AsNoTracking()
            .Where(l => immeubleIds.Contains(l.ImmeubleId))
            .Select(l => l.Id)
            .ToListAsync(ct);

        var residentIds = await db.LotResidents
            .AsNoTracking()
            .Where(lr => lotIds.Contains(lr.LotId))
            .Select(lr => lr.ResidentId)
            .Distinct()
            .ToListAsync(ct);

        await publisher.Publish(new ConvocationCreee(ag.Id, ag.ResidenceId, residentIds, ag.Titre, ag.Date), ct);
    }

    private static AssembleeResponse ToResponse(Assemblee a) => new(
        a.Id,
        a.ResidenceId,
        a.Titre,
        a.Date,
        a.Lieu,
        a.OrdreDuJour,
        a.Statut switch
        {
            AssembleeStatut.Planifiee => "planifiee",
            AssembleeStatut.Tenue    => "tenue",
            _                        => "annulee"
        },
        a.PvDocumentId,
        a.CreatedAt);
}
