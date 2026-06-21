using Syndic.Modules.Copropriete.Domain.Enums;
using Syndic.Shared.Domain;

namespace Syndic.Modules.Copropriete.Domain.Entities;

public class Resident : BaseEntity
{
    private Resident() { }

    public string LastName { get; private set; } = null!;
    public string FirstName { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public string? Phone { get; private set; }
    public ResidentType Type { get; private set; }
    public ResidentStatus Status { get; private set; }
    public bool IsAccountActivated { get; private set; }
    /// <summary>Lien vers ApplicationUser (Identity), null jusqu'à activation via invitation.</summary>
    public Guid? UserId { get; private set; }

    private readonly List<LotResident> _lotResidents = [];
    public IReadOnlyCollection<LotResident> LotResidents => _lotResidents.AsReadOnly();

    public static Resident Create(string lastName, string firstName, string email, ResidentType type, string? phone = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(lastName);
        ArgumentException.ThrowIfNullOrWhiteSpace(firstName);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);

        return new Resident
        {
            LastName = lastName.Trim(),
            FirstName = firstName.Trim(),
            Email = email.Trim().ToLowerInvariant(),
            Phone = phone?.Trim(),
            Type = type,
            Status = ResidentStatus.Active,
            IsAccountActivated = false
        };
    }

    public void ActivateAccount(Guid userId)
    {
        if (IsAccountActivated) throw new InvalidOperationException("Le compte est déjà activé.");
        UserId = userId;
        IsAccountActivated = true;
        SetUpdated();
    }

    public void Deactivate()
    {
        Status = ResidentStatus.Inactive;
        SetUpdated();
    }

    public void Update(string lastName, string firstName, string email, string? phone, ResidentType type)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(lastName);
        ArgumentException.ThrowIfNullOrWhiteSpace(firstName);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);

        LastName = lastName.Trim();
        FirstName = firstName.Trim();
        Email = email.Trim().ToLowerInvariant();
        Phone = phone?.Trim();
        Type = type;
        SetUpdated();
    }
}
