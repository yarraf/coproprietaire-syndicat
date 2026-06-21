using Syndic.Shared.Domain;

namespace Syndic.Modules.Copropriete.Domain.Entities;

public class Residence : BaseEntity
{
    private Residence() { }

    public string Name { get; private set; } = null!;
    public string Address { get; private set; } = null!;
    public string City { get; private set; } = null!;

    private readonly List<GroupeHabitation> _groupesHabitation = [];
    public IReadOnlyCollection<GroupeHabitation> GroupesHabitation => _groupesHabitation.AsReadOnly();

    public static Residence Create(string name, string address, string city)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(address);
        ArgumentException.ThrowIfNullOrWhiteSpace(city);

        return new Residence
        {
            Name = name.Trim(),
            Address = address.Trim(),
            City = city.Trim()
        };
    }

    public void Update(string name, string address, string city)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(address);
        ArgumentException.ThrowIfNullOrWhiteSpace(city);

        Name = name.Trim();
        Address = address.Trim();
        City = city.Trim();
        SetUpdated();
    }
}
