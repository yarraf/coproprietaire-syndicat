using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Syndic.Api.Infrastructure;
using Syndic.Api.Infrastructure.Persistence;
using Syndic.Api.Modules.Assemblees;
using Syndic.Api.Modules.Copropriete;
using Syndic.Api.Modules.Ged;
using Syndic.Api.Modules.Identity;
using Syndic.Api.Modules.Maintenance;
using Syndic.Api.Modules.Notification;
using Syndic.Api.Modules.Paiement;
using Syndic.Modules.Assemblees;
using Syndic.Modules.Copropriete;
using Syndic.Modules.Ged;
using Syndic.Modules.Identity.Domain.Entities;
using Syndic.Modules.Maintenance;
using Syndic.Modules.Notification;
using Syndic.Modules.Paiement;

var builder = WebApplication.CreateBuilder(args);

// ── Serilog ────────────────────────────────────────────────────────────────
builder.Host.UseSerilog((ctx, lc) => lc
    .ReadFrom.Configuration(ctx.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/syndic-.log", rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 30));

// ── DataProtection (persistance des clés pour les tokens Identity) ────────
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(
        Path.Combine(builder.Environment.ContentRootPath, "keys")))
    .SetApplicationName("SyndicApp");

// ── EF Core + PostgreSQL ───────────────────────────────────────────────────
builder.Services.AddDbContext<SyndicDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── ASP.NET Core Identity ──────────────────────────────────────────────────
builder.Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<SyndicDbContext>()
.AddDefaultTokenProviders();

// ── JWT Authentication ─────────────────────────────────────────────────────
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"]
    ?? throw new InvalidOperationException("JwtSettings:SecretKey manquant dans la configuration.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// ── Modules ────────────────────────────────────────────────────────────────
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddCoproprieteModule();
builder.Services.AddPaiementModule();
builder.Services.AddNotificationModule();
builder.Services.AddGedModule();
builder.Services.AddAssembleesModule();
builder.Services.AddMaintenanceModule();

// ── MediatR ────────────────────────────────────────────────────────────────
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssemblyContaining<Program>();
    cfg.RegisterServicesFromAssembly(typeof(CoproprieteModule).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(PaiementModule).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(NotificationModule).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(AssembleesModule).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(MaintenanceModule).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GedModule).Assembly);
});

// ── CORS ───────────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
    options.AddPolicy("SyndicCors", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()));

// ── JSON — enums en string pour toute l'API ────────────────────────────────
builder.Services.ConfigureHttpJsonOptions(o =>
    o.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// ── Controllers + Swagger ──────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(o =>
        o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Syndic API",
        Version = "v1",
        Description = "API de gestion de syndic de copropriété (Maroc — loi 18-00)"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Bearer token. Exemple : Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            []
        }
    });
});

// ── Build ──────────────────────────────────────────────────────────────────
var app = builder.Build();

// ── Amorçage des rôles ─────────────────────────────────────────────────────
await app.Services.SeedRolesAsync();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Syndic API v1"));
}

app.UseExceptionHandler();
app.UseSerilogRequestLogging();
app.UseCors("SyndicCors");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapAuthEndpoints();
app.MapCoproprieteEndpoints();
app.MapPaiementEndpoints();
app.MapNotificationEndpoints();
app.MapGedEndpoints();
app.MapAssembleesEndpoints();
app.MapMaintenanceEndpoints();

app.Run();

// Rend le type accessible pour Microsoft.AspNetCore.Mvc.Testing
public partial class Program { }
