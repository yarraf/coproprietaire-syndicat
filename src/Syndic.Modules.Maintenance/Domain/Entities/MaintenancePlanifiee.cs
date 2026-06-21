using Syndic.Modules.Maintenance.Domain.Enums;
using Syndic.Shared.Domain;

namespace Syndic.Modules.Maintenance.Domain.Entities;

public class MaintenancePlanifiee : BaseEntity
{
    private MaintenancePlanifiee() { }

    public Guid ResidenceId { get; private set; }
    public Guid? ImmeubleId { get; private set; }
    public string Type { get; private set; } = null!;
    public string Libelle { get; private set; } = null!;
    public DateTimeOffset DatePrevue { get; private set; }
    public string? Recurrence { get; private set; }
    public MaintenanceStatut Statut { get; private set; }
    public bool VisibleResidents { get; private set; }

    public static MaintenancePlanifiee Create(
        Guid residenceId,
        Guid? immeubleId,
        string type,
        string libelle,
        DateTimeOffset datePrevue,
        string? recurrence,
        bool visibleResidents)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(type);
        ArgumentException.ThrowIfNullOrWhiteSpace(libelle);

        return new MaintenancePlanifiee
        {
            ResidenceId = residenceId,
            ImmeubleId = immeubleId,
            Type = type.Trim(),
            Libelle = libelle.Trim(),
            DatePrevue = datePrevue,
            Recurrence = recurrence,
            Statut = MaintenanceStatut.AVenir,
            VisibleResidents = visibleResidents
        };
    }

    public void Modifier(string type, string libelle, DateTimeOffset datePrevue, string? recurrence, bool visibleResidents)
    {
        Type = type.Trim();
        Libelle = libelle.Trim();
        DatePrevue = datePrevue;
        Recurrence = recurrence;
        VisibleResidents = visibleResidents;
        SetUpdated();
    }

    public void ChangerStatut(MaintenanceStatut statut)
    {
        Statut = statut;
        SetUpdated();
    }
}
