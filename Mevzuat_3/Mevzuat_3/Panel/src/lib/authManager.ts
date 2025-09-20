// KVKK Uyumlu Authentication Sistemi
// Güvenli kullanıcı kimlik doğrulama ve oturum yönetimi

import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'lawyer';
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  privacyConsents: string[];
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'lawyer';
}

export class AuthManager {
  private static instance: AuthManager;
  private currentSession: AuthSession | null = null;
  private sessionStorageKey = 'mevzuat3_auth_session';

  constructor() {
    this.loadSessionFromStorage();
    this.setupAuthStateListener();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Kullanıcı Girişi
  async signIn(credentials: LoginCredentials): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user || !data.session) {
        return { success: false, error: 'Giriş başarısız' };
      }

      // Kullanıcı bilgilerini al
      const user = await this.getUserProfile(data.user.id);
      if (!user) {
        return { success: false, error: 'Kullanıcı profili bulunamadı' };
      }

      // Oturum oluştur
      const session: AuthSession = {
        user,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: new Date(data.session.expires_at! * 1000).toISOString(),
      };

      this.currentSession = session;
      this.saveSessionToStorage(credentials.rememberMe);

      // Son giriş zamanını güncelle
      await this.updateLastLogin(user.id);

      return { success: true, user };
    } catch (error) {
      console.error('Giriş hatası:', error);
      return { success: false, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  // Kullanıcı Kaydı
  async signUp(registerData: RegisterData): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            name: registerData.name,
            role: registerData.role || 'user',
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Kayıt başarısız' };
      }

      // Kullanıcı profili oluştur
      const user: User = {
        id: data.user.id,
        email: registerData.email,
        name: registerData.name,
        role: registerData.role || 'user',
        createdAt: new Date().toISOString(),
        isActive: true,
        privacyConsents: [],
      };

      await this.createUserProfile(user);

      return { success: true, user };
    } catch (error) {
      console.error('Kayıt hatası:', error);
      return { success: false, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  // Kullanıcı Çıkışı
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      this.currentSession = null;
      this.clearSessionFromStorage();

      return { success: true };
    } catch (error) {
      console.error('Çıkış hatası:', error);
      return { success: false, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  // Şifre Sıfırlama
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      return { success: false, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  // Şifre Değiştirme
  async changePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      return { success: false, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  // Mevcut Kullanıcı
  getCurrentUser(): User | null {
    return this.currentSession?.user || null;
  }

  // Oturum Durumu
  isAuthenticated(): boolean {
    return this.currentSession !== null && this.isSessionValid();
  }

  // Oturum Yenileme
  async refreshSession(): Promise<boolean> {
    try {
      if (!this.currentSession) return false;

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: this.currentSession.refreshToken
      });

      if (error || !data.session) {
        this.signOut();
        return false;
      }

      // Oturumu güncelle
      this.currentSession.accessToken = data.session.access_token;
      this.currentSession.refreshToken = data.session.refresh_token;
      this.currentSession.expiresAt = new Date(data.session.expires_at! * 1000).toISOString();

      this.saveSessionToStorage();

      return true;
    } catch (error) {
      console.error('Oturum yenileme hatası:', error);
      return false;
    }
  }

  // Kullanıcı Profili Güncelleme
  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      if (!this.currentSession) {
        return { success: false, error: 'Oturum bulunamadı' };
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', this.currentSession.user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Yerel oturumu güncelle
      this.currentSession.user = { ...this.currentSession.user, ...updates };
      this.saveSessionToStorage();

      return { success: true, user: this.currentSession.user };
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      return { success: false, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  // Yardımcı Metodlar
  private async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Kullanıcı profili alınamadı:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Kullanıcı profili hatası:', error);
      return null;
    }
  }

  private async createUserProfile(user: User): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert([user]);

      if (error) {
        console.error('Kullanıcı profili oluşturulamadı:', error);
      }
    } catch (error) {
      console.error('Kullanıcı profili oluşturma hatası:', error);
    }
  }

  private async updateLastLogin(userId: string): Promise<void> {
    try {
      await supabase
        .from('user_profiles')
        .update({ lastLoginAt: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Son giriş güncelleme hatası:', error);
    }
  }

  private isSessionValid(): boolean {
    if (!this.currentSession) return false;
    
    const expiresAt = new Date(this.currentSession.expiresAt);
    const now = new Date();
    
    // 5 dakika önceden yenile
    const refreshThreshold = new Date(now.getTime() + 5 * 60 * 1000);
    
    return expiresAt > refreshThreshold;
  }

  private loadSessionFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.sessionStorageKey);
      if (stored) {
        const session = JSON.parse(stored);
        if (this.isSessionValid()) {
          this.currentSession = session;
        } else {
          this.clearSessionFromStorage();
        }
      }
    } catch (error) {
      console.error('Oturum yükleme hatası:', error);
      this.clearSessionFromStorage();
    }
  }

  private saveSessionToStorage(rememberMe: boolean = true): void {
    try {
      if (this.currentSession && rememberMe) {
        localStorage.setItem(this.sessionStorageKey, JSON.stringify(this.currentSession));
      } else if (this.currentSession) {
        sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(this.currentSession));
      }
    } catch (error) {
      console.error('Oturum kaydetme hatası:', error);
    }
  }

  private clearSessionFromStorage(): void {
    try {
      localStorage.removeItem(this.sessionStorageKey);
      sessionStorage.removeItem(this.sessionStorageKey);
    } catch (error) {
      console.error('Oturum temizleme hatası:', error);
    }
  }

  private setupAuthStateListener(): void {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        this.currentSession = null;
        this.clearSessionFromStorage();
      } else if (event === 'SIGNED_IN' && session) {
        // Oturum yenilendi
        this.refreshSession();
      }
    });
  }
}

// Singleton instance
export const authManager = AuthManager.getInstance();

// React Hook
export function useAuth() {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      const currentUser = authManager.getCurrentUser();
      const authenticated = authManager.isAuthenticated();
      
      setUser(currentUser);
      setIsAuthenticated(authenticated);
      
      // Oturum geçersizse yenile
      if (authenticated && !authManager.isSessionValid()) {
        const refreshed = await authManager.refreshSession();
        if (!refreshed) {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const result = await authManager.signIn(credentials);
      if (result.success) {
        setUser(result.user!);
        setIsAuthenticated(true);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (registerData: RegisterData) => {
    setIsLoading(true);
    try {
      const result = await authManager.signUp(registerData);
      if (result.success) {
        setUser(result.user!);
        setIsAuthenticated(true);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const result = await authManager.signOut();
      if (result.success) {
        setUser(null);
        setIsAuthenticated(false);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    return await authManager.resetPassword(email);
  };

  const changePassword = async (newPassword: string) => {
    return await authManager.changePassword(newPassword);
  };

  const updateProfile = async (updates: Partial<User>) => {
    setIsLoading(true);
    try {
      const result = await authManager.updateProfile(updates);
      if (result.success) {
        setUser(result.user!);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    resetPassword,
    changePassword,
    updateProfile,
  };
}

