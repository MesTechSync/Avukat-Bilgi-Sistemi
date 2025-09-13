import React, { useState } from 'react';
import { MessageCircle, Phone, Send, Bot, Clock, CheckCircle2, Users, Zap } from 'lucide-react';

interface WhatsAppMessage {
  id: string;
  from: string;
  message: string;
  timestamp: Date;
  type: 'incoming' | 'outgoing';
  status: 'sent' | 'delivered' | 'read';
}

function WhatsAppIntegration() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([
    {
      id: '1',
      from: '+90 555 123 4567',
      message: 'Merhaba, boşanma davası hakkında bilgi almak istiyorum.',
      timestamp: new Date(Date.now() - 300000),
      type: 'incoming',
      status: 'read'
    },
    {
      id: '2',
      from: 'SonKarar AI',
      message: `🏛️ SonKarar Hukuki Asistan

Merhaba! Boşanma davası konusunda size yardımcı olabilirim.

📋 Size sunabileceğim hizmetler:
1️⃣ Boşanma dilekçesi hazırlama
2️⃣ İlgili içtihatları bulma
3️⃣ Gerekli belgeler listesi
4️⃣ Süreç hakkında bilgilendirme

Hangi konuda yardıma ihtiyacınız var?`,
      timestamp: new Date(Date.now() - 240000),
      type: 'outgoing',
      status: 'read'
    },
    {
      id: '3',
      from: '+90 555 123 4567',
      message: 'Dilekçe hazırlamak istiyorum. Anlaşmalı boşanma için.',
      timestamp: new Date(Date.now() - 180000),
      type: 'incoming',
      status: 'read'
    }
  ]);

  const stats = {
    totalMessages: 1247,
    activeChats: 23,
    responseTime: '2.3 dk',
    satisfactionRate: 94
  };

  const quickReplies = [
    '🏛️ Ana Menü',
    '📚 İçtihat Ara',
    '📝 Dilekçe Hazırla',
    '⚖️ Hukuki Danışmanlık',
    '📞 Canlı Destek'
  ];

  const handleConnect = () => {
    if (phoneNumber) {
      setIsConnected(true);
      // Simulate WhatsApp Business API connection
      setTimeout(() => {
        alert('WhatsApp Business API başarıyla bağlandı!');
      }, 1000);
    }
  };

  const sendMessage = (message: string) => {
    const newMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      from: 'SonKarar AI',
      message,
      timestamp: new Date(),
      type: 'outgoing',
      status: 'sent'
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <MessageCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">WhatsApp Business Entegrasyonu</h1>
            <p className="text-green-100">7/24 Hukuki Destek ve AI Asistan</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-300' : 'bg-red-300'}`}></div>
            <span className="text-sm">{isConnected ? 'Bağlı' : 'Bağlı Değil'}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Mesaj</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {stats.totalMessages.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Aktif Sohbet</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {stats.activeChats}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Yanıt Süresi</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {stats.responseTime}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Memnuniyet</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                %{stats.satisfactionRate}
              </p>
            </div>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            WhatsApp Yapılandırması
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                WhatsApp Business Numarası
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+90 555 123 4567"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

          </div>

            <button
              onClick={handleConnect}
              disabled={!phoneNumber || isConnected}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {isConnected ? 'Bağlandı' : 'WhatsApp\'a Bağlan'}
            </button>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Otomatik Yanıtlar
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Hoş geldin mesajı
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Mesaj dışı saatlerde otomatik yanıt
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    AI asistan aktif
                  </span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-96">
          {/* Chat Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                SonKarar AI Asistan
              </h4>
              <p className="text-sm text-green-600 dark:text-green-400">
                Çevrimiçi • Hukuki Destek
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'outgoing'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.message}
                  </div>
                  <div className="flex items-center gap-1 mt-1 justify-end">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString('tr-TR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {message.type === 'outgoing' && (
                      <CheckCircle2 className="w-3 h-3 opacity-70" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Replies */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2 mb-3">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(reply)}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Mesaj yazın..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          WhatsApp Özellikleri
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                AI Hukuki Asistan
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                7/24 otomatik hukuki danışmanlık ve destek
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                Anında Yanıt
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ortalama 2.3 dakikada profesyonel yanıt
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                Akıllı Yönlendirme
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Soruları otomatik olarak ilgili uzmana yönlendir
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          📱 WhatsApp Business API Kurulum Rehberi
        </h3>
        
        <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
          <div className="flex items-start gap-2">
            <span className="font-medium">1.</span>
            <span>WhatsApp Business hesabınızı oluşturun ve doğrulayın</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">2.</span>
            <span>Facebook Business Manager'da WhatsApp Business API'yi aktifleştirin</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">3.</span>
            <span>Webhook URL'nizi yapılandırın ve token'ları ayarlayın</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">4.</span>
            <span>Mesaj şablonlarınızı oluşturun ve onaya gönderin</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">5.</span>
            <span>AI asistan ayarlarını yapılandırın ve test edin</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhatsAppIntegration;