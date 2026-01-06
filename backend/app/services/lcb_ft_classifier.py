"""
Service de classification LCB-FT
Lutte contre le blanchiment et financement du terrorisme
"""

from typing import Literal
from app.models.client import Client


def classify_lcb_ft_level(client: Client) -> Literal["Faible", "Standard", "Renforcé", "Élevé"]:
    """
    Classifier le niveau de risque LCB-FT d'un client
    Basé sur les critères réglementaires ACPR
    
    Args:
        client: Client avec ses données
        
    Returns:
        Niveau de risque LCB-FT
    """
    risk_factors = 0
    
    # ==========================================
    # 1. PERSONNE POLITIQUEMENT EXPOSÉE
    # ==========================================
    if client.lcb_ft_ppe or client.lcb_ft_ppe_famille:
        risk_factors += 3  # Facteur élevé
    
    # ==========================================
    # 2. US PERSON (FATCA)
    # ==========================================
    if client.t1_us_person or client.t2_us_person:
        risk_factors += 2
    
    # ==========================================
    # 3. RÉSIDENCE FISCALE
    # ==========================================
    if client.t1_residence_fiscale != "France":
        risk_factors += 1
    if client.t1_residence_fiscale_autre:
        # Pays à risque
        high_risk_countries = ["Iran", "Corée du Nord", "Myanmar"]
        if any(country in client.t1_residence_fiscale_autre for country in high_risk_countries):
            risk_factors += 3
    
    # ==========================================
    # 4. ORIGINE DES FONDS
    # ==========================================
    
    # Gains de jeu = risque élevé
    if client.origine_economique_gains_jeu:
        risk_factors += 2
    
    # Cession d'entreprise = risque moyen
    if client.origine_economique_cession_pro:
        risk_factors += 1
    
    # Origine "autres" non documentée
    if client.origine_economique_autres and not client.lcb_ft_justificatifs:
        risk_factors += 1
    
    # ==========================================
    # 5. MONTANTS IMPORTANTS
    # ==========================================
    if client.origine_fonds_montant_prevu:
        try:
            montant = float(client.origine_fonds_montant_prevu)
            if montant > 1000000:
                risk_factors += 2
            elif montant > 500000:
                risk_factors += 1
        except:
            pass
    
    # Patrimoine très élevé
    if client.patrimoine_global and "5000000" in client.patrimoine_global:
        risk_factors += 1
    
    # ==========================================
    # 6. ACTIVITÉ PROFESSIONNELLE
    # ==========================================
    profession = (client.t1_profession or "").lower()
    high_risk_professions = [
        "trader", "cambiste", "crypto", "bitcoin",
        "casino", "jeux", "paris"
    ]
    if any(prof in profession for prof in high_risk_professions):
        risk_factors += 2
    
    # ==========================================
    # 7. COMPLEXITÉ DE LA STRUCTURE
    # ==========================================
    if client.t1_chef_entreprise and client.t1_entreprise_forme_juridique:
        if "holding" in client.t1_entreprise_forme_juridique.lower():
            risk_factors += 1
    
    # ==========================================
    # CLASSIFICATION FINALE
    # ==========================================
    if risk_factors >= 5:
        return "Élevé"
    elif risk_factors >= 3:
        return "Renforcé"
    elif risk_factors >= 1:
        return "Standard"
    else:
        return "Faible"