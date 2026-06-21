using Microsoft.Extensions.DependencyInjection;
using Syndic.Api.Modules.Maintenance.Services;
using Syndic.Modules.Maintenance.Application.Services;

namespace Syndic.Api.Modules.Maintenance;

public static class MaintenanceRegistration
{
    public static IServiceCollection AddMaintenanceModule(this IServiceCollection services)
    {
        services.AddScoped<IMaintenanceService, MaintenanceService>();
        return services;
    }
}
