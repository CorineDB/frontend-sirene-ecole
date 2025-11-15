/**
 * Exemple de données utilisateur complètes pour le composant UserCard
 * Basé sur la structure réelle de l'API
 */

import type { ApiUserData } from '@/types/api'

// Exemple d'utilisateur avec toutes les informations (ville et pays inclus)
export const userExampleComplet: ApiUserData = {
  id: "01K9463HGMKWTQ7FQ3HRDKE8T1",
  nom_utilisateur: "admin-user",
  identifiant: "2290162004867",
  type: "ADMIN",
  user_account_type_id: null,
  user_account_type_type: null,
  role_id: "01K9461SJ0Z6B7MM2TJYC8P388",
  actif: true,
  statut: 1,
  created_at: "2025-11-03T06:22:38.000000Z",
  updated_at: "2025-11-04T03:39:10.000000Z",
  deleted_at: null,
  doit_changer_mot_de_passe: false,
  mot_de_passe_change: true,
  role: {
    id: "01K9461SJ0Z6B7MM2TJYC8P388",
    nom: "Admin",
    slug: "admin",
  },
  user_info: {
    id: "01K9463HGWJ74VWN9S2425VPNF",
    user_id: "01K9463HGMKWTQ7FQ3HRDKE8T1",
    nom: "User",
    prenom: "Admin",
    telephone: "2290162004867",
    email: "admin@example.com",
    ville_id: "01K946VILLE123456789",
    adresse: "123 Rue de la Paix",
    created_at: "2025-11-03T06:22:38.000000Z",
    updated_at: "2025-11-03T06:22:38.000000Z",
    deleted_at: null,
    ville: {
      id: "01K946VILLE123456789",
      pays_id: "01K946PAYS123456789",
      nom: "Ouagadougou",
      code: "OUA01",
      latitude: 12.3714,
      longitude: -1.5197,
      actif: true,
      created_at: "2025-11-01T00:00:00.000000Z",
      updated_at: "2025-11-01T00:00:00.000000Z",
      deleted_at: null,
      pays: {
        id: "01K946PAYS123456789",
        nom: "Burkina Faso",
        code_iso: "BF",
        indicatif_tel: "+226",
        devise: "XOF",
        fuseau_horaire: "UTC+0",
        actif: true,
        created_at: "2025-11-01T00:00:00.000000Z",
        updated_at: "2025-11-01T00:00:00.000000Z",
        deleted_at: null,
      }
    }
  }
}

// Exemple d'utilisateur sans ville
export const userExampleSansVille: ApiUserData = {
  id: "01K9463AUTRE123456789",
  nom_utilisateur: "user-simple",
  identifiant: "2290162004868",
  type: "USER",
  user_account_type_id: null,
  user_account_type_type: null,
  role_id: "01K9461ROLE456789",
  actif: true,
  statut: 1,
  created_at: "2025-11-03T06:22:38.000000Z",
  updated_at: "2025-11-04T03:39:10.000000Z",
  deleted_at: null,
  doit_changer_mot_de_passe: false,
  mot_de_passe_change: true,
  role: {
    id: "01K9461ROLE456789",
    nom: "Utilisateur",
    slug: "user",
  },
  user_info: {
    id: "01K9463INFO987654321",
    user_id: "01K9463AUTRE123456789",
    nom: "Doe",
    prenom: "John",
    telephone: "2290162004868",
    email: "john.doe@example.com",
    ville_id: null,
    adresse: null,
    created_at: "2025-11-03T06:22:38.000000Z",
    updated_at: "2025-11-03T06:22:38.000000Z",
    deleted_at: null,
    ville: null
  }
}

// Exemple d'utilisateur ECOLE avec ville
export const userExampleEcole: ApiUserData = {
  id: "01K9463ECOLE123456",
  nom_utilisateur: "ecole-primaire-a",
  identifiant: "2290162005000",
  type: "ECOLE",
  user_account_type_id: null,
  user_account_type_type: null,
  role_id: "01K9461ROLEECOLE",
  actif: true,
  statut: 1,
  created_at: "2025-11-03T08:00:00.000000Z",
  updated_at: "2025-11-03T08:00:00.000000Z",
  deleted_at: null,
  doit_changer_mot_de_passe: true,
  mot_de_passe_change: false,
  role: {
    id: "01K9461ROLEECOLE",
    nom: "Gestionnaire École",
    slug: "ecole-manager",
  },
  user_info: {
    id: "01K9463INFOECOLE",
    user_id: "01K9463ECOLE123456",
    nom: "Primaire A",
    prenom: "École",
    telephone: "2290162005000",
    email: "ecole.primaire.a@education.bf",
    ville_id: "01K946VILLE999999",
    adresse: "Quartier Gounghin, Secteur 12",
    created_at: "2025-11-03T08:00:00.000000Z",
    updated_at: "2025-11-03T08:00:00.000000Z",
    deleted_at: null,
    ville: {
      id: "01K946VILLE999999",
      pays_id: "01K946PAYS123456789",
      nom: "Bobo-Dioulasso",
      code: "BOB01",
      latitude: 11.1771,
      longitude: -4.2979,
      actif: true,
      created_at: "2025-11-01T00:00:00.000000Z",
      updated_at: "2025-11-01T00:00:00.000000Z",
      deleted_at: null,
      pays: {
        id: "01K946PAYS123456789",
        nom: "Burkina Faso",
        code_iso: "BF",
        indicatif_tel: "+226",
        devise: "XOF",
        fuseau_horaire: "UTC+0",
        actif: true,
        created_at: "2025-11-01T00:00:00.000000Z",
        updated_at: "2025-11-01T00:00:00.000000Z",
        deleted_at: null,
      }
    }
  }
}

// Exemple d'utilisateur TECHNICIEN inactif
export const userExampleTechnicienInactif: ApiUserData = {
  id: "01K9463TECH888888",
  nom_utilisateur: "tech-maintenance",
  identifiant: "2290162006000",
  type: "TECHNICIEN",
  user_account_type_id: null,
  user_account_type_type: null,
  role_id: "01K9461ROLETECH",
  actif: false,
  statut: 0,
  created_at: "2025-10-15T10:00:00.000000Z",
  updated_at: "2025-11-01T15:30:00.000000Z",
  deleted_at: null,
  doit_changer_mot_de_passe: false,
  mot_de_passe_change: true,
  role: {
    id: "01K9461ROLETECH",
    nom: "Technicien",
    slug: "technicien",
  },
  user_info: {
    id: "01K9463INFOTECH",
    user_id: "01K9463TECH888888",
    nom: "Konaté",
    prenom: "Ibrahim",
    telephone: "2290162006000",
    email: "ibrahim.konate@tech.bf",
    ville_id: "01K946VILLE123456789",
    adresse: "Zone industrielle, Lot 45",
    created_at: "2025-10-15T10:00:00.000000Z",
    updated_at: "2025-10-15T10:00:00.000000Z",
    deleted_at: null,
    ville: {
      id: "01K946VILLE123456789",
      pays_id: "01K946PAYS123456789",
      nom: "Ouagadougou",
      code: "OUA01",
      latitude: 12.3714,
      longitude: -1.5197,
      actif: true,
      created_at: "2025-11-01T00:00:00.000000Z",
      updated_at: "2025-11-01T00:00:00.000000Z",
      deleted_at: null,
      pays: {
        id: "01K946PAYS123456789",
        nom: "Burkina Faso",
        code_iso: "BF",
        indicatif_tel: "+226",
        devise: "XOF",
        fuseau_horaire: "UTC+0",
        actif: true,
        created_at: "2025-11-01T00:00:00.000000Z",
        updated_at: "2025-11-01T00:00:00.000000Z",
        deleted_at: null,
      }
    }
  }
}

// Tableau de tous les exemples
export const allUserExamples = [
  userExampleComplet,
  userExampleSansVille,
  userExampleEcole,
  userExampleTechnicienInactif,
]
