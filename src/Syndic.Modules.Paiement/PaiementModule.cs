using Microsoft.AspNetCore.Routing;
using Syndic.Modules.Paiement.Endpoints;

namespace Syndic.Modules.Paiement;

internal static class Policies
{
    public const string RequireAgent    = "RequireAgent";
    public const string RequireResident = "RequireResident";
}

public static class PaiementModule
{
    public static IEndpointRouteBuilder MapPaiementEndpoints(this IEndpointRouteBuilder app)
    {
        PaiementEndpoints.MapEndpoints(app);
        return app;
    }
}
