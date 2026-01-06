"""
Tests unitaires pour le service de calcul de profil de risque
"""

import pytest
from unittest.mock import MagicMock

from app.services.risk_calculator import calculate_risk_profile


class TestRiskCalculator:
    """Tests du calculateur de profil de risque"""

    # ==========================================
    # TESTS PROFIL DYNAMIQUE (75-100 points)
    # ==========================================

    @pytest.mark.unit
    def test_profil_dynamique_score_maximum(self, mock_client_dynamique):
        """Test qu'un client avec tous les critères max obtient Dynamique"""
        result = calculate_risk_profile(mock_client_dynamique)

        assert result["profil"] == "Dynamique"
        assert result["score"] >= 75
        assert result["max_score"] == 100

    @pytest.mark.unit
    def test_profil_dynamique_horizon_8_ans(self, mock_client_minimal):
        """Test que l'horizon 8 ans donne 25 points"""
        mock_client_minimal.horizon_placement = "Plus de 8 ans"
        mock_client_minimal.tolerance_risque = "Très élevé - Agressif"
        mock_client_minimal.pertes_maximales_acceptables = "100%"
        mock_client_minimal.patrimoine_global = "Plus de 5000000"

        result = calculate_risk_profile(mock_client_minimal)

        assert result["score"] >= 75
        assert result["profil"] == "Dynamique"

    # ==========================================
    # TESTS PROFIL ÉQUILIBRÉ (50-74 points)
    # ==========================================

    @pytest.mark.unit
    def test_profil_equilibre_score_moyen(self, mock_client_minimal):
        """Test qu'un client avec critères moyens obtient Équilibré"""
        mock_client_minimal.horizon_placement = "5 à 8 ans"  # 18 points
        mock_client_minimal.tolerance_risque = "Moyen - Équilibré"  # 15 points
        mock_client_minimal.pertes_maximales_acceptables = "25%"  # 10 points
        mock_client_minimal.patrimoine_global = "500000"  # 6 points
        mock_client_minimal.liquidite_importante = False  # 5 points

        result = calculate_risk_profile(mock_client_minimal)

        # Total attendu: 18+15+10+6+5 = 54 points
        assert 50 <= result["score"] < 75
        assert result["profil"] == "Équilibré"

    @pytest.mark.unit
    def test_profil_equilibre_limite_basse(self, mock_client_minimal):
        """Test de la limite basse du profil Équilibré (50 points)"""
        mock_client_minimal.horizon_placement = "5 ans"  # 18 points
        mock_client_minimal.tolerance_risque = "Moyen"  # 15 points
        mock_client_minimal.pertes_maximales_acceptables = "15%"  # 5 points
        mock_client_minimal.patrimoine_global = "300000"  # 4 points
        mock_client_minimal.kyc_portefeuille_experience_pro = True  # 5 points
        mock_client_minimal.liquidite_importante = False  # 5 points

        result = calculate_risk_profile(mock_client_minimal)

        assert result["score"] >= 50
        assert result["profil"] in ["Équilibré", "Dynamique"]

    # ==========================================
    # TESTS PROFIL PRUDENT (25-49 points)
    # ==========================================

    @pytest.mark.unit
    def test_profil_prudent(self, mock_client_minimal):
        """Test qu'un client prudent obtient le bon profil"""
        mock_client_minimal.horizon_placement = "3 ans"  # 10 points
        mock_client_minimal.tolerance_risque = "Faible - Prudent"  # 8 points
        mock_client_minimal.pertes_maximales_acceptables = "10%"  # 5 points
        mock_client_minimal.patrimoine_global = "100000"  # 2 points
        mock_client_minimal.liquidite_importante = False  # 5 points

        result = calculate_risk_profile(mock_client_minimal)

        # Total attendu: 10+8+5+2+5 = 30 points
        assert 25 <= result["score"] < 50
        assert result["profil"] == "Prudent"

    # ==========================================
    # TESTS PROFIL SÉCURITAIRE (0-24 points)
    # ==========================================

    @pytest.mark.unit
    def test_profil_securitaire(self, mock_client_securitaire):
        """Test qu'un client sécuritaire obtient le bon profil"""
        result = calculate_risk_profile(mock_client_securitaire)

        assert result["score"] < 25
        assert result["profil"] == "Sécuritaire"

    @pytest.mark.unit
    def test_profil_securitaire_score_zero(self, mock_client_minimal):
        """Test d'un client sans données = score minimum"""
        # Tous les champs sont None ou False par défaut
        mock_client_minimal.horizon_placement = None
        mock_client_minimal.tolerance_risque = None
        mock_client_minimal.pertes_maximales_acceptables = None
        mock_client_minimal.patrimoine_global = None
        mock_client_minimal.liquidite_importante = True  # Pas de bonus

        result = calculate_risk_profile(mock_client_minimal)

        assert result["score"] == 0
        assert result["profil"] == "Sécuritaire"

    # ==========================================
    # TESTS HORIZON DE PLACEMENT (25 points max)
    # ==========================================

    @pytest.mark.unit
    @pytest.mark.parametrize("horizon,expected_min_score", [
        ("Plus de 8 ans", 25),
        ("8 ans ou plus", 25),
        ("long terme", 25),
        ("5 à 8 ans", 18),
        ("5 ans", 18),
        ("3 à 5 ans", 10),
        ("3 ans", 10),
        ("2 ans", 5),
        ("court terme", 5),
    ])
    def test_horizon_placement_scoring(self, mock_client_minimal, horizon, expected_min_score):
        """Test des différentes valeurs d'horizon"""
        mock_client_minimal.horizon_placement = horizon

        result = calculate_risk_profile(mock_client_minimal)

        # Le score doit inclure au moins les points de l'horizon
        assert result["score"] >= expected_min_score - 5  # Marge pour liquidité

    # ==========================================
    # TESTS TOLÉRANCE AU RISQUE (25 points max)
    # ==========================================

    @pytest.mark.unit
    @pytest.mark.parametrize("tolerance,expected_points", [
        ("Très élevé", 25),
        ("Agressif", 25),
        ("Élevé", 20),
        ("Dynamique", 20),
        ("Moyen", 15),
        ("Équilibré", 15),
        ("Faible", 8),
        ("Prudent", 8),
        ("Très faible", 3),
        ("Sécuritaire", 3),
    ])
    def test_tolerance_risque_scoring(self, mock_client_minimal, tolerance, expected_points):
        """Test des différentes valeurs de tolérance"""
        mock_client_minimal.tolerance_risque = tolerance
        mock_client_minimal.liquidite_importante = True  # Désactiver le bonus liquidité

        result = calculate_risk_profile(mock_client_minimal)

        # Vérifier que le score inclut les points de tolérance
        assert result["score"] >= expected_points

    # ==========================================
    # TESTS PERTES MAXIMALES (20 points max)
    # ==========================================

    @pytest.mark.unit
    @pytest.mark.parametrize("pertes,expected_points", [
        ("100%", 20),
        ("50%", 15),
        ("25%", 10),
        ("15%", 5),
        ("10%", 5),
        ("Aucune", 0),
        ("0%", 0),
    ])
    def test_pertes_maximales_scoring(self, mock_client_minimal, pertes, expected_points):
        """Test des différentes valeurs de pertes acceptables"""
        mock_client_minimal.pertes_maximales_acceptables = pertes
        mock_client_minimal.liquidite_importante = True

        result = calculate_risk_profile(mock_client_minimal)

        assert result["score"] >= expected_points

    # ==========================================
    # TESTS EXPÉRIENCE FINANCIÈRE (15 points max)
    # ==========================================

    @pytest.mark.unit
    def test_experience_professionnelle(self, mock_client_minimal):
        """Test que l'expérience pro donne 5 points"""
        mock_client_minimal.kyc_portefeuille_experience_pro = True
        mock_client_minimal.liquidite_importante = True

        result = calculate_risk_profile(mock_client_minimal)

        assert result["score"] >= 5

    @pytest.mark.unit
    def test_experience_complete(self, mock_client_minimal):
        """Test avec toute l'expérience = 15 points"""
        mock_client_minimal.kyc_portefeuille_experience_pro = True  # 5
        mock_client_minimal.kyc_portefeuille_gestion_personnelle = True  # 3
        mock_client_minimal.kyc_derives_detention = True  # 4
        mock_client_minimal.kyc_culture_presse_financiere = True
        mock_client_minimal.kyc_culture_suivi_bourse = True  # 3
        mock_client_minimal.liquidite_importante = True

        result = calculate_risk_profile(mock_client_minimal)

        # Total expérience: 5+3+4+3 = 15 points
        assert result["score"] >= 15

    # ==========================================
    # TESTS PATRIMOINE (10 points max)
    # ==========================================

    @pytest.mark.unit
    @pytest.mark.parametrize("patrimoine,expected_points", [
        ("Plus de 5000000", 10),
        ("5000000", 10),
        ("1000000 à 5000000", 8),
        ("1000000", 8),
        ("500000 à 1000000", 6),
        ("500000", 6),
        ("300000 à 500000", 4),
        ("300000", 4),
        ("100000 à 300000", 2),
        ("100000", 2),
    ])
    def test_patrimoine_scoring(self, mock_client_minimal, patrimoine, expected_points):
        """Test des différentes tranches de patrimoine"""
        mock_client_minimal.patrimoine_global = patrimoine
        mock_client_minimal.liquidite_importante = True

        result = calculate_risk_profile(mock_client_minimal)

        assert result["score"] >= expected_points

    # ==========================================
    # TESTS LIQUIDITÉ (5 points max)
    # ==========================================

    @pytest.mark.unit
    def test_liquidite_non_requise_bonus(self, mock_client_minimal):
        """Test que pas besoin de liquidité = +5 points"""
        mock_client_minimal.liquidite_importante = False

        result = calculate_risk_profile(mock_client_minimal)

        assert result["score"] >= 5

    @pytest.mark.unit
    def test_liquidite_requise_pas_de_bonus(self, mock_client_minimal):
        """Test que besoin de liquidité = 0 points"""
        mock_client_minimal.liquidite_importante = True

        result = calculate_risk_profile(mock_client_minimal)

        assert result["score"] == 0

    # ==========================================
    # TESTS STRUCTURE DE RETOUR
    # ==========================================

    @pytest.mark.unit
    def test_structure_retour(self, mock_client_minimal):
        """Test que la structure de retour est complète"""
        result = calculate_risk_profile(mock_client_minimal)

        assert "profil" in result
        assert "score" in result
        assert "max_score" in result
        assert "details" in result

        assert result["profil"] in ["Sécuritaire", "Prudent", "Équilibré", "Dynamique"]
        assert 0 <= result["score"] <= 100
        assert result["max_score"] == 100

    @pytest.mark.unit
    def test_details_contenu(self, mock_client_minimal):
        """Test que les détails sont corrects"""
        mock_client_minimal.horizon_placement = "5 ans"
        mock_client_minimal.tolerance_risque = "Moyen"

        result = calculate_risk_profile(mock_client_minimal)

        details = result["details"]
        assert "horizon" in details
        assert "tolerance" in details
        assert "pertes_max" in details
        assert "experience" in details
        assert "liquidite_requise" in details

        assert details["horizon"] == "5 ans"
        assert details["tolerance"] == "Moyen"
