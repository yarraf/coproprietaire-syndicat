using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Syndic.Modules.Assemblees.Domain.Entities;
using Syndic.Modules.Assemblees.Persistence.Configurations;
using Syndic.Modules.Copropriete.Domain.Entities;
using Syndic.Modules.Copropriete.Persistence.Configurations;
using Syndic.Modules.Ged.Domain.Entities;
using Syndic.Modules.Ged.Persistence.Configurations;
using Syndic.Modules.Identity.Domain.Entities;
using Syndic.Modules.Maintenance.Domain.Entities;
using Syndic.Modules.Maintenance.Persistence.Configurations;
using Syndic.Modules.Notification.Domain.Entities;
using Syndic.Modules.Notification.Persistence.Configurations;
using Syndic.Modules.Paiement.Domain.Entities;
using Syndic.Modules.Paiement.Persistence.Configurations;
using Syndic.Shared.Domain;

namespace Syndic.Api.Infrastructure.Persistence;

public class SyndicDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public SyndicDbContext(DbContextOptions<SyndicDbContext> options) : base(options) { }

    // Module Copropriété
    public DbSet<Residence> Residences => Set<Residence>();
    public DbSet<GroupeHabitation> GroupesHabitation => Set<GroupeHabitation>();
    public DbSet<Immeuble> Immeubles => Set<Immeuble>();
    public DbSet<Lot> Lots => Set<Lot>();
    public DbSet<Resident> Residents => Set<Resident>();
    public DbSet<LotResident> LotResidents => Set<LotResident>();

    // Module Paiement
    public DbSet<Paiement> Paiements => Set<Paiement>();
    public DbSet<AjustementSolde> AjustementsSolde => Set<AjustementSolde>();

    // Module Notification
    public DbSet<PreferencesNotification> PreferencesNotification => Set<PreferencesNotification>();
    public DbSet<Device> Devices => Set<Device>();
    public DbSet<NotificationLog> NotificationsLog => Set<NotificationLog>();

    // Module Assemblées
    public DbSet<Assemblee> Assemblees => Set<Assemblee>();

    // Module Maintenance
    public DbSet<Signalement> Signalements => Set<Signalement>();
    public DbSet<MaintenancePlanifiee> MaintenancesPlanifiees => Set<MaintenancePlanifiee>();

    // Module GED
    public DbSet<Document> Documents => Set<Document>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ResidenceConfiguration).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PaiementConfiguration).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PreferencesNotificationConfiguration).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AssembleeConfiguration).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SignalementConfiguration).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DocumentConfiguration).Assembly);

        // Convention snake_case pour les colonnes d'audit de BaseEntity
        foreach (var entityType in modelBuilder.Model.GetEntityTypes()
            .Where(t => typeof(BaseEntity).IsAssignableFrom(t.ClrType)))
        {
            modelBuilder.Entity(entityType.ClrType, b =>
            {
                b.Property("Id").HasColumnName("id");
                b.Property("CreatedAt").HasColumnName("created_at");
                b.Property("UpdatedAt").HasColumnName("updated_at");
            });
        }
    }
}
