/**
 * Utilitaires de validation
 * Règles de validation pour les formulaires
 */

/**
 * Valider un email
 */
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Valider un téléphone (format Polynésie)
 */
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\s|-/g, '');
  const re = /^(\+?689)?\d{8}$/;
  return re.test(cleaned);
}

/**
 * Valider un mot de passe fort
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Au moins 8 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Au moins une majuscule');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Au moins un chiffre');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?]/.test(password)) {
    errors.push('Au moins un caractère spécial');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valider un numéro SIRET
 */
export function validateSiret(siret: string): boolean {
  const cleaned = siret.replace(/\s/g, '');
  if (cleaned.length !== 14) return false;
  
  // Algorithme de Luhn pour SIRET
  let sum = 0;
  for (let i = 0; i < cleaned.length; i++) {
    let digit = parseInt(cleaned[i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  
  return sum % 10 === 0;
}

/**
 * Valider une date de naissance (18+ ans)
 */
export function validateBirthDate(date: string): boolean {
  const birthDate = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18;
  }
  
  return age >= 18;
}

/**
 * Formater un montant en euros
 */
export function formatCurrency(amount: number | string): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value || 0);
}

/**
 * Formater un pourcentage
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}