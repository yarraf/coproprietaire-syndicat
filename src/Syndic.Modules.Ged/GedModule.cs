using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Syndic.Modules.Ged.Endpoints;

namespace Syndic.Modules.Ged;

internal static class Policies
{
    internal const string RequireAgent = "RequireAgent";
}

public static class GedModule
{
    public static IEndpointRouteBuilder MapGedEndpoints(this IEndpointRouteBuilder app)
    {
        GedEndpoints.MapEndpoints(app);
        return app;
    }
}
