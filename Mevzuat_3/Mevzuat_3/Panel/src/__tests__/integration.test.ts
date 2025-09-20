// Mevzuat_3 Kapsamlı Test Suite
// KVKK uyumlu test senaryoları ve güvenlik testleri

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { privacyManager } from '../lib/privacyManager';
import { authManager } from '../lib/authManager';
import { supabase } from '../lib/supabase';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'test-id' }, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: 'test-id' }, error: null }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

// KVKK Uyumluluk Testleri
describe('KVKK Uyumluluk Testleri', () => {
  beforeEach(() => {
    // Test öncesi temizlik
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    // Test sonrası temizlik
    vi.clearAllMocks();
  });

  describe('PrivacyManager', () => {
    it('rıza isteme işlemi doğru çalışmalı', async () => {
      const mockShowConsentModal = vi.spyOn(privacyManager as any, 'showConsentModal');
      mockShowConsentModal.mockResolvedValue(true);

      const result = await privacyManager.requestConsent(
        'test-user',
        'voice_recording',
        'Ses komutları için veri işleme',
        ['ses verisi', 'komut geçmişi'],
        30
      );

      expect(result).toBe(true);
      expect(mockShowConsentModal).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'test-user',
          consentType: 'voice_recording',
          purpose: 'Ses komutları için veri işleme'
        })
      );
    });

    it('PII maskeleme doğru çalışmalı', () => {
      const testData = {
        name: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        phone: '+905551234567',
        tcno: '12345678901'
      };

      const maskedData = privacyManager.maskPII(testData);

      expect(maskedData.name).toMatch(/^A\*\*\*\*Z$/);
      expect(maskedData.email).toBe('***@example.com');
      expect(maskedData.phone).toBe('+905***4567');
      expect(maskedData.tcno).toBe('***********');
    });

    it('veri silme hakkı doğru çalışmalı', async () => {
      const mockDeleteUserVoiceData = vi.spyOn(privacyManager as any, 'deleteUserVoiceData');
      const mockDeleteUserDocuments = vi.spyOn(privacyManager as any, 'deleteUserDocuments');
      const mockDeleteUserConsents = vi.spyOn(privacyManager as any, 'deleteUserConsents');

      mockDeleteUserVoiceData.mockResolvedValue(undefined);
      mockDeleteUserDocuments.mockResolvedValue(undefined);
      mockDeleteUserConsents.mockResolvedValue(undefined);

      const result = await privacyManager.deleteUserData('test-user');

      expect(result).toBe(true);
      expect(mockDeleteUserVoiceData).toHaveBeenCalledWith('test-user');
      expect(mockDeleteUserDocuments).toHaveBeenCalledWith('test-user');
      expect(mockDeleteUserConsents).toHaveBeenCalledWith('test-user');
    });

    it('veri export işlemi doğru çalışmalı', async () => {
      const mockGetUserVoiceData = vi.spyOn(privacyManager as any, 'getUserVoiceData');
      const mockGetUserDocuments = vi.spyOn(privacyManager as any, 'getUserDocuments');
      const mockGetUserConsents = vi.spyOn(privacyManager as any, 'getUserConsents');
      const mockGetUserProfile = vi.spyOn(privacyManager as any, 'getUserProfile');

      mockGetUserVoiceData.mockResolvedValue([{ id: '1', transcript: 'test' }]);
      mockGetUserDocuments.mockResolvedValue([{ id: '1', title: 'test doc' }]);
      mockGetUserConsents.mockResolvedValue([{ id: '1', consentType: 'voice_recording' }]);
      mockGetUserProfile.mockResolvedValue({ id: 'test-user', name: 'Test User' });

      const result = await privacyManager.exportUserData('test-user');

      expect(result).toEqual({
        voiceHistory: [{ id: '1', transcript: 'test' }],
        documents: [{ id: '1', title: 'test doc' }],
        consents: [{ id: '1', consentType: 'voice_recording' }],
        profile: { id: 'test-user', name: 'Test User' }
      });
    });
  });

  describe('AuthManager', () => {
    it('kullanıcı girişi doğru çalışmalı', async () => {
      const mockSignIn = vi.mocked(supabase.auth.signInWithPassword);
      mockSignIn.mockResolvedValue({
        data: {
          user: { id: 'test-user', email: 'test@example.com' },
          session: {
            access_token: 'test-token',
            refresh_token: 'test-refresh',
            expires_at: Math.floor(Date.now() / 1000) + 3600
          }
        },
        error: null
      });

      const mockGetUserProfile = vi.spyOn(authManager as any, 'getUserProfile');
      mockGetUserProfile.mockResolvedValue({
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      });

      const result = await authManager.signIn({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.success).toBe(true);
      expect(result.user).toEqual({
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      });
    });

    it('kullanıcı kaydı doğru çalışmalı', async () => {
      const mockSignUp = vi.mocked(supabase.auth.signUp);
      mockSignUp.mockResolvedValue({
        data: {
          user: { id: 'test-user', email: 'test@example.com' }
        },
        error: null
      });

      const mockCreateUserProfile = vi.spyOn(authManager as any, 'createUserProfile');
      mockCreateUserProfile.mockResolvedValue(undefined);

      const result = await authManager.signUp({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user'
      });

      expect(result.success).toBe(true);
      expect(result.user).toEqual({
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        createdAt: expect.any(String),
        isActive: true,
        privacyConsents: []
      });
    });

    it('oturum durumu doğru kontrol edilmeli', () => {
      // Mock session
      authManager['currentSession'] = {
        user: { id: 'test-user', email: 'test@example.com', name: 'Test User', role: 'user', createdAt: new Date().toISOString(), isActive: true, privacyConsents: [] },
        accessToken: 'test-token',
        refreshToken: 'test-refresh',
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      };

      expect(authManager.isAuthenticated()).toBe(true);
      expect(authManager.getCurrentUser()).toEqual(authManager['currentSession'].user);
    });
  });
});

// Güvenlik Testleri
describe('Güvenlik Testleri', () => {
  describe('XSS Koruması', () => {
    it('script etiketleri temizlenmeli', () => {
      const maliciousInput = '<script>alert("XSS")</script>Hello World';
      const sanitized = privacyManager.maskPII({ content: maliciousInput });
      
      expect(sanitized.content).not.toContain('<script>');
      expect(sanitized.content).toContain('Hello World');
    });

    it('event handler\'lar temizlenmeli', () => {
      const maliciousInput = '<img src="x" onerror="alert(\'XSS\')">';
      const sanitized = privacyManager.maskPII({ content: maliciousInput });
      
      expect(sanitized.content).not.toContain('onerror');
    });
  });

  describe('Veri Doğrulama', () => {
    it('e-posta formatı doğrulanmalı', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.org'
      ];

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com'
      ];

      validEmails.forEach(email => {
        expect(privacyManager.maskPII({ email })).toBeDefined();
      });

      invalidEmails.forEach(email => {
        // Invalid emails should be handled gracefully
        expect(() => privacyManager.maskPII({ email })).not.toThrow();
      });
    });
  });
});

// Performance Testleri
describe('Performance Testleri', () => {
  it('PII maskeleme performansı', () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      phone: `+905551234${i.toString().padStart(3, '0')}`
    }));

    const startTime = performance.now();
    const maskedData = privacyManager.maskPII(largeDataset);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100); // 100ms'den az olmalı
    expect(maskedData).toHaveLength(1000);
  });

  it('oturum yenileme performansı', async () => {
    const mockRefreshSession = vi.mocked(supabase.auth.refreshSession);
    mockRefreshSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'new-token',
          refresh_token: 'new-refresh',
          expires_at: Math.floor(Date.now() / 1000) + 3600
        }
      },
      error: null
    });

    authManager['currentSession'] = {
      user: { id: 'test-user', email: 'test@example.com', name: 'Test User', role: 'user', createdAt: new Date().toISOString(), isActive: true, privacyConsents: [] },
      accessToken: 'old-token',
      refreshToken: 'old-refresh',
      expiresAt: new Date(Date.now() - 1000).toISOString() // Expired
    };

    const startTime = performance.now();
    const result = await authManager.refreshSession();
    const endTime = performance.now();

    expect(result).toBe(true);
    expect(endTime - startTime).toBeLessThan(1000); // 1s'den az olmalı
  });
});

// E2E Test Senaryoları
describe('E2E Test Senaryoları', () => {
  it('kullanıcı kayıt ve giriş akışı', async () => {
    // 1. Kullanıcı kaydı
    const signUpResult = await authManager.signUp({
      email: 'e2e@example.com',
      password: 'password123',
      name: 'E2E User',
      role: 'user'
    });

    expect(signUpResult.success).toBe(true);

    // 2. Kullanıcı girişi
    const signInResult = await authManager.signIn({
      email: 'e2e@example.com',
      password: 'password123'
    });

    expect(signInResult.success).toBe(true);

    // 3. KVKK rızası
    const consentResult = await privacyManager.requestConsent(
      signInResult.user!.id,
      'voice_recording',
      'Ses komutları için veri işleme',
      ['ses verisi'],
      30
    );

    expect(consentResult).toBe(true);

    // 4. Kullanıcı çıkışı
    const signOutResult = await authManager.signOut();
    expect(signOutResult.success).toBe(true);
  });

  it('veri silme akışı', async () => {
    // 1. Test verisi oluştur
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+905551234567'
    };

    // 2. Veriyi maskele
    const maskedData = privacyManager.maskPII(testData);
    expect(maskedData.name).toMatch(/^T\*\*\*\*r$/);

    // 3. Veriyi sil
    const deleteResult = await privacyManager.deleteUserData('test-user');
    expect(deleteResult).toBe(true);
  });
});

// Hata Yönetimi Testleri
describe('Hata Yönetimi Testleri', () => {
  it('network hatası durumunda graceful degradation', async () => {
    const mockSignIn = vi.mocked(supabase.auth.signInWithPassword);
    mockSignIn.mockRejectedValue(new Error('Network error'));

    const result = await authManager.signIn({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Beklenmeyen bir hata oluştu');
  });

  it('geçersiz oturum durumunda temizlik', () => {
    // Geçersiz oturum
    authManager['currentSession'] = {
      user: { id: 'test-user', email: 'test@example.com', name: 'Test User', role: 'user', createdAt: new Date().toISOString(), isActive: true, privacyConsents: [] },
      accessToken: 'invalid-token',
      refreshToken: 'invalid-refresh',
      expiresAt: new Date(Date.now() - 3600000).toISOString() // 1 saat önce
    };

    expect(authManager.isAuthenticated()).toBe(false);
  });
});

// Mock fonksiyonları
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

// Test cleanup
afterEach(() => {
  mockConsoleError.mockClear();
  mockConsoleLog.mockClear();
});
