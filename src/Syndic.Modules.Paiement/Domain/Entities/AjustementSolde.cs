using Syndic.Modules.Paiement.Domain.Enums;
using Syndic.Shared.Domain;

namespace Syndic.Modules.Paiement.Domain.Entities;

public class AjustementSolde : BaseEntity
{
    private AjustementSolde() { }

    public Guid LotId { get; private set; }
    public decimal Montant { get; private set; }
    public AjustementType Type { get; private set; }
    public string Libelle { get; private set; } = null!;
    public string Periode { get; private set; } = null!;
    public Guid CreePar { get; private set; }

    public static AjustementSolde Create(
        Guid lotId,
        decimal montant,
        AjustementType type,
        string libelle,
        string periode,
        Guid creePar)
    {
        if (lotId == Guid.Empty) throw new ArgumentException("LotId invalide.", nameof(lotId));
        if (montant == 0) throw new ArgumentException("Le montant ne peut pas être zéro.", nameof(montant));
        ArgumentException.ThrowIfNullOrWhiteSpace(libelle);
        ArgumentException.ThrowIfNullOrWhiteSpace(periode);
        if (creePar == Guid.Empty) throw new ArgumentException("CreePar invalide.", nameof(creePar));

        return new AjustementSolde
        {
            LotId = lotId,
            Montant = montant,
            Type = type,
            Libelle = libelle.Trim(),
            Periode = periode.Trim(),
            CreePar = creePar
        };
    }
}
