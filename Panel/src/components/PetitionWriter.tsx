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
  Save,
  BookOpen,
  Star,
  Target,
  Play,
  TrendingUp
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { useDictation } from '../hooks/useDictation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const [templates, setTemplates] = useState<PetitionTemplate[]>([]);
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
  const petitionRef = useRef<HTMLDivElement>(null);
  
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
    setShowTemplateModal(false);
    setTemplateName('');
    
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

  const openTemplateModal = () => {
    if (generatedPetition) {
      setShowTemplateModal(true);
    }
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

  // Dilekçeyi PDF olarak indir
  const downloadPetitionAsPDF = async () => {
    if (generatedPetition && petitionRef.current) {
      try {
        const canvas = await html2canvas(petitionRef.current, {
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
        
        const fileName = `Dilekce_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
      } catch (error) {
        console.error('PDF oluşturma hatası:', error);
        alert('PDF oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <FileText className="w-10 h-10 text-white" />
            </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Dilekçe Yazım Sistemi
            </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            🚀 <strong>AI asistan ile sohbet ederek profesyonel dilekçelerinizi kolayca oluşturun.</strong><br/>
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
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
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
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
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
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
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
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Brain className="w-6 h-6" />
        </div>
                <div>
                    <h3 className="text-xl font-bold">AI Asistan ile Dilekçe Yazımı</h3>
                    <p className="text-indigo-100">Sohbet ederek dilekçenizi oluşturun</p>
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
                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
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
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-4 shadow-lg border border-indigo-200 dark:border-indigo-700 group-hover:shadow-xl transition-all duration-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-indigo-600 dark:text-indigo-300 font-medium">AI düşünüyor</span>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                      placeholder="Dilekçe türünüzü ve detaylarınızı yazın... (Örn: İcra takibi için icra müdürlüğüne dilekçe yazmak istiyorum)"
                      className="w-full p-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-2xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                        rows={3}
                    disabled={isGenerating}
                  />
                    {isVoiceMode && interimText && (
                      <div className="absolute bottom-2 left-4 text-sm text-indigo-600 dark:text-indigo-400 italic">
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
                      className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                      title="Mesaj gönder"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setChatInput('İcra takibi için icra müdürlüğüne dilekçe yazmak istiyorum')}
                    className="px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full transition-colors"
                  >
                    İcra Takibi
                  </button>
                  <button
                    onClick={() => setChatInput('Tazminat davası için mahkemeye dilekçe yazmak istiyorum')}
                    className="px-3 py-1.5 text-xs bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full transition-colors"
                  >
                    Tazminat Davası
                  </button>
                  <button
                    onClick={() => setChatInput('Boşanma davası için mahkemeye dilekçe yazmak istiyorum')}
                    className="px-3 py-1.5 text-xs bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full transition-colors"
                  >
                    Boşanma Davası
                  </button>
                  <button
                    onClick={() => setChatInput('İş hukuku ile ilgili dilekçe yazmak istiyorum')}
                    className="px-3 py-1.5 text-xs bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-full transition-colors"
                  >
                    İş Hukuku
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
                      <h3 className="text-xl font-bold">Dilekçe Önizleme</h3>
                      <p className="text-green-100">Oluşturulan dilekçenizi görüntüleyin ve düzenleyin</p>
                    </div>
                  </div>
                  {generatedPetition && (
                    <div className="flex gap-2">
                      <button
                        onClick={openTemplateModal}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center gap-2 backdrop-blur-sm"
                      >
                        <Save className="w-4 h-4" />
                        Şablon Kaydet
                      </button>
                      <button
                        onClick={downloadPetitionAsPDF}
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
                {generatedPetition ? (
                  <div className="space-y-6">
                    {/* Petition Metadata */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Kategori</p>
                            <p className="text-blue-800 dark:text-blue-200 font-semibold">{generatedPetition.metadata.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Kelime Sayısı</p>
                            <p className="text-green-800 dark:text-green-200 font-semibold">{generatedPetition.metadata.wordCount}</p>
                          </div>
                </div>
                <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <Star className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Güven Skoru</p>
                            <p className="text-purple-800 dark:text-purple-200 font-semibold">%{Math.round(generatedPetition.metadata.confidence * 100)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Petition Content */}
                    <div 
                      ref={petitionRef}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8 shadow-lg"
                    >
                      <div className="prose dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                          {generatedPetition.content}
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
                        onClick={downloadPetitionAsPDF}
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
                      Henüz dilekçe oluşturulmadı
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      AI Chat sekmesinden dilekçe oluşturmaya başlayın
                    </p>
                    <button
                      onClick={() => setActiveTab('chat')}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Dilekçenizi şablon olarak kaydedin</p>
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
                    placeholder="Örn: İcra Takibi Dilekçesi"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    autoFocus
                  />
                </div>
                
                {generatedPetition && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Şablon Bilgileri</h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div>Kategori: {generatedPetition.metadata.category}</div>
                      <div>Kelime Sayısı: {generatedPetition.metadata.wordCount}</div>
                      <div>Güven Skoru: %{Math.round(generatedPetition.metadata.confidence * 100)}</div>
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
                    if (templateName.trim() && generatedPetition) {
                      saveAsTemplate(generatedPetition, templateName.trim());
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
                    <h3 className="text-xl font-bold">Dilekçe Şablonları</h3>
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
                      İlk şablonunuzu oluşturmak için dilekçe yazın ve kaydedin
                    </p>
                    <button
                      onClick={() => setActiveTab('chat')}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
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