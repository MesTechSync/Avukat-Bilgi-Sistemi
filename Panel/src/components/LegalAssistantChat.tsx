import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Copy, ThumbsUp, ThumbsDown, Trash2, Zap, Scale, FileText, Search, BookOpen, Mic, Paperclip, ArrowUp, ChevronUp, Brain, Lightbulb, Target, Clock, Shield, Users, Gavel, ExternalLink, Plus, MessageSquare, History, Star, Settings, MoreVertical, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DeepChat } from 'deep-chat-react';
import { geminiService } from '../services/geminiService';
import { useDictation } from '../hooks/useDictation';
import { searchIctihat, searchMevzuat } from '../lib/yargiApi';
import { petitionTemplates, petitionCategories, searchPetitions } from '../data/petitions/petitionDatabase';
import { contractTemplates, contractCategories, searchContracts } from '../data/contracts/contractDatabase';

export type Model = 'gemini' | 'gpt-4' | 'auto';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: Model;
  confidence?: number;
  isError?: boolean;
  feedback?: 'positive' | 'negative';
  thinking?: string;
  action?: {
    type: 'search' | 'petition' | 'contract';
    data?: any;
    link?: string;
  };
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  category?: string;
}

interface QuickStartOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  category: string;
  gradient: string;
}

const LegalAssistantChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>('gemini');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingProcess, setThinkingProcess] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showQuickStart, setShowQuickStart] = useState(true);
  const [useDeepChat, setUseDeepChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isListening, startDictation, stopDictation, interimText } = useDictation();

  // Sistem kayıtlı kullanıcı bilgileri
  const userInfo = {
    name: 'Av. Mehmet Zeki Alagöz',
    title: 'Kıdemli Avukat',
    initials: 'MZ'
  };

  // Hızlı başlat seçenekleri - Gerçekçi hukuki senaryolar
  const quickStartOptions: QuickStartOption[] = [
    {
      id: 'lawsuit-petition',
      title: 'Dava Dilekçesi Hazırla',
      description: 'Tahliye davası dilekçesi',
      icon: <FileText className="w-6 h-6" />,
      prompt: 'Müvekkil Antalya ilinde bulunan taşınmazını 25.01.2023 tarihinde Ali\'ye kiralamıştır. Müvekkilin oğlunun Antalya\'da bir işe girmiş olması ve ev ihtiyacı olduğundan taşınmazın ihtiyaç sebebiyle tahliyesini istiyoruz. Dava dilekçesi hazırlar mısın?',
      category: 'dilekçe',
      gradient: 'from-emerald-400 via-teal-500 to-cyan-600'
    },
    {
      id: 'response-petition',
      title: 'Cevap Dilekçesi Hazırla',
      description: 'Tahliye davasına cevap',
      icon: <FileText className="w-6 h-6" />,
      prompt: 'Müvekkilim Ayşegül Antalya ilinde bulunan taşınmazını 17/11/2019 tarihinde Hüseyin adlı şahıstan kiralamıştır. Ancak, karşı taraf oğlunun taşınmaza ihtiyaç olduğu nedeniyle taşınmazın tahliyesi davası açmıştır. Karşı tarafın iddiaları doğru değildir. Karşı tarafın oğlunun ihtiyacı yoktur. Tahliye istemesinin tek sebebi taşınmazı daha yüksek fiyatla kiraya vermek istemesidir. Müvekkilimiz bu iddiaları kabul etmiyor. Bu sebeplerle davanın reddini talep ediyoruz. Cevap dilekçesi hazırlar mısın?',
      category: 'dilekçe',
      gradient: 'from-orange-400 via-red-500 to-pink-600'
    },
    {
      id: 'contract-prepare',
      title: 'Sözleşme Hazırla',
      description: 'Kira sözleşmesi düzenleme',
      icon: <FileText className="w-6 h-6" />,
      prompt: 'Müvekkilim için kiralama sözleşmesi hazırlamanı istiyorum. Müvekkilim Fatma ile Harun arasında Edirne ilinde bulunan taşınmaz üzerine yapılan kira sözleşmesi. Sözleşmenin başlama tarihi 19 Mart 2024 ve bitiş tarihi 19 Mart 2025 olarak belirlenmiştir. Kiranın miktarı 20.000 TL olarak belirlenmiş olup, ödeme şekli aylık şeklindedir.',
      category: 'sözleşme',
      gradient: 'from-violet-400 via-purple-500 to-indigo-600'
    },
    {
      id: 'appeal-petition',
      title: 'İstinaf Dilekçesi Hazırla',
      description: 'Tazminat kararına itiraz',
      icon: <FileText className="w-6 h-6" />,
      prompt: 'Lütfen 2023/100 E. ve 2023/200 K. sayılı, ... Mahkemesi\'nin verdiği, tazminat talebimi reddeden kararın, kusur oranının yanlış hesaplanması ve delillerin yeterince değerlendirilmemesi gerekçeleriyle iptal edilmesini ve tazminat talebimin kabul edilmesini talep eden bir istinaf dilekçesi hazırlayın.',
      category: 'dilekçe',
      gradient: 'from-amber-400 via-yellow-500 to-orange-600'
    },
    {
      id: 'expert-objection',
      title: 'Bilirkişi Raporuna İtiraz',
      description: 'Trafik kazası bilirkişi itirazı',
      icon: <FileText className="w-6 h-6" />,
      prompt: 'Dava konusu kazanın meydana gelme şekli ve aracın hasar durumu ile ilgili olarak bilirkişi raporunun 3. maddesinde belirtilen görüşlerin, kazanın tanık anlatımları ve olay yeri inceleme raporundaki tespitler ile örtüşmediğini, bu nedenle bilirkişi raporunun bu kısmının hatalı olduğunu belirterek bilirkişi raporuna itiraz ediyorum. Bu maddede yer alan hatalı görüşlerin düzeltilmesini ve eksik kalan yönlerin giderilmesini talep ediyorum. Bu konuda bilirkişi raporuna itiraz dilekçesi hazırlar mısın?',
      category: 'dilekçe',
      gradient: 'from-slate-400 via-gray-500 to-zinc-600'
    },
    {
      id: 'case-law-search',
      title: 'İçtihat Ara',
      description: 'Yargıtay kararları',
      icon: <Search className="w-6 h-6" />,
      prompt: 'Belirli bir konuda Yargıtay içtihatları arıyorum. İlgili kararları bulup analiz edebilir misin?',
      category: 'araştırma',
      gradient: 'from-rose-400 via-pink-500 to-red-600'
    },
    {
      id: 'legislation-search',
      title: 'Mevzuat Ara',
      description: 'Kanun ve yönetmelikler',
      icon: <BookOpen className="w-6 h-6" />,
      prompt: 'Belirli bir konuda mevcut mevzuatı araştırmak istiyorum. İlgili kanun, yönetmelik ve düzenlemeleri bulabilir misin?',
      category: 'araştırma',
      gradient: 'from-green-400 via-emerald-500 to-teal-600'
    },
    {
      id: 'legal-support',
      title: 'Hukuki Destek',
      description: 'Genel hukuki danışmanlık',
      icon: <Scale className="w-6 h-6" />,
      prompt: 'Hukuki bir sorunum var ve profesyonel destek istiyorum. Detaylı analiz ve çözüm önerileri sunabilir misin?',
      category: 'genel',
      gradient: 'from-cyan-400 via-blue-500 to-purple-600'
    }
  ];

  // Sohbet geçmişini localStorage'dan yükle
  useEffect(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      setChatSessions(JSON.parse(savedSessions));
    }
  }, []);

  // Sohbet geçmişini localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
  }, [chatSessions]);

  // Yeni sohbet başlat
  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setShowQuickStart(true);
  };

  // Sohbet oturumunu kaydet
  const saveChatSession = (title: string) => {
    if (messages.length === 0) return;

    const newSession: ChatSession = {
      id: Date.now().toString(),
      title,
      messages: [...messages],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      category: 'genel'
    };

    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    
    // Sohbet oturumunu localStorage'a kaydet
    const updatedSessions = [newSession, ...chatSessions];
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
  };

  // Sohbet oturumunu yükle
  const loadChatSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setMessages(session.messages);
      setCurrentSessionId(sessionId);
      setShowQuickStart(false);
    }
  };

  // Sohbet oturumunu sil
  const deleteChatSession = (sessionId: string) => {
    const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(updatedSessions);
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
    
    if (currentSessionId === sessionId) {
      startNewChat();
    }
  };

  // Sohbet oturumunu güncelle
  const updateChatSession = (sessionId: string, newMessages: ChatMessage[]) => {
    const updatedSessions = chatSessions.map(s => 
      s.id === sessionId 
        ? { ...s, messages: newMessages, updatedAt: new Date().toISOString() }
        : s
    );
    setChatSessions(updatedSessions);
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (interimText) {
      setInput(interimText);
    }
  }, [interimText]);

  const handleQuickStart = async (option: QuickStartOption) => {
    setInput(option.prompt);
    await handleSend(option.prompt);
    setShowQuickStart(false);
  };

  const handleSend = async (message?: string) => {
    const messageToSend = message || input.trim();
    if (!messageToSend) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsThinking(true);

    // Düşünme süreci simülasyonu
    const thinkingSteps = [
      'Soruyu analiz ediyorum...',
      'Hukuki kategorileri belirliyorum...',
      'İlgili mevzuatı araştırıyorum...',
      'Pratik çözümler geliştiriyorum...',
      'Detaylı yanıt hazırlıyorum...'
    ];

    let thinkingIndex = 0;
    const thinkingInterval = setInterval(() => {
      if (thinkingIndex < thinkingSteps.length) {
        setThinkingProcess(thinkingSteps[thinkingIndex]);
        thinkingIndex++;
      } else {
        clearInterval(thinkingInterval);
        setIsThinking(false);
      }
    }, 800);

    try {
      // Mesajı analiz et ve uygun aksiyonu belirle
      const messageLower = messageToSend.toLowerCase();
      let actionData = null;
      let actionType: 'search' | 'petition' | 'contract' | null = null;
      let panelResponse = '';

      // İçtihat/Mevzuat arama kontrolü
      if (messageLower.includes('içtihat') || messageLower.includes('yargıtay') || messageLower.includes('karar') || 
          messageLower.includes('mevzuat') || messageLower.includes('kanun') || messageLower.includes('yönetmelik')) {
        
        actionType = 'search';
        const searchQuery = messageToSend;
        
        try {
          // İçtihat arama
          const ictihatResults = await searchIctihat(searchQuery, {});
          // Mevzuat arama
          const mevzuatResults = await searchMevzuat(searchQuery, {});
          
          actionData = {
            ictihatResults: ictihatResults.slice(0, 3),
            mevzuatResults: mevzuatResults.slice(0, 3),
            searchQuery
          };
          
          panelResponse = `🔍 **Arama Sonuçları Bulundu!**

**İçtihat Sonuçları:** ${ictihatResults.length} karar
**Mevzuat Sonuçları:** ${mevzuatResults.length} düzenleme

En ilgili sonuçlar aşağıda gösteriliyor. Detaylı arama için "İçtihat & Mevzuat" bölümünü kullanabilirsiniz.

`;
        } catch (error) {
          console.error('Arama hatası:', error);
        }
      }
      
      // Dilekçe yazımı kontrolü
      else if (messageLower.includes('dilekçe') || messageLower.includes('dava') || messageLower.includes('mahkeme') || 
               messageLower.includes('boşanma') || messageLower.includes('nafaka') || messageLower.includes('velayet')) {
        
        actionType = 'petition';
        const searchQuery = messageToSend;
        
        try {
          const petitionResults = searchPetitions(searchQuery);
          const relevantPetitions = petitionResults.slice(0, 3);
          
          actionData = {
            petitions: relevantPetitions,
            searchQuery,
            categories: petitionCategories
          };
          
          panelResponse = `📄 **Dilekçe Şablonları Bulundu!**

**Bulunan Şablonlar:** ${petitionResults.length} adet
**En İlgili Şablonlar:** ${relevantPetitions.length} adet

Aşağıda en uygun dilekçe şablonları gösteriliyor. Detaylı dilekçe yazımı için "Dilekçe Yazımı" bölümünü kullanabilirsiniz.

`;
        } catch (error) {
          console.error('Dilekçe arama hatası:', error);
        }
      }
      
      // Sözleşme yazımı kontrolü
      else if (messageLower.includes('sözleşme') || messageLower.includes('kontrat') || messageLower.includes('anlaşma') || 
               messageLower.includes('iş sözleşmesi') || messageLower.includes('kira sözleşmesi') || messageLower.includes('satış sözleşmesi')) {
        
        actionType = 'contract';
        const searchQuery = messageToSend;
        
        try {
          const contractResults = searchContracts(searchQuery);
          const relevantContracts = contractResults.slice(0, 3);
          
          actionData = {
            contracts: relevantContracts,
            searchQuery,
            categories: contractCategories
          };
          
          panelResponse = `📋 **Sözleşme Şablonları Bulundu!**

**Bulunan Şablonlar:** ${contractResults.length} adet
**En İlgili Şablonlar:** ${relevantContracts.length} adet

Aşağıda en uygun sözleşme şablonları gösteriliyor. Detaylı sözleşme yazımı için "Sözleşme Oluşturucu" bölümünü kullanabilirsiniz.

`;
        } catch (error) {
          console.error('Sözleşme arama hatası:', error);
        }
      }

      // AI yanıtı al - Gerçekçi ve doğal
      const aiPrompt = `Sen deneyimli bir hukuk asistanısın. ${userInfo.name} ile çalışıyorsun. 

Soru: ${messageToSend}

${actionData ? `Panel Entegrasyonu: ${panelResponse}` : ''}

Yanıtında:
- Doğal ve samimi bir dil kullan
- Gereksiz formalite yapma
- Direkt ve pratik çözümler sun
- Hukuki terimleri açıkla ama abartma
- Gerçekçi öneriler ver

${actionData ? 'Panel entegrasyonu bilgilerini de dahil et.' : ''}

Türkçe, anlaşılır ve samimi bir dille yanıt ver.`;

      const response = await geminiService.analyzeText(aiPrompt, messageToSend);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        model: selectedModel,
        confidence: 0.95,
        thinking: thinkingProcess,
        action: actionType ? {
          type: actionType,
          data: actionData
        } : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Sohbet oturumunu güncelle
      if (currentSessionId) {
        updateChatSession(currentSessionId, [...messages, userMessage, assistantMessage]);
      } else if (messages.length === 0) {
        // İlk mesajda sohbet oturumunu kaydet
        const title = messageToSend.length > 50 ? messageToSend.substring(0, 50) + '...' : messageToSend;
        saveChatSession(title);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Üzgünüm, şu anda bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsThinking(false);
      setThinkingProcess('');
      clearInterval(thinkingInterval);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Kopyalama hatası:', err);
    }
  };

  const giveFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ));
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setShowQuickStart(true);
  };

  // Deep Chat için özel yanıt işleyici
  const handleDeepChatResponse = async (message: any) => {
    const userMessage = message.text || message;
    
    // Hukuki analiz için özel prompt
    const legalPrompt = `Sen Türkiye'nin en deneyimli hukuk asistanısın. ${userInfo.name} adlı avukata profesyonel, detaylı ve pratik bir yanıt ver.

Soru: ${userMessage}

Yanıtında şunları dahil et:
1. Hukuki analiz ve değerlendirme
2. İlgili mevzuat referansları
3. Pratik çözüm önerileri
4. Dikkat edilmesi gereken noktalar
5. Sonraki adımlar

Yanıtını Türkçe, anlaşılır ve profesyonel bir dille ver. ${userInfo.name} için özelleştirilmiş öneriler sun.`;

    try {
      const response = await geminiService.analyzeText(legalPrompt, userMessage);
      return response;
    } catch (error) {
      console.error('Deep Chat yanıt hatası:', error);
      return 'Üzgünüm, şu anda bir hata oluştu. Lütfen tekrar deneyin.';
    }
  };

  // Deep Chat konfigürasyonu - Hukuk Asistanı için özelleştirilmiş
  const deepChatConfig = {
    // Hukuki asistan için özel handler
    request: {
      handler: async (request: any) => {
        const userMessage = request.body?.message || request.body;
        
        // Hukuki analiz için özel prompt - Gerçekçi ve doğal
        const legalPrompt = `Sen deneyimli bir hukuk asistanısın. ${userInfo.name} ile çalışıyorsun.

Soru: ${userMessage}

Yanıtında:
- Doğal ve samimi bir dil kullan
- Gereksiz formalite yapma
- Direkt ve pratik çözümler sun
- Hukuki terimleri açıkla ama abartma
- Gerçekçi öneriler ver

Türkçe, anlaşılır ve samimi bir dille yanıt ver.`;

        try {
          const response = await geminiService.analyzeText(legalPrompt, userMessage);
          return { text: response };
        } catch (error) {
          console.error('Deep Chat yanıt hatası:', error);
          return { text: 'Üzgünüm, şu anda bir hata oluştu. Lütfen tekrar deneyin.' };
        }
      }
    },
    // Modern hukuki tema
    style: {
      borderRadius: '16px',
      fontSize: '14px',
      fontFamily: 'Inter, system-ui, sans-serif',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      border: '1px solid #334155',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    },
    // Gelişmiş input tasarımı
    textInput: {
      placeholder: 'Hukuki sorunuzu yazın...',
      backgroundColor: '#1e293b',
      color: '#f8fafc',
      border: '1px solid #475569',
      borderRadius: '12px',
      fontSize: '14px',
      padding: '12px 16px'
    },
    // Modern gönder butonu
    submitButton: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      hover: {
        backgroundColor: '#2563eb',
        boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)'
      }
    },
    // Mesaj balonları
    message: {
      user: {
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        borderRadius: '18px 18px 6px 18px',
        fontSize: '14px',
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
      },
      ai: {
        backgroundColor: '#1e293b',
        color: '#f8fafc',
        borderRadius: '18px 18px 18px 6px',
        fontSize: '14px',
        padding: '12px 16px',
        border: '1px solid #334155',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }
    },
    // Avatar tasarımı
    avatar: {
      user: {
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        borderRadius: '50%',
        fontSize: '12px',
        fontWeight: '600'
      },
      ai: {
        backgroundColor: '#8b5cf6',
        color: '#ffffff',
        borderRadius: '50%',
        fontSize: '12px',
        fontWeight: '600'
      }
    },
    // Hoş geldin mesajı
    introMessage: {
      text: `Merhaba ${userInfo.name}! 👋

Ben sizin hukuki asistanınızım. Size şu konularda yardımcı olabilirim:

⚖️ **Hukuki Danışmanlık**
📚 **Mevzuat Araştırması** 
📄 **Dilekçe Hazırlama**
📋 **Sözleşme Düzenleme**
🔍 **İçtihat Arama**
💼 **Dava Stratejisi**

Hangi konuda yardıma ihtiyacınız var?`,
      backgroundColor: '#1e293b',
      color: '#f8fafc',
      borderRadius: '16px',
      border: '1px solid #334155',
      padding: '20px',
      fontSize: '14px',
      lineHeight: '1.6'
    },
    // Hata mesajları
    errorMessages: {
      displayServiceErrorMessages: true,
      backgroundColor: '#dc2626',
      color: '#ffffff',
      borderRadius: '12px'
    },
    // Genel ayarlar
    height: '100%',
    streaming: true,
    // Gelişmiş özellikler
    fileUpload: {
      disabled: false,
      maxFiles: 5,
      acceptedFormats: '.pdf,.doc,.docx,.txt',
      maxFileSize: 10485760 // 10MB
    },
    // Ses özellikleri
    speechToText: {
      disabled: false,
      language: 'tr-TR'
    },
    textToSpeech: {
      disabled: false,
      language: 'tr-TR',
      voice: 'tr-TR-EmelNeural'
    },
    // Görsel özellikler
    images: {
      disabled: false,
      maxFiles: 3,
      acceptedFormats: '.jpg,.jpeg,.png,.gif,.webp',
      maxFileSize: 5242880 // 5MB
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white overflow-hidden">
      {/* Sol Sidebar - Sohbet Geçmişi */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/50 overflow-hidden`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Sohbet Geçmişi
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={startNewChat}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Yeni Sohbet</span>
            </button>
          </div>

          {/* Sohbet Listesi */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="text-sm text-gray-400 mb-3">Bugün</div>
            
            {chatSessions.map((session) => (
              <div
                key={session.id}
                className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentSessionId === session.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
                    : 'hover:bg-gray-700/30 border border-transparent hover:border-gray-600/30'
                }`}
                onClick={() => loadChatSession(session.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <h3 className="text-sm font-medium text-white truncate">
                        {session.title}
                      </h3>
                      {session.isFavorite && (
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(session.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(session.id);
                      }}
                      className="p-1 hover:bg-gray-600/50 rounded"
                    >
                      <Star className={`w-3 h-3 ${session.isFavorite ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChatSession(session.id);
                      }}
                      className="p-1 hover:bg-red-600/50 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {chatSessions.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Henüz sohbet geçmişi yok</p>
                <p className="text-xs mt-1">Yeni bir sohbet başlatın</p>
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">{userInfo.initials}</span>
              </div>
              <div>
                <p className="text-sm font-medium">{userInfo.name}</p>
                <p className="text-xs text-gray-400">{userInfo.title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ana İçerik Alanı */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  Hukuk Asistanı
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setUseDeepChat(!useDeepChat)}
                className={`p-2 rounded-lg transition-colors ${
                  useDeepChat 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                    : 'hover:bg-gray-700/50'
                }`}
                title={useDeepChat ? 'Deep Chat Aktif' : 'Deep Chat\'i Aktifleştir'}
              >
                <Brain className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="p-2 hover:bg-red-600/50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Deep Chat Modu */}
          {useDeepChat ? (
            <div className="flex-1 p-4">
              <div className="h-full rounded-xl overflow-hidden border border-gray-700/50 bg-gray-800/30 backdrop-blur-sm shadow-2xl">
                <div className="h-full flex flex-col">
                  {/* Deep Chat Header */}
                  <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Brain className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Deep Chat Hukuk Asistanı</h3>
                          <p className="text-sm text-gray-400">Gelişmiş AI destekli hukuki danışmanlık</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400">Aktif</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Deep Chat Component */}
                  <div className="flex-1 p-4">
                    <DeepChat 
                      {...deepChatConfig}
                      style={{
                        ...deepChatConfig.style,
                        height: '100%',
                        borderRadius: '12px'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Hoş Geldin Mesajı */}
              {messages.length === 0 && showQuickStart && (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-2xl shadow-cyan-500/25">
                  <Brain className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  İyi günler, {userInfo.name}
                </h2>
                <p className="text-gray-400 mb-6">
                  Size nasıl yardımcı olabilirim? Hukuki sorularınızı sorabilir veya aşağıdaki hızlı başlat seçeneklerini kullanabilirsiniz.
                </p>
              </div>

              {/* Hızlı Başlat Seçenekleri */}
              <div className="w-full max-w-4xl">
                <h3 className="text-lg font-semibold mb-4 text-center">Hızlı Başlat</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickStartOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleQuickStart(option)}
                      className={`group p-4 rounded-xl border-2 border-transparent hover:border-${option.gradient.split('-')[1]}-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-${option.gradient.split('-')[1]}-500/25 bg-gradient-to-br ${option.gradient} bg-opacity-10 backdrop-blur-sm`}
                    >
                      <div className={`text-${option.gradient.split('-')[1]}-400 mb-3 group-hover:scale-110 transition-transform`}>
                        {option.icon}
                      </div>
                      <h4 className="text-sm font-medium text-white mb-1">
                        {option.title}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
                
                <div className="text-center mt-6">
                  <button
                    onClick={() => setShowQuickStart(false)}
                    className="flex items-center justify-center space-x-2 text-gray-400 hover:text-white transition-colors mx-auto"
                  >
                    <ChevronUp className="w-4 h-4" />
                    <span className="text-sm">Daralt</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sohbet Mesajları */}
          {messages.length > 0 && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-gray-800/50 backdrop-blur-sm text-white border border-gray-700/50 shadow-lg'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Bot className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">Hukuk Asistanı</span>
                        {message.confidence && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                            %{Math.round(message.confidence * 100)} Güven
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>

                    {/* Panel Entegrasyonu - Action Results */}
                    {message.action && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 backdrop-blur-sm">
                        <div className="flex items-center space-x-2 mb-3">
                          <ExternalLink className="w-5 h-5 text-blue-400" />
                          <span className="font-medium text-blue-300">
                            Panel Entegrasyonu
                          </span>
                        </div>
                        
                        {message.action.type === 'search' && message.action.data && (
                          <div className="space-y-3">
                            <div className="text-sm text-gray-300">
                              <strong>Arama Terimi:</strong> "{message.action.data.searchQuery}"
                            </div>
                            
                            {message.action.data.ictihatResults && message.action.data.ictihatResults.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-200 mb-2">
                                  🔍 İçtihat Sonuçları ({message.action.data.ictihatResults.length})
                                </h4>
                                <div className="space-y-2">
                                  {message.action.data.ictihatResults.map((result: any, index: number) => (
                                    <div key={index} className="p-3 bg-gray-800/50 rounded-lg border border-gray-600/50">
                                      <div className="font-medium text-sm text-white">
                                        {result.title}
                                      </div>
                                      <div className="text-xs text-gray-400 mt-1">
                                        {result.content?.substring(0, 150)}...
                                      </div>
                                      <div className="text-xs text-blue-400 mt-1">
                                        {result.court} • {result.date}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {message.action.data.mevzuatResults && message.action.data.mevzuatResults.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-200 mb-2">
                                  📚 Mevzuat Sonuçları ({message.action.data.mevzuatResults.length})
                                </h4>
                                <div className="space-y-2">
                                  {message.action.data.mevzuatResults.map((result: any, index: number) => (
                                    <div key={index} className="p-3 bg-gray-800/50 rounded-lg border border-gray-600/50">
                                      <div className="font-medium text-sm text-white">
                                        {result.title}
                                      </div>
                                      <div className="text-xs text-gray-400 mt-1">
                                        {result.content?.substring(0, 150)}...
                                      </div>
                                      <div className="text-xs text-green-400 mt-1">
                                        {result.type} • {result.date}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {message.action.type === 'petition' && message.action.data && (
                          <div className="space-y-3">
                            <div className="text-sm text-gray-300">
                              <strong>Arama Terimi:</strong> "{message.action.data.searchQuery}"
                            </div>
                            
                            {message.action.data.petitions && message.action.data.petitions.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-200 mb-2">
                                  📄 Dilekçe Şablonları ({message.action.data.petitions.length})
                                </h4>
                                <div className="space-y-2">
                                  {message.action.data.petitions.map((petition: any, index: number) => (
                                    <div key={index} className="p-3 bg-gray-800/50 rounded-lg border border-gray-600/50">
                                      <div className="font-medium text-sm text-white">
                                        {petition.title}
                                      </div>
                                      <div className="text-xs text-gray-400 mt-1">
                                        {petition.description}
                                      </div>
                                      <div className="flex items-center space-x-2 mt-2">
                                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30">
                                          {petition.category}
                                        </span>
                                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded border border-green-500/30">
                                          {petition.subcategory}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {message.action.type === 'contract' && message.action.data && (
                          <div className="space-y-3">
                            <div className="text-sm text-gray-300">
                              <strong>Arama Terimi:</strong> "{message.action.data.searchQuery}"
                            </div>
                            
                            {message.action.data.contracts && message.action.data.contracts.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-200 mb-2">
                                  📋 Sözleşme Şablonları ({message.action.data.contracts.length})
                                </h4>
                                <div className="space-y-2">
                                  {message.action.data.contracts.map((contract: any, index: number) => (
                                    <div key={index} className="p-3 bg-gray-800/50 rounded-lg border border-gray-600/50">
                                      <div className="font-medium text-sm text-white">
                                        {contract.title}
                                      </div>
                                      <div className="text-xs text-gray-400 mt-1">
                                        {contract.description}
                                      </div>
                                      <div className="flex items-center space-x-2 mt-2">
                                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30">
                                          {contract.category}
                                        </span>
                                        <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded border border-orange-500/30">
                                          {contract.subcategory}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
        </div>
      </div>
                            )}
                          </div>
                        )}
                </div>
              )}

                    {message.role === 'assistant' && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-600/50">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => giveFeedback(message.id, 'positive')}
                            className={`p-1 rounded-lg transition-all ${
                              message.feedback === 'positive'
                                ? 'text-green-400 bg-green-500/20 border border-green-500/30'
                                : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10'
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => giveFeedback(message.id, 'negative')}
                            className={`p-1 rounded-lg transition-all ${
                              message.feedback === 'negative'
                                ? 'text-red-400 bg-red-500/20 border border-red-500/30'
                                : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                            }`}
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => copyToClipboard(message.content)}
                            className="p-1 text-gray-400 hover:text-white hover:bg-gray-600/50 rounded-lg transition-all"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                </div>
              )}
            </div>
          </div>
        ))}
              
              {/* Thinking Process */}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="max-w-3xl rounded-2xl p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium text-blue-300">
                        Düşünüyor...
                      </span>
                    </div>
                    <p className="text-sm text-blue-200">{thinkingProcess}</p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
      </div>
          )}

              {/* Input Alanı */}
              <div className="p-4 border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto">
                  <div className="relative">
            <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Hukuki sorunuzu yazın..."
                    className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm resize-none"
                    rows={1}
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                  
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <button
                      onClick={isListening ? stopDictation : startDictation}
                      className={`p-2 rounded-lg transition-all ${
                        isListening 
                          ? 'text-red-400 bg-red-500/20 border border-red-500/30 animate-pulse' 
                          : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading}
                      className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {interimText && (
                  <div className="mt-2 text-sm text-gray-400">
                    <span className="text-blue-400">Dinleniyor:</span> {interimText}
                  </div>
                )}
              </div>
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalAssistantChat;