using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Syndic.Modules.Ged.Application.DTOs;
using Syndic.Modules.Ged.Application.Services;
using Syndic.Modules.Ged.Domain.Enums;

namespace Syndic.Modules.Ged.Endpoints;

internal static class GedEndpoints
{
    internal static void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/documents");

        group.MapPost("/", async (
            IFormFile fichier,
            HttpRequest request,
            IGedService ged,
            IWebHostEnvironment env,
            CancellationToken ct) =>
        {
            if (fichier is null || fichier.Length == 0)
                return Results.BadRequest("Fichier requis.");

            if (!Enum.TryParse<DocumentType>(request.Form["type"], ignoreCase: true, out var type))
                return Results.BadRequest("Type de document invalide.");

            if (!Guid.TryParse(request.Form["residenceId"], out var residenceId))
                residenceId = Guid.Empty;

            Guid? residenceIdNullable = residenceId == Guid.Empty ? null : residenceId;

            Guid? immeubleIdNullable = null;
            if (Guid.TryParse(request.Form["immeubleId"], out var immeubleId) && immeubleId != Guid.Empty)
                immeubleIdNullable = immeubleId;

            var titre = request.Form["titre"].ToString();
            if (string.IsNullOrWhiteSpace(titre))
                return Results.BadRequest("Titre requis.");

            if (!DateOnly.TryParse(request.Form["date"], out var date))
                date = DateOnly.FromDateTime(DateTime.UtcNow);

            var visibleResidents = request.Form["visibleResidents"].ToString().Equals("true", StringComparison.OrdinalIgnoreCase);

            var dir = Path.Combine(env.ContentRootPath, "uploads", "documents");
            Directory.CreateDirectory(dir);
            var ext = Path.GetExtension(fichier.FileName);
            var fileName = $"{Guid.NewGuid()}{ext}";
            var path = Path.Combine(dir, fileName);
            await using var fs = File.OpenWrite(path);
            await fichier.CopyToAsync(fs, ct);

            var req = new CreerDocumentRequest(residenceIdNullable, immeubleIdNullable, type, titre, date, visibleResidents);
            var doc = await ged.CreerAsync(req, path, ct);
            return Results.Created($"/api/documents/{doc.Id}", doc);
        })
        .RequireAuthorization(Policies.RequireAgent)
        .DisableAntiforgery()
        .WithName("UploadDocument");

        group.MapGet("/", async (HttpContext ctx, IGedService ged, CancellationToken ct) =>
        {
            var isAgent = ctx.User.HasClaim("role", "Agent");
            var docs = await ged.GetAllAsync(isAgent, ct);
            return Results.Ok(docs);
        })
        .RequireAuthorization()
        .WithName("ListDocuments");

        group.MapGet("/{id:guid}", async (Guid id, HttpContext ctx, IGedService ged, CancellationToken ct) =>
        {
            var isAgent = ctx.User.HasClaim("role", "Agent");
            var doc = await ged.GetByIdAsync(id, isAgent, ct);
            return Results.Ok(doc);
        })
        .RequireAuthorization()
        .WithName("GetDocument");
    }
}
