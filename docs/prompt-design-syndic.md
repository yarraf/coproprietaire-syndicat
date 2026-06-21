# Prompt Design — Application Syndic Maroc

## Contexte projet

Tu es le designer UI/UX d'une application de gestion de syndic de copropriété au Maroc. L'application comporte **deux interfaces distinctes** :

1. **Back Office web (BO)** — utilisé par les **agents du syndic** pour gérer les résidences, valider les paiements, traiter les signalements, organiser les AG et publier les documents. Stack : React.js (Vite).

2. **Application mobile** — utilisée par les **copropriétaires / résidents** pour consulter leur solde, soumettre des justificatifs de paiement, signaler des incidents, consulter les AG et documents. Stack : React Native (Expo).

**Langue de l'interface :** Français uniquement (pas de RTL/arabe au MVP).

---

## Identité visuelle et design system

### Direction artistique
- **Style** : moderne, épuré, professionnel mais chaleureux. L'application s'adresse à des résidents marocains de tout âge — elle doit inspirer **confiance** (gestion de l'argent) et être **simple à utiliser** (certains résidents ne sont pas tech-savvy).
- **Pas de surcharge visuelle** : privilégier les espaces blancs, la lisibilité, la hiérarchie claire.
- **Inspiration** : apps bancaires modernes (Revolut, Wise) pour la clarté des soldes et transactions ; apps de gestion immobilière (Syndic+ / Bellman) pour la structure.

### Palette de couleurs
Propose une palette complète avec :
- **Couleur primaire** : un bleu/vert professionnel qui évoque la confiance et la gestion (ex. bleu pétrole, vert émeraude)
- **Couleur secondaire** : un accent chaud pour les CTA et les éléments interactifs
- **Couleurs sémantiques** : succès (paiement validé), erreur (paiement rejeté), avertissement (en attente), info
- **Neutres** : gamme de gris pour le texte, les bordures, les fonds
- **Couleur de fond** : blanc cassé / gris très léger (pas de blanc pur agressif)

### Typographie
- **BO web** : une police sans-serif moderne et lisible (Inter, Plus Jakarta Sans, ou similaire)
- **Mobile** : la police système native (San Francisco sur iOS, Roboto sur Android) pour les performances et la cohérence avec l'OS
- Hiérarchie claire : titres, sous-titres, corps, labels, captions

### Composants transverses
Définis les composants réutilisables suivants (pour les deux interfaces) :
- Boutons (primaire, secondaire, danger, désactivé, loading)
- Champs de formulaire (input texte, select, date picker, upload fichier)
- Cards (lot, paiement, signalement, AG, document)
- Badges de statut (en attente / validé / rejeté / en cours / résolu / clôturé)
- Modales de confirmation
- Notifications toast (succès, erreur, info)
- Empty states (aucun paiement, aucun signalement…)
- Skeleton loaders

---

## Back Office web — Écrans à designer

### BO-1. Login agent
- Formulaire email + mot de passe
- Logo de l'application
- Fond épuré

### BO-2. Dashboard principal
- **KPI cards en haut** : nombre de résidences gérées, paiements en attente de validation, signalements ouverts, prochaine AG
- **Graphique** : taux de recouvrement des charges (bar chart ou donut)
- **Liste rapide** : 5 derniers paiements en attente + 5 derniers signalements
- **Sidebar gauche** : navigation principale (Dashboard, Résidences, Copropriétaires, Paiements, AG, Signalements, Maintenance, Documents, Paramètres)

### BO-3. Gestion des résidences
- **Liste des résidences** en cards ou tableau (nom, adresse, ville, nombre d'immeubles, nombre de lots)
- **Vue détaillée d'une résidence** : arborescence Résidence → GH → Immeubles → Lots (vue arbre ou accordéon)
- **Fiche lot** : numéro, type (badge appartement/local), étage, superficie, solde courant (vert si positif, rouge si négatif), résident(s) associé(s)

### BO-4. Annuaire copropriétaires
- **Tableau** avec recherche et filtres (par résidence, par type propriétaire/locataire, par statut actif/inactif)
- Colonnes : nom, prénom, téléphone, email, type, statut, nombre de lots, solde global
- **Actions** : voir fiche, inviter (envoyer code), désactiver
- **Formulaire de création** : coordonnées + rattachement à un ou plusieurs lots

### BO-5. Validation des paiements
- **File d'attente** : liste des paiements au statut "en attente", triés par date de soumission
- Chaque carte/ligne affiche : résident, lot, montant, période, date de soumission, miniature du justificatif
- **Vue détail** : justificatif en grand (image ou PDF viewer inline), infos du paiement, solde actuel du lot
- **Actions** : bouton "Valider" (vert) → confirmer → notification envoyée ; bouton "Rejeter" (rouge) → modale avec champ motif obligatoire
- **Historique des paiements** : tableau filtrable par résidence, lot, statut, période

### BO-6. Ajustement de solde
- Formulaire : sélection résidence → immeuble → lot, montant, type (charge / régularisation), libellé, période
- Confirmation avant enregistrement
- Historique des ajustements par lot

### BO-7. Assemblées générales
- **Liste des AG** : à venir / passées, avec statut (planifiée / terminée)
- **Formulaire de création** : titre, date, lieu, ordre du jour (éditeur texte)
- **Envoi de convocation** : bouton qui déclenche la notification push à tous les résidents de la résidence
- **Upload du PV** : drag & drop ou bouton upload (PDF/image) → archivé automatiquement dans la GED

### BO-8. Signalements et maintenance
- **Tableau des signalements** avec filtres (par type réclamation/incident, par statut, par résidence)
- **Vue détail** : description, photo, historique des échanges, boutons de changement de statut (reçu → en cours → résolu → clôturé)
- **Maintenance planifiée** : calendrier ou liste des actions à venir (ascenseur, pompes…), formulaire de création avec récurrence

### BO-9. GED (Documents)
- Liste des documents par résidence, filtrable par type (règlement / PV d'AG)
- Upload avec catégorisation et visibilité (résidents oui/non)
- Aperçu inline du document

### BO-10. Paramètres
- Profil de l'agent
- Gestion des résidences assignées

---

## Application mobile — Écrans à designer

### MOB-1. Onboarding / activation du compte
- Écran de bienvenue avec logo
- Saisie du code d'invitation reçu de l'agent
- Création du mot de passe
- Écran de confirmation "Compte activé"

### MOB-2. Login résident
- Email + mot de passe
- Option "Mot de passe oublié"
- Biometric login (Face ID / empreinte) — prévoir le bouton

### MOB-3. Accueil (Home)
- **Salutation** : "Bonjour, [Prénom]"
- **Card solde global** : montant total dû, avec indicateur visuel (vert = à jour, rouge = impayé)
- **Raccourcis rapides** : "Déclarer un paiement", "Signaler un incident"
- **Section dernières actualités** : prochaine AG, dernière annonce de maintenance, dernier paiement
- **Bottom tab bar** : Accueil, Paiements, Signalements, Documents, Profil

### MOB-4. Mes lots
- Liste des lots du résident (card par lot : numéro, type, immeuble, GH, résidence, solde individuel)
- Tap sur un lot → détail avec historique des paiements et charges de ce lot

### MOB-5. Paiements
- **Tab "Historique"** : liste des paiements avec badge de statut (en attente → jaune, validé → vert, rejeté → rouge)
- **Tab "Nouveau paiement"** (ou FAB button +) :
  - Étape 1 : sélection du lot (si plusieurs)
  - Étape 2 : saisie du montant + sélection de la période (mois/trimestre picker)
  - Étape 3 : upload du justificatif (photo caméra ou galerie ou fichier PDF)
  - Étape 4 : récapitulatif → bouton "Soumettre"
  - Écran de confirmation : "Paiement soumis, en attente de validation"
- **Détail d'un paiement** : montant, période, date, statut, justificatif (zoomable), motif de rejet si rejeté

### MOB-6. Signalements
- **Liste des signalements** du résident avec badge de statut
- **Nouveau signalement** :
  - Type (réclamation / incident)
  - Titre + description
  - Photo (optionnelle, prise directe ou galerie)
  - Lot ou immeuble concerné
  - Bouton "Envoyer"
- **Détail** : historique du suivi, réponse de l'agent, statut actuel

### MOB-7. Assemblées générales
- Liste des AG (à venir / passées)
- Détail : date, lieu, ordre du jour
- Accès au PV (téléchargement ou vue inline)
- Notification de convocation visible ici

### MOB-8. Documents
- Liste des documents accessibles (règlement, PV archivés)
- Téléchargement ou visualisation inline

### MOB-9. Notifications
- Centre de notifications : historique des push reçus (paiement validé/rejeté, convocation AG, mise à jour signalement, annonce maintenance)
- Chaque notification est cliquable → redirige vers l'écran concerné

### MOB-10. Profil
- Informations personnelles (nom, prénom, email, téléphone)
- Mes lots (raccourci)
- Préférences de notification (toggle push on/off)
- Déconnexion

---

## Widgets et éléments spéciaux

### Widget "Actions à venir" (maintenance planifiée)
- Affiché sur le Home mobile et le Dashboard BO
- Cards compactes avec : icône type (ascenseur, pompe, nettoyage), libellé, date prévue, statut (à venir / en cours / terminée)
- Style : cards empilées horizontalement (scroll horizontal sur mobile) ou grille sur le BO

### Card de paiement (réutilisable)
- Montant en gros
- Période (ex. "Janvier 2026")
- Badge de statut coloré
- Miniature du justificatif (coin)
- Nom du lot

### Badge de statut (system design)
Définir les couleurs et les labels pour chaque statut :
- `en_attente` → jaune/ambre, label "En attente"
- `valide` → vert, label "Validé"
- `rejete` → rouge, label "Rejeté"
- `recu` → bleu, label "Reçu"
- `en_cours` → ambre, label "En cours"
- `resolu` → vert, label "Résolu"
- `cloture` → gris, label "Clôturé"
- `a_venir` → bleu clair, label "À venir"
- `terminee` → gris, label "Terminée"

---

## Flux UX critiques à illustrer

### Flux 1 : Soumission et validation d'un paiement
```
Résident (mobile)                    Agent (BO)
────────────────                    ──────────
Accueil → "Déclarer un paiement"
→ Choix du lot
→ Saisie montant + période
→ Upload justificatif
→ Récap → "Soumettre"
→ Écran confirmation                → Notification dans le dashboard
  (statut: en attente)                "1 nouveau paiement"
                                    → Ouvre la file d'attente
                                    → Consulte le justificatif
                                    → Clique "Valider"
← Notification push                ← Solde du lot mis à jour
  "Paiement de 500 DH validé"
→ Historique mis à jour
  (badge vert "Validé")
```

### Flux 2 : Signalement d'un incident
```
Résident (mobile)                    Agent (BO)
────────────────                    ──────────
Accueil → "Signaler un incident"
→ Type + titre + description
→ Photo (optionnel)
→ "Envoyer"
→ Suivi (statut: reçu)             → Notification "Nouveau signalement"
                                    → Assigne et passe en "En cours"
← Notification push                
  "Votre signalement est en cours"
                                    → Résout et répond
← Notification push
  "Signalement résolu"
→ Consultation de la réponse
```

### Flux 3 : Convocation AG
```
Agent (BO)                          Résident (mobile)
──────────                          ────────────────
Crée une AG (titre, date, lieu, ODJ)
→ Clique "Envoyer convocation"
                                    ← Notification push
                                      "Convocation AG le 15/03"
                                    → Consulte l'ordre du jour
--- Après la séance ---
Upload du PV (PDF)
→ PV archivé dans la GED
→ Notification "PV disponible"
                                    ← Notification push
                                    → Télécharge/consulte le PV
```

---

## Contraintes techniques pour le design

- **Mobile first** pour l'app résidents : conçu pour des écrans 375px (iPhone SE) à 430px (iPhone Pro Max)
- **BO responsive** mais optimisé desktop (1280px+), avec sidebar rétractable pour tablette
- **Accessibilité** : contraste minimum WCAG AA, tailles de touch targets ≥ 44px sur mobile
- **Performance perçue** : skeleton loaders sur les listes, feedback immédiat sur les boutons (loading state)
- **Upload** : accepter image (JPG, PNG, HEIC) et PDF ; prévisualisation avant soumission ; limite 10 Mo
- **Notifications push** : prévoir l'affichage de la notification système (titre + corps) pour chaque événement

---

## Livrables attendus

1. **Design system** : palette, typographie, composants (boutons, cards, badges, inputs, modales)
2. **Maquettes BO web** : les 10 écrans listés (BO-1 à BO-10)
3. **Maquettes mobile** : les 10 écrans listés (MOB-1 à MOB-10)
4. **Flux UX** : les 3 flux illustrés (paiement, signalement, AG)
5. **Spécifications des widgets** : card paiement, card signalement, widget maintenance, badges de statut

Pour chaque écran, montre l'état par défaut et les états vides (empty state) quand c'est pertinent.
