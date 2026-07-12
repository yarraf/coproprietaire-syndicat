using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Syndic.Modules.Maintenance.Application.DTOs;
using Syndic.Modules.Maintenance.Application.Services;
using Syndic.Modules.Maintenance.Domain.Enums;

namespace Syndic.Modules.Maintenance.Endpoints;

internal static class MaintenanceEndpoints
{
    internal static void MapEndpoints(IEndpointRouteBuilder app)
    {
        // --- Signalements ---

        app.MapPost("/api/signalements", async (
            IFormCollection form,
            IFormFile? photo,
            HttpContext ctx,
            IMaintenanceService svc,
            IWebHostEnvironment env,
            CancellationToken ct) =>
        {
            var residentIdClaim = ctx.User.FindFirstValue("resident_id");
            if (!Guid.TryParse(residentIdClaim, out var residentId))
                return Results.Unauthorized();

            if (!Enum.TryParse<SignalementType>(form["type"], ignoreCase: true, out var type))
                return Results.BadRequest("Type de signalement invalide.");

            var titre = form["titre"].ToString();
            var description = form["description"].ToString();
            if (string.IsNullOrWhiteSpace(titre) || string.IsNullOrWhiteSpace(description))
                return Results.BadRequest("Titre et description requis.");

            Guid? lotId = Guid.TryParse(form["lotId"], out var l) && l != Guid.Empty ? l : null;
            Guid? immeubleId = Guid.TryParse(form["immeubleId"], out var i) && i != Guid.Empty ? i : null;

            string? photoPath = null;
            if (photo is { Length: > 0 })
            {
                var dir = Path.Combine(env.ContentRootPath, "uploads", "signalements");
                Directory.CreateDirectory(dir);
                var ext = Path.GetExtension(photo.FileName);
                var fileName = $"{Guid.NewGuid()}{ext}";
                photoPath = Path.Combine(dir, fileName);
                await using var fs = File.OpenWrite(photoPath);
                await photo.CopyToAsync(fs, ct);
            }

            Guid? userIdParsed = Guid.TryParse(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier), out var uid) ? uid : null;
            var req = new CreerSignalementRequest(type, lotId, immeubleId, titre, description);
            var s = await svc.CreerSignalementAsync(req, residentId, photoPath, userIdParsed, ct);
            return Results.Created($"/api/signalements/{s.Id}", s);
        })
        .RequireAuthorization(Policies.RequireResident)
        .DisableAntiforgery()
        .WithName("CreerSignalement");

        app.MapPost("/api/signalements/agent", async (
            CreerSignalementAgentRequest req,
            HttpContext ctx,
            IMaintenanceService svc,
            CancellationToken ct) =>
        {
            var agentUserId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(agentUserId, out var agentId))
                return Results.Unauthorized();

            var s = await svc.CreerSignalementAgentAsync(req, agentId, ct);
            return Results.Created($"/api/signalements/{s.Id}", s);
        })
        .RequireAuthorization(Policies.RequireAgent)
        .WithName("CreerSignalementAgent");

        app.MapDelete("/api/signalements/{id:guid}", async (Guid id, IMaintenanceService svc, CancellationToken ct) =>
        {
            await svc.SupprimerSignalementAsync(id, ct);
            return Results.NoContent();
        })
        .RequireAuthorization(Policies.RequireAgent)
        .WithName("SupprimerSignalement");

        app.MapGet("/api/signalements", async (string? statut, IMaintenanceService svc, CancellationToken ct) =>
        {
            SignalementStatut? statutParsed = null;
            if (!string.IsNullOrWhiteSpace(statut) && Enum.TryParse<SignalementStatut>(statut, ignoreCase: true, out var s))
                statutParsed = s;
            var list = await svc.GetSignalementsAsync(statutParsed, ct);
            return Results.Ok(list);
        })
        .RequireAuthorization(Policies.RequireAgent)
        .WithName("ListSignalements");

        app.MapGet("/api/signalements/{id:guid}", async (Guid id, IMaintenanceService svc, CancellationToken ct) =>
        {
            var s = await svc.GetSignalementByIdAsync(id, ct);
            return Results.Ok(s);
        })
        .RequireAuthorization(Policies.RequireAgent)
        .WithName("GetSignalement");

        app.MapPut("/api/signalements/{id:guid}", async (Guid id, MettreAJourSignalementRequest req, IMaintenanceService svc, CancellationToken ct) =>
        {
            var s = await svc.MettreAJourSignalementAsync(id, req, ct);
            return Results.Ok(s);
        })
        .RequireAuthorization(Policies.RequireAgent)
        .WithName("MettreAJourSignalement");

        app.MapGet("/api/me/signalements", async (HttpContext ctx, IMaintenanceService svc, CancellationToken ct) =>
        {
            var residentIdClaim = ctx.User.FindFirstValue("resident_id");
            if (!Guid.TryParse(residentIdClaim, out var residentId))
                return Results.Unauthorized();
            var list = await svc.GetSignalementsByResidentAsync(residentId, ct);
            return Results.Ok(list);
        })
        .RequireAuthorization(Policies.RequireResident)
        .WithName("MesSignalements");

        // --- Maintenance planifiée ---

        app.MapPost("/api/maintenance-planifiee", async (CreerMaintenanceRequest req, IMaintenanceService svc, CancellationToken ct) =>
        {
            var m = await svc.CreerMaintenanceAsync(req, ct);
            return Results.Created($"/api/maintenance-planifiee/{m.Id}", m);
        })
        .RequireAuthorization(Policies.RequireAgent)
        .WithName("CreerMaintenance");

        app.MapGet("/api/maintenance-planifiee", async (HttpContext ctx, IMaintenanceService svc, CancellationToken ct) =>
        {
            var isAgent = ctx.User.HasClaim("role", "Agent");
            var list = await svc.GetMaintenancesAsync(isAgent, ct);
            return Results.Ok(list);
        })
        .RequireAuthorization()
        .WithName("ListMaintenances");

        app.MapPut("/api/maintenance-planifiee/{id:guid}", async (Guid id, ModifierMaintenanceRequest req, IMaintenanceService svc, CancellationToken ct) =>
        {
            var m = await svc.ModifierMaintenanceAsync(id, req, ct);
            return Results.Ok(m);
        })
        .RequireAuthorization(Policies.RequireAgent)
        .WithName("ModifierMaintenance");

        app.MapDelete("/api/maintenance-planifiee/{id:guid}", async (Guid id, IMaintenanceService svc, CancellationToken ct) =>
        {
            await svc.SupprimerMaintenanceAsync(id, ct);
            return Results.NoContent();
        })
        .RequireAuthorization(Policies.RequireAgent)
        .WithName("SupprimerMaintenance");
    }
}
