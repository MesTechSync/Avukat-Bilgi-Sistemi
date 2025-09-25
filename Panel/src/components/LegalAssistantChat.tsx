import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Copy, ThumbsUp, ThumbsDown, Trash2, Zap, Scale, FileText, Search, BookOpen, Mic, Paperclip, ArrowUp, ChevronUp, Brain, Lightbulb, Target, Clock, Shield, Users, Gavel } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { geminiService } from '../services/geminiService';
import { useDictation } from '../hooks/useDictation';

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
}

interface QuickStartOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  category: string;
}

const LegalAssistantChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>('gemini');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingProcess, setThinkingProcess] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isListening, startDictation, stopDictation, interimText } = useDictation();

  // Hızlı başlat seçenekleri
  const quickStartOptions: QuickStartOption[] = [
    {
      id: 'legal-support',
      title: 'Hukuki Destek Ver',
      description: 'Genel hukuki danışmanlık',
      icon: <Scale className="w-6 h-6" />,
      prompt: 'Hukuki bir sorunum var ve profesyonel destek istiyorum. Detaylı analiz ve çözüm önerileri sunabilir misin?',
      category: 'genel'
    },
    {
      id: 'lawsuit-petition',
      title: 'Dava Dilekçesi Hazırla',
      description: 'Dava açmak için dilekçe',
      icon: <FileText className="w-6 h-6" />,
      prompt: 'Dava dilekçesi hazırlamak istiyorum. Hangi tür dava açacağımı belirleyip, profesyonel bir dilekçe hazırlayabilir misin?',
      category: 'dilekçe'
    },
    {
      id: 'response-petition',
      title: 'Cevap Dilekçesi Hazırla',
      description: 'Davalı olarak cevap',
      icon: <FileText className="w-6 h-6" />,
      prompt: 'Bana açılan davaya cevap dilekçesi hazırlamak istiyorum. Savunma stratejisi ve hukuki argümanlar önerebilir misin?',
      category: 'dilekçe'
    },
    {
      id: 'contract-prepare',
      title: 'Sözleşme Hazırla',
      description: 'Hukuki sözleşme düzenleme',
      icon: <FileText className="w-6 h-6" />,
      prompt: 'Hukuki bir sözleşme hazırlamak istiyorum. Sözleşme türünü belirleyip, tüm hukuki gereklilikleri içeren profesyonel bir sözleşme hazırlayabilir misin?',
      category: 'sözleşme'
    },
    {
      id: 'appeal-petition',
      title: 'İstinaf/Temyiz Dilekçesi Hazırla',
      description: 'Üst mahkemeye başvuru',
      icon: <FileText className="w-6 h-6" />,
      prompt: 'Mahkeme kararına karşı istinaf/temyiz dilekçesi hazırlamak istiyorum. Hukuki gerekçeler ve prosedür hakkında bilgi verebilir misin?',
      category: 'dilekçe'
    },
    {
      id: 'case-law-search',
      title: 'İçtihat Ara',
      description: 'Yargıtay kararları',
      icon: <Search className="w-6 h-6" />,
      prompt: 'Belirli bir konuda Yargıtay içtihatları arıyorum. İlgili kararları bulup analiz edebilir misin?',
      category: 'araştırma'
    },
    {
      id: 'legislation-search',
      title: 'Mevzuat Ara',
      description: 'Kanun ve yönetmelikler',
      icon: <BookOpen className="w-6 h-6" />,
      prompt: 'Belirli bir konuda mevcut mevzuatı araştırmak istiyorum. İlgili kanun, yönetmelik ve düzenlemeleri bulabilir misin?',
      category: 'araştırma'
    },
    {
      id: 'expert-objection',
      title: 'Bilirkişi Raporuna İtiraz Dilekçesi Hazırla',
      description: 'Bilirkişi raporuna itiraz',
      icon: <FileText className="w-6 h-6" />,
      prompt: 'Bilirkişi raporuna itiraz dilekçesi hazırlamak istiyorum. Rapordaki hataları tespit edip, hukuki itiraz gerekçeleri sunabilir misin?',
      category: 'dilekçe'
    }
  ];

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
      const response = await geminiService.analyzeText(
        `Sen Türkiye'nin en deneyimli hukuk asistanısın. Kullanıcının sorusuna profesyonel, detaylı ve pratik bir yanıt ver. 
        
        Soru: ${messageToSend}
        
        Yanıtında şunları dahil et:
        1. Hukuki analiz ve değerlendirme
        2. İlgili mevzuat referansları
        3. Pratik çözüm önerileri
        4. Dikkat edilmesi gereken noktalar
        5. Sonraki adımlar
        
        Yanıtını Türkçe, anlaşılır ve profesyonel bir dille ver.`,
        messageToSend
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        model: selectedModel,
        confidence: 0.95,
        thinking: thinkingProcess
      };

      setMessages(prev => [...prev, assistantMessage]);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const giveFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ));
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-gray-900 dark:to-black">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Hukuk Asistanı
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                AI Destekli Hukuki Danışmanlık
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearChat}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Sohbeti Temizle"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Welcome Section */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                İyi günler, Muhammed Tosun
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Size nasıl yardımcı olabilirim? Hukuki sorularınızı sorabilir veya aşağıdaki hızlı başlat seçeneklerini kullanabilirsiniz.
              </p>
            </div>

            {/* Quick Start Options */}
            <div className="w-full max-w-4xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                Hızlı Başlat
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickStartOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleQuickStart(option)}
                    className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-200 group"
                  >
                    <div className="text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                      {option.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
                      {option.title}
                    </span>
                  </button>
                ))}
              </div>
              <div className="text-center mt-4">
                <button className="flex items-center justify-center space-x-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                  <ChevronUp className="w-4 h-4" />
                  <span className="text-sm">Daralt</span>
                </button>
              </div>
        </div>
      </div>
        )}

        {/* Chat Messages */}
        {messages.length > 0 && (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Bot className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">Hukuk Asistanı</span>
                      {message.confidence && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          %{Math.round(message.confidence * 100)} Güven
                        </span>
                      )}
                </div>
              )}
                  
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>

                  {message.role === 'assistant' && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => giveFeedback(message.id, 'positive')}
                          className={`p-1 rounded ${
                            message.feedback === 'positive'
                              ? 'text-green-600 bg-green-100'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-100'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => giveFeedback(message.id, 'negative')}
                          className={`p-1 rounded ${
                            message.feedback === 'negative'
                              ? 'text-red-600 bg-red-100'
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-100'
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
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
                <div className="max-w-3xl rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Düşünüyor...
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {thinkingProcess}
                  </p>
                </div>
              </div>
            )}

            {/* Loading */}
            {isLoading && !isThinking && (
              <div className="flex justify-start">
                <div className="max-w-3xl rounded-lg p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Yanıt hazırlanıyor...
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
      </div>
        )}

        {/* Input Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-end space-x-3">
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            
            <div className="flex-1 relative">
          <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Hukuki sorunuzu yazın..."
                className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              
              <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                <button
                  onClick={isListening ? stopDictation : startDictation}
                  className={`p-1 rounded ${
                    isListening 
                      ? 'text-red-600 bg-red-100' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>

      {/* Footer */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
          <a href="#" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            Gizlilik Politikası
          </a>
          <a href="#" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            Hizmet Şartları
          </a>
        </div>
      </div>
    </div>
  );
};

export default LegalAssistantChat;
