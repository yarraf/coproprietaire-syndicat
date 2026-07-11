using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Syndic.Api.Infrastructure.Persistence;
using Syndic.Modules.Copropriete.Application.DTOs;
using Syndic.Modules.Copropriete.Application.Services;
using Syndic.Modules.Copropriete.Domain.Entities;
using Syndic.Modules.Identity.Domain.Constants;
using Syndic.Modules.Identity.Domain.Entities;

namespace Syndic.Api.Modules.Copropriete.Services;

public sealed class ResidentService(SyndicDbContext db, UserManager<ApplicationUser> userManager) : IResidentService
{
    public async Task<IReadOnlyList<ResidentResponse>> GetAllResidentsAsync(CancellationToken ct = default)
    {
        var residents = await db.Residents
            .AsNoTracking()
            .OrderBy(r => r.LastName)
            .ThenBy(r => r.FirstName)
            .ToListAsync(ct);

        return residents.Select(ToResponse).ToList();
    }

    public async Task<ResidentResponse> GetResidentByIdAsync(Guid id, CancellationToken ct = default)
    {
        var resident = await db.Residents
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw new KeyNotFoundException("Résident introuvable.");

        return ToResponse(resident);
    }

    public async Task<ResidentResponse> CreateResidentAsync(CreateResidentRequest request, CancellationToken ct = default)
    {
        var emailExists = await db.Residents.AnyAsync(r => r.Email == request.Email.ToLowerInvariant(), ct);
        if (emailExists)
            throw new InvalidOperationException("Un résident avec cet email existe déjà.");

        var resident = Resident.Create(request.LastName, request.FirstName, request.Email, request.Type, request.Phone);
        db.Residents.Add(resident);
        await db.SaveChangesAsync(ct);
        return ToResponse(resident);
    }

    public async Task<ResidentResponse> UpdateResidentAsync(Guid id, UpdateResidentRequest request, CancellationToken ct = default)
    {
        var resident = await db.Residents.FindAsync([id], ct)
            ?? throw new KeyNotFoundException("Résident introuvable.");

        if (!string.Equals(resident.Email, request.Email.Trim().ToLowerInvariant(), StringComparison.Ordinal))
        {
            var emailExists = await db.Residents
                .AnyAsync(r => r.Email == request.Email.ToLowerInvariant() && r.Id != id, ct);
            if (emailExists)
                throw new InvalidOperationException("Un résident avec cet email existe déjà.");
        }

        resident.Update(request.LastName, request.FirstName, request.Email, request.Phone, request.Type);
        await db.SaveChangesAsync(ct);
        return ToResponse(resident);
    }

    public async Task DeactivateResidentAsync(Guid id, CancellationToken ct = default)
    {
        var resident = await db.Residents.FindAsync([id], ct)
            ?? throw new KeyNotFoundException("Résident introuvable.");

        resident.Deactivate();
        await db.SaveChangesAsync(ct);
    }

    public async Task<InvitationResponse> InviteResidentAsync(Guid residentId, CancellationToken ct = default)
    {
        var resident = await db.Residents.FindAsync([residentId], ct)
            ?? throw new KeyNotFoundException("Résident introuvable.");

        if (resident.IsAccountActivated)
            throw new InvalidOperationException("Le compte de ce résident est déjà activé.");

        var existingUser = await userManager.FindByEmailAsync(resident.Email);

        ApplicationUser user;
        if (existingUser is not null)
        {
            // Compte déjà activé → bloquer
            if (existingUser.EmailConfirmed)
                throw new InvalidOperationException("Le compte de ce résident est déjà activé.");

            // Compte existant mais non activé → régénérer un nouveau token
            user = existingUser;
        }
        else
        {
            // Premier envoi → créer le compte Identity
            user = new ApplicationUser
            {
                UserName       = resident.Email,
                Email          = resident.Email,
                EmailConfirmed = false,
                ResidentId     = resident.Id
            };

            var createResult = await userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Échec de la création du compte : {errors}");
            }

            await userManager.AddToRoleAsync(user, Roles.Resident);
        }

        var token     = await userManager.GeneratePasswordResetTokenAsync(user);
        var expiresAt = DateTimeOffset.UtcNow.AddDays(1);

        return new InvitationResponse(resident.Email, token, expiresAt);
    }

    public async Task ActivateResidentAsync(Guid residentId, Guid userId, CancellationToken ct = default)
    {
        var resident = await db.Residents.FindAsync([residentId], ct)
            ?? throw new KeyNotFoundException("Résident introuvable.");

        resident.ActivateAccount(userId);
        await db.SaveChangesAsync(ct);
    }

    // ── Mapping ───────────────────────────────────────────────────────────────

    private static ResidentResponse ToResponse(Resident r) => new(
        r.Id, r.LastName, r.FirstName, r.Email, r.Phone,
        r.Type, r.Status, r.IsAccountActivated, r.CreatedAt);
}
