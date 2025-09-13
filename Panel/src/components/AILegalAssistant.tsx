import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader, MessageSquare, Search, FileText, Scale, Phone } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    searchResults?: any[];
    petitionGenerated?: boolean;
    documentAnalyzed?: boolean;
  };
}

interface AILegalAssistantProps {
  onSearchRequest?: (query: string) => void;
  onPetitionRequest?: (data: any) => void;
}

export default function AILegalAssistant({ onSearchRequest, onPetitionRequest }: AILegalAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `\🏛️ **Karar Hukuki Asistan**

Merhaba! Ben yapay zeka destekli hukuki asistanınızım. Size şu konularda yardımcı olabilirim:

📚 **İçtihat Arama** - Milyonlarca karar arasından arama
📝 **Dilekçe Hazırlama** - Dava, cevap, istinaf dilekçeleri
📄 **Belge Analizi** - Hukuki belgelerin incelenmesi
⚖️ **Hukuki Danışmanlık** - Genel hukuki sorular
📱 **WhatsApp Desteği** - 7/24 erişim

Hangi konuda yardıma ihtiyacınız var?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = async (userMessage: string): Promise<Message> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const lowerMessage = userMessage.toLowerCase();
    
    // İçtihat arama
    if (lowerMessage.includes('içtihat') || lowerMessage.includes('karar') || lowerMessage.includes('ara')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `🔍 **İçtihat Arama Sonuçları**

"${userMessage}" sorgunuz için bulunan kararlar:

**1. Yargıtay 4. Hukuk Dairesi - 2023/1234**
📅 Karar Tarihi: 15.06.2023
📋 Konu: ${userMessage}
⭐ İlgililik: %95

**2. Danıştay 5. Dairesi - 2023/5678**
📅 Karar Tarihi: 22.08.2023
📋 Konu: İlgili hukuki düzenleme
⭐ İlgililik: %87

**3. Bölge Adliye Mahkemesi - 2023/9012**
📅 Karar Tarihi: 03.09.2023
📋 Konu: Benzer dava örneği
⭐ İlgililik: %82

💡 **AI Önerisi:** Bu kararlar sizin durumunuzla yüksek benzerlik gösteriyor. Detaylı inceleme için tıklayabilirsiniz.

Başka bir arama yapmak ister misiniz?`,
        timestamp: new Date(),
        metadata: { searchResults: [] }
      };
    }

    // Dilekçe hazırlama
    if (lowerMessage.includes('dilekçe') || lowerMessage.includes('dava') || lowerMessage.includes('hazırla')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `📝 **Dilekçe Hazırlama Asistanı**

Hangi tür dilekçe hazırlamak istiyorsunuz?

**1. 🏛️ Dava Dilekçesi**
- İş hukuku davaları
- Ticari alacak davaları
- Tazminat davaları
- Boşanma davaları

**2. 📋 Cevap Dilekçesi**
- Dava cevabı hazırlama
- Delil listesi oluşturma
- Hukuki savunma stratejisi

**3. ⚖️ İstinaf Dilekçesi**
- Temyiz başvurusu
- İstinaf mahkemesi dilekçesi
- Hukuki gerekçelendirme

**4. 📄 Sözleşme Hazırlama**
- İş sözleşmeleri
- Ticari sözleşmeler
- Kira sözleşmeleri

Lütfen dilekçe türünü belirtin ve gerekli bilgileri paylaşın.`,
        timestamp: new Date(),
        metadata: { petitionGenerated: false }
      };
    }

    // Genel hukuki sorular
    if (lowerMessage.includes('hak') || lowerMessage.includes('yasa') || lowerMessage.includes('kanun')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `⚖️ **Hukuki Danışmanlık**

Sorunuz: "${userMessage}"

**Hukuki Değerlendirme:**
Bu konu Türk hukuk sisteminde önemli bir yere sahiptir. İlgili mevzuat ve içtihatlar ışığında:

📚 **İlgili Kanunlar:**
- Türk Medeni Kanunu md. 23-25
- Türk Borçlar Kanunu md. 112-125
- İş Kanunu md. 18-32

🏛️ **Emsal Kararlar:**
- Yargıtay HGK 2022/1456 sayılı kararı
- Anayasa Mahkemesi 2021/89 sayılı kararı

💡 **Önerim:**
1. Öncelikle mevcut durumunuzu detaylandırın
2. İlgili belgeleri toplayın
3. Hukuki süreç için hazırlık yapın

Daha detaylı bilgi için lütfen durumunuzu açıklayın.`,
        timestamp: new Date()
      };
    }

    // WhatsApp entegrasyonu
    if (lowerMessage.includes('whatsapp') || lowerMessage.includes('telefon') || lowerMessage.includes('iletişim')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `📱 **WhatsApp Hukuki Asistan**

7/24 WhatsApp üzerinden hukuki destek alabilirsiniz!

**📞 WhatsApp Numarası:** +90 555 123 4567

**🔥 WhatsApp Özellikleri:**
✅ Anında hukuki danışmanlık
✅ İçtihat arama
✅ Dilekçe hazırlama
✅ Belge analizi
✅ Dava takibi
✅ Randevu alma

**💬 Kullanım:**
1. WhatsApp'tan numaramızı kaydedin
2. "Merhaba" yazarak başlayın
3. Menüden istediğiniz hizmeti seçin

**⏰ Çalışma Saatleri:**
- Pazartesi-Cuma: 09:00-18:00 (Canlı destek)
- Hafta sonu: AI asistan aktif

Hemen WhatsApp'tan yazabilirsiniz!`,
        timestamp: new Date()
      };
    }

    // Varsayılan yanıt
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: `🤖 **AI Asistan Yanıtı**

"${userMessage}" konusunda size yardımcı olmaya çalışıyorum.

**🎯 Size önerebileceğim hizmetler:**

1. **📚 İçtihat Arama** - "içtihat ara" yazın
2. **📝 Dilekçe Hazırlama** - "dilekçe hazırla" yazın  
3. **⚖️ Hukuki Danışmanlık** - Sorunuzu detaylandırın
4. **📱 WhatsApp Desteği** - "whatsapp" yazın

Lütfen daha spesifik bir soru sorun veya yukarıdaki seçeneklerden birini tercih edin.

**💡 Örnek sorular:**
- "Boşanma davası nasıl açılır?"
- "İş mahkemesi kararları ara"
- "Kira sözleşmesi hazırla"
- "Tazminat davası dilekçesi"`,
      timestamp: new Date()
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await simulateAIResponse(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: '❌ Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: Search, text: 'İçtihat Ara', action: () => setInputMessage('içtihat ara') },
    { icon: FileText, text: 'Dilekçe Hazırla', action: () => setInputMessage('dilekçe hazırla') },
    { icon: Scale, text: 'Hukuki Danışmanlık', action: () => setInputMessage('hukuki danışmanlık') },
    { icon: Phone, text: 'WhatsApp Destek', action: () => setInputMessage('whatsapp') }
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            SonKarar AI Hukuki Asistan
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            7/24 Yapay Zeka Destekli Hukuki Danışmanlık
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Çevrimiçi</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="flex items-center gap-2 p-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <action.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-gray-700 dark:text-gray-300">{action.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString('tr-TR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  AI düşünüyor...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Hukuki sorunuzu yazın... (Enter ile gönder)"
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          💡 İpucu: "içtihat ara", "dilekçe hazırla", "whatsapp" gibi komutları kullanabilirsiniz
        </div>
      </div>
    </div>
  );
}