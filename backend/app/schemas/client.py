"""
Schemas Pydantic pour Client - Validation des données
120+ champs conformes AMF/ACPR
"""

from pydantic import BaseModel, EmailStr, field_validator, Field, model_validator, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID
import re

from app.models.client import ClientStatut, Civilite, SituationFamiliale, EtapeParcours


# ==========================================
# SCHEMAS DE BASE - IDENTITÉ
# ==========================================

class TitulaireBase(BaseModel):
    """Schema de base pour un titulaire"""
    civilite: Civilite
    nom: str = Field(..., min_length=1, max_length=100)
    nom_jeune_fille: Optional[str] = Field(None, max_length=100)
    prenom: str = Field(..., min_length=1, max_length=100)
    date_naissance: date
    lieu_naissance: str = Field(..., min_length=1, max_length=100)
    nationalite: str = Field(default='Française', max_length=100)
    adresse: str = Field(..., min_length=1)
    email: EmailStr
    telephone: str = Field(..., min_length=1, max_length=50)
    us_person: bool = False
    regime_protection_juridique: bool = False
    regime_protection_forme: Optional[str] = Field(None, max_length=100)
    representant_legal: Optional[str] = Field(None, max_length=255)
    residence_fiscale: str = Field(default='France', max_length=100)
    residence_fiscale_autre: Optional[str] = Field(None, max_length=255)
    profession: str = Field(..., min_length=1, max_length=100)
    retraite_depuis: Optional[date] = None
    chomage_depuis: Optional[date] = None
    ancienne_profession: Optional[str] = Field(None, max_length=100)
    chef_entreprise: bool = False
    entreprise_denomination: Optional[str] = Field(None, max_length=255)
    entreprise_forme_juridique: Optional[str] = Field(None, max_length=100)
    entreprise_siege_social: Optional[str] = None
    
    @field_validator('telephone')
    @classmethod
    def validate_telephone(cls, v: str) -> str:
        """Valide le format téléphone (Polynésie)"""
        # Supprimer espaces et tirets
        v = v.replace(' ', '').replace('-', '')
        # Vérifier format Polynésie (+689 XX XX XX XX)
        if not re.match(r'^\+?689\d{8}$', v):
            # Accepter aussi format local
            if not re.match(r'^\d{8}$', v):
                raise ValueError('Format téléphone invalide')
            v = '+689' + v
        return v

    @field_validator('email')
    @classmethod
    def normalize_email(cls, v: str) -> str:
        """Normalise l'email"""
        return v.lower()

    @field_validator('nom', 'prenom', 'lieu_naissance')
    @classmethod
    def capitalize_names(cls, v: str) -> str:
        """Capitalise les noms propres"""
        return v.strip().title()


# ==========================================
# SCHEMAS SITUATION FAMILIALE
# ==========================================

class SituationFamilialeSchema(BaseModel):
    """Schema situation familiale"""
    situation_familiale: SituationFamiliale
    date_mariage: Optional[date] = None
    contrat_mariage: bool = False
    regime_matrimonial: Optional[str] = Field(None, max_length=100)
    date_pacs: Optional[date] = None
    convention_pacs: bool = False
    regime_pacs: Optional[str] = Field(None, max_length=100)
    date_divorce: Optional[date] = None
    donation_entre_epoux: bool = False
    donation_entre_epoux_date: Optional[date] = None
    donation_entre_epoux_montant: Optional[Decimal] = None
    donation_enfants: bool = False
    donation_enfants_date: Optional[date] = None
    donation_enfants_montant: Optional[Decimal] = None
    nombre_enfants: int = Field(default=0, ge=0, le=20)
    nombre_enfants_charge: int = Field(default=0, ge=0, le=20)
    enfants: Optional[List[Dict[str, Any]]] = None
    
    @model_validator(mode='after')
    def validate_coherence(self):
        """Valide la cohérence des données familiales"""
        # Si marié, date de mariage requise
        if self.situation_familiale == SituationFamiliale.MARIE and not self.date_mariage:
            raise ValueError('Date de mariage requise si marié(e)')

        # Si pacsé, date de PACS requise
        if self.situation_familiale == SituationFamiliale.PACSE and not self.date_pacs:
            raise ValueError('Date de PACS requise si pacsé(e)')

        # Si divorcé, date de divorce requise
        if self.situation_familiale == SituationFamiliale.DIVORCE and not self.date_divorce:
            raise ValueError('Date de divorce requise si divorcé(e)')

        # Enfants à charge <= nombre total
        if self.nombre_enfants_charge > self.nombre_enfants:
            raise ValueError('Nombre enfants à charge ne peut excéder nombre total')

        return self


# ==========================================
# SCHEMAS SITUATION FINANCIÈRE
# ==========================================

class SituationFinanciereSchema(BaseModel):
    """Schema situation financière"""
    revenus_annuels_foyer: str = Field(..., pattern='^(<50000|50000-100000|100001-150000|150001-500000|>500000)$')
    patrimoine_global: str = Field(..., pattern='^(<100000|100001-300000|300001-500000|500001-1000000|1000001-5000000|>5000000)$')
    charges_annuelles_pourcent: Optional[Decimal] = Field(None, ge=0, le=100)
    charges_annuelles_montant: Optional[Decimal] = Field(None, ge=0)
    capacite_epargne_mensuelle: Optional[Decimal] = Field(None, ge=0)
    impot_revenu: bool = False
    impot_fortune_immobiliere: bool = False
    patrimoine_financier_pourcent: Optional[Decimal] = Field(None, ge=0, le=100)
    patrimoine_immobilier_pourcent: Optional[Decimal] = Field(None, ge=0, le=100)
    patrimoine_professionnel_pourcent: Optional[Decimal] = Field(None, ge=0, le=100)
    patrimoine_autres_pourcent: Optional[Decimal] = Field(None, ge=0, le=100)
    
    @model_validator(mode='after')
    def validate_pourcentages(self):
        """Vérifie que la somme des pourcentages = 100%"""
        total = (
            (self.patrimoine_financier_pourcent or 0) +
            (self.patrimoine_immobilier_pourcent or 0) +
            (self.patrimoine_professionnel_pourcent or 0) +
            (self.patrimoine_autres_pourcent or 0)
        )
        if total > 0 and total != 100:
            raise ValueError('La somme des pourcentages patrimoine doit égaler 100%')
        return self


# ==========================================
# SCHEMA CLIENT COMPLET
# ==========================================

class ClientBase(BaseModel):
    """Schema de base pour Client - tous les champs"""
    # Identifiants
    numero_client: Optional[str] = None
    statut: ClientStatut = ClientStatut.PROSPECT
    
    # Titulaire 1 (obligatoire)
    t1_civilite: Civilite
    t1_nom: str = Field(..., min_length=1, max_length=100)
    t1_nom_jeune_fille: Optional[str] = Field(None, max_length=100)
    t1_prenom: str = Field(..., min_length=1, max_length=100)
    t1_date_naissance: date
    t1_lieu_naissance: str = Field(..., min_length=1, max_length=100)
    t1_nationalite: str = Field(default='Française', max_length=100)
    t1_adresse: str
    t1_email: EmailStr
    t1_telephone: str = Field(..., min_length=1, max_length=50)
    t1_us_person: bool = False
    t1_regime_protection_juridique: bool = False
    t1_regime_protection_forme: Optional[str] = None
    t1_representant_legal: Optional[str] = None
    t1_residence_fiscale: str = Field(default='France')
    t1_residence_fiscale_autre: Optional[str] = None
    t1_profession: str
    t1_retraite_depuis: Optional[date] = None
    t1_chomage_depuis: Optional[date] = None
    t1_ancienne_profession: Optional[str] = None
    t1_chef_entreprise: bool = False
    t1_entreprise_denomination: Optional[str] = None
    t1_entreprise_forme_juridique: Optional[str] = None
    t1_entreprise_siege_social: Optional[str] = None
    
    # Titulaire 2 (optionnel)
    t2_civilite: Optional[Civilite] = None
    t2_nom: Optional[str] = None
    t2_nom_jeune_fille: Optional[str] = None
    t2_prenom: Optional[str] = None
    t2_date_naissance: Optional[date] = None
    t2_lieu_naissance: Optional[str] = None
    t2_nationalite: Optional[str] = None
    t2_adresse: Optional[str] = None
    t2_email: Optional[EmailStr] = None
    t2_telephone: Optional[str] = None
    t2_us_person: bool = False
    t2_regime_protection_juridique: bool = False
    t2_regime_protection_forme: Optional[str] = None
    t2_representant_legal: Optional[str] = None
    t2_residence_fiscale: Optional[str] = None
    t2_residence_fiscale_autre: Optional[str] = None
    t2_profession: Optional[str] = None
    t2_retraite_depuis: Optional[date] = None
    t2_chomage_depuis: Optional[date] = None
    t2_ancienne_profession: Optional[str] = None
    t2_chef_entreprise: bool = False
    t2_entreprise_denomination: Optional[str] = None
    t2_entreprise_forme_juridique: Optional[str] = None
    t2_entreprise_siege_social: Optional[str] = None
    
    # Situation familiale
    situation_familiale: SituationFamiliale
    date_mariage: Optional[date] = None
    contrat_mariage: bool = False
    regime_matrimonial: Optional[str] = None
    date_pacs: Optional[date] = None
    convention_pacs: bool = False
    regime_pacs: Optional[str] = None
    date_divorce: Optional[date] = None
    donation_entre_epoux: bool = False
    donation_entre_epoux_date: Optional[date] = None
    donation_entre_epoux_montant: Optional[Decimal] = None
    donation_enfants: bool = False
    donation_enfants_date: Optional[date] = None
    donation_enfants_montant: Optional[Decimal] = None
    nombre_enfants: int = 0
    nombre_enfants_charge: int = 0
    enfants: Optional[List[Dict[str, Any]]] = None
    
    # Situation financière
    revenus_annuels_foyer: str
    patrimoine_global: str
    charges_annuelles_pourcent: Optional[Decimal] = None
    charges_annuelles_montant: Optional[Decimal] = None
    capacite_epargne_mensuelle: Optional[Decimal] = None
    impot_revenu: bool = False
    impot_fortune_immobiliere: bool = False
    patrimoine_financier_pourcent: Optional[Decimal] = None
    patrimoine_immobilier_pourcent: Optional[Decimal] = None
    patrimoine_professionnel_pourcent: Optional[Decimal] = None
    patrimoine_autres_pourcent: Optional[Decimal] = None
    
    # Origine des fonds
    origine_fonds_nature: str
    origine_fonds_montant_prevu: Optional[Decimal] = None
    origine_economique_revenus: bool = False
    origine_economique_epargne: bool = False
    origine_economique_heritage: bool = False
    origine_economique_cession_pro: bool = False
    origine_economique_cession_immo: bool = False
    origine_economique_cession_mobiliere: bool = False
    origine_economique_gains_jeu: bool = False
    origine_economique_assurance_vie: bool = False
    origine_economique_autres: Optional[str] = None
    origine_fonds_provenance_etablissement: Optional[str] = None
    
    # Patrimoine (JSONB)
    patrimoine_financier: Optional[List[Dict[str, Any]]] = None
    patrimoine_immobilier: Optional[List[Dict[str, Any]]] = None
    patrimoine_professionnel: Optional[List[Dict[str, Any]]] = None
    
    # KYC - Exemple pour quelques produits (répéter pour tous)
    kyc_monetaires_detention: bool = False
    kyc_monetaires_operations: Optional[str] = None
    kyc_monetaires_duree: Optional[str] = None
    kyc_monetaires_volume: Optional[str] = None
    kyc_monetaires_q1: Optional[str] = None
    kyc_monetaires_q2: Optional[str] = None
    
    # Profil de risque
    objectifs_investissement: str
    horizon_placement: str
    tolerance_risque: str
    pertes_maximales_acceptables: str
    experience_perte: bool = False
    experience_perte_niveau: Optional[str] = None
    reaction_perte: Optional[str] = None
    reaction_gain: Optional[str] = None
    liquidite_importante: bool = True
    pourcentage_patrimoine_investi: Optional[str] = None
    
    # Durabilité
    durabilite_souhait: bool = False
    durabilite_taxonomie_pourcent: Optional[str] = None
    durabilite_investissements_pourcent: Optional[str] = None
    durabilite_impact_selection: bool = False
    durabilite_criteres: Optional[Dict[str, Any]] = None
    
    # LCB-FT
    lcb_ft_niveau_risque: Optional[str] = None
    lcb_ft_ppe: bool = False
    lcb_ft_ppe_fonction: Optional[str] = None
    lcb_ft_ppe_famille: bool = False
    lcb_ft_gel_avoirs_verifie: bool = False
    lcb_ft_gel_avoirs_date_verification: Optional[date] = None
    lcb_ft_justificatifs: Optional[Dict[str, Any]] = None
    
    model_config = ConfigDict(use_enum_values=True)


class ClientCreate(ClientBase):
    """Schema pour création d'un client"""
    pass


class ClientUpdate(BaseModel):
    """Schema pour mise à jour partielle d'un client - TOUS les champs optionnels"""
    # Identifiants
    statut: Optional[str] = None
    numero_client: Optional[str] = None

    # Titulaire 1 - tous optionnels pour update partiel
    t1_civilite: Optional[str] = None
    t1_nom: Optional[str] = None
    t1_nom_naissance: Optional[str] = None
    t1_nom_jeune_fille: Optional[str] = None
    t1_prenom: Optional[str] = None
    t1_date_naissance: Optional[date] = None
    t1_lieu_naissance: Optional[str] = None
    t1_pays_naissance: Optional[str] = None
    t1_nationalite: Optional[str] = None
    t1_autre_nationalite: Optional[str] = None
    t1_piece_identite: Optional[str] = None
    t1_numero_piece: Optional[str] = None
    t1_date_validite_piece: Optional[date] = None
    t1_adresse: Optional[str] = None
    t1_code_postal: Optional[str] = None
    t1_ville: Optional[str] = None
    t1_pays_residence: Optional[str] = None
    t1_email: Optional[str] = None
    t1_telephone: Optional[str] = None
    t1_situation_pro: Optional[str] = None
    t1_profession: Optional[str] = None
    t1_secteur_activite: Optional[str] = None
    t1_employeur: Optional[str] = None
    t1_residence_fiscale: Optional[str] = None
    t1_nif: Optional[str] = None
    t1_us_person: Optional[bool] = None
    t1_regime_protection_juridique: Optional[bool] = None
    t1_regime_protection_forme: Optional[str] = None
    t1_representant_legal: Optional[str] = None
    t1_residence_fiscale_autre: Optional[str] = None
    t1_retraite_depuis: Optional[date] = None
    t1_chomage_depuis: Optional[date] = None
    t1_ancienne_profession: Optional[str] = None
    t1_chef_entreprise: Optional[bool] = None
    t1_entreprise_denomination: Optional[str] = None
    t1_entreprise_forme_juridique: Optional[str] = None
    t1_entreprise_siege_social: Optional[str] = None

    # Titulaire 2 (optionnel)
    t2_civilite: Optional[str] = None
    t2_nom: Optional[str] = None
    t2_nom_jeune_fille: Optional[str] = None
    t2_prenom: Optional[str] = None
    t2_date_naissance: Optional[date] = None
    t2_lieu_naissance: Optional[str] = None
    t2_nationalite: Optional[str] = None
    t2_profession: Optional[str] = None
    t2_adresse: Optional[str] = None
    t2_email: Optional[str] = None
    t2_telephone: Optional[str] = None
    t2_us_person: Optional[bool] = None
    t2_regime_protection_juridique: Optional[bool] = None
    t2_regime_protection_forme: Optional[str] = None
    t2_representant_legal: Optional[str] = None
    t2_residence_fiscale: Optional[str] = None
    t2_residence_fiscale_autre: Optional[str] = None
    t2_retraite_depuis: Optional[date] = None
    t2_chomage_depuis: Optional[date] = None
    t2_ancienne_profession: Optional[str] = None
    t2_chef_entreprise: Optional[bool] = None
    t2_entreprise_denomination: Optional[str] = None
    t2_entreprise_forme_juridique: Optional[str] = None
    t2_entreprise_siege_social: Optional[str] = None

    # Situation familiale
    situation_familiale: Optional[str] = None
    regime_matrimonial: Optional[str] = None
    nombre_enfants: Optional[int] = None
    enfants_a_charge: Optional[int] = None
    personnes_a_charge: Optional[int] = None
    nombre_enfants_charge: Optional[int] = None
    date_mariage: Optional[date] = None
    contrat_mariage: Optional[bool] = None
    date_pacs: Optional[date] = None
    convention_pacs: Optional[bool] = None
    regime_pacs: Optional[str] = None
    date_divorce: Optional[date] = None
    donation_entre_epoux: Optional[bool] = None
    donation_entre_epoux_date: Optional[date] = None
    donation_entre_epoux_montant: Optional[Decimal] = None
    donation_enfants: Optional[bool] = None
    donation_enfants_date: Optional[date] = None
    donation_enfants_montant: Optional[Decimal] = None
    enfants: Optional[List[Dict[str, Any]]] = None

    # Situation financière
    revenus_annuels_foyer: Optional[str] = None
    charges_annuelles_pourcent: Optional[Decimal] = None
    charges_annuelles_montant: Optional[Decimal] = None
    capacite_epargne_mensuelle: Optional[Decimal] = None
    impot_revenu: Optional[bool] = None
    impot_fortune_immobiliere: Optional[bool] = None

    # Patrimoine
    patrimoine_global: Optional[str] = None
    patrimoine_immobilier: Optional[Any] = None
    patrimoine_financier: Optional[Any] = None
    patrimoine_professionnel: Optional[Any] = None
    dettes_total: Optional[Decimal] = None
    credit_immobilier: Optional[bool] = None
    patrimoine_financier_pourcent: Optional[Decimal] = None
    patrimoine_immobilier_pourcent: Optional[Decimal] = None
    patrimoine_professionnel_pourcent: Optional[Decimal] = None
    patrimoine_autres_pourcent: Optional[Decimal] = None

    # Origine des fonds
    origine_economique_epargne: Optional[bool] = None
    origine_economique_heritage: Optional[bool] = None
    origine_economique_vente_immo: Optional[bool] = None
    origine_economique_cession: Optional[bool] = None
    origine_economique_autre: Optional[str] = None
    montant_investi_prevu: Optional[Decimal] = None
    origine_fonds: Optional[str] = None
    origine_fonds_nature: Optional[str] = None
    origine_fonds_montant_prevu: Optional[Decimal] = None
    origine_economique_revenus: Optional[bool] = None
    origine_economique_cession_pro: Optional[bool] = None
    origine_economique_cession_immo: Optional[bool] = None
    origine_economique_cession_mobiliere: Optional[bool] = None
    origine_economique_gains_jeu: Optional[bool] = None
    origine_economique_assurance_vie: Optional[bool] = None
    origine_economique_autres: Optional[str] = None
    origine_fonds_provenance_etablissement: Optional[str] = None

    # LCB-FT / Conformité
    ppe: Optional[bool] = None
    ppe_lien: Optional[bool] = None
    ppe_fonction: Optional[str] = None
    beneficiaire_effectif: Optional[bool] = None
    tiers_beneficiaire: Optional[bool] = None
    lcb_ft_niveau_risque: Optional[str] = None
    lcb_ft_ppe: Optional[bool] = None
    lcb_ft_ppe_fonction: Optional[str] = None
    lcb_ft_ppe_famille: Optional[bool] = None
    lcb_ft_gel_avoirs_verifie: Optional[bool] = None
    lcb_ft_gel_avoirs_date_verification: Optional[date] = None
    lcb_ft_justificatifs: Optional[Dict[str, Any]] = None

    # Profil de risque
    objectifs_investissement: Optional[str] = None
    horizon_placement: Optional[str] = None
    besoin_liquidite: Optional[str] = None
    pertes_maximales_acceptables: Optional[str] = None
    reaction_perte: Optional[str] = None
    accepte_volatilite: Optional[bool] = None
    tolerance_risque: Optional[str] = None
    experience_investissement: Optional[str] = None
    frequence_operations: Optional[str] = None
    annees_experience: Optional[int] = None
    experience_perte: Optional[bool] = None
    experience_perte_niveau: Optional[str] = None
    reaction_gain: Optional[str] = None
    liquidite_importante: Optional[bool] = None
    pourcentage_patrimoine_investi: Optional[str] = None

    # Connaissances par produit
    kyc_monetaires_niveau: Optional[str] = None
    kyc_obligations_niveau: Optional[str] = None
    kyc_actions_niveau: Optional[str] = None
    kyc_opcvm_niveau: Optional[str] = None
    kyc_structures_niveau: Optional[str] = None
    kyc_derives_niveau: Optional[str] = None
    kyc_pe_niveau: Optional[str] = None
    kyc_immobilier_niveau: Optional[str] = None
    kyc_monetaires_detention: Optional[bool] = None
    kyc_monetaires_operations: Optional[str] = None
    kyc_monetaires_duree: Optional[str] = None
    kyc_monetaires_volume: Optional[str] = None
    kyc_monetaires_q1: Optional[str] = None
    kyc_monetaires_q2: Optional[str] = None
    kyc_obligations_detention: Optional[bool] = None
    kyc_obligations_operations: Optional[str] = None
    kyc_obligations_duree: Optional[str] = None
    kyc_obligations_volume: Optional[str] = None
    kyc_obligations_q1: Optional[str] = None
    kyc_obligations_q2: Optional[str] = None
    kyc_actions_detention: Optional[bool] = None
    kyc_actions_operations: Optional[str] = None
    kyc_actions_duree: Optional[str] = None
    kyc_actions_volume: Optional[str] = None
    kyc_actions_q1: Optional[str] = None
    kyc_actions_q2: Optional[str] = None
    kyc_scpi_detention: Optional[bool] = None
    kyc_scpi_operations: Optional[str] = None
    kyc_scpi_duree: Optional[str] = None
    kyc_scpi_volume: Optional[str] = None
    kyc_scpi_q1: Optional[str] = None
    kyc_scpi_q2: Optional[str] = None
    kyc_pe_detention: Optional[bool] = None
    kyc_pe_operations: Optional[str] = None
    kyc_pe_duree: Optional[str] = None
    kyc_pe_volume: Optional[str] = None
    kyc_pe_q1: Optional[str] = None
    kyc_pe_q2: Optional[str] = None
    kyc_etf_detention: Optional[bool] = None
    kyc_etf_operations: Optional[str] = None
    kyc_etf_duree: Optional[str] = None
    kyc_etf_volume: Optional[str] = None
    kyc_etf_q1: Optional[str] = None
    kyc_etf_q2: Optional[str] = None
    kyc_derives_detention: Optional[bool] = None
    kyc_derives_operations: Optional[str] = None
    kyc_derives_duree: Optional[str] = None
    kyc_derives_volume: Optional[str] = None
    kyc_derives_q1: Optional[str] = None
    kyc_derives_q2: Optional[str] = None
    kyc_structures_detention: Optional[bool] = None
    kyc_structures_operations: Optional[str] = None
    kyc_structures_duree: Optional[str] = None
    kyc_structures_volume: Optional[str] = None
    kyc_structures_q1: Optional[str] = None
    kyc_structures_q2: Optional[str] = None
    kyc_portefeuille_mandat: Optional[bool] = None
    kyc_portefeuille_gestion_personnelle: Optional[bool] = None
    kyc_portefeuille_gestion_conseiller: Optional[bool] = None
    kyc_portefeuille_experience_pro: Optional[bool] = None
    kyc_culture_presse_financiere: Optional[bool] = None
    kyc_culture_suivi_bourse: Optional[bool] = None
    kyc_culture_releves_bancaires: Optional[bool] = None

    # Préférences durabilité (ESG)
    durabilite_integration: Optional[bool] = None
    durabilite_part_minimum: Optional[int] = None
    durabilite_exclusions: Optional[str] = None
    durabilite_impact: Optional[bool] = None
    durabilite_taxonomie: Optional[bool] = None
    durabilite_souhait: Optional[bool] = None
    durabilite_niveau_preference: Optional[str] = None
    durabilite_importance_environnement: Optional[int] = None
    durabilite_importance_social: Optional[int] = None
    durabilite_importance_gouvernance: Optional[int] = None
    durabilite_investissement_impact: Optional[bool] = None
    durabilite_investissement_solidaire: Optional[bool] = None
    durabilite_taxonomie_pourcent: Optional[int] = None
    durabilite_prise_compte_pai: Optional[str] = None
    durabilite_confirmation: Optional[bool] = None
    durabilite_criteres: Optional[Dict[str, Any]] = None

    # Profil calculé
    profil_risque_calcule: Optional[str] = None
    profil_commentaire: Optional[str] = None
    profil_risque_score: Optional[int] = None
    profil_risque_date_calcul: Optional[datetime] = None

    # Documents
    produit_recommande: Optional[str] = None
    justification_adequation: Optional[str] = None
    risques_identifies: Optional[str] = None
    type_mission: Optional[str] = None
    perimetre_mission: Optional[str] = None
    honoraires: Optional[str] = None
    etablissement_teneur: Optional[str] = None
    numero_compte: Optional[str] = None
    mode_transmission: Optional[str] = None
    produit_assurance: Optional[str] = None
    compagnie_assurance: Optional[str] = None
    analyse_besoins: Optional[str] = None
    garanties_proposees: Optional[str] = None
    prime_annuelle: Optional[Decimal] = None

    # Données JSON
    form_data: Optional[Dict[str, Any]] = None
    documents_selectionnes: Optional[List[str]] = None

    # Workflow réglementaire
    etape_parcours: Optional[str] = None
    contexte_prestation: Optional[str] = None
    lettre_mission_generee: Optional[bool] = None
    lettre_mission_date_generation: Optional[datetime] = None
    lettre_mission_signee: Optional[bool] = None
    lettre_mission_date_signature: Optional[datetime] = None
    der_genere: Optional[bool] = None
    der_date_generation: Optional[datetime] = None
    der_signe: Optional[bool] = None
    der_date_signature: Optional[datetime] = None
    adequation_generee: Optional[bool] = None
    adequation_date_generation: Optional[datetime] = None
    adequation_signee: Optional[bool] = None
    adequation_date_signature: Optional[datetime] = None
    rto_applicable: Optional[bool] = None
    rto_genere: Optional[bool] = None
    rto_date_generation: Optional[datetime] = None
    rto_signe: Optional[bool] = None
    rto_date_signature: Optional[datetime] = None

    # RTO - Convention Réception Transmission Ordres
    rto_type_client: Optional[str] = None  # personne_physique | personne_morale
    rto_est_profession_liberal: Optional[bool] = None
    rto_siret_professionnel: Optional[str] = None
    rto_activite_professionnelle: Optional[str] = None
    rto_comptes: Optional[List[Dict[str, Any]]] = None
    rto_modes_communication: Optional[List[str]] = None
    rto_modes_communication_autre: Optional[str] = None
    # Personne morale
    rto_pm_raison_sociale: Optional[str] = None
    rto_pm_objet_social: Optional[str] = None
    rto_pm_forme_juridique: Optional[str] = None
    rto_pm_numero_rcs: Optional[str] = None
    rto_pm_ville_rcs: Optional[str] = None
    rto_pm_siege_social: Optional[str] = None
    rto_pm_code_postal_siege: Optional[str] = None
    rto_pm_ville_siege: Optional[str] = None
    rto_pm_representant_civilite: Optional[str] = None
    rto_pm_representant_nom: Optional[str] = None
    rto_pm_representant_prenom: Optional[str] = None
    rto_pm_representant_qualite: Optional[str] = None

    @model_validator(mode='before')
    @classmethod
    def normalize_values(cls, data: Any) -> Any:
        """Normalise les valeurs pour la compatibilité avec les types attendus"""
        if not isinstance(data, dict):
            return data

        # Champs qui devraient être des strings
        string_fields = {
            'profil_risque_calcule', 'tolerance_risque', 'horizon_placement',
            'pertes_maximales_acceptables', 'reaction_perte', 'objectifs_investissement',
            'besoin_liquidite', 'experience_investissement', 'revenus_annuels_foyer',
            'patrimoine_global', 'origine_fonds', 'origine_fonds_nature',
            'durabilite_exclusions', 'durabilite_niveau_preference', 'durabilite_prise_compte_pai',
            # KYC string fields
            'kyc_monetaires_q1', 'kyc_monetaires_q2', 'kyc_obligations_q1', 'kyc_obligations_q2',
            'kyc_actions_q1', 'kyc_actions_q2', 'kyc_scpi_q1', 'kyc_scpi_q2',
            'kyc_pe_q1', 'kyc_pe_q2', 'kyc_etf_q1', 'kyc_etf_q2',
            'kyc_derives_q1', 'kyc_derives_q2', 'kyc_structures_q1', 'kyc_structures_q2',
            'kyc_monetaires_operations', 'kyc_monetaires_duree', 'kyc_monetaires_volume',
            'kyc_obligations_operations', 'kyc_obligations_duree', 'kyc_obligations_volume',
            'kyc_actions_operations', 'kyc_actions_duree', 'kyc_actions_volume',
            'kyc_scpi_operations', 'kyc_scpi_duree', 'kyc_scpi_volume',
            'kyc_pe_operations', 'kyc_pe_duree', 'kyc_pe_volume',
            'kyc_etf_operations', 'kyc_etf_duree', 'kyc_etf_volume',
            'kyc_derives_operations', 'kyc_derives_duree', 'kyc_derives_volume',
            'kyc_structures_operations', 'kyc_structures_duree', 'kyc_structures_volume',
            # Objectifs priorités (peuvent être des strings)
            'objectif_preservation_priorite', 'objectif_valorisation_priorite',
            'objectif_diversification_priorite', 'objectif_revenus_priorite',
            'objectif_transmission_priorite', 'objectif_fiscal_priorite',
        }

        # Champs qui devraient être des entiers
        integer_fields = {
            'nombre_enfants', 'nombre_enfants_charge', 'enfants_a_charge',
            'personnes_a_charge', 'annees_experience', 'durabilite_part_minimum',
            'durabilite_importance_environnement', 'durabilite_importance_social',
            'durabilite_importance_gouvernance', 'durabilite_taxonomie_pourcent',
            'profil_risque_score',
        }

        # Champs qui devraient être des booléens
        boolean_fields = {
            't1_us_person', 't2_us_person', 'ppe', 'ppe_lien', 'impot_revenu',
            'impot_fortune_immobiliere', 'credit_immobilier', 'beneficiaire_effectif',
            'tiers_beneficiaire', 'accepte_volatilite', 'experience_perte',
            'liquidite_importante', 'durabilite_integration', 'durabilite_impact',
            'durabilite_taxonomie', 'durabilite_souhait', 'durabilite_investissement_impact',
            'durabilite_investissement_solidaire', 'durabilite_confirmation',
            'kyc_monetaires_detention', 'kyc_obligations_detention', 'kyc_actions_detention',
            'kyc_scpi_detention', 'kyc_pe_detention', 'kyc_etf_detention',
            'kyc_derives_detention', 'kyc_structures_detention',
            'kyc_portefeuille_mandat', 'kyc_portefeuille_gestion_personnelle',
            'kyc_portefeuille_gestion_conseiller', 'kyc_portefeuille_experience_pro',
            'kyc_culture_presse_financiere', 'kyc_culture_suivi_bourse', 'kyc_culture_releves_bancaires',
            # Objectifs (booléens)
            'objectif_preservation', 'objectif_valorisation', 'objectif_diversification',
            'objectif_revenus', 'objectif_transmission', 'objectif_fiscal',
            # ESG fields
            'esg_gaz_effet_serre', 'esg_biodiversite', 'esg_emissions_eau', 'esg_dechets',
            'esg_energie', 'esg_normes_internationales', 'esg_egalite_remuneration',
            'esg_diversite_genres', 'esg_armes_controversees',
        }

        result = {}
        for key, value in data.items():
            # Ignorer les valeurs null, vides, ou objets vides
            if value is None or value == '' or value == {} or value == []:
                result[key] = None
                continue

            # Si c'est un objet avec une clé 'value', extraire la valeur
            if isinstance(value, dict) and 'value' in value:
                value = value.get('value')
                if value is None or value == '':
                    result[key] = None
                    continue

            # Convertir en string si attendu
            if key in string_fields:
                if isinstance(value, bool):
                    result[key] = 'Oui' if value else 'Non'
                elif isinstance(value, (int, float)):
                    result[key] = str(value)
                elif isinstance(value, dict):
                    # Objet inattendu pour un string, ignorer ou extraire value
                    if not value:
                        result[key] = None
                    elif 'value' in value:
                        result[key] = str(value.get('value')) if value.get('value') else None
                    else:
                        result[key] = None  # Ignorer les dicts non valides pour string
                else:
                    result[key] = str(value) if value is not None else None
            # Convertir en integer si attendu
            elif key in integer_fields:
                if isinstance(value, int):
                    result[key] = value
                elif isinstance(value, str):
                    try:
                        result[key] = int(value) if value.strip() else None
                    except ValueError:
                        result[key] = None
                elif isinstance(value, float):
                    result[key] = int(value)
                elif isinstance(value, dict):
                    # Objet inattendu pour un entier, ignorer
                    result[key] = None
                else:
                    result[key] = None
            # Convertir en boolean si attendu
            elif key in boolean_fields:
                if isinstance(value, bool):
                    result[key] = value
                elif isinstance(value, str):
                    result[key] = value.lower() in ('true', 'oui', '1', 'yes')
                elif isinstance(value, dict):
                    # Objet inattendu pour un booléen, ignorer
                    result[key] = None
                else:
                    result[key] = bool(value)
            else:
                # Pour tous les autres champs, si c'est un dict vide ou un dict simple,
                # essayer de l'ignorer ou le convertir
                if isinstance(value, dict):
                    # Si c'est un dict vide, ignorer
                    if not value:
                        result[key] = None
                    # Si c'est un dict avec une clé 'value', extraire
                    elif 'value' in value:
                        result[key] = value.get('value')
                    # Sinon, on garde le dict (pour form_data, etc.)
                    else:
                        result[key] = value
                else:
                    result[key] = value

        return result

    model_config = ConfigDict(use_enum_values=True, extra='allow')


class ClientInDB(ClientBase):
    """Schema pour Client en base de données"""
    id: UUID
    conseiller_id: UUID
    profil_risque_calcule: Optional[str] = None
    profil_risque_score: Optional[int] = None
    profil_risque_date_calcul: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    validated_at: Optional[datetime] = None
    validated_by: Optional[UUID] = None

    model_config = ConfigDict(from_attributes=True)


class ClientResponse(BaseModel):
    """Schema pour réponse API Client - accepte les brouillons avec champs nullables"""
    id: UUID
    conseiller_id: UUID
    numero_client: Optional[str] = None
    statut: str  # String pour accepter toutes valeurs y compris brouillon

    # Titulaire 1 - tous optionnels pour brouillons
    t1_civilite: Optional[str] = None
    t1_nom: Optional[str] = None
    t1_prenom: Optional[str] = None
    t1_date_naissance: Optional[date] = None
    t1_lieu_naissance: Optional[str] = None
    t1_nationalite: Optional[str] = None
    t1_adresse: Optional[str] = None
    t1_email: Optional[str] = None
    t1_telephone: Optional[str] = None
    t1_profession: Optional[str] = None
    t1_us_person: bool = False

    # Situation
    situation_familiale: Optional[str] = None
    regime_matrimonial: Optional[str] = None
    nombre_enfants: int = 0

    # Finances
    revenus_annuels_foyer: Optional[str] = None
    patrimoine_global: Optional[str] = None
    capacite_epargne_mensuelle: Optional[Decimal] = None

    # Profil risque
    objectifs_investissement: Optional[str] = None
    horizon_placement: Optional[str] = None
    pertes_maximales_acceptables: Optional[str] = None
    tolerance_risque: Optional[str] = None
    reaction_perte: Optional[str] = None
    profil_risque_calcule: Optional[str] = None
    profil_risque_score: Optional[int] = None

    # Données JSON - contient les champs supplémentaires du frontend
    form_data: Optional[Dict[str, Any]] = None

    # Workflow réglementaire
    etape_parcours: Optional[str] = None
    contexte_prestation: Optional[str] = None
    lettre_mission_generee: bool = False
    lettre_mission_signee: bool = False
    der_genere: bool = False
    der_signe: bool = False
    adequation_generee: bool = False
    adequation_signee: bool = False
    rto_applicable: bool = False
    rto_genere: bool = False
    rto_signe: bool = False

    # Dates
    created_at: datetime
    updated_at: datetime
    validated_at: Optional[datetime] = None

    # Propriétés calculées
    nom_complet_t1: Optional[str] = None
    nom_complet_t2: Optional[str] = None
    has_titulaire_2: bool = False
    is_validated: bool = False
    is_us_person: bool = False
    is_ppe: bool = False

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm(cls, obj):
        """Crée une instance depuis un objet ORM avec gestion des valeurs nulles"""
        return cls(
            id=obj.id,
            conseiller_id=obj.conseiller_id,
            numero_client=obj.numero_client,
            statut=obj.statut or 'brouillon',
            t1_civilite=obj.t1_civilite,
            t1_nom=obj.t1_nom,
            t1_prenom=obj.t1_prenom,
            t1_date_naissance=obj.t1_date_naissance,
            t1_lieu_naissance=obj.t1_lieu_naissance,
            t1_nationalite=obj.t1_nationalite,
            t1_adresse=obj.t1_adresse,
            t1_email=obj.t1_email,
            t1_telephone=obj.t1_telephone,
            t1_profession=obj.t1_profession,
            t1_us_person=obj.t1_us_person or False,
            situation_familiale=obj.situation_familiale,
            regime_matrimonial=getattr(obj, 'regime_matrimonial', None),
            nombre_enfants=obj.nombre_enfants or 0,
            revenus_annuels_foyer=obj.revenus_annuels_foyer,
            patrimoine_global=obj.patrimoine_global,
            capacite_epargne_mensuelle=getattr(obj, 'capacite_epargne_mensuelle', None),
            objectifs_investissement=getattr(obj, 'objectifs_investissement', None),
            horizon_placement=getattr(obj, 'horizon_placement', None),
            pertes_maximales_acceptables=getattr(obj, 'pertes_maximales_acceptables', None),
            tolerance_risque=getattr(obj, 'tolerance_risque', None),
            reaction_perte=getattr(obj, 'reaction_perte', None),
            profil_risque_calcule=obj.profil_risque_calcule,
            profil_risque_score=obj.profil_risque_score,
            form_data=getattr(obj, 'form_data', None),
            created_at=obj.created_at,
            updated_at=obj.updated_at,
            validated_at=obj.validated_at,
            nom_complet_t1=f"{obj.t1_prenom or ''} {obj.t1_nom or ''}".strip() or None,
            nom_complet_t2=f"{obj.t2_prenom or ''} {obj.t2_nom or ''}".strip() if obj.t2_nom else None,
            has_titulaire_2=bool(obj.t2_nom),
            is_validated=obj.validated_at is not None,
            is_us_person=bool(obj.t1_us_person or getattr(obj, 't2_us_person', False)),
            is_ppe=bool(getattr(obj, 'lcb_ft_ppe', False)),
        )


class ClientListResponse(BaseModel):
    """Schema pour liste de clients"""
    total: int
    page: int
    per_page: int
    clients: List[ClientResponse]


# ==========================================
# SCHEMA SIMPLIFIÉ POUR FORMULAIRE FRONTEND
# ==========================================

class ClientFormDataCreate(BaseModel):
    """
    Schema simplifié pour recevoir les données du formulaire frontend
    Stocke le JSON complet et extrait les champs clés
    """
    # Données complètes du formulaire (JSON)
    form_data: Dict[str, Any]

    # Statut optionnel
    statut: Optional[str] = "prospect"

    model_config = ConfigDict(extra='allow')

    @staticmethod
    def _parse_date(value: Any) -> Optional[date]:
        """Convertit une chaîne de date en objet date"""
        if value is None:
            return None
        if isinstance(value, date):
            return value
        if isinstance(value, str) and value:
            try:
                return date.fromisoformat(value)
            except ValueError:
                return None
        return None

    @staticmethod
    def _map_civilite(value: str) -> str:
        """Convertit les codes civilité frontend vers les valeurs enum"""
        mapping = {
            'M': 'Monsieur',
            'Mme': 'Madame',
            'Monsieur': 'Monsieur',
            'Madame': 'Madame',
        }
        return mapping.get(value, 'Monsieur')

    @staticmethod
    def _map_situation_familiale(value: str) -> str:
        """Convertit les codes situation familiale frontend vers les valeurs enum"""
        mapping = {
            'celibataire': 'Célibataire',
            'marie': 'Marié(e)',
            'pacse': 'Pacsé(e)',
            'divorce': 'Divorcé(e)',
            'veuf': 'Veuf(ve)',
            'union_libre': 'Union libre',
            'Célibataire': 'Célibataire',
            'Marié(e)': 'Marié(e)',
            'Pacsé(e)': 'Pacsé(e)',
            'Divorcé(e)': 'Divorcé(e)',
            'Veuf(ve)': 'Veuf(ve)',
            'Union libre': 'Union libre',
        }
        return mapping.get(value, 'Célibataire')

    def extract_client_data(self) -> Dict[str, Any]:
        """
        Extrait les données du formulaire frontend vers le format modèle Client
        """
        data = self.form_data
        result = {
            'form_data': data,
            'statut': self.statut,
            'documents_selectionnes': data.get('documentsSelectionnes', []),
        }

        # Titulaire 1
        t1 = data.get('titulaire1', {})
        result.update({
            't1_civilite': self._map_civilite(t1.get('civilite', 'M')),
            't1_nom': t1.get('nom', ''),
            't1_nom_jeune_fille': t1.get('nomJeuneFille'),
            't1_prenom': t1.get('prenom', ''),
            't1_date_naissance': self._parse_date(t1.get('dateNaissance')),
            't1_lieu_naissance': t1.get('lieuNaissance', ''),
            't1_nationalite': t1.get('nationalite', 'Française'),
            't1_adresse': t1.get('adresse', ''),
            't1_email': t1.get('email', ''),
            't1_telephone': t1.get('telephone', ''),
            't1_us_person': t1.get('usPerson', False),
            't1_regime_protection_juridique': t1.get('regimeProtection', False),
            't1_regime_protection_forme': t1.get('regimeProtectionType'),
            't1_representant_legal': t1.get('representantLegal'),
            't1_residence_fiscale': t1.get('residenceFiscale', 'France'),
            't1_residence_fiscale_autre': t1.get('residenceFiscaleAutre'),
            't1_profession': t1.get('profession', ''),
            't1_retraite_depuis': self._parse_date(t1.get('retraiteDepuis')),
            't1_chomage_depuis': self._parse_date(t1.get('chomageDepuis')),
            't1_ancienne_profession': t1.get('ancienneProfession'),
            't1_chef_entreprise': t1.get('chefEntreprise', False),
            't1_entreprise_denomination': t1.get('entrepriseDenomination'),
            't1_entreprise_forme_juridique': t1.get('entrepriseFormeJuridique'),
            't1_entreprise_siege_social': t1.get('entrepriseSiegeSocial'),
        })

        # Titulaire 2 (si présent)
        if data.get('hasTitulaire2'):
            t2 = data.get('titulaire2', {})
            result.update({
                't2_civilite': self._map_civilite(t2.get('civilite')) if t2.get('civilite') else None,
                't2_nom': t2.get('nom'),
                't2_nom_jeune_fille': t2.get('nomJeuneFille'),
                't2_prenom': t2.get('prenom'),
                't2_date_naissance': self._parse_date(t2.get('dateNaissance')),
                't2_lieu_naissance': t2.get('lieuNaissance'),
                't2_nationalite': t2.get('nationalite'),
                't2_adresse': t2.get('adresse'),
                't2_email': t2.get('email'),
                't2_telephone': t2.get('telephone'),
                't2_us_person': t2.get('usPerson', False),
                't2_regime_protection_juridique': t2.get('regimeProtection', False),
                't2_regime_protection_forme': t2.get('regimeProtectionType'),
                't2_representant_legal': t2.get('representantLegal'),
                't2_residence_fiscale': t2.get('residenceFiscale'),
                't2_residence_fiscale_autre': t2.get('residenceFiscaleAutre'),
                't2_profession': t2.get('profession'),
                't2_retraite_depuis': self._parse_date(t2.get('retraiteDepuis')),
                't2_chomage_depuis': self._parse_date(t2.get('chomageDepuis')),
                't2_ancienne_profession': t2.get('ancienneProfession'),
                't2_chef_entreprise': t2.get('chefEntreprise', False),
                't2_entreprise_denomination': t2.get('entrepriseDenomination'),
                't2_entreprise_forme_juridique': t2.get('entrepriseFormeJuridique'),
                't2_entreprise_siege_social': t2.get('entrepriseSiegeSocial'),
            })

        # Situation familiale
        sf = data.get('situationFamiliale', {})
        result.update({
            'situation_familiale': self._map_situation_familiale(sf.get('situation', 'celibataire')),
            'date_mariage': self._parse_date(sf.get('dateMariage')),
            'contrat_mariage': sf.get('contratMariage', False),
            'regime_matrimonial': sf.get('regimeMatrimonial'),
            'date_pacs': self._parse_date(sf.get('datePacs')),
            'convention_pacs': sf.get('conventionPacs', False),
            'date_divorce': self._parse_date(sf.get('dateDivorce')),
            'donation_entre_epoux': sf.get('donationEntreEpoux', False),
            'donation_entre_epoux_date': self._parse_date(sf.get('donationEntreEpouxDate')),
            'donation_entre_epoux_montant': sf.get('donationEntreEpouxMontant'),
            'donation_enfants': sf.get('donationEnfants', False),
            'donation_enfants_date': self._parse_date(sf.get('donationEnfantsDate')),
            'donation_enfants_montant': sf.get('donationEnfantsMontant'),
            'nombre_enfants': sf.get('nombreEnfants', 0),
            'nombre_enfants_charge': sf.get('nombreEnfantsACharge', 0),
            'enfants': sf.get('enfants', []),
        })

        # Situation financière
        fin = data.get('situationFinanciere', {})
        result.update({
            'revenus_annuels_foyer': fin.get('revenusAnnuelsFoyer', '<50000'),
            'patrimoine_global': fin.get('patrimoineGlobal', '<100000'),
            'charges_annuelles_pourcent': fin.get('chargesAnnuellesPourcent'),
            'charges_annuelles_montant': fin.get('chargesAnnuellesMontant'),
            'capacite_epargne_mensuelle': fin.get('capaciteEpargneMensuelle'),
            'impot_revenu': fin.get('impotRevenu', False),
            'impot_fortune_immobiliere': fin.get('impotFortuneImmobiliere', False),
            'patrimoine_financier_pourcent': fin.get('patrimoineFinancierPourcent'),
            'patrimoine_immobilier_pourcent': fin.get('patrimoineImmobilierPourcent'),
            'patrimoine_professionnel_pourcent': fin.get('patrimoineProfessionnelPourcent'),
            'patrimoine_autres_pourcent': fin.get('patrimoineAutresPourcent'),
        })

        # Origine des fonds
        of = data.get('origineFonds', {})
        result.update({
            'origine_fonds_nature': of.get('nature', 'liquidites'),
            'origine_fonds_montant_prevu': of.get('montantPrevu'),
            'origine_economique_revenus': of.get('origineRevenus', False),
            'origine_economique_epargne': of.get('origineEpargne', False),
            'origine_economique_heritage': of.get('origineHeritage', False),
            'origine_economique_cession_pro': of.get('origineCessionPro', False),
            'origine_economique_cession_immo': of.get('origineCessionImmo', False),
            'origine_economique_cession_mobiliere': of.get('origineCessionMobiliere', False),
            'origine_economique_gains_jeu': of.get('origineGainsJeu', False),
            'origine_economique_assurance_vie': of.get('origineAssuranceVie', False),
            'origine_economique_autres': of.get('origineAutres'),
            'origine_fonds_provenance_etablissement': of.get('etablissementBancaireOrigine'),
        })

        # Patrimoine détaillé
        pat = data.get('patrimoine', {})
        result.update({
            'patrimoine_financier': pat.get('actifsFinanciers', []),
            'patrimoine_immobilier': pat.get('actifsImmobiliers', []),
            'patrimoine_professionnel': pat.get('actifsProfessionnels', []),
            'patrimoine_emprunts': pat.get('emprunts', []),
            'patrimoine_revenus': pat.get('revenus', []),
            'patrimoine_charges': pat.get('charges', []),
        })

        # KYC (stocké en JSON)
        kyc = data.get('kyc', {})
        # On stocke le KYC complet dans form_data, pas besoin de mapper tous les champs

        # Profil de risque
        pr = data.get('profilRisque', {})
        result.update({
            'horizon_placement': pr.get('horizonPlacement', ''),
            'objectifs_investissement': pr.get('objectifPrincipal', ''),
            'tolerance_risque': str(pr.get('tolerancePerte', 0)),
            'pertes_maximales_acceptables': str(pr.get('tolerancePerte', 0)) + '%',
            'reaction_perte': pr.get('reactionBaisse'),
            'pourcentage_patrimoine_investi': str(pr.get('partRisquee', 0)) + '%',
            'liquidite_importante': pr.get('importanceGarantieCapital', 5) >= 5,
            'profil_risque_calcule': pr.get('profilValide'),
        })

        # Durabilité ESG
        dur = data.get('durabilite', {})
        result.update({
            'durabilite_souhait': dur.get('interesseESG', False),
            'durabilite_niveau_preference': dur.get('niveauPreference'),
            'durabilite_importance_environnement': dur.get('importanceEnvironnement'),
            'durabilite_importance_social': dur.get('importanceSocial'),
            'durabilite_importance_gouvernance': dur.get('importanceGouvernance'),
            'durabilite_exclusions': dur.get('exclusions', {}),
            'durabilite_investissement_impact': dur.get('investissementImpact', False),
            'durabilite_investissement_solidaire': dur.get('investissementSolidaire', False),
            'durabilite_taxonomie_pourcent': dur.get('alignementTaxonomieMin'),
            'durabilite_prise_compte_pai': dur.get('prendreEnComptePAI'),
            'durabilite_confirmation': dur.get('confirmationPreferences', False),
        })

        # RTO - Convention Réception Transmission Ordres
        rto = data.get('rto', {})
        result.update({
            'rto_type_client': rto.get('typeClient', 'personne_physique'),
            'rto_est_profession_liberal': rto.get('estProfessionLiberal', False),
            'rto_siret_professionnel': rto.get('siretProfessionnel'),
            'rto_activite_professionnelle': rto.get('activiteProfessionnelle'),
            'rto_comptes': rto.get('comptes', []),
            'rto_modes_communication': rto.get('modesCommunication', []),
            'rto_modes_communication_autre': rto.get('modesCommunicationAutre'),
        })

        # Personne morale RTO
        pm = rto.get('personneMorale', {})
        if pm:
            result.update({
                'rto_pm_raison_sociale': pm.get('raisonSociale'),
                'rto_pm_objet_social': pm.get('objetSocial'),
                'rto_pm_forme_juridique': pm.get('formeJuridique'),
                'rto_pm_numero_rcs': pm.get('numeroRCS'),
                'rto_pm_ville_rcs': pm.get('villeRCS'),
                'rto_pm_siege_social': pm.get('siegeSocial'),
                'rto_pm_code_postal_siege': pm.get('codePostalSiege'),
                'rto_pm_ville_siege': pm.get('villeSiege'),
                'rto_pm_representant_civilite': pm.get('representantCivilite'),
                'rto_pm_representant_nom': pm.get('representantNom'),
                'rto_pm_representant_prenom': pm.get('representantPrenom'),
                'rto_pm_representant_qualite': pm.get('representantQualite'),
            })

        return result