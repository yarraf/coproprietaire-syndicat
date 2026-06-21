using Microsoft.AspNetCore.Routing;
using Syndic.Modules.Notification.Endpoints;

namespace Syndic.Modules.Notification;

internal static class Policies
{
    public const string RequireResident = "RequireResident";
}

public static class NotificationModule
{
    public static IEndpointRouteBuilder MapNotificationEndpoints(this IEndpointRouteBuilder app)
    {
        NotificationEndpoints.MapEndpoints(app);
        return app;
    }
}
