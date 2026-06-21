using Syndic.Modules.Paiement.Domain.Enums;
using Syndic.Shared.Domain;

namespace Syndic.Modules.Paiement.Domain.Entities;

public class Paiement : BaseEntity
{
    private Paiement() { }

    public Guid LotId { get; private set; }
    public Guid ResidentId { get; private set; }
    public decimal Montant { get; private set; }
    public string Periode { get; private set; } = null!;
    public string ModePaiement { get; private set; } = null!;
    public string? JustificatifPath { get; private set; }
    public PaymentStatus Statut { get; private set; }
    public Guid? ValidePar { get; private set; }
    public DateTimeOffset? DateValidation { get; private set; }
    public string? MotifRejet { get; private set; }

    public static Paiement Create(
        Guid lotId,
        Guid residentId,
        decimal montant,
        string periode,
        string modePaiement,
        string? justificatifPath)
    {
        if (lotId == Guid.Empty) throw new ArgumentException("LotId invalide.", nameof(lotId));
        if (residentId == Guid.Empty) throw new ArgumentException("ResidentId invalide.", nameof(residentId));
        if (montant <= 0) throw new ArgumentException("Le montant doit être positif.", nameof(montant));
        ArgumentException.ThrowIfNullOrWhiteSpace(periode);
        ArgumentException.ThrowIfNullOrWhiteSpace(modePaiement);

        return new Paiement
        {
            LotId = lotId,
            ResidentId = residentId,
            Montant = montant,
            Periode = periode.Trim(),
            ModePaiement = modePaiement.Trim(),
            JustificatifPath = justificatifPath,
            Statut = PaymentStatus.EnAttente
        };
    }

    public void Valider(Guid agentId)
    {
        if (Statut != PaymentStatus.EnAttente)
            throw new InvalidOperationException("Seul un paiement en attente peut être validé.");

        Statut = PaymentStatus.Valide;
        ValidePar = agentId;
        DateValidation = DateTimeOffset.UtcNow;
        SetUpdated();
    }

    public void Rejeter(string motif)
    {
        if (Statut != PaymentStatus.EnAttente)
            throw new InvalidOperationException("Seul un paiement en attente peut être rejeté.");
        ArgumentException.ThrowIfNullOrWhiteSpace(motif);

        Statut = PaymentStatus.Rejete;
        MotifRejet = motif.Trim();
        SetUpdated();
    }
}
