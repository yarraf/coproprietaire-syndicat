# Syndic App — Contexte projet

## Description
Application de gestion de syndic de copropriété au Maroc (loi 18-00 / 106-12).
Deux interfaces : Back Office web (agents syndic) + App mobile (résidents copropriétaires).

## Cahier des charges
Le fichier `docs/cahier-des-charges-mvp-syndic.md` contient les spécifications complètes du MVP.
Le fichier `docs/diagramme-cas-utilisation.svg` contient le diagramme UML des cas d'utilisation.
**Toujours s'y référer avant d'implémenter un module.**

---

## Architecture

- **Monolithe modulaire .NET 10 (C# 14)** — ASP.NET Core Web API
- **Modules** : Identity, Copropriété, Paiement, Assemblées, Maintenance, GED, Notification
- **Communication inter-modules** : interfaces injectées (synchrone) + MediatR (événements internes)
- **Un seul DbContext EF Core** (`SyndicDbContext`) — une base PostgreSQL, schéma unique
- **Auth** : ASP.NET Core Identity + JWT (rôles : `Agent`, `Resident`)
- **Jobs de fond** : BackgroundService / Hangfire
- **Fichiers** : filesystem (volume Docker) + colonnes `*_path` en base
- **Notifications** : push uniquement (Expo / FCM-APNs) au MVP

### Règle critique : pas de dépendance circulaire
`Syndic.Api` référence tous les modules. Les modules ne peuvent donc PAS référencer `Syndic.Api`.
**Les implémentations de service qui utilisent `SyndicDbContext` vivent dans `Syndic.Api/Modules/<Module>/Services/`**, pas dans les modules classlibs (qui ne contiennent que Domain, DTOs, interfaces, endpoints, configurations EF).

---

## Structure complète du projet

```
coproprietaire-syndicat/
├── src/
│   ├── Syndic.Api/                                   # Hôte Web API
│   │   ├── Program.cs                                # DI, middleware, Swagger, MapEndpoints
│   │   ├── appsettings.json                          # ConnectionString port 5433, JwtSettings, Cors
│   │   ├── appsettings.Development.json
│   │   ├── Properties/launchSettings.json            # HTTPS :52518 / HTTP :52519
│   │   ├── Infrastructure/
│   │   │   ├── Persistence/SyndicDbContext.cs        # IdentityDbContext<ApplicationUser>
│   │   │   └── GlobalExceptionHandler.cs             # IExceptionHandler → ProblemDetails
│   │   ├── Migrations/                               # EF Core migrations centralisées ici
│   │   │   ├── 20260620000000_InitialCreate.cs
│   │   │   ├── 20260620093247_AddPaiementModule.cs
│   │   │   ├── 20260620094343_AddNotificationModule.cs
│   │   │   └── 20260620100404_AddAssembleesMaintenanceGed.cs
│   │   └── Modules/                                  # Implémentations (ont accès à SyndicDbContext)
│   │       ├── Identity/AuthEndpoints.cs             # POST /api/auth/login, /register, /refresh
│   │       ├── Copropriete/
│   │       │   ├── CoproprieteModule.cs              # AddCoproprieteModule + SeedRolesAsync
│   │       │   └── Services/
│   │       │       ├── ResidenceService.cs
│   │       │       ├── LotService.cs
│   │       │       └── ResidentService.cs
│   │       ├── Paiement/
│   │       │   ├── PaiementRegistration.cs
│   │       │   └── Services/PaiementService.cs
│   │       ├── Assemblees/
│   │       │   ├── AssembleesRegistration.cs
│   │       │   └── Services/AssembleeService.cs
│   │       ├── Maintenance/
│   │       │   ├── MaintenanceRegistration.cs
│   │       │   └── Services/MaintenanceService.cs
│   │       ├── Ged/
│   │       │   ├── GedRegistration.cs
│   │       │   └── Services/GedService.cs
│   │       └── Notification/
│   │           ├── NotificationRegistration.cs
│   │           └── Services/NotificationService.cs
│   │
│   ├── Syndic.Shared/                                # BaseEntity (Id, CreatedAt, UpdatedAt)
│   │
│   ├── Syndic.Modules.Identity/
│   │   └── Domain/
│   │       ├── Constants/Roles.cs                    # Agent = "Agent", Resident = "Resident"
│   │       └── Entities/ApplicationUser.cs           # IdentityUser<Guid> + ResidentId + RefreshToken
│   │
│   ├── Syndic.Modules.Copropriete/
│   │   ├── CoproprieteModule.cs                      # Policies (RequireAgent, RequireResident) + MapEndpoints
│   │   ├── Domain/
│   │   │   ├── Entities/  Residence, GroupeHabitation, Immeuble, Lot, LotResident, Resident
│   │   │   └── Enums/     LotType, ResidentType, ResidentStatus
│   │   ├── Application/
│   │   │   ├── DTOs/      ResidenceDtos.cs, LotDtos.cs, ResidentDtos.cs
│   │   │   └── Services/  IResidenceService, ILotService, IResidentService
│   │   ├── Endpoints/     ResidenceEndpoints.cs, LotEndpoints.cs, ResidentEndpoints.cs
│   │   └── Persistence/Configurations/  (6 fichiers IEntityTypeConfiguration<T>)
│   │
│   ├── Syndic.Modules.Paiement/
│   │   ├── PaiementModule.cs
│   │   ├── Domain/Entities/  Paiement, AjustementSolde
│   │   ├── Application/DTOs/ PaiementDtos.cs
│   │   ├── Application/Services/ IPaiementService
│   │   ├── Endpoints/PaiementEndpoints.cs
│   │   └── Persistence/Configurations/
│   │
│   ├── Syndic.Modules.Assemblees/
│   │   ├── AssembleesModule.cs
│   │   ├── Domain/Entities/  Assemblee
│   │   ├── Domain/Enums/     AssembleeStatut
│   │   ├── Application/DTOs/ AssembleesDtos.cs
│   │   ├── Application/Services/ IAssembleeService
│   │   ├── Endpoints/AssembleeEndpoints.cs
│   │   └── Persistence/Configurations/AssembleeConfiguration.cs
│   │
│   ├── Syndic.Modules.Maintenance/
│   │   ├── MaintenanceModule.cs
│   │   ├── Domain/Entities/  Signalement, MaintenancePlanifiee
│   │   ├── Domain/Enums/     SignalementStatut, SignalementType, MaintenanceStatut
│   │   ├── Application/DTOs/ MaintenanceDtos.cs
│   │   ├── Application/Services/ IMaintenanceService
│   │   ├── Endpoints/MaintenanceEndpoints.cs
│   │   └── Persistence/Configurations/
│   │
│   ├── Syndic.Modules.Ged/
│   │   ├── GedModule.cs
│   │   ├── Domain/Entities/  Document
│   │   ├── Domain/Enums/     DocumentType
│   │   ├── Application/DTOs/ GedDtos.cs
│   │   ├── Application/Services/ IGedService
│   │   ├── Endpoints/GedEndpoints.cs
│   │   └── Persistence/Configurations/DocumentConfiguration.cs
│   │
│   └── Syndic.Modules.Notification/
│       ├── Domain/Entities/  Device, NotificationLog
│       ├── Application/DTOs/ NotificationDtos.cs
│       ├── Application/Services/ INotificationService
│       └── Persistence/Configurations/
│
├── web/                                              # Back Office (React)
│   ├── vite.config.ts                               # proxy /api → http://localhost:52519
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css                                # Tailwind CSS v4
│   │   ├── api/
│   │   │   ├── client.ts                            # Axios + intercepteur JWT refresh
│   │   │   ├── auth.ts
│   │   │   ├── residences.ts
│   │   │   ├── copropietaires.ts
│   │   │   ├── paiements.ts
│   │   │   ├── assemblees.ts
│   │   │   ├── maintenance.ts
│   │   │   ├── signalements.ts
│   │   │   └── (ged à ajouter si besoin)
│   │   ├── store/
│   │   │   └── auth.ts                              # Zustand persisté localStorage 'syndic-auth'
│   │   ├── router/
│   │   │   └── index.tsx                            # Routes + ProtectedRoute
│   │   ├── layouts/
│   │   │   ├── AppLayout.tsx                        # Sidebar navigation
│   │   │   └── AuthLayout.tsx
│   │   ├── features/                                # Une page = un dossier
│   │   │   ├── auth/LoginPage.tsx
│   │   │   ├── dashboard/DashboardPage.tsx
│   │   │   ├── residences/ResidenceListPage.tsx + ResidenceDetailPage.tsx
│   │   │   ├── copropietaires/CopropietairesPage.tsx
│   │   │   ├── paiements/PaiementsPage.tsx + PaiementDetailPage.tsx + AjustementSoldePage.tsx
│   │   │   ├── assemblees/AssembleesPage.tsx
│   │   │   ├── maintenance/MaintenancePage.tsx
│   │   │   ├── signalements/SignalementsPage.tsx + SignalementDetailPage.tsx
│   │   │   ├── ged/GedPage.tsx
│   │   │   └── parametres/ParametresPage.tsx
│   │   ├── components/
│   │   │   ├── shared/  ConfirmModal, EmptyState, FilePreview, PageHeader, StatusBadge
│   │   │   └── ui/      button, input, dialog, form, select, table, tabs, badge, avatar…
│   │   └── lib/utils.ts                             # cn() helper Tailwind
│
├── tests/Syndic.Tests/
├── docker-compose.yml
├── docs/
│   ├── cahier-des-charges-mvp-syndic.md
│   └── diagramme-cas-utilisation.svg
└── CLAUDE.md
```

---

## Conventions de code

### Nommage
- **Langue du code** : anglais (classes, méthodes, variables, propriétés C#)
- **Langue métier** : français (messages d'erreur, libellés API, commentaires)
- **Tables SQL** : snake_case français — ex : `residences`, `groupes_habitation`, `lot_residents`
- **Colonnes SQL** : snake_case français via `HasColumnName()` — ex : `nom`, `adresse`, `date_debut`
- **Enums stockés en base** : strings français — ex : `"appartement"`, `"proprietaire"`, `"actif"`

### Conventions EF Core
- Chaque module expose ses `IEntityTypeConfiguration<T>` dans `Persistence/Configurations/`
- `SyndicDbContext` scanne tous les assemblies via `ApplyConfigurationsFromAssembly`
- `BaseEntity` : `Id (Guid)`, `CreatedAt (DateTimeOffset)`, `UpdatedAt (DateTimeOffset?)`
- Les entités ont un constructeur `private Entity() {}` (EF) + factory `Entity.Create(...)`
- Navigations via backing fields `List<T>`, exposées en `IReadOnlyCollection<T>`

### Pattern de module
Chaque module classlib contient :
1. `Domain/Entities/` — entités métier
2. `Domain/Enums/` — énumérations
3. `Application/DTOs/` — records request/response
4. `Application/Services/I*Service.cs` — interfaces uniquement
5. `Endpoints/*Endpoints.cs` — Minimal API (`IEndpointRouteBuilder` extension)
6. `Persistence/Configurations/` — EF configurations
7. `*Module.cs` — `Map*Endpoints()` + `Policies`

Les **implémentations** de service sont dans `Syndic.Api/Modules/<Module>/Services/` (accès à `SyndicDbContext`).

### Règles importantes
- Ne jamais stocker de fichiers binaires en base — filesystem + path en base
- Le solde est porté par le **lot**, pas par le résident
- La hiérarchie est : **Résidence → Groupe d'Habitation → Immeuble → Lot**
- Pas de quittance PDF au MVP — notification push de confirmation uniquement
- Purge des justificatifs uniquement (pas des documents GED)
- Push uniquement au lancement (pas de WhatsApp au MVP)
- `lot_residents.resident_id` : `OnDelete(Restrict)` — supprimer les LotResidents avant les Residents

---

## Stack technique

### API
- .NET 10 LTS / C# 14
- EF Core 10.0.0 + Npgsql.EntityFrameworkCore.PostgreSQL 10.0.0
- ASP.NET Core Identity 10.0.0 + JWT Bearer
- MediatR 12.5.0
- Serilog.AspNetCore 9.0.0
- Swashbuckle.AspNetCore 7.3.1

### Web BO
- React 19 + Vite 8 + TypeScript 6
- TanStack Query v5 + React Router v7
- Tailwind CSS v4 + shadcn/ui (composants manuels dans `web/src/components/ui/`)
- React Hook Form + Zod v4
- Axios + Zustand v5 + Sonner

---

## Infrastructure & ports

| Service | Port local | Détail |
|---|---|---|
| PostgreSQL (Docker) | **5433** | ⚠️ port 5432 occupé par PostgreSQL local Windows |
| API HTTPS | 52518 | `launchSettings.json` |
| API HTTP | 52519 | `launchSettings.json` — utilisé par le proxy Vite |
| Back Office | 5173 | `npm run dev` dans `web/` |

### Connexion base de données
- `Host=127.0.0.1;Port=5433;Database=syndic;Username=syndic;Password=syndic_password`
- DBeaver : `jdbc:postgresql://127.0.0.1:5433/syndic?sslmode=disable`
- Auth PostgreSQL : `trust` (pg_hba.conf — dev uniquement)

### Variables d'environnement requises
```
JwtSettings__SecretKey=syndic-jwt-secret-key-dev-32chars!!
```

---

## Commandes utiles

```bash
# Lancer PostgreSQL (Docker)
docker compose up -d postgres

# Lancer l'API
$env:JwtSettings__SecretKey="syndic-jwt-secret-key-dev-32chars!!"
dotnet run --project src/Syndic.Api
# → Swagger : https://localhost:52518/swagger

# Lancer le Back Office
cd web
npm run dev
# → http://localhost:5173

# Migrations EF Core
dotnet ef migrations add NomMigration --project src/Syndic.Api
dotnet ef database update --project src/Syndic.Api

# Tests
dotnet test
```

---

## État d'avancement des modules

| Module | Entités | Service impl. | Endpoints | Statut |
|---|---|---|---|---|
| Identity | ApplicationUser | AuthEndpoints | POST /api/auth/login, /register, /refresh | ✅ |
| Copropriété | Residence, GH, Immeuble, Lot, LotResident, Resident | ResidenceService, LotService, ResidentService | 15+ routes /api/residences, /api/lots, /api/residents, /api/me | ✅ |
| Paiement | Paiement, AjustementSolde | PaiementService (stub) | Endpoints (stub) | ⚠️ stub |
| Assemblées | Assemblee | AssembleeService (stub) | Endpoints (stub) | ⚠️ stub |
| Maintenance | Signalement, MaintenancePlanifiee | MaintenanceService (stub) | Endpoints (stub) | ⚠️ stub |
| GED | Document | GedService (stub) | Endpoints (stub) | ⚠️ stub |
| Notification | Device, NotificationLog | NotificationService (stub) | Endpoints (stub) | ⚠️ stub |
