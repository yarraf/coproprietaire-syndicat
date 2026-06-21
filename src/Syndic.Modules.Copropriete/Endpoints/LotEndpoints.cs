using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Syndic.Modules.Copropriete.Application.DTOs;
using Syndic.Modules.Copropriete.Application.Services;

namespace Syndic.Modules.Copropriete.Endpoints;

public static class LotEndpoints
{
    public static void MapLotEndpoints(this IEndpointRouteBuilder app)
    {
        // ── Immeubles → Lots ──────────────────────────────────────────────────
        var immeubles = app.MapGroup("/api/immeubles")
            .RequireAuthorization(Policies.RequireAgent)
            .WithTags("Lots");

        immeubles.MapGet("/{id:guid}", async (Guid id, IResidenceService svc, CancellationToken ct) =>
            Results.Ok(await svc.GetImmeubleByIdAsync(id, ct)));

        immeubles.MapGet("/{id:guid}/lots", async (Guid id, ILotService svc, CancellationToken ct) =>
            Results.Ok(await svc.GetLotsByImmeubleAsync(id, ct)));

        immeubles.MapPost("/{id:guid}/lots", async (Guid id, CreateLotRequest req, ILotService svc, CancellationToken ct) =>
        {
            var created = await svc.CreateLotAsync(id, req, ct);
            return Results.Created($"/api/lots/{created.Id}", created);
        });

        // ── Lots ──────────────────────────────────────────────────────────────
        var lots = app.MapGroup("/api/lots")
            .RequireAuthorization(Policies.RequireAgent)
            .WithTags("Lots");

        lots.MapGet("/{id:guid}", async (Guid id, ILotService svc, CancellationToken ct) =>
            Results.Ok(await svc.GetLotByIdAsync(id, ct)));

        lots.MapPut("/{id:guid}", async (Guid id, UpdateLotRequest req, ILotService svc, CancellationToken ct) =>
            Results.Ok(await svc.UpdateLotAsync(id, req, ct)));

        lots.MapDelete("/{id:guid}", async (Guid id, ILotService svc, CancellationToken ct) =>
        {
            await svc.DeleteLotAsync(id, ct);
            return Results.NoContent();
        });

        lots.MapPost("/{lotId:guid}/residents", async (Guid lotId, AssignResidentToLotRequest req, ILotService svc, CancellationToken ct) =>
        {
            var created = await svc.AssignResidentAsync(lotId, req, ct);
            return Results.Created($"/api/lots/{lotId}/residents/{created.Id}", created);
        });

        lots.MapPost("/{lotId:guid}/residents/{lotResidentId:guid}/terminate", async (Guid lotId, Guid lotResidentId, TerminateLotResidentRequest req, ILotService svc, CancellationToken ct) =>
            Results.Ok(await svc.TerminateAssignmentAsync(lotResidentId, req, ct)));
    }
}
