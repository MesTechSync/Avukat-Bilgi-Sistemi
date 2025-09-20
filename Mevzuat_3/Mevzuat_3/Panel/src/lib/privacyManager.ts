// KVKK Uyumlu Gizlilik Yönetim Sistemi
// Kişisel Verilerin Korunması Kanunu (KVKK) uyumlu veri işleme

export interface PrivacyConsent {
  id: string;
  userId: string;
  consentType: 'voice_recording' | 'data_processing' | 'analytics' | 'marketing';
  granted: boolean;
  grantedAt: string;
  expiresAt?: string;
  purpose: string;
  dataCategories: string[];
  retentionPeriod: number; // gün cinsinden
}

export interface PIIMaskingRule {
  field: string;
  pattern: RegExp;
  replacement: string;
  maskType: 'full' | 'partial' | 'hash';
}

export interface DataRetentionPolicy {
  dataType: string;
  retentionDays: number;
  autoDelete: boolean;
  archiveBeforeDelete: boolean;
}

export class PrivacyManager {
  private static instance: PrivacyManager;
  private consentStorage: Map<string, PrivacyConsent> = new Map();
  private maskingRules: PIIMaskingRule[] = [];
  private retentionPolicies: DataRetentionPolicy[] = [];

  constructor() {
    this.initializeMaskingRules();
    this.initializeRetentionPolicies();
    this.loadConsentsFromStorage();
  }

  static getInstance(): PrivacyManager {
    if (!PrivacyManager.instance) {
      PrivacyManager.instance = new PrivacyManager();
    }
    return PrivacyManager.instance;
  }

  // KVKK Uyumlu Rıza Yönetimi
  async requestConsent(
    userId: string,
    consentType: PrivacyConsent['consentType'],
    purpose: string,
    dataCategories: string[],
    retentionPeriod: number
  ): Promise<boolean> {
    try {
      // Mevcut rızayı kontrol et
      const existingConsent = this.getConsent(userId, consentType);
      if (existingConsent && this.isConsentValid(existingConsent)) {
        return existingConsent.granted;
      }

      // Yeni rıza isteği
      const consent: PrivacyConsent = {
        id: this.generateConsentId(),
        userId,
        consentType,
        granted: false,
        grantedAt: new Date().toISOString(),
        purpose,
        dataCategories,
        retentionPeriod
      };

      // UI'da rıza göster (gerçek uygulamada modal açılır)
      const granted = await this.showConsentModal(consent);
      
      if (granted) {
        consent.granted = true;
        consent.grantedAt = new Date().toISOString();
        consent.expiresAt = new Date(Date.now() + (retentionPeriod * 24 * 60 * 60 * 1000)).toISOString();
      }

      this.consentStorage.set(this.getConsentKey(userId, consentType), consent);
      this.saveConsentsToStorage();
      
      return granted;
    } catch (error) {
      console.error('Rıza alma hatası:', error);
      return false;
    }
  }

  // PII Maskeleme
  maskPII(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const maskedData = { ...data };

    for (const rule of this.maskingRules) {
      if (maskedData[rule.field]) {
        maskedData[rule.field] = this.applyMaskingRule(maskedData[rule.field], rule);
      }
    }

    return maskedData;
  }

  // Veri Saklama Politikası
  async enforceRetentionPolicy(dataType: string): Promise<void> {
    const policy = this.retentionPolicies.find(p => p.dataType === dataType);
    if (!policy) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

    try {
      // Eski verileri bul ve sil
      const oldData = await this.findOldData(dataType, cutoffDate);
      
      if (policy.archiveBeforeDelete) {
        await this.archiveData(oldData);
      }
      
      await this.deleteData(oldData);
      
      console.log(`${dataType} için ${policy.retentionDays} günden eski ${oldData.length} kayıt silindi`);
    } catch (error) {
      console.error('Veri saklama politikası uygulanırken hata:', error);
    }
  }

  // Kullanıcı Veri Hakları
  async getUserDataRights(userId: string): Promise<{
    dataAccess: boolean;
    dataPortability: boolean;
    dataErasure: boolean;
    dataRectification: boolean;
    consentWithdrawal: boolean;
  }> {
    return {
      dataAccess: true,
      dataPortability: true,
      dataErasure: true,
      dataRectification: true,
      consentWithdrawal: true
    };
  }

  // Veri Silme Hakkı
  async deleteUserData(userId: string): Promise<boolean> {
    try {
      // Kullanıcının tüm verilerini sil
      await this.deleteUserVoiceData(userId);
      await this.deleteUserDocuments(userId);
      await this.deleteUserConsents(userId);
      
      console.log(`Kullanıcı ${userId} verileri başarıyla silindi`);
      return true;
    } catch (error) {
      console.error('Kullanıcı verisi silinirken hata:', error);
      return false;
    }
  }

  // Veri Düzeltme Hakkı
  async rectifyUserData(userId: string, dataType: string, corrections: any): Promise<boolean> {
    try {
      // Veri düzeltme işlemi
      await this.updateUserData(userId, dataType, corrections);
      return true;
    } catch (error) {
      console.error('Veri düzeltme hatası:', error);
      return false;
    }
  }

  // Veri Taşınabilirlik Hakkı
  async exportUserData(userId: string): Promise<any> {
    try {
      const userData = {
        voiceHistory: await this.getUserVoiceData(userId),
        documents: await this.getUserDocuments(userId),
        consents: await this.getUserConsents(userId),
        profile: await this.getUserProfile(userId)
      };
      
      return userData;
    } catch (error) {
      console.error('Veri export hatası:', error);
      return null;
    }
  }

  // Rıza Geri Çekme
  async withdrawConsent(userId: string, consentType: PrivacyConsent['consentType']): Promise<boolean> {
    try {
      const consent = this.getConsent(userId, consentType);
      if (consent) {
        consent.granted = false;
        consent.grantedAt = new Date().toISOString();
        this.consentStorage.set(this.getConsentKey(userId, consentType), consent);
        this.saveConsentsToStorage();
        
        // İlgili verileri sil
        await this.deleteDataByConsentType(userId, consentType);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Rıza geri çekme hatası:', error);
      return false;
    }
  }

  // Yardımcı Metodlar
  private initializeMaskingRules(): void {
    this.maskingRules = [
      {
        field: 'email',
        pattern: /^([^@]+)@/,
        replacement: '***@',
        maskType: 'partial'
      },
      {
        field: 'phone',
        pattern: /(\d{3})\d{3}(\d{4})/,
        replacement: '$1***$2',
        maskType: 'partial'
      },
      {
        field: 'tcno',
        pattern: /\d{11}/,
        replacement: '***********',
        maskType: 'full'
      },
      {
        field: 'name',
        pattern: /^(\w)\w*(\w)$/,
        replacement: '$1***$2',
        maskType: 'partial'
      }
    ];
  }

  private initializeRetentionPolicies(): void {
    this.retentionPolicies = [
      {
        dataType: 'voice_history',
        retentionDays: 30,
        autoDelete: true,
        archiveBeforeDelete: false
      },
      {
        dataType: 'user_documents',
        retentionDays: 365,
        autoDelete: false,
        archiveBeforeDelete: true
      },
      {
        dataType: 'analytics_data',
        retentionDays: 90,
        autoDelete: true,
        archiveBeforeDelete: false
      }
    ];
  }

  private applyMaskingRule(value: string, rule: PIIMaskingRule): string {
    if (rule.maskType === 'full') {
      return rule.replacement;
    } else if (rule.maskType === 'partial') {
      return value.replace(rule.pattern, rule.replacement);
    } else if (rule.maskType === 'hash') {
      return this.hashString(value);
    }
    return value;
  }

  private hashString(str: string): string {
    // Basit hash fonksiyonu (gerçek uygulamada crypto kullanılmalı)
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit integer'a çevir
    }
    return Math.abs(hash).toString(16);
  }

  private async showConsentModal(consent: PrivacyConsent): Promise<boolean> {
    // Gerçek uygulamada modal açılır
    const message = `
KVKK Uyumlu Rıza Bildirimi

Rıza Türü: ${consent.consentType}
Amaç: ${consent.purpose}
Veri Kategorileri: ${consent.dataCategories.join(', ')}
Saklama Süresi: ${consent.retentionPeriod} gün

Bu verilerin işlenmesine rıza veriyor musunuz?
    `;
    
    return confirm(message);
  }

  private getConsent(userId: string, consentType: PrivacyConsent['consentType']): PrivacyConsent | null {
    return this.consentStorage.get(this.getConsentKey(userId, consentType)) || null;
  }

  private getConsentKey(userId: string, consentType: PrivacyConsent['consentType']): string {
    return `${userId}_${consentType}`;
  }

  private isConsentValid(consent: PrivacyConsent): boolean {
    if (!consent.granted) return false;
    if (consent.expiresAt && new Date(consent.expiresAt) < new Date()) {
      return false;
    }
    return true;
  }

  private generateConsentId(): string {
    return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadConsentsFromStorage(): void {
    try {
      const stored = localStorage.getItem('privacy_consents');
      if (stored) {
        const consents = JSON.parse(stored);
        this.consentStorage = new Map(Object.entries(consents));
      }
    } catch (error) {
      console.error('Rızalar yüklenirken hata:', error);
    }
  }

  private saveConsentsToStorage(): void {
    try {
      const consents = Object.fromEntries(this.consentStorage);
      localStorage.setItem('privacy_consents', JSON.stringify(consents));
    } catch (error) {
      console.error('Rızalar kaydedilirken hata:', error);
    }
  }

  // Veritabanı işlemleri (gerçek uygulamada Supabase ile yapılır)
  private async findOldData(dataType: string, cutoffDate: Date): Promise<any[]> {
    // Mock implementation
    return [];
  }

  private async archiveData(data: any[]): Promise<void> {
    // Mock implementation
    console.log(`${data.length} kayıt arşivlendi`);
  }

  private async deleteData(data: any[]): Promise<void> {
    // Mock implementation
    console.log(`${data.length} kayıt silindi`);
  }

  private async deleteUserVoiceData(userId: string): Promise<void> {
    // Mock implementation
    console.log(`Kullanıcı ${userId} ses verileri silindi`);
  }

  private async deleteUserDocuments(userId: string): Promise<void> {
    // Mock implementation
    console.log(`Kullanıcı ${userId} belgeleri silindi`);
  }

  private async deleteUserConsents(userId: string): Promise<void> {
    // Mock implementation
    console.log(`Kullanıcı ${userId} rızaları silindi`);
  }

  private async deleteDataByConsentType(userId: string, consentType: string): Promise<void> {
    // Mock implementation
    console.log(`Kullanıcı ${userId} ${consentType} verileri silindi`);
  }

  private async updateUserData(userId: string, dataType: string, corrections: any): Promise<void> {
    // Mock implementation
    console.log(`Kullanıcı ${userId} ${dataType} verileri güncellendi`);
  }

  private async getUserVoiceData(userId: string): Promise<any[]> {
    // Mock implementation
    return [];
  }

  private async getUserDocuments(userId: string): Promise<any[]> {
    // Mock implementation
    return [];
  }

  private async getUserConsents(userId: string): Promise<any[]> {
    // Mock implementation
    return [];
  }

  private async getUserProfile(userId: string): Promise<any> {
    // Mock implementation
    return {};
  }
}

// Singleton instance
export const privacyManager = PrivacyManager.getInstance();

// KVKK Uyumlu Hook
export function usePrivacy() {
  const [consents, setConsents] = useState<Map<string, PrivacyConsent>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const requestConsent = async (
    consentType: PrivacyConsent['consentType'],
    purpose: string,
    dataCategories: string[],
    retentionPeriod: number
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userId = 'current_user'; // Gerçek uygulamada auth'dan alınır
      const granted = await privacyManager.requestConsent(
        userId,
        consentType,
        purpose,
        dataCategories,
        retentionPeriod
      );
      
      // Consents'i güncelle
      setConsents(new Map(privacyManager['consentStorage']));
      
      return granted;
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawConsent = async (consentType: PrivacyConsent['consentType']): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userId = 'current_user';
      const success = await privacyManager.withdrawConsent(userId, consentType);
      
      if (success) {
        setConsents(new Map(privacyManager['consentStorage']));
      }
      
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUserData = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userId = 'current_user';
      return await privacyManager.deleteUserData(userId);
    } finally {
      setIsLoading(false);
    }
  };

  const exportUserData = async (): Promise<any> => {
    setIsLoading(true);
    try {
      const userId = 'current_user';
      return await privacyManager.exportUserData(userId);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    consents,
    isLoading,
    requestConsent,
    withdrawConsent,
    deleteUserData,
    exportUserData,
    maskPII: privacyManager.maskPII.bind(privacyManager)
  };
}
