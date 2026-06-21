using Microsoft.EntityFrameworkCore;
using Syndic.Api.Infrastructure.Persistence;
using Syndic.Modules.Ged.Application.DTOs;
using Syndic.Modules.Ged.Application.Services;
using Syndic.Modules.Ged.Domain.Entities;
using Syndic.Modules.Ged.Domain.Enums;

namespace Syndic.Api.Modules.Ged.Services;

public sealed class GedService(SyndicDbContext db) : IGedService
{
    public async Task<DocumentResponse> CreerAsync(CreerDocumentRequest req, string fichierPath, CancellationToken ct = default)
    {
        var doc = Document.Create(req.ResidenceId, req.ImmeubleId, req.Type, req.Titre, fichierPath, req.Date, req.VisibleResidents);
        db.Documents.Add(doc);
        await db.SaveChangesAsync(ct);
        return ToResponse(doc);
    }

    public async Task<DocumentResponse> ArchiverPvAsync(
        Guid? residenceId,
        string titre,
        DateOnly date,
        string fichierPath,
        CancellationToken ct = default)
    {
        var doc = Document.Create(residenceId, null, DocumentType.PvAg, titre, fichierPath, date, visibleResidents: true);
        db.Documents.Add(doc);
        await db.SaveChangesAsync(ct);
        return ToResponse(doc);
    }

    public async Task<IReadOnlyList<DocumentResponse>> GetAllAsync(bool agentView, CancellationToken ct = default)
    {
        var query = db.Documents.AsNoTracking();
        if (!agentView)
            query = query.Where(d => d.VisibleResidents);

        var docs = await query.OrderByDescending(d => d.Date).ToListAsync(ct);
        return docs.Select(ToResponse).ToList();
    }

    public async Task<DocumentResponse> GetByIdAsync(Guid id, bool agentView, CancellationToken ct = default)
    {
        var doc = await db.Documents.AsNoTracking().FirstOrDefaultAsync(d => d.Id == id, ct)
            ?? throw new KeyNotFoundException($"Document {id} introuvable.");

        if (!agentView && !doc.VisibleResidents)
            throw new UnauthorizedAccessException("Document non accessible.");

        return ToResponse(doc);
    }

    private static DocumentResponse ToResponse(Document d) => new(
        d.Id,
        d.ResidenceId,
        d.ImmeubleId,
        d.Type switch
        {
            DocumentType.Reglement => "reglement",
            DocumentType.PvAg      => "pv_ag",
            _                      => "autre"
        },
        d.Titre,
        d.FichierPath,
        d.Date,
        d.VisibleResidents,
        d.CreatedAt);
}
