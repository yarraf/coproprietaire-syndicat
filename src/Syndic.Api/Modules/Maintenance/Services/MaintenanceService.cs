using MediatR;
using Microsoft.EntityFrameworkCore;
using Syndic.Api.Infrastructure.Persistence;
using Syndic.Modules.Maintenance.Application.DTOs;
using Syndic.Modules.Maintenance.Application.Services;
using Syndic.Modules.Maintenance.Domain.Entities;
using Syndic.Modules.Maintenance.Domain.Enums;
using Syndic.Shared.Events;

namespace Syndic.Api.Modules.Maintenance.Services;

public sealed class MaintenanceService(SyndicDbContext db, IPublisher publisher) : IMaintenanceService
{
    public async Task<SignalementResponse> CreerSignalementAsync(
        CreerSignalementRequest req,
        Guid residentId,
        string? photoPath,
        Guid? createdByUserId,
        CancellationToken ct = default)
    {
        var s = Signalement.Create(req.Type, req.LotId, req.ImmeubleId, residentId, req.Titre, req.Description, photoPath, createdByUserId);
        db.Signalements.Add(s);
        await db.SaveChangesAsync(ct);
        return ToSignalementResponse(s);
    }

    public async Task<SignalementResponse> CreerSignalementAgentAsync(
        CreerSignalementAgentRequest req,
        Guid agentUserId,
        CancellationToken ct = default)
    {
        if (!Enum.TryParse<SignalementType>(req.Type, ignoreCase: true, out var type))
            throw new ArgumentException($"Type invalide : {req.Type}");

        var s = Signalement.Create(type, req.LotId, req.ImmeubleId, req.ResidentId, req.Titre, req.Description, null, agentUserId);
        db.Signalements.Add(s);
        await db.SaveChangesAsync(ct);
        return ToSignalementResponse(s);
    }

    public async Task SupprimerSignalementAsync(Guid id, CancellationToken ct = default)
    {
        var s = await db.Signalements.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"Signalement {id} introuvable.");
        db.Signalements.Remove(s);
        await db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<SignalementResponse>> GetSignalementsAsync(SignalementStatut? statut, CancellationToken ct = default)
    {
        var query = db.Signalements.AsNoTracking();
        if (statut.HasValue)
            query = query.Where(s => s.Statut == statut.Value);
        var list = await query.OrderByDescending(s => s.CreatedAt).ToListAsync(ct);
        return list.Select(ToSignalementResponse).ToList();
    }

    public async Task<SignalementResponse> GetSignalementByIdAsync(Guid id, CancellationToken ct = default)
    {
        var s = await db.Signalements.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException($"Signalement {id} introuvable.");
        return ToSignalementResponse(s);
    }

    public async Task<SignalementResponse> MettreAJourSignalementAsync(
        Guid id,
        MettreAJourSignalementRequest req,
        CancellationToken ct = default)
    {
        var s = await db.Signalements.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"Signalement {id} introuvable.");

        var statut = req.Statut switch
        {
            "recu"     => SignalementStatut.Recu,
            "en_cours" => SignalementStatut.EnCours,
            "resolu"   => SignalementStatut.Resolu,
            "cloture"  => SignalementStatut.Cloture,
            _          => throw new ArgumentException($"Statut invalide : {req.Statut}")
        };

        s.MettreAJour(statut, req.Reponse, req.AssigneA);
        await db.SaveChangesAsync(ct);

        await publisher.Publish(new SignalementMisAJour(s.Id, s.ResidentId, s.Titre, StatutToString(s.Statut)), ct);

        return ToSignalementResponse(s);
    }

    public async Task<IReadOnlyList<SignalementResponse>> GetSignalementsByResidentAsync(Guid residentId, CancellationToken ct = default)
    {
        var list = await db.Signalements
            .AsNoTracking()
            .Where(s => s.ResidentId == residentId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(ct);
        return list.Select(ToSignalementResponse).ToList();
    }

    public async Task<MaintenancePlanifieeResponse> CreerMaintenanceAsync(CreerMaintenanceRequest req, CancellationToken ct = default)
    {
        var m = MaintenancePlanifiee.Create(req.ResidenceId, req.ImmeubleId, req.Type, req.Libelle, req.DatePrevue, req.Recurrence, req.VisibleResidents);
        db.MaintenancesPlanifiees.Add(m);
        await db.SaveChangesAsync(ct);
        return ToMaintenanceResponse(m);
    }

    public async Task<IReadOnlyList<MaintenancePlanifieeResponse>> GetMaintenancesAsync(bool agentView, CancellationToken ct = default)
    {
        var query = db.MaintenancesPlanifiees.AsNoTracking();
        if (!agentView)
            query = query.Where(m => m.VisibleResidents);
        var list = await query.OrderBy(m => m.DatePrevue).ToListAsync(ct);
        return list.Select(ToMaintenanceResponse).ToList();
    }

    public async Task<MaintenancePlanifieeResponse> ModifierMaintenanceAsync(Guid id, ModifierMaintenanceRequest req, CancellationToken ct = default)
    {
        var m = await db.MaintenancesPlanifiees.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"Maintenance {id} introuvable.");

        m.Modifier(req.Type, req.Libelle, req.DatePrevue, req.Recurrence, req.VisibleResidents);

        if (!string.IsNullOrWhiteSpace(req.NouveauStatut))
        {
            var statut = req.NouveauStatut switch
            {
                "a_venir"  => MaintenanceStatut.AVenir,
                "en_cours" => MaintenanceStatut.EnCours,
                "terminee" => MaintenanceStatut.Terminee,
                _          => throw new ArgumentException($"Statut invalide : {req.NouveauStatut}")
            };
            m.ChangerStatut(statut);
        }

        await db.SaveChangesAsync(ct);
        return ToMaintenanceResponse(m);
    }

    public async Task SupprimerMaintenanceAsync(Guid id, CancellationToken ct = default)
    {
        var m = await db.MaintenancesPlanifiees.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"Maintenance {id} introuvable.");
        db.MaintenancesPlanifiees.Remove(m);
        await db.SaveChangesAsync(ct);
    }

    private static SignalementResponse ToSignalementResponse(Signalement s) => new(
        s.Id,
        s.Type == SignalementType.Reclamation ? "reclamation" : "incident",
        s.LotId,
        s.ImmeubleId,
        s.ResidentId,
        s.Titre,
        s.Description,
        s.PhotoPath,
        StatutToString(s.Statut),
        s.AssigneA,
        s.Reponse,
        s.CreatedAt,
        s.UpdatedAt,
        s.CreatedByUserId);

    private static string StatutToString(SignalementStatut statut) => statut switch
    {
        SignalementStatut.Recu    => "recu",
        SignalementStatut.EnCours => "en_cours",
        SignalementStatut.Resolu  => "resolu",
        _                         => "cloture"
    };

    private static MaintenancePlanifieeResponse ToMaintenanceResponse(MaintenancePlanifiee m) => new(
        m.Id,
        m.ResidenceId,
        m.ImmeubleId,
        m.Type,
        m.Libelle,
        m.DatePrevue,
        m.Recurrence,
        m.Statut switch
        {
            MaintenanceStatut.AVenir  => "a_venir",
            MaintenanceStatut.EnCours => "en_cours",
            _                         => "terminee"
        },
        m.VisibleResidents,
        m.CreatedAt);
}
