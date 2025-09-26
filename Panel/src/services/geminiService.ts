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
    if (!this.model) {
      throw new Error('Gemini AI başlatılmamış. Lütfen API key girin.');
    }

    try {
      const prompt = `
Sen Türkiye'de çalışan deneyimli bir avukat asistanısın. Aşağıdaki talimatı takip et:

${instruction}

${context ? `BAĞLAM: ${context}` : ''}

Lütfen talimatı takip ederek Türkçe yanıt ver, Türk hukuk sistemine uygun terminoloji kullan ve pratik öneriler sun.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini metin analizi hatası:', error);
      
      // Eğer model hatası varsa, alternatif model dene
      if (error instanceof Error && error.message.includes('404')) {
        console.log('Model hatası, alternatif model deneniyor...');
        return this.tryAlternativeModel(instruction, context);
      }
      
      throw new Error('Metin analizi yapılamadı: ' + (error as Error).message);
    }
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

  // Dosya içeriğini analiz et
  async analyzeFile(instruction: string, fileContent: string, fileName: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini AI başlatılmamış. Lütfen API key girin.');
    }

    try {
      const prompt = `
Sen Türkiye'de çalışan deneyimli bir avukat asistanısın. Aşağıdaki talimatı takip ederek dosyayı analiz et:

TALİMAT: ${instruction}

DOSYA ADI: ${fileName}

DOSYA İÇERİĞİ:
${fileContent}

Lütfen talimatı takip ederek dosyayı detaylı hukuki analiz et. Türkçe yanıt ver, Türk hukuk sistemine uygun terminoloji kullan ve pratik öneriler sun. Analizini şu başlıklar altında organize et:
- Dosya Özeti
- Hukuki Değerlendirme
- Risk Analizi
- Öneriler
- Yasal Dayanaklar
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini dosya analizi hatası:', error);
      throw new Error('Dosya analizi yapılamadı: ' + (error as Error).message);
    }
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
