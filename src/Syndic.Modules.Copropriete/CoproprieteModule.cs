using Microsoft.AspNetCore.Routing;
using Syndic.Modules.Copropriete.Endpoints;

namespace Syndic.Modules.Copropriete;

public static class Policies
{
    public const string RequireAgent    = "RequireAgent";
    public const string RequireResident = "RequireResident";
}

public static class CoproprieteModule
{
    public static IEndpointRouteBuilder MapCoproprieteEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapResidenceEndpoints();
        app.MapLotEndpoints();
        app.MapResidentEndpoints();
        return app;
    }
}
