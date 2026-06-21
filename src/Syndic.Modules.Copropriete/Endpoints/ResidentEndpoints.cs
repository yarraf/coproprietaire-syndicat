using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Syndic.Modules.Copropriete.Application.DTOs;
using Syndic.Modules.Copropriete.Application.Services;

namespace Syndic.Modules.Copropriete.Endpoints;

public static class ResidentEndpoints
{
    public static void MapResidentEndpoints(this IEndpointRouteBuilder app)
    {
        // ── /api/residents (Agent) ────────────────────────────────────────────
        var residents = app.MapGroup("/api/residents")
            .RequireAuthorization(Policies.RequireAgent)
            .WithTags("Résidents");

        residents.MapGet("/", async (IResidentService svc, CancellationToken ct) =>
            Results.Ok(await svc.GetAllResidentsAsync(ct)));

        residents.MapGet("/{id:guid}", async (Guid id, IResidentService svc, CancellationToken ct) =>
            Results.Ok(await svc.GetResidentByIdAsync(id, ct)));

        residents.MapPost("/", async (CreateResidentRequest req, IResidentService svc, CancellationToken ct) =>
        {
            var created = await svc.CreateResidentAsync(req, ct);
            return Results.Created($"/api/residents/{created.Id}", created);
        });

        residents.MapPut("/{id:guid}", async (Guid id, UpdateResidentRequest req, IResidentService svc, CancellationToken ct) =>
            Results.Ok(await svc.UpdateResidentAsync(id, req, ct)));

        residents.MapDelete("/{id:guid}", async (Guid id, IResidentService svc, CancellationToken ct) =>
        {
            await svc.DeactivateResidentAsync(id, ct);
            return Results.NoContent();
        });

        residents.MapPost("/{id:guid}/invite", async (Guid id, IResidentService svc, CancellationToken ct) =>
            Results.Ok(await svc.InviteResidentAsync(id, ct)));

        // ── /api/me (Resident) ────────────────────────────────────────────────
        var me = app.MapGroup("/api/me")
            .RequireAuthorization(Policies.RequireResident)
            .WithTags("Mon espace");

        me.MapGet("/lots", async (ClaimsPrincipal user, ILotService svc, CancellationToken ct) =>
        {
            var residentIdClaim = user.FindFirst("resident_id")?.Value;
            if (!Guid.TryParse(residentIdClaim, out var residentId))
                return Results.Forbid();

            return Results.Ok(await svc.GetLotsByResidentAsync(residentId, ct));
        });

        me.MapGet("/profile", async (ClaimsPrincipal user, IResidentService svc, CancellationToken ct) =>
        {
            var residentIdClaim = user.FindFirst("resident_id")?.Value;
            if (!Guid.TryParse(residentIdClaim, out var residentId))
                return Results.Forbid();

            return Results.Ok(await svc.GetResidentByIdAsync(residentId, ct));
        });
    }
}
