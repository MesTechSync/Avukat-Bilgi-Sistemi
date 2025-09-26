import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini AI servis sınıfı
export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.initialize(apiKey);
    }
  }

  // Gemini AI'yi başlat
  initialize(apiKey: string) {
    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      
      // Farklı model adlarını dene
      const modelNames = [
        "gemini-1.5-flash",
        "gemini-1.5-pro", 
        "gemini-pro",
        "gemini-1.0-pro"
      ];
      
      let modelInitialized = false;
      for (const modelName of modelNames) {
        try {
          this.model = this.genAI.getGenerativeModel({ model: modelName });
          console.log(`Gemini AI başarıyla başlatıldı - Model: ${modelName}`);
          modelInitialized = true;
          break;
        } catch (modelError) {
          console.warn(`Model ${modelName} başlatılamadı:`, modelError);
          continue;
        }
      }
      
      if (!modelInitialized) {
        throw new Error('Hiçbir Gemini modeli başlatılamadı');
      }
    } catch (error) {
      console.error('Gemini AI başlatma hatası:', error);
      throw new Error('Gemini AI başlatılamadı');
    }
  }

  // Metin analizi yap
  async analyzeText(instruction: string, context?: string): Promise<string> {
    // Geçici olarak Gemini API'yi devre dışı bırak ve yerel yanıt döndür
    console.log('Gemini API geçici olarak devre dışı, yerel yanıt döndürülüyor');
    return this.generateLocalResponse(instruction, context);
  }

  // Alternatif model dene
  private async tryAlternativeModel(instruction: string, context?: string): Promise<string> {
    const alternativeModels = [
      "gemini-1.5-pro",
      "gemini-pro", 
      "gemini-1.0-pro"
    ];

    for (const modelName of alternativeModels) {
      try {
        console.log(`Alternatif model deneniyor: ${modelName}`);
        const altModel = this.genAI!.getGenerativeModel({ model: modelName });
        
        const prompt = `
Sen Türkiye'de çalışan deneyimli bir avukat asistanısın. Aşağıdaki talimatı takip et:

${instruction}

${context ? `BAĞLAM: ${context}` : ''}

Lütfen talimatı takip ederek Türkçe yanıt ver, Türk hukuk sistemine uygun terminoloji kullan ve pratik öneriler sun.
`;

        const result = await altModel.generateContent(prompt);
        const response = await result.response;
        console.log(`Alternatif model başarılı: ${modelName}`);
        return response.text();
      } catch (altError) {
        console.warn(`Alternatif model ${modelName} başarısız:`, altError);
        continue;
      }
    }

    throw new Error('Tüm alternatif modeller başarısız oldu');
  }

  // Yerel yanıt oluştur
  private generateLocalResponse(instruction: string, context?: string): string {
    const message = context || instruction;
    const messageLower = message.toLowerCase();

    // Dilekçe türü tespit et
    if (messageLower.includes('boşanma')) {
      return `Boşanma dilekçesi için gerekli bilgiler:

1. **Taraflar**: Davacı ve davalı kimlik bilgileri
2. **Evlilik Tarihi**: Evlilik tarihi ve yeri
3. **Boşanma Sebebi**: Anlaşmalı mı, çekişmeli mi?
4. **Çocuk Durumu**: Varsa çocukların bilgileri
5. **Mal Rejimi**: Hangi mal rejimi uygulanıyor?
6. **Nafaka**: Çocuk ve eş nafakası talepleri

Bu bilgileri aldıktan sonra size profesyonel bir boşanma dilekçesi hazırlayabilirim. Lütfen bu bilgileri paylaşın.`;
    }

    if (messageLower.includes('icra') || messageLower.includes('takip')) {
      return `İcra takibi itiraz dilekçesi için gerekli bilgiler:

1. **İcra Dosya No**: İcra dosya numarası
2. **Alacaklı**: Alacaklının kimlik bilgileri
3. **Borçlu**: Borçlunun kimlik bilgileri
4. **Borç Miktarı**: Borç tutarı ve faizi
5. **İtiraz Sebebi**: İtirazın hukuki dayanağı
6. **Belgeler**: Destekleyici belgeler

Bu bilgileri aldıktan sonra size profesyonel bir itiraz dilekçesi hazırlayabilirim. Lütfen bu bilgileri paylaşın.`;
    }

    if (messageLower.includes('tazminat')) {
      return `Tazminat davası dilekçesi için gerekli bilgiler:

1. **Dava Türü**: Maddi/manevi tazminat
2. **Olay**: Tazminat sebebi olan olay
3. **Taraflar**: Davacı ve davalı bilgileri
4. **Zarar**: Uğranılan zararın miktarı
5. **Hukuki Dayanak**: Tazminat hakkının dayanağı
6. **Belgeler**: Zararı kanıtlayan belgeler

Bu bilgileri aldıktan sonra size profesyonel bir tazminat davası dilekçesi hazırlayabilirim. Lütfen bu bilgileri paylaşın.`;
    }

    if (messageLower.includes('iş') || messageLower.includes('çalışan')) {
      return `İş hukuku dilekçesi için gerekli bilgiler:

1. **Dava Türü**: İşe iade, kıdem tazminatı, fazla mesai vb.
2. **İş Sözleşmesi**: İş sözleşmesi tarihi ve türü
3. **İşveren**: İşverenin kimlik bilgileri
4. **Çalışan**: Çalışanın kimlik bilgileri
5. **Olay**: Dava sebebi olan olay
6. **Talep**: İstenen tazminat/ödeme

Bu bilgileri aldıktan sonra size profesyonel bir iş hukuku dilekçesi hazırlayabilirim. Lütfen bu bilgileri paylaşın.`;
    }

    if (messageLower.includes('sözleşme')) {
      return `Sözleşme ihlali dilekçesi için gerekli bilgiler:

1. **Sözleşme Türü**: Hangi tür sözleşme
2. **Sözleşme Tarihi**: Sözleşme imza tarihi
3. **Taraflar**: Sözleşme tarafları
4. **İhlal**: Sözleşme ihlali türü
5. **Zarar**: Uğranılan zarar
6. **Talep**: İstenen çözüm

Bu bilgileri aldıktan sonra size profesyonel bir sözleşme ihlali dilekçesi hazırlayabilirim. Lütfen bu bilgileri paylaşın.`;
    }

    // Genel yanıt
    return `Merhaba! Ben sizin hukuki asistanınızım. 

Hangi tür dilekçe yazmak istiyorsunuz? Size yardımcı olabileceğim konular:

• **Boşanma dilekçesi** - Anlaşmalı veya çekişmeli boşanma
• **İcra takibi itiraz** - İcra takibine itiraz dilekçesi  
• **Tazminat davası** - Maddi/manevi tazminat talepleri
• **İş hukuku** - İşe iade, kıdem tazminatı, fazla mesai
• **Sözleşme ihlali** - Sözleşme ihlali davaları
• **Diğer** - Diğer hukuki konular

Lütfen ihtiyacınızı açıklayın, size adım adım yardımcı olayım.`;
  }

  // Dosya içeriğini analiz et
  async analyzeFile(instruction: string, fileContent: string, fileName: string): Promise<string> {
    // Geçici olarak Gemini API'yi devre dışı bırak
    console.log('Gemini API geçici olarak devre dışı, yerel dosya analizi döndürülüyor');
    return `Dosya analizi geçici olarak devre dışı. 

Dosya: ${fileName}
Talimat: ${instruction}

Gemini API quota aşıldığı için dosya analizi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.`;
  }

  // Çoklu dosya analizi
  async analyzeMultipleFiles(instruction: string, files: Array<{name: string, content: string}>): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini AI başlatılmamış. Lütfen API key girin.');
    }

    try {
      let filesContent = '';
      files.forEach((file, index) => {
        filesContent += `\n--- DOSYA ${index + 1}: ${file.name} ---\n`;
        filesContent += file.content;
        filesContent += '\n';
      });

      const prompt = `
Sen Türkiye'de çalışan deneyimli bir avukat asistanısın. Aşağıdaki talimatı takip ederek dosyaları analiz et:

TALİMAT: ${instruction}

DOSYALAR:
${filesContent}

Lütfen talimatı takip ederek tüm dosyaları birlikte detaylı hukuki analiz et. Türkçe yanıt ver, Türk hukuk sistemine uygun terminoloji kullan ve pratik öneriler sun. Analizini şu başlıklar altında organize et:
- Dosyalar Arası İlişki Analizi
- Hukuki Değerlendirme
- Risk Analizi
- Öneriler
- Yasal Dayanaklar
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini çoklu dosya analizi hatası:', error);
      throw new Error('Çoklu dosya analizi yapılamadı: ' + (error as Error).message);
    }
  }

  // API key kontrolü
  isInitialized(): boolean {
    return this.model !== null;
  }
}

// Singleton instance
export const geminiService = new GeminiService();

// API key ile başlat
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDeNAudg6oWG3JLwTXYXGhdspVDrDPGAyk';
if (apiKey) {
  geminiService.initialize(apiKey);
}
