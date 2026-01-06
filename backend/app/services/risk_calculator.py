"""
Service de calcul du profil de risque
Algorithme basé sur les critères AMF
"""

from typing import Dict, Any
from app.models.client import Client


def calculate_risk_profile(client: Client) -> Dict[str, Any]:
    """
    Calculer le profil de risque d'un client
    Basé sur les critères réglementaires AMF
    
    Args:
        client: Client avec ses données KYC
        
    Returns:
        Dict avec profil et score calculés
    """
    score = 0
    max_score = 100
    
    # ==========================================
    # 1. HORIZON DE PLACEMENT (25 points)
    # ==========================================
    horizon = client.horizon_placement
    if horizon:
        if "8" in horizon or "long" in horizon.lower():
            score += 25
        elif "5" in horizon:
            score += 18
        elif "3" in horizon:
            score += 10
        elif "2" in horizon or "court" in horizon.lower():
            score += 5
    
    # ==========================================
    # 2. TOLÉRANCE AU RISQUE (25 points)
    # ==========================================
    tolerance = client.tolerance_risque
    if tolerance:
        tolerance_lower = tolerance.lower()
        if "très élevé" in tolerance_lower or "agressif" in tolerance_lower:
            score += 25
        elif "élevé" in tolerance_lower or "dynamique" in tolerance_lower:
            score += 20
        elif "moyen" in tolerance_lower or "équilibré" in tolerance_lower:
            score += 15
        elif "faible" in tolerance_lower or "prudent" in tolerance_lower:
            score += 8
        elif "très faible" in tolerance_lower or "sécuritaire" in tolerance_lower:
            score += 3
    
    # ==========================================
    # 3. PERTES MAXIMALES ACCEPTABLES (20 points)
    # ==========================================
    pertes = client.pertes_maximales_acceptables
    if pertes:
        if "100" in pertes:
            score += 20
        elif "50" in pertes:
            score += 15
        elif "25" in pertes:
            score += 10
        elif "15" in pertes or "10" in pertes:
            score += 5
        elif "aucune" in pertes.lower() or "0" in pertes:
            score += 0
    
    # ==========================================
    # 4. EXPÉRIENCE FINANCIÈRE (15 points)
    # ==========================================
    
    # Expérience professionnelle
    if client.kyc_portefeuille_experience_pro:
        score += 5
    
    # Gestion personnelle
    if client.kyc_portefeuille_gestion_personnelle:
        score += 3
    
    # Détention produits complexes
    if client.kyc_derives_detention or client.kyc_structures_detention:
        score += 4
    
    # Culture financière
    if client.kyc_culture_presse_financiere and client.kyc_culture_suivi_bourse:
        score += 3
    
    # ==========================================
    # 5. SITUATION PATRIMONIALE (10 points)
    # ==========================================
    patrimoine = client.patrimoine_global
    if patrimoine:
        if "5000000" in patrimoine:
            score += 10
        elif "1000000" in patrimoine:
            score += 8
        elif "500000" in patrimoine:
            score += 6
        elif "300000" in patrimoine:
            score += 4
        elif "100000" in patrimoine:
            score += 2
    
    # ==========================================
    # 6. LIQUIDITÉ (5 points)
    # ==========================================
    if not client.liquidite_importante:
        score += 5
    
    # ==========================================
    # DÉTERMINATION DU PROFIL
    # ==========================================
    profil = ""
    if score >= 75:
        profil = "Dynamique"
    elif score >= 50:
        profil = "Équilibré"
    elif score >= 25:
        profil = "Prudent"
    else:
        profil = "Sécuritaire"
    
    return {
        "profil": profil,
        "score": score,
        "max_score": max_score,
        "details": {
            "horizon": client.horizon_placement,
            "tolerance": client.tolerance_risque,
            "pertes_max": client.pertes_maximales_acceptables,
            "experience": bool(client.kyc_portefeuille_experience_pro),
            "liquidite_requise": client.liquidite_importante
        }
    }