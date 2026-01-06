"""
Gestionnaire de templates DOCX avec versionnement

Ce module gère:
- Le versionnement des templates
- La sélection automatique de la dernière version
- La validation des templates
- Le registre des templates disponibles
"""

import os
import re
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum

from app.core.logging import get_logger

logger = get_logger(__name__)


class DocumentType(str, Enum):
    """Types de documents réglementaires"""
    DER = "DER"  # Document d'Entrée en Relation
    QCC = "QCC"  # Questionnaire Connaissance Client
    LETTRE_MISSION_CIF = "LETTRE_MISSION_CIF"
    LETTRE_MISSION_IAS = "LETTRE_MISSION_IAS"
    CONVENTION_RTO = "CONVENTION_RTO"
    DECLARATION_ADEQUATION = "DECLARATION_ADEQUATION"
    PROFIL_RISQUE = "PROFIL_RISQUE"
    RAPPORT_CONSEIL = "RAPPORT_CONSEIL"


@dataclass
class TemplateInfo:
    """Information sur un template"""
    document_type: DocumentType
    version: str
    file_path: Path
    file_name: str
    file_size: int
    checksum: str
    modified_date: datetime
    is_active: bool = True
    description: str = ""


@dataclass
class TemplateRegistry:
    """Registre des templates disponibles"""
    templates: Dict[DocumentType, List[TemplateInfo]] = field(default_factory=dict)
    templates_dir: Path = None
    last_scan: Optional[datetime] = None


class TemplateManager:
    """
    Gestionnaire de templates DOCX

    Fonctionnalités:
    - Scan automatique des templates
    - Versionnement sémantique (v1, v2, v3...)
    - Sélection de la version active
    - Validation de l'intégrité
    """

    # Pattern pour extraire la version du nom de fichier
    VERSION_PATTERN = re.compile(r'_V(\d+)_', re.IGNORECASE)

    # Pattern pour les suffixes à ignorer
    IGNORE_SUFFIXES = ['_BACKUP', '_OLD', '_TEST', '_DRAFT', '_TEMP']

    def __init__(self, templates_dir: str = None):
        """
        Initialise le gestionnaire

        Args:
            templates_dir: Chemin vers le dossier des templates
        """
        if templates_dir is None:
            templates_dir = os.environ.get(
                'TEMPLATES_PATH',
                str(Path(__file__).parent.parent.parent / 'templates')
            )

        self.templates_dir = Path(templates_dir)
        self.registry = TemplateRegistry(templates_dir=self.templates_dir)

        logger.info(f"TemplateManager initialisé: {self.templates_dir}")

    def scan_templates(self) -> TemplateRegistry:
        """
        Scanne le dossier templates et construit le registre

        Returns:
            Registre des templates trouvés
        """
        self.registry.templates.clear()

        if not self.templates_dir.exists():
            logger.error(f"Dossier templates introuvable: {self.templates_dir}")
            return self.registry

        # Scanner récursivement
        docx_files = list(self.templates_dir.rglob("*.docx"))
        logger.info(f"Scan: {len(docx_files)} fichiers .docx trouvés")

        for file_path in docx_files:
            template_info = self._parse_template(file_path)
            if template_info:
                if template_info.document_type not in self.registry.templates:
                    self.registry.templates[template_info.document_type] = []
                self.registry.templates[template_info.document_type].append(template_info)

        # Trier par version et déterminer les templates actifs
        self._sort_and_activate()

        self.registry.last_scan = datetime.utcnow()

        # Log le résumé
        for doc_type, templates in self.registry.templates.items():
            active = next((t for t in templates if t.is_active), None)
            logger.info(
                f"  {doc_type.value}: {len(templates)} version(s), "
                f"active: {active.version if active else 'aucune'}"
            )

        return self.registry

    def _parse_template(self, file_path: Path) -> Optional[TemplateInfo]:
        """
        Parse un fichier template et extrait ses informations

        Args:
            file_path: Chemin du fichier

        Returns:
            TemplateInfo ou None si ignoré
        """
        file_name = file_path.name.upper()

        # Ignorer les fichiers avec suffixes de backup
        for suffix in self.IGNORE_SUFFIXES:
            if suffix in file_name:
                logger.debug(f"Ignoré (suffixe {suffix}): {file_path.name}")
                return None

        # Ignorer les fichiers temporaires Office
        if file_name.startswith('~$'):
            return None

        # Déterminer le type de document
        doc_type = self._detect_document_type(file_name)
        if not doc_type:
            logger.warning(f"Type de document non reconnu: {file_path.name}")
            return None

        # Extraire la version
        version = self._extract_version(file_name)

        # Calculer le checksum
        checksum = self._compute_checksum(file_path)

        # Obtenir les métadonnées
        stat = file_path.stat()

        return TemplateInfo(
            document_type=doc_type,
            version=version,
            file_path=file_path,
            file_name=file_path.name,
            file_size=stat.st_size,
            checksum=checksum,
            modified_date=datetime.fromtimestamp(stat.st_mtime),
            is_active=False  # Sera déterminé après tri
        )

    def _detect_document_type(self, file_name: str) -> Optional[DocumentType]:
        """
        Détecte le type de document à partir du nom de fichier

        Args:
            file_name: Nom du fichier en majuscules

        Returns:
            DocumentType ou None
        """
        # Mapping explicite basé sur les noms courants
        type_patterns = {
            DocumentType.DER: ['DER_', 'DER_TEMPLATE', 'ENTREE_RELATION'],
            DocumentType.QCC: ['QCC_', 'QCC_TEMPLATE', 'CONNAISSANCE_CLIENT'],
            DocumentType.LETTRE_MISSION_CIF: ['LETTRE_MISSION_CIF', 'MISSION_CIF'],
            DocumentType.LETTRE_MISSION_IAS: ['LETTRE_MISSION_IAS', 'MISSION_IAS'],
            DocumentType.CONVENTION_RTO: ['CONVENTION_RTO', 'RTO_'],
            DocumentType.DECLARATION_ADEQUATION: ['DECLARATION_ADEQUATION', 'ADEQUATION'],
            DocumentType.PROFIL_RISQUE: ['PROFIL_RISQUE'],
            DocumentType.RAPPORT_CONSEIL: ['RAPPORT_CONSEIL'],
        }

        for doc_type, patterns in type_patterns.items():
            for pattern in patterns:
                if pattern in file_name:
                    return doc_type

        return None

    def _extract_version(self, file_name: str) -> str:
        """
        Extrait la version du nom de fichier

        Args:
            file_name: Nom du fichier

        Returns:
            Version (ex: "1.0", "2.0", "3.0")
        """
        match = self.VERSION_PATTERN.search(file_name)
        if match:
            return f"{match.group(1)}.0"

        # Version par défaut si non trouvée
        return "1.0"

    def _compute_checksum(self, file_path: Path) -> str:
        """
        Calcule le checksum MD5 d'un fichier

        Args:
            file_path: Chemin du fichier

        Returns:
            Hash MD5 en hexadécimal
        """
        try:
            hash_md5 = hashlib.md5()
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_md5.update(chunk)
            return hash_md5.hexdigest()
        except Exception as e:
            logger.error(f"Erreur checksum {file_path}: {e}")
            return ""

    def _sort_and_activate(self):
        """
        Trie les templates par version et active la plus récente
        """
        for doc_type, templates in self.registry.templates.items():
            # Trier par version décroissante
            templates.sort(
                key=lambda t: tuple(map(int, t.version.split('.'))),
                reverse=True
            )

            # Activer le premier (version la plus haute)
            for i, template in enumerate(templates):
                template.is_active = (i == 0)

    def get_template(
        self,
        document_type: DocumentType,
        version: str = None
    ) -> Optional[TemplateInfo]:
        """
        Récupère un template par type et version

        Args:
            document_type: Type de document
            version: Version spécifique ou None pour la dernière

        Returns:
            TemplateInfo ou None si non trouvé
        """
        if document_type not in self.registry.templates:
            logger.warning(f"Aucun template pour {document_type.value}")
            return None

        templates = self.registry.templates[document_type]

        if version:
            # Version spécifique demandée
            for template in templates:
                if template.version == version:
                    return template
            logger.warning(f"Version {version} non trouvée pour {document_type.value}")
            return None

        # Retourner le template actif (version la plus récente)
        active = next((t for t in templates if t.is_active), None)
        return active

    def get_template_path(
        self,
        document_type: DocumentType,
        version: str = None
    ) -> Optional[Path]:
        """
        Raccourci pour obtenir le chemin d'un template

        Args:
            document_type: Type de document
            version: Version spécifique ou None pour la dernière

        Returns:
            Chemin du fichier ou None
        """
        template = self.get_template(document_type, version)
        return template.file_path if template else None

    def list_templates(self) -> Dict[str, List[dict]]:
        """
        Liste tous les templates disponibles

        Returns:
            Dict avec les templates groupés par type
        """
        result = {}

        for doc_type, templates in self.registry.templates.items():
            result[doc_type.value] = [
                {
                    "version": t.version,
                    "file_name": t.file_name,
                    "is_active": t.is_active,
                    "file_size": t.file_size,
                    "modified_date": t.modified_date.isoformat(),
                    "checksum": t.checksum[:8] + "..."
                }
                for t in templates
            ]

        return result

    def validate_template(self, template: TemplateInfo) -> Tuple[bool, List[str]]:
        """
        Valide l'intégrité d'un template

        Args:
            template: Template à valider

        Returns:
            (valide, liste_erreurs)
        """
        errors = []

        # Vérifier que le fichier existe
        if not template.file_path.exists():
            errors.append(f"Fichier introuvable: {template.file_path}")
            return False, errors

        # Vérifier le checksum
        current_checksum = self._compute_checksum(template.file_path)
        if current_checksum != template.checksum:
            errors.append("Checksum modifié depuis le dernier scan")

        # Vérifier la taille
        current_size = template.file_path.stat().st_size
        if current_size < 1000:  # Moins de 1KB = probablement corrompu
            errors.append(f"Fichier trop petit ({current_size} bytes)")

        # Essayer d'ouvrir le fichier DOCX
        try:
            from docx import Document
            doc = Document(str(template.file_path))
            # Vérifier qu'il y a du contenu
            if len(doc.paragraphs) == 0:
                errors.append("Document vide (aucun paragraphe)")
        except Exception as e:
            errors.append(f"Erreur ouverture DOCX: {e}")

        return len(errors) == 0, errors

    def get_stats(self) -> dict:
        """
        Retourne les statistiques des templates

        Returns:
            Dictionnaire de statistiques
        """
        total_templates = sum(len(t) for t in self.registry.templates.values())
        active_templates = sum(
            1 for templates in self.registry.templates.values()
            for t in templates if t.is_active
        )

        return {
            "templates_dir": str(self.templates_dir),
            "total_templates": total_templates,
            "active_templates": active_templates,
            "document_types": len(self.registry.templates),
            "last_scan": self.registry.last_scan.isoformat() if self.registry.last_scan else None,
            "by_type": {
                doc_type.value: len(templates)
                for doc_type, templates in self.registry.templates.items()
            }
        }


# ==========================================
# INSTANCE GLOBALE
# ==========================================

_template_manager: Optional[TemplateManager] = None


def get_template_manager() -> TemplateManager:
    """
    Retourne l'instance globale du TemplateManager

    Returns:
        TemplateManager configuré
    """
    global _template_manager

    if _template_manager is None:
        _template_manager = TemplateManager()
        _template_manager.scan_templates()

    return _template_manager


def rescan_templates() -> TemplateRegistry:
    """
    Force un re-scan des templates

    Returns:
        Nouveau registre
    """
    manager = get_template_manager()
    return manager.scan_templates()
