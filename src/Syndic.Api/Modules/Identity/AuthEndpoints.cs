using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Syndic.Modules.Copropriete.Application.Services;
using Syndic.Modules.Identity.Domain.Constants;
using Syndic.Modules.Identity.Domain.Entities;

namespace Syndic.Api.Modules.Identity;

public static class AuthEndpoints
{
    public record LoginRequest(string Email, string Password);
    public record SetPasswordRequest(string Email, string Token, string NewPassword);
    public record RegisterAgentRequest(string Email, string Password, string Nom, string Prenom);
    public record RefreshRequest(string RefreshToken);
    public record AuthResponse(string AccessToken, string RefreshToken, DateTimeOffset ExpiresAt, string Role);
    public record MobileUser(string Id, string Email, string FirstName, string LastName, string[] Roles, string? ResidentId);
    public record MobileAuthResponse(string AccessToken, string RefreshToken, int ExpiresIn, MobileUser User);

    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").AllowAnonymous();

        // ── Créer un compte agent (dev / premier démarrage) ──────────────────
        group.MapPost("/register-agent", async (
            RegisterAgentRequest req,
            UserManager<ApplicationUser> userManager,
            IConfiguration config) =>
        {
            var existing = await userManager.FindByEmailAsync(req.Email);
            if (existing is not null)
                return Results.Conflict("Un compte avec cet email existe déjà.");

            var user = new ApplicationUser
            {
                UserName       = req.Email,
                Email          = req.Email,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(user, req.Password);
            if (!result.Succeeded)
                return Results.BadRequest(result.Errors.Select(e => e.Description));

            await userManager.AddToRoleAsync(user, Roles.Agent);

            var response = await BuildTokenAsync(user, [Roles.Agent], config);
            return Results.Ok(response);
        })
        .WithName("RegisterAgent");

        // ── Connexion ─────────────────────────────────────────────────────────
        group.MapPost("/login", async (
            LoginRequest req,
            UserManager<ApplicationUser> userManager,
            IConfiguration config) =>
        {
            var user = await userManager.FindByEmailAsync(req.Email);
            if (user is null || !await userManager.CheckPasswordAsync(user, req.Password))
                return Results.Unauthorized();

            var roles = await userManager.GetRolesAsync(user);
            var response = await BuildTokenAsync(user, roles, config, userManager);
            return Results.Ok(response);
        })
        .WithName("Login");

        // ── Connexion Mobile (Résidents uniquement) ──────────────────────────────
        group.MapPost("/login-mobile", async (
            LoginRequest req,
            UserManager<ApplicationUser> userManager,
            IResidentService residentService,
            IConfiguration config,
            CancellationToken ct) =>
        {
            var user = await userManager.FindByEmailAsync(req.Email);
            if (user is null || !await userManager.CheckPasswordAsync(user, req.Password))
                return Results.Unauthorized();

            var roles = await userManager.GetRolesAsync(user);
            if (!roles.Contains(Roles.Resident))
                return Results.Forbid();

            if (!user.ResidentId.HasValue)
                return Results.Problem(
                    statusCode: 403,
                    title: "Compte non activé",
                    detail: "Votre compte résident n'a pas encore été activé.");

            var resident = await residentService.GetResidentByIdAsync(user.ResidentId.Value, ct);

            var jwtSettings    = config.GetSection("JwtSettings");
            var expiresMinutes = int.TryParse(jwtSettings["ExpiresMinutes"], out var m) ? m : 60;

            var response = await BuildTokenAsync(user, roles, config, userManager);

            return Results.Ok(new MobileAuthResponse(
                response.AccessToken,
                response.RefreshToken,
                expiresMinutes * 60,
                new MobileUser(
                    user.Id.ToString(),
                    user.Email!,
                    resident.FirstName,
                    resident.LastName,
                    [.. roles],
                    user.ResidentId?.ToString())));
        })
        .WithName("LoginMobile");

        // ── Définir le mot de passe (activation compte résident via invitation) ─
        group.MapPost("/set-password", async (
            SetPasswordRequest req,
            UserManager<ApplicationUser> userManager,
            IResidentService residentService,
            IConfiguration config,
            CancellationToken ct) =>
        {
            var user = await userManager.FindByEmailAsync(req.Email);
            if (user is null)
                return Results.NotFound("Utilisateur introuvable.");

            var result = await userManager.ResetPasswordAsync(user, req.Token, req.NewPassword);
            if (!result.Succeeded)
                return Results.BadRequest(result.Errors.Select(e => e.Description));

            user.EmailConfirmed = true;
            await userManager.UpdateAsync(user);

            if (user.ResidentId.HasValue)
                await residentService.ActivateResidentAsync(user.ResidentId.Value, user.Id, ct);

            var roles = await userManager.GetRolesAsync(user);
            var response = await BuildTokenAsync(user, roles, config, userManager);
            return Results.Ok(response);
        })
        .WithName("SetPassword");

        // ── Rafraîchir le token ───────────────────────────────────────────────
        group.MapPost("/refresh", async (
            RefreshRequest req,
            UserManager<ApplicationUser> userManager,
            IConfiguration config) =>
        {
            var user = userManager.Users.FirstOrDefault(u =>
                u.RefreshToken == req.RefreshToken &&
                u.RefreshTokenExpiresAt > DateTimeOffset.UtcNow);

            if (user is null)
                return Results.Unauthorized();

            var roles = await userManager.GetRolesAsync(user);
            var response = await BuildTokenAsync(user, roles, config, userManager);
            return Results.Ok(response);
        })
        .WithName("RefreshToken");

        return app;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static async Task<AuthResponse> BuildTokenAsync(
        ApplicationUser user,
        IList<string> roles,
        IConfiguration config,
        UserManager<ApplicationUser>? userManager = null)
    {
        var jwtSettings  = config.GetSection("JwtSettings");
        var secretKey    = jwtSettings["SecretKey"]!;
        var issuer       = jwtSettings["Issuer"]!;
        var audience     = jwtSettings["Audience"]!;
        var expiresMinutes = int.TryParse(jwtSettings["ExpiresMinutes"], out var m) ? m : 60;

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub,   user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email!),
            new(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
        };

        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        if (user.ResidentId.HasValue)
            claims.Add(new Claim("resident_id", user.ResidentId.Value.ToString()));

        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTimeOffset.UtcNow.AddMinutes(expiresMinutes);

        var token = new JwtSecurityToken(
            issuer:   issuer,
            audience: audience,
            claims:   claims,
            expires:  expiry.UtcDateTime,
            signingCredentials: creds);

        var accessToken   = new JwtSecurityTokenHandler().WriteToken(token);
        var refreshToken  = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        if (userManager is not null)
        {
            user.RefreshToken          = refreshToken;
            user.RefreshTokenExpiresAt = DateTimeOffset.UtcNow.AddDays(30);
            await userManager.UpdateAsync(user);
        }

        return new AuthResponse(accessToken, refreshToken, expiry, roles.FirstOrDefault() ?? "");
    }
}
