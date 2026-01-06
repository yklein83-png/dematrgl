/**
 * Tests du contexte d'authentification
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../contexts/AuthContext'

// Mock du service API
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import api from '../services/api'

// Composant de test pour accéder au contexte
const TestConsumer = () => {
  const { user, isAuthenticated, loading, login, logout } = useAuth()

  return (
    <div>
      <span data-testid="loading">{loading.toString()}</span>
      <span data-testid="authenticated">{isAuthenticated.toString()}</span>
      <span data-testid="user">{user ? JSON.stringify(user) : 'null'}</span>
      <button onClick={() => login('test@test.com', 'password123')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    nom: 'Dupont',
    prenom: 'Jean',
    role: 'conseiller',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.getItem.mockReturnValue(null)
  })

  // ==========================================
  // TESTS ÉTAT INITIAL
  // ==========================================

  describe('État initial', () => {
    it('démarre en mode chargement', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: null })

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      // Le loading devrait être true initialement
      expect(screen.getByTestId('loading').textContent).toBe('true')
    })

    it('termine le chargement sans token', async () => {
      localStorage.getItem.mockReturnValue(null)

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false')
      })
      expect(screen.getByTestId('authenticated').textContent).toBe('false')
    })

    it('charge utilisateur avec token valide', async () => {
      localStorage.getItem.mockReturnValue('valid_token')
      vi.mocked(api.get).mockResolvedValue({ data: mockUser })

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false')
      })
      expect(screen.getByTestId('authenticated').textContent).toBe('true')
      expect(screen.getByTestId('user').textContent).toContain('test@example.com')
    })

    it('supprime token invalide', async () => {
      localStorage.getItem.mockReturnValue('invalid_token')
      vi.mocked(api.get).mockRejectedValue(new Error('Token invalide'))

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false')
      })
      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token')
      expect(screen.getByTestId('authenticated').textContent).toBe('false')
    })
  })

  // ==========================================
  // TESTS CONNEXION
  // ==========================================

  describe('Connexion', () => {
    it('connecte utilisateur avec succès', async () => {
      const user = userEvent.setup()
      vi.mocked(api.post).mockResolvedValue({
        data: {
          access_token: 'new_token',
          user: mockUser,
        },
      })

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false')
      })

      await user.click(screen.getByText('Login'))

      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('true')
      })
      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'new_token')
    })

    it('envoie les bons identifiants au serveur', async () => {
      const user = userEvent.setup()
      vi.mocked(api.post).mockResolvedValue({
        data: { access_token: 'token', user: mockUser },
      })

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false')
      })

      await user.click(screen.getByText('Login'))

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        mot_de_passe: 'password123',
      })
    })

    it('gère erreur de connexion', async () => {
      const user = userEvent.setup()
      vi.mocked(api.post).mockRejectedValue(new Error('Identifiants invalides'))

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false')
      })

      await expect(
        user.click(screen.getByText('Login'))
      ).rejects.toThrow()

      expect(screen.getByTestId('authenticated').textContent).toBe('false')
    })
  })

  // ==========================================
  // TESTS DÉCONNEXION
  // ==========================================

  describe('Déconnexion', () => {
    it('déconnecte utilisateur', async () => {
      const user = userEvent.setup()
      localStorage.getItem.mockReturnValue('valid_token')
      vi.mocked(api.get).mockResolvedValue({ data: mockUser })

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('true')
      })

      await user.click(screen.getByText('Logout'))

      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token')
      expect(screen.getByTestId('authenticated').textContent).toBe('false')
      expect(screen.getByTestId('user').textContent).toBe('null')
    })
  })

  // ==========================================
  // TESTS HOOK useAuth
  // ==========================================

  describe('Hook useAuth', () => {
    it('lance erreur si utilisé hors AuthProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<TestConsumer />)
      }).toThrow('useAuth must be used within an AuthProvider')

      consoleError.mockRestore()
    })
  })

  // ==========================================
  // TESTS PROPRIÉTÉS UTILISATEUR
  // ==========================================

  describe('Propriétés utilisateur', () => {
    it('expose toutes les propriétés utilisateur', async () => {
      localStorage.getItem.mockReturnValue('valid_token')
      vi.mocked(api.get).mockResolvedValue({ data: mockUser })

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false')
      })

      const userData = JSON.parse(screen.getByTestId('user').textContent!)

      expect(userData.id).toBe('user-123')
      expect(userData.email).toBe('test@example.com')
      expect(userData.nom).toBe('Dupont')
      expect(userData.prenom).toBe('Jean')
      expect(userData.role).toBe('conseiller')
    })
  })

  // ==========================================
  // TESTS VALIDATION TOKEN BACKEND
  // ==========================================

  describe('Validation token', () => {
    it('appelle /users/me pour valider le token', async () => {
      localStorage.getItem.mockReturnValue('stored_token')
      vi.mocked(api.get).mockResolvedValue({ data: mockUser })

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/users/me')
      })
    })

    it('ne valide pas sans token stocké', async () => {
      localStorage.getItem.mockReturnValue(null)

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false')
      })

      expect(api.get).not.toHaveBeenCalled()
    })
  })
})
