using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Syndic.Modules.Copropriete.Application.DTOs;
using Syndic.Modules.Copropriete.Application.Services;

namespace Syndic.Modules.Copropriete.Endpoints;

public static class ResidenceEndpoints
{
    public static void MapResidenceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/residences")
            .RequireAuthorization(Policies.RequireAgent)
            .WithTags("Résidences");

        // ── Résidences ────────────────────────────────────────────────────────
        group.MapGet("/", async (IResidenceService svc, CancellationToken ct) =>
            Results.Ok(await svc.GetAllResidencesAsync(ct)));

        group.MapGet("/{id:guid}", async (Guid id, IResidenceService svc, CancellationToken ct) =>
            Results.Ok(await svc.GetResidenceByIdAsync(id, ct)));

        group.MapPost("/", async (CreateResidenceRequest req, IResidenceService svc, CancellationToken ct) =>
        {
            var created = await svc.CreateResidenceAsync(req, ct);
            return Results.Created($"/api/residences/{created.Id}", created);
        });

        group.MapPut("/{id:guid}", async (Guid id, UpdateResidenceRequest req, IResidenceService svc, CancellationToken ct) =>
            Results.Ok(await svc.UpdateResidenceAsync(id, req, ct)));

        group.MapDelete("/{id:guid}", async (Guid id, IResidenceService svc, CancellationToken ct) =>
        {
            await svc.DeleteResidenceAsync(id, ct);
            return Results.NoContent();
        });

        // ── Groupes d'habitation ──────────────────────────────────────────────
        group.MapGet("/{resId:guid}/groupes-habitation/{id:guid}", async (Guid resId, Guid id, IResidenceService svc, CancellationToken ct) =>
            Results.Ok(await svc.GetGroupeHabitationByIdAsync(id, ct)));

        group.MapPost("/{resId:guid}/groupes-habitation", async (Guid resId, CreateGroupeHabitationRequest req, IResidenceService svc, CancellationToken ct) =>
        {
            var created = await svc.CreateGroupeHabitationAsync(resId, req, ct);
            return Results.Created($"/api/residences/{resId}/groupes-habitation/{created.Id}", created);
        });

        group.MapPut("/{resId:guid}/groupes-habitation/{id:guid}", async (Guid resId, Guid id, UpdateGroupeHabitationRequest req, IResidenceService svc, CancellationToken ct) =>
            Results.Ok(await svc.UpdateGroupeHabitationAsync(id, req, ct)));

        group.MapDelete("/{resId:guid}/groupes-habitation/{id:guid}", async (Guid resId, Guid id, IResidenceService svc, CancellationToken ct) =>
        {
            await svc.DeleteGroupeHabitationAsync(id, ct);
            return Results.NoContent();
        });

        // ── Immeubles ─────────────────────────────────────────────────────────
        group.MapPost("/{resId:guid}/groupes-habitation/{ghId:guid}/immeubles", async (Guid resId, Guid ghId, CreateImmeubleRequest req, IResidenceService svc, CancellationToken ct) =>
        {
            var created = await svc.CreateImmeubleAsync(ghId, req, ct);
            return Results.Created($"/api/immeubles/{created.Id}", created);
        });

        group.MapPut("/{resId:guid}/groupes-habitation/{ghId:guid}/immeubles/{id:guid}", async (Guid resId, Guid ghId, Guid id, UpdateImmeubleRequest req, IResidenceService svc, CancellationToken ct) =>
            Results.Ok(await svc.UpdateImmeubleAsync(id, req, ct)));

        group.MapDelete("/{resId:guid}/groupes-habitation/{ghId:guid}/immeubles/{id:guid}", async (Guid resId, Guid ghId, Guid id, IResidenceService svc, CancellationToken ct) =>
        {
            await svc.DeleteImmeubleAsync(id, ct);
            return Results.NoContent();
        });
    }
}
