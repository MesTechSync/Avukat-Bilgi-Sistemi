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
      text: '🔧 Merhaba! Avukat Bilgi Sistemi Teknik Destek Asistanına hoş geldiniz.\n\nSistem arızalarınızı çözmek için buradayım. Hangi sorunla karşılaşıyorsunuz?\n\n🚨 **Yaygın Sorunlar:**\n• Dava ekleme butonu çalışmıyor\n• Veri yüklenmiyor veya kaydedilmiyor\n• Sistem yavaş çalışıyor\n• API bağlantı hatası alıyorum\n• Sayfa açılmıyor veya donuyor\n\nSorununuzu detaylı açıklayın, derin analiz yapıp çözüm sunacağım!',
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
      // Teknik destek odaklı prompt
      const supportPrompt = `Sen Avukat Bilgi Sistemi'nin TEKNİK DESTEK asistanısın. SADECE sistem arızaları ve teknik sorunlar hakkında konuş.

Kullanıcı Sorunu: "${userMessage}"

ÖNEMLİ: Hukuki konular, dilekçe yazma, hukuk danışmanlığı hakkında KONUŞMA. Sadece teknik destek ver.

Sistem Teknik Detayları:
- Frontend: React + TypeScript (Vite build)
- Backend: FastAPI (port 9000) - panel_backend_enterprise.py
- Database: Supabase
- AI: Gemini API
- Veri Kaynakları: Yargıtay, UYAP (Playwright scraping)

TEKNİK SORUN ÇÖZÜMLERİ:

1. "Dava ekleme butonu çalışmıyor" → 
   🔍 Sorun: JavaScript hatası, form validation veya event handler sorunu
   💡 Çözüm: 
   - Tarayıcı konsolu kontrol et (F12 → Console)
   - Sayfayı yenile (Ctrl+F5)
   - JavaScript aktif mi kontrol et
   - Form alanları dolu mu kontrol et
   🛠️ Alternatif: Farklı tarayıcı dene

2. "Veri yüklenmiyor" → 
   🔍 Sorun: Backend bağlantısı (port 9000) veya API hatası
   💡 Çözüm:
   - Network sekmesinde hata var mı kontrol et (F12 → Network)
   - Backend servisi çalışıyor mu? (http://127.0.0.1:9000)
   - İnternet bağlantısı kontrol et
   🛠️ Alternatif: Backend'i yeniden başlat

3. "Sistem yavaş çalışıyor" → 
   🔍 Sorun: Network gecikmesi, büyük veri yükleme veya tarayıcı cache
   💡 Çözüm:
   - Tarayıcı cache temizle (Ctrl+Shift+Delete)
   - İnternet hızını kontrol et
   - Diğer sekmeleri kapat
   🛠️ Alternatif: Farklı tarayıcı kullan

4. "API bağlantı hatası" → 
   🔍 Sorun: Backend servisi kapalı veya CORS hatası
   💡 Çözüm:
   - Backend'i başlat: python -m uvicorn panel_backend_enterprise:app --host 127.0.0.1 --port 9000
   - Port 9000'in açık olduğunu kontrol et
   - Firewall ayarlarını kontrol et
   🛠️ Alternatif: Backend'i yeniden kur

YANIT FORMATI:
🔍 Sorun: [Teknik tanım]
💡 Çözüm: [Adım adım teknik çözüm]
🛠️ Alternatif: [Yedek teknik çözüm]

SADECE teknik destek ver. Hukuki konular hakkında konuşma.`;

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md md:max-w-4xl h-[90vh] md:h-[700px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4 md:p-6 flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/95 via-purple-600/95 to-indigo-600/95"></div>
          <div className="relative flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-white bg-green-400 animate-pulse"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg md:text-xl truncate">🔧 Teknik Destek</h3>
              <p className="text-sm md:text-base opacity-90 truncate">
                <span className="font-medium">Çevrimiçi</span> • Derin Analiz Aktif
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
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 bg-gradient-to-b from-blue-50/30 to-white dark:from-gray-800 dark:to-gray-900">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 md:p-5 shadow-lg transition-all duration-200 group-hover:shadow-xl ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                    : message.type === 'system'
                    ? 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-200 dark:border-gray-600'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {message.sender === 'support' && (
                    <div className="flex-shrink-0 mt-1">
                      {message.type === 'system' ? (
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
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
              <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-md p-4 shadow-lg border border-gray-200 dark:border-gray-600 group-hover:shadow-xl transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">AI analiz ediyor...</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                placeholder="Teknik sorununuzu açıklayın... (örn: 'Dava ekleme butonu çalışmıyor')"
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-3xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm md:text-base transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
                rows={2}
                disabled={!aiInitialized || supportStatus === 'offline'}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !aiInitialized || supportStatus === 'offline'}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white p-4 rounded-full transition-all duration-200 flex-shrink-0 shadow-lg hover:shadow-xl disabled:shadow-none group"
            >
              <Send className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-4 flex flex-wrap gap-2 md:gap-3">
            <button 
              onClick={() => setNewMessage('Dava ekleme butonu çalışmıyor')}
              className="text-xs bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/50 dark:hover:to-pink-900/50 px-3 py-2 rounded-full transition-all duration-200 flex items-center border border-red-200 dark:border-red-700 hover:scale-105"
            >
              <span className="text-red-600 dark:text-red-300 font-medium">🚨 Dava Butonu</span>
            </button>
            <button 
              onClick={() => setNewMessage('Veri yüklenmiyor')}
              className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 px-3 py-2 rounded-full transition-all duration-200 flex items-center border border-blue-200 dark:border-blue-700 hover:scale-105"
            >
              <span className="text-blue-600 dark:text-blue-300 font-medium">📊 Veri Sorunu</span>
            </button>
            <button 
              onClick={() => setNewMessage('Sistem yavaş çalışıyor')}
              className="text-xs bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 hover:from-yellow-100 hover:to-orange-100 dark:hover:from-yellow-900/50 dark:hover:to-orange-900/50 px-3 py-2 rounded-full transition-all duration-200 flex items-center border border-yellow-200 dark:border-yellow-700 hover:scale-105"
            >
              <span className="text-yellow-600 dark:text-yellow-300 font-medium">⚡ Performans</span>
            </button>
            <button 
              onClick={() => setNewMessage('API bağlantı hatası')}
              className="text-xs bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50 px-3 py-2 rounded-full transition-all duration-200 flex items-center border border-purple-200 dark:border-purple-700 hover:scale-105"
            >
              <span className="text-purple-600 dark:text-purple-300 font-medium">🔧 API Hatası</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSupport;
