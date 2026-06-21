using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Syndic.Modules.Assemblees.Endpoints;

namespace Syndic.Modules.Assemblees;

internal static class Policies
{
    internal const string RequireAgent = "RequireAgent";
}

public static class AssembleesModule
{
    public static IEndpointRouteBuilder MapAssembleesEndpoints(this IEndpointRouteBuilder app)
    {
        AssembleeEndpoints.MapEndpoints(app);
        return app;
    }
}
