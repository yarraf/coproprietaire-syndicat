using Syndic.Modules.Notification.Domain.Enums;

namespace Syndic.Modules.Notification.Application.DTOs;

public record EnregistrerDeviceRequest(string PushToken, Plateforme Plateforme);

public record DeviceResponse(
    Guid Id,
    string PushToken,
    string Plateforme,
    DateTimeOffset DerniereActivite);

public record PreferencesResponse(
    Guid Id,
    Guid ResidentId,
    bool PushActive);

public record MettreAJourPreferencesRequest(bool PushActive);
