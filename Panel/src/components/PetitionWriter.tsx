import { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Copy, 
  Edit3, 
  Eye, 
  Star, 
  Clock, 
  Users, 
  BookOpen, 
  Wand2, 
  RefreshCw,
  Brain
} from 'lucide-react';
import { 
  petitionTemplates, 
  petitionCategories, 
  getPetitionsByCategory, 
  getPetitionsBySubcategory, 
  searchPetitions,
  type PetitionTemplate 
} from '../data/petitions/petitionDatabase';
import { geminiService } from '../services/geminiService';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'number' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[];
  value: string;
}

interface GeneratedPetition {
  content: string;
  metadata: {
    templateId: string;
    generatedAt: string;
    aiModel: string;
    wordCount: number;
  };
}

export default function PetitionWriter() {
  const [selectedTemplate, setSelectedTemplate] = useState<PetitionTemplate | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [generatedPetition, setGeneratedPetition] = useState<GeneratedPetition | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'templates' | 'create' | 'preview'>('templates');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating' | 'alphabetical'>('popular');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  // Filtrelenmiş şablonlar
  const filteredTemplates = useMemo(() => {
    let templates = petitionTemplates;

    // Kategori filtresi
    if (selectedCategory) {
      templates = getPetitionsByCategory(selectedCategory);
      
      // Alt kategori filtresi
      if (selectedSubcategory) {
        templates = getPetitionsBySubcategory(selectedCategory, selectedSubcategory);
      }
    }

    // Arama filtresi
    if (searchQuery) {
      templates = searchPetitions(searchQuery);
    }

    // Sıralama
    switch (sortBy) {
      case 'popular':
        templates = templates.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'recent':
        templates = templates.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      case 'rating':
        templates = templates.sort((a, b) => b.rating - a.rating);
        break;
      case 'alphabetical':
        templates = templates.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return templates;
  }, [selectedCategory, selectedSubcategory, searchQuery, sortBy]);

  // Form alanlarını oluştur
  const createFormFields = (template: PetitionTemplate): FormField[] => {
    return template.requiredFields.map((field, index) => ({
      id: `field_${index}`,
      label: field,
      type: field.toLowerCase().includes('tarih') ? 'date' : 
            field.toLowerCase().includes('miktar') || field.toLowerCase().includes('tutar') ? 'number' :
            field.toLowerCase().includes('açıklama') || field.toLowerCase().includes('detay') ? 'textarea' : 'text',
      required: true,
      placeholder: `${field} girin...`,
      value: ''
    }));
  };

  // Şablon seçildiğinde form alanlarını oluştur ve AI önerilerini al
  useEffect(() => {
    if (selectedTemplate) {
      const fields = createFormFields(selectedTemplate);
      setFormFields(fields);
      setActiveTab('create');
      getAISuggestions();
    }
  }, [selectedTemplate]);

  // Form alanı değerini güncelle
  const updateFieldValue = (fieldId: string, value: string) => {
    setFormFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, value } : field
    ));
  };

  // AI ile dilekçe oluştur
  const generatePetition = async () => {
    if (!selectedTemplate || formFields.some(field => field.required && !field.value.trim())) {
      alert('Lütfen tüm gerekli alanları doldurun.');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `
Sen Türkiye'de çalışan deneyimli bir avukatsın. Aşağıdaki bilgileri kullanarak profesyonel bir dilekçe oluştur:

DİLEKÇE BİLGİLERİ:
- Başlık: ${selectedTemplate.title}
- Kategori: ${selectedTemplate.category} - ${selectedTemplate.subcategory}
- Hukuki Dayanak: ${selectedTemplate.legalBasis.join(', ')}
- Mahkeme Türü: ${selectedTemplate.courtType}
- Tahmini Süre: ${selectedTemplate.estimatedTime}
- Zorluk Seviyesi: ${selectedTemplate.difficulty}

KULLANICI VERİLERİ:
${formFields.map(field => `• ${field.label}: ${field.value || '[Boş]'}`).join('\n')}

ŞABLON İÇERİĞİ:
${selectedTemplate.content}

GÖREVLERİN:
1. Form verilerini şablon içeriğine profesyonelce yerleştir
2. Türk hukuk sistemine uygun terminoloji kullan
3. Resmi ve profesyonel dil kullan
4. Eksik bilgileri [Köşeli parantez] ile işaretle
5. Dilekçe formatını koru
6. Hukuki dayanakları doğru kullan
7. Mahkeme adresini uygun şekilde düzenle
8. Dilekçeyi tam ve eksiksiz hale getir
9. Hukuki açıdan güçlü argümanlar kullan
10. Sonuç ve talep kısmını net şekilde belirt

ÖNEMLİ: 
- Sadece dilekçe içeriğini döndür, açıklama veya yorum ekleme
- Dilekçe tamamen hazır ve kullanıma uygun olmalı
- Türk hukuk sistemine uygun format kullan
- Profesyonel ve resmi dil kullan
- Hukuki dayanakları doğru şekilde uygula
      `;

      const response = await geminiService.analyzeText(prompt);
      const content = response || 'Dilekçe oluşturulamadı. Lütfen tekrar deneyin.';

      setGeneratedPetition({
        content,
        metadata: {
          templateId: selectedTemplate.id,
          generatedAt: new Date().toISOString(),
          aiModel: 'gemini',
          wordCount: content.split(' ').length
        }
      });

      setActiveTab('preview');
    } catch (error) {
      console.error('Dilekçe oluşturma hatası:', error);
      alert('Dilekçe oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsGenerating(false);
    }
  };

  // AI ile öneriler al
  const getAISuggestions = async () => {
    if (!selectedTemplate) return;
    
    setIsGeneratingSuggestions(true);
    try {
      const prompt = `
Sen Türkiye'de çalışan deneyimli bir avukatsın. Aşağıdaki dilekçe şablonu için profesyonel öneriler ver:

ŞABLON BİLGİLERİ:
- Başlık: ${selectedTemplate.title}
- Kategori: ${selectedTemplate.category} - ${selectedTemplate.subcategory}
- Hukuki Dayanak: ${selectedTemplate.legalBasis.join(', ')}
- Mahkeme Türü: ${selectedTemplate.courtType}
- Zorluk Seviyesi: ${selectedTemplate.difficulty}

GÖREVİN:
Bu dilekçe türü için 5 adet profesyonel öneri ver. Her öneri:
1. Hukuki açıdan önemli bir nokta
2. Pratik bir ipucu
3. Dikkat edilmesi gereken bir husus
4. Başarı şansını artıran bir faktör
5. Yaygın hata veya eksiklik

Önerileri kısa ve net şekilde ver. Her öneri maksimum 2 cümle olsun.
      `;

      const response = await geminiService.analyzeText(prompt);
      if (response) {
        const suggestions = response.split('\n').filter(line => line.trim()).slice(0, 5);
        setAiSuggestions(suggestions);
      }
    } catch (error) {
      console.error('AI önerileri alma hatası:', error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  // Dilekçeyi kopyala
  const copyToClipboard = async () => {
    if (generatedPetition) {
      try {
        await navigator.clipboard.writeText(generatedPetition.content);
        alert('Dilekçe panoya kopyalandı!');
      } catch (error) {
        console.error('Kopyalama hatası:', error);
      }
    }
  };

  // Dilekçeyi indir
  const downloadPetition = () => {
    if (generatedPetition) {
      const blob = new Blob([generatedPetition.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate?.title || 'dilekce'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg md:rounded-xl shadow-lg">
              <FileText className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Dilekçe Yazım Sistemi
            </h1>
            <div className="flex items-center gap-1 md:gap-2">
              <div className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                AI Destekli
          </div>
        </div>
            </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-lg">
            Profesyonel dilekçe şablonları ve AI destekli oluşturma
          </p>
          </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2">
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: 'templates', label: 'Şablonlar', icon: BookOpen },
                { id: 'create', label: 'Oluştur', icon: Edit3 },
                { id: 'preview', label: 'Önizleme', icon: Eye }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-orange-600 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
          </div>
        </div>
      </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="max-w-6xl mx-auto">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
              <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                      placeholder="Dilekçe ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2">
              <select
                value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedSubcategory('');
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="">Tüm Kategoriler</option>
                    {Object.keys(petitionCategories).map(category => (
                      <option key={category} value={category}>{category}</option>
                ))}
              </select>

                  {selectedCategory && (
                    <select
                      value={selectedSubcategory}
                      onChange={(e) => setSelectedSubcategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option value="">Tüm Alt Kategoriler</option>
                      {selectedCategory && petitionCategories[selectedCategory as keyof typeof petitionCategories] ? 
                        Object.keys(petitionCategories[selectedCategory as keyof typeof petitionCategories]).map(subcategory => (
                          <option key={subcategory} value={subcategory}>{subcategory}</option>
                        )) : null}
                    </select>
                  )}

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="popular">Popüler</option>
                    <option value="recent">En Yeni</option>
                    <option value="rating">En Yüksek Puan</option>
                    <option value="alphabetical">Alfabetik</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-800"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-1 line-clamp-2">
                        {template.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                          {template.category}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                          {template.subcategory}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{template.rating}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{template.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{template.usageCount}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full ${
                      template.difficulty === 'Kolay' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      template.difficulty === 'Orta' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {template.difficulty}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.keywords.slice(0, 3).map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>

                  <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Kullan
                  </button>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">Arama kriterlerinize uygun şablon bulunamadı</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  Farklı anahtar kelimeler deneyin veya filtreleri temizleyin
                </p>
          </div>
        )}
      </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && selectedTemplate && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
              <div className="flex items-center justify-between mb-6">
            <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {selectedTemplate.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedTemplate.category} - {selectedTemplate.subcategory}
                  </p>
            </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                    AI Destekli
              </div>
            </div>
          </div>

              <div className="space-y-4">
              {formFields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                      <textarea
                        value={field.value}
                        onChange={(e) => updateFieldValue(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      />
                  ) : field.type === 'select' ? (
                    <select
                        value={field.value}
                        onChange={(e) => updateFieldValue(field.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Seçin...</option>
                      {field.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                        value={field.value}
                        onChange={(e) => updateFieldValue(field.id, e.target.value)}
                      placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  )}
                </div>
              ))}
              </div>

              {/* AI Önerileri */}
              {aiSuggestions.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1 bg-blue-600 rounded">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">AI Önerileri</h4>
                  </div>
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isGeneratingSuggestions && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI önerileri alınıyor...</span>
                  </div>
                </div>
              )}

              <div className="mt-8 flex gap-4">
            <button
                  onClick={generatePetition}
                  disabled={isGenerating || formFields.some(field => field.required && !field.value.trim())}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Oluşturuluyor...
                </>
              ) : (
                <>
                      <Wand2 className="w-4 h-4" />
                      AI ile Oluştur
                </>
              )}
            </button>
                <button
                  onClick={() => setActiveTab('templates')}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Geri
                </button>
              </div>
          </div>
        </div>
      )}

        {/* Preview Tab */}
        {activeTab === 'preview' && generatedPetition && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Dilekçe Önizleme
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {generatedPetition.metadata.wordCount} kelime • {new Date(generatedPetition.metadata.generatedAt).toLocaleString('tr-TR')}
                  </p>
                </div>
                <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                    <Copy className="w-4 h-4" />
                    Kopyala
              </button>
              <button
                onClick={downloadPetition}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    İndir
              </button>
            </div>
          </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 md:p-6">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed">
                  {generatedPetition.content}
                </pre>
            </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => setActiveTab('templates')}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Yeni Şablon
                </button>
                </div>
              </div>
            </div>
        )}

        {/* Empty State */}
        {activeTab === 'create' && !selectedTemplate && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Şablon Seçin
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Dilekçe oluşturmak için önce bir şablon seçmeniz gerekiyor
              </p>
              <button
                onClick={() => setActiveTab('templates')}
                className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded-lg transition-colors"
              >
                Şablonları Görüntüle
              </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}