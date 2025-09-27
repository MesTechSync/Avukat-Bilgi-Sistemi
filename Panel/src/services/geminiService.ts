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
      console.log('Gemini model başlatılmamış, yerel yanıt döndürülüyor');
      return this.generateLocalResponse(instruction, context);
    }

    try {
      const prompt = `
Sen deneyimli bir hukuk asistanısın. Aşağıdaki talimatı takip et:

${instruction}

${context ? `BAĞLAM: ${context}` : ''}

Yanıtında:
- Doğal ve samimi bir dil kullan
- Gereksiz formalite yapma
- Direkt ve pratik çözümler sun
- Hukuki terimleri açıkla ama abartma
- Gerçekçi öneriler ver

Türkçe, anlaşılır ve samimi bir dille yanıt ver.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini hukuki analiz hatası:', error);
      console.log('Gemini API hatası, yerel yanıt döndürülüyor');
      return this.generateLocalResponse(instruction, context);
    }
  }


  // Yerel yanıt oluştur
  private generateLocalResponse(instruction: string, context?: string): string {
    const message = context || instruction;
    const messageLower = message.toLowerCase();

    // Bilgi verildiğinde dilekçe yazma kontrolü
    if (this.hasDetailedInfo(message)) {
      if (messageLower.includes('boşanma')) {
        return this.generateDivorcePetition(message);
      }
      if (messageLower.includes('icra') || messageLower.includes('takip')) {
        return this.generateExecutionObjectionPetition(message);
      }
      if (messageLower.includes('tazminat')) {
        return this.generateCompensationPetition(message);
      }
      if (messageLower.includes('iş') || messageLower.includes('çalışan')) {
        return this.generateLaborLawPetition(message);
      }
    }

    // Boşanma dilekçesi yazma
    if (messageLower.includes('boşanma') && (messageLower.includes('yaz') || messageLower.includes('hazırla') || messageLower.includes('oluştur'))) {
      return this.generateDivorcePetition(message);
    }

    // Boşanma dilekçesi bilgi isteme
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

    // İcra takibi itiraz dilekçesi yazma
    if ((messageLower.includes('icra') || messageLower.includes('takip')) && (messageLower.includes('yaz') || messageLower.includes('hazırla') || messageLower.includes('oluştur'))) {
      return this.generateExecutionObjectionPetition(message);
    }

    // İcra takibi itiraz dilekçesi bilgi isteme
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

    // Tazminat davası dilekçesi yazma
    if (messageLower.includes('tazminat') && (messageLower.includes('yaz') || messageLower.includes('hazırla') || messageLower.includes('oluştur'))) {
      return this.generateCompensationPetition(message);
    }

    // Tazminat davası dilekçesi bilgi isteme
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

    // İş hukuku dilekçesi yazma
    if ((messageLower.includes('iş') || messageLower.includes('çalışan')) && (messageLower.includes('yaz') || messageLower.includes('hazırla') || messageLower.includes('oluştur'))) {
      return this.generateLaborLawPetition(message);
    }

    // İş hukuku dilekçesi bilgi isteme
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

  // Boşanma dilekçesi oluştur
  private generateDivorcePetition(_message: string): string {
    return `T.C.
ANTAKYA AİLE MAHKEMESİ

DAVACI: [Davacı Adı Soyadı]
T.C. Kimlik No: [T.C. Kimlik No]
Adres: [Davacı Adresi]

DAVALI: [Davalı Adı Soyadı]  
T.C. Kimlik No: [T.C. Kimlik No]
Adres: [Davalı Adresi]

KONU: Anlaşmalı Boşanma Davası

DEĞERLİ MAHKEMEMİZ,

1. Davacı ile davalı arasında [Evlilik Tarihi] tarihinde [Evlilik Yeri]'nde evlilik akdi yapılmıştır.

2. Taraflar arasında evlilik birliği kurulmuş olup, evlilik süresince [Çocuk Durumu] çocuk dünyaya gelmiştir.

3. Taraflar arasında evlilik birliğinin temelinden sarsılmasına neden olan olaylar yaşanmış ve taraflar arasındaki sevgi, saygı ve güven ortamı tamamen yok olmuştur.

4. Taraflar, evlilik birliğinin devamının mümkün olmadığını kabul etmekte ve anlaşmalı boşanma konusunda mutabık kalmışlardır.

5. Taraflar arasında mal rejimi olarak [Mal Rejimi] uygulanmaktadır.

6. Çocukların velayeti, nafakası ve kişisel ilişki düzenlenmesi konularında taraflar anlaşmışlardır.

HUKUKİ DAYANAK:
- 4721 sayılı Türk Medeni Kanunu'nun 166. maddesi
- 4721 sayılı Türk Medeni Kanunu'nun 182. maddesi

TALEP:
Yukarıda açıklanan nedenlerle, taraflar arasındaki evlilik birliğinin anlaşmalı boşanma ile sona erdirilmesini saygılarımla talep ederim.

EK: 1. Nüfus kayıt örneği
2. Evlilik cüzdanı
3. Çocukların nüfus kayıt örnekleri
4. Mal rejimi sözleşmesi (varsa)

[İmza]
[Davacı Adı Soyadı]
[Tarih]`;
  }

  // İcra takibi itiraz dilekçesi oluştur
  private generateExecutionObjectionPetition(_message: string): string {
    return `T.C.
ANTAKYA İCRA DAİRESİ

İTİRAZ EDEN: [Borçlu Adı Soyadı]
T.C. Kimlik No: [T.C. Kimlik No]
Adres: [Borçlu Adresi]

ALACAKLI: [Alacaklı Adı Soyadı]
T.C. Kimlik No: [T.C. Kimlik No]
Adres: [Alacaklı Adresi]

İCRA DOSYA NO: [İcra Dosya No]

KONU: İcra Takibine İtiraz

DEĞERLİ İCRA DAİRESİ,

1. Yukarıda kimlik bilgileri yazılı alacaklı tarafından, aleyhimde [İcra Dosya No] sayılı icra takibi başlatılmıştır.

2. İcra takibinde [Borç Miktarı] TL tutarında alacak iddia edilmektedir.

3. Ancak, icra takibinde iddia edilen alacak hukuki dayanağından yoksundur ve [İtiraz Sebebi] nedeniyle geçersizdir.

4. [İtiraz Sebebi Detayı] nedeniyle icra takibinin iptali gerekmektedir.

5. İcra takibinde iddia edilen alacak için zamanaşımı süresi dolmuştur.

HUKUKİ DAYANAK:
- 2004 sayılı İcra ve İflas Kanunu'nun 67. maddesi
- 6098 sayılı Türk Borçlar Kanunu'nun 125. maddesi
- 4721 sayılı Türk Medeni Kanunu'nun 146. maddesi

TALEP:
Yukarıda açıklanan nedenlerle, [İcra Dosya No] sayılı icra takibinin iptal edilmesini saygılarımla talep ederim.

EK: 1. T.C. Kimlik belgesi
2. İcra takip tebliğnamesi
3. [Destekleyici Belgeler]

[İmza]
[Borçlu Adı Soyadı]
[Tarih]`;
  }

  // Tazminat davası dilekçesi oluştur
  private generateCompensationPetition(_message: string): string {
    return `T.C.
ANTAKYA ASLİYE HUKUK MAHKEMESİ

DAVACI: [Davacı Adı Soyadı]
T.C. Kimlik No: [T.C. Kimlik No]
Adres: [Davacı Adresi]

DAVALI: [Davalı Adı Soyadı]
T.C. Kimlik No: [T.C. Kimlik No]
Adres: [Davalı Adresi]

KONU: Maddi ve Manevi Tazminat Davası

DEĞERLİ MAHKEMEMİZ,

1. Davacı ile davalı arasında [Olay Tarihi] tarihinde [Olay Yeri]'nde [Olay Açıklaması] meydana gelmiştir.

2. Meydana gelen olay sonucunda davacı [Zarar Açıklaması] zararına uğramıştır.

3. Davalının [Kusur Açıklaması] kusuru nedeniyle meydana gelen olay, davacının maddi ve manevi zarara uğramasına neden olmuştur.

4. Davacının uğradığı maddi zarar [Maddi Zarar Miktarı] TL'dir.

5. Davacının uğradığı manevi zarar [Manevi Zarar Miktarı] TL'dir.

6. Davalının kusuru nedeniyle meydana gelen olay, davacının [Manevi Zarar Açıklaması] manevi zarara uğramasına neden olmuştur.

HUKUKİ DAYANAK:
- 6098 sayılı Türk Borçlar Kanunu'nun 49. maddesi
- 6098 sayılı Türk Borçlar Kanunu'nun 50. maddesi
- 6098 sayılı Türk Borçlar Kanunu'nun 51. maddesi
- 4721 sayılı Türk Medeni Kanunu'nun 24. maddesi

TALEP:
Yukarıda açıklanan nedenlerle, davalıdan [Toplam Tazminat Miktarı] TL tutarında maddi ve manevi tazminatın ödenmesini saygılarımla talep ederim.

EK: 1. T.C. Kimlik belgesi
2. [Zarar Belgeleri]
3. [Olay Belgeleri]
4. [Diğer Destekleyici Belgeler]

[İmza]
[Davacı Adı Soyadı]
[Tarih]`;
  }

  // İş hukuku dilekçesi oluştur
  private generateLaborLawPetition(_message: string): string {
    return `T.C.
ANTAKYA İŞ MAHKEMESİ

DAVACI: [Çalışan Adı Soyadı]
T.C. Kimlik No: [T.C. Kimlik No]
Adres: [Çalışan Adresi]

DAVALI: [İşveren Adı Soyadı/Şirket Adı]
T.C. Kimlik No: [T.C. Kimlik No]
Adres: [İşveren Adresi]

KONU: İşe İade ve Tazminat Davası

DEĞERLİ MAHKEMEMİZ,

1. Davacı ile davalı arasında [İş Sözleşmesi Tarihi] tarihinde iş sözleşmesi imzalanmıştır.

2. Davacı, davalı işverenin yanında [İş Tanımı] olarak çalışmaya başlamıştır.

3. Davacının aylık brüt ücreti [Aylık Ücret] TL'dir.

4. Davalı işveren, [İşten Çıkarma Tarihi] tarihinde davacıyı [İşten Çıkarma Sebebi] gerekçesiyle işten çıkarmıştır.

5. Ancak, davalı işverenin işten çıkarma işlemi hukuka aykırıdır ve geçersizdir.

6. Davacı, işten çıkarılmadan önce [Çalışma Süresi] yıl süreyle davalı işverenin yanında çalışmıştır.

7. Davacının işten çıkarılması, 4857 sayılı İş Kanunu'nun 25. maddesinde belirtilen geçerli nedenlerden biri değildir.

HUKUKİ DAYANAK:
- 4857 sayılı İş Kanunu'nun 20. maddesi
- 4857 sayılı İş Kanunu'nun 21. maddesi
- 4857 sayılı İş Kanunu'nun 25. maddesi
- 4857 sayılı İş Kanunu'nun 26. maddesi

TALEP:
Yukarıda açıklanan nedenlerle, davalı işverenin işten çıkarma işleminin geçersizliğinin tespiti ve davacının işe iade edilmesini, ayrıca [Tazminat Miktarı] TL tutarında tazminatın ödenmesini saygılarımla talep ederim.

EK: 1. T.C. Kimlik belgesi
2. İş sözleşmesi
3. İşten çıkarma belgesi
4. Maaş bordroları
5. [Diğer Destekleyici Belgeler]

[İmza]
[Çalışan Adı Soyadı]
[Tarih]`;
  }

  // Detaylı bilgi kontrolü
  private hasDetailedInfo(message: string): boolean {
    const messageLower = message.toLowerCase();
    
    // Tarih kontrolü (dd.mm.yyyy formatı)
    const datePattern = /\d{1,2}\.\d{1,2}\.\d{4}/;
    if (datePattern.test(message)) return true;
    
    // Sayı kontrolü (tazminat miktarı, ücret vb.)
    const numberPattern = /\d+/;
    if (numberPattern.test(message) && message.length > 10) return true;
    
    // Anahtar kelime kontrolü
    const keywords = ['işe iade', 'kıdem tazminatı', 'sebepsiz', 'tazminat', 'icra', 'takip', 'boşanma', 'anlaşmalı'];
    if (keywords.some(keyword => messageLower.includes(keyword))) return true;
    
    // Çoklu satır kontrolü
    const lines = message.split('\n').filter(line => line.trim().length > 0);
    if (lines.length >= 3) return true;
    
    return false;
  }

  // Dosya içeriğini analiz et
  async analyzeFile(instruction: string, _fileContent: string, fileName: string): Promise<string> {
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
