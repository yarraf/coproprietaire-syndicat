using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Syndic.Api.Infrastructure.Persistence;
using Syndic.Modules.Notification.Application.DTOs;
using Syndic.Modules.Notification.Application.Services;
using Syndic.Modules.Notification.Domain.Entities;
using Syndic.Modules.Notification.Domain.Enums;

namespace Syndic.Api.Modules.Notification.Services;

public sealed class NotificationService(
    SyndicDbContext db,
    IHttpClientFactory httpFactory,
    ILogger<NotificationService> logger) : INotificationService
{
    public async Task SendPushAsync(
        Guid residentId,
        string title,
        string body,
        string typeEvenement,
        Dictionary<string, string>? data = null,
        CancellationToken ct = default)
    {
        var prefs = await GetOrCreatePrefsAsync(residentId, ct);
        if (!prefs.PushActive)
        {
            logger.LogInformation("Push désactivé pour le résident {ResidentId}, notification ignorée.", residentId);
            return;
        }

        var devices = await db.Devices
            .Where(d => d.ResidentId == residentId)
            .AsNoTracking()
            .ToListAsync(ct);

        if (devices.Count == 0)
        {
            logger.LogInformation("Aucun device enregistré pour le résident {ResidentId}.", residentId);
            return;
        }

        var messages = devices.Select(d => new
        {
            to    = d.PushToken,
            title,
            body,
            data  = data ?? new Dictionary<string, string>()
        }).ToList();

        var payload = JsonSerializer.Serialize(messages);
        var statut  = NotificationStatut.Echec;

        try
        {
            var client   = httpFactory.CreateClient("expo");
            var content  = new StringContent(payload, Encoding.UTF8, "application/json");
            var response = await client.PostAsync("push/send", content, ct);

            statut = response.IsSuccessStatusCode
                ? NotificationStatut.Envoye
                : NotificationStatut.Echec;

            if (!response.IsSuccessStatusCode)
                logger.LogWarning("Expo push API a retourné {Status} pour le résident {ResidentId}.",
                    response.StatusCode, residentId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Échec de l'appel Expo push pour le résident {ResidentId}.", residentId);
        }

        var log = NotificationLog.Create(residentId, NotificationCanal.Push, typeEvenement, statut, payload);
        db.NotificationsLog.Add(log);
        await db.SaveChangesAsync(ct);
    }

    public async Task<DeviceResponse> UpsertDeviceAsync(
        Guid residentId, string pushToken, Plateforme plateforme, CancellationToken ct = default)
    {
        var existing = await db.Devices
            .FirstOrDefaultAsync(d => d.PushToken == pushToken, ct);

        if (existing is not null)
        {
            existing.Refresh();
        }
        else
        {
            existing = Device.Create(residentId, pushToken, plateforme);
            db.Devices.Add(existing);
        }

        await db.SaveChangesAsync(ct);
        return ToResponse(existing);
    }

    public async Task RemoveDeviceAsync(Guid deviceId, Guid residentId, CancellationToken ct = default)
    {
        var device = await db.Devices.FindAsync([deviceId], ct)
            ?? throw new KeyNotFoundException("Device introuvable.");

        if (device.ResidentId != residentId)
            throw new InvalidOperationException("Ce device n'appartient pas au résident.");

        db.Devices.Remove(device);
        await db.SaveChangesAsync(ct);
    }

    public async Task<PreferencesResponse> GetPreferencesAsync(Guid residentId, CancellationToken ct = default)
    {
        var prefs = await GetOrCreatePrefsAsync(residentId, ct);
        return ToResponse(prefs);
    }

    public async Task<PreferencesResponse> UpdatePreferencesAsync(
        Guid residentId, bool pushActive, CancellationToken ct = default)
    {
        var prefs = await GetOrCreatePrefsAsync(residentId, ct);
        prefs.Update(pushActive);
        await db.SaveChangesAsync(ct);
        return ToResponse(prefs);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<PreferencesNotification> GetOrCreatePrefsAsync(Guid residentId, CancellationToken ct)
    {
        var prefs = await db.PreferencesNotification
            .FirstOrDefaultAsync(p => p.ResidentId == residentId, ct);

        if (prefs is null)
        {
            prefs = PreferencesNotification.Create(residentId);
            db.PreferencesNotification.Add(prefs);
            await db.SaveChangesAsync(ct);
        }

        return prefs;
    }

    private static DeviceResponse ToResponse(Device d) => new(
        d.Id,
        d.PushToken,
        d.Plateforme == Plateforme.iOS ? "ios" : "android",
        d.DerniereActivite);

    private static PreferencesResponse ToResponse(PreferencesNotification p) => new(
        p.Id, p.ResidentId, p.PushActive);
}
