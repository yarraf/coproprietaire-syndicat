using Syndic.Modules.Assemblees.Domain.Enums;
using Syndic.Shared.Domain;

namespace Syndic.Modules.Assemblees.Domain.Entities;

public class Assemblee : BaseEntity
{
    private Assemblee() { }

    public Guid ResidenceId { get; private set; }
    public string Titre { get; private set; } = null!;
    public DateTimeOffset Date { get; private set; }
    public string Lieu { get; private set; } = null!;
    public string OrdreDuJour { get; private set; } = null!;
    public AssembleeStatut Statut { get; private set; }
    public Guid? PvDocumentId { get; private set; }

    public static Assemblee Create(Guid residenceId, string titre, DateTimeOffset date, string lieu, string ordreDuJour)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(titre);
        ArgumentException.ThrowIfNullOrWhiteSpace(lieu);
        ArgumentException.ThrowIfNullOrWhiteSpace(ordreDuJour);

        return new Assemblee
        {
            ResidenceId = residenceId,
            Titre = titre.Trim(),
            Date = date,
            Lieu = lieu.Trim(),
            OrdreDuJour = ordreDuJour.Trim(),
            Statut = AssembleeStatut.Planifiee
        };
    }

    public void Update(string titre, DateTimeOffset date, string lieu, string ordreDuJour)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(titre);
        Titre = titre.Trim();
        Date = date;
        Lieu = lieu.Trim();
        OrdreDuJour = ordreDuJour.Trim();
        SetUpdated();
    }

    public void Tenir()
    {
        Statut = AssembleeStatut.Tenue;
        SetUpdated();
    }

    public void Annuler()
    {
        Statut = AssembleeStatut.Annulee;
        SetUpdated();
    }

    public void AttacherPv(Guid documentId)
    {
        PvDocumentId = documentId;
        Statut = AssembleeStatut.Tenue;
        SetUpdated();
    }
}
