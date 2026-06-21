using Microsoft.Extensions.DependencyInjection;
using Syndic.Api.Modules.Ged.Services;
using Syndic.Modules.Ged.Application.Services;

namespace Syndic.Api.Modules.Ged;

public static class GedRegistration
{
    public static IServiceCollection AddGedModule(this IServiceCollection services)
    {
        services.AddScoped<IGedService, GedService>();
        return services;
    }
}
