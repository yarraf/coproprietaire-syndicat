using Syndic.Modules.Copropriete.Domain.Enums;
using Syndic.Shared.Domain;

namespace Syndic.Modules.Copropriete.Domain.Entities;

public class Lot : BaseEntity
{
    private Lot() { }

    public Guid ImmeubleId { get; private set; }
    public Immeuble Immeuble { get; private set; } = null!;
    public string Number { get; private set; } = null!;
    public LotType Type { get; private set; }
    public int Floor { get; private set; }
    public decimal? Area { get; private set; }
    /// <summary>Solde courant du lot : positif = le résident doit de l'argent, négatif = avance.</summary>
    public decimal Balance { get; private set; }

    private readonly List<LotResident> _lotResidents = [];
    public IReadOnlyCollection<LotResident> LotResidents => _lotResidents.AsReadOnly();

    public static Lot Create(Guid immeubleId, string number, LotType type, int floor, decimal? area = null)
    {
        if (immeubleId == Guid.Empty) throw new ArgumentException("ImmeubleId invalide.", nameof(immeubleId));
        ArgumentException.ThrowIfNullOrWhiteSpace(number);

        return new Lot
        {
            ImmeubleId = immeubleId,
            Number = number.Trim(),
            Type = type,
            Floor = floor,
            Area = area,
            Balance = 0m
        };
    }

    public void ApplyBalanceAdjustment(decimal amount)
    {
        Balance += amount;
        SetUpdated();
    }

    public void Update(string number, LotType type, int floor, decimal? area)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(number);
        Number = number.Trim();
        Type = type;
        Floor = floor;
        Area = area;
        SetUpdated();
    }
}
