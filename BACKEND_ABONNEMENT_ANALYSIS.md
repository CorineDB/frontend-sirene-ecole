# Analyse du Système d'Abonnement Backend

## Vue d'ensemble

Cette branche backend (`claude/review-school-subscription-013rbkC5ZxQtjyonS41Zr2FS`) introduit un système complet de gestion des abonnements pour les écoles dans l'application Sirène École.

## Structure de données

### Modèle Abonnement

**Fichier**: `app/Models/Abonnement.php`

**Champs principaux**:
- `id` (ULID) - Identifiant unique
- `ecole_id` (ULID) - École associée
- `site_id` (ULID) - Site de l'école
- `sirene_id` (ULID) - Sirène associée
- `parent_abonnement_id` (ULID, nullable) - Pour les renouvellements
- `numero_abonnement` (string, unique) - Numéro d'abonnement généré automatiquement
- `date_debut` (date) - Date de début
- `date_fin` (date) - Date de fin
- `montant` (decimal) - Montant de l'abonnement
- `statut` (enum) - Statut actuel
- `auto_renouvellement` (boolean) - Renouvellement automatique activé
- `notes` (text, nullable) - Notes additionnelles
- `qr_code_path` (string, nullable) - Chemin vers le QR code

### Statuts d'abonnement

**Fichier**: `app/Enums/StatutAbonnement.php`

- `actif` - Abonnement actif et valide
- `expire` - Abonnement expiré
- `suspendu` - Abonnement suspendu temporairement
- `en_attente` - En attente de paiement

### Relations

- `ecole()` - BelongsTo Ecole
- `site()` - BelongsTo Site
- `sirene()` - BelongsTo Sirene
- `parentAbonnement()` - BelongsTo Abonnement (self-referencing)
- `childAbonnements()` - HasMany Abonnement (renouvellements)
- `token()` - HasOne TokenSirene
- `paiements()` - HasMany Paiement

## API Endpoints

### Endpoints publics (sans authentification)

**Accès via QR Code**:
- `GET /api/abonnements/{id}/details` - Détails de l'abonnement
- `GET /api/abonnements/{id}/paiement` - Page de paiement
- `GET /api/abonnements/{id}` - Informations de l'abonnement
- `GET /api/abonnements/{id}/qr-code-url` - URL signée du QR code

### CRUD de base (authentifié)

- `GET /api/abonnements` - Liste tous les abonnements (admin)
- `PUT /api/abonnements/{id}` - Mettre à jour un abonnement
- `DELETE /api/abonnements/{id}` - Supprimer un abonnement

### Gestion du cycle de vie (authentifié)

- `POST /api/abonnements/{id}/renouveler` - Renouveler un abonnement
- `POST /api/abonnements/{id}/suspendre` - Suspendre (avec raison)
- `POST /api/abonnements/{id}/reactiver` - Réactiver un abonnement suspendu
- `POST /api/abonnements/{id}/annuler` - Annuler (avec raison)
- `POST /api/abonnements/{id}/regenerer-qr-code` - Régénérer le QR code
- `POST /api/abonnements/{id}/regenerer-token` - Régénérer le token ESP8266
- `GET /api/abonnements/{id}/qr-code` - Télécharger le QR code

### Recherche et filtrage (authentifié)

- `GET /api/abonnements/ecole/{ecoleId}/actif` - Abonnement actif d'une école
- `GET /api/abonnements/ecole/{ecoleId}` - Tous les abonnements d'une école
- `GET /api/abonnements/sirene/{sireneId}` - Abonnements d'une sirène
- `GET /api/abonnements/liste/expirant-bientot?jours=30` - Abonnements expirant bientôt
- `GET /api/abonnements/liste/expires` - Abonnements expirés
- `GET /api/abonnements/liste/actifs` - Abonnements actifs
- `GET /api/abonnements/liste/en-attente` - Abonnements en attente

### Vérifications (authentifié)

- `GET /api/abonnements/{id}/est-valide` - Vérifier si valide
- `GET /api/abonnements/ecole/{ecoleId}/a-abonnement-actif` - École a un abonnement actif
- `GET /api/abonnements/{id}/peut-etre-renouvele` - Peut être renouvelé

### Statistiques (authentifié - admin)

- `GET /api/abonnements/stats/global` - Statistiques globales
- `GET /api/abonnements/stats/revenus-periode?date_debut=...&date_fin=...` - Revenus sur période
- `GET /api/abonnements/stats/taux-renouvellement` - Taux de renouvellement

### Calculs (authentifié)

- `GET /api/abonnements/{id}/prix-renouvellement` - Calculer prix de renouvellement
- `GET /api/abonnements/{id}/jours-restants` - Jours restants

### Tâches automatiques (authentifié - CRON - admin)

- `POST /api/abonnements/cron/marquer-expires` - Marquer les abonnements expirés
- `POST /api/abonnements/cron/envoyer-notifications` - Envoyer notifications d'expiration
- `POST /api/abonnements/cron/auto-renouveler` - Auto-renouveler les abonnements

### Route signée pour QR code

- `GET /api/abonnements/{id}/qr-code-download` (avec signature) - Téléchargement sécurisé

## Fonctionnalités clés

### 1. QR Code

- Génération automatique du QR code lors de la création
- Stockage dans `storage/app/public/ecoles/{ecole_id}/qrcodes/{site_id}/abonnement_{id}.png`
- URL signée temporaire (1 heure) pour accès sécurisé
- Régénération possible pour les abonnements en attente

### 2. Token ESP8266

- Génération de token crypté pour les sirènes
- Lié à l'abonnement
- Régénération possible si échec

### 3. Paiements

- Support CinetPay, virement, espèces
- Statuts: en_attente, valide, echoue, annule
- Lien avec abonnement
- Callback et notification

### 4. Cycle de vie

**Workflow typique**:
1. Création → Statut: `en_attente`
2. Paiement validé → Statut: `actif`
3. Actions possibles:
   - Suspension (raison requise) → `suspendu`
   - Réactivation → `actif`
   - Annulation (raison requise) → `expire`
   - Renouvellement → Nouvel abonnement `en_attente`

### 5. Renouvellement

- Création d'un nouvel abonnement lié au parent via `parent_abonnement_id`
- Date début = date fin du parent + 1 jour
- Date fin = date fin du parent + 1 an + 1 jour
- Même montant et configuration
- Nouveau numéro d'abonnement généré

## Impact sur le Frontend

### Pages/Composants à créer/modifier

#### 1. Liste des abonnements
- Afficher tous les abonnements d'une école
- Filtres par statut (actif, expiré, en attente, suspendu)
- Badges de statut colorés
- Actions: voir détails, renouveler, suspendre, etc.

#### 2. Détails d'un abonnement
- Informations complètes: école, site, sirène
- QR code téléchargeable
- Historique des paiements
- Actions selon statut:
  - `en_attente`: Payer, Régénérer QR code
  - `actif`: Suspendre, Renouveler
  - `suspendu`: Réactiver
  - Tous: Annuler

#### 3. Page de paiement (accès via QR code)
- Affichage des détails de l'abonnement
- Intégration CinetPay
- Autres moyens de paiement (virement, espèces)

#### 4. Tableau de bord abonnements (admin)
- Statistiques globales
- Abonnements expirant bientôt (alertes)
- Graphiques de revenus
- Taux de renouvellement

#### 5. Notifications
- Alertes pour abonnements expirant bientôt
- Notifications de paiements reçus
- Changements de statut

### Types TypeScript à créer

```typescript
enum StatutAbonnement {
  ACTIF = 'actif',
  EXPIRE = 'expire',
  SUSPENDU = 'suspendu',
  EN_ATTENTE = 'en_attente'
}

interface Abonnement {
  id: string;
  ecole_id: string;
  site_id: string;
  sirene_id: string;
  parent_abonnement_id: string | null;
  numero_abonnement: string;
  date_debut: string; // ISO date
  date_fin: string; // ISO date
  montant: number;
  statut: StatutAbonnement;
  auto_renouvellement: boolean;
  notes: string | null;
  qr_code_path: string | null;
  qr_code_url: string; // Calculé
  created_at: string;
  updated_at: string;

  // Relations
  ecole?: Ecole;
  site?: Site;
  sirene?: Sirene;
  paiements?: Paiement[];
  token?: TokenSirene;
}

interface Paiement {
  id: string;
  abonnement_id: string;
  ecole_id: string;
  numero_transaction: string;
  montant: number;
  moyen: 'cinetpay' | 'virement' | 'especes';
  statut: 'en_attente' | 'valide' | 'echoue' | 'annule';
  reference_externe: string | null;
  metadata: any;
  date_paiement: string;
  date_validation: string | null;
  created_at: string;
  updated_at: string;
}

interface TokenSirene {
  id: string;
  abonnement_id: string;
  sirene_id: string;
  site_id: string;
  token_crypte: string;
  date_debut: string;
  date_fin: string;
  actif: boolean;
  date_generation: string;
  date_expiration: string;
  date_activation: string | null;
}
```

### Services API à créer

```typescript
// services/api/abonnement.service.ts
class AbonnementService {
  // CRUD
  getAll(perPage?: number)
  getById(id: string)
  update(id: string, data: Partial<Abonnement>)
  delete(id: string)

  // Cycle de vie
  renouveler(id: string)
  suspendre(id: string, raison: string)
  reactiver(id: string)
  annuler(id: string, raison: string)
  regenererQrCode(id: string)
  regenererToken(id: string)

  // Recherche
  getAbonnementActif(ecoleId: string)
  getAbonnementsByEcole(ecoleId: string)
  getAbonnementsBySirene(sireneId: string)
  getExpirantBientot(jours?: number)
  getExpires()
  getActifs()
  getEnAttente()

  // Vérifications
  estValide(id: string)
  ecoleAAbonnementActif(ecoleId: string)
  peutEtreRenouvele(id: string)

  // Statistiques
  getStatistiques()
  getRevenusPeriode(dateDebut: string, dateFin: string)
  getTauxRenouvellement()

  // Calculs
  getPrixRenouvellement(id: string)
  getJoursRestants(id: string)

  // QR Code
  getQrCodeUrl(id: string)
  telechargerQrCode(id: string)
}
```

### Intégration avec le code existant

1. **Menu de navigation**: Ajouter section "Abonnements"
2. **Dashboard école**: Afficher statut abonnement actif
3. **Gestion des sites**: Lier avec abonnements
4. **Gestion des sirènes**: Afficher abonnements associés
5. **Système de paiement**: Intégrer CinetPay

### Permissions requises

- `voir_les_abonnements` - Lister tous les abonnements
- `voir_abonnement` - Voir un abonnement
- `modifier_abonnement` - Modifier/Suspendre/Réactiver/Annuler/Renouveler
- `supprimer_abonnement` - Supprimer un abonnement
- `voir_tableau_de_bord` - Voir les statistiques

## Recommandations pour le Frontend

1. **Utiliser React Query** pour la gestion du cache des abonnements
2. **Notifications en temps réel** pour les changements de statut
3. **Alertes visuelles** pour les abonnements expirant dans moins de 30 jours
4. **QR Code Scanner** pour accès rapide aux détails via mobile
5. **Formulaire de paiement** avec validation côté client
6. **Dashboard interactif** avec graphiques (Chart.js ou Recharts)
7. **Export des données** (PDF, Excel) pour les rapports

## Prochaines étapes

1. Créer les types TypeScript
2. Implémenter le service API
3. Créer les composants de base (badges, cartes d'abonnement)
4. Développer les pages principales
5. Intégrer CinetPay
6. Ajouter les tests unitaires
7. Documenter l'utilisation

## Notes importantes

- Tous les IDs utilisent le format ULID (26 caractères)
- Les dates sont au format ISO 8601
- Les URLs du QR code sont signées et expirent après 1 heure
- Le système supporte le soft delete (deleted_at)
- Les montants sont en décimal (10,2)
- Le renouvellement crée un nouvel abonnement lié au parent
