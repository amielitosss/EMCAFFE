// src/lib/api/userService.ts

import type {
  User,
  RegisterData,
  LoginData,
  UpdateUserData,
  AuthResponse,
  UserRole
} from './types/user.types';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000/api';

export const userService = {
  // ==================== AUTHENTIFICATION ====================

  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la connexion');
      }

      const result = await response.json();
      const loginData: AuthResponse = result.data || result;

      if (!loginData.token) {
        throw new Error('Aucun token reçu de l\'API');
      }

      // Sauvegarder le token et les infos utilisateur
      localStorage.setItem('token', loginData.token);
      if (loginData.user) {
        localStorage.setItem('user', JSON.stringify(loginData.user));
      }

      console.log('✅ Connexion réussie');
      return loginData;
    } catch (error) {
      console.error('❌ Erreur login:', error);
      throw error;
    }
  },

  /**
   * Inscription utilisateur
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'inscription');
      }

      const result = await response.json();
      const registerData: AuthResponse = result.data || result;

      // Si un token est retourné, sauvegarder la session
      if (registerData.token) {
        localStorage.setItem('token', registerData.token);
        if (registerData.user) {
          localStorage.setItem('user', JSON.stringify(registerData.user));
        }
      }

      console.log('✅ Inscription réussie');
      return registerData;
    } catch (error) {
      console.error('❌ Erreur register:', error);
      throw error;
    }
  },

  /**
   * Déconnexion
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('isRedirecting');
    console.log('✅ Déconnexion');
  },

  // ==================== PROFIL UTILISATEUR ====================

  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  async getProfile(): Promise<User> {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Non authentifié');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error('Session expirée');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération du profil');
      }

      const result = await response.json();
      
      // Normaliser la réponse API
      let userData: User | null = null;

      if (result.data) {
        userData = result.data;
      } else if (result.user) {
        userData = result.user;
      } else if (result.id_user_account && result.email) {
        userData = result;
      }

      if (!userData) {
        console.error('❌ Structure de réponse non reconnue:', result);
        throw new Error('Format de réponse invalide');
      }

      // Mise en cache
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('✅ Profil récupéré et mis en cache');

      return userData;
    } catch (error) {
      console.error('❌ Erreur getProfile:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(userId: string, userData: UpdateUserData): Promise<User> {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Non authentifié');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error('Session expirée');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour');
      }

      const result = await response.json();
      const updatedUser: User = result.data || result.user || result;

      // Mettre à jour le cache
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('✅ Profil mis à jour');
      }

      return updatedUser;
    } catch (error) {
      console.error('❌ Erreur updateProfile:', error);
      throw error;
    }
  },

  // ==================== UTILITAIRES ====================

  /**
   * Récupérer l'utilisateur courant depuis le cache
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return !!(localStorage.getItem('token') && localStorage.getItem('user'));
  },

  /**
   * Vérifier si l'utilisateur est admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  },

  /**
   * Vérifier si l'utilisateur est client
   */
  isClient(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'CLIENT';
  },

  /**
   * Obtenir le token d'authentification
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  /**
   * Obtenir le nom complet de l'utilisateur
   */
  getFullName(user?: User): string {
    const currentUser = user || this.getCurrentUser();
    if (!currentUser) return 'Utilisateur';
    return `${currentUser.first_name} ${currentUser.last_name}`;
  },

  /**
   * Obtenir l'adresse complète formatée
   */
  getFormattedAddress(user?: User): string {
    const currentUser = user || this.getCurrentUser();
    if (!currentUser) return '';

    const parts = [
      currentUser.address_line1,
      currentUser.address_line2,
      currentUser.postal_code && currentUser.city 
        ? `${currentUser.postal_code} ${currentUser.city}` 
        : currentUser.city,
      currentUser.country
    ].filter(Boolean);

    return parts.join(', ');
  }
};

// Export des types
export type {
  User,
  RegisterData,
  LoginData,
  UpdateUserData,
  AuthResponse,
  UserRole
};
