# Plan d'Intégration API - OrdreMissionDetailPage

## Vue d'ensemble

Ce document présente le plan d'intégration des 28 handlers frontend avec les endpoints backend, en distinguant :
- ✅ **Endpoints EXISTANTS** : Déjà documentés dans l'API
- 🆕 **Endpoints À CRÉER** : Nécessitent un développement backend

---

## 1. INTERVENTIONS (12 handlers)

### 1.1 ✅ handleDemarrerIntervention (EXISTANT)
**Frontend Handler**: `OrdreMissionDetailPage.vue:1128`
```typescript
const handleDemarrerIntervention = (intervention: any) => {
  // Appel API existant
  PUT /api/interventions/{interventionId}/demarrer
}
```

**Backend API Existant**:
- **Endpoint**: `PUT /api/interventions/{interventionId}/demarrer`
- **Auth**: Bearer token
- **Roles**: Technicien assigné
- **Request Body**: Aucun
- **Response**: `InterventionResponse`

**Code d'intégration**:
```typescript
const handleDemarrerIntervention = (intervention: any) => {
  showConfirmation(
    'Démarrer l\'intervention',
    `Voulez-vous démarrer l'intervention "${intervention.titre}" ?`,
    async () => {
      try {
        await api.put(`/api/interventions/${intervention.id}/demarrer`)
        notificationStore.success('Intervention démarrée avec succès')
        await loadOrdreMission() // Recharger les données
        showConfirmModal.value = false
      } catch (error) {
        notificationStore.error('Erreur lors du démarrage de l\'intervention')
      }
    }
  )
}
```

---

### 1.2 ✅ handleTerminerIntervention (EXISTANT)
**Frontend Handler**: `OrdreMissionDetailPage.vue:1138`

**Backend API Existant**:
- **Endpoint**: `PUT /api/interventions/{interventionId}/terminer`
- **Auth**: Bearer token
- **Roles**: Technicien assigné
- **Request Body**: Aucun
- **Response**: `InterventionResponse`

**Code d'intégration**:
```typescript
const handleTerminerIntervention = (intervention: any) => {
  showConfirmation(
    'Terminer l\'intervention',
    `Voulez-vous terminer l'intervention "${intervention.titre}" ?`,
    async () => {
      try {
        await api.put(`/api/interventions/${intervention.id}/terminer`)
        notificationStore.success('Intervention terminée avec succès')
        await loadOrdreMission()
        showConfirmModal.value = false
      } catch (error) {
        notificationStore.error('Erreur lors de la terminaison de l\'intervention')
      }
    }
  )
}
```

---

### 1.3 ✅ handleRedigerRapport (EXISTANT - Navigation)
**Frontend Handler**: `OrdreMissionDetailPage.vue:1069`

**Backend API Existant**:
- **Endpoint**: `POST /api/interventions/{interventionId}/rapport`
- **Auth**: Bearer token
- **Roles**: Technicien assigné
- **Request Body**:
```json
{
  "contenu": "string",
  "observations": "string",
  "materielUtilise": ["string"]
}
```
- **Response**: `RapportInterventionResponse`

**Note**: Le handler actuel fait uniquement une navigation. Le rapport est créé dans une page dédiée qui utilise l'endpoint POST existant.

---

### 1.4 ✅ handleAvisIntervention (EXISTANT)
**Frontend Handler**: `OrdreMissionDetailPage.vue:1148`

**Backend API Existant**:
- **Endpoint**: `POST /api/interventions/{interventionId}/avis`
- **Auth**: Bearer token
- **Roles**: Admin, École
- **Request Body**:
```json
{
  "note": 5,
  "commentaire": "Excellent travail",
  "recommande": true
}
```
- **Response**: `AvisInterventionResponse`

**Code d'intégration**:
```typescript
const handleAvisIntervention = (intervention: any) => {
  // Ouvrir un modal avec formulaire (note, commentaire, recommande)
  showModal.value = true
  modalContent.value = {
    title: 'Ajouter un avis',
    component: 'AvisForm',
    data: { interventionId: intervention.id },
    onSubmit: async (formData: { note: number; commentaire: string; recommande: boolean }) => {
      try {
        await api.post(`/api/interventions/${intervention.id}/avis`, formData)
        notificationStore.success('Avis ajouté avec succès')
        await loadOrdreMission()
        showModal.value = false
      } catch (error) {
        notificationStore.error('Erreur lors de l\'ajout de l\'avis')
      }
    }
  }
}
```

---

### 1.5 🆕 handleAjouterIntervention (À CRÉER)
**Frontend Handler**: `OrdreMissionDetailPage.vue:1088`

**Backend API À Créer**:
- **Endpoint**: `POST /api/ordres-mission/{ordreMissionId}/interventions`
- **Auth**: Bearer token
- **Roles**: Admin, Technicien assigné
- **Request Body**:
```json
{
  "titre": "Installation serveur",
  "description": "Installation d'un nouveau serveur",
  "typeIntervention": "INSTALLATION",
  "priorite": "HAUTE"
}
```
- **Response**: `InterventionResponse`
- **Status Code**: 201 Created

---

### 1.6 🆕 handleModifierIntervention (À CRÉER)
**Frontend Handler**: `OrdreMissionDetailPage.vue:1098`

**Backend API À Créer**:
- **Endpoint**: `PUT /api/interventions/{interventionId}`
- **Auth**: Bearer token
- **Roles**: Admin, Technicien assigné
- **Request Body**:
```json
{
  "titre": "Installation serveur (modifié)",
  "description": "Description mise à jour",
  "typeIntervention": "MAINTENANCE",
  "priorite": "MOYENNE"
}
```
- **Response**: `InterventionResponse`

---

### 1.7 🆕 handlePlanifierIntervention (À CRÉER)
**Frontend Handler**: `OrdreMissionDetailPage.vue:1108`

**Backend API À Créer**:
- **Endpoint**: `PUT /api/interventions/{interventionId}/planifier`
- **Auth**: Bearer token
- **Roles**: Admin, Technicien assigné
- **Request Body**:
```json
{
  "datePrevue": "2025-12-01T10:00:00Z",
  "dureeEstimee": 120
}
```
- **Response**: `InterventionResponse`

**Condition**: `statut === 'EN_ATTENTE'`

---

### 1.8 🆕 handleReporterIntervention (À CRÉER)
**Frontend Handler**: `OrdreMissionDetailPage.vue:1118`

**Backend API À Créer**:
- **Endpoint**: `PUT /api/interventions/{interventionId}/reporter`
- **Auth**: Bearer token
- **Roles**: Admin, Technicien assigné
- **Request Body**:
```json
{
  "nouvelleDatePrevue": "2025-12-10T10:00:00Z",
  "motif": "Matériel non disponible"
}
```
- **Response**: `InterventionResponse`

**Condition**: `statut === 'PLANIFIEE'`

---

### 1.9 🆕 handleConfirmerIntervention (À CRÉER)
**Frontend Handler**: `OrdreMissionDetailPage.vue:1158`

**Backend API À Créer**:
- **Endpoint**: `PUT /api/interventions/{interventionId}/confirmer`
- **Auth**: Bearer token
- **Roles**: Admin, Technicien assigné
- **Request Body**: Aucun
- **Response**: `InterventionResponse`

**Condition**: `statut === 'PLANIFIEE'`

---

### 1.10 🆕 handleAjouterIntervenantIntervention (À CRÉER)
**Frontend Handler**: `OrdreMissionDetailPage.vue:1168`

**Backend API À Créer**:
- **Endpoint**: `POST /api/interventions/{interventionId}/intervenants`
- **Auth**: Bearer token
- **Roles**: Admin, Technicien principal
- **Request Body**:
```json
{
  "technicienId": "01ARZ3NDEKTSV4RRFFQ69G5FAV"
}
```
- **Response**: `InterventionResponse`

---

### 1.11 🆕 handleRetirerIntervenantIntervention (À CRÉER)
**Frontend Handler**: `OrdreMissionDetailPage.vue:1178`

**Backend API À Créer**:
- **Endpoint**: `DELETE /api/interventions/{interventionId}/intervenants/{technicienId}`
- **Auth**: Bearer token
- **Roles**: Admin, Technicien principal
- **Response**: `InterventionResponse`

---

### 1.12 🆕 handleSupprimerIntervention (À CRÉER)
**Frontend Handler**: `OrdreMissionDetailPage.vue:1188`

**Backend API À Créer**:
- **Endpoint**: `DELETE /api/interventions/{interventionId}`
- **Auth**: Bearer token
- **Roles**: Admin
- **Response**: 204 No Content

**Condition**: `statut === 'EN_ATTENTE' || statut === 'ANNULEE'`

---

## 2. CANDIDATURES (5 handlers)

### 2.1 ✅ handlePostuler (EXISTANT)
**Frontend Handler**: `OrdreMissionDetailPage.vue:907`

**Backend API Existant**:
- **Endpoint**: `POST /api/interventions/ordres-mission/{ordreMissionId}/candidature`
- **Auth**: Bearer token
- **Roles**: Technicien
- **Request Body**:
```json
{
  "message": "Je suis disponible pour cette mission"
}
```
- **Response**: `CandidatureResponse`

**Code existant déjà intégré** ✅

---

### 2.2 ✅ handleCloturerCandidatures (EXISTANT)
**Frontend Handler**: `OrdreMissionDetailPage.vue:946`

**Backend API Existant**: Déjà intégré via l'API missions
- **Endpoint**: `PUT /api/ordres-mission/{id}/cloturer-candidatures`

**Code existant déjà intégré** ✅

---

### 2.3 ✅ handleAnnulerCandidature (EXISTANT)
**Frontend Handler**: `OrdreMissionDetailPage.vue:963`

**Backend API Existant**:
- **Endpoint**: `PUT /api/interventions/candidatures/{missionTechnicienId}/retirer`
- **Auth**: Bearer token
- **Roles**: Technicien (propriétaire)
- **Response**: `CandidatureResponse`

**Code existant déjà intégré** ✅

---

### 2.4 ✅ handleAccepterCandidat (EXISTANT)
**Frontend Handler**: `OrdreMissionDetailPage.vue:980`

**Backend API Existant**:
- **Endpoint**: `PUT /api/interventions/candidatures/{missionTechnicienId}/accepter`
- **Auth**: Bearer token
- **Roles**: Admin
- **Response**: `CandidatureResponse`

**Code existant déjà intégré** ✅

---

### 2.5 ✅ handleRefuserCandidat (EXISTANT)
**Frontend Handler**: `OrdreMissionDetailPage.vue:1012`

**Backend API Existant**:
- **Endpoint**: `PUT /api/interventions/candidatures/{missionTechnicienId}/refuser`
- **Auth**: Bearer token
- **Roles**: Admin
- **Request Body**:
```json
{
  "motif": "Profil ne correspondant pas"
}
```
- **Response**: `CandidatureResponse`

**Code existant déjà intégré** ✅

---

## 3. INTERVENANTS (4 handlers)

### 3.1 🆕 handleAjouterTechnicien (À CRÉER)
**Frontend Handler**: `OrdreMissionDetailPage.vue:1044`

**Backend API À Créer**:
- **Endpoint**: `POST /api/ordres-mission/{ordreMissionId}/techniciens`
- **Auth**: Bearer token
- **Roles**: Admin
- **Request Body**:
```json
{
  "technicienId": "01ARZ3NDEKTSV4RRFFQ69G5FAV"
}
```
- **Response**: `OrdreMissionResponse`

---

### 3.2 ✅ handleRouvrirCandidatures (EXISTANT)
**Frontend Handler**: `OrdreMissionDetailPage.vue:946`

**Backend API Existant**: Déjà intégré
- **Endpoint**: `PUT /api/ordres-mission/{id}/rouvrir-candidatures`

**Code existant déjà intégré** ✅

---

### 3.3 🆕 handleSuspendreIntervenant (À CRÉER)
**Frontend Handler**: `OrdreMissionDetailPage.vue:1054`

**Backend API À Créer**:
- **Endpoint**: `PUT /api/ordres-mission/{ordreMissionId}/techniciens/{technicienId}/suspendre`
- **Auth**: Bearer token
- **Roles**: Admin
- **Request Body**:
```json
{
  "motif": "Comportement inapproprié",
  "duree": 30
}
```
- **Response**: `OrdreMissionResponse`

---

### 3.4 🆕 handleRetirerIntervenant (À CRÉER)
**Frontend Handler**: `OrdreMissionDetailPage.vue:1064`

**Backend API À Créer**:
- **Endpoint**: `DELETE /api/ordres-mission/{ordreMissionId}/techniciens/{technicienId}`
- **Auth**: Bearer token
- **Roles**: Admin
- **Request Body**:
```json
{
  "motif": "Démission"
}
```
- **Response**: `OrdreMissionResponse`

---

## 4. VUE D'ENSEMBLE - MISSIONS (7 handlers)

### 4.1 🆕 handleModifierMission (À CRÉER)
**Frontend Handler**: `OrdreMissionDetailPage.vue:1198`

**Backend API À Créer**:
- **Endpoint**: `PUT /api/ordres-mission/{id}`
- **Auth**: Bearer token
- **Roles**: Admin
- **Request Body**:
```json
{
  "titre": "Mission modifiée",
  "description": "Description mise à jour",
  "priorite": "HAUTE",
  "ecoleId": "01ARZ3NDEKTSV4RRFFQ69G5FAV"
}
```
- **Response**: `OrdreMissionResponse`

---

### 4.2 🆕 handleDemarrerMission (À CRÉER)
**Frontend Handler**: `OrdreMissionDetailPage.vue:1076`

**Backend API À Créer**:
- **Endpoint**: `PUT /api/ordres-mission/{id}/demarrer`
- **Auth**: Bearer token
- **Roles**: Admin, Technicien assigné
- **Request Body**: Aucun
- **Response**: `OrdreMissionResponse`

**Condition**: `statut === 'EN_ATTENTE' || statut === 'PLANIFIEE'`

---

### 4.3 🆕 handleTerminerMission (À CRÉER)
**Frontend Handler**: `OrdreMissionDetailPage.vue:1208`

**Backend API À Créer**:
- **Endpoint**: `PUT /api/ordres-mission/{id}/terminer`
- **Auth**: Bearer token
- **Roles**: Admin, Technicien assigné
- **Request Body**: Aucun
- **Response**: `OrdreMissionResponse`

**Condition**: `statut === 'EN_COURS'`

---

### 4.4 🆕 handleCloturerMission (À CRÉER)
**Frontend Handler**: `OrdreMissionDetailPage.vue:1218`

**Backend API À Créer**:
- **Endpoint**: `PUT /api/ordres-mission/{id}/cloturer`
- **Auth**: Bearer token
- **Roles**: Admin
- **Request Body**: Aucun
- **Response**: `OrdreMissionResponse`

**Condition**: `statut === 'TERMINEE'`

---

### 4.5 🆕 handleAvisMission (À CRÉER)
**Frontend Handler**: (Nouveau handler à créer)

**Backend API À Créer**:
- **Endpoint**: `POST /api/ordres-mission/{id}/avis`
- **Auth**: Bearer token
- **Roles**: Admin, École
- **Request Body**:
```json
{
  "note": 5,
  "commentaire": "Mission réalisée avec succès",
  "recommande": true
}
```
- **Response**: `AvisMissionResponse`

**Condition**: `statut === 'TERMINEE' || statut === 'CLOTUREE'`

---

### 4.6 🆕 handlePanneResolue (À CRÉER)
**Frontend Handler**: (Nouveau handler à créer)

**Backend API À Créer**:
- **Endpoint**: `PUT /api/ordres-mission/{id}/panne-resolue`
- **Auth**: Bearer token
- **Roles**: Admin, Technicien assigné
- **Request Body**: Aucun
- **Response**: `OrdreMissionResponse`

**Condition**: `typeMission === 'PANNE'`

---

### 4.7 🆕 handleSupprimerMission (À CRÉER)
**Frontend Handler**: (Nouveau handler à créer)

**Backend API À Créer**:
- **Endpoint**: `DELETE /api/ordres-mission/{id}`
- **Auth**: Bearer token
- **Roles**: Admin
- **Response**: 204 No Content

**Condition**: `statut === 'EN_ATTENTE' || statut === 'ANNULEE'`

---

## 📊 RÉSUMÉ

### Statistiques
- **Total handlers**: 28
- **✅ Endpoints EXISTANTS**: 9 (32%)
- **🆕 Endpoints À CRÉER**: 19 (68%)

### Endpoints existants (9)
1. `PUT /api/interventions/{interventionId}/demarrer`
2. `PUT /api/interventions/{interventionId}/terminer`
3. `POST /api/interventions/{interventionId}/rapport`
4. `POST /api/interventions/{interventionId}/avis`
5. `POST /api/interventions/ordres-mission/{ordreMissionId}/candidature`
6. `PUT /api/interventions/candidatures/{missionTechnicienId}/accepter`
7. `PUT /api/interventions/candidatures/{missionTechnicienId}/refuser`
8. `PUT /api/interventions/candidatures/{missionTechnicienId}/retirer`
9. `PUT /api/ordres-mission/{id}/rouvrir-candidatures`

### Endpoints à créer (19)
1. `POST /api/ordres-mission/{ordreMissionId}/interventions`
2. `PUT /api/interventions/{interventionId}`
3. `PUT /api/interventions/{interventionId}/planifier`
4. `PUT /api/interventions/{interventionId}/reporter`
5. `PUT /api/interventions/{interventionId}/confirmer`
6. `POST /api/interventions/{interventionId}/intervenants`
7. `DELETE /api/interventions/{interventionId}/intervenants/{technicienId}`
8. `DELETE /api/interventions/{interventionId}`
9. `POST /api/ordres-mission/{ordreMissionId}/techniciens`
10. `PUT /api/ordres-mission/{ordreMissionId}/techniciens/{technicienId}/suspendre`
11. `DELETE /api/ordres-mission/{ordreMissionId}/techniciens/{technicienId}`
12. `PUT /api/ordres-mission/{id}`
13. `PUT /api/ordres-mission/{id}/demarrer`
14. `PUT /api/ordres-mission/{id}/terminer`
15. `PUT /api/ordres-mission/{id}/cloturer`
16. `POST /api/ordres-mission/{id}/avis`
17. `PUT /api/ordres-mission/{id}/panne-resolue`
18. `DELETE /api/ordres-mission/{id}`
19. `PUT /api/ordres-mission/{id}/cloturer-candidatures` (déjà intégré côté frontend mais besoin vérification backend)

---

## 🎯 PRIORITÉS D'IMPLÉMENTATION

### Phase 1 - HAUTE PRIORITÉ (Fonctionnalités critiques)
**Délai recommandé**: Sprint 1

1. **Gestion du cycle de vie des missions**:
   - `PUT /api/ordres-mission/{id}` - Modifier mission
   - `PUT /api/ordres-mission/{id}/demarrer` - Démarrer mission
   - `PUT /api/ordres-mission/{id}/terminer` - Terminer mission
   - `PUT /api/ordres-mission/{id}/cloturer` - Clôturer mission

2. **Gestion des interventions (CRUD)**:
   - `POST /api/ordres-mission/{ordreMissionId}/interventions` - Ajouter intervention
   - `PUT /api/interventions/{interventionId}` - Modifier intervention
   - `DELETE /api/interventions/{interventionId}` - Supprimer intervention

3. **Planification des interventions**:
   - `PUT /api/interventions/{interventionId}/planifier` - Planifier
   - `PUT /api/interventions/{interventionId}/reporter` - Reporter

### Phase 2 - MOYENNE PRIORITÉ (Amélioration workflow)
**Délai recommandé**: Sprint 2

4. **Gestion des techniciens**:
   - `POST /api/ordres-mission/{ordreMissionId}/techniciens` - Ajouter technicien
   - `DELETE /api/ordres-mission/{ordreMissionId}/techniciens/{technicienId}` - Retirer technicien
   - `PUT /api/ordres-mission/{ordreMissionId}/techniciens/{technicienId}/suspendre` - Suspendre

5. **Gestion des intervenants par intervention**:
   - `POST /api/interventions/{interventionId}/intervenants` - Ajouter intervenant
   - `DELETE /api/interventions/{interventionId}/intervenants/{technicienId}` - Retirer intervenant

### Phase 3 - BASSE PRIORITÉ (Fonctionnalités avancées)
**Délai recommandé**: Sprint 3

6. **Fonctionnalités métier spécifiques**:
   - `PUT /api/interventions/{interventionId}/confirmer` - Confirmer intervention
   - `POST /api/ordres-mission/{id}/avis` - Avis mission
   - `PUT /api/ordres-mission/{id}/panne-resolue` - Panne résolue
   - `DELETE /api/ordres-mission/{id}` - Supprimer mission

---

## 🔧 EXEMPLES D'INTÉGRATION

### Exemple 1: Intégrer un endpoint existant (handleDemarrerIntervention)

```typescript
// OrdreMissionDetailPage.vue
import { api } from '@/services/api'

const handleDemarrerIntervention = (intervention: any) => {
  showConfirmation(
    'Démarrer l\'intervention',
    `Voulez-vous démarrer l'intervention "${intervention.titre}" ?`,
    async () => {
      try {
        const response = await api.put(
          `/api/interventions/${intervention.id}/demarrer`
        )
        notificationStore.success('Intervention démarrée avec succès')

        // Mettre à jour l'intervention locale
        const index = ordreMission.value.interventions.findIndex(
          i => i.id === intervention.id
        )
        if (index !== -1) {
          ordreMission.value.interventions[index] = response.data
        }

        await loadOrdreMission() // Recharger toutes les données
        showConfirmModal.value = false
      } catch (error: any) {
        const message = error.response?.data?.message ||
                       'Erreur lors du démarrage de l\'intervention'
        notificationStore.error(message)
      }
    }
  )
}
```

### Exemple 2: Intégrer un endpoint avec formulaire (handleAvisIntervention)

```typescript
// OrdreMissionDetailPage.vue
const handleAvisIntervention = (intervention: any) => {
  // Ouvrir un modal avec formulaire
  showModal.value = true
  modalContent.value = {
    title: 'Ajouter un avis sur l\'intervention',
    component: 'AvisInterventionForm',
    data: {
      interventionId: intervention.id,
      interventionTitre: intervention.titre
    },
    onSubmit: async (formData: {
      note: number
      commentaire: string
      recommande: boolean
    }) => {
      try {
        // Validation
        if (formData.note < 1 || formData.note > 5) {
          throw new Error('La note doit être entre 1 et 5')
        }

        // Appel API
        await api.post(
          `/api/interventions/${intervention.id}/avis`,
          formData
        )

        notificationStore.success('Avis ajouté avec succès')
        await loadOrdreMission()
        showModal.value = false
      } catch (error: any) {
        const message = error.response?.data?.message ||
                       'Erreur lors de l\'ajout de l\'avis'
        notificationStore.error(message)
      }
    }
  }
}
```

### Exemple 3: Créer un nouvel endpoint backend (handlePlanifierIntervention)

**Backend (Spring Boot)**:
```java
@PutMapping("/{interventionId}/planifier")
@PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIEN')")
public ResponseEntity<InterventionResponse> planifierIntervention(
    @PathVariable String interventionId,
    @RequestBody @Valid PlanifierInterventionRequest request
) {
    // Validation du statut
    Intervention intervention = interventionRepository.findById(interventionId)
        .orElseThrow(() -> new ResourceNotFoundException("Intervention non trouvée"));

    if (intervention.getStatut() != StatutIntervention.EN_ATTENTE) {
        throw new IllegalStateException(
            "Seules les interventions en attente peuvent être planifiées"
        );
    }

    // Vérifier que la date est dans le futur
    if (request.getDatePrevue().isBefore(LocalDateTime.now())) {
        throw new IllegalArgumentException("La date prévue doit être dans le futur");
    }

    // Mise à jour
    intervention.setDatePrevue(request.getDatePrevue());
    intervention.setDureeEstimee(request.getDureeEstimee());
    intervention.setStatut(StatutIntervention.PLANIFIEE);

    Intervention saved = interventionRepository.save(intervention);
    return ResponseEntity.ok(interventionMapper.toResponse(saved));
}
```

**Frontend**:
```typescript
const handlePlanifierIntervention = (intervention: any) => {
  // Ouvrir un modal avec date picker
  showModal.value = true
  modalContent.value = {
    title: 'Planifier l\'intervention',
    component: 'PlanifierInterventionForm',
    data: { interventionId: intervention.id },
    onSubmit: async (formData: {
      datePrevue: string
      dureeEstimee: number
    }) => {
      try {
        await api.put(
          `/api/interventions/${intervention.id}/planifier`,
          formData
        )
        notificationStore.success('Intervention planifiée avec succès')
        await loadOrdreMission()
        showModal.value = false
      } catch (error: any) {
        const message = error.response?.data?.message ||
                       'Erreur lors de la planification'
        notificationStore.error(message)
      }
    }
  }
}
```

---

## 📝 CHECKLIST D'IMPLÉMENTATION

### Pour chaque endpoint À CRÉER:

#### Backend
- [ ] Créer le controller endpoint
- [ ] Implémenter la logique métier dans le service
- [ ] Ajouter les validations (statut, roles, business rules)
- [ ] Créer les DTOs (Request/Response)
- [ ] Ajouter les tests unitaires
- [ ] Ajouter les tests d'intégration
- [ ] Documenter l'endpoint dans OpenAPI/Swagger
- [ ] Vérifier la sécurité (@PreAuthorize)

#### Frontend
- [ ] Remplacer le `notificationStore.info('À implémenter')` par l'appel API réel
- [ ] Créer le formulaire modal si nécessaire
- [ ] Ajouter la gestion d'erreur
- [ ] Ajouter le loading state pendant l'appel API
- [ ] Mettre à jour l'état local après succès
- [ ] Recharger les données avec `loadOrdreMission()`
- [ ] Tester manuellement avec tous les rôles
- [ ] Vérifier les conditions d'affichage (`v-if`)

---

## 🚀 PROCHAINES ÉTAPES

### 1. Validation du plan (IMMÉDIAT)
- Revue par l'équipe backend
- Validation des endpoints existants
- Confirmation des priorités

### 2. Développement Phase 1 (Sprint 1)
- Backend: Implémenter les 10 endpoints haute priorité
- Frontend: Intégrer les appels API dans les handlers
- Tests: Validation E2E du workflow principal

### 3. Développement Phase 2 (Sprint 2)
- Backend: Implémenter les 5 endpoints moyenne priorité
- Frontend: Intégration et formulaires

### 4. Développement Phase 3 (Sprint 3)
- Backend: Implémenter les 4 endpoints basse priorité
- Frontend: Finalisation et polish

### 5. Tests et déploiement
- Tests d'intégration complets
- Tests de charge
- Documentation utilisateur
- Déploiement en production

---

**Document créé le**: 2025-11-25
**Version**: 1.0
**Auteur**: Claude AI
**Statut**: À valider par l'équipe
