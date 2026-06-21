using Syndic.Modules.Paiement.Domain.Enums;

namespace Syndic.Modules.Paiement.Application.DTOs;

public record PaiementResponse(
    Guid Id,
    Guid LotId,
    Guid ResidentId,
    decimal Montant,
    string Periode,
    string ModePaiement,
    string? JustificatifPath,
    string Statut,
    Guid? ValidePar,
    DateTimeOffset? DateValidation,
    string? MotifRejet,
    DateTimeOffset CreatedAt);

public record RejeterPaiementRequest(string MotifRejet);

public record CreerAjustementRequest(
    Guid LotId,
    decimal Montant,
    AjustementType Type,
    string Libelle,
    string Periode);

public record AjustementSoldeResponse(
    Guid Id,
    Guid LotId,
    decimal Montant,
    string Type,
    string Libelle,
    string Periode,
    Guid CreePar,
    DateTimeOffset CreatedAt);
