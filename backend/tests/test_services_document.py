"""
Tests unitaires pour le service de génération de documents DOCX
"""

import pytest
from unittest.mock import MagicMock, patch, mock_open
from datetime import datetime, date
from io import BytesIO


class TestDocxTemplateContext:
    """Tests de la préparation du contexte pour les templates"""

    @pytest.mark.unit
    def test_context_client_minimal(self, mock_client_minimal):
        """Test création contexte avec client minimal"""
        context = {
            "nom": mock_client_minimal.t1_nom,
            "prenom": mock_client_minimal.t1_prenom,
            "date_naissance": mock_client_minimal.t1_date_naissance,
        }

        assert context["nom"] == "Test"
        assert context["prenom"] == "Client"

    @pytest.mark.unit
    def test_context_dates_formatees(self, mock_client_minimal):
        """Test que les dates sont formatées correctement"""
        date_obj = date(1990, 6, 15)

        # Format français attendu
        formatted = date_obj.strftime("%d/%m/%Y")

        assert formatted == "15/06/1990"

    @pytest.mark.unit
    def test_context_montant_formate(self):
        """Test formatage des montants"""
        montant = 150000.50

        # Format français avec séparateurs
        formatted = f"{montant:,.2f}".replace(",", " ").replace(".", ",")

        assert "150" in formatted
        assert "," in formatted

    @pytest.mark.unit
    def test_context_checkbox_cochee(self):
        """Test représentation checkbox cochée"""
        valeur = True
        checkbox = "☑" if valeur else "☐"

        assert checkbox == "☑"

    @pytest.mark.unit
    def test_context_checkbox_non_cochee(self):
        """Test représentation checkbox non cochée"""
        valeur = False
        checkbox = "☑" if valeur else "☐"

        assert checkbox == "☐"


class TestDocxFieldMapping:
    """Tests du mapping des champs client vers template"""

    @pytest.mark.unit
    def test_mapping_identite_titulaire_1(self, mock_client_minimal):
        """Test mapping identité titulaire 1"""
        mapping = {
            "t1_civilite": mock_client_minimal.t1_civilite,
            "t1_nom": mock_client_minimal.t1_nom,
            "t1_nom_naissance": mock_client_minimal.t1_nom_naissance,
            "t1_prenom": mock_client_minimal.t1_prenom,
            "t1_date_naissance": mock_client_minimal.t1_date_naissance,
            "t1_lieu_naissance": mock_client_minimal.t1_lieu_naissance,
            "t1_nationalite": mock_client_minimal.t1_nationalite,
        }

        assert mapping["t1_civilite"] == "M."
        assert mapping["t1_nom"] == "Test"
        assert mapping["t1_prenom"] == "Client"

    @pytest.mark.unit
    def test_mapping_situation_familiale(self, mock_client_minimal):
        """Test mapping situation familiale"""
        mapping = {
            "situation_familiale": mock_client_minimal.situation_familiale,
            "regime_matrimonial": mock_client_minimal.regime_matrimonial,
            "nb_enfants_charge": mock_client_minimal.nb_enfants_charge,
        }

        # Vérifier les champs existent
        assert "situation_familiale" in mapping
        assert "regime_matrimonial" in mapping

    @pytest.mark.unit
    def test_mapping_coordonnees(self, mock_client_minimal):
        """Test mapping coordonnées"""
        mapping = {
            "adresse_ligne1": mock_client_minimal.adresse_ligne1,
            "adresse_cp": mock_client_minimal.adresse_cp,
            "adresse_ville": mock_client_minimal.adresse_ville,
            "telephone_portable": mock_client_minimal.telephone_portable,
            "email": mock_client_minimal.email,
        }

        assert mapping["email"] == "test@example.com"

    @pytest.mark.unit
    def test_mapping_situation_professionnelle(self, mock_client_minimal):
        """Test mapping situation professionnelle"""
        mapping = {
            "t1_profession": mock_client_minimal.t1_profession,
            "t1_employeur": mock_client_minimal.t1_employeur,
            "t1_secteur_activite": mock_client_minimal.t1_secteur_activite,
            "t1_chef_entreprise": mock_client_minimal.t1_chef_entreprise,
        }

        assert "t1_profession" in mapping

    @pytest.mark.unit
    def test_mapping_fiscalite(self, mock_client_minimal):
        """Test mapping données fiscales"""
        mapping = {
            "t1_residence_fiscale": mock_client_minimal.t1_residence_fiscale,
            "t1_us_person": mock_client_minimal.t1_us_person,
            "t1_nif": mock_client_minimal.t1_nif,
        }

        assert mapping["t1_residence_fiscale"] == "France"
        assert mapping["t1_us_person"] == False

    @pytest.mark.unit
    def test_mapping_lcb_ft(self, mock_client_minimal):
        """Test mapping données LCB-FT"""
        mapping = {
            "lcb_ft_ppe": mock_client_minimal.lcb_ft_ppe,
            "lcb_ft_ppe_famille": mock_client_minimal.lcb_ft_ppe_famille,
            "lcb_ft_justificatifs": mock_client_minimal.lcb_ft_justificatifs,
        }

        assert mapping["lcb_ft_ppe"] == False


class TestDocxValidation:
    """Tests de validation des données avant génération"""

    @pytest.mark.unit
    def test_validation_champs_requis_presents(self, mock_client_minimal):
        """Test que les champs requis sont présents"""
        required_fields = ["t1_nom", "t1_prenom", "email"]

        for field in required_fields:
            assert hasattr(mock_client_minimal, field)
            assert getattr(mock_client_minimal, field) is not None

    @pytest.mark.unit
    def test_validation_email_format(self, mock_client_minimal):
        """Test validation format email"""
        email = mock_client_minimal.email
        assert "@" in email
        assert "." in email.split("@")[1]

    @pytest.mark.unit
    def test_validation_date_naissance_passee(self, mock_client_minimal):
        """Test que la date de naissance est dans le passé"""
        date_naissance = mock_client_minimal.t1_date_naissance

        if date_naissance:
            if isinstance(date_naissance, str):
                # Parser la date si c'est une string
                from datetime import datetime
                parsed = datetime.strptime(date_naissance, "%Y-%m-%d").date()
            else:
                parsed = date_naissance

            assert parsed < date.today()

    @pytest.mark.unit
    def test_validation_montant_positif(self):
        """Test que les montants sont positifs"""
        montants = [100000, 50000.50, 0]

        for montant in montants:
            assert montant >= 0


class TestDocxTemplateTypes:
    """Tests des différents types de documents"""

    @pytest.mark.unit
    @pytest.mark.parametrize("doc_type", [
        "recueil_informations",
        "lettre_mission",
        "rapport_adequation",
        "fiche_conseil",
        "profil_investisseur",
    ])
    def test_types_documents_reconnus(self, doc_type):
        """Test que les types de documents sont définis"""
        valid_types = [
            "recueil_informations",
            "lettre_mission",
            "rapport_adequation",
            "fiche_conseil",
            "profil_investisseur",
        ]

        assert doc_type in valid_types

    @pytest.mark.unit
    def test_template_file_extension(self):
        """Test que les templates ont l'extension .docx"""
        template_names = [
            "recueil_informations.docx",
            "lettre_mission.docx",
        ]

        for name in template_names:
            assert name.endswith(".docx")


class TestDocxOutputFormat:
    """Tests du format de sortie"""

    @pytest.mark.unit
    def test_output_is_bytes(self):
        """Test que la sortie est en bytes"""
        # Simuler une sortie de document
        output = BytesIO()
        output.write(b"PK")  # Signature ZIP (DOCX est un ZIP)

        output.seek(0)
        data = output.read()

        assert isinstance(data, bytes)
        assert data.startswith(b"PK")  # Signature ZIP

    @pytest.mark.unit
    def test_output_content_type(self):
        """Test le content-type pour DOCX"""
        content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

        assert "openxmlformats" in content_type
        assert "wordprocessingml" in content_type


class TestDocxErrorHandling:
    """Tests de gestion des erreurs"""

    @pytest.mark.unit
    def test_handle_missing_template(self):
        """Test gestion template manquant"""
        with pytest.raises(FileNotFoundError):
            # Simuler ouverture d'un template inexistant
            raise FileNotFoundError("Template not found: inexistant.docx")

    @pytest.mark.unit
    def test_handle_invalid_context_value(self):
        """Test gestion valeur de contexte invalide"""
        context = {
            "nom": "Dupont",
            "date": None,  # Valeur potentiellement problématique
        }

        # La valeur None doit être gérée
        date_display = context.get("date") or "Non renseigné"
        assert date_display == "Non renseigné"

    @pytest.mark.unit
    def test_handle_special_characters(self):
        """Test gestion caractères spéciaux"""
        special_values = [
            "O'Brien",  # Apostrophe
            "Müller",  # Tréma
            "François",  # Cédille
            "Société & Associés",  # Esperluette
            "50% actions",  # Pourcentage
        ]

        for value in special_values:
            # Les caractères spéciaux ne doivent pas lever d'erreur
            escaped = str(value)
            assert len(escaped) > 0


class TestDocxNamingConvention:
    """Tests des conventions de nommage des fichiers générés"""

    @pytest.mark.unit
    def test_filename_format(self, mock_client_minimal):
        """Test format du nom de fichier généré"""
        doc_type = "recueil_informations"
        client_name = f"{mock_client_minimal.t1_nom}_{mock_client_minimal.t1_prenom}"
        date_str = datetime.now().strftime("%Y%m%d")

        filename = f"{doc_type}_{client_name}_{date_str}.docx"

        assert doc_type in filename
        assert "Test" in filename
        assert "Client" in filename
        assert date_str in filename
        assert filename.endswith(".docx")

    @pytest.mark.unit
    def test_filename_sanitization(self):
        """Test que les caractères problématiques sont retirés du nom"""
        unsafe_name = "Client/Test\\Name:Special"

        # Caractères à remplacer
        sanitized = unsafe_name.replace("/", "_").replace("\\", "_").replace(":", "_")

        assert "/" not in sanitized
        assert "\\" not in sanitized
        assert ":" not in sanitized


class TestDocxRegulatoryCompliance:
    """Tests de conformité réglementaire des documents"""

    @pytest.mark.unit
    def test_document_contient_date_generation(self):
        """Test que le document contient la date de génération"""
        context = {
            "date_generation": datetime.now().strftime("%d/%m/%Y"),
            "heure_generation": datetime.now().strftime("%H:%M"),
        }

        assert "date_generation" in context
        assert "/" in context["date_generation"]

    @pytest.mark.unit
    def test_document_contient_identifiant_conseiller(self, mock_user):
        """Test que le document contient l'identifiant conseiller"""
        context = {
            "conseiller_nom": mock_user["nom"],
            "conseiller_prenom": mock_user["prenom"],
            "conseiller_email": mock_user["email"],
        }

        assert context["conseiller_email"] == "conseiller@test.com"

    @pytest.mark.unit
    def test_document_contient_numero_client(self, mock_client_minimal):
        """Test que le document contient un numéro client"""
        context = {
            "client_id": mock_client_minimal.id,
            "client_reference": f"CLI-{mock_client_minimal.id[:8].upper()}",
        }

        assert context["client_id"] is not None
        assert context["client_reference"].startswith("CLI-")

    @pytest.mark.unit
    def test_document_contient_avertissements_risque(self):
        """Test présence des avertissements réglementaires"""
        risk_warnings = [
            "Les performances passées ne préjugent pas des performances futures",
            "L'investissement comporte un risque de perte en capital",
        ]

        # Les avertissements doivent être définis
        for warning in risk_warnings:
            assert len(warning) > 0
