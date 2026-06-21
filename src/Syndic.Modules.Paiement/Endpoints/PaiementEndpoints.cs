using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Syndic.Modules.Paiement.Application.DTOs;
using Syndic.Modules.Paiement.Application.Services;
using Syndic.Modules.Paiement.Domain.Enums;

namespace Syndic.Modules.Paiement.Endpoints;

public static class PaiementEndpoints
{
    internal static void MapEndpoints(IEndpointRouteBuilder app)
    {
        // ── Agent : paiements en attente / historique ─────────────────────────
        var agentPaiements = app.MapGroup("/api/paiements")
            .RequireAuthorization(Policies.RequireAgent)
            .WithTags("Paiements");

        agentPaiements.MapGet("/", async (
            [FromQuery] Guid? lotId,
            [FromQuery] PaymentStatus? statut,
            IPaiementService svc,
            CancellationToken ct) =>
            Results.Ok(await svc.GetHistoriqueAsync(lotId, null, statut, ct)));

        agentPaiements.MapGet("/{id:guid}", async (Guid id, IPaiementService svc, CancellationToken ct) =>
            Results.Ok(await svc.GetByIdAsync(id, ct)));

        agentPaiements.MapPut("/{id:guid}/valider", async (
            Guid id,
            ClaimsPrincipal user,
            IPaiementService svc,
            CancellationToken ct) =>
        {
            if (!Guid.TryParse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var agentId))
                return Results.Forbid();

            return Results.Ok(await svc.ValiderAsync(id, agentId, ct));
        });

        agentPaiements.MapPut("/{id:guid}/rejeter", async (
            Guid id,
            RejeterPaiementRequest req,
            ClaimsPrincipal user,
            IPaiementService svc,
            CancellationToken ct) =>
        {
            if (!Guid.TryParse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value, out _))
                return Results.Forbid();

            return Results.Ok(await svc.RejeterAsync(id, req.MotifRejet, ct));
        });

        // ── Agent : ajustements de solde ──────────────────────────────────────
        var ajustements = app.MapGroup("/api/ajustements-solde")
            .RequireAuthorization(Policies.RequireAgent)
            .WithTags("Paiements");

        ajustements.MapPost("/", async (
            CreerAjustementRequest req,
            ClaimsPrincipal user,
            IPaiementService svc,
            CancellationToken ct) =>
        {
            if (!Guid.TryParse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var agentId))
                return Results.Forbid();

            var created = await svc.CreerAjustementAsync(req, agentId, ct);
            return Results.Created($"/api/ajustements-solde/{created.Id}", created);
        });

        // ── Résident : soumettre un paiement ──────────────────────────────────
        var residentPaiements = app.MapGroup("/api/paiements")
            .RequireAuthorization(Policies.RequireResident)
            .WithTags("Paiements");

        residentPaiements.MapPost("/", async (
            [FromForm] Guid lotId,
            [FromForm] decimal montant,
            [FromForm] string periode,
            [FromForm] string modePaiement,
            IFormFile? justificatif,
            ClaimsPrincipal user,
            IPaiementService svc,
            IWebHostEnvironment env,
            CancellationToken ct) =>
        {
            if (!Guid.TryParse(user.FindFirst("resident_id")?.Value, out var residentId))
                return Results.Forbid();

            string? justificatifPath = null;
            if (justificatif is not null)
            {
                var dir = Path.Combine(env.ContentRootPath, "uploads", "justificatifs");
                Directory.CreateDirectory(dir);
                var ext = Path.GetExtension(justificatif.FileName);
                var fileName = $"{Guid.NewGuid()}{ext}";
                justificatifPath = Path.Combine("uploads", "justificatifs", fileName);
                var fullPath = Path.Combine(env.ContentRootPath, justificatifPath);
                await using var fs = File.Create(fullPath);
                await justificatif.CopyToAsync(fs, ct);
            }

            var result = await svc.SoumettreAsync(lotId, residentId, montant, periode, modePaiement, justificatifPath, ct);
            return Results.Created($"/api/paiements/{result.Id}", result);
        }).DisableAntiforgery();

        // ── Résident : historique personnel ───────────────────────────────────
        var me = app.MapGroup("/api/me")
            .RequireAuthorization(Policies.RequireResident)
            .WithTags("Mon espace");

        me.MapGet("/paiements", async (
            ClaimsPrincipal user,
            IPaiementService svc,
            CancellationToken ct) =>
        {
            if (!Guid.TryParse(user.FindFirst("resident_id")?.Value, out var residentId))
                return Results.Forbid();

            return Results.Ok(await svc.GetHistoriqueAsync(null, residentId, null, ct));
        });
    }
}
