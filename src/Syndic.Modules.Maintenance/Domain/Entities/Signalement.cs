using Syndic.Modules.Maintenance.Domain.Enums;
using Syndic.Shared.Domain;

namespace Syndic.Modules.Maintenance.Domain.Entities;

public class Signalement : BaseEntity
{
    private Signalement() { }

    public SignalementType Type { get; private set; }
    public Guid? LotId { get; private set; }
    public Guid? ImmeubleId { get; private set; }
    public Guid ResidentId { get; private set; }
    public string Titre { get; private set; } = null!;
    public string Description { get; private set; } = null!;
    public string? PhotoPath { get; private set; }
    public SignalementStatut Statut { get; private set; }
    public Guid? AssigneA { get; private set; }
    public string? Reponse { get; private set; }

    public static Signalement Create(
        SignalementType type,
        Guid? lotId,
        Guid? immeubleId,
        Guid residentId,
        string titre,
        string description,
        string? photoPath)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(titre);
        ArgumentException.ThrowIfNullOrWhiteSpace(description);

        return new Signalement
        {
            Type = type,
            LotId = lotId,
            ImmeubleId = immeubleId,
            ResidentId = residentId,
            Titre = titre.Trim(),
            Description = description.Trim(),
            PhotoPath = photoPath,
            Statut = SignalementStatut.Recu
        };
    }

    public void MettreAJour(SignalementStatut statut, string? reponse, Guid? assigneA)
    {
        Statut = statut;
        Reponse = reponse;
        AssigneA = assigneA;
        SetUpdated();
    }
}
