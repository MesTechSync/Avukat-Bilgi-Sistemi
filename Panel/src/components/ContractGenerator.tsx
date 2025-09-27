import { useState, useEffect, useMemo, useRef } from 'react';
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
  Brain,
  MessageCircle,
  Bot,
  Save,
  Target,
  Play,
  TrendingUp,
  Mic,
  MicOff,
  Send
} from 'lucide-react';
import { 
  contractTemplates, 
  contractCategories, 
  getContractsByCategory, 
  getContractsBySubcategory, 
  searchContracts,
  type ContractTemplate 
} from '../data/contracts/contractDatabase';
import { geminiService } from '../services/geminiService';
import { useDictation } from '../hooks/useDictation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'number' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[];
  value: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'contract' | 'template' | 'suggestion';
  metadata?: {
    wordCount?: number;
    category?: string;
    confidence?: number;
  };
}

interface ContractTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  createdAt: string;
  usageCount: number;
  tags: string[];
  description: string;
}

interface GeneratedContract {
  content: string;
  metadata: {
    templateId: string;
    generatedAt: string;
    aiModel: string;
    wordCount: number;
    chatHistory: ChatMessage[];
    category: string;
    confidence: number;
    suggestions: string[];
  };
}

export default function ContractGenerator() {
  // Chat state'leri
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🌟 **Merhaba! Ben Avukat Bilgi Sistemi\'nin Gelişmiş Sözleşme Yazım Asistanıyım!**\n\n✨ **Özelliklerim:**\n• 🧠 Derin düşünme ve analiz\n• 📚 Türk hukuku uzmanlığı\n• 🎯 Kişiselleştirilmiş sözleşmeler\n• 💾 Şablon kaydetme sistemi\n• 🔄 Sürekli öğrenme\n\n💬 **Nasıl çalışırım:**\n1. Sözleşme türünüzü belirtin\n2. Detayları açıklayın\n3. Ben size profesyonel sözleşme hazırlarım\n4. Beğendiğiniz sözleşmeyi şablon olarak kaydedebilirsiniz\n\n🚀 **Hangi konuda sözleşme yazmak istiyorsunuz?**',
      timestamp: new Date().toISOString(),
      type: 'text'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContract, setGeneratedContract] = useState<GeneratedContract | null>(null);
  
  // Şablon state'leri
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  
  // AI özellikleri
  const [aiMode] = useState<'gemini' | 'claude' | 'auto'>('auto');
  
  // Sesli yazım state'leri
  const { isListening, startDictation, stopDictation, interimText } = useDictation();
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  
  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const contractRef = useRef<HTMLDivElement>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'chat' | 'templates' | 'settings' | 'ai-create' | 'preview'>('chat');
  
  // Eski state'ler (uyumluluk için)
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating' | 'alphabetical'>('popular');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  
  // AI ile sıfırdan oluşturma için state'ler
  const [aiCreateData, setAiCreateData] = useState({
    contractType: '',
    description: '',
    parties: '',
    terms: '',
    legalBasis: '',
    duration: '',
    payment: '',
    conditions: ''
  });
  const [isGeneratingFromScratch, setIsGeneratingFromScratch] = useState(false);

  // Chat scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Sesli yazım için input güncelleme
  useEffect(() => {
    if (interimText && isVoiceMode) {
      setChatInput(interimText);
    }
  }, [interimText, isVoiceMode]);

  // Sesli yazım toggle
  const toggleVoiceInput = () => {
    if (isListening) {
      stopDictation();
      setIsVoiceMode(false);
    } else {
      startDictation();
      setIsVoiceMode(true);
    }
  };

  // AI ile gelişmiş prompt oluştur
  const getAdvancedPrompt = (userMessage: string, chatHistory: ChatMessage[]) => {
    const historyContext = chatHistory.slice(-6).map(msg => 
      `${msg.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${msg.content}`
    ).join('\n');

    return `
Sen Türkiye'de çalışan deneyimli bir avukatsın ve sözleşme yazım konusunda uzmanlaşmışsın. Aşağıdaki kullanıcı mesajını analiz et ve profesyonel bir sözleşme oluştur.

KULLANICI MESAJI: ${userMessage}

CHAT GEÇMİŞİ:
${historyContext}

GÖREVLERİN:
1. Kullanıcının ihtiyacını analiz et
2. Sözleşme türünü belirle
3. Profesyonel bir sözleşme oluştur
4. Türk hukuk sistemine uygun terminoloji kullan
5. Resmi ve profesyonel dil kullan
6. Sözleşme maddelerini numaralı ve düzenli şekilde organize et
7. Hukuki dayanakları doğru kullan
8. Sözleşmeyi tam ve eksiksiz hale getir
9. İmza kısmını net şekilde belirt

YANIT FORMATI:
ANALİZ: [Kullanıcının ihtiyacının analizi]
SÖZLEŞME: [Tam sözleşme içeriği]
KATEGORİ: [Sözleşme kategorisi]
ETİKETLER: [Etiketler, virgülle ayrılmış]
ÖNERİLER: [Ek öneriler, virgülle ayrılmış]

ÖNEMLİ: 
- Sadece yukarıdaki formatı kullan
- Sözleşme tamamen hazır ve kullanıma uygun olmalı
- Türk hukuk sistemine uygun format kullan
- Profesyonel ve resmi dil kullan
- Hukuki dayanakları doğru şekilde uygula
- Sözleşme maddelerini numaralı ve düzenli şekilde organize et
- Sözleşme sonunda imza kısmını ekle
    `;
  };

  // AI ile sözleşme oluştur
  const generateContractWithAI = async (userMessage: string) => {
    setIsGenerating(true);
    try {
      const prompt = getAdvancedPrompt(userMessage, chatMessages);
      const response = await geminiService.analyzeText(prompt);
      
      if (response) {
        // Response'u parse et
        const analysisMatch = response.match(/ANALİZ:\s*(.*?)(?=SÖZLEŞME:|$)/s);
        const contractMatch = response.match(/SÖZLEŞME:\s*(.*?)(?=KATEGORİ:|$)/s);
        const categoryMatch = response.match(/KATEGORİ:\s*(.*?)(?=ETİKETLER:|$)/s);
        const tagsMatch = response.match(/ETİKETLER:\s*(.*?)(?=ÖNERİLER:|$)/s);
        const suggestionsMatch = response.match(/ÖNERİLER:\s*(.*?)$/s);

        const analysis = analysisMatch?.[1]?.trim() || 'Analiz yapılamadı';
        const contractContent = contractMatch?.[1]?.trim() || 'Sözleşme oluşturulamadı';
        const category = categoryMatch?.[1]?.trim() || 'Genel';
        const tags = tagsMatch?.[1]?.trim().split(',').map(tag => tag.trim()) || [];
        const suggestions = suggestionsMatch?.[1]?.trim().split(',').map(suggestion => suggestion.trim()) || [];

        // Chat mesajlarını güncelle
        const assistantMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `📋 **Sözleşme Analizi:**\n${analysis}\n\n📄 **Oluşturulan Sözleşme:**\n${contractContent}`,
          timestamp: new Date().toISOString(),
          type: 'contract',
          metadata: {
            wordCount: contractContent.split(' ').length,
            category,
            confidence: 0.9
          }
        };

        setChatMessages(prev => [...prev, assistantMessage]);

        // Generated contract'ı güncelle
        setGeneratedContract({
          content: contractContent,
          metadata: {
            templateId: 'ai-generated',
            generatedAt: new Date().toISOString(),
            aiModel: 'gemini',
            wordCount: contractContent.split(' ').length,
            chatHistory: [...chatMessages, assistantMessage],
            category,
            confidence: 0.9,
            suggestions
          }
        });
      }
    } catch (error) {
      console.error('Sözleşme oluşturma hatası:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '❌ **Hata:** Sözleşme oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Mesaj gönder
  const handleSendMessage = () => {
    if (!chatInput.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    generateContractWithAI(chatInput.trim());
  };

  // Şablon kaydetme fonksiyonları
  const saveAsTemplate = (contract: GeneratedContract, templateName: string) => {
    const newTemplate: ContractTemplate = {
      id: Date.now().toString(),
      name: templateName,
      category: contract.metadata.category,
      content: contract.content,
      createdAt: new Date().toISOString(),
      usageCount: 0,
      tags: contract.metadata.suggestions,
      description: `${contract.metadata.category} kategorisinde ${contract.metadata.wordCount} kelimelik sözleşme şablonu`
    };
    
    setTemplates(prev => [...prev, newTemplate]);
    setShowTemplateModal(false);
    setTemplateName('');
    
    // Başarı mesajı
    const successMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `✅ **Şablon başarıyla kaydedildi!**\n\n📋 **Şablon Adı:** ${templateName}\n📂 **Kategori:** ${contract.metadata.category}\n📊 **Kelime Sayısı:** ${contract.metadata.wordCount}\n🏷️ **Etiketler:** ${contract.metadata.suggestions.join(', ')}\n\nArtık bu şablonu "Şablonlar" sekmesinden kullanabilirsiniz!`,
      timestamp: new Date().toISOString(),
      type: 'template'
    };
    
    setChatMessages(prev => [...prev, successMessage]);
  };

  const openTemplateModal = () => {
    if (generatedContract) {
      setShowTemplateModal(true);
    }
  };

  // Sözleşmeyi kopyala
  const copyToClipboard = async () => {
    if (generatedContract) {
      try {
        await navigator.clipboard.writeText(generatedContract.content);
        alert('Sözleşme panoya kopyalandı!');
      } catch (error) {
        console.error('Kopyalama hatası:', error);
        alert('Kopyalama başarısız oldu.');
      }
    }
  };

  // Sözleşmeyi PDF olarak indir
  const downloadContractAsPDF = async () => {
    if (generatedContract && contractRef.current) {
      try {
        const canvas = await html2canvas(contractRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        const fileName = `Sozlesme_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
      } catch (error) {
        console.error('PDF oluşturma hatası:', error);
        alert('PDF oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  // Filtrelenmiş şablonlar
  const filteredTemplates = useMemo(() => {
    let templates = contractTemplates;

    // Kategori filtresi
    if (selectedCategory) {
      templates = getContractsByCategory(selectedCategory);
      
      // Alt kategori filtresi
      if (selectedSubcategory) {
        templates = getContractsBySubcategory(selectedCategory, selectedSubcategory);
      }
    }

    // Arama filtresi
    if (searchQuery) {
      templates = searchContracts(searchQuery);
    }

    // Sıralama
    switch (sortBy) {
      case 'popular':
        templates = templates.sort((a: ContractTemplate, b: ContractTemplate) => b.usageCount - a.usageCount);
        break;
      case 'recent':
        templates = templates.sort((a: ContractTemplate, b: ContractTemplate) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      case 'rating':
        templates = templates.sort((a: ContractTemplate, b: ContractTemplate) => b.rating - a.rating);
        break;
      case 'alphabetical':
        templates = templates.sort((a: ContractTemplate, b: ContractTemplate) => a.title.localeCompare(b.title));
        break;
    }

    return templates;
  }, [selectedCategory, selectedSubcategory, searchQuery, sortBy]);

  // Form alanlarını oluştur
  const createFormFields = (template: ContractTemplate): FormField[] => {
    return template.requiredFields.map((field: string, index: number) => ({
      id: `field_${index}`,
      label: field,
      type: field.toLowerCase().includes('tarih') ? 'date' : 
            field.toLowerCase().includes('miktar') || field.toLowerCase().includes('tutar') || field.toLowerCase().includes('bedel') ? 'number' :
            field.toLowerCase().includes('açıklama') || field.toLowerCase().includes('detay') || field.toLowerCase().includes('adres') ? 'textarea' : 'text',
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

  // AI ile sıfırdan sözleşme oluştur
  const generateContractFromScratch = async () => {
    if (!aiCreateData.contractType || !aiCreateData.description || !aiCreateData.parties || !aiCreateData.terms) {
      alert('Lütfen tüm gerekli alanları doldurun.');
      return;
    }

    setIsGeneratingFromScratch(true);
    try {
      const prompt = `
Sen Türkiye'de çalışan deneyimli bir avukatsın. Aşağıdaki bilgileri kullanarak profesyonel bir sözleşme oluştur:

SÖZLEŞME BİLGİLERİ:
- Sözleşme Türü: ${aiCreateData.contractType}
- Açıklama: ${aiCreateData.description}
- Taraflar: ${aiCreateData.parties}
- Şartlar: ${aiCreateData.terms}
- Hukuki Dayanak: ${aiCreateData.legalBasis || 'İlgili mevzuat hükümleri'}
- Süre: ${aiCreateData.duration || 'Belirtilmemiş'}
- Ödeme: ${aiCreateData.payment || 'Belirtilmemiş'}
- Özel Şartlar: ${aiCreateData.conditions || 'Yok'}

GÖREVLERİN:
1. Profesyonel bir sözleşme formatı kullan
2. Türk hukuk sistemine uygun terminoloji kullan
3. Resmi ve profesyonel dil kullan
4. Sözleşme başlığını uygun şekilde düzenle
5. Tarafları net şekilde tanımla
6. Sözleşme maddelerini numaralı ve düzenli şekilde organize et
7. Hukuki dayanakları doğru kullan
8. Sözleşme şartlarını detaylı şekilde belirt
9. Sözleşmeyi tam ve eksiksiz hale getir
10. Hukuki açıdan güçlü maddeler ekle
11. İmza kısmını net şekilde belirt

ÖNEMLİ: 
- Sadece sözleşme içeriğini döndür, açıklama veya yorum ekleme
- Sözleşme tamamen hazır ve kullanıma uygun olmalı
- Türk hukuk sistemine uygun format kullan
- Profesyonel ve resmi dil kullan
- Hukuki dayanakları doğru şekilde uygula
- Sözleşme maddelerini numaralı ve düzenli şekilde organize et
- Sözleşme sonunda imza kısmını ekle
      `;

      const response = await geminiService.analyzeText(prompt);
      const content = response || 'Sözleşme oluşturulamadı. Lütfen tekrar deneyin.';

      setGeneratedContract({
        content,
        metadata: {
          templateId: 'ai-generated',
          generatedAt: new Date().toISOString(),
          aiModel: 'gemini',
          wordCount: content.split(' ').length
        }
      });

      setActiveTab('preview');
    } catch (error) {
      console.error('Sözleşme oluşturma hatası:', error);
      alert('Sözleşme oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsGeneratingFromScratch(false);
    }
  };

  // AI ile sözleşme oluştur
  const generateContract = async () => {
    if (!selectedTemplate || formFields.some(field => field.required && !field.value.trim())) {
      alert('Lütfen tüm gerekli alanları doldurun.');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `
Sen Türkiye'de çalışan deneyimli bir avukatsın. Aşağıdaki bilgileri kullanarak profesyonel bir sözleşme oluştur:

SÖZLEŞME BİLGİLERİ:
- Başlık: ${selectedTemplate.title}
- Kategori: ${selectedTemplate.category} - ${selectedTemplate.subcategory}
- Hukuki Dayanak: ${selectedTemplate.legalBasis.join(', ')}
- Sözleşme Türü: ${selectedTemplate.contractType}
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
5. Sözleşme formatını koru
6. Hukuki dayanakları doğru kullan
7. Sözleşme maddelerini düzenli şekilde organize et
8. Sözleşmeyi tam ve eksiksiz hale getir
9. Hukuki açıdan güçlü maddeler ekle
10. Sonuç ve imza kısmını net şekilde belirt

ÖNEMLİ: 
- Sadece sözleşme içeriğini döndür, açıklama veya yorum ekleme
- Sözleşme tamamen hazır ve kullanıma uygun olmalı
- Türk hukuk sistemine uygun format kullan
- Profesyonel ve resmi dil kullan
- Hukuki dayanakları doğru şekilde uygula
- Sözleşme maddelerini numaralı ve düzenli şekilde organize et
      `;

      const response = await geminiService.analyzeText(prompt);
      const content = response || 'Sözleşme oluşturulamadı. Lütfen tekrar deneyin.';

      setGeneratedContract({
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
      console.error('Sözleşme oluşturma hatası:', error);
      alert('Sözleşme oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
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
Sen Türkiye'de çalışan deneyimli bir avukatsın. Aşağıdaki sözleşme şablonu için profesyonel öneriler ver:

ŞABLON BİLGİLERİ:
- Başlık: ${selectedTemplate.title}
- Kategori: ${selectedTemplate.category} - ${selectedTemplate.subcategory}
- Hukuki Dayanak: ${selectedTemplate.legalBasis.join(', ')}
- Sözleşme Türü: ${selectedTemplate.contractType}
- Zorluk Seviyesi: ${selectedTemplate.difficulty}

GÖREVİN:
Bu sözleşme türü için 5 adet profesyonel öneri ver. Her öneri:
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

  // Sözleşmeyi kopyala
  const copyToClipboard = async () => {
    if (generatedContract) {
      try {
        await navigator.clipboard.writeText(generatedContract.content);
        alert('Sözleşme panoya kopyalandı!');
      } catch (error) {
        console.error('Kopyalama hatası:', error);
      }
    }
  };

  // Sözleşmeyi indir
  const downloadContract = () => {
    if (generatedContract) {
      const blob = new Blob([generatedContract.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate?.title || 'sozlesme'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Modern Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl mb-4 shadow-lg">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Sözleşme Yazım Sistemi
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            🚀 <strong>AI asistan ile sohbet ederek profesyonel sözleşmelerinizi kolayca oluşturun.</strong><br/>
            ✨ Sesli yazım özelliği ile daha hızlı çalışın ve şablon kaydetme sistemi ile verimliliğinizi artırın.
          </p>
        </div>

        {/* Modern Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'chat'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                AI Chat
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'preview'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Eye className="w-5 h-5" />
                Önizleme
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'templates'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                Şablonlar
              </button>
            </div>
          </div>
        </div>

        {/* AI Chat Tab */}
        {activeTab === 'chat' && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Modern Chat Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">AI Asistan ile Sözleşme Yazımı</h3>
                    <p className="text-emerald-100">Sohbet ederek sözleşmenizi oluşturun</p>
                  </div>
                </div>
              </div>

              {/* Modern Chat Container */}
              <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 h-[500px] overflow-y-auto">
                <div className="space-y-6">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl p-4 shadow-lg border transition-all duration-200 group-hover:shadow-xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400'
                            : message.type === 'template'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700'
                            : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-500'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {message.role === 'assistant' && (
                            <div className="flex-shrink-0 mt-1">
                              {message.type === 'template' ? (
                                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                  <Save className="w-4 h-4 text-white" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                                  <Bot className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs opacity-70 font-medium">
                                {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {message.role === 'assistant' && (
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                  <span className="text-xs opacity-70">AI</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isGenerating && (
                    <div className="flex justify-start group">
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-2xl p-4 shadow-lg border border-emerald-200 dark:border-emerald-700 group-hover:shadow-xl transition-all duration-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-emerald-600 dark:text-emerald-300 font-medium">AI düşünüyor</span>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Modern Chat Input */}
              <div className="bg-white dark:bg-gray-800 p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      ref={chatInputRef}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Sözleşme türünüzü ve detaylarınızı yazın... (Örn: İş sözleşmesi için şirket ile çalışan arasında sözleşme yazmak istiyorum)"
                      className="w-full p-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-2xl resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                      rows={3}
                      disabled={isGenerating}
                    />
                    {isVoiceMode && interimText && (
                      <div className="absolute bottom-2 left-4 text-sm text-emerald-600 dark:text-emerald-400 italic">
                        {interimText}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={toggleVoiceInput}
                      className={`p-3 rounded-xl transition-all duration-200 ${
                        isListening
                          ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg transform scale-105'
                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                      }`}
                      title={isListening ? 'Sesli yazımı durdur' : 'Sesli yazımı başlat'}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || isGenerating}
                      className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                      title="Mesaj gönder"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setChatInput('İş sözleşmesi için şirket ile çalışan arasında sözleşme yazmak istiyorum')}
                    className="px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full transition-colors"
                  >
                    İş Sözleşmesi
                  </button>
                  <button
                    onClick={() => setChatInput('Kira sözleşmesi için ev sahibi ile kiracı arasında sözleşme yazmak istiyorum')}
                    className="px-3 py-1.5 text-xs bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full transition-colors"
                  >
                    Kira Sözleşmesi
                  </button>
                  <button
                    onClick={() => setChatInput('Satış sözleşmesi için alıcı ile satıcı arasında sözleşme yazmak istiyorum')}
                    className="px-3 py-1.5 text-xs bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full transition-colors"
                  >
                    Satış Sözleşmesi
                  </button>
                  <button
                    onClick={() => setChatInput('Hizmet sözleşmesi için müşteri ile hizmet sağlayıcı arasında sözleşme yazmak istiyorum')}
                    className="px-3 py-1.5 text-xs bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-full transition-colors"
                  >
                    Hizmet Sözleşmesi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modern Preview Tab */}
        {activeTab === 'preview' && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Preview Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Eye className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Sözleşme Önizleme</h3>
                      <p className="text-green-100">Oluşturulan sözleşmenizi görüntüleyin ve düzenleyin</p>
                    </div>
                  </div>
                  {generatedContract && (
                    <div className="flex gap-2">
                      <button
                        onClick={openTemplateModal}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center gap-2 backdrop-blur-sm"
                      >
                        <Save className="w-4 h-4" />
                        Şablon Kaydet
                      </button>
                      <button
                        onClick={downloadContractAsPDF}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center gap-2 backdrop-blur-sm"
                      >
                        <Download className="w-4 h-4" />
                        PDF İndir
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-6">
                {generatedContract ? (
                  <div className="space-y-6">
                    {/* Contract Metadata */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Kategori</p>
                            <p className="text-blue-800 dark:text-blue-200 font-semibold">{generatedContract.metadata.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Kelime Sayısı</p>
                            <p className="text-green-800 dark:text-green-200 font-semibold">{generatedContract.metadata.wordCount}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <Star className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Güven Skoru</p>
                            <p className="text-purple-800 dark:text-purple-200 font-semibold">%{Math.round(generatedContract.metadata.confidence * 100)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contract Content */}
                    <div 
                      ref={contractRef}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8 shadow-lg"
                    >
                      <div className="prose dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                          {generatedContract.content}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 justify-center">
                      <button
                        onClick={copyToClipboard}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Copy className="w-4 h-4" />
                        Kopyala
                      </button>
                      <button
                        onClick={downloadContractAsPDF}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Download className="w-4 h-4" />
                        PDF İndir
                      </button>
                      <button
                        onClick={openTemplateModal}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Save className="w-4 h-4" />
                        Şablon Kaydet
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      Henüz sözleşme oluşturulmadı
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      AI Chat sekmesinden sözleşme oluşturmaya başlayın
                    </p>
                    <button
                      onClick={() => setActiveTab('chat')}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <MessageCircle className="w-4 h-4" />
                      AI Chat'e Git
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
                      placeholder="Sözleşme ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    {Object.keys(contractCategories).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>

                  {selectedCategory && contractCategories[selectedCategory as keyof typeof contractCategories] ? (
                    <select
                      value={selectedSubcategory}
                      onChange={(e) => setSelectedSubcategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option value="">Tüm Alt Kategoriler</option>
                      {Object.keys(contractCategories[selectedCategory as keyof typeof contractCategories]).map(subcategory => (
                        <option key={subcategory} value={subcategory}>{subcategory}</option>
                      ))}
                    </select>
                  ) : null}

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
              {filteredTemplates.map((template: ContractTemplate) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-green-200 dark:hover:border-green-800"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-1 line-clamp-2">
                        {template.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
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
                    {template.keywords.slice(0, 3).map((keyword: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>

                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
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

        {/* AI Create Tab */}
        {activeTab === 'ai-create' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    AI ile Sıfırdan Sözleşme Oluştur
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Yapay zeka ile özel sözleşmenizi oluşturun
                </p>
              </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                    AI Destekli
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sözleşme Türü <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={aiCreateData.contractType}
                    onChange={(e) => setAiCreateData(prev => ({ ...prev, contractType: e.target.value }))}
                    placeholder="Örn: İş Sözleşmesi, Kira Sözleşmesi, Satış Sözleşmesi..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sözleşme Açıklaması <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={aiCreateData.description}
                    onChange={(e) => setAiCreateData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Sözleşmenizin genel açıklamasını yazın..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Taraflar <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={aiCreateData.parties}
                    onChange={(e) => setAiCreateData(prev => ({ ...prev, parties: e.target.value }))}
                    placeholder="Sözleşmede yer alacak tarafları yazın (taraf 1, taraf 2, vs.)..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sözleşme Şartları <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={aiCreateData.terms}
                    onChange={(e) => setAiCreateData(prev => ({ ...prev, terms: e.target.value }))}
                    placeholder="Sözleşmenin temel şartlarını ve koşullarını yazın..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hukuki Dayanak
                  </label>
                  <input
                    type="text"
                    value={aiCreateData.legalBasis}
                    onChange={(e) => setAiCreateData(prev => ({ ...prev, legalBasis: e.target.value }))}
                    placeholder="Örn: BK 125, TMK 166, İK 17..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sözleşme Süresi
                  </label>
                  <input
                    type="text"
                    value={aiCreateData.duration}
                    onChange={(e) => setAiCreateData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="Örn: 1 yıl, 6 ay, belirsiz süreli..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ödeme Şartları
                  </label>
                  <input
                    type="text"
                    value={aiCreateData.payment}
                    onChange={(e) => setAiCreateData(prev => ({ ...prev, payment: e.target.value }))}
                    placeholder="Örn: Aylık 5000 TL, Peşin ödeme, Taksitli..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Özel Şartlar
                  </label>
                  <textarea
                    value={aiCreateData.conditions}
                    onChange={(e) => setAiCreateData(prev => ({ ...prev, conditions: e.target.value }))}
                    placeholder="Özel şartlar, koşullar veya ek maddeler varsa yazın..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={generateContractFromScratch}
                  disabled={isGeneratingFromScratch || !aiCreateData.contractType || !aiCreateData.description || !aiCreateData.parties || !aiCreateData.terms}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isGeneratingFromScratch ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={field.value}
                        onChange={(e) => updateFieldValue(field.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                onClick={generateContract}
                  disabled={isGenerating || formFields.some(field => field.required && !field.value.trim())}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
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
        {activeTab === 'preview' && generatedContract && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
              <div className="flex items-center justify-between mb-6">
          <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Sözleşme Önizleme
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {generatedContract.metadata.wordCount} kelime • {new Date(generatedContract.metadata.generatedAt).toLocaleString('tr-TR')}
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
                  onClick={downloadContract}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  İndir
                </button>
              </div>
            </div>
            
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 md:p-6">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed">
                  {generatedContract.content}
              </pre>
            </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
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
                Sözleşme oluşturmak için önce bir şablon seçmeniz gerekiyor
              </p>
              <button
                onClick={() => setActiveTab('templates')}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg transition-colors"
              >
                Şablonları Görüntüle
              </button>
            </div>
          </div>
        )}

        {/* Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Save className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Şablon Kaydet</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sözleşmenizi şablon olarak kaydedin</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Şablon Adı
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Örn: İş Sözleşmesi Şablonu"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    autoFocus
                  />
                </div>
                
                {generatedContract && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Şablon Bilgileri</h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div>Kategori: {generatedContract.metadata.category}</div>
                      <div>Kelime Sayısı: {generatedContract.metadata.wordCount}</div>
                      <div>Güven Skoru: %{Math.round(generatedContract.metadata.confidence * 100)}</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    if (templateName.trim() && generatedContract) {
                      saveAsTemplate(generatedContract, templateName.trim());
                    }
                  }}
                  disabled={!templateName.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Templates Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Sözleşme Şablonları</h3>
                    <p className="text-purple-100">Kaydedilen şablonlarınızı yönetin ve kullanın</p>
                  </div>
                </div>
              </div>

              {/* Templates Content */}
              <div className="p-6">
                {templates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200 group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
                                {template.name}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {template.category}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <TrendingUp className="w-3 h-3" />
                            {template.usageCount}
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {template.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {template.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {template.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                              +{template.tags.length - 3}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const templateMessage: ChatMessage = {
                                id: Date.now().toString(),
                                role: 'assistant',
                                content: `📋 **Şablon kullanıldı: ${template.name}**\n\n${template.content}`,
                                timestamp: new Date().toISOString(),
                                type: 'template'
                              };
                              setChatMessages(prev => [...prev, templateMessage]);
                              setActiveTab('chat');
                            }}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            Kullan
                          </button>
                          <button
                            onClick={() => {
                              const element = document.createElement('a');
                              const file = new Blob([template.content], { type: 'text/plain' });
                              element.href = URL.createObjectURL(file);
                              element.download = `${template.name}.txt`;
                              document.body.appendChild(element);
                              element.click();
                              document.body.removeChild(element);
                            }}
                            className="px-3 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg text-xs transition-colors"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {new Date(template.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      Henüz şablon yok
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      İlk şablonunuzu oluşturmak için sözleşme yazın ve kaydedin
                    </p>
                    <button
                      onClick={() => setActiveTab('chat')}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <MessageCircle className="w-4 h-4" />
                      AI Chat'e Git
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}