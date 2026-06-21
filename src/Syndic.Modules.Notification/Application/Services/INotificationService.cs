using Syndic.Modules.Notification.Application.DTOs;
using Syndic.Modules.Notification.Domain.Enums;

namespace Syndic.Modules.Notification.Application.Services;

public interface INotificationService
{
    // Canal push — MVP
    Task SendPushAsync(
        Guid residentId,
        string title,
        string body,
        string typeEvenement,
        Dictionary<string, string>? data = null,
        CancellationToken ct = default);

    // v2 : Task SendWhatsAppAsync(Guid residentId, string templateName,
    //     Dictionary<string, string> variables, CancellationToken ct = default);

    Task<DeviceResponse> UpsertDeviceAsync(
        Guid residentId,
        string pushToken,
        Plateforme plateforme,
        CancellationToken ct = default);

    Task RemoveDeviceAsync(Guid deviceId, Guid residentId, CancellationToken ct = default);

    Task<PreferencesResponse> GetPreferencesAsync(Guid residentId, CancellationToken ct = default);

    Task<PreferencesResponse> UpdatePreferencesAsync(
        Guid residentId,
        bool pushActive,
        CancellationToken ct = default);
}
