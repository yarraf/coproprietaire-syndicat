using Syndic.Api.Modules.Notification.Services;
using Syndic.Modules.Notification.Application.Services;

namespace Syndic.Api.Modules.Notification;

public static class NotificationRegistration
{
    public static IServiceCollection AddNotificationModule(this IServiceCollection services)
    {
        services.AddHttpClient("expo", c =>
            c.BaseAddress = new Uri("https://exp.host/--/api/v2/"));

        services.AddScoped<INotificationService, NotificationService>();

        return services;
    }
}
