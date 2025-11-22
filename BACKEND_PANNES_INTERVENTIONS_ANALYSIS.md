# Analyse du Système de Gestion des Pannes et Interventions

## Vue d'ensemble

Ce document analyse le système complet de gestion des pannes, ordres de mission, interventions et rapports d'intervention dans l'application Sirène École.

## Workflow Global

```
1. PANNE déclarée → 2. ORDRE DE MISSION créé → 3. CANDIDATURES techniciens
   → 4. INTERVENTION planifiée → 5. RAPPORT soumis → 6. PANNE clôturée
```

## 1. Modèle Panne

### Structure

**Fichier**: `app/Models/Panne.php`

**Champs principaux**:
- `id` (ULID) - Identifiant unique
- `ecole_id` (ULID) - École concernée
- `sirene_id` (ULID) - Sirène en panne
- `site_id` (ULID) - Site de l'école
- `numero_panne` (string, unique) - Numéro auto-généré
- `description` (text) - Description de la panne
- `date_signalement` (datetime) - Date de signalement
- `priorite` (enum) - Niveau de priorité
- `statut` (enum) - Statut actuel
- `date_declaration` (datetime) - Date de déclaration
- `date_validation` (datetime) - Date de validation
- `valide_par` (ULID) - Admin qui a validé
- `est_cloture` (boolean) - Panne clôturée

### Statuts de Panne

**Enum**: `StatutPanne`
- `declaree` - Panne déclarée par l'école
- `validee` - Validée par l'admin
- `assignee` - Techniciens assignés
- `en_cours` - Intervention en cours
- `resolue` - Panne résolue
- `cloturee` - Panne clôturée

### Priorités

**Enum**: `PrioritePanne`
- `basse` - Basse priorité
- `moyenne` - Priorité moyenne
- `haute` - Haute priorité
- `urgente` - Urgence

### Relations

- `ecole()` - BelongsTo Ecole
- `sirene()` - BelongsTo Sirene
- `site()` - BelongsTo Site
- `validePar()` - BelongsTo User
- `interventions()` - HasMany Intervention

### API Endpoints Panne

#### Déclarer une panne
```
POST /api/sirenes/{id}/declarer-panne
Body: {
  "description": "La sirène ne sonne plus",
  "priorite": "moyenne" // optional: basse|moyenne|haute|urgente
}
```

#### Valider une panne
```
PUT /api/pannes/{panneId}/valider
Body: {
  "nombre_techniciens_requis": 2, // OBLIGATOIRE
  "date_debut_candidature": "2025-11-10",
  "date_fin_candidature": "2025-11-15",
  "commentaire": "Intervention urgente"
}
```
**Note**: Crée automatiquement un ordre de mission

#### Clôturer une panne
```
PUT /api/pannes/{panneId}/cloturer
```

## 2. Modèle OrdreMission

### Structure

**Fichier**: `app/Models/OrdreMission.php`

**Champs principaux**:
- `id` (ULID) - Identifiant unique
- `panne_id` (ULID) - Panne associée
- `ville_id` (ULID) - Ville de la mission
- `date_generation` (datetime) - Date de génération
- `date_debut_candidature` (datetime, nullable) - Début candidatures
- `date_fin_candidature` (datetime, nullable) - Fin candidatures
- `nombre_techniciens_requis` (integer) - Nombre requis
- `nombre_techniciens_acceptes` (integer) - Nombre acceptés
- `candidature_cloturee` (boolean) - Clôture manuelle
- `date_cloture_candidature` (datetime, nullable) - Date clôture
- `cloture_par` (ULID, nullable) - Admin qui a clôturé
- `valide_par` (ULID, nullable) - Admin validateur
- `statut` (enum) - Statut de l'ordre
- `commentaire` (text, nullable) - Commentaires
- `numero_ordre` (string, unique) - Numéro auto-généré

### Statuts OrdreMission

**Enum**: `StatutOrdreMission`
- `en_attente` - En attente de candidatures
- `en_cours` - Candidatures en cours / Intervention en cours
- `termine` - Mission terminée
- `cloture` - Mission clôturée

### Relations

- `panne()` - BelongsTo Panne
- `ville()` - BelongsTo Ville
- `validePar()` - BelongsTo User
- `cloturePar()` - BelongsTo User
- `techniciens()` - HasMany MissionTechnicien (acceptés seulement)
- `missionsTechniciens()` - HasMany MissionTechnicien (tous)
- `interventions()` - HasMany Intervention

### Méthodes Helper

```php
candidatureOuverte(): bool
  - Retourne true si candidatures ouvertes
  - Vérifie: clôture manuelle, quota, dates

nombreTechniciensAtteint(): bool
  - Retourne true si quota atteint

peutAccepterTechnicien(): bool
  - Retourne true si peut encore accepter
```

### API Endpoints OrdreMission

#### Lister tous les ordres de mission
```
GET /api/ordres-mission?per_page=15
```

#### Détails d'un ordre de mission
```
GET /api/ordres-mission/{id}
```

#### Créer un ordre de mission
```
POST /api/ordres-mission
Body: {
  "panne_id": "01...",
  "ville_id": "01...",
  "valide_par": "01...",
  "nombre_techniciens_requis": 2,
  "date_debut_candidature": "2025-11-10",
  "date_fin_candidature": "2025-11-15",
  "commentaire": "..."
}
```

#### Obtenir les candidatures
```
GET /api/ordres-mission/{id}/candidatures
```

#### Filtrer par ville
```
GET /api/ordres-mission/ville/{villeId}
```

#### Clôturer les candidatures
```
PUT /api/ordres-mission/{id}/cloturer-candidatures
Body: {
  "admin_id": "01..."
}
```

#### Rouvrir les candidatures
```
PUT /api/ordres-mission/{id}/rouvrir-candidatures
Body: {
  "admin_id": "01..."
}
```

## 3. Modèle MissionTechnicien (Candidature)

### Structure

Représente une candidature de technicien pour un ordre de mission.

**Table pivot**: `missions_techniciens`

**Champs**:
- `id` (ULID)
- `ordre_mission_id` (ULID)
- `technicien_id` (ULID)
- `statut_candidature` (enum) - Statut de la candidature
- `statut` (enum) - Statut de la mission
- `date_acceptation` (datetime, nullable)
- `date_cloture` (datetime, nullable)
- `date_retrait` (datetime, nullable)
- `motif_retrait` (text, nullable)

### Statuts Candidature

**Enum**: `StatutCandidature`
- `en_attente` - Candidature en attente
- `acceptee` - Candidature acceptée
- `refusee` - Candidature refusée
- `retiree` - Candidature retirée par le technicien

### Statuts Mission

**Enum**: `StatutMission`
- `non_demarree` - Non démarrée
- `en_cours` - En cours
- `terminee` - Terminée
- `annulee` - Annulée

## 4. Modèle Intervention

### Structure

**Fichier**: `app/Models/Intervention.php`

**Champs principaux**:
- `id` (ULID) - Identifiant unique
- `panne_id` (ULID) - Panne associée
- `ordre_mission_id` (ULID) - Ordre de mission
- `type_intervention` (enum) - Type d'intervention
- `nombre_techniciens_requis` (integer) - Nombre de techniciens
- `date_intervention` (datetime, nullable) - Date planifiée
- `date_affectation` (datetime, nullable) - Date d'affectation
- `date_assignation` (datetime, nullable) - Date d'assignation
- `date_acceptation` (datetime, nullable) - Date d'acceptation
- `date_debut` (datetime, nullable) - Début réel
- `date_fin` (datetime, nullable) - Fin réelle
- `statut` (enum) - Statut de l'intervention
- `old_statut` (enum, nullable) - Ancien statut
- `note_ecole` (integer, nullable) - Note de l'école (1-5)
- `commentaire_ecole` (text, nullable) - Commentaire école
- `observations` (text, nullable) - Observations
- `instructions` (text, nullable) - Instructions
- `lieu_rdv` (string, nullable) - Lieu de rendez-vous
- `heure_rdv` (time, nullable) - Heure de rendez-vous

### Types d'Intervention

**Enum**: `TypeIntervention`
- `inspection` - Inspection sur site
- `constat` - Constat de panne
- `reparation` - Réparation
- `installation` - Installation
- `maintenance` - Maintenance
- `autre` - Autre

### Statuts Intervention

**Enum**: `StatutIntervention`
- `planifiee` - Intervention planifiée
- `assignee` - Technicien(s) assigné(s)
- `acceptee` - Acceptée par technicien(s)
- `en_cours` - En cours d'exécution
- `terminee` - Terminée
- `annulee` - Annulée

### Relations

- `panne()` - BelongsTo Panne
- `ordreMission()` - BelongsTo OrdreMission
- `techniciens()` - BelongsToMany Technicien (via `intervention_technicien`)
- `rapports()` - HasMany RapportIntervention
- `rapport()` - HasOne RapportIntervention (le plus récent)
- `avis()` - HasMany AvisIntervention

### API Endpoints Intervention

#### Lister toutes les interventions
```
GET /api/interventions?per_page=15
```

#### Détails d'une intervention
```
GET /api/interventions/{id}
```

#### Soumettre une candidature
```
POST /api/interventions/ordres-mission/{ordreMissionId}/candidature
Body: {
  "technicien_id": "01..."
}
```

#### Accepter une candidature
```
PUT /api/interventions/candidatures/{missionTechnicienId}/accepter
Body: {
  "admin_id": "01..."
}
```
**Note**: Crée automatiquement une intervention

#### Refuser une candidature
```
PUT /api/interventions/candidatures/{missionTechnicienId}/refuser
Body: {
  "admin_id": "01..."
}
```

#### Retirer sa candidature (technicien)
```
PUT /api/interventions/candidatures/{missionTechnicienId}/retirer
Body: {
  "motif_retrait": "Indisponibilité imprévue"
}
```

#### Créer une intervention manuellement
```
POST /api/interventions/ordres-mission/{ordreMissionId}/creer
Body: {
  "type_intervention": "reparation",
  "nombre_techniciens_requis": 2,
  "date_intervention": "2025-11-20",
  "instructions": "...",
  "lieu_rdv": "Entrée principale",
  "heure_rdv": "09:00",
  "technicien_ids": ["01...", "01..."]
}
```

#### Assigner un technicien
```
POST /api/interventions/{interventionId}/techniciens
Body: {
  "technicien_id": "01...",
  "role": "Chef d'équipe" // optional
}
```

#### Retirer un technicien
```
DELETE /api/interventions/{interventionId}/techniciens
Body: {
  "technicien_id": "01..."
}
```

#### Planifier une intervention
```
PUT /api/interventions/{interventionId}/planifier
Body: {
  "date_intervention": "2025-11-20",
  "instructions": "...",
  "lieu_rdv": "...",
  "heure_rdv": "09:00"
}
```

#### Démarrer une intervention
```
PUT /api/interventions/{interventionId}/demarrer
Body: {
  "technicien_id": "01..."
}
```

#### Terminer une intervention
```
PUT /api/interventions/{interventionId}/terminer
Body: {
  "technicien_id": "01..."
}
```

#### Retirer de la mission (annuler)
```
PUT /api/interventions/{interventionId}/retirer-mission
Body: {
  "admin_id": "01...",
  "raison": "Panne résolue autrement"
}
```

#### Rédiger un rapport
```
POST /api/interventions/{interventionId}/rapport
Body: {
  "technicien_id": "01...", // optional, si null = rapport collectif
  "rapport": "Description complète",
  "diagnostic": "...",
  "travaux_effectues": "...",
  "pieces_utilisees": "...",
  "resultat": "resolu", // resolu|partiellement_resolu|non_resolu
  "recommandations": "...",
  "photos": ["url1", "url2"]
}
```

#### Noter une intervention (école)
```
PUT /api/interventions/{interventionId}/noter
Body: {
  "note": 5, // 1-5
  "commentaire": "Excellent travail"
}
```

#### Noter un rapport (admin)
```
PUT /api/interventions/rapports/{rapportId}/noter
Body: {
  "review_note": 5,
  "review_admin": "Rapport complet et détaillé"
}
```

#### Ajouter un avis sur une intervention
```
POST /api/interventions/{interventionId}/avis
Body: {
  "auteur_id": "01...",
  "commentaire": "...",
  "note": 4
}
```

#### Obtenir les avis d'une intervention
```
GET /api/interventions/{interventionId}/avis
```

#### Ajouter un avis sur un rapport
```
POST /api/interventions/rapports/{rapportId}/avis
Body: {
  "auteur_id": "01...",
  "commentaire": "...",
  "note": 5
}
```

#### Obtenir les avis d'un rapport
```
GET /api/interventions/rapports/{rapportId}/avis
```

## 5. Modèle RapportIntervention

### Structure

**Fichier**: `app/Models/RapportIntervention.php`

**Champs principaux**:
- `id` (ULID) - Identifiant unique
- `intervention_id` (ULID) - Intervention associée
- `technicien_id` (ULID, nullable) - Technicien (null = collectif)
- `rapport` (text) - Rapport complet
- `date_soumission` (datetime) - Date de soumission
- `statut` (enum) - Statut du rapport
- `photo_url` (array) - URLs des photos (deprecated)
- `review_note` (integer, nullable) - Note admin (1-5)
- `review_admin` (text, nullable) - Revue admin
- `diagnostic` (text, nullable) - Diagnostic
- `travaux_effectues` (text, nullable) - Travaux réalisés
- `pieces_utilisees` (text, nullable) - Pièces utilisées
- `resultat` (enum) - Résultat de l'intervention
- `recommandations` (text, nullable) - Recommandations
- `photos` (array) - URLs des photos
- `date_rapport` (datetime, nullable) - Date du rapport

### Statuts Rapport

**Enum**: `StatutRapportIntervention`
- `en_attente` - En attente de validation
- `valide` - Validé par admin
- `rejete` - Rejeté
- `en_revision` - En cours de révision

### Résultats

**Enum**: `ResultatIntervention`
- `resolu` - Problème résolu
- `partiellement_resolu` - Partiellement résolu
- `non_resolu` - Non résolu

### Relations

- `intervention()` - BelongsTo Intervention
- `technicien()` - BelongsTo Technicien (nullable)
- `avis()` - HasMany AvisRapport

### Méthodes Helper

```php
estRapportCollectif(): bool
  - Retourne true si rapport collectif (technicien_id null)

estRapportIndividuel(): bool
  - Retourne true si rapport individuel
```

## Workflow Complet - Exemple

### 1. Déclaration de Panne
```
École → Déclare panne sur sirène
Statut Panne: DECLAREE
```

### 2. Validation par Admin
```
Admin → Valide la panne
  - Spécifie nombre de techniciens requis
  - Optionnel: dates de candidature
  - Crée automatiquement un ordre de mission

Statut Panne: VALIDEE
Statut OrdreMission: EN_ATTENTE
```

### 3. Candidatures Techniciens
```
Technicien 1 → Soumet candidature
Technicien 2 → Soumet candidature
Technicien 3 → Soumet candidature

StatutCandidature: EN_ATTENTE (pour chaque)
```

### 4. Acceptation Candidatures
```
Admin → Accepte Technicien 1
Admin → Accepte Technicien 2
  - Crée automatiquement interventions
  - Met à jour nombre_techniciens_acceptes

StatutCandidature: ACCEPTEE
Statut Intervention: PLANIFIEE
```

### 5. Planification
```
Admin → Planifie l'intervention
  - Date, heure, lieu
  - Instructions spéciales

Statut Intervention: ASSIGNEE
```

### 6. Exécution
```
Technicien → Démarre intervention
Statut Intervention: EN_COURS

Technicien → Effectue réparation

Technicien → Termine intervention
Statut Intervention: TERMINEE
```

### 7. Rapport
```
Technicien → Soumet rapport
  - Diagnostic
  - Travaux effectués
  - Pièces utilisées
  - Photos
  - Résultat: RESOLU

Admin → Valide rapport
Statut Panne: RESOLUE
```

### 8. Clôture
```
Admin → Clôture panne
Statut Panne: CLOTUREE
Statut OrdreMission: TERMINE
```

### 9. Évaluation (optionnel)
```
École → Note l'intervention (1-5)
École → Laisse un avis
```

## Impact sur le Frontend

### Pages/Composants à créer

#### 1. Liste des Pannes
- Tableau avec filtres par statut, priorité, école
- Badges colorés pour statuts/priorités
- Actions: voir détails, valider, clôturer
- Indicateurs visuels: pannes urgentes

#### 2. Détails d'une Panne
- Informations complètes (école, sirène, site)
- Historique des changements de statut
- Interventions liées
- Timeline du processus
- Actions contextuelles selon statut

#### 3. Ordres de Mission - Liste
- Filtres: ville, statut, dates
- Affichage nombre candidatures / requis
- Badge "Candidatures ouvertes/fermées"
- Progression quota techniciens

#### 4. Ordre de Mission - Détails
- Informations panne associée
- Liste des candidatures avec statuts
- Actions: accepter/refuser candidatures
- Clôturer/rouvrir candidatures
- Créer intervention manuelle

#### 5. Gestion des Candidatures (Technicien)
- Liste ordres de mission disponibles
- Filtres: ville, dates, priorité
- Soumettre candidature
- Retirer candidature
- Statut de mes candidatures

#### 6. Interventions - Liste
- Vue calendrier ET vue liste
- Filtres: technicien, statut, dates, type
- Indicateurs: en retard, aujourd'hui, à venir
- Code couleur par statut

#### 7. Intervention - Détails
- Informations complètes
- Détails panne et ordre de mission
- Équipe de techniciens
- Planification (date, lieu, instructions)
- Actions: démarrer, terminer, annuler
- Formulaire de rapport
- Rapports soumis
- Avis et notes

#### 8. Rapport d'Intervention - Formulaire
- Upload photos multiple
- Champs: diagnostic, travaux, pièces
- Sélection résultat
- Recommandations
- Mode: individuel OU collectif

#### 9. Rapports - Liste (Admin)
- Filtres: statut, technicien, date
- Notes et validations
- Actions: valider, rejeter, demander révision

#### 10. Dashboard Technicien
- Mes candidatures en attente
- Mes interventions du jour
- Mes interventions à venir
- Historique interventions
- Statistiques personnelles

#### 11. Dashboard Admin - Pannes
- Pannes par statut (graphiques)
- Pannes urgentes non assignées
- Temps moyen de résolution
- Taux de résolution
- Pannes par école/ville

### Types TypeScript

```typescript
// Enums
enum StatutPanne {
  DECLAREE = 'declaree',
  VALIDEE = 'validee',
  ASSIGNEE = 'assignee',
  EN_COURS = 'en_cours',
  RESOLUE = 'resolue',
  CLOTUREE = 'cloturee'
}

enum PrioritePanne {
  BASSE = 'basse',
  MOYENNE = 'moyenne',
  HAUTE = 'haute',
  URGENTE = 'urgente'
}

enum StatutOrdreMission {
  EN_ATTENTE = 'en_attente',
  EN_COURS = 'en_cours',
  TERMINE = 'termine',
  CLOTURE = 'cloture'
}

enum StatutCandidature {
  EN_ATTENTE = 'en_attente',
  ACCEPTEE = 'acceptee',
  REFUSEE = 'refusee',
  RETIREE = 'retiree'
}

enum StatutIntervention {
  PLANIFIEE = 'planifiee',
  ASSIGNEE = 'assignee',
  ACCEPTEE = 'acceptee',
  EN_COURS = 'en_cours',
  TERMINEE = 'terminee',
  ANNULEE = 'annulee'
}

enum TypeIntervention {
  INSPECTION = 'inspection',
  CONSTAT = 'constat',
  REPARATION = 'reparation',
  INSTALLATION = 'installation',
  MAINTENANCE = 'maintenance',
  AUTRE = 'autre'
}

enum ResultatIntervention {
  RESOLU = 'resolu',
  PARTIELLEMENT_RESOLU = 'partiellement_resolu',
  NON_RESOLU = 'non_resolu'
}

// Interfaces
interface Panne {
  id: string;
  ecole_id: string;
  sirene_id: string;
  site_id: string;
  numero_panne: string;
  description: string;
  date_signalement: string;
  priorite: PrioritePanne;
  statut: StatutPanne;
  date_declaration: string | null;
  date_validation: string | null;
  valide_par: string | null;
  est_cloture: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  ecole?: Ecole;
  sirene?: Sirene;
  site?: Site;
  validePar?: User;
  interventions?: Intervention[];
}

interface OrdreMission {
  id: string;
  panne_id: string;
  ville_id: string;
  date_generation: string;
  date_debut_candidature: string | null;
  date_fin_candidature: string | null;
  nombre_techniciens_requis: number;
  nombre_techniciens_acceptes: number;
  candidature_cloturee: boolean;
  date_cloture_candidature: string | null;
  cloture_par: string | null;
  valide_par: string | null;
  statut: StatutOrdreMission;
  commentaire: string | null;
  numero_ordre: string;
  created_at: string;
  updated_at: string;

  // Relations
  panne?: Panne;
  ville?: Ville;
  validePar?: User;
  cloturePar?: User;
  missionsTechniciens?: MissionTechnicien[];
  interventions?: Intervention[];
}

interface MissionTechnicien {
  id: string;
  ordre_mission_id: string;
  technicien_id: string;
  statut_candidature: StatutCandidature;
  statut: StatutMission;
  date_acceptation: string | null;
  date_cloture: string | null;
  date_retrait: string | null;
  motif_retrait: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  ordreMission?: OrdreMission;
  technicien?: Technicien;
}

interface Intervention {
  id: string;
  panne_id: string;
  ordre_mission_id: string;
  type_intervention: TypeIntervention | null;
  nombre_techniciens_requis: number;
  date_intervention: string | null;
  date_affectation: string | null;
  date_assignation: string | null;
  date_acceptation: string | null;
  date_debut: string | null;
  date_fin: string | null;
  statut: StatutIntervention;
  old_statut: StatutIntervention | null;
  note_ecole: number | null;
  commentaire_ecole: string | null;
  observations: string | null;
  instructions: string | null;
  lieu_rdv: string | null;
  heure_rdv: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  panne?: Panne;
  ordreMission?: OrdreMission;
  techniciens?: Technicien[];
  rapports?: RapportIntervention[];
  avis?: AvisIntervention[];
}

interface RapportIntervention {
  id: string;
  intervention_id: string;
  technicien_id: string | null; // null = rapport collectif
  rapport: string;
  date_soumission: string;
  statut: StatutRapportIntervention;
  photo_url: string[];
  review_note: number | null;
  review_admin: string | null;
  diagnostic: string | null;
  travaux_effectues: string | null;
  pieces_utilisees: string | null;
  resultat: ResultatIntervention;
  recommandations: string | null;
  photos: string[];
  date_rapport: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  intervention?: Intervention;
  technicien?: Technicien | null;
  avis?: AvisRapport[];
}
```

### Services API à créer

```typescript
// services/api/panne.service.ts
class PanneService {
  declarer(sireneId: string, data: {description: string, priorite?: PrioritePanne})
  valider(panneId: string, data: {
    nombre_techniciens_requis: number,
    date_debut_candidature?: string,
    date_fin_candidature?: string,
    commentaire?: string
  })
  cloturer(panneId: string)
}

// services/api/ordreMission.service.ts
class OrdreMissionService {
  getAll(perPage?: number)
  getById(id: string)
  create(data: OrdreMissionCreate)
  update(id: string, data: Partial<OrdreMission>)
  delete(id: string)
  getCandidatures(id: string)
  getByVille(villeId: string)
  cloturerCandidatures(id: string, adminId: string)
  rouvrirCandidatures(id: string, adminId: string)
}

// services/api/intervention.service.ts
class InterventionService {
  getAll(perPage?: number)
  getById(id: string)

  // Candidatures
  soumettreCandidature(ordreMissionId: string, technicienId: string)
  accepterCandidature(missionTechnicienId: string, adminId: string)
  refuserCandidature(missionTechnicienId: string, adminId: string)
  retirerCandidature(missionTechnicienId: string, motif: string)

  // Création & Gestion
  creerIntervention(ordreMissionId: string, data: InterventionCreate)
  assignerTechnicien(interventionId: string, technicienId: string, role?: string)
  retirerTechnicien(interventionId: string, technicienId: string)
  planifier(interventionId: string, data: InterventionPlan)

  // Cycle de vie
  demarrer(interventionId: string, technicienId: string)
  terminer(interventionId: string, technicienId: string)
  retirerMission(interventionId: string, adminId: string, raison: string)

  // Rapport
  redigerRapport(interventionId: string, data: RapportCreate)

  // Notations
  noterIntervention(interventionId: string, note: number, commentaire?: string)
  noterRapport(rapportId: string, reviewNote: number, reviewAdmin?: string)

  // Avis
  ajouterAvisIntervention(interventionId: string, data: AvisCreate)
  getAvisIntervention(interventionId: string)
  ajouterAvisRapport(rapportId: string, data: AvisCreate)
  getAvisRapport(rapportId: string)
}
```

## Permissions Requises

### Pannes
- `creer_panne` - Déclarer une panne
- `modifier_panne` - Valider une panne
- `resoudre_panne` - Clôturer une panne

### Ordres de Mission
- `voir_les_ordres_mission` - Lister les ordres
- `voir_ordre_mission` - Voir un ordre
- `creer_ordre_mission` - Créer un ordre
- `modifier_ordre_mission` - Modifier un ordre
- `supprimer_ordre_mission` - Supprimer un ordre

### Interventions
- `voir_les_interventions` - Lister interventions
- `voir_intervention` - Voir une intervention
- `creer_intervention` - Créer intervention
- `modifier_intervention` - Modifier intervention
- `supprimer_intervention` - Supprimer intervention
- `assigner_technicien_intervention` - Assigner technicien
- `demarrer_intervention` - Démarrer intervention
- `terminer_intervention` - Terminer intervention

### Candidatures
- `creer_mission_technicien` - Soumettre candidature
- `modifier_mission_technicien` - Gérer candidature

## Recommandations Frontend

1. **Notifications en temps réel**
   - Nouvelle panne déclarée
   - Nouvel ordre de mission disponible
   - Candidature acceptée/refusée
   - Intervention planifiée/modifiée
   - Rapport soumis

2. **Calendrier interactif**
   - Vue mensuelle/hebdomadaire/journalière
   - Drag & drop pour planification
   - Code couleur par type/statut
   - Filtres multiples

3. **Workflow visuel**
   - Stepper/Timeline pour le processus complet
   - Indicateurs de progression
   - États en temps réel

4. **Formulaires intelligents**
   - Validation côté client
   - Upload photos avec preview
   - Auto-complétion adresses
   - Géolocalisation

5. **Tableaux de bord**
   - KPIs temps réel
   - Graphiques interactifs
   - Exportation PDF/Excel
   - Filtres sauvegardés

6. **Responsive**
   - Mobile-first pour techniciens
   - Mode hors-ligne pour rapports terrain
   - Synchronisation automatique

## Cas d'Usage Particuliers

### Urgence
```
Panne urgente → Validation immédiate → Notification tous techniciens ville
→ Premier accepté → Intervention créée automatiquement
```

### Équipe Multiple
```
Ordre mission (3 techniciens) → Accepter 3 candidatures
→ 1 intervention avec 3 techniciens
→ Rapport collectif OU 3 rapports individuels
```

### Annulation
```
Technicien indisponible → Retire candidature (motif)
→ Si quota non atteint → Rouvrir candidatures
→ Nouveau technicien peut candidater
```

### Modification Planning
```
Intervention planifiée → Technicien demande changement date
→ Admin modifie planning → Notifications envoyées
→ Technicien confirme nouvelle date
```

## Notes Importantes

- **ULIDs** partout pour les IDs (26 caractères)
- **Soft deletes** sur tous les modèles
- **Dates ISO 8601** pour tous les timestamps
- **Pagination** par défaut à 15 items
- **Relations eager loading** pour performances
- **Photos** stockées dans `storage/app/public/interventions/{id}/`
- **Numéros auto-générés** pour pannes et ordres de mission
- **Candidatures** peuvent être retirées avant acceptation
- **Interventions** peuvent avoir plusieurs techniciens (équipe)
- **Rapports** individuels OU collectifs selon besoin
