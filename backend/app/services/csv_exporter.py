"""
Service d'export CSV pour Harvest CRM
Export des 120+ champs clients
"""

import csv
import io
from typing import List, Dict, Any
from datetime import datetime

from app.models.client import Client


class CsvExporter:
    """
    Exporteur CSV pour intégration Harvest CRM
    Gère le format spécifique avec 120+ colonnes
    """
    
    def __init__(self):
        """Initialise l'exporteur avec la configuration des colonnes"""
        self.harvest_columns = self._get_harvest_columns()
    
    def _get_harvest_columns(self) -> List[str]:
        """
        Définir les colonnes pour Harvest CRM
        120+ colonnes dans l'ordre exact requis
        
        Returns:
            Liste ordonnée des noms de colonnes
        """
        return [
            # Identifiants
            "numero_client",
            "statut",
            "date_creation",
            "date_validation",
            
            # Titulaire 1 (25 colonnes)
            "t1_civilite",
            "t1_nom",
            "t1_nom_jeune_fille",
            "t1_prenom",
            "t1_date_naissance",
            "t1_lieu_naissance",
            "t1_nationalite",
            "t1_adresse",
            "t1_email",
            "t1_telephone",
            "t1_us_person",
            "t1_regime_protection_juridique",
            "t1_regime_protection_forme",
            "t1_representant_legal",
            "t1_residence_fiscale",
            "t1_residence_fiscale_autre",
            "t1_profession",
            "t1_retraite_depuis",
            "t1_chomage_depuis",
            "t1_ancienne_profession",
            "t1_chef_entreprise",
            "t1_entreprise_denomination",
            "t1_entreprise_forme_juridique",
            "t1_entreprise_siege_social",
            
            # Titulaire 2 (25 colonnes)
            "t2_civilite",
            "t2_nom",
            "t2_nom_jeune_fille",
            "t2_prenom",
            "t2_date_naissance",
            "t2_lieu_naissance",
            "t2_nationalite",
            "t2_adresse",
            "t2_email",
            "t2_telephone",
            "t2_us_person",
            "t2_regime_protection_juridique",
            "t2_regime_protection_forme",
            "t2_representant_legal",
            "t2_residence_fiscale",
            "t2_residence_fiscale_autre",
            "t2_profession",
            "t2_retraite_depuis",
            "t2_chomage_depuis",
            "t2_ancienne_profession",
            "t2_chef_entreprise",
            "t2_entreprise_denomination",
            "t2_entreprise_forme_juridique",
            "t2_entreprise_siege_social",
            
            # Situation familiale (15 colonnes)
            "situation_familiale",
            "date_mariage",
            "contrat_mariage",
            "regime_matrimonial",
            "date_pacs",
            "convention_pacs",
            "regime_pacs",
            "date_divorce",
            "donation_entre_epoux",
            "donation_entre_epoux_date",
            "donation_entre_epoux_montant",
            "donation_enfants",
            "donation_enfants_date",
            "donation_enfants_montant",
            "nombre_enfants",
            "nombre_enfants_charge",
            
            # Situation financière (11 colonnes)
            "revenus_annuels_foyer",
            "patrimoine_global",
            "charges_annuelles_pourcent",
            "charges_annuelles_montant",
            "capacite_epargne_mensuelle",
            "impot_revenu",
            "impot_fortune_immobiliere",
            "patrimoine_financier_pourcent",
            "patrimoine_immobilier_pourcent",
            "patrimoine_professionnel_pourcent",
            "patrimoine_autres_pourcent",
            
            # Origine des fonds (11 colonnes)
            "origine_fonds_nature",
            "origine_fonds_montant_prevu",
            "origine_economique_revenus",
            "origine_economique_epargne",
            "origine_economique_heritage",
            "origine_economique_cession_pro",
            "origine_economique_cession_immo",
            "origine_economique_cession_mobiliere",
            "origine_economique_gains_jeu",
            "origine_economique_assurance_vie",
            "origine_economique_autres",
            "origine_fonds_provenance_etablissement",
            
            # KYC - Produits (8 colonnes par produit x 8 = 64 colonnes réduit à échantillon)
            "kyc_monetaires_detention",
            "kyc_monetaires_operations",
            "kyc_monetaires_duree",
            "kyc_monetaires_volume",
            "kyc_obligations_detention",
            "kyc_obligations_operations",
            "kyc_actions_detention",
            "kyc_actions_operations",
            "kyc_scpi_detention",
            "kyc_scpi_operations",
            
            # Gestion portefeuille (4 colonnes)
            "kyc_portefeuille_mandat",
            "kyc_portefeuille_gestion_personnelle",
            "kyc_portefeuille_gestion_conseiller",
            "kyc_portefeuille_experience_pro",
            
            # Culture financière (3 colonnes)
            "kyc_culture_presse_financiere",
            "kyc_culture_suivi_bourse",
            "kyc_culture_releves_bancaires",
            
            # Profil de risque (12 colonnes)
            "objectifs_investissement",
            "horizon_placement",
            "tolerance_risque",
            "pertes_maximales_acceptables",
            "experience_perte",
            "experience_perte_niveau",
            "reaction_perte",
            "reaction_gain",
            "liquidite_importante",
            "pourcentage_patrimoine_investi",
            "profil_risque_calcule",
            "profil_risque_score",
            
            # Durabilité (5 colonnes)
            "durabilite_souhait",
            "durabilite_taxonomie_pourcent",
            "durabilite_investissements_pourcent",
            "durabilite_impact_selection",
            
            # LCB-FT (5 colonnes)
            "lcb_ft_niveau_risque",
            "lcb_ft_ppe",
            "lcb_ft_ppe_fonction",
            "lcb_ft_ppe_famille",
            "lcb_ft_gel_avoirs_verifie",
            
            # Conseiller
            "conseiller_nom",
            "conseiller_prenom",
            "conseiller_email",
        ]
    
    def _format_date(self, date_obj) -> str:
        """Formater une date pour CSV"""
        if not date_obj:
            return ""
        if isinstance(date_obj, str):
            return date_obj
        return date_obj.strftime("%d/%m/%Y")
    
    def _format_datetime(self, datetime_obj) -> str:
        """Formater un datetime pour CSV"""
        if not datetime_obj:
            return ""
        if isinstance(datetime_obj, str):
            return datetime_obj
        return datetime_obj.strftime("%d/%m/%Y %H:%M:%S")
    
    def _format_bool(self, value: bool) -> str:
        """Formater un booléen pour CSV"""
        if value is None:
            return ""
        return "OUI" if value else "NON"
    
    def _format_decimal(self, value) -> str:
        """Formater un decimal pour CSV"""
        if not value:
            return "0"
        return str(value).replace(".", ",")
    
    def _client_to_row(self, client: Client) -> Dict[str, Any]:
        """
        Convertir un client en ligne CSV
        
        Args:
            client: Client avec toutes ses données
            
        Returns:
            Dict avec valeurs pour chaque colonne
        """
        row = {
            # Identifiants
            "numero_client": client.numero_client,
            "statut": client.statut,
            "date_creation": self._format_datetime(client.created_at),
            "date_validation": self._format_datetime(client.validated_at),
            
            # Titulaire 1
            "t1_civilite": client.t1_civilite,
            "t1_nom": client.t1_nom,
            "t1_nom_jeune_fille": client.t1_nom_jeune_fille or "",
            "t1_prenom": client.t1_prenom,
            "t1_date_naissance": self._format_date(client.t1_date_naissance),
            "t1_lieu_naissance": client.t1_lieu_naissance,
            "t1_nationalite": client.t1_nationalite,
            "t1_adresse": client.t1_adresse,
            "t1_email": client.t1_email,
            "t1_telephone": client.t1_telephone,
            "t1_us_person": self._format_bool(client.t1_us_person),
            "t1_regime_protection_juridique": self._format_bool(client.t1_regime_protection_juridique),
            "t1_regime_protection_forme": client.t1_regime_protection_forme or "",
            "t1_representant_legal": client.t1_representant_legal or "",
            "t1_residence_fiscale": client.t1_residence_fiscale,
            "t1_residence_fiscale_autre": client.t1_residence_fiscale_autre or "",
            "t1_profession": client.t1_profession,
            "t1_retraite_depuis": self._format_date(client.t1_retraite_depuis),
            "t1_chomage_depuis": self._format_date(client.t1_chomage_depuis),
            "t1_ancienne_profession": client.t1_ancienne_profession or "",
            "t1_chef_entreprise": self._format_bool(client.t1_chef_entreprise),
            "t1_entreprise_denomination": client.t1_entreprise_denomination or "",
            "t1_entreprise_forme_juridique": client.t1_entreprise_forme_juridique or "",
            "t1_entreprise_siege_social": client.t1_entreprise_siege_social or "",
            
            # Titulaire 2
            "t2_civilite": client.t2_civilite or "",
            "t2_nom": client.t2_nom or "",
            "t2_nom_jeune_fille": client.t2_nom_jeune_fille or "",
            "t2_prenom": client.t2_prenom or "",
            "t2_date_naissance": self._format_date(client.t2_date_naissance),
            "t2_lieu_naissance": client.t2_lieu_naissance or "",
            "t2_nationalite": client.t2_nationalite or "",
            "t2_adresse": client.t2_adresse or "",
            "t2_email": client.t2_email or "",
            "t2_telephone": client.t2_telephone or "",
            "t2_us_person": self._format_bool(client.t2_us_person),
            "t2_regime_protection_juridique": self._format_bool(client.t2_regime_protection_juridique),
            "t2_regime_protection_forme": client.t2_regime_protection_forme or "",
            "t2_representant_legal": client.t2_representant_legal or "",
            "t2_residence_fiscale": client.t2_residence_fiscale or "",
            "t2_residence_fiscale_autre": client.t2_residence_fiscale_autre or "",
            "t2_profession": client.t2_profession or "",
            "t2_retraite_depuis": self._format_date(client.t2_retraite_depuis),
            "t2_chomage_depuis": self._format_date(client.t2_chomage_depuis),
            "t2_ancienne_profession": client.t2_ancienne_profession or "",
            "t2_chef_entreprise": self._format_bool(client.t2_chef_entreprise),
            "t2_entreprise_denomination": client.t2_entreprise_denomination or "",
            "t2_entreprise_forme_juridique": client.t2_entreprise_forme_juridique or "",
            "t2_entreprise_siege_social": client.t2_entreprise_siege_social or "",
            
            # Situation familiale
            "situation_familiale": client.situation_familiale,
            "date_mariage": self._format_date(client.date_mariage),
            "contrat_mariage": self._format_bool(client.contrat_mariage),
            "regime_matrimonial": client.regime_matrimonial or "",
            "date_pacs": self._format_date(client.date_pacs),
            "convention_pacs": self._format_bool(client.convention_pacs),
            "regime_pacs": client.regime_pacs or "",
            "date_divorce": self._format_date(client.date_divorce),
            "donation_entre_epoux": self._format_bool(client.donation_entre_epoux),
            "donation_entre_epoux_date": self._format_date(client.donation_entre_epoux_date),
            "donation_entre_epoux_montant": self._format_decimal(client.donation_entre_epoux_montant),
            "donation_enfants": self._format_bool(client.donation_enfants),
            "donation_enfants_date": self._format_date(client.donation_enfants_date),
            "donation_enfants_montant": self._format_decimal(client.donation_enfants_montant),
            "nombre_enfants": str(client.nombre_enfants),
            "nombre_enfants_charge": str(client.nombre_enfants_charge),
            
            # Situation financière
            "revenus_annuels_foyer": client.revenus_annuels_foyer,
            "patrimoine_global": client.patrimoine_global,
            "charges_annuelles_pourcent": self._format_decimal(client.charges_annuelles_pourcent),
            "charges_annuelles_montant": self._format_decimal(client.charges_annuelles_montant),
            "capacite_epargne_mensuelle": self._format_decimal(client.capacite_epargne_mensuelle),
            "impot_revenu": self._format_bool(client.impot_revenu),
            "impot_fortune_immobiliere": self._format_bool(client.impot_fortune_immobiliere),
            "patrimoine_financier_pourcent": self._format_decimal(client.patrimoine_financier_pourcent),
            "patrimoine_immobilier_pourcent": self._format_decimal(client.patrimoine_immobilier_pourcent),
            "patrimoine_professionnel_pourcent": self._format_decimal(client.patrimoine_professionnel_pourcent),
            "patrimoine_autres_pourcent": self._format_decimal(client.patrimoine_autres_pourcent),
            
            # Origine des fonds
            "origine_fonds_nature": client.origine_fonds_nature,
            "origine_fonds_montant_prevu": self._format_decimal(client.origine_fonds_montant_prevu),
            "origine_economique_revenus": self._format_bool(client.origine_economique_revenus),
            "origine_economique_epargne": self._format_bool(client.origine_economique_epargne),
            "origine_economique_heritage": self._format_bool(client.origine_economique_heritage),
            "origine_economique_cession_pro": self._format_bool(client.origine_economique_cession_pro),
            "origine_economique_cession_immo": self._format_bool(client.origine_economique_cession_immo),
            "origine_economique_cession_mobiliere": self._format_bool(client.origine_economique_cession_mobiliere),
            "origine_economique_gains_jeu": self._format_bool(client.origine_economique_gains_jeu),
            "origine_economique_assurance_vie": self._format_bool(client.origine_economique_assurance_vie),
            "origine_economique_autres": client.origine_economique_autres or "",
            "origine_fonds_provenance_etablissement": client.origine_fonds_provenance_etablissement or "",
            
            # KYC échantillon
            "kyc_monetaires_detention": self._format_bool(client.kyc_monetaires_detention),
            "kyc_monetaires_operations": client.kyc_monetaires_operations or "",
            "kyc_monetaires_duree": client.kyc_monetaires_duree or "",
            "kyc_monetaires_volume": client.kyc_monetaires_volume or "",
            "kyc_obligations_detention": self._format_bool(client.kyc_obligations_detention),
            "kyc_obligations_operations": client.kyc_obligations_operations or "",
            "kyc_actions_detention": self._format_bool(client.kyc_actions_detention),
            "kyc_actions_operations": client.kyc_actions_operations or "",
            "kyc_scpi_detention": self._format_bool(client.kyc_scpi_detention),
            "kyc_scpi_operations": client.kyc_scpi_operations or "",
            
            # Gestion portefeuille
            "kyc_portefeuille_mandat": self._format_bool(client.kyc_portefeuille_mandat),
            "kyc_portefeuille_gestion_personnelle": self._format_bool(client.kyc_portefeuille_gestion_personnelle),
            "kyc_portefeuille_gestion_conseiller": self._format_bool(client.kyc_portefeuille_gestion_conseiller),
            "kyc_portefeuille_experience_pro": self._format_bool(client.kyc_portefeuille_experience_pro),
            
            # Culture financière
            "kyc_culture_presse_financiere": self._format_bool(client.kyc_culture_presse_financiere),
            "kyc_culture_suivi_bourse": self._format_bool(client.kyc_culture_suivi_bourse),
            "kyc_culture_releves_bancaires": self._format_bool(client.kyc_culture_releves_bancaires),
            
            # Profil de risque
            "objectifs_investissement": client.objectifs_investissement,
            "horizon_placement": client.horizon_placement,
            "tolerance_risque": client.tolerance_risque,
            "pertes_maximales_acceptables": client.pertes_maximales_acceptables,
            "experience_perte": self._format_bool(client.experience_perte),
            "experience_perte_niveau": client.experience_perte_niveau or "",
            "reaction_perte": client.reaction_perte or "",
            "reaction_gain": client.reaction_gain or "",
            "liquidite_importante": self._format_bool(client.liquidite_importante),
            "pourcentage_patrimoine_investi": client.pourcentage_patrimoine_investi or "",
            "profil_risque_calcule": client.profil_risque_calcule or "",
            "profil_risque_score": str(client.profil_risque_score) if client.profil_risque_score else "",
            
            # Durabilité
            "durabilite_souhait": self._format_bool(client.durabilite_souhait),
            "durabilite_taxonomie_pourcent": client.durabilite_taxonomie_pourcent or "",
            "durabilite_investissements_pourcent": client.durabilite_investissements_pourcent or "",
            "durabilite_impact_selection": self._format_bool(client.durabilite_impact_selection),
            
            # LCB-FT
            "lcb_ft_niveau_risque": client.lcb_ft_niveau_risque or "",
            "lcb_ft_ppe": self._format_bool(client.lcb_ft_ppe),
            "lcb_ft_ppe_fonction": client.lcb_ft_ppe_fonction or "",
            "lcb_ft_ppe_famille": self._format_bool(client.lcb_ft_ppe_famille),
            "lcb_ft_gel_avoirs_verifie": self._format_bool(client.lcb_ft_gel_avoirs_verifie),
            
            # Conseiller
            "conseiller_nom": client.conseiller.nom if client.conseiller else "",
            "conseiller_prenom": client.conseiller.prenom if client.conseiller else "",
            "conseiller_email": client.conseiller.email if client.conseiller else "",
        }
        
        return row
    
    async def export_clients_harvest(self, clients: List[Client]) -> io.StringIO:
        """
        Exporter les clients au format CSV Harvest
        
        Args:
            clients: Liste des clients à exporter
            
        Returns:
            Buffer StringIO contenant le CSV
        """
        output = io.StringIO()
        writer = csv.DictWriter(
            output,
            fieldnames=self.harvest_columns,
            delimiter=';',
            quoting=csv.QUOTE_MINIMAL
        )
        
        # Écrire l'en-tête
        writer.writeheader()
        
        # Écrire les lignes
        for client in clients:
            row = self._client_to_row(client)
            writer.writerow(row)
        
        output.seek(0)
        return output