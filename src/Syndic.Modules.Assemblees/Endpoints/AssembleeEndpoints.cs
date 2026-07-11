using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Syndic.Modules.Assemblees.Application.DTOs;
using Syndic.Modules.Assemblees.Application.Services;

namespace Syndic.Modules.Assemblees.Endpoints;

internal static class AssembleeEndpoints
{
    internal static void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/assemblees");

        group.MapPost("/", async (CreerAssembleeRequest req, IAssembleeService svc, CancellationToken ct) =>
        {
            var ag = await svc.CreerAsync(req, ct);
            return Results.Created($"/api/assemblees/{ag.Id}", ag);
        })
        .RequireAuthorization(Policies.RequireAgent)
        .WithName("CreerAssemblee");

        group.MapGet("/", async (Guid? residenceId, IAssembleeService svc, CancellationToken ct) =>
        {
            var list = residenceId.HasValue
                ? await svc.GetByResidenceAsync(residenceId.Value, ct)
                : await svc.GetAllAsync(ct);
            return Results.Ok(list);
        })
        .RequireAuthorization()
        .WithName("ListAssemblees");

        group.MapGet("/{id:guid}", async (Guid id, IAssembleeService svc, CancellationToken ct) =>
        {
            var ag = await svc.GetByIdAsync(id, ct);
            return Results.Ok(ag);
        })
        .RequireAuthorization()
        .WithName("GetAssemblee");

        group.MapPut("/{id:guid}", async (Guid id, ModifierAssembleeRequest req, IAssembleeService svc, CancellationToken ct) =>
        {
            var ag = await svc.ModifierAsync(id, req, ct);
            return Results.Ok(ag);
        })
        .RequireAuthorization(Policies.RequireAgent)
        .WithName("ModifierAssemblee");

        group.MapDelete("/{id:guid}", async (Guid id, IAssembleeService svc, CancellationToken ct) =>
        {
            await svc.SupprimerAsync(id, ct);
            return Results.NoContent();
        })
        .RequireAuthorization(Policies.RequireAgent)
        .WithName("SupprimerAssemblee");

        group.MapPost("/{id:guid}/pv", async (
            Guid id,
            IFormFile pv,
            IAssembleeService svc,
            IWebHostEnvironment env,
            CancellationToken ct) =>
        {
            if (pv is null || pv.Length == 0)
                return Results.BadRequest("Fichier PV requis.");

            var dir = Path.Combine(env.ContentRootPath, "uploads", "pv");
            Directory.CreateDirectory(dir);
            var ext = Path.GetExtension(pv.FileName);
            var fileName = $"{Guid.NewGuid()}{ext}";
            var path = Path.Combine(dir, fileName);
            await using var fs = File.OpenWrite(path);
            await pv.CopyToAsync(fs, ct);

            var ag = await svc.AttacherPvAsync(id, path, ct);
            return Results.Ok(ag);
        })
        .RequireAuthorization(Policies.RequireAgent)
        .DisableAntiforgery()
        .WithName("AttacherPv");

        group.MapPost("/{id:guid}/convoquer", async (Guid id, IAssembleeService svc, CancellationToken ct) =>
        {
            await svc.ConvoquerAsync(id, ct);
            return Results.Accepted();
        })
        .RequireAuthorization(Policies.RequireAgent)
        .WithName("ConvoquerAssemblee");
    }
}
