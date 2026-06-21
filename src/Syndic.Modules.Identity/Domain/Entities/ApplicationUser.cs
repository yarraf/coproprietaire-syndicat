using Microsoft.AspNetCore.Identity;

namespace Syndic.Modules.Identity.Domain.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    /// <summary>Lien vers l'entité Resident du module Copropriété (null jusqu'à activation du compte).</summary>
    public Guid? ResidentId { get; set; }
    public string? RefreshToken { get; set; }
    public DateTimeOffset? RefreshTokenExpiresAt { get; set; }
}
