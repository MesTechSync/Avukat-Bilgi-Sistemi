import { useState, useMemo } from 'react';
import { FileText, Wand2, Download, Copy, RefreshCw, Search, BookOpen, Star, Users, Calendar, DollarSign, Sparkles, AlertTriangle, CheckSquare, Zap } from 'lucide-react';
import { 
  combinedPetitionDatabase,
  searchCombinedByCategory,
  searchCombinedByKeyword,
  type PetitionExample
} from '../data/petitionExamples';
import { useDictation } from '../hooks/useDictation';
import DictationButton from './DictationButton';
import { realPetitions, type RealPetition } from '../data/realPetitions';
import { geminiService } from '../services/geminiService';
import { openaiService } from '../services/openaiService';

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

export default function PetitionWriter() {
  const [selectedExample, setSelectedExample] = useState<PetitionExample | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [generatedPetition, setGeneratedPetition] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showExamples, setShowExamples] = useState(false);
  const [aiModel, setAIModel] = useState<AIModel>('auto');
  const [useAI, setUseAI] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Dikte hook'u - form alanları için
  const {
    isListening: isDictating,
    isSupported: isDictationSupported,
    interimText: dictationInterimText,
    startDictation,
    stopDictation,
    clearDictation
  } = useDictation({
    onResult: (text) => {
      // Aktif form alanına dikte metnini ekle
      const activeField = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
      if (activeField && (activeField.tagName === 'INPUT' || activeField.tagName === 'TEXTAREA')) {
        const fieldId = activeField.id;
        if (fieldId && fieldId.startsWith('field-')) {
          const fieldKey = fieldId.replace('field-', '');
          setFormData(prev => ({
            ...prev,
            [fieldKey]: (prev[fieldKey] || '') + (prev[fieldKey] ? ' ' : '') + text
          }));
        }
      }
      clearDictation();
    },
    onError: (error) => {
      console.error('Dikte hatası:', error);
    },
    continuous: false,
    interimResults: true
  });

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

  // AI ile dilekçe oluşturma
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
        // Gerçek AI servislerini kullan
        const realExample = realPetitions.find(r => r.id === selectedExample.id);
        const prompt = buildAIPrompt(selectedExample.title, formData, realExample);
        
        if (aiModel === 'auto') {
          // Otomatik seçim: Gemini ve OpenAI'yi karşılaştır
          const promises = [];
          
          if (geminiService.isInitialized()) {
            promises.push(
              geminiService.analyzeText('Dilekçe yazımı', prompt)
                .then(result => ({ type: 'gemini', result }))
                .catch(error => ({ type: 'gemini', result: `Gemini hatası: ${error.message}` }))
            );
          }
          
          if (openaiService.isInitialized()) {
            promises.push(
              openaiService.generateContract({
                contractType: selectedExample.title,
                description: prompt,
                requirements: ['Dilekçe yazımı'],
                parties: ['Davacı', 'Davalı'],
                additionalInfo: 'Bu bir mahkeme dilekçesi. Türk hukuk sistemine uygun profesyonel dilekçe yaz.'
              })
              .then(result => ({ type: 'openai', result }))
              .catch(error => ({ type: 'openai', result: `OpenAI hatası: ${error.message}` }))
            );
          }
          
          if (promises.length === 0) {
            // AI servisleri aktif değilse template-based generation'a geç
            generated = generateFromTemplate(selectedExample, formData);
          } else {
            const results = await Promise.all(promises);
            
            // En iyi sonucu seç (daha uzun ve detaylı olanı)
            let bestResult = '';
            let bestLength = 0;
            
            results.forEach(result => {
              if (result.result.length > bestLength) {
                bestResult = result.result;
                bestLength = result.result.length;
              }
            });
            
            generated = bestResult || generateFromTemplate(selectedExample, formData);
          }
        } else {
          // Belirli model seçimi
          if (aiModel === 'gemini' && geminiService.isInitialized()) {
            generated = await geminiService.analyzeText('Dilekçe yazımı', prompt);
          } else if (aiModel === 'gpt-4' && openaiService.isInitialized()) {
            generated = await openaiService.generateContract({
              contractType: selectedExample.title,
              description: prompt,
              requirements: ['Dilekçe yazımı'],
              parties: ['Davacı', 'Davalı'],
              additionalInfo: 'Bu bir mahkeme dilekçesi. Türk hukuk sistemine uygun profesyonel dilekçe yaz.'
            });
          } else {
            // Seçilen model aktif değilse template-based generation'a geç
            generated = generateFromTemplate(selectedExample, formData);
          }
        }
      } else {
        // Template-based generation
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

  // Template-based generation (fallback)
  const generateFromTemplate = (example: PetitionExample, formData: FormData): string => {
    let template = (example as any).template || (example as any).content || '';
    
    // Form verilerini template'e yerleştir
    Object.entries(formData).forEach(([key, value]) => {
      const placeholder = `{${key.toUpperCase()}}`;
      template = template.replace(new RegExp(placeholder, 'g'), value);
    });
    
    return template;
  };

  // Form doğrulama
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    formFields.forEach(field => {
      if (field.required && !formData[field.id]?.trim()) {
        errors[field.id] = `${field.label} alanı zorunludur`;
      }
    });
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Filtrelenmiş örnekler
  const getFilteredExamples = () => {
    let filtered = combinedPetitionDatabase;
    
    if (searchTerm) {
      filtered = searchCombinedByKeyword(searchTerm);
    }
    
    if (selectedCategory) {
      filtered = searchCombinedByCategory(selectedCategory);
    }
    
    return filtered;
  };

  // Field icon helper function
  const getFieldIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'text':
        return Users;
      case 'number':
        return DollarSign;
      case 'date':
        return Calendar;
      case 'textarea':
        return FileText;
      case 'select':
        return CheckSquare;
      default:
        return FileText;
    }
  };

  const handleFormChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[key]) {
      setFieldErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const categories = [...new Set(combinedPetitionDatabase.map(ex => ex.category))];

  // Dinamik form alanları oluştur (Geliştirilmiş)
  const generateFormFields = (example: PetitionExample): PetitionField[] => {
    const fields: PetitionField[] = [];
    
    // Temel alanlar - her dilekçe için gerekli
    const basicFields: PetitionField[] = [
      {
        id: 'davaci_adi',
        label: 'Davacı Adı Soyadı',
        type: 'text',
        required: true,
        placeholder: 'Ad Soyad girin'
      },
      {
        id: 'davaci_tc',
        label: 'Davacı T.C. Kimlik No',
        type: 'text',
        required: true,
        placeholder: '11 haneli T.C. kimlik numarası'
      },
      {
        id: 'davaci_adres',
        label: 'Davacı Adresi',
        type: 'textarea',
        required: true,
        placeholder: 'Tam adres bilgisi girin'
      },
      {
        id: 'davali_adi',
        label: 'Davalı Adı Soyadı',
        type: 'text',
        required: true,
        placeholder: 'Ad Soyad girin'
      },
      {
        id: 'davali_tc',
        label: 'Davalı T.C. Kimlik No',
        type: 'text',
        required: false,
        placeholder: '11 haneli T.C. kimlik numarası'
      },
      {
        id: 'davali_adres',
        label: 'Davalı Adresi',
        type: 'textarea',
        required: false,
        placeholder: 'Tam adres bilgisi girin'
      }
    ];

    // Örneğin variables'ından ek alanlar oluştur
    example.variables.forEach((variable, index) => {
      const fieldId = variable.toLowerCase().replace(/[^a-z0-9]/g, '_');
      let fieldType: PetitionField['type'] = 'text';
      let placeholder = '';
      
      // Akıllı tip tanıma
      if (variable.includes('TARİH') || variable.includes('DATE')) {
        fieldType = 'date';
        placeholder = 'Tarih seçin';
      } else if (variable.includes('TUTAR') || variable.includes('MAAŞ') || variable.includes('ÜCRET') || variable.includes('TL')) {
        fieldType = 'number';
        placeholder = 'Tutarı TL olarak girin (örn: 15000)';
      } else if (variable.includes('ADRES') || variable.includes('AÇIKLAMA') || variable.includes('DETAY') || variable.includes('SEBEP')) {
        fieldType = 'textarea';
        placeholder = 'Detaylı açıklama girin';
      } else if (variable.includes('CİNSİYET') || variable.includes('DURUM') || variable.includes('TİP')) {
        fieldType = 'select';
      }
      
      // Temel alanlarda yoksa ekle
      if (!basicFields.some(f => f.id === fieldId)) {
        fields.push({
          id: fieldId,
          label: variable.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
          type: fieldType,
          required: index < 3, // İlk 3 ek alan zorunlu
          placeholder: placeholder || `${variable.replace(/_/g, ' ').toLowerCase()} bilgisini girin`,
          ...(fieldType === 'select' && variable.includes('CİNSİYET') && {
            options: ['Erkek', 'Kadın']
          }),
          ...(fieldType === 'select' && variable.includes('DURUM') && {
            options: ['Evli', 'Bekar', 'Boşanmış', 'Dul']
          }),
          ...(fieldType === 'select' && variable.includes('TİP') && {
            options: ['Bireysel', 'Kurumsal', 'Kamu']
          })
        });
      }
    });
    
    return [...basicFields, ...fields];
  };

  // Seçilen örnek için dinamik form alanları
  const formFields = useMemo(() => {
    if (!selectedExample) return [];
    return generateFormFields(selectedExample);
  }, [selectedExample]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 flex justify-end gap-2">
              <button
                onClick={() => setShowExamples(!showExamples)}
                className="p-3 bg-blue-500/80 dark:bg-blue-600/80 backdrop-blur-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200 dark:border-blue-700 text-white"
                title="Dilekçe Örnekleri"
              >
                <BookOpen className="w-5 h-5" />
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Destekli Dilekçe Yazım Sistemi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gemini ve OpenAI ile profesyonel mahkeme dilekçelerinizi oluşturun
          </p>
          
          {/* AI Status */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50">
              <div className={`w-3 h-3 rounded-full ${geminiService.isInitialized() ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gemini</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50">
              <div className={`w-3 h-3 rounded-full ${openaiService.isInitialized() ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">OpenAI</span>
            </div>
          </div>
        </div>

        {/* Dilekçe Örnekleri Seçimi */}
        {!selectedExample && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Dilekçe Türü Seçin
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Model:</label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAIModel(e.target.value as AIModel)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                  >
                    <option value="auto">🤖 Otomatik</option>
                    <option value="gemini">✨ Gemini</option>
                    <option value="gpt-4">⚡ GPT-4</option>
                  </select>
                </div>
                <button
                  onClick={() => setUseAI(!useAI)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    useAI 
                      ? 'bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700' 
                      : 'bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                  }`}
                >
                  {useAI ? '✓ AI Aktif' : '✗ AI Pasif'}
                </button>
              </div>
            </div>
            
            {/* Arama ve Filtre */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Dilekçe ara... (örn: işten çıkarma, boşanma, trafik)"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                title="Kategori Seçimi"
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredExamples().map((example) => (
                <div
                  key={example.id}
                  onClick={() => setSelectedExample(example)}
                  className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden hover:scale-105"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-sm leading-tight">
                          {example.title}
                        </h4>
                        <p className="text-blue-100 text-xs mt-1">
                          {example.category}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                      {(example as any).description || (example as any).content || 'Profesyonel dilekçe örneği'}
                    </div>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {example.variables.length} alan
                        </span>
                        <span className="flex items-center gap-1">
                          <Wand2 className="w-3 h-3" />
                          AI destekli
                        </span>
                      </div>
                      {realPetitions.some(r => r.id === example.id) && (
                        <div className="flex items-center gap-1 text-orange-600 text-xs">
                          <Star className="w-3 h-3" />
                          <span>Gerçek örnek</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Bilgileri */}
        {selectedExample && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      Dilekçe Bilgileri
                    </h3>
                    <p className="text-blue-100 text-sm">
                      Lütfen aşağıdaki bilgileri eksiksiz doldurun
                    </p>
                  </div>
                </div>
                
                {/* AI Ayarları */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-white">AI Model:</label>
                    <select
                      value={aiModel}
                      onChange={(e) => setAIModel(e.target.value as AIModel)}
                      className="px-3 py-1 border border-white/30 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/20 text-white"
                    >
                      <option value="auto" className="text-gray-900">🤖 Otomatik</option>
                      <option value="gemini" className="text-gray-900">✨ Gemini</option>
                      <option value="gpt-4" className="text-gray-900">⚡ GPT-4</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setUseAI(!useAI)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      useAI 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {useAI ? '✓ AI Aktif' : '✗ AI Pasif'}
                  </button>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              {/* Seçilen Dilekçe Bilgisi */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  {realPetitions.some(r => r.id === selectedExample.id) ? (
                    <Star className="h-5 w-5 text-orange-500 mt-1" />
                  ) : (
                    <CheckSquare className="h-5 w-5 text-blue-500 mt-1" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{selectedExample.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{selectedExample.category}</p>
                    {selectedExample.subcategory && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">{selectedExample.subcategory}</p>
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

            {/* Form Alanları */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {formFields.map((field) => {
                const IconComponent = getFieldIcon(field.type);
                const inputId = `field-${field.id}`;
                return (
                  <div key={field.id}>
                    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <IconComponent className="w-4 h-4 inline mr-2" />
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'textarea' ? (
                      <div className="relative">
                        <textarea
                          id={inputId}
                          value={(formData[field.id] || '') + (dictationInterimText ? ' ' + dictationInterimText : '')}
                          onChange={(e) => handleFormChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                          className={`w-full px-4 py-3 border-2 ${fieldErrors[field.id] ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white pr-12 transition-all duration-300`}
                        />
                        <div className="absolute right-3 top-3">
                          <DictationButton
                            isListening={isDictating}
                            isSupported={isDictationSupported}
                            onStart={startDictation}
                            onStop={stopDictation}
                            size="sm"
                            title="Sesli yazım"
                          />
                        </div>
                      </div>
                    ) : field.type === 'select' ? (
                      <select
                        id={inputId}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFormChange(field.id, e.target.value)}
                        className={`w-full px-4 py-3 border-2 ${fieldErrors[field.id] ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white transition-all duration-300`}
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
                        id={inputId}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFormChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className={`w-full px-4 py-3 border-2 ${fieldErrors[field.id] ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white transition-all duration-300`}
                      />
                    )}
                    
                    {fieldErrors[field.id] && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors[field.id]}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Generate Button */}
            <div className="mt-6">
              <button
                onClick={generateAIPetition}
                disabled={isGenerating}
                className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-4 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span>AI Dilekçe Oluşturuyor...</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-6 w-6" />
                    <span>🤖 AI ile Profesyonel Dilekçe Oluştur</span>
                    <Zap className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
            </div>
          </div>
        )}

        {/* Oluşturulan Dilekçe */}
        {generatedPetition && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mt-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Oluşturulan Dilekçe</h3>
                    <p className="text-green-100 text-sm">AI tarafından oluşturuldu</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedPetition)}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    title="Kopyala"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([generatedPetition], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${selectedExample?.title || 'dilekce'}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    title="İndir"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed">
                  {generatedPetition}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}