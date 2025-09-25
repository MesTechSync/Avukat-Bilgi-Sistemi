// Claude API Service for Advanced Legal Analysis
// Avukat Bilgi Sistemi - Claude Entegrasyonu

interface ClaudeResponse {
  content: Array<{
    text: string;
  }>;
}

interface ClaudeRequest {
  prompt: string;
  maxTokens?: number;
}

class ClaudeService {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.anthropic.com/v1';

  initialize(apiKey: string) {
    this.apiKey = apiKey;
  }

  isInitialized(): boolean {
    return this.apiKey !== null;
  }

  private async makeRequest(prompt: string, maxTokens: number = 2000): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Claude API key başlatılmamış. Lütfen API key girin.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: maxTokens,
          messages: [
            {
              role: 'user',
              content: `Sen Türkiye'de çalışan deneyimli bir avukatsın. Türk hukuk sistemine uygun, profesyonel ve detaylı analizler yapıyorsun. Analizlerini Türkçe yazıyorsun ve Türk mevzuatına uygun şekilde düzenliyorsun.

${prompt}`
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Claude API hatası: ${response.status} - ${errorData.error?.message || 'Bilinmeyen hata'}`);
      }

      const data: ClaudeResponse = await response.json();
      
      if (!data.content || data.content.length === 0) {
        throw new Error('Claude\'dan geçerli yanıt alınamadı');
      }

      return data.content[0].text;
    } catch (error) {
      console.error('Claude analiz hatası:', error);
      throw new Error(`Claude analiz sırasında hata oluştu: ${(error as Error).message}`);
    }
  }

  async analyzeLegalCase(caseDescription: string): Promise<string> {
    const prompt = `
Aşağıdaki hukuki davayı analiz et ve detaylı bir değerlendirme yap:

DAVA AÇIKLAMASI:
${caseDescription}

Lütfen şu konularda analiz yap:
1. Hukuki durum değerlendirmesi
2. İlgili mevzuat ve içtihatlar
3. Güçlü ve zayıf yönler
4. Strateji önerileri
5. Risk analizi
6. Sonuç tahmini

Analizi maddeler halinde, açık ve anlaşılır bir şekilde sun.
`;

    return await this.makeRequest(prompt, 3000);
  }

  async generateLegalOpinion(question: string, context?: string): Promise<string> {
    const prompt = `
Aşağıdaki hukuki soruya detaylı bir görüş yazısı hazırla:

SORU: ${question}

${context ? `BAĞLAM: ${context}` : ''}

Lütfen şu başlıkları içeren kapsamlı bir görüş yazısı hazırla:
1. Sorunun hukuki analizi
2. İlgili mevzuat ve içtihatlar
3. Hukuki değerlendirme
4. Pratik öneriler
5. Dikkat edilmesi gereken noktalar

Görüş yazısını Türk hukuk sistemine uygun, profesyonel ve anlaşılır bir dille yaz.
`;

    return await this.makeRequest(prompt, 2500);
  }

  async reviewContract(contract: string): Promise<string> {
    const prompt = `
Aşağıdaki sözleşmeyi gözden geçir ve detaylı bir analiz yap:

SÖZLEŞME:
${contract}

Lütfen şu konularda analiz yap:
1. Hukuki geçerlilik
2. Eksik maddeler
3. Riskli hükümler
4. Türk mevzuatına uygunluk
5. İyileştirme önerileri
6. Genel değerlendirme

Analizi maddeler halinde, açık ve anlaşılır bir şekilde sun.
`;

    return await this.makeRequest(prompt, 2000);
  }
}

export const claudeService = new ClaudeService();

// API key ile başlat
const claudeApiKey = import.meta.env.VITE_CLAUDE_API_KEY;
if (claudeApiKey) {
  claudeService.initialize(claudeApiKey);
}
