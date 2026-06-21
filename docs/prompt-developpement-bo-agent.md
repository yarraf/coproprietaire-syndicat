# Prompt développement — Back Office Agent (Claude Code)

Ce document contient les prompts à exécuter **dans l'ordre** avec Claude Code pour développer le Back Office web destiné aux agents du syndic.

**Prérequis :** le backend .NET (Syndic.Api + modules) doit déjà exister, avec au minimum le module Copropriété et Paiement fonctionnels (voir `prompts-claude-code.md`). Le BO consomme cette API.

---

## Prompt 0 : Contexte à coller en début de session

```
Lis le fichier CLAUDE.md à la racine du projet, ainsi que docs/cahier-des-charges-mvp-syndic.md
et docs/prompt-design-syndic.md (section "Back Office web — Écrans à designer", écrans BO-1 à BO-10).

Je veux développer le Back Office web destiné aux agents du syndic.

Stack imposée :
- React.js avec Vite
- TypeScript
- TanStack Query (React Query) pour les appels API
- React Router pour la navigation
- Tailwind CSS pour le styling
- shadcn/ui pour les composants de base (boutons, dialogs, tables, formulaires)
- React Hook Form + Zod pour la validation des formulaires
- Axios ou fetch natif pour le client API, avec intercepteur JWT

L'API backend tourne sur http://localhost:5000 (à confirmer/ajuster selon Syndic.Api).
Le BO consomme les endpoints exposés par les modules : Copropriété, Paiement, Assemblées,
Maintenance, GED, Notification.

Respecte le design system et les écrans décrits dans docs/prompt-design-syndic.md :
palette de couleurs, typographie, badges de statut, composants réutilisables.

Langue de l'interface : français uniquement.

Ne génère rien pour l'instant — confirme que tu as bien comprit le contexte et propose
un plan d'implémentation en étapes avant de commencer.
```

---

## Prompt 1 : Initialisation du projet React

```
Initialise le projet React du Back Office dans un dossier apps/bo-web à la racine du repo :

1. Crée le projet Vite + React + TypeScript
2. Installe et configure : Tailwind CSS, shadcn/ui (init avec le thème par défaut, on
   personnalisera la palette ensuite), TanStack Query, React Router v6+, React Hook Form,
   Zod, Axios
3. Configure la palette de couleurs Tailwind selon le design system (section "Identité
   visuelle" du prompt design) : couleur primaire bleu/vert professionnel, secondaire,
   couleurs sémantiques (succès/erreur/avertissement/info), neutres
4. Crée la structure de dossiers :
   src/
   ├── api/              # client axios + hooks React Query par module
   ├── components/
   │   ├── ui/           # composants shadcn (générés)
   │   └── shared/       # composants métier réutilisables (StatusBadge, FileUpload, etc.)
   ├── features/         # un dossier par module métier (residences, paiements, etc.)
   ├── layouts/          # AppLayout avec sidebar
   ├── pages/            # pages routées
   ├── hooks/
   ├── lib/              # utils, validation schemas
   ├── types/            # types TypeScript partagés (alignés sur les DTOs backend)
   └── App.tsx
5. Configure les variables d'environnement (.env) pour l'URL de l'API
6. Crée le client Axios avec intercepteur qui injecte le token JWT depuis le storage
   et gère le 401 (redirection login)
7. Configure le fichier .gitignore adapté

Ne crée pas encore de pages métier, juste le squelette.
```

---

## Prompt 2 : Authentification et layout principal

```
Implémente l'authentification et le layout principal du BO :

1. Page de login (BO-1) : formulaire email + mot de passe avec React Hook Form + Zod,
   appel à l'endpoint d'auth du module Identity, stockage du JWT, redirection vers le
   dashboard
2. Contexte d'authentification (AuthContext ou store) : utilisateur courant, token,
   logout, état "isAuthenticated"
3. Route guard : ProtectedRoute qui redirige vers /login si non authentifié
4. AppLayout (BO-2 sidebar) :
   - Sidebar gauche rétractable avec navigation : Dashboard, Résidences, Copropriétaires,
     Paiements, Assemblées, Signalements, Maintenance, Documents, Paramètres
   - Icônes (lucide-react)
   - Header avec nom de l'agent connecté + bouton déconnexion
   - Zone de contenu principale avec <Outlet />
5. Configure React Router avec toutes les routes (pages vides pour l'instant, juste
   un titre h1) protégées par AppLayout

Respecte le design system : couleurs, espacement, la sidebar doit être responsive
(rétractable en icônes seules sur tablette).
```

---

## Prompt 3 : Dashboard

```
Implémente le Dashboard principal (BO-2) :

1. Hooks React Query pour récupérer : nombre de résidences gérées, paiements en attente
   de validation (count + 5 derniers), signalements ouverts (count), prochaine AG
2. KPI cards en haut de page (composant réutilisable StatCard) : résidences, paiements
   en attente, signalements ouverts, prochaine AG
3. Graphique du taux de recouvrement des charges (utilise recharts) — donut ou bar chart
4. Liste des 5 derniers paiements en attente (composant réutilisable PaymentListItem
   avec StatusBadge)
5. Liste des 5 derniers signalements (composant réutilisable IssueListItem)
6. Skeleton loaders pendant le chargement (états de loading React Query)
7. Empty states si aucune donnée

Crée le composant StatusBadge réutilisable selon le mapping du design system :
en_attente=jaune, valide=vert, rejete=rouge, recu=bleu, en_cours=ambre, resolu=vert,
cloture=gris, a_venir=bleu clair, terminee=gris.
```

---

## Prompt 4 : Gestion des résidences (structure)

```
Implémente le module de gestion des résidences (BO-3) :

1. Page liste des résidences : cards ou tableau (nom, adresse, ville, nb immeubles, nb lots)
   avec recherche
2. Formulaire de création/édition d'une résidence (modal ou page dédiée)
3. Vue détaillée d'une résidence : arborescence Résidence → Groupes d'Habitation →
   Immeubles → Lots, sous forme d'accordéon ou de vue arbre expansible
4. CRUD complet pour Groupe d'Habitation (formulaire : nom, rattachement résidence)
5. CRUD complet pour Immeuble (formulaire : nom du bloc, adresse, nb étages, rattachement GH)
6. CRUD complet pour Lot (formulaire : numéro, type appartement/local_commercial, étage,
   superficie, rattachement immeuble)
7. Fiche détail d'un lot : affichage du solde courant (vert si ≥0, rouge si <0), badge
   de type, liste des résidents associés
8. Tous les formulaires utilisent React Hook Form + Zod, avec gestion des erreurs API

Crée les hooks React Query (useResidences, useResidenceDetail, useCreateResidence,
useUpdateLot, etc.) dans features/residences/api.ts, avec invalidation du cache après
chaque mutation.
```

---

## Prompt 5 : Annuaire des copropriétaires

```
Implémente l'annuaire des copropriétaires (BO-4) :

1. Tableau (TanStack Table ou composant Table shadcn) avec colonnes : nom, prénom,
   téléphone, email, type (badge propriétaire/locataire), statut (badge actif/inactif),
   nombre de lots, solde global agrégé
2. Barre de recherche (nom/prénom/email) et filtres (résidence, type, statut)
3. Pagination
4. Formulaire de création d'un résident : coordonnées + sélection/rattachement à un ou
   plusieurs lots existants (multi-select avec recherche)
5. Action "Inviter" sur chaque ligne : déclenche l'appel à l'endpoint d'invitation,
   affiche le code/lien généré dans une modale avec bouton copier
6. Action "Désactiver/Réactiver" un résident avec confirmation
7. Page de fiche résident détaillée : coordonnées, lots rattachés, historique paiements
   résumé

Gère les états de chargement et les erreurs (toast de notification pour les actions
réussies/échouées — utilise le composant Toast de shadcn/ui ou sonner).
```

---

## Prompt 6 : Validation des paiements (cœur du module agent)

```
Implémente le module de validation des paiements (BO-5) — c'est le module le plus
critique du BO :

1. Page "File d'attente" : liste des paiements au statut en_attente, triés par date de
   soumission croissante. Chaque ligne/card affiche : résident, lot, montant, période,
   date de soumission, miniature du justificatif (si image) ou icône PDF
2. Vue détail d'un paiement (modal ou page latérale) :
   - Affichage du justificatif en grand : si image, affichage direct ; si PDF, viewer
     inline (utilise react-pdf ou un objet embed simple)
   - Infos complètes : résident, lot, montant déclaré, période, mode de paiement,
     solde actuel du lot
   - Bouton "Valider" (vert, avec confirmation) → appelle l'endpoint de validation
     → invalide le cache de la file d'attente et du solde du lot → toast de succès
   - Bouton "Rejeter" (rouge) → ouvre une modale avec champ motif obligatoire (Zod
     validation) → appelle l'endpoint de rejet → toast de confirmation
3. Page "Historique des paiements" : tableau filtrable par résidence, lot, statut,
   période, avec recherche
4. Empty state si la file d'attente est vide ("Aucun paiement en attente 🎉")

Gère les race conditions : si deux agents valident en même temps, affiche une erreur
claire si le paiement n'existe plus en statut en_attente au moment de l'action.
```

---

## Prompt 7 : Ajustement de solde

```
Implémente le module d'ajustement de solde (BO-6) :

1. Formulaire d'ajustement : sélection en cascade résidence → immeuble → lot (ou
   recherche directe du lot), montant, type (charge / régularisation), libellé libre,
   période
2. Aperçu du nouveau solde calculé avant confirmation
3. Confirmation avant enregistrement (modale récapitulative)
4. Historique des ajustements par lot, accessible depuis la fiche lot (BO-3) et depuis
   une page dédiée listant tous les ajustements récents
```

---

## Prompt 8 : Assemblées générales

```
Implémente le module Assemblées Générales (BO-7) :

1. Liste des AG avec onglets ou filtre "À venir" / "Passées", badge de statut
   (planifiée/terminée)
2. Formulaire de création d'une AG : titre, date (date+heure picker), lieu, ordre du
   jour (éditeur de texte riche simple ou textarea avec markdown)
3. Bouton "Envoyer convocation" sur une AG planifiée : confirmation, puis appel à
   l'endpoint qui déclenche la notification push à tous les résidents de la résidence
   concernée — affiche le nombre de résidents notifiés
4. Upload du PV après la séance : drag & drop de fichier (PDF/image), avec preview
   avant envoi. Une fois uploadé, affiche un lien vers le document dans la GED
5. Vue détail d'une AG : toutes les infos + statut d'envoi de la convocation + lien PV
   si disponible
```

---

## Prompt 9 : Signalements et maintenance

```
Implémente le module Maintenance et Signalements (BO-8) :

1. Tableau des signalements avec filtres : type (réclamation/incident), statut, résidence
2. Vue détail d'un signalement : description, photo (si présente, affichage agrandi),
   résident émetteur, lot/immeuble concerné, historique des changements de statut
3. Actions de changement de statut : boutons reçu → en_cours → résolu → clôturé, avec
   champ réponse texte qui se notifie au résident à chaque changement
4. Page Maintenance planifiée : liste ou vue calendrier des actions à venir (ascenseur,
   pompes, nettoyage, etc.)
5. Formulaire de création d'une action de maintenance : type, libellé, date prévue,
   récurrence (ponctuelle / hebdomadaire / mensuelle / annuelle), visibilité résidents
   (toggle)
6. Widget "Actions à venir" réutilisable (cards compactes avec icône par type) à
   intégrer aussi sur le Dashboard (BO-2)
```

---

## Prompt 10 : GED (Documents)

```
Implémente le module GED (BO-9) :

1. Liste des documents par résidence, avec filtre par type (règlement / pv_ag / autre)
2. Upload de document : drag & drop ou bouton, avec champs titre, type, rattachement
   résidence/immeuble, toggle visibilité résidents
3. Aperçu inline du document (PDF viewer ou image)
4. Action de suppression avec confirmation (uniquement si le document n'est pas un PV
   archivé automatiquement — ceux-ci sont protégés en lecture seule depuis le BO,
   gérés depuis le module AG)
```

---

## Prompt 11 : Paramètres et finitions

```
Implémente la page Paramètres (BO-10) et les finitions transverses :

1. Page profil agent : informations personnelles, résidences assignées (lecture seule
   pour le MVP)
2. Changement de mot de passe
3. Vérifie et harmonise sur l'ensemble de l'app :
   - Tous les skeleton loaders sont en place sur les listes
   - Tous les empty states ont un message et une icône cohérents
   - Tous les formulaires affichent les erreurs de validation Zod de façon claire
   - Tous les toasts de succès/erreur sont cohérents
   - La sidebar a un état actif visible sur la route courante
   - Le responsive fonctionne correctement de 1024px à 1920px
4. Ajoute une page 404 et une page d'erreur générique (boundary React)
5. Vérifie l'accessibilité de base : labels sur les inputs, contraste des textes,
   navigation au clavier sur les modales
```

---

## Conseils d'utilisation

- Lance les prompts **dans l'ordre** — chaque module dépend du layout et de l'auth mis en place avant
- Utilise `/plan` avant chaque prompt pour valider l'approche de Claude Code avant qu'il génère le code
- Après chaque prompt : `npm run build` pour vérifier qu'il n'y a pas d'erreur TypeScript, puis teste manuellement l'écran dans le navigateur
- Commite après chaque module fonctionnel (un commit par prompt est une bonne granularité)
- Si l'API backend n'est pas encore prête pour un module donné, demande à Claude Code de **mocker les réponses** (MSW ou données statiques) pour avancer sur le visuel en parallèle, puis de brancher l'API réelle ensuite
