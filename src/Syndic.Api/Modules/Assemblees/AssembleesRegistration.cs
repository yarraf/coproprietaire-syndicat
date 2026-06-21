using Microsoft.Extensions.DependencyInjection;
using Syndic.Api.Modules.Assemblees.Services;
using Syndic.Modules.Assemblees.Application.Services;

namespace Syndic.Api.Modules.Assemblees;

public static class AssembleesRegistration
{
    public static IServiceCollection AddAssembleesModule(this IServiceCollection services)
    {
        services.AddScoped<IAssembleeService, AssembleeService>();
        return services;
    }
}
