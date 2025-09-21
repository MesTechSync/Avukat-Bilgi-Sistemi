// OpenAI API Service for Contract Generation
// Avukat Bilgi Sistemi - OpenAI Entegrasyonu

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface ContractRequest {
  contractType: string;
  description: string;
  requirements: string[];
  parties: string[];
  additionalInfo?: string;
}

class OpenAIService {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.openai.com/v1';

  initialize(apiKey: string) {
    this.apiKey = apiKey;
  }

  isInitialized(): boolean {
    return this.apiKey !== null;
  }

  private async makeRequest(prompt: string, maxTokens: number = 2000): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key başlatılmamış. Lütfen API key girin.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Sen Türkiye'de çalışan deneyimli bir avukatsın. Türk hukuk sistemine uygun, profesyonel ve detaylı sözleşmeler hazırlıyorsun. Sözleşmeleri Türkçe yazıyorsun ve Türk Borçlar Kanunu, İş Kanunu gibi mevzuatlara uygun şekilde düzenliyorsun.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: maxTokens,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API hatası: ${response.status} - ${errorData.error?.message || 'Bilinmeyen hata'}`);
      }

      const data: OpenAIResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('OpenAI\'dan geçerli yanıt alınamadı');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI sözleşme oluşturma hatası:', error);
      throw new Error(`OpenAI sözleşme oluşturma sırasında hata oluştu: ${(error as Error).message}`);
    }
  }

  async generateContract(request: ContractRequest): Promise<string> {
    const prompt = `
Aşağıdaki bilgilere göre profesyonel bir hukuki sözleşme hazırla:

SÖZLEŞME TÜRÜ: ${request.contractType}
AÇIKLAMA: ${request.description}

TARAFLAR:
${request.parties.map(party => `- ${party}`).join('\n')}

GEREKSINIMLER:
${request.requirements.map(req => `- ${req}`).join('\n')}

${request.additionalInfo ? `EK BİLGİLER:\n${request.additionalInfo}` : ''}

Lütfen şu başlıkları içeren detaylı bir sözleşme hazırla:
1. Sözleşme başlığı ve tarafların kimlik bilgileri
2. Konu ve kapsam
3. Tarafların hak ve yükümlülükleri
4. Ödeme şartları (varsa)
5. Süre ve fesih şartları
6. Uyuşmazlık çözümü
7. Genel hükümler
8. İmza bölümü

Sözleşmeyi Türk hukuk sistemine uygun, profesyonel ve anlaşılır bir dille yaz. Her maddeyi numaralandır ve açık bir şekilde düzenle.
`;

    return await this.makeRequest(prompt, 3000);
  }

  async improveContract(existingContract: string, improvements: string[]): Promise<string> {
    const prompt = `
Aşağıdaki sözleşmeyi gözden geçir ve belirtilen iyileştirmeleri yap:

MEVCUT SÖZLEŞME:
${existingContract}

YAPILACAK İYİLEŞTİRMELER:
${improvements.map(imp => `- ${imp}`).join('\n')}

Lütfen sözleşmeyi daha profesyonel, hukuki açıdan daha güçlü ve Türk mevzuatına daha uygun hale getir. İyileştirmeleri yaparken mevcut yapıyı koru ve sadece gerekli değişiklikleri yap.
`;

    return await this.makeRequest(prompt, 2500);
  }

  async generateClause(clauseType: string, context: string): Promise<string> {
    const prompt = `
Aşağıdaki bağlam için ${clauseType} maddesi hazırla:

BAĞLAM: ${context}

Lütfen Türk hukuk sistemine uygun, profesyonel ve detaylı bir ${clauseType} maddesi yaz. Maddeyi numaralandır ve açık bir şekilde düzenle.
`;

    return await this.makeRequest(prompt, 1000);
  }

  async analyzeContractRisk(contract: string): Promise<string> {
    const prompt = `
Aşağıdaki sözleşmeyi analiz et ve potansiyel riskleri belirle:

SÖZLEŞME:
${contract}

Lütfen şu konularda analiz yap:
1. Hukuki riskler
2. Eksik maddeler
3. Belirsizlikler
4. Türk mevzuatına uyumsuzluklar
5. Öneriler

Analizi maddeler halinde, açık ve anlaşılır bir şekilde sun.
`;

    return await this.makeRequest(prompt, 2000);
  }
}

export const openaiService = new OpenAIService();
