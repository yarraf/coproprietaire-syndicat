namespace Syndic.Modules.Assemblees.Application.DTOs;

public record AssembleeResponse(
    Guid Id,
    Guid ResidenceId,
    string Titre,
    DateTimeOffset Date,
    string Lieu,
    string OrdreDuJour,
    string Statut,
    Guid? PvDocumentId,
    DateTimeOffset CreatedAt);

public record CreerAssembleeRequest(
    Guid ResidenceId,
    string Titre,
    DateTimeOffset Date,
    string Lieu,
    string OrdreDuJour);

public record ModifierAssembleeRequest(
    string Titre,
    DateTimeOffset Date,
    string Lieu,
    string OrdreDuJour);
