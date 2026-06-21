using Syndic.Shared.Domain;

namespace Syndic.Modules.Copropriete.Domain.Entities;

public class Immeuble : BaseEntity
{
    private Immeuble() { }

    public Guid GroupeHabitationId { get; private set; }
    public GroupeHabitation GroupeHabitation { get; private set; } = null!;
    public string BlockName { get; private set; } = null!;
    public string? Address { get; private set; }
    public int NbFloors { get; private set; }

    private readonly List<Lot> _lots = [];
    public IReadOnlyCollection<Lot> Lots => _lots.AsReadOnly();

    public static Immeuble Create(Guid groupeHabitationId, string blockName, int nbFloors, string? address = null)
    {
        if (groupeHabitationId == Guid.Empty) throw new ArgumentException("GroupeHabitationId invalide.", nameof(groupeHabitationId));
        ArgumentException.ThrowIfNullOrWhiteSpace(blockName);
        if (nbFloors < 0) throw new ArgumentOutOfRangeException(nameof(nbFloors), "Le nombre d'étages doit être positif ou nul.");

        return new Immeuble
        {
            GroupeHabitationId = groupeHabitationId,
            BlockName = blockName.Trim(),
            NbFloors = nbFloors,
            Address = address?.Trim()
        };
    }

    public void Update(string blockName, int nbFloors, string? address)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(blockName);
        BlockName = blockName.Trim();
        NbFloors = nbFloors;
        Address = address?.Trim();
        SetUpdated();
    }
}
