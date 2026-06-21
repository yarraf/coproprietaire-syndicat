using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Syndic.Modules.Maintenance.Endpoints;

namespace Syndic.Modules.Maintenance;

internal static class Policies
{
    internal const string RequireAgent    = "RequireAgent";
    internal const string RequireResident = "RequireResident";
}

public static class MaintenanceModule
{
    public static IEndpointRouteBuilder MapMaintenanceEndpoints(this IEndpointRouteBuilder app)
    {
        MaintenanceEndpoints.MapEndpoints(app);
        return app;
    }
}
