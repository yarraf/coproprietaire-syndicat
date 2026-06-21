using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Syndic.Modules.Notification.Application.DTOs;
using Syndic.Modules.Notification.Application.Services;

namespace Syndic.Modules.Notification.Endpoints;

public static class NotificationEndpoints
{
    internal static void MapEndpoints(IEndpointRouteBuilder app)
    {
        var me = app.MapGroup("/api/me")
            .RequireAuthorization(Policies.RequireResident)
            .WithTags("Notifications");

        // ── Devices ───────────────────────────────────────────────────────────
        me.MapPost("/devices", async (
            EnregistrerDeviceRequest req,
            ClaimsPrincipal user,
            INotificationService svc,
            CancellationToken ct) =>
        {
            if (!Guid.TryParse(user.FindFirst("resident_id")?.Value, out var residentId))
                return Results.Forbid();

            var device = await svc.UpsertDeviceAsync(residentId, req.PushToken, req.Plateforme, ct);
            return Results.Ok(device);
        });

        me.MapDelete("/devices/{id:guid}", async (
            Guid id,
            ClaimsPrincipal user,
            INotificationService svc,
            CancellationToken ct) =>
        {
            if (!Guid.TryParse(user.FindFirst("resident_id")?.Value, out var residentId))
                return Results.Forbid();

            await svc.RemoveDeviceAsync(id, residentId, ct);
            return Results.NoContent();
        });

        // ── Préférences ───────────────────────────────────────────────────────
        me.MapGet("/notification-preferences", async (
            ClaimsPrincipal user,
            INotificationService svc,
            CancellationToken ct) =>
        {
            if (!Guid.TryParse(user.FindFirst("resident_id")?.Value, out var residentId))
                return Results.Forbid();

            return Results.Ok(await svc.GetPreferencesAsync(residentId, ct));
        });

        me.MapPut("/notification-preferences", async (
            MettreAJourPreferencesRequest req,
            ClaimsPrincipal user,
            INotificationService svc,
            CancellationToken ct) =>
        {
            if (!Guid.TryParse(user.FindFirst("resident_id")?.Value, out var residentId))
                return Results.Forbid();

            return Results.Ok(await svc.UpdatePreferencesAsync(residentId, req.PushActive, ct));
        });
    }
}
