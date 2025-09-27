import Anthropic from '@anthropic-ai/sdk';

// Claude AI servisi
class ClaudeService {
  private claude: Anthropic;
  private isInitialized = false;

  constructor() {
    // API anahtarını environment'dan al
    const apiKey = import.meta.env.VITE_CLAUDE_API_KEY || 'sk-ant-api03-1234567890abcdef';
    
    if (apiKey && apiKey !== 'sk-ant-api03-1234567890abcdef') {
      this.claude = new Anthropic({
        apiKey: apiKey,
      });
      this.isInitialized = true;
    } else {
      console.warn('Claude API anahtarı bulunamadı. Claude servisi devre dışı.');
    }
  }

  // Derin düşünme özellikli hukuki analiz
  async analyzeLegalQuestion(question: string, userInfo: any): Promise<string> {
    if (!this.isInitialized) {
      return this.getFallbackResponse(question);
    }

    try {
      // Derin düşünme için özel prompt
      const deepThinkingPrompt = `Sen Türkiye'nin en deneyimli hukuk asistanısın. ${userInfo.name} adlı avukata profesyonel, detaylı ve pratik bir yanıt ver.

SORU: ${question}

DERİN DÜŞÜNME SÜRECİ:
1. Önce soruyu analiz et ve hukuki kategorisini belirle
2. İlgili Türk hukuku mevzuatını düşün
3. Yargıtay içtihatlarını göz önünde bulundur
4. Pratik çözüm önerileri geliştir
5. Dikkat edilmesi gereken noktaları belirle

YANIT FORMATI:
- Hukuki analiz ve değerlendirme
- İlgili mevzuat referansları (Türk hukuku)
- Yargıtay içtihatları (varsa)
- Pratik çözüm önerileri
- Dikkat edilmesi gereken noktalar
- Sonraki adımlar

ÖNEMLİ: Sadece Türk hukuku odaklı yanıt ver. Başka konulara girmeyin.`;

      const response = await this.claude.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: deepThinkingPrompt
          }
        ]
      });

      return response.content[0].type === 'text' ? response.content[0].text : 'Yanıt alınamadı.';
    } catch (error) {
      console.error('Claude API hatası:', error);
      return this.getFallbackResponse(question);
    }
  }

  // Fallback yanıt (API çalışmazsa)
  private getFallbackResponse(question: string): string {
    return `🤖 **Claude AI Hukuki Analiz**

**Sorunuz:** ${question}

**Hukuki Değerlendirme:**
Bu konuda detaylı analiz için Claude AI servisi şu anda kullanılamıyor. Lütfen Gemini AI'yi deneyin veya sistem yöneticisi ile iletişime geçin.

**Genel Bilgi:**
Türk hukuku kapsamında bu tür sorular için Yargıtay kararları ve ilgili mevzuat incelenmelidir.

**Öneri:**
- Gemini AI'yi kullanmayı deneyin
- İlgili mevzuatı manuel olarak araştırın
- Sistem yöneticisi ile iletişime geçin`;
  }

  // Sistem durumu kontrolü
  isAvailable(): boolean {
    return this.isInitialized;
  }
}

export const claudeService = new ClaudeService();