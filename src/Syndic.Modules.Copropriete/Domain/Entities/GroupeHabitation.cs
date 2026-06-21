using Syndic.Shared.Domain;

namespace Syndic.Modules.Copropriete.Domain.Entities;

public class GroupeHabitation : BaseEntity
{
    private GroupeHabitation() { }

    public Guid ResidenceId { get; private set; }
    public Residence Residence { get; private set; } = null!;
    public string Name { get; private set; } = null!;

    private readonly List<Immeuble> _immeubles = [];
    public IReadOnlyCollection<Immeuble> Immeubles => _immeubles.AsReadOnly();

    public static GroupeHabitation Create(Guid residenceId, string name)
    {
        if (residenceId == Guid.Empty) throw new ArgumentException("ResidenceId invalide.", nameof(residenceId));
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        return new GroupeHabitation { ResidenceId = residenceId, Name = name.Trim() };
    }

    public void Update(string name)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        Name = name.Trim();
        SetUpdated();
    }
}
