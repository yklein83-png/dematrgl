"""
Modèle Client - Table principale avec 120+ champs
Conforme aux exigences AMF/ACPR pour KYC et profil de risque
"""

from sqlalchemy import (
    Column, String, Boolean, DateTime, Date, 
    Integer, Numeric, Text, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, Dict, Any, List
import enum

from app.database import Base


class ClientStatut(str, enum.Enum):
    """Statuts possibles d'un client"""
    BROUILLON = "brouillon"
    PROSPECT = "prospect"
    CLIENT_ACTIF = "client_actif"
    CLIENT_INACTIF = "client_inactif"


class EtapeParcours(str, enum.Enum):
    """
    Étapes du parcours réglementaire
    Ordre strict: DER → KYC → Lettre Mission → Déclaration Adéquation → RTO
    """
    IDENTITE = "identite"                    # Étape 1: Saisie identité
    SITUATION = "situation"                  # Étape 2: Situation familiale/financière
    KYC = "kyc"                              # Étape 3: Questionnaire KYC
    PROFIL_RISQUE = "profil_risque"          # Étape 4: Profil de risque
    DURABILITE = "durabilite"                # Étape 5: Préférences ESG
    LCB_FT = "lcb_ft"                        # Étape 6: Conformité LCB-FT
    DER_GENERE = "der_genere"                # Étape 7: DER généré
    DER_SIGNE = "der_signe"                  # Étape 8: DER signé
    LETTRE_MISSION = "lettre_mission"        # Étape 9: Lettre de mission
    LETTRE_MISSION_SIGNEE = "lettre_mission_signee"  # Étape 10: Lettre signée
    ADEQUATION = "adequation"                # Étape 11: Déclaration d'adéquation
    RTO = "rto"                              # Étape 12: RTO (si applicable)
    COMPLET = "complet"                      # Parcours terminé


class Civilite(str, enum.Enum):
    """Civilités autorisées"""
    MONSIEUR = "Monsieur"
    MADAME = "Madame"


class SituationFamiliale(str, enum.Enum):
    """Situations familiales possibles"""
    CELIBATAIRE = "Célibataire"
    MARIE = "Marié(e)"
    PACSE = "Pacsé(e)"
    DIVORCE = "Divorcé(e)"
    VEUF = "Veuf(ve)"
    UNION_LIBRE = "Union libre"


class Client(Base):
    """
    Modèle Client - Table centrale de l'application
    Contient toutes les informations réglementaires AMF/ACPR
    """
    __tablename__ = "clients"
    
    # ==========================================
    # IDENTIFIANTS
    # ==========================================
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conseiller_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, index=True)
    numero_client = Column(String(50), unique=True, index=True)  # Format: FAR-2025-0001
    statut = Column(String(50), default=ClientStatut.PROSPECT.value, index=True)
    
    # ==========================================
    # SECTION 1 : IDENTITÉ TITULAIRE 1
    # Note: Champs nullable pour permettre les brouillons
    # ==========================================
    t1_civilite = Column(String(10), nullable=True)
    t1_nom = Column(String(100), nullable=True, index=True)
    t1_nom_jeune_fille = Column(String(100))
    t1_prenom = Column(String(100), nullable=True)
    t1_date_naissance = Column(Date, nullable=True)
    t1_lieu_naissance = Column(String(100), nullable=True)
    t1_nationalite = Column(String(100), default='Française')
    t1_adresse = Column(Text, nullable=True)
    t1_email = Column(String(255), nullable=True, index=True)
    t1_telephone = Column(String(50), nullable=True)
    t1_us_person = Column(Boolean, default=False)
    t1_regime_protection_juridique = Column(Boolean, default=False)
    t1_regime_protection_forme = Column(String(100))
    t1_representant_legal = Column(String(255))
    t1_residence_fiscale = Column(String(100), default='France')
    t1_residence_fiscale_autre = Column(String(255))
    t1_profession = Column(String(100), nullable=True)
    t1_retraite_depuis = Column(Date)
    t1_chomage_depuis = Column(Date)
    t1_ancienne_profession = Column(String(100))
    t1_chef_entreprise = Column(Boolean, default=False)
    t1_entreprise_denomination = Column(String(255))
    t1_entreprise_forme_juridique = Column(String(100))
    t1_entreprise_siege_social = Column(Text)
    
    # ==========================================
    # SECTION 2 : IDENTITÉ TITULAIRE 2 (Optionnel)
    # ==========================================
    t2_civilite = Column(String(10))
    t2_nom = Column(String(100))
    t2_nom_jeune_fille = Column(String(100))
    t2_prenom = Column(String(100))
    t2_date_naissance = Column(Date)
    t2_lieu_naissance = Column(String(100))
    t2_nationalite = Column(String(100))
    t2_adresse = Column(Text)
    t2_email = Column(String(255))
    t2_telephone = Column(String(50))
    t2_us_person = Column(Boolean, default=False)
    t2_regime_protection_juridique = Column(Boolean, default=False)
    t2_regime_protection_forme = Column(String(100))
    t2_representant_legal = Column(String(255))
    t2_residence_fiscale = Column(String(100))
    t2_residence_fiscale_autre = Column(String(255))
    t2_profession = Column(String(100))
    t2_retraite_depuis = Column(Date)
    t2_chomage_depuis = Column(Date)
    t2_ancienne_profession = Column(String(100))
    t2_chef_entreprise = Column(Boolean, default=False)
    t2_entreprise_denomination = Column(String(255))
    t2_entreprise_forme_juridique = Column(String(100))
    t2_entreprise_siege_social = Column(Text)
    
    # ==========================================
    # SECTION 3 : SITUATION FAMILIALE
    # ==========================================
    situation_familiale = Column(String(50), nullable=True)  # nullable pour brouillons
    date_mariage = Column(Date)
    contrat_mariage = Column(Boolean, default=False)
    regime_matrimonial = Column(String(100))
    date_pacs = Column(Date)
    convention_pacs = Column(Boolean, default=False)
    regime_pacs = Column(String(100))
    date_divorce = Column(Date)
    donation_entre_epoux = Column(Boolean, default=False)
    donation_entre_epoux_date = Column(Date)
    donation_entre_epoux_montant = Column(Numeric(15, 2))
    donation_enfants = Column(Boolean, default=False)
    donation_enfants_date = Column(Date)
    donation_enfants_montant = Column(Numeric(15, 2))
    nombre_enfants = Column(Integer, default=0)
    nombre_enfants_charge = Column(Integer, default=0)
    enfants = Column(JSONB)  # Liste des enfants avec détails
    
    # ==========================================
    # SECTION 4 : SITUATION FINANCIÈRE
    # ==========================================
    revenus_annuels_foyer = Column(String(50), nullable=True)  # nullable pour brouillons
    patrimoine_global = Column(String(50), nullable=True)  # nullable pour brouillons
    charges_annuelles_pourcent = Column(Numeric(5, 2))
    charges_annuelles_montant = Column(Numeric(15, 2))
    capacite_epargne_mensuelle = Column(Numeric(15, 2))
    impot_revenu = Column(Boolean, default=False)
    impot_fortune_immobiliere = Column(Boolean, default=False)
    
    # Répartition patrimoine (pourcentages)
    patrimoine_financier_pourcent = Column(Numeric(5, 2))
    patrimoine_immobilier_pourcent = Column(Numeric(5, 2))
    patrimoine_professionnel_pourcent = Column(Numeric(5, 2))
    patrimoine_autres_pourcent = Column(Numeric(5, 2))
    
    # ==========================================
    # SECTION 5 : ORIGINE DES FONDS
    # ==========================================
    origine_fonds_nature = Column(String(100), nullable=True)  # nullable pour brouillons
    origine_fonds_montant_prevu = Column(Numeric(15, 2))
    origine_economique_revenus = Column(Boolean, default=False)
    origine_economique_epargne = Column(Boolean, default=False)
    origine_economique_heritage = Column(Boolean, default=False)
    origine_economique_cession_pro = Column(Boolean, default=False)
    origine_economique_cession_immo = Column(Boolean, default=False)
    origine_economique_cession_mobiliere = Column(Boolean, default=False)
    origine_economique_gains_jeu = Column(Boolean, default=False)
    origine_economique_assurance_vie = Column(Boolean, default=False)
    origine_economique_autres = Column(String(255))
    origine_fonds_provenance_etablissement = Column(String(255))
    
    # ==========================================
    # SECTION 6 : PATRIMOINE DÉTAILLÉ (JSONB)
    # ==========================================
    patrimoine_financier = Column(JSONB)  # Liste actifs financiers
    patrimoine_immobilier = Column(JSONB)  # Liste actifs immobiliers
    patrimoine_professionnel = Column(JSONB)  # Liste actifs professionnels
    patrimoine_emprunts = Column(JSONB)  # Liste des emprunts
    patrimoine_revenus = Column(JSONB)  # Liste des revenus détaillés
    patrimoine_charges = Column(JSONB)  # Liste des charges détaillées
    
    # ==========================================
    # SECTION 7 : CONNAISSANCE ET EXPÉRIENCE (KYC)
    # ==========================================
    
    # Produits monétaires
    kyc_monetaires_detention = Column(Boolean, default=False)
    kyc_monetaires_operations = Column(String(50))
    kyc_monetaires_duree = Column(String(50))
    kyc_monetaires_volume = Column(String(50))
    kyc_monetaires_q1 = Column(String(20))
    kyc_monetaires_q2 = Column(String(20))
    
    # Obligations
    kyc_obligations_detention = Column(Boolean, default=False)
    kyc_obligations_operations = Column(String(50))
    kyc_obligations_duree = Column(String(50))
    kyc_obligations_volume = Column(String(50))
    kyc_obligations_q1 = Column(String(20))
    kyc_obligations_q2 = Column(String(20))
    
    # Actions
    kyc_actions_detention = Column(Boolean, default=False)
    kyc_actions_operations = Column(String(50))
    kyc_actions_duree = Column(String(50))
    kyc_actions_volume = Column(String(50))
    kyc_actions_q1 = Column(String(20))
    kyc_actions_q2 = Column(String(20))
    
    # SCPI
    kyc_scpi_detention = Column(Boolean, default=False)
    kyc_scpi_operations = Column(String(50))
    kyc_scpi_duree = Column(String(50))
    kyc_scpi_volume = Column(String(50))
    kyc_scpi_q1 = Column(String(20))
    kyc_scpi_q2 = Column(String(20))
    
    # Private Equity
    kyc_pe_detention = Column(Boolean, default=False)
    kyc_pe_operations = Column(String(50))
    kyc_pe_duree = Column(String(50))
    kyc_pe_volume = Column(String(50))
    kyc_pe_q1 = Column(String(20))
    kyc_pe_q2 = Column(String(20))
    
    # ETF
    kyc_etf_detention = Column(Boolean, default=False)
    kyc_etf_operations = Column(String(50))
    kyc_etf_duree = Column(String(50))
    kyc_etf_volume = Column(String(50))
    kyc_etf_q1 = Column(String(20))
    kyc_etf_q2 = Column(String(20))
    
    # Dérivés
    kyc_derives_detention = Column(Boolean, default=False)
    kyc_derives_operations = Column(String(50))
    kyc_derives_duree = Column(String(50))
    kyc_derives_volume = Column(String(50))
    kyc_derives_q1 = Column(String(20))
    kyc_derives_q2 = Column(String(20))
    
    # Structurés
    kyc_structures_detention = Column(Boolean, default=False)
    kyc_structures_operations = Column(String(50))
    kyc_structures_duree = Column(String(50))
    kyc_structures_volume = Column(String(50))
    kyc_structures_q1 = Column(String(20))
    kyc_structures_q2 = Column(String(20))
    
    # Gestion portefeuille
    kyc_portefeuille_mandat = Column(Boolean, default=False)
    kyc_portefeuille_gestion_personnelle = Column(Boolean, default=False)
    kyc_portefeuille_gestion_conseiller = Column(Boolean, default=False)
    kyc_portefeuille_experience_pro = Column(Boolean, default=False)
    
    # Culture financière
    kyc_culture_presse_financiere = Column(Boolean, default=False)
    kyc_culture_suivi_bourse = Column(Boolean, default=False)
    kyc_culture_releves_bancaires = Column(Boolean, default=False)
    
    # ==========================================
    # SECTION 8 : PROFIL DE RISQUE
    # ==========================================
    objectifs_investissement = Column(String(255), nullable=True)  # nullable pour brouillons
    horizon_placement = Column(String(50), nullable=True)  # nullable pour brouillons
    tolerance_risque = Column(String(50), nullable=True)  # nullable pour brouillons
    pertes_maximales_acceptables = Column(String(50), nullable=True)  # nullable pour brouillons
    experience_perte = Column(Boolean, default=False)
    experience_perte_niveau = Column(String(50))
    reaction_perte = Column(String(100))
    reaction_gain = Column(String(100))
    liquidite_importante = Column(Boolean, default=True)
    pourcentage_patrimoine_investi = Column(String(50))
    
    # Profil calculé
    profil_risque_calcule = Column(String(50), index=True)
    profil_risque_score = Column(Integer)
    profil_risque_date_calcul = Column(DateTime(timezone=True))
    
    # ==========================================
    # SECTION 9 : PRÉFÉRENCES DURABILITÉ (ESG)
    # ==========================================
    durabilite_souhait = Column(Boolean, default=False)
    durabilite_niveau_preference = Column(String(50))  # non_interesse, interesse, prioritaire, exclusif
    durabilite_importance_environnement = Column(Integer)  # 1-10
    durabilite_importance_social = Column(Integer)  # 1-10
    durabilite_importance_gouvernance = Column(Integer)  # 1-10
    durabilite_exclusions = Column(JSONB)  # Liste des secteurs exclus
    durabilite_investissement_impact = Column(Boolean, default=False)
    durabilite_investissement_solidaire = Column(Boolean, default=False)
    durabilite_taxonomie_pourcent = Column(Integer)  # % minimum alignement UE
    durabilite_prise_compte_pai = Column(String(10))  # oui/non
    durabilite_confirmation = Column(Boolean, default=False)
    durabilite_criteres = Column(JSONB)  # Critères détaillés (legacy)
    
    # ==========================================
    # SECTION 10 : LCB-FT (Lutte Blanchiment)
    # ==========================================
    lcb_ft_niveau_risque = Column(String(50), index=True)
    lcb_ft_ppe = Column(Boolean, default=False)
    lcb_ft_ppe_fonction = Column(String(255))
    lcb_ft_ppe_famille = Column(Boolean, default=False)
    lcb_ft_gel_avoirs_verifie = Column(Boolean, default=False)
    lcb_ft_gel_avoirs_date_verification = Column(Date)
    lcb_ft_justificatifs = Column(JSONB)
    
    # ==========================================
    # DONNÉES FORMULAIRE COMPLET (JSON)
    # ==========================================
    # Stockage du formulaire frontend complet pour reconstruction
    form_data = Column(JSONB)  # Données complètes du formulaire frontend
    documents_selectionnes = Column(JSONB)  # Liste des documents à générer

    # ==========================================
    # SECTION 11 : WORKFLOW RÉGLEMENTAIRE
    # ==========================================
    # Suivi du parcours réglementaire
    etape_parcours = Column(String(50), default=EtapeParcours.IDENTITE.value, index=True)

    # Lettre de Mission
    contexte_prestation = Column(Text)  # Description du contexte pour la Lettre de Mission
    lettre_mission_generee = Column(Boolean, default=False)
    lettre_mission_date_generation = Column(DateTime(timezone=True))
    lettre_mission_signee = Column(Boolean, default=False)
    lettre_mission_date_signature = Column(DateTime(timezone=True))

    # Document d'Entrée en Relation (DER)
    der_genere = Column(Boolean, default=False)
    der_date_generation = Column(DateTime(timezone=True))
    der_signe = Column(Boolean, default=False)
    der_date_signature = Column(DateTime(timezone=True))

    # Déclaration d'Adéquation
    adequation_generee = Column(Boolean, default=False)
    adequation_date_generation = Column(DateTime(timezone=True))
    adequation_signee = Column(Boolean, default=False)
    adequation_date_signature = Column(DateTime(timezone=True))

    # RTO (Relevé des Transactions et Opérations)
    rto_applicable = Column(Boolean, default=False)  # Si le client nécessite un RTO
    rto_genere = Column(Boolean, default=False)
    rto_date_generation = Column(DateTime(timezone=True))
    rto_signe = Column(Boolean, default=False)
    rto_date_signature = Column(DateTime(timezone=True))

    # ==========================================
    # MÉTADONNÉES
    # ==========================================
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    validated_at = Column(DateTime(timezone=True))
    validated_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    
    # ==========================================
    # RELATIONS
    # ==========================================
    
    # Relation avec le conseiller
    conseiller = relationship("User", back_populates="clients", foreign_keys=[conseiller_id])
    
    # Relation avec le validateur
    validateur = relationship("User", back_populates="clients_valides", foreign_keys=[validated_by])
    
    # Un client peut avoir plusieurs produits
    produits = relationship("Produit", back_populates="client", cascade="all, delete-orphan")
    
    # Un client peut avoir plusieurs documents
    documents = relationship("Document", back_populates="client", cascade="all, delete-orphan")
    
    # ==========================================
    # MÉTHODES
    # ==========================================
    
    def __repr__(self) -> str:
        """Représentation string"""
        return f"<Client {self.numero_client} - {self.t1_nom} {self.t1_prenom}>"
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convertit l'objet en dictionnaire
        Gère les dates, UUID et Decimal pour JSON
        """
        result = {}
        for column in self.__table__.columns:
            value = getattr(self, column.name)
            if isinstance(value, (datetime, date)):
                result[column.name] = value.isoformat() if value else None
            elif isinstance(value, uuid.UUID):
                result[column.name] = str(value)
            elif isinstance(value, Decimal):
                result[column.name] = float(value)
            else:
                result[column.name] = value
        return result
    
    @property
    def nom_complet_t1(self) -> str:
        """Nom complet titulaire 1"""
        return f"{self.t1_prenom} {self.t1_nom}"
    
    @property
    def nom_complet_t2(self) -> Optional[str]:
        """Nom complet titulaire 2 si existe"""
        if self.t2_nom and self.t2_prenom:
            return f"{self.t2_prenom} {self.t2_nom}"
        return None
    
    @property
    def has_titulaire_2(self) -> bool:
        """Vérifie si un second titulaire existe"""
        return bool(self.t2_nom and self.t2_prenom)
    
    @property
    def is_validated(self) -> bool:
        """Vérifie si le client est validé"""
        return self.validated_at is not None
    
    @property
    def is_us_person(self) -> bool:
        """Vérifie si au moins un titulaire est US Person"""
        return self.t1_us_person or (self.t2_us_person if self.has_titulaire_2 else False)
    
    @property
    def is_ppe(self) -> bool:
        """Vérifie si c'est une personne politiquement exposée"""
        return self.lcb_ft_ppe or self.lcb_ft_ppe_famille