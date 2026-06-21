using Microsoft.AspNetCore.Identity;
using Syndic.Api.Modules.Copropriete.Services;
using Syndic.Modules.Copropriete;
using Syndic.Modules.Copropriete.Application.Services;
using Syndic.Modules.Identity.Domain.Constants;
using Syndic.Modules.Identity.Domain.Entities;

namespace Syndic.Api.Modules.Copropriete;

public static class CoproprieteRegistration
{
    public static IServiceCollection AddCoproprieteModule(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            options.AddPolicy(Policies.RequireAgent, policy =>
                policy.RequireRole(Roles.Agent));

            options.AddPolicy(Policies.RequireResident, policy =>
                policy.RequireRole(Roles.Resident));
        });

        services.AddScoped<IResidenceService, ResidenceService>();
        services.AddScoped<ILotService, LotService>();
        services.AddScoped<IResidentService, ResidentService>();

        return services;
    }

    public static async Task SeedRolesAsync(this IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        foreach (var role in new[] { Roles.Agent, Roles.Resident })
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
        }
    }
}
