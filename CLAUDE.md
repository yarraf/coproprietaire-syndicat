# Syndic App — Contexte projet

## Description
Application de gestion de syndic de copropriété au Maroc (loi 18-00 / 106-12).
Deux interfaces : Back Office web (agents syndic) + App mobile (résidents copropriétaires).

## Cahier des charges
Le fichier `docs/cahier-des-charges-mvp-syndic.md` contient les spécifications complètes du MVP.
Le fichier `docs/diagramme-cas-utilisation.svg` contient le diagramme UML des cas d'utilisation.
**Toujours s'y référer avant d'implémenter un module.**

## Architecture
- **Monolithe modulaire .NET 10 (C# 14)** — ASP.NET Core Web API
- **Modules** : Identity, Copropriété, Paiement, Assemblées, Maintenance, GED, Notification
- **Communication inter-modules** : interfaces injectées (synchrone) + MediatR (événements internes)
- **Un seul DbContext EF Core** — une base PostgreSQL, schéma unique
- **Auth** : ASP.NET Core Identity + JWT
- **Jobs de fond** : BackgroundService / Hangfire
- **Fichiers** : filesystem (volume Docker) + métadonnées en base (colonnes *_path)
- **Notifications** : push uniquement (Expo / FCM-APNs) au MVP

## Structure de la solution
```
Syndic.sln
├── src/
│   ├── Syndic.Api/                    # Hôte Web API (Program.cs, DI, middleware, Swagger)
│   ├── Syndic.Modules.Identity/       # Auth, comptes, rôles, invitations
│   ├── Syndic.Modules.Copropriete/    # Résidences, GH, immeubles, lots, résidents
│   ├── Syndic.Modules.Paiement/       # Paiements, ajustements solde, justificatifs
│   ├── Syndic.Modules.Assemblees/     # AG, convocations, PV
│   ├── Syndic.Modules.Maintenance/    # Signalements, maintenance planifiée
│   ├── Syndic.Modules.Ged/            # Documents (règlement, PV archivés)
│   ├── Syndic.Modules.Notification/   # Push, préférences, devices, log
│   └── Syndic.Shared/                 # Événements MediatR, base classes, helpers
├── tests/
│   └── Syndic.Tests/
├── docker-compose.yml
├── docs/
│   ├── cahier-des-charges-mvp-syndic.md
│   └── diagramme-cas-utilisation.svg
└── CLAUDE.md
```

## Conventions
- **Langue du code** : anglais (noms de classes, méthodes, variables)
- **Langue métier** : français (libellés, commentaires de documentation, messages d'erreur)
- **Chaque module** expose ses endpoints (Minimal APIs ou Controllers) et ses IEntityTypeConfiguration<T>
- **Le DbContext unique** applique toutes les configurations via `ApplyConfigurationsFromAssembly`
- **Pas de logique métier dans les controllers** — tout dans des services injectés
- **Événements MediatR** pour le découplage inter-modules (ex: PaiementValide → NotificationHandler)

## Stack technique
- .NET 10 LTS / C# 14
- EF Core + PostgreSQL (Npgsql)
- ASP.NET Core Identity + JWT
- MediatR
- Serilog
- Docker + Docker Compose
- CI/CD : GitHub Actions

## Base de données
- PostgreSQL auto-hébergé en conteneur Docker
- Migrations EF Core centralisées dans Syndic.Api
- Sauvegarde : pg_dump quotidien

## Commandes utiles
```bash
# Lancer l'environnement de dev
docker compose up -d postgres
dotnet run --project src/Syndic.Api

# Migrations
dotnet ef migrations add NomMigration --project src/Syndic.Api
dotnet ef database update --project src/Syndic.Api

# Tests
dotnet test
```

## Règles importantes
- Ne jamais stocker de fichiers binaires en base (ni base64 ni bytea) — filesystem + path en base
- Le solde est porté par le lot, pas par le résident
- La hiérarchie est : Résidence → Groupe d'Habitation → Immeuble → Lot
- Pas de quittance PDF au MVP — notification push de confirmation uniquement
- Purge des justificatifs uniquement (pas des documents GED)
- Push uniquement au lancement (pas de WhatsApp au MVP)