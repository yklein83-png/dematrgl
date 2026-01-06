"""
Service de prévisualisation de documents

Permet de générer un aperçu d'un document avant la génération finale.
Utile pour validation et preview côté frontend.
"""

import io
import base64
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from datetime import datetime

from docx import Document
from docx.shared import Inches, Pt

from app.core.logging import get_logger

logger = get_logger(__name__)


@dataclass
class PreviewSection:
    """Section d'aperçu de document"""
    title: str
    content: List[str]
    is_complete: bool = True
    missing_fields: List[str] = None

    def __post_init__(self):
        if self.missing_fields is None:
            self.missing_fields = []


@dataclass
class DocumentPreview:
    """Aperçu complet d'un document"""
    document_type: str
    title: str
    sections: List[PreviewSection]
    client_name: str
    generation_date: str
    estimated_pages: int
    completion_percentage: float
    warnings: List[str]
    is_valid: bool


class DocumentPreviewService:
    """
    Service de génération d'aperçus de documents

    Génère un résumé structuré des données qui seront incluses
    dans le document final, avec validation des champs manquants.
    """

    def __init__(self):
        """Initialise le service de preview"""
        self.required_fields = self._load_required_fields()

    def _load_required_fields(self) -> Dict[str, List[str]]:
        """
        Charge la configuration des champs requis par type de document

        Returns:
            Dictionnaire des champs requis par type
        """
        return {
            "DER": [
                "t1_civilite", "t1_nom", "t1_prenom", "t1_date_naissance",
                "t1_lieu_naissance", "t1_nationalite", "t1_adresse",
                "t1_email", "t1_telephone", "t1_profession",
                "situation_familiale", "revenus_annuels_foyer", "patrimoine_global",
                "origine_fonds_nature", "objectifs_investissement",
                "horizon_placement", "tolerance_risque"
            ],
            "QCC": [
                "t1_nom", "t1_prenom",
                "kyc_monetaires_detention", "kyc_obligations_detention",
                "kyc_actions_detention", "kyc_scpi_detention",
                "profil_risque_calcule"
            ],
            "LETTRE_MISSION_CIF": [
                "t1_nom", "t1_prenom", "t1_adresse", "t1_email",
                "objectifs_investissement"
            ],
            "CONVENTION_RTO": [
                "t1_nom", "t1_prenom", "t1_adresse",
                "situation_familiale"
            ],
            "DECLARATION_ADEQUATION": [
                "t1_nom", "t1_prenom",
                "profil_risque_calcule", "objectifs_investissement",
                "horizon_placement"
            ]
        }

    def generate_preview(
        self,
        document_type: str,
        client_data: Dict[str, Any],
        conseiller_name: str = None
    ) -> DocumentPreview:
        """
        Génère un aperçu du document

        Args:
            document_type: Type de document (DER, QCC, etc.)
            client_data: Données du client
            conseiller_name: Nom du conseiller (optionnel)

        Returns:
            DocumentPreview avec les sections et validations
        """
        logger.info(f"Génération preview {document_type} pour {client_data.get('t1_nom', 'N/A')}")

        # Vérifier les champs manquants
        missing_fields = self._check_missing_fields(document_type, client_data)

        # Générer les sections selon le type
        sections = self._generate_sections(document_type, client_data)

        # Calculer le pourcentage de complétion
        required = self.required_fields.get(document_type, [])
        filled = len(required) - len(missing_fields)
        completion = (filled / len(required) * 100) if required else 100

        # Générer les warnings
        warnings = self._generate_warnings(document_type, client_data, missing_fields)

        # Estimer le nombre de pages
        estimated_pages = self._estimate_pages(document_type, client_data)

        # Nom du client
        client_name = f"{client_data.get('t1_prenom', '')} {client_data.get('t1_nom', '')}".strip()
        if not client_name:
            client_name = "Client non identifié"

        return DocumentPreview(
            document_type=document_type,
            title=self._get_document_title(document_type),
            sections=sections,
            client_name=client_name,
            generation_date=datetime.utcnow().strftime("%d/%m/%Y"),
            estimated_pages=estimated_pages,
            completion_percentage=round(completion, 1),
            warnings=warnings,
            is_valid=len(missing_fields) == 0 and completion >= 80
        )

    def _check_missing_fields(
        self,
        document_type: str,
        client_data: Dict[str, Any]
    ) -> List[str]:
        """
        Vérifie les champs requis manquants

        Args:
            document_type: Type de document
            client_data: Données du client

        Returns:
            Liste des champs manquants
        """
        required = self.required_fields.get(document_type, [])
        missing = []

        for field in required:
            value = client_data.get(field)
            if value is None or value == "" or value == []:
                missing.append(field)

        return missing

    def _generate_sections(
        self,
        document_type: str,
        client_data: Dict[str, Any]
    ) -> List[PreviewSection]:
        """
        Génère les sections du document

        Args:
            document_type: Type de document
            client_data: Données du client

        Returns:
            Liste des sections
        """
        if document_type == "DER":
            return self._generate_der_sections(client_data)
        elif document_type == "QCC":
            return self._generate_qcc_sections(client_data)
        elif document_type in ["LETTRE_MISSION_CIF", "LETTRE_MISSION_IAS"]:
            return self._generate_lettre_mission_sections(client_data)
        elif document_type == "CONVENTION_RTO":
            return self._generate_rto_sections(client_data)
        elif document_type == "DECLARATION_ADEQUATION":
            return self._generate_adequation_sections(client_data)
        else:
            return [PreviewSection(
                title="Document",
                content=["Type de document non supporté pour la preview"]
            )]

    def _generate_der_sections(self, data: Dict[str, Any]) -> List[PreviewSection]:
        """Génère les sections pour le DER"""
        sections = []

        # Section Identité Titulaire 1
        t1_content = []
        t1_missing = []

        if data.get('t1_civilite') and data.get('t1_nom'):
            t1_content.append(f"{data['t1_civilite']} {data.get('t1_prenom', '')} {data['t1_nom']}")
        else:
            t1_missing.append("Identité")

        if data.get('t1_date_naissance'):
            t1_content.append(f"Né(e) le {data['t1_date_naissance']} à {data.get('t1_lieu_naissance', 'N/A')}")
        else:
            t1_missing.append("Date/lieu naissance")

        if data.get('t1_adresse'):
            t1_content.append(f"Adresse: {data['t1_adresse']}")
        else:
            t1_missing.append("Adresse")

        if data.get('t1_email'):
            t1_content.append(f"Email: {data['t1_email']}")
        if data.get('t1_telephone'):
            t1_content.append(f"Tél: {data['t1_telephone']}")

        sections.append(PreviewSection(
            title="Identité Titulaire 1",
            content=t1_content,
            is_complete=len(t1_missing) == 0,
            missing_fields=t1_missing
        ))

        # Section Titulaire 2 si présent
        if data.get('t2_nom'):
            t2_content = [
                f"{data.get('t2_civilite', '')} {data.get('t2_prenom', '')} {data['t2_nom']}"
            ]
            sections.append(PreviewSection(
                title="Identité Titulaire 2",
                content=t2_content
            ))

        # Section Situation familiale
        fam_content = []
        if data.get('situation_familiale'):
            fam_content.append(f"Situation: {data['situation_familiale']}")
        if data.get('regime_matrimonial'):
            fam_content.append(f"Régime: {data['regime_matrimonial']}")
        if data.get('nombre_enfants'):
            fam_content.append(f"Enfants: {data['nombre_enfants']} ({data.get('nombre_enfants_charge', 0)} à charge)")

        sections.append(PreviewSection(
            title="Situation Familiale",
            content=fam_content,
            is_complete=bool(data.get('situation_familiale'))
        ))

        # Section Situation financière
        fin_content = []
        if data.get('revenus_annuels_foyer'):
            fin_content.append(f"Revenus annuels: {data['revenus_annuels_foyer']}")
        if data.get('patrimoine_global'):
            fin_content.append(f"Patrimoine global: {data['patrimoine_global']}")
        if data.get('capacite_epargne_mensuelle'):
            fin_content.append(f"Capacité d'épargne: {data['capacite_epargne_mensuelle']}€/mois")

        sections.append(PreviewSection(
            title="Situation Financière",
            content=fin_content,
            is_complete=bool(data.get('revenus_annuels_foyer') and data.get('patrimoine_global'))
        ))

        # Section Profil de risque
        risk_content = []
        if data.get('objectifs_investissement'):
            risk_content.append(f"Objectifs: {data['objectifs_investissement']}")
        if data.get('horizon_placement'):
            risk_content.append(f"Horizon: {data['horizon_placement']}")
        if data.get('tolerance_risque'):
            risk_content.append(f"Tolérance: {data['tolerance_risque']}")
        if data.get('profil_risque_calcule'):
            risk_content.append(f"Profil calculé: {data['profil_risque_calcule']}")

        sections.append(PreviewSection(
            title="Profil d'Investisseur",
            content=risk_content,
            is_complete=bool(data.get('profil_risque_calcule'))
        ))

        # Section LCB-FT
        lcb_content = []
        lcb_content.append(f"Niveau de risque: {data.get('lcb_ft_niveau_risque', 'Non évalué')}")
        if data.get('lcb_ft_ppe'):
            lcb_content.append("⚠️ PPE identifié")
        if data.get('t1_us_person'):
            lcb_content.append("⚠️ US Person")

        sections.append(PreviewSection(
            title="Conformité LCB-FT",
            content=lcb_content
        ))

        return sections

    def _generate_qcc_sections(self, data: Dict[str, Any]) -> List[PreviewSection]:
        """Génère les sections pour le QCC"""
        sections = []

        # Section Client
        sections.append(PreviewSection(
            title="Client",
            content=[
                f"{data.get('t1_prenom', '')} {data.get('t1_nom', '')}",
                f"Numéro: {data.get('numero_client', 'Non attribué')}"
            ]
        ))

        # Section Expérience produits
        products = ['monetaires', 'obligations', 'actions', 'scpi', 'pe', 'etf', 'derives', 'structures']
        exp_content = []

        for product in products:
            detention = data.get(f'kyc_{product}_detention', False)
            if detention:
                duree = data.get(f'kyc_{product}_duree', 'N/A')
                exp_content.append(f"✓ {product.capitalize()}: {duree}")
            else:
                exp_content.append(f"✗ {product.capitalize()}: Aucune expérience")

        sections.append(PreviewSection(
            title="Expérience Produits Financiers",
            content=exp_content
        ))

        # Section Profil
        sections.append(PreviewSection(
            title="Profil Investisseur",
            content=[
                f"Profil calculé: {data.get('profil_risque_calcule', 'Non calculé')}",
                f"Score: {data.get('profil_risque_score', 'N/A')}/100"
            ]
        ))

        return sections

    def _generate_lettre_mission_sections(self, data: Dict[str, Any]) -> List[PreviewSection]:
        """Génère les sections pour les lettres de mission"""
        return [
            PreviewSection(
                title="Client",
                content=[
                    f"{data.get('t1_prenom', '')} {data.get('t1_nom', '')}",
                    f"Adresse: {data.get('t1_adresse', 'N/A')}"
                ]
            ),
            PreviewSection(
                title="Mission",
                content=[
                    f"Objectifs: {data.get('objectifs_investissement', 'N/A')}",
                    f"Horizon: {data.get('horizon_placement', 'N/A')}"
                ]
            )
        ]

    def _generate_rto_sections(self, data: Dict[str, Any]) -> List[PreviewSection]:
        """Génère les sections pour la Convention RTO"""
        return [
            PreviewSection(
                title="Parties",
                content=[
                    f"Client: {data.get('t1_prenom', '')} {data.get('t1_nom', '')}",
                    f"Conseiller: [Conseiller assigné]"
                ]
            ),
            PreviewSection(
                title="Objet de la convention",
                content=[
                    "Réception et transmission d'ordres pour le compte du client"
                ]
            )
        ]

    def _generate_adequation_sections(self, data: Dict[str, Any]) -> List[PreviewSection]:
        """Génère les sections pour la Déclaration d'adéquation"""
        return [
            PreviewSection(
                title="Client",
                content=[f"{data.get('t1_prenom', '')} {data.get('t1_nom', '')}"]
            ),
            PreviewSection(
                title="Profil",
                content=[
                    f"Profil: {data.get('profil_risque_calcule', 'N/A')}",
                    f"Objectifs: {data.get('objectifs_investissement', 'N/A')}",
                    f"Horizon: {data.get('horizon_placement', 'N/A')}"
                ]
            )
        ]

    def _generate_warnings(
        self,
        document_type: str,
        data: Dict[str, Any],
        missing_fields: List[str]
    ) -> List[str]:
        """
        Génère les avertissements pour le document

        Returns:
            Liste des avertissements
        """
        warnings = []

        # Champs manquants
        if missing_fields:
            warnings.append(f"{len(missing_fields)} champ(s) requis manquant(s)")

        # Warnings spécifiques
        if data.get('t1_us_person'):
            warnings.append("US Person: vérifications FATCA requises")

        if data.get('lcb_ft_ppe'):
            warnings.append("PPE: vigilance renforcée requise")

        if data.get('lcb_ft_niveau_risque') in ['Elevé', 'Renforcé']:
            warnings.append(f"Niveau LCB-FT: {data.get('lcb_ft_niveau_risque')}")

        if not data.get('profil_risque_calcule'):
            warnings.append("Profil de risque non calculé")

        return warnings

    def _estimate_pages(self, document_type: str, data: Dict[str, Any]) -> int:
        """
        Estime le nombre de pages du document final

        Returns:
            Nombre de pages estimé
        """
        base_pages = {
            "DER": 4,
            "QCC": 3,
            "LETTRE_MISSION_CIF": 2,
            "LETTRE_MISSION_IAS": 2,
            "CONVENTION_RTO": 3,
            "DECLARATION_ADEQUATION": 2
        }

        pages = base_pages.get(document_type, 2)

        # Ajuster selon les données
        if data.get('t2_nom'):
            pages += 1  # Titulaire 2

        if data.get('patrimoine_financier') and len(data.get('patrimoine_financier', [])) > 5:
            pages += 1  # Patrimoine détaillé

        return pages

    def _get_document_title(self, document_type: str) -> str:
        """Retourne le titre complet du document"""
        titles = {
            "DER": "Document d'Entrée en Relation",
            "QCC": "Questionnaire Connaissance Client",
            "LETTRE_MISSION_CIF": "Lettre de Mission CIF",
            "LETTRE_MISSION_IAS": "Lettre de Mission IAS",
            "CONVENTION_RTO": "Convention de Réception-Transmission d'Ordres",
            "DECLARATION_ADEQUATION": "Déclaration d'Adéquation"
        }
        return titles.get(document_type, document_type)

    def to_dict(self, preview: DocumentPreview) -> Dict[str, Any]:
        """
        Convertit le preview en dictionnaire pour JSON

        Args:
            preview: DocumentPreview à convertir

        Returns:
            Dictionnaire sérialisable
        """
        return {
            "document_type": preview.document_type,
            "title": preview.title,
            "client_name": preview.client_name,
            "generation_date": preview.generation_date,
            "estimated_pages": preview.estimated_pages,
            "completion_percentage": preview.completion_percentage,
            "is_valid": preview.is_valid,
            "warnings": preview.warnings,
            "sections": [
                {
                    "title": section.title,
                    "content": section.content,
                    "is_complete": section.is_complete,
                    "missing_fields": section.missing_fields
                }
                for section in preview.sections
            ]
        }


# Instance globale
_preview_service: Optional[DocumentPreviewService] = None


def get_preview_service() -> DocumentPreviewService:
    """Retourne l'instance du service de preview"""
    global _preview_service
    if _preview_service is None:
        _preview_service = DocumentPreviewService()
    return _preview_service
