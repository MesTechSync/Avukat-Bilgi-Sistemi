import { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  Eye, 
  Brain,
  Mic,
  MicOff,
  Send,
  MessageCircle,
  Bot,
  User
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { useDictation } from '../hooks/useDictation';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'petition' | 'template' | 'suggestion';
  metadata?: {
    wordCount?: number;
    category?: string;
    confidence?: number;
  };
}

interface PetitionTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  createdAt: string;
  usageCount: number;
  tags: string[];
  description: string;
}

interface GeneratedPetition {
  content: string;
  metadata: {
    generatedAt: string;
    aiModel: string;
    wordCount: number;
    chatHistory: ChatMessage[];
    category: string;
    confidence: number;
    suggestions: string[];
  };
}

export default function PetitionWriter() {
  // Chat state'leri
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🌟 **Merhaba! Ben Avukat Bilgi Sistemi\'nin Gelişmiş Dilekçe Yazım Asistanıyım!**\n\n✨ **Özelliklerim:**\n• 🧠 Derin düşünme ve analiz\n• 📚 Türk hukuku uzmanlığı\n• 🎯 Kişiselleştirilmiş dilekçeler\n• 💾 Şablon kaydetme sistemi\n• 🔄 Sürekli öğrenme\n\n💬 **Nasıl çalışırım:**\n1. Dilekçe türünüzü belirtin\n2. Detayları açıklayın\n3. Ben size profesyonel dilekçe hazırlarım\n4. Beğendiğiniz dilekçeyi şablon olarak kaydedebilirsiniz\n\n🚀 **Hangi konuda dilekçe yazmak istiyorsunuz?**',
      timestamp: new Date().toISOString(),
      type: 'text'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPetition, setGeneratedPetition] = useState<GeneratedPetition | null>(null);
  
  // Şablon state'leri
  const [, setTemplates] = useState<PetitionTemplate[]>([]);
  
  // AI özellikleri
  const [aiMode] = useState<'gemini' | 'claude' | 'auto'>('auto');
  
  // Sesli yazım state'leri
  const { isListening, startDictation, stopDictation, interimText } = useDictation();
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  
  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'chat' | 'templates' | 'settings' | 'ai-create' | 'preview'>('chat');

  // Chat scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Gelişmiş AI fonksiyonları
  const getAdvancedPrompt = (userMessage: string, chatHistory: ChatMessage[]) => {
    const historyContext = chatHistory.slice(-5).map(msg => 
      `${msg.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${msg.content}`
    ).join('\n');

    return `Sen Avukat Bilgi Sistemi'nin GELİŞMİŞ DİLEKÇE YAZIM ASİSTANISIN. Türk hukuku uzmanısın ve derin düşünme yeteneğine sahipsin.

KULLANICI SORUSU: "${userMessage}"

ÖNCEKİ KONUŞMA GEÇMİŞİ:
${historyContext}

GÖREVİN:
1. Kullanıcının dilekçe ihtiyacını analiz et
2. Türk hukuku çerçevesinde profesyonel dilekçe hazırla
3. Derin düşünme ile en iyi çözümü sun
4. Dilekçeyi kategorize et ve etiketle

DİLEKÇE YAZIM KURALLARI:
- Türkçe dilbilgisi kurallarına uygun
- Hukuki terminoloji doğru kullanım
- Resmi dil ve üslup
- Açık ve anlaşılır ifadeler
- Kanun maddelerine referanslar
- Tarih ve imza alanları

YANIT FORMATI:
🔍 **Analiz:** [Dilekçe türü ve analiz]
📝 **Dilekçe:** [Profesyonel dilekçe metni]
📋 **Kategori:** [Dilekçe kategorisi]
🏷️ **Etiketler:** [İlgili etiketler]
💡 **Öneriler:** [Ek öneriler]

Derin düşünme modunda çalış ve en kaliteli dilekçeyi hazırla!`;
  };

  const generatePetitionWithAI = async (userMessage: string) => {
    setIsGenerating(true);
    
    try {
      const prompt = getAdvancedPrompt(userMessage, chatMessages);
      const response = await geminiService.analyzeText(prompt);
      
      // Yanıtı parse et
      const petitionMatch = response.match(/📝 \*\*Dilekçe:\*\* (.+?)(?=📋|$)/s);
      const categoryMatch = response.match(/📋 \*\*Kategori:\*\* (.+?)(?=🏷️|$)/s);
      const suggestionsMatch = response.match(/💡 \*\*Öneriler:\*\* (.+?)$/s);
      
      const petitionContent = petitionMatch ? petitionMatch[1].trim() : response;
      const category = categoryMatch ? categoryMatch[1].trim() : 'Genel';
      const suggestions = suggestionsMatch ? suggestionsMatch[1].trim().split('\n').map(s => s.trim()) : [];
      
      // Yeni mesaj ekle
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        type: 'petition',
        metadata: {
          wordCount: petitionContent.split(' ').length,
          category: category,
          confidence: 0.95
        }
      };
      
      setChatMessages(prev => [...prev, newMessage]);
      
      // Dilekçe oluştur
      const petition: GeneratedPetition = {
        content: petitionContent,
        metadata: {
          generatedAt: new Date().toISOString(),
          aiModel: aiMode === 'auto' ? 'gemini' : aiMode,
          wordCount: petitionContent.split(' ').length,
          chatHistory: [...chatMessages, newMessage],
          category: category,
          confidence: 0.95,
          suggestions: suggestions
        }
      };
      
      setGeneratedPetition(petition);
      
    } catch (error) {
      console.error('AI dilekçe oluşturma hatası:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '❌ Üzgünüm, dilekçe oluştururken bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Şablon kaydetme fonksiyonları
  const saveAsTemplate = (petition: GeneratedPetition, templateName: string) => {
    const newTemplate: PetitionTemplate = {
      id: Date.now().toString(),
      name: templateName,
      category: petition.metadata.category,
      content: petition.content,
      createdAt: new Date().toISOString(),
      usageCount: 0,
      tags: petition.metadata.suggestions,
      description: `${petition.metadata.category} kategorisinde ${petition.metadata.wordCount} kelimelik dilekçe şablonu`
    };
    
    setTemplates(prev => [...prev, newTemplate]);
    
    // Başarı mesajı
    const successMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `✅ **Şablon başarıyla kaydedildi!**\n\n📋 **Şablon Adı:** ${templateName}\n📂 **Kategori:** ${petition.metadata.category}\n📊 **Kelime Sayısı:** ${petition.metadata.wordCount}\n🏷️ **Etiketler:** ${petition.metadata.suggestions.join(', ')}\n\nArtık bu şablonu "Şablonlar" sekmesinden kullanabilirsiniz!`,
      timestamp: new Date().toISOString(),
      type: 'template'
    };
    
    setChatMessages(prev => [...prev, successMessage]);
  };

  // Sesli yazım için input güncelleme
  useEffect(() => {
    if (interimText && isVoiceMode) {
      setChatInput(interimText);
    }
  }, [interimText, isVoiceMode]);

  // İlk karşılama mesajı
  useEffect(() => {
    if (chatMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: 'Merhaba! Ben sizin hukuki asistanınızım. Hangi tür dilekçe yazmak istiyorsunuz? Size adım adım yardımcı olabilirim.\n\nÖrnekler:\n• Boşanma dilekçesi\n• İcra takibi itiraz dilekçesi\n• Tazminat davası dilekçesi\n• İş hukuku dilekçesi\n• Sözleşme ihlali dilekçesi\n\nLütfen ihtiyacınızı açıklayın.',
        timestamp: new Date().toISOString()
      };
      setChatMessages([welcomeMessage]);
    }
  }, []);

  // Chat mesajı gönder
  const handleSendMessage = async () => {
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

    // AI ile dilekçe oluştur
    await generatePetitionWithAI(userMessage.content);
  };

  // Sesli yazım başlat/durdur
  const toggleVoiceInput = () => {
    if (isListening) {
      stopDictation();
      setIsVoiceMode(false);
    } else {
      startDictation();
      setIsVoiceMode(true);
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
        alert('Kopyalama başarısız oldu.');
      }
    }
  };

  // Dilekçeyi indir
  const downloadPetition = () => {
    if (generatedPetition) {
    const element = document.createElement('a');
      const file = new Blob([generatedPetition.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
      element.download = `dilekce_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <FileText className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
              Dilekçe Yazım Sistemi
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            AI asistan ile sohbet ederek profesyonel dilekçelerinizi kolayca oluşturun. 
            Sesli yazım özelliği ile daha hızlı çalışın.
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2">
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: 'ai-create', label: 'AI ile Oluştur', icon: Brain },
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

        {/* AI Create Tab */}
        {activeTab === 'ai-create' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">AI Asistan ile Dilekçe Yazımı</h2>
                  <p className="text-gray-600 dark:text-gray-300">Sohbet ederek dilekçenizi oluşturun</p>
              </div>
            </div>

              {/* Chat Container */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-96 overflow-y-auto mb-4">
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start gap-3 max-w-[80%] ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}>
                        <div className={`p-2 rounded-full ${
                          message.role === 'user' 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-gray-500 text-white'
                        }`}>
                          {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-orange-500 text-white'
                            : 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white'
                        }`}>
                          <p className="whitespace-pre-line text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.role === 'user' ? 'text-orange-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString('tr-TR')}
                          </p>
                  </div>
                    </div>
                </div>
              ))}
                  {isGenerating && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-gray-500 text-white">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="p-3 rounded-lg bg-white dark:bg-gray-600">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">Yazıyor...</span>
            </div>
          </div>
            </div>
          </div>
                  )}
                  <div ref={chatEndRef} />
            </div>
          </div>

              {/* Chat Input */}
              <div className="flex gap-2">
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
                    placeholder="Dilekçe türünüzü ve detaylarınızı yazın..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        rows={3}
                    disabled={isGenerating}
                  />
                  {isVoiceMode && (
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center gap-2 text-orange-500">
                        <div className="animate-pulse w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-xs">Dinliyor...</span>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={toggleVoiceInput}
                  className={`p-3 rounded-lg transition-colors ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                  title={isListening ? 'Sesli yazımı durdur' : 'Sesli yazımı başlat'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
            <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isGenerating}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Gönder
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
                    AI ile oluşturuldu • {generatedPetition.metadata.wordCount} kelime
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                    AI Destekli
              </div>
            </div>
          </div>

              {/* Dilekçe İçeriği */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200 leading-relaxed">
                    {generatedPetition.content}
                  </pre>
                </div>
              </div>

              {/* Aksiyon Butonları */}
              <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={copyToClipboard}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                  <Copy className="w-4 h-4" />
                  Panoya Kopyala
              </button>
              <button
                onClick={downloadPetition}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                  <Download className="w-4 h-4" />
                  İndir
              </button>
              <button
                  onClick={() => setActiveTab('ai-create')}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Yeni Dilekçe
              </button>
          </div>

              {/* Metadata */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dilekçe Bilgileri
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <div>Oluşturulma Tarihi: {new Date(generatedPetition.metadata.generatedAt).toLocaleString('tr-TR')}</div>
                  <div>AI Modeli: {generatedPetition.metadata.aiModel}</div>
                  <div>Kelime Sayısı: {generatedPetition.metadata.wordCount}</div>
                  <div>Chat Mesajı: {generatedPetition.metadata.chatHistory.length}</div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}