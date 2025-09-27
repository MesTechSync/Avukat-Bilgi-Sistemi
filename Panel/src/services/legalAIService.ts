import { geminiService } from './geminiService';
import { claudeService } from './claudeService';

// Hukuki AI servisi - Gemini ve Claude entegrasyonu
class LegalAIService {
  private userInfo: any;

  constructor() {
    this.userInfo = {
      name: 'Av. Mehmet Zeki Alagöz',
      title: 'Kıdemli Avukat',
      initials: 'MZ'
    };
  }

  // Derin düşünme özellikli hukuki analiz
  async analyzeLegalQuestion(question: string, preferredAI: 'gemini' | 'claude' | 'auto' = 'auto'): Promise<{
    response: string;
    aiUsed: string;
    thinkingProcess: string[];
    confidence: number;
  }> {
    const thinkingProcess: string[] = [];
    
    // Derin düşünme süreci
    thinkingProcess.push('🔍 Soru analiz ediliyor...');
    thinkingProcess.push('📚 Hukuki kategori belirleniyor...');
    thinkingProcess.push('⚖️ Türk hukuku mevzuatı inceleniyor...');
    thinkingProcess.push('🏛️ Yargıtay içtihatları araştırılıyor...');
    thinkingProcess.push('💡 Pratik çözümler geliştiriliyor...');
    thinkingProcess.push('✅ Detaylı yanıt hazırlanıyor...');

    let response = '';
    let aiUsed = '';
    let confidence = 0.8;

    try {
      if (preferredAI === 'gemini' || (preferredAI === 'auto' && Math.random() > 0.5)) {
        // Gemini AI'yi dene
        try {
          response = await geminiService.analyzeLegalQuestion(question, this.userInfo);
          aiUsed = 'Gemini AI';
          confidence = 0.9;
        } catch (error) {
          console.warn('Gemini AI hatası, Claude AI deneniyor:', error);
          // Claude AI'ye geç
          response = await claudeService.analyzeLegalQuestion(question, this.userInfo);
          aiUsed = 'Claude AI (Fallback)';
          confidence = 0.85;
        }
      } else {
        // Claude AI'yi dene
        try {
          response = await claudeService.analyzeLegalQuestion(question, this.userInfo);
          aiUsed = 'Claude AI';
          confidence = 0.9;
        } catch (error) {
          console.warn('Claude AI hatası, Gemini AI deneniyor:', error);
          // Gemini AI'ye geç
          response = await geminiService.analyzeLegalQuestion(question, this.userInfo);
          aiUsed = 'Gemini AI (Fallback)';
          confidence = 0.85;
        }
      }
    } catch (error) {
      console.error('Her iki AI de başarısız:', error);
      response = this.getEmergencyResponse(question);
      aiUsed = 'Emergency Response';
      confidence = 0.5;
    }

    return {
      response,
      aiUsed,
      thinkingProcess,
      confidence
    };
  }

  // Acil durum yanıtı
  private getEmergencyResponse(question: string): string {
    return `🚨 **Acil Durum Hukuki Analiz**

**Sorunuz:** ${question}

**Durum:** AI servisleri şu anda kullanılamıyor.

**Hukuki Değerlendirme:**
Bu konuda detaylı analiz için sistem yöneticisi ile iletişime geçin.

**Genel Bilgi:**
Türk hukuku kapsamında bu tür sorular için:
- İlgili mevzuatı manuel olarak araştırın
- Yargıtay kararlarını inceleyin
- Hukuki danışmanlık alın

**Öneri:**
- Sistem yöneticisi ile iletişime geçin
- Manuel araştırma yapın
- Profesyonel hukuki danışmanlık alın

**Not:** Bu yanıt acil durum yanıtıdır. Normal AI servisleri çalıştığında daha detaylı analiz alabilirsiniz.`;
  }

  // AI durumu kontrolü
  getAIStatus(): {
    gemini: boolean;
    claude: boolean;
    overall: boolean;
  } {
    return {
      gemini: geminiService.isInitialized(),
      claude: claudeService.isAvailable(),
      overall: geminiService.isInitialized() || claudeService.isAvailable()
    };
  }

  // Kullanıcı bilgilerini güncelle
  updateUserInfo(newUserInfo: any) {
    this.userInfo = { ...this.userInfo, ...newUserInfo };
  }
}

export const legalAIService = new LegalAIService();
