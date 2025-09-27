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
      const supportPrompt = `Sen Avukat Bilgi Sistemi'nin uzman AI destek asistanısın. Kullanıcının sorununu analiz et ve PRATİK çözümler sun.

Kullanıcı Sorunu: "${userMessage}"

Sistem Mimarisi:
- Frontend: React + TypeScript (Vite build)
- Backend: FastAPI (port 9000) - panel_backend_enterprise.py
- Database: Supabase
- AI: Gemini API
- Veri Kaynakları: Yargıtay, UYAP (Playwright scraping)

SORUN TESPİTİ VE ÇÖZÜM:

1. "Dava ekleme butonu çalışmıyor" → 
   - Sorun: JavaScript hatası veya form validation
   - Çözüm: Tarayıcı konsolu kontrol et (F12), sayfayı yenile, JavaScript aktif mi?

2. "Veri yüklenmiyor" → 
   - Sorun: Backend bağlantısı (port 9000) veya API hatası
   - Çözüm: Backend servisi çalışıyor mu? Network sekmesinde hata var mı?

3. "Sistem yavaş çalışıyor" → 
   - Sorun: Network gecikmesi veya büyük veri yükleme
   - Çözüm: Cache temizle, internet hızını kontrol et

4. "API bağlantı hatası" → 
   - Sorun: Backend servisi kapalı veya CORS hatası
   - Çözüm: Backend'i başlat (python -m uvicorn panel_backend_enterprise:app --host 127.0.0.1 --port 9000)

YANIT FORMATI:
🔍 Sorun: [Kısa tanım]
💡 Çözüm: [Adım adım]
🛠️ Alternatif: [Yedek çözüm]

Kısa, net ve uygulanabilir yanıt ver. Teknik jargon kullanma.`;

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md md:max-w-4xl h-[85vh] md:h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-4 md:p-6 flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90"></div>
          <div className="relative flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white ${supportStatus === 'online' ? 'bg-green-400' : supportStatus === 'away' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg md:text-xl truncate">🧠 AI Destek Asistanı</h3>
              <p className="text-sm md:text-base opacity-90 truncate">
                <span className="font-medium">{getStatusText()}</span> • {aiInitialized ? 'Derin Düşünme Aktif' : 'Başlatılıyor...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="relative text-white hover:bg-white/20 rounded-xl p-2 md:p-3 transition-all duration-200 flex-shrink-0 group"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
            >
              <div
                className={`max-w-[75%] rounded-2xl p-4 md:p-5 shadow-lg border transition-all duration-200 group-hover:shadow-xl ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400'
                    : message.type === 'system'
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700'
                    : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-500'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {message.sender === 'support' && (
                    <div className="flex-shrink-0 mt-1">
                      {message.type === 'system' ? (
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{message.text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs opacity-70 font-medium">
                        {message.timestamp.toLocaleTimeString('tr-TR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      {message.sender === 'support' && (
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
          
          {isTyping && (
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
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 md:p-6 bg-white dark:bg-gray-900">
          <div className="flex space-x-3 md:space-x-4">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Sorununuzu detaylı açıklayın... (örn: 'Dava ekleme butonu çalışmıyor')"
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-2xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm md:text-base transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
                rows={3}
                disabled={!aiInitialized || supportStatus === 'offline'}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !aiInitialized || supportStatus === 'offline'}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white p-4 rounded-2xl transition-all duration-200 flex-shrink-0 shadow-lg hover:shadow-xl disabled:shadow-none group"
            >
              <Send className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-4 flex flex-wrap gap-2 md:gap-3">
            <button 
              onClick={() => setNewMessage('Dava ekleme butonu çalışmıyor')}
              className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 px-3 py-2 rounded-full transition-all duration-200 flex items-center border border-blue-200 dark:border-blue-700"
            >
              <span className="text-blue-600 dark:text-blue-300 font-medium">🚨 Dava Butonu</span>
            </button>
            <button 
              onClick={() => setNewMessage('Veri yüklenmiyor')}
              className="text-xs bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/50 dark:hover:to-emerald-900/50 px-3 py-2 rounded-full transition-all duration-200 flex items-center border border-green-200 dark:border-green-700"
            >
              <span className="text-green-600 dark:text-green-300 font-medium">📊 Veri Sorunu</span>
            </button>
            <button 
              onClick={() => setNewMessage('Sistem yavaş çalışıyor')}
              className="text-xs bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 hover:from-yellow-100 hover:to-orange-100 dark:hover:from-yellow-900/50 dark:hover:to-orange-900/50 px-3 py-2 rounded-full transition-all duration-200 flex items-center border border-yellow-200 dark:border-yellow-700"
            >
              <span className="text-yellow-600 dark:text-yellow-300 font-medium">⚡ Performans</span>
            </button>
            <button 
              onClick={() => setNewMessage('API bağlantı hatası')}
              className="text-xs bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/50 dark:hover:to-pink-900/50 px-3 py-2 rounded-full transition-all duration-200 flex items-center border border-red-200 dark:border-red-700"
            >
              <span className="text-red-600 dark:text-red-300 font-medium">🔧 API Hatası</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSupport;
