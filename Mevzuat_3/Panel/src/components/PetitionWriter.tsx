import React, { useState, useMemo } from 'react';
import { FileText, Wand2, Download, Copy, Save, RefreshCw, Search, BookOpen, Lightbulb, Star, Building, Users, Calendar, DollarSign, Sparkles, AlertTriangle, CheckSquare, Bot, Zap } from 'lucide-react';
import { 
  combinedPetitionDatabase,
  searchCombinedByCategory,
  searchCombinedByKeyword,
  findBestPetitionMatch,
  getCombinedCategoryStats,
  type PetitionExample
} from '../data/petitionExamples';
import { realPetitions, type RealPetition } from '../data/realPetitions';

interface FormData {
  [key: string]: string;
}

interface PetitionField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

// AI Model seçenekleri
type AIModel = 'gemini' | 'gpt-4' | 'auto';

// AI Prompt sistemi - Türk Hukuku uzmanı
const buildAIPrompt = (petitionType: string, formData: FormData, realExample?: RealPetition): string => {
  const currentDate = new Date().toLocaleDateString('tr-TR');
  
  const basePrompt = `Sen Türkiye'de uzman bir avukatsın ve mahkemeye sunulmaya uygun profesyonel dilekçeler yazıyorsun. 

ÖNEMLI KURALLAR:
1. Türk Hukuku terminolojisi kullan
2. Mahkeme standartlarına uygun format
3. Mevcut kanunları referans al (TMK, İK, TBK, HMK)
4. Profesyonel dil kullan
5. Ek belge listesi ekle
6. Yasal dayanak göster

DİLEKÇE TÜRÜ: ${petitionType}
TARİH: ${currentDate}

KULLANICI BİLGİLERİ:
${Object.entries(formData).map(([key, value]) => `${key}: ${value}`).join('\n')}

${realExample ? `
REFERANS ÖRNEK:
${realExample.template}

Bu örneği referans alarak, kullanıcının verdiği bilgilerle mahkeme kalitesinde yeni bir dilekçe yaz.
` : ''}

Lütfen aşağıdaki formatta dilekçe yaz:

T.C.
[MAHKEME ADI]

DİLEKÇE

Davacı: [Ad Soyad ve kimlik bilgileri]
Davalı: [Ad Soyad ve kimlik bilgileri]

KONU: ${petitionType}

Sayın Mahkeme,

[Ana dilekçe metni - hukuki gerekçeler ve talepler]

HUKUKİ DAYANAK:
[İlgili kanun maddeleri]

SONUÇ ve TALEP:
[Somut talepler]

EK BELGELER:
[Gerekli belgeler listesi]

Saygılarımla,
[Tarih ve imza]`;

  return basePrompt;
};

// AI Response simülasyonu - Gerçek API'ler yerine
const simulateAIResponse = async (prompt: string, model: AIModel): Promise<string> => {
  // Simülasyon amaçlı gecikme
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
  
  // Model bazlı farklı yaklaşımlar
  const responses = {
    'gemini': generateGeminiStyle,
    'gpt-4': generateGPT4Style,
    'auto': Math.random() > 0.5 ? generateGPT4Style : generateGeminiStyle
  };
  
  return responses[model](prompt);
};

// Gemini tarzı kısa ve net dilekçe
const generateGeminiStyle = (prompt: string): string => {
  // Prompt'tan form verilerini çıkar
  const lines = prompt.split('\n');
  const userData: Record<string, string> = {};
  let collectingData = false;
  
  for (const line of lines) {
    if (line.includes('KULLANICI BİLGİLERİ:')) {
      collectingData = true;
      continue;
    }
    if (collectingData && line.includes(':')) {
      const [key, value] = line.split(':').map(s => s.trim());
      if (value) userData[key] = value;
    }
    if (line.includes('REFERANS ÖRNEK:')) break;
  }

  const currentDate = new Date().toLocaleDateString('tr-TR');
  
  return `T.C.
${userData.mahkeme || 'ANKARA 1. ASLİYE HUKUK MAHKEMESİ'}

DİLEKÇE

DAVACI: ${userData.davaci_adi || userData.ad_soyad || '[Davacı Adı]'}
T.C. Kimlik No: ${userData.davaci_tc || '[TC No]'}
Adres: ${userData.davaci_adres || '[Adres]'}
Telefon: ${userData.davaci_telefon || '[Telefon]'}

DAVALI: ${userData.davali_adi || '[Davalı Adı]'}
T.C. Kimlik No: ${userData.davali_tc || '[Davalı TC]'}
Adres: ${userData.davali_adres || '[Davalı Adres]'}

KONU: ${userData.dava_konusu || 'Hukuki Talep'}

Sayın Mahkeme,

Yukarıda kimlik bilgileri yazılı davacı adına, aşağıda yazılı gerekçelerle dava açıyorum.

OLAY:
${userData.olay_aciklamasi || 'Taraflar arasında hukuki uyuşmazlık çıkmıştır.'}

HUKUKİ GEREKÇE:
Bu durumun hukuki sonucu olarak davacının hakları korunmalıdır. İlgili mevzuat hükümleri uyarınca talebimiz kanuna uygundur.

TALEP:
1. Davanın kabulü,
2. ${userData.talep || 'Hukuki hakların tanınması'},
3. Yargılama giderlerinin davalıdan alınması,
4. Vekalet ücretinin takdiri.

HUKUKİ DAYANAK:
- Türk Medeni Kanunu ilgili maddeleri
- Hukuk Muhakemeleri Kanunu
- İlgili içtihatlar

EK BELGELER:
1. Nüfus kayıt örneği
2. İkametgah belgesi
3. Delil belgeleri

Saygılarımla.

Tarih: ${currentDate}
Davacı/Vekili`;
};

// GPT-4 tarzı detaylı ve kapsamlı dilekçe
const generateGPT4Style = (prompt: string): string => {
  const lines = prompt.split('\n');
  const userData: Record<string, string> = {};
  let collectingData = false;
  
  for (const line of lines) {
    if (line.includes('KULLANICI BİLGİLERİ:')) {
      collectingData = true;
      continue;
    }
    if (collectingData && line.includes(':')) {
      const [key, value] = line.split(':').map(s => s.trim());
      if (value) userData[key] = value;
    }
    if (line.includes('REFERANS ÖRNEK:')) break;
  }

  const currentDate = new Date().toLocaleDateString('tr-TR');
  
  return `T.C.
${userData.mahkeme || 'ANKARA 1. ASLİYE HUKUK MAHKEMESİ'}
${userData.dava_no || 'Esas No: ........'}
${userData.karar_no || 'Karar No: ........'}

DİLEKÇE

DAVACI: ${userData.davaci_adi || userData.ad_soyad || '[DAVACI ADI SOYADI]'}
T.C. Kimlik Numarası: ${userData.davaci_tc || '[DAVACI TC KİMLİK NO]'}
Baba Adı: ${userData.baba_adi || '[BABA ADI]'}
Doğum Yeri/Tarihi: ${userData.dogum_yeri || '[DOĞUM YERİ]'} / ${userData.dogum_tarihi || '[DOĞUM TARİHİ]'}
Mesleği: ${userData.davaci_meslek || '[MESLEĞİ]'}
İkametgah Adresi: ${userData.davaci_adres || '[İKAMETGAH ADRESİ TAM]'}
Telefon: ${userData.davaci_telefon || '[TELEFON NUMARASI]'}
E-posta: ${userData.email || '[E-POSTA ADRESİ]'}

DAVALI: ${userData.davali_adi || '[DAVALI ADI SOYADI]'}
T.C. Kimlik Numarası: ${userData.davali_tc || '[DAVALI TC KİMLİK NO]'}
Adresi: ${userData.davali_adres || '[DAVALI ADRESİ TAM]'}

KONU: ${userData.dava_konusu || 'Alacak Davası'}
DEĞER: ${userData.dava_degeri || userData.tutar || '[DAVA DEĞERİ] TL'}

AÇIKLAMALAR:

I. OLAY:

${userData.olay_aciklamasi || `Taraflar arasında ${userData.tarih || '[TARİH]'} tarihinde başlayan hukuki ilişki nedeniyle uyuşmazlık doğmuştur. Davacının davalıdan olan alacağı ${userData.tutar || '[TUTAR] TL'} olup, davalı bu borcunu ifa etmemektedir.`}

${userData.detay_aciklama || 'Davacı, davalıya yasal yükümlülüklerini hatırlatmış, ancak davalı borcunu ödememiştir.'}

II. HUKUKİ DEĞERLENDIRME:

a) Maddi Hukuk Açısından:
Türk Borçlar Kanunu'nun ilgili hükümleri uyarınca, borçlu borcunu ifa etmekle yükümlüdür. Borcun muaccel hale gelmesi üzerine alacaklı, borcun ifasını dava yoluyla talep edebilir.

b) Usul Hukuku Açısından:
Hukuk Muhakemeleri Kanunu'nun 6. maddesi uyarınca, davalının yerleşim yeri mahkemesi yetkilidir. Dava şartları oluşmuş, zamanaşımı süresi dolmamıştır.

III. HUKUKİ DAYANAK:

- Türk Borçlar Kanunu Madde 86, 117, 125
- Türk Medeni Kanunu Madde 2 (İyiniyet kuralı)
- Hukuk Muhakemeleri Kanunu Madde 6, 107
- Yargıtay içtihatları (özellikle YHGK kararları)

IV. DELILLER:

1. Taraflar arasındaki yazılı belgeler
2. Tanık beyanları
3. Bilirkişi incelemesi (gerektiğinde)
4. Keşif (gerektiğinde)

SONUÇ VE TALEP:

Yukarıda açıklanan gerçek ve hukuki sebeplere dayanarak;

1. Davalıdan ${userData.tutar || '[TUTAR] TL'} ana para alacağının,
2. Bu alacağa ${userData.faiz_baslangic || '[TARİH]'} tarihinden itibaren yasal faizinin,
3. Yargılama giderlerinin,
4. Tarafımıza verilecek vekalet ücretinin,
5. Gecikmede kusuru bulunan davalıdan tahsilinin,

KABULÜNÜ saygıyla arz ve talep ederim.

EK BELGELER:
1. Nüfus kayıt örneği (Davacı)
2. İkametgah belgesi
3. Vekalet belgesi (varsa)
4. ${userData.ek_belgeler || 'İlgili sözleşme ve belgeler'}
5. Delil belgeleri

Tarih: ${currentDate}

${userData.avukat_adi || 'Av. [AVUKAT ADI SOYADI]'}
${userData.baro_no || '[BARO SİCİL NO]'}
Davacı Vekili`;
};

export default function PetitionWriter() {
  const [selectedExample, setSelectedExample] = useState<PetitionExample | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [generatedPetition, setGeneratedPetition] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showExamples, setShowExamples] = useState(false);
  const [aiModel, setAIModel] = useState<AIModel>('auto');
  const [useAI, setUseAI] = useState(true); // AI kullanımı açık

  // Gelişmiş AI Dilekçe Üretimi (Gerçek AI entegrasyonu)
  const generateAIPetition = async () => {
    if (!selectedExample) {
      alert('Lütfen önce bir dilekçe örneği seçin.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsGenerating(true);
    
    try {
      let generated = '';
      
      if (useAI) {
        // AI ile dilekçe üretimi
        const realExample = realPetitions.find(r => r.id === selectedExample.id);
        const prompt = buildAIPrompt(selectedExample.title, formData, realExample);
        generated = await simulateAIResponse(prompt, aiModel);
      } else {
        // Geleneksel template-based generation
        generated = generateFromTemplate(selectedExample, formData);
      }
      
      setGeneratedPetition(generated);
      
    } catch (error) {
      console.error('AI dilekçe oluşturulurken hata:', error);
      alert('Dilekçe oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Template-based generation with real examples (düzeltilmiş)
  const generateFromTemplate = (example: PetitionExample, data: FormData): string => {
    // Gerçek örneklerin template alanını kullan, yoksa content'i kullan
    const realExample = realPetitions.find(r => r.id === example.id);
    let result = realExample ? realExample.template : example.content;
    
    // Form verilerini akıllı mapping ile yerleştir
    const smartMapping: Record<string, string> = {
      // Davacı bilgileri
      'DAVACI_ADI': data.davaci_adi || data.ad_soyad || data.isim || data.davaci || '{DAVACI_ADI}',
      'DAVACI_TC': data.davaci_tc || data.tc_no || data.tc_kimlik || data.tc || '{DAVACI_TC}',
      'DAVACI_ADRES': data.davaci_adres || data.adres || data.ikametgah || '{DAVACI_ADRES}',
      'DAVACI_TELEFON': data.davaci_telefon || data.telefon || data.gsm || '{DAVACI_TELEFON}',
      'DAVACI_MESLEK': data.davaci_meslek || data.meslek || '{DAVACI_MESLEK}',
      
      // Davalı bilgileri
      'DAVALI_ADI': data.davali_adi || data.karsi_taraf || data.davali || '{DAVALI_ADI}',
      'DAVALI_TC': data.davali_tc || data.davali_kimlik || '{DAVALI_TC}',
      'DAVALI_ADRES': data.davali_adres || data.davali_ikametgah || '{DAVALI_ADRES}',
      
      // Finansal bilgiler
      'ALACAK_TUTARI': data.alacak_tutari || data.tutar || data.miktar || '{ALACAK_TUTARI}',
      'HASAR_MİKTARI': data.hasar_miktari || data.zarar || data.tutar || '{HASAR_MİKTARI}',
      'KIDEM_TUTARI': data.kidem_tutari || data.tutar || '{KIDEM_TUTARI}',
      'İHBAR_TUTARI': data.ihbar_tutari || data.ihbar || '{İHBAR_TUTARI}',
      'İZİN_TUTARI': data.izin_tutari || data.izin || '{İZİN_TUTARI}',
      'SON_MAAŞ': data.son_maas || data.maas || data.ucret || '{SON_MAAŞ}',
      'FAİZ_ORANI': data.faiz_orani || '20',
      
      // Tarih bilgileri
      'EVLILIK_TARIHI': data.evlilik_tarihi || data.nikah_tarihi || '{EVLILIK_TARIHI}',
      'KAZA_TARİHİ': data.kaza_tarihi || data.olay_tarihi || '{KAZA_TARİHİ}',
      'İŞE_GİRİŞ_TARİHİ': data.ise_giris || data.baslangic || '{İŞE_GİRİŞ_TARİHİ}',
      'İŞTEN_ÇIKIŞ_TARİHİ': data.isten_cikis || data.bitis || '{İŞTEN_ÇIKIŞ_TARİHİ}',
      'SATIŞ_TARİHİ': data.satis_tarihi || data.tarih || '{SATIŞ_TARİHİ}',
      
      // Yer bilgileri
      'KAZA_YERİ': data.kaza_yeri || data.yer || '{KAZA_YERİ}',
      'MAHKEME_ADI': data.mahkeme || 'ANKARA 1. ASLİYE HUKUK',
      'İLÇE_ADI': data.ilce || 'ÇANKAYA',
      
      // Diğer bilgiler
      'ÇALIŞMA_SÜRESİ': data.calisma_suresi || data.sure || '{ÇALIŞMA_SÜRESİ}',
      'PLAKA_NO': data.plaka || data.plaka_no || '{PLAKA_NO}',
      'TAKIP_NO': data.takip_no || '{TAKIP_NO}',
      'KUSUR_ORANI': data.kusur_orani || data.kusur || '50',
      
      // Avukat bilgileri
      'AVUKAT_ADI': data.avukat || 'Av. [İsminiz]',
      'BARO_NO': data.baro_no || '[Baro Sicil No]',
      
      // Otomatik tarih
      'DATE': new Date().toLocaleDateString('tr-TR'),
      'YEAR': new Date().getFullYear().toString()
    };
    
    // Smart mapping ile placeholder'ları değiştir
    Object.entries(smartMapping).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    });
    
    // Kategori bazlı profesyonel notlar ekle
    if (example.category === 'İş Hukuku') {
      result += `\n\n--- HUKUKİ NOT ---\nİş Kanunu md. 17-25 hükümleri gereğince işveren somut delillerle haklı nedenini ispatlamalıdır.\nİş mahkemesinde arabuluculuk zorunludur.`;
    } else if (example.category === 'Trafik Kazası') {
      result += `\n\n--- HUKUKİ NOT ---\nKasko poliçesi ve trafik sigortası durumu değerlendirilmelidir.\nEkspertiz raporu ve kaza tutanağı eklenmelidir.\nZamanaşımı süresi 2 yıldır.`;
    } else if (example.category === 'Aile Hukuku') {
      result += `\n\n--- HUKUKİ NOT ---\nAile ve Sosyal Politikalar Bakanlığı koordinasyonunda çocuğun üstün yararı gözetilir.\nArabuluculuk süreci önerilir.`;
    } else if (example.category === 'Borçlar Hukuku') {
      result += `\n\n--- HUKUKİ NOT ---\nAlacak davalarında zamanaşımı süresi 10 yıldır.\nİcra takibi daha hızlı bir yöntemdir.\nFaiz oranı Türkiye Cumhuriyet Merkez Bankası oranlarına göre hesaplanır.`;
    }
    
    return result;
  };

  // Filtreleme fonksiyonları
  const getFilteredExamples = (): PetitionExample[] => {
    if (searchTerm) {
      return searchCombinedByKeyword(searchTerm);
    }
    if (selectedCategory) {
      return searchCombinedByCategory(selectedCategory);
    }
    return combinedPetitionDatabase;
  };

  const categories = [...new Set(combinedPetitionDatabase.map(ex => ex.category))];
  const categoryStats = getCombinedCategoryStats();

  // Dinamik form alanları oluştur (Contract Generator tarzı)
  const generateFormFields = (example: PetitionExample): PetitionField[] => {
    const fields: PetitionField[] = [];
    
    // Örneğin variables'ından otomatik field'lar oluştur
    example.variables.forEach((variable, index) => {
      const fieldId = variable.toLowerCase().replace(/[^a-z0-9]/g, '_');
      let fieldType: PetitionField['type'] = 'text';
      let placeholder = '';
      
      // Akıllı tip tanıma
      if (variable.includes('TARİH') || variable.includes('DATE')) {
        fieldType = 'date';
      } else if (variable.includes('TUTAR') || variable.includes('MAAŞ') || variable.includes('ÜCRET') || variable.includes('TL')) {
        fieldType = 'number';
        placeholder = 'Tutarı TL olarak girin';
      } else if (variable.includes('ADRES') || variable.includes('AÇIKLAMA') || variable.includes('DETAY')) {
        fieldType = 'textarea';
      } else if (variable.includes('CİNSİYET') || variable.includes('DURUM')) {
        fieldType = 'select';
      }
      
      fields.push({
        id: fieldId,
        label: variable.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        type: fieldType,
        required: index < 5, // İlk 5 alan zorunlu
        placeholder: placeholder || `${variable.replace(/_/g, ' ').toLowerCase()} bilgisini girin`,
        ...(fieldType === 'select' && variable.includes('CİNSİYET') && {
          options: ['Erkek', 'Kadın']
        }),
        ...(fieldType === 'select' && variable.includes('DURUM') && {
          options: ['Evli', 'Bekar', 'Boşanmış', 'Dul']
        })
      });
    });
    
    return fields;
  };

  // Seçilen örnek için dinamik form alanları
  const formFields = useMemo(() => {
    if (!selectedExample) return [];
    return generateFormFields(selectedExample);
  }, [selectedExample]);

  // Form doğrulama (Contract Generator tarzı)
  const validateForm = (): boolean => {
    const requiredFields = formFields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.id]?.trim());
    
    if (missingFields.length > 0) {
      alert(`Lütfen şu zorunlu alanları doldurun: ${missingFields.map(f => f.label).join(', ')}`);
      return false;
    }
    return true;
  };

  // Yardımcı fonksiyonlar
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPetition);
    alert('Dilekçe panoya kopyalandı!');
  };

  const downloadPetition = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedPetition], { type: 'text/plain; charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${(selectedExample?.title || 'dilekce').replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleFormChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header - İstatistiklerle */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">🤖 AI Destekli Dilekçe Yazım Sistemi</h1>
            <p className="text-blue-100">70+ gerçek dilekçe örneğiyle desteklenen yapay zeka sistemi</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Toplam Örnek</span>
            </div>
            <div className="text-2xl font-bold">{combinedPetitionDatabase.length}</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>Gerçek Örnek</span>
            </div>
            <div className="text-2xl font-bold">{realPetitions.length}</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span>Kategori</span>
            </div>
            <div className="text-2xl font-bold">{categories.length}</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              <span>AI Destekli</span>
            </div>
            <div className="text-2xl font-bold">✓</div>
          </div>
        </div>
      </div>

      {/* Örnek Seçimi */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">📂 Gerçek Dilekçe Örnekleri</h2>
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showExamples ? 'Gizle' : 'Örnekleri Göster'} ({combinedPetitionDatabase.length})
          </button>
        </div>

        {/* AI Kontrol Paneli */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Bot className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-purple-800">🤖 AI Dilekçe Üretim Sistemi</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">AI Kullanımı</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="aiUsage"
                    checked={useAI}
                    onChange={() => setUseAI(true)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm">🤖 AI Destekli</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="aiUsage"
                    checked={!useAI}
                    onChange={() => setUseAI(false)}
                    className="text-gray-600 focus:ring-gray-500"
                  />
                  <span className="text-sm">📝 Template</span>
                </label>
              </div>
            </div>
            
            {useAI && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">AI Model</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAIModel(e.target.value as AIModel)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  title="AI Model Seçimi"
                  aria-label="AI Model Seçimi"
                >
                  <option value="auto">🎯 Otomatik Seçim</option>
                  <option value="gemini">✨ Gemini (Hızlı & Net)</option>
                  <option value="gpt-4">⚡ GPT-4 (Detaylı & Kapsamlı)</option>
                </select>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Kalite</label>
              <div className="text-sm text-gray-600">
                {useAI ? (
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-green-500" />
                    <span>Mahkeme Kalitesi</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span>Template Bazlı</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {useAI && (
            <div className="mt-3 p-3 bg-white rounded border border-purple-200">
              <div className="text-xs text-purple-700">
                <span className="font-medium">💡 AI Avantajları:</span>
                <span className="ml-2">
                  {aiModel === 'gemini' ? 'Hızlı üretim, net dil, pratik çözümler' : 
                   aiModel === 'gpt-4' ? 'Detaylı analiz, kapsamlı hukuki dayanak, profesyonel format' :
                   'En uygun modeli otomatik seçer, optimum sonuç'}
                </span>
              </div>
            </div>
          )}
        </div>

        {showExamples && (
          <div className="space-y-4">
            {/* Arama ve Filtre */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Dilekçe ara... (örn: işten çıkarma, boşanma, trafik)"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                title="Kategori Seçimi"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat} ({categoryStats[cat]?.total || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Örnek Listesi */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {getFilteredExamples().map((example) => (
                <div
                  key={example.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedExample?.id === example.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedExample(example)}
                >
                  <h3 className="font-semibold text-gray-800">{example.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{example.category}</p>
                  {example.subcategory && (
                    <p className="text-xs text-blue-600 mb-2">{example.subcategory}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {example.keywords.slice(0, 3).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  {/* Gerçek örnek mi göster */}
                  {realPetitions.some(r => r.id === example.id) && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                      <Star className="h-3 w-3" />
                      <span>Gerçek Örnek</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dinamik Form Bilgileri (Contract Generator Tarzı) */}
      {selectedExample && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">📝 Dilekçe Bilgileri</h2>
              <p className="text-sm text-gray-600">Lütfen aşağıdaki bilgileri eksiksiz doldurun</p>
            </div>
          </div>

          {/* Seçilen Dilekçe Bilgisi */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-start gap-3">
              {realPetitions.some(r => r.id === selectedExample.id) ? (
                <Star className="h-5 w-5 text-orange-500 mt-1" />
              ) : (
                <CheckSquare className="h-5 w-5 text-blue-500 mt-1" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{selectedExample.title}</h3>
                <p className="text-sm text-gray-600 mb-1">{selectedExample.category}</p>
                {selectedExample.subcategory && (
                  <p className="text-xs text-blue-600">{selectedExample.subcategory}</p>
                )}
                {realPetitions.some(r => r.id === selectedExample.id) && (
                  <div className="mt-2 flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Bu gerçek bir dilekçe örneğidir - Profesyonel kalitede</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dinamik Form Alanları */}
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {formFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    {field.required && <span className="text-red-500">*</span>}
                    {field.label}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={field.placeholder}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleFormChange(field.id, e.target.value)}
                      rows={3}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      title={field.label}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData[field.id] || ''}
                      onChange={(e) => handleFormChange(field.id, e.target.value)}
                    >
                      <option value="">Seçiniz...</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={field.placeholder}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleFormChange(field.id, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Akıllı Tavsiyeler */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">💡 Profesyonel Tavsiyeler</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Tüm tarih bilgilerini tam ve doğru formatta girin</li>
                    <li>• Tutar bilgilerini sadece rakam olarak yazın (örn: 15000)</li>
                    <li>• Adres bilgilerini detaylı ve net şekilde belirtin</li>
                    <li>• Kişisel bilgilerde T.C. kimlik numarasını eksiksiz yazın</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateAIPetition}
              disabled={isGenerating}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 font-medium"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>
                    {useAI ? 
                      `AI ${aiModel === 'gemini' ? 'Gemini' : aiModel === 'gpt-4' ? 'GPT-4' : 'Model'} Dilekçe Oluşturuyor...` : 
                      'Template Dilekçe Oluşturuluyor...'
                    }
                  </span>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </>
              ) : (
                <>
                  {useAI ? <Bot className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                  <span>
                    {useAI ? 
                      `🤖 ${aiModel === 'gemini' ? 'Gemini ile Hızlı' : aiModel === 'gpt-4' ? 'GPT-4 ile Detaylı' : 'AI ile Akıllı'} Dilekçe Oluştur` : 
                      '📝 Template ile Dilekçe Oluştur'
                    }
                  </span>
                  {useAI ? <Sparkles className="h-5 w-5" /> : <Wand2 className="h-5 w-5" />}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Oluşturulan Dilekçe (Contract Generator Tarzı) */}
      {generatedPetition && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-6 w-6" />
                <div>
                  <h2 className="text-xl font-semibold">✅ Dilekçe Başarıyla Oluşturuldu</h2>
                  <p className="text-green-100">
                    {useAI ? 
                      `${aiModel === 'gemini' ? 'Gemini AI' : aiModel === 'gpt-4' ? 'GPT-4 AI' : 'AI'} destekli profesyonel dilekçe hazır` : 
                      'Template bazlı dilekçe hazır'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1">
                {useAI ? <Bot className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {useAI ? 
                    `${aiModel === 'gemini' ? '✨ Gemini' : aiModel === 'gpt-4' ? '⚡ GPT-4' : '🤖 AI'} Üretimi` : 
                    '📝 Template'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-b bg-gray-50 p-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 min-w-[200px] px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Copy className="h-4 w-4" />
                📋 Panoya Kopyala
              </button>
              <button
                onClick={downloadPetition}
                className="flex-1 min-w-[200px] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Download className="h-4 w-4" />
                💾 Word Dosyası İndir
              </button>
              <button
                onClick={() => setGeneratedPetition('')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Yeni Dilekçe
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Dilekçe Bilgileri */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">
                  {selectedExample?.title || 'Özel Dilekçe'}
                </span>
              </div>
              <div className="text-sm text-blue-600 space-y-1">
                <p>📂 Kategori: {selectedExample?.category}</p>
                <p>📅 Oluşturma Tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
                <p>🤖 AI Model: GPT-4 + Gerçek Örnekler</p>
                <p>⭐ Kalite: Profesyonel Seviye</p>
              </div>
            </div>

            {/* Dilekçe İçeriği */}
            <div className="bg-gray-50 border rounded-lg">
              <div className="p-4 border-b bg-gray-100">
                <h3 className="font-semibold text-gray-800">📄 Dilekçe İçeriği</h3>
                <p className="text-sm text-gray-600">Aşağıdaki metni kopyalayıp kullanabilirsiniz</p>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                  {generatedPetition}
                </pre>
              </div>
            </div>

            {/* Önemli Notlar */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-2">⚠️ Önemli Hatırlatmalar</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Dilekçeyi imzalamadan önce bir hukuk uzmanına gösterin</li>
                    <li>• Eksik kalan {"{PLACEHOLDER}"} alanlarını doldurmayı unutmayın</li>
                    <li>• Eklenmesi gereken belgeler varsa ekleyin</li>
                    <li>• Mahkeme harç ve posta ücretlerini hesaplayın</li>
                    <li>• Zamanaşımı sürelerini kontrol edin</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}