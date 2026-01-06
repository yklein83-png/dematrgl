/**
 * Tests des utilitaires de validation
 */

import { describe, it, expect } from 'vitest'

// Tests de validation basiques pour le projet
// À compléter quand le fichier validation.ts sera accessible

describe('Validation Utilities', () => {
  // ==========================================
  // TESTS EMAIL
  // ==========================================

  describe('Email validation', () => {
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    it('valide un email correct', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
    })

    it('invalide un email sans @', () => {
      expect(isValidEmail('testexample.com')).toBe(false)
    })

    it('invalide un email sans domaine', () => {
      expect(isValidEmail('test@')).toBe(false)
    })

    it('invalide un email vide', () => {
      expect(isValidEmail('')).toBe(false)
    })

    it('valide email avec sous-domaine', () => {
      expect(isValidEmail('user@mail.company.fr')).toBe(true)
    })
  })

  // ==========================================
  // TESTS TÉLÉPHONE FRANÇAIS
  // ==========================================

  describe('Téléphone validation', () => {
    const isValidPhone = (phone: string): boolean => {
      // Format français: 10 chiffres commençant par 0
      const cleaned = phone.replace(/[\s.-]/g, '')
      return /^0[1-9][0-9]{8}$/.test(cleaned)
    }

    it('valide un téléphone mobile français', () => {
      expect(isValidPhone('0612345678')).toBe(true)
    })

    it('valide un téléphone fixe français', () => {
      expect(isValidPhone('0123456789')).toBe(true)
    })

    it('valide avec espaces', () => {
      expect(isValidPhone('06 12 34 56 78')).toBe(true)
    })

    it('valide avec points', () => {
      expect(isValidPhone('06.12.34.56.78')).toBe(true)
    })

    it('invalide numéro trop court', () => {
      expect(isValidPhone('06123456')).toBe(false)
    })

    it('invalide numéro ne commençant pas par 0', () => {
      expect(isValidPhone('1612345678')).toBe(false)
    })
  })

  // ==========================================
  // TESTS MONTANT
  // ==========================================

  describe('Montant validation', () => {
    const parseAmount = (value: string): number | null => {
      const cleaned = value.replace(/[€\s]/g, '').replace(',', '.')
      const num = parseFloat(cleaned)
      return isNaN(num) ? null : num
    }

    it('parse un montant simple', () => {
      expect(parseAmount('1000')).toBe(1000)
    })

    it('parse un montant avec euro', () => {
      expect(parseAmount('1000 €')).toBe(1000)
    })

    it('parse un montant avec virgule', () => {
      expect(parseAmount('1000,50')).toBe(1000.5)
    })

    it('parse un montant avec espaces', () => {
      expect(parseAmount('1 000')).toBe(1000)
    })

    it('retourne null pour valeur invalide', () => {
      expect(parseAmount('abc')).toBe(null)
    })
  })

  // ==========================================
  // TESTS DATE
  // ==========================================

  describe('Date validation', () => {
    const isValidDate = (dateStr: string): boolean => {
      // Format DD/MM/YYYY
      const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/
      const match = dateStr.match(regex)
      if (!match) return false

      const day = parseInt(match[1], 10)
      const month = parseInt(match[2], 10)
      const year = parseInt(match[3], 10)

      if (month < 1 || month > 12) return false
      if (day < 1 || day > 31) return false
      if (year < 1900 || year > 2100) return false

      return true
    }

    it('valide une date correcte', () => {
      expect(isValidDate('15/06/1990')).toBe(true)
    })

    it('invalide un mois > 12', () => {
      expect(isValidDate('15/13/1990')).toBe(false)
    })

    it('invalide un jour > 31', () => {
      expect(isValidDate('32/06/1990')).toBe(false)
    })

    it('invalide format incorrect', () => {
      expect(isValidDate('1990-06-15')).toBe(false)
    })
  })

  // ==========================================
  // TESTS SIRET
  // ==========================================

  describe('SIRET validation', () => {
    const isValidSiret = (siret: string): boolean => {
      const cleaned = siret.replace(/\s/g, '')
      if (!/^\d{14}$/.test(cleaned)) return false

      // Algorithme de Luhn pour SIRET
      let sum = 0
      for (let i = 0; i < 14; i++) {
        let digit = parseInt(cleaned[i], 10)
        if (i % 2 === 0) {
          digit *= 2
          if (digit > 9) digit -= 9
        }
        sum += digit
      }
      return sum % 10 === 0
    }

    it('valide un SIRET correct', () => {
      // SIRET valide de test (La Poste)
      expect(isValidSiret('35600000000048')).toBe(true)
    })

    it('invalide un SIRET trop court', () => {
      expect(isValidSiret('12345678')).toBe(false)
    })

    it('invalide un SIRET avec lettres', () => {
      expect(isValidSiret('1234567890123A')).toBe(false)
    })
  })

  // ==========================================
  // TESTS NIR (Sécurité sociale)
  // ==========================================

  describe('NIR validation (format basique)', () => {
    const isValidNirFormat = (nir: string): boolean => {
      const cleaned = nir.replace(/\s/g, '')
      // 13 chiffres + 2 clé
      return /^[12][0-9]{12}[0-9]{2}$/.test(cleaned)
    }

    it('valide un NIR masculin', () => {
      expect(isValidNirFormat('1 85 12 75 001 001 01')).toBe(true)
    })

    it('valide un NIR féminin', () => {
      expect(isValidNirFormat('285127500100101')).toBe(true)
    })

    it('invalide un NIR commençant par 3', () => {
      expect(isValidNirFormat('385127500100101')).toBe(false)
    })

    it('invalide un NIR trop court', () => {
      expect(isValidNirFormat('1851275001001')).toBe(false)
    })
  })
})
