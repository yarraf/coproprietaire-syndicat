using Syndic.Modules.Ged.Domain.Enums;
using Syndic.Shared.Domain;

namespace Syndic.Modules.Ged.Domain.Entities;

public class Document : BaseEntity
{
    private Document() { }

    public Guid? ResidenceId { get; private set; }
    public Guid? ImmeubleId { get; private set; }
    public DocumentType Type { get; private set; }
    public string Titre { get; private set; } = null!;
    public string FichierPath { get; private set; } = null!;
    public DateOnly Date { get; private set; }
    public bool VisibleResidents { get; private set; }

    public static Document Create(
        Guid? residenceId,
        Guid? immeubleId,
        DocumentType type,
        string titre,
        string fichierPath,
        DateOnly date,
        bool visibleResidents)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(titre);
        ArgumentException.ThrowIfNullOrWhiteSpace(fichierPath);

        return new Document
        {
            ResidenceId = residenceId,
            ImmeubleId = immeubleId,
            Type = type,
            Titre = titre.Trim(),
            FichierPath = fichierPath,
            Date = date,
            VisibleResidents = visibleResidents
        };
    }

    public void Update(string titre, bool visibleResidents)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(titre);
        Titre = titre.Trim();
        VisibleResidents = visibleResidents;
        SetUpdated();
    }
}
