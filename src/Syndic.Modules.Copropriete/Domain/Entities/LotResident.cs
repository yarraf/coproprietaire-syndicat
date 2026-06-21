using Syndic.Modules.Copropriete.Domain.Enums;
using Syndic.Shared.Domain;

namespace Syndic.Modules.Copropriete.Domain.Entities;

public class LotResident : BaseEntity
{
    private LotResident() { }

    public Guid LotId { get; private set; }
    public Lot Lot { get; private set; } = null!;
    public Guid ResidentId { get; private set; }
    public Resident Resident { get; private set; } = null!;
    public ResidentType Type { get; private set; }
    public DateOnly StartDate { get; private set; }
    public DateOnly? EndDate { get; private set; }

    public bool IsActive => !EndDate.HasValue || EndDate.Value >= DateOnly.FromDateTime(DateTime.UtcNow);

    public static LotResident Create(Guid lotId, Guid residentId, ResidentType type, DateOnly startDate)
    {
        if (lotId == Guid.Empty) throw new ArgumentException("LotId invalide.", nameof(lotId));
        if (residentId == Guid.Empty) throw new ArgumentException("ResidentId invalide.", nameof(residentId));

        return new LotResident
        {
            LotId = lotId,
            ResidentId = residentId,
            Type = type,
            StartDate = startDate
        };
    }

    public void Terminate(DateOnly endDate)
    {
        if (EndDate.HasValue) throw new InvalidOperationException("Cette liaison lot–résident est déjà terminée.");
        if (endDate < StartDate) throw new ArgumentException("La date de fin ne peut pas être antérieure à la date de début.");
        EndDate = endDate;
        SetUpdated();
    }
}
