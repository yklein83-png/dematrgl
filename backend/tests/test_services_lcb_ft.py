"""
Tests unitaires pour le service de classification LCB-FT
Lutte contre le blanchiment et financement du terrorisme
"""

import pytest
from unittest.mock import MagicMock

from app.services.lcb_ft_classifier import classify_lcb_ft_level


class TestLcbFtClassifier:
    """Tests du classificateur LCB-FT"""

    # ==========================================
    # TESTS NIVEAU FAIBLE (0 facteurs)
    # ==========================================

    @pytest.mark.unit
    def test_niveau_faible_client_standard(self, mock_client_minimal):
        """Test qu'un client sans facteur de risque = Faible"""
        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Faible"

    @pytest.mark.unit
    def test_niveau_faible_resident_france(self, mock_client_minimal):
        """Test résident France sans autre facteur = Faible"""
        mock_client_minimal.t1_residence_fiscale = "France"
        mock_client_minimal.lcb_ft_ppe = False
        mock_client_minimal.t1_us_person = False

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Faible"

    # ==========================================
    # TESTS NIVEAU STANDARD (1-2 facteurs)
    # ==========================================

    @pytest.mark.unit
    def test_niveau_standard_residence_hors_france(self, mock_client_standard_lcb):
        """Test résidence hors France = Standard"""
        result = classify_lcb_ft_level(mock_client_standard_lcb)

        assert result == "Standard"

    @pytest.mark.unit
    def test_niveau_standard_cession_entreprise(self, mock_client_minimal):
        """Test origine fonds cession = Standard"""
        mock_client_minimal.origine_economique_cession_pro = True

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Standard"

    @pytest.mark.unit
    def test_niveau_standard_montant_moyen(self, mock_client_minimal):
        """Test montant 500k-1M = Standard"""
        mock_client_minimal.origine_fonds_montant_prevu = "750000"

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Standard"

    @pytest.mark.unit
    def test_niveau_standard_autres_non_justifies(self, mock_client_minimal):
        """Test origine autres sans justificatif = Standard"""
        mock_client_minimal.origine_economique_autres = True
        mock_client_minimal.lcb_ft_justificatifs = False

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Standard"

    # ==========================================
    # TESTS NIVEAU RENFORCÉ (3-4 facteurs)
    # ==========================================

    @pytest.mark.unit
    def test_niveau_renforce_ppe(self, mock_client_minimal):
        """Test PPE seul = Renforcé (3 facteurs)"""
        mock_client_minimal.lcb_ft_ppe = True

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Renforcé"

    @pytest.mark.unit
    def test_niveau_renforce_ppe_famille(self, mock_client_minimal):
        """Test PPE famille = Renforcé"""
        mock_client_minimal.lcb_ft_ppe_famille = True

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Renforcé"

    @pytest.mark.unit
    def test_niveau_renforce_us_person_plus_facteurs(self, mock_client_minimal):
        """Test US Person + autres facteurs = Renforcé"""
        mock_client_minimal.t1_us_person = True  # +2
        mock_client_minimal.origine_economique_cession_pro = True  # +1

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Renforcé"

    @pytest.mark.unit
    def test_niveau_renforce_gains_jeu_plus(self, mock_client_minimal):
        """Test gains de jeu + autre facteur = Renforcé"""
        mock_client_minimal.origine_economique_gains_jeu = True  # +2
        mock_client_minimal.t1_residence_fiscale = "Autre"  # +1

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Renforcé"

    # ==========================================
    # TESTS NIVEAU ÉLEVÉ (5+ facteurs)
    # ==========================================

    @pytest.mark.unit
    def test_niveau_eleve_ppe(self, mock_client_ppe):
        """Test PPE + US Person = Élevé"""
        result = classify_lcb_ft_level(mock_client_ppe)

        assert result == "Élevé"

    @pytest.mark.unit
    def test_niveau_eleve_pays_risque(self, mock_client_minimal):
        """Test pays à risque = Élevé"""
        mock_client_minimal.t1_residence_fiscale = "Autre"
        mock_client_minimal.t1_residence_fiscale_autre = "Iran"  # +3
        mock_client_minimal.t1_us_person = True  # +2

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Élevé"

    @pytest.mark.unit
    def test_niveau_eleve_coree_nord(self, mock_client_minimal):
        """Test Corée du Nord = Élevé"""
        mock_client_minimal.t1_residence_fiscale_autre = "Corée du Nord"
        mock_client_minimal.lcb_ft_ppe = True  # +3

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Élevé"

    @pytest.mark.unit
    def test_niveau_eleve_cumul_facteurs(self, mock_client_minimal):
        """Test cumul de plusieurs facteurs = Élevé"""
        mock_client_minimal.lcb_ft_ppe = True  # +3
        mock_client_minimal.origine_economique_gains_jeu = True  # +2

        result = classify_lcb_ft_level(mock_client_minimal)

        # Total: 5 = Élevé
        assert result == "Élevé"

    @pytest.mark.unit
    def test_niveau_eleve_profession_trader(self, mock_client_minimal):
        """Test profession trader + PPE = Élevé"""
        mock_client_minimal.t1_profession = "Trader crypto"  # +2
        mock_client_minimal.lcb_ft_ppe = True  # +3

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Élevé"

    # ==========================================
    # TESTS FACTEUR PPE (3 points)
    # ==========================================

    @pytest.mark.unit
    def test_ppe_direct(self, mock_client_minimal):
        """Test PPE direct = +3 facteurs"""
        mock_client_minimal.lcb_ft_ppe = True

        result = classify_lcb_ft_level(mock_client_minimal)

        # PPE seul = 3 facteurs = Renforcé
        assert result == "Renforcé"

    @pytest.mark.unit
    def test_ppe_famille(self, mock_client_minimal):
        """Test PPE famille = +3 facteurs"""
        mock_client_minimal.lcb_ft_ppe_famille = True

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Renforcé"

    @pytest.mark.unit
    def test_ppe_les_deux(self, mock_client_minimal):
        """Test PPE + PPE famille = toujours 3 (pas cumulé)"""
        mock_client_minimal.lcb_ft_ppe = True
        mock_client_minimal.lcb_ft_ppe_famille = True

        result = classify_lcb_ft_level(mock_client_minimal)

        # Les deux PPE donnent 3 au total (if/or)
        assert result == "Renforcé"

    # ==========================================
    # TESTS FACTEUR US PERSON (2 points)
    # ==========================================

    @pytest.mark.unit
    def test_us_person_t1(self, mock_client_minimal):
        """Test US Person titulaire 1 = +2 facteurs"""
        mock_client_minimal.t1_us_person = True

        result = classify_lcb_ft_level(mock_client_minimal)

        # US Person = 2 facteurs = Standard
        assert result == "Standard"

    @pytest.mark.unit
    def test_us_person_t2(self, mock_client_minimal):
        """Test US Person titulaire 2 = +2 facteurs"""
        mock_client_minimal.t2_us_person = True

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Standard"

    @pytest.mark.unit
    def test_us_person_deux_titulaires(self, mock_client_minimal):
        """Test les deux US Person = toujours 2"""
        mock_client_minimal.t1_us_person = True
        mock_client_minimal.t2_us_person = True

        result = classify_lcb_ft_level(mock_client_minimal)

        # L'implémentation actuelle donne 2 (or)
        assert result == "Standard"

    # ==========================================
    # TESTS FACTEUR RÉSIDENCE FISCALE (1-4 points)
    # ==========================================

    @pytest.mark.unit
    def test_residence_france(self, mock_client_minimal):
        """Test résidence France = 0 facteur"""
        mock_client_minimal.t1_residence_fiscale = "France"

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Faible"

    @pytest.mark.unit
    def test_residence_hors_france(self, mock_client_minimal):
        """Test résidence hors France = +1 facteur"""
        mock_client_minimal.t1_residence_fiscale = "Belgique"

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Standard"

    @pytest.mark.unit
    @pytest.mark.parametrize("pays", ["Iran", "Corée du Nord", "Myanmar"])
    def test_pays_haut_risque(self, mock_client_minimal, pays):
        """Test pays à haut risque = +3 facteurs"""
        mock_client_minimal.t1_residence_fiscale_autre = pays

        result = classify_lcb_ft_level(mock_client_minimal)

        # 3 facteurs = Renforcé
        assert result == "Renforcé"

    # ==========================================
    # TESTS FACTEUR ORIGINE DES FONDS
    # ==========================================

    @pytest.mark.unit
    def test_origine_gains_jeu(self, mock_client_minimal):
        """Test gains de jeu = +2 facteurs"""
        mock_client_minimal.origine_economique_gains_jeu = True

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Standard"

    @pytest.mark.unit
    def test_origine_cession_pro(self, mock_client_minimal):
        """Test cession entreprise = +1 facteur"""
        mock_client_minimal.origine_economique_cession_pro = True

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Standard"

    @pytest.mark.unit
    def test_origine_autres_avec_justificatif(self, mock_client_minimal):
        """Test autres avec justificatif = 0 facteur"""
        mock_client_minimal.origine_economique_autres = True
        mock_client_minimal.lcb_ft_justificatifs = True

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Faible"

    @pytest.mark.unit
    def test_origine_autres_sans_justificatif(self, mock_client_minimal):
        """Test autres sans justificatif = +1 facteur"""
        mock_client_minimal.origine_economique_autres = True
        mock_client_minimal.lcb_ft_justificatifs = False

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Standard"

    # ==========================================
    # TESTS FACTEUR MONTANTS
    # ==========================================

    @pytest.mark.unit
    def test_montant_superieur_1m(self, mock_client_minimal):
        """Test montant > 1M = +2 facteurs"""
        mock_client_minimal.origine_fonds_montant_prevu = "1500000"

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Standard"

    @pytest.mark.unit
    def test_montant_500k_1m(self, mock_client_minimal):
        """Test montant 500k-1M = +1 facteur"""
        mock_client_minimal.origine_fonds_montant_prevu = "750000"

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Standard"

    @pytest.mark.unit
    def test_montant_sous_500k(self, mock_client_minimal):
        """Test montant < 500k = 0 facteur"""
        mock_client_minimal.origine_fonds_montant_prevu = "300000"

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Faible"

    @pytest.mark.unit
    def test_montant_invalide(self, mock_client_minimal):
        """Test montant invalide = géré sans erreur"""
        mock_client_minimal.origine_fonds_montant_prevu = "non_numerique"

        # Ne doit pas lever d'exception
        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Faible"

    @pytest.mark.unit
    def test_patrimoine_tres_eleve(self, mock_client_minimal):
        """Test patrimoine > 5M = +1 facteur"""
        mock_client_minimal.patrimoine_global = "Plus de 5000000 XPF"

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Standard"

    # ==========================================
    # TESTS FACTEUR PROFESSION
    # ==========================================

    @pytest.mark.unit
    @pytest.mark.parametrize("profession", [
        "Trader",
        "Cambiste",
        "Expert crypto",
        "Bitcoin trader",
        "Casino manager",
        "Jeux en ligne",
        "Paris sportifs"
    ])
    def test_professions_risque(self, mock_client_minimal, profession):
        """Test professions à risque = +2 facteurs"""
        mock_client_minimal.t1_profession = profession

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Standard"

    @pytest.mark.unit
    def test_profession_standard(self, mock_client_minimal):
        """Test profession standard = 0 facteur"""
        mock_client_minimal.t1_profession = "Ingénieur"

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Faible"

    # ==========================================
    # TESTS FACTEUR STRUCTURE COMPLEXE
    # ==========================================

    @pytest.mark.unit
    def test_holding(self, mock_client_minimal):
        """Test holding = +1 facteur"""
        mock_client_minimal.t1_chef_entreprise = True
        mock_client_minimal.t1_entreprise_forme_juridique = "Holding SAS"

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Standard"

    @pytest.mark.unit
    def test_entreprise_standard(self, mock_client_minimal):
        """Test entreprise standard = 0 facteur"""
        mock_client_minimal.t1_chef_entreprise = True
        mock_client_minimal.t1_entreprise_forme_juridique = "SARL"

        result = classify_lcb_ft_level(mock_client_minimal)

        assert result == "Faible"

    # ==========================================
    # TESTS VALEURS DE RETOUR
    # ==========================================

    @pytest.mark.unit
    def test_retour_type_literal(self, mock_client_minimal):
        """Test que le retour est une des 4 valeurs possibles"""
        result = classify_lcb_ft_level(mock_client_minimal)

        assert result in ["Faible", "Standard", "Renforcé", "Élevé"]

    @pytest.mark.unit
    def test_tous_niveaux_possibles(self, mock_client_minimal):
        """Test qu'on peut atteindre tous les niveaux"""
        # Faible
        result = classify_lcb_ft_level(mock_client_minimal)
        assert result == "Faible"

        # Standard
        mock_client_minimal.t1_residence_fiscale = "Autre"
        result = classify_lcb_ft_level(mock_client_minimal)
        assert result == "Standard"

        # Renforcé
        mock_client_minimal.lcb_ft_ppe = True
        result = classify_lcb_ft_level(mock_client_minimal)
        assert result == "Renforcé"

        # Élevé
        mock_client_minimal.t1_us_person = True
        result = classify_lcb_ft_level(mock_client_minimal)
        assert result == "Élevé"
