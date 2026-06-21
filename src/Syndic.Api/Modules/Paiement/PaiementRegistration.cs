using Syndic.Api.Modules.Paiement.Services;
using Syndic.Modules.Paiement.Application.Services;

namespace Syndic.Api.Modules.Paiement;

public static class PaiementRegistration
{
    public static IServiceCollection AddPaiementModule(this IServiceCollection services)
    {
        services.AddScoped<IPaiementService, PaiementService>();
        return services;
    }
}
