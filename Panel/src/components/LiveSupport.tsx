import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Phone, Mail, Clock, User, Bot, CheckCircle, AlertCircle } from 'lucide-react';

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
      text: 'Merhaba! Avukat Bilgi Sistemi canlı destek hizmetine hoş geldiniz. Size nasıl yardımcı olabilirim?',
      sender: 'support',
      timestamp: new Date(),
      type: 'system'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [supportStatus, setSupportStatus] = useState<'online' | 'away' | 'offline'>('online');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendToWebhook = async (message: string) => {
    try {
      const webhookUrl = 'https://n8n.srv959585.hstgr.cloud/webhook/ec592cb3-b6cc-4b48-a832-7ba645c3e1b8';
      
      const payload = {
        message: message,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: Date.now().toString()
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('Mesaj webhook\'a gönderildi:', message);
    } catch (error) {
      console.error('Webhook gönderim hatası:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Mesajı webhook'a gönder
    await sendToWebhook(newMessage);
    
    setNewMessage('');
    setIsTyping(true);

    // Simulate support response
    setTimeout(() => {
      const supportResponses = [
        'Anlıyorum, bu konuda size yardımcı olabilirim. Daha detaylı bilgi verebilir misiniz?',
        'Bu sorunla ilgili size en iyi çözümü sunabilmek için sisteminizdeki durumu kontrol etmem gerekiyor.',
        'Bu özellik için teknik destek ekibimizle iletişime geçmenizi öneriyorum.',
        'Sorununuzu çözmek için adım adım ilerleyelim. Önce şu bilgileri paylaşabilir misiniz?',
        'Bu durumda size en uygun çözümü bulmak için birkaç seçenek var. Hangisini tercih edersiniz?',
        'Anladım, bu konuda size yardımcı olmak için gerekli bilgileri topluyorum.',
        'Bu sorunu çözmek için sisteminizi yeniden başlatmanızı öneriyorum.',
        'Bu özellik şu anda geliştirme aşamasında. Yakında kullanıma sunulacak.',
        'Size daha iyi yardımcı olabilmek için ekran görüntüsü paylaşabilir misiniz?',
        'Bu konuda uzman ekibimizle görüşmenizi sağlayacağım.'
      ];

      const randomResponse = supportResponses[Math.floor(Math.random() * supportResponses.length)];
      
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: 'support',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, supportMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 2000);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <MessageCircle className="w-6 h-6" />
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${supportStatus === 'online' ? 'bg-green-400' : supportStatus === 'away' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Canlı Destek</h3>
              <p className="text-sm opacity-90">
                <span className={getStatusColor()}>{getStatusText()}</span> • Ortalama yanıt süresi: 2 dakika
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
        <div className="border-t dark:border-gray-700 p-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Mesajınızı yazın..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={2}
                disabled={supportStatus === 'offline'}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || supportStatus === 'offline'}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1 rounded-full transition-colors">
              <Phone className="w-3 h-3 inline mr-1" />
              Telefon Desteği
            </button>
            <button className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1 rounded-full transition-colors">
              <Mail className="w-3 h-3 inline mr-1" />
              E-posta Gönder
            </button>
            <button className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1 rounded-full transition-colors">
              <Clock className="w-3 h-3 inline mr-1" />
              Geri Arama Talep Et
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSupport;
