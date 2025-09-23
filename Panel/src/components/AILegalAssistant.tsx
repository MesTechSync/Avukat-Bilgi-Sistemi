import React, { useState } from 'react';
import { Brain, MessageCircle, Zap, Target, TrendingUp, Shield, Clock } from 'lucide-react';

interface LegalAdvice {
  id: string;
  type: 'strategy' | 'risk' | 'opportunity' | 'warning';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionItems: string[];
  timeline: string;
}

const AILegalAssistant: React.FC = () => {
  const [currentCase, setCurrentCase] = useState('');
  const [legalAdvice, setLegalAdvice] = useState<LegalAdvice[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateLegalAdvice = async (caseDescription: string) => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const advice: LegalAdvice[] = [
      {
        id: 'advice-1',
        type: 'strategy',
        title: 'Kazanma Stratejisi',
        description: 'Bu dava türünde %87 başarı oranı ile kazanma stratejisi öneriyorum.',
        confidence: 87,
        impact: 'high',
        actionItems: [
          'Delil toplama sürecini başlatın',
          'Tanık listesi hazırlayın',
          'Hukuki dayanakları güçlendirin'
        ],
        timeline: '2-3 hafta'
      },
      {
        id: 'advice-2',
        type: 'risk',
        title: 'Risk Analizi',
        description: 'Dikkat edilmesi gereken 3 kritik risk faktörü tespit ettim.',
        confidence: 92,
        impact: 'high',
        actionItems: [
          'Zaman aşımı riskini kontrol edin',
          'Delil kaybı riskini minimize edin'
        ],
        timeline: '1 hafta'
      }
    ];
    
    setLegalAdvice(advice);
    setIsAnalyzing(false);
  };

  const getAdviceIcon = (type: string) => {
    switch (type) {
      case 'strategy': return <Target className="w-5 h-5" />;
      case 'risk': return <Shield className="w-5 h-5" />;
      case 'opportunity': return <TrendingUp className="w-5 h-5" />;
      case 'warning': return <Zap className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getAdviceColor = (type: string) => {
    switch (type) {
      case 'strategy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'risk': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'opportunity': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              AI Hukuki Asistan
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Yapay zeka destekli hukuki tavsiye ve strateji önerileri
          </p>
        </div>

        {/* Case Input */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Dava Detaylarını Girin
            </h3>
            <textarea
              value={currentCase}
              onChange={(e) => setCurrentCase(e.target.value)}
              placeholder="Dava türü, taraflar, olaylar, deliller ve diğer önemli detayları yazın..."
              className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            />
            <button
              onClick={() => generateLegalAdvice(currentCase)}
              disabled={!currentCase.trim() || isAnalyzing}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Brain className="w-5 h-5" />
              )}
              {isAnalyzing ? 'Analiz Ediliyor...' : 'Hukuki Tavsiye Al'}
            </button>
          </div>
        </div>

        {/* Legal Advice */}
        {legalAdvice.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              AI Hukuki Tavsiyeleri
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {legalAdvice.map((advice) => (
                <div key={advice.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getAdviceColor(advice.type)}`}>
                        {getAdviceIcon(advice.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-white">{advice.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Güven: %{advice.confidence}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{advice.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Aksiyon Planı:</h5>
                      <ul className="space-y-1">
                        {advice.actionItems.map((item, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Tahmini süre: {advice.timeline}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AILegalAssistant;