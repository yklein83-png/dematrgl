# API Formulaire Client - Documentation

## Vue d'ensemble

Cette documentation décrit l'API permettant de créer et mettre à jour des clients depuis le formulaire frontend complet (150+ champs) conformément aux exigences réglementaires AMF/ACPR, MIF2 et SFDR.

## Architecture

### Flux de données

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │     │   Backend API    │     │   PostgreSQL    │
│   React Form    │────►│   FastAPI        │────►│   JSONB + cols  │
│   (150+ champs) │     │   /clients/form  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Stratégie de stockage

Les données du formulaire sont stockées de deux manières :
1. **Colonne JSONB `form_data`** : Stockage complet du JSON frontend pour restauration exacte
2. **Colonnes individuelles** : Extraction des champs clés pour filtrage, recherche et calculs

## Endpoints API

### POST /api/v1/clients/form

Crée un nouveau client depuis les données du formulaire frontend.

**Headers requis :**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Corps de la requête :**
```json
{
  "form_data": {
    "titulaire1": {
      "civilite": "M",
      "nom": "Dupont",
      "prenom": "Jean",
      "dateNaissance": "1980-05-15",
      "lieuNaissance": "Papeete",
      "nationalite": "francaise",
      "adresse": "123 Rue du Lagon, Papeete 98714",
      "email": "jean.dupont@example.pf",
      "telephone": "40123456",
      "profession": "Ingénieur",
      "usPerson": false,
      "residenceFiscale": "France"
    },
    "titulaire2": { ... },
    "hasTitulaire2": false,
    "situationFamiliale": {
      "situation": "marie",
      "nombreEnfants": 2,
      "nombreEnfantsACharge": 2
    },
    "situationFinanciere": {
      "revenusAnnuels": "50000-100000",
      "patrimoineGlobal": "100000-500000"
    },
    "origineFonds": { ... },
    "patrimoine": { ... },
    "kyc": { ... },
    "profilRisque": { ... },
    "durabilite": { ... },
    "documentsSelectionnes": ["fiche-conseil", "questionnaire-investisseur"]
  },
  "statut": "prospect"
}
```

**Réponse (201 Created) :**
```json
{
  "id": "uuid-du-client",
  "numero_client": "FAR-2025-0001",
  "t1_nom": "Dupont",
  "t1_prenom": "Jean",
  "statut": "prospect",
  ...
}
```

### PUT /api/v1/clients/{client_id}/form

Met à jour un client existant avec les données du formulaire.

**Paramètres :**
- `client_id` (UUID) : Identifiant du client

**Corps de la requête :** Identique à POST

**Réponse (200 OK) :** Client mis à jour

## Mapping des valeurs

### Civilités

| Frontend | Backend (Enum) |
|----------|----------------|
| `M`      | `Monsieur`     |
| `Mme`    | `Madame`       |

### Situations familiales

| Frontend       | Backend (Enum)  |
|----------------|-----------------|
| `celibataire`  | `Célibataire`   |
| `marie`        | `Marié(e)`      |
| `pacse`        | `Pacsé(e)`      |
| `divorce`      | `Divorcé(e)`    |
| `veuf`         | `Veuf(ve)`      |
| `union_libre`  | `Union libre`   |

## Structure des données

### Sections du formulaire

1. **Titulaire 1** (obligatoire)
   - Identité complète
   - Coordonnées
   - Situation professionnelle
   - US Person / Résidence fiscale

2. **Titulaire 2** (optionnel)
   - Mêmes champs que Titulaire 1
   - Activé si `hasTitulaire2: true`

3. **Situation familiale**
   - État civil
   - Régime matrimonial
   - Enfants
   - Donations

4. **Situation financière**
   - Revenus annuels
   - Patrimoine global
   - Répartition du patrimoine

5. **Origine des fonds**
   - Nature des fonds
   - Provenance économique

6. **Patrimoine détaillé**
   - Actifs financiers
   - Immobilier
   - Emprunts

7. **KYC (Connaissance client)**
   - Expérience par classe d'actifs
   - Culture financière

8. **Profil de risque**
   - Objectifs d'investissement
   - Horizon de placement
   - Tolérance au risque

9. **Préférences ESG/Durabilité**
   - Niveau de préférence
   - Importance E/S/G
   - Exclusions sectorielles
   - Taxonomie européenne

## Colonnes base de données ajoutées

### Patrimoine détaillé (JSONB)
```sql
patrimoine_emprunts JSONB    -- Liste des emprunts
patrimoine_revenus JSONB     -- Détail des revenus
patrimoine_charges JSONB     -- Détail des charges
```

### Préférences ESG
```sql
durabilite_niveau_preference VARCHAR(50)
durabilite_importance_environnement INTEGER
durabilite_importance_social INTEGER
durabilite_importance_gouvernance INTEGER
durabilite_exclusions JSONB
durabilite_investissement_impact BOOLEAN
durabilite_investissement_solidaire BOOLEAN
durabilite_taxonomie_pourcent INTEGER
durabilite_prise_compte_pai VARCHAR(10)
durabilite_confirmation BOOLEAN
```

### Stockage formulaire
```sql
form_data JSONB              -- Données complètes du formulaire
documents_selectionnes JSONB -- Documents à générer
```

## Calculs automatiques

Lors de la création/mise à jour, le système calcule automatiquement :

1. **Profil de risque** : Score et catégorie (Prudent, Équilibré, Dynamique, Offensif)
2. **Niveau LCB-FT** : Classification du risque de blanchiment

## Exemple d'utilisation (Frontend)

```typescript
// services/api.ts
const createClient = async (formData: ClientFormData) => {
  const response = await api.post('/clients/form', {
    form_data: formData,
    statut: 'prospect'
  });
  return response.data;
};

const updateClient = async (clientId: string, formData: ClientFormData) => {
  const response = await api.put(`/clients/${clientId}/form`, {
    form_data: formData,
    statut: 'actif'
  });
  return response.data;
};
```

## Gestion des erreurs

| Code | Description |
|------|-------------|
| 201  | Client créé avec succès |
| 200  | Client mis à jour avec succès |
| 400  | Données invalides |
| 401  | Non authentifié |
| 403  | Accès non autorisé (pas propriétaire du client) |
| 404  | Client non trouvé |
| 500  | Erreur serveur |

## Notes techniques

- Les dates doivent être au format ISO 8601 : `YYYY-MM-DD`
- Les numéros de téléphone Polynésie sont normalisés : `+689XXXXXXXX`
- Les emails sont normalisés en minuscules
- Le numéro client est généré automatiquement : `FAR-YYYY-NNNN`
