import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Phone, Mail, Clock, User, Bot, CheckCircle, AlertCircle } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  type?: 'text' | 'system';
}

interface LiveSupportProps {
  isOpen: boolean;
  onClose: () => void;
}

const LiveSupport: React.FC<LiveSupportProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '🧠 Merhaba! Avukat Bilgi Sistemi AI destek hizmetine hoş geldiniz. Derin düşünme modu aktif!\n\nSistem arızalarınızı detaylı açıklayın:\n• "Dava ekleme butonu çalışmıyor"\n• "Veri yüklenmiyor"\n• "Sistem yavaş çalışıyor"\n• "API bağlantı hatası"\n\nSorununuzu analiz edip çözüm önereceğim!',
      sender: 'support',
      timestamp: new Date(),
      type: 'system'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [supportStatus, setSupportStatus] = useState<'online' | 'away' | 'offline'>('online');
  const [aiInitialized, setAiInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Gemini AI'yı başlat
  useEffect(() => {
    const initializeAI = async () => {
      try {
        await geminiService.initialize('AIzaSyDeNAudg6oWG3JLwTXYXGhdspVDrDPGAyk');
        setAiInitialized(true);
        console.log('AI destek servisi başlatıldı');
      } catch (error) {
        console.error('AI başlatma hatası:', error);
        setSupportStatus('offline');
      }
    };

    if (isOpen) {
      initializeAI();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAISupportResponse = async (userMessage: string): Promise<string> => {
    try {
      // Derin düşünme modu için gelişmiş prompt
      const supportPrompt = `Sen Avukat Bilgi Sistemi'nin gelişmiş AI destek asistanısın. Kullanıcının sorununu derinlemesine analiz et ve çözüm öner.

Kullanıcı Sorunu: "${userMessage}"

Sistem Bilgileri:
- React + TypeScript Frontend
- FastAPI Backend (port 9000)
- Supabase Database
- Gemini AI Entegrasyonu
- Gerçek zamanlı veri çekme (Yargıtay, UYAP)
- Playwright ile web scraping

Analiz Süreci:
1. Sorunun türünü belirle (UI, Backend, Database, Network, API)
2. Olası nedenleri listele
3. Adım adım çözüm öner
4. Alternatif çözümler sun

Yanıt Formatı:
- Sorun türü: [Kategori]
- Analiz: [Kısa analiz]
- Çözüm: [Adım adım çözüm]
- Alternatif: [Yedek çözüm]

Örnekler:
- "Dava ekleme butonu çalışmıyor" → UI/JavaScript sorunu
- "Veri yüklenmiyor" → Backend/API sorunu  
- "Sistem yavaş" → Performance/Network sorunu
- "Hata mesajı alıyorum" → Error handling

Kısa ve net yanıt ver, teknik detayları açıkla.`;

      const response = await geminiService.analyzeText(supportPrompt);
      return response || 'Sorununuzu daha detaylı açıklayabilir misiniz?';
    } catch (error) {
      console.error('AI yanıt hatası:', error);
      return 'Teknik bir sorun oluştu. Lütfen sayfayı yenileyin ve tekrar deneyin.';
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !aiInitialized) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      // AI'dan yanıt al
      const aiResponse = await getAISupportResponse(newMessage);
      
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'support',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, supportMessage]);
    } catch (error) {
      console.error('Mesaj işleme hatası:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Üzgünüm, şu anda bir teknik sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.',
        sender: 'support',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusColor = () => {
    switch (supportStatus) {
      case 'online': return 'text-green-500';
      case 'away': return 'text-yellow-500';
      case 'offline': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (supportStatus) {
      case 'online': return 'Çevrimiçi';
      case 'away': return 'Uzakta';
      case 'offline': return 'Çevrimdışı';
      default: return 'Bilinmiyor';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md md:max-w-4xl h-[85vh] md:h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 md:p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
              <div className={`absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 rounded-full ${supportStatus === 'online' ? 'bg-green-400' : supportStatus === 'away' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base md:text-lg truncate">AI Destek</h3>
              <p className="text-xs md:text-sm opacity-90 truncate">
                <span className={getStatusColor()}>{getStatusText()}</span> • {aiInitialized ? 'AI Aktif' : 'AI Başlatılıyor...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 md:p-2 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.type === 'system'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.sender === 'support' && (
                    <div className="flex-shrink-0 mt-1">
                      {message.type === 'system' ? (
                        <Bot className="w-4 h-4 text-blue-500" />
                      ) : (
                        <User className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('tr-TR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-200 dark:bg-gray-600 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t dark:border-gray-700 p-3 md:p-4">
          <div className="flex space-x-2 md:space-x-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Mesajınızı yazın..."
                className="w-full p-2 md:p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm md:text-base"
                rows={2}
                disabled={!aiInitialized || supportStatus === 'offline'}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !aiInitialized || supportStatus === 'offline'}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-2 md:p-3 rounded-lg transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-2 md:mt-3 flex flex-wrap gap-1 md:gap-2">
            <button className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 md:px-3 py-1 rounded-full transition-colors flex items-center">
              <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">Telefon Desteği</span>
            </button>
            <button className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 md:px-3 py-1 rounded-full transition-colors flex items-center">
              <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">E-posta Gönder</span>
            </button>
            <button className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 md:px-3 py-1 rounded-full transition-colors flex items-center">
              <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">Geri Arama Talep Et</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSupport;
