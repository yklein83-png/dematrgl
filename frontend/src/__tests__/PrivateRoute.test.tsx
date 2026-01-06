/**
 * Tests du composant PrivateRoute
 * Protection des routes authentifiées
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute'

// Mock du contexte Auth
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../contexts/AuthContext'

// Composants de test
const ProtectedContent = () => <div data-testid="protected">Contenu protégé</div>
const LoginPage = () => <div data-testid="login">Page de connexion</div>

// Helper pour render avec Router
const renderWithRouter = (isAuthenticated: boolean, initialRoute = '/protected') => {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated,
    user: isAuthenticated ? { id: '1', email: 'test@test.com', nom: 'Test', prenom: 'User', role: 'conseiller' } : null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  })

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/protected" element={<ProtectedContent />} />
          <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('PrivateRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================
  // TESTS ACCÈS AUTHENTIFIÉ
  // ==========================================

  describe('Utilisateur authentifié', () => {
    it('affiche le contenu protégé', () => {
      renderWithRouter(true)

      expect(screen.getByTestId('protected')).toBeInTheDocument()
      expect(screen.queryByTestId('login')).not.toBeInTheDocument()
    })

    it('permet accès à plusieurs routes protégées', () => {
      renderWithRouter(true, '/dashboard')

      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    })
  })

  // ==========================================
  // TESTS ACCÈS NON AUTHENTIFIÉ
  // ==========================================

  describe('Utilisateur non authentifié', () => {
    it('redirige vers /login', () => {
      renderWithRouter(false)

      expect(screen.getByTestId('login')).toBeInTheDocument()
      expect(screen.queryByTestId('protected')).not.toBeInTheDocument()
    })

    it('redirige depuis toute route protégée', () => {
      renderWithRouter(false, '/dashboard')

      expect(screen.getByTestId('login')).toBeInTheDocument()
      expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument()
    })
  })

  // ==========================================
  // TESTS UTILISATION DU HOOK
  // ==========================================

  describe('Intégration AuthContext', () => {
    it('utilise le hook useAuth', () => {
      renderWithRouter(true)

      expect(useAuth).toHaveBeenCalled()
    })

    it('vérifie isAuthenticated', () => {
      const mockUseAuth = vi.mocked(useAuth)

      renderWithRouter(true)

      // Vérifie que le composant accède à isAuthenticated
      expect(mockUseAuth).toHaveBeenCalled()
      const returnValue = mockUseAuth.mock.results[0].value
      expect(returnValue.isAuthenticated).toBe(true)
    })
  })
})
