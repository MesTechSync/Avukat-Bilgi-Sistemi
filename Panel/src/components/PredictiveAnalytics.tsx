import React, { useState } from 'react';
import { TrendingUp, BarChart3, PieChart, Activity, Target, AlertTriangle } from 'lucide-react';

interface PredictionResult {
  caseId: string;
  successProbability: number;
  estimatedDuration: string;
  keyFactors: Array<{
    factor: string;
    impact: number;
    trend: 'positive' | 'negative' | 'neutral';
  }>;
  riskFactors: string[];
  opportunities: string[];
  similarCases: Array<{
    caseNumber: string;
    outcome: string;
    similarity: number;
    duration: string;
  }>;
}

const PredictiveAnalytics: React.FC = () => {
  const [caseDescription, setCaseDescription] = useState('');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generatePrediction = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const result: PredictionResult = {
      caseId: 'PRED-2024-001',
      successProbability: 78,
      estimatedDuration: '6-8 ay',
      keyFactors: [
        { factor: 'Delil Gücü', impact: 85, trend: 'positive' },
        { factor: 'Hukuki Dayanak', impact: 72, trend: 'positive' },
        { factor: 'Tanık Güvenilirliği', impact: 68, trend: 'neutral' },
        { factor: 'Zaman Aşımı Riski', impact: 45, trend: 'negative' },
        { factor: 'Karşı Taraf Gücü', impact: 60, trend: 'negative' }
      ],
      riskFactors: [
        'Zaman aşımı süresi yaklaşıyor',
        'Karşı tarafın güçlü savunması',
        'Delil toplama zorluğu'
      ],
      opportunities: [
        'Karşı tarafın zayıf noktaları',
        'Yeni delil bulma fırsatları',
        'Arabuluculuk süreci'
      ],
      similarCases: [
        { caseNumber: '2024/1234', outcome: 'Kazanıldı', similarity: 95, duration: '5 ay' },
        { caseNumber: '2024/5678', outcome: 'Kazanıldı', similarity: 87, duration: '7 ay' },
        { caseNumber: '2024/9012', outcome: 'Kaybedildi', similarity: 82, duration: '8 ay' }
      ]
    };
    
    setPrediction(result);
    setIsAnalyzing(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'neutral': return <Activity className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'positive': return 'text-green-600 dark:text-green-400';
      case 'negative': return 'text-red-600 dark:text-red-400';
      case 'neutral': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Tahmine Dayalı Analiz
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            AI destekli dava sonucu tahmini ve risk analizi
          </p>
        </div>

        {/* Input */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Dava Bilgilerini Girin
            </h3>
            <textarea
              value={caseDescription}
              onChange={(e) => setCaseDescription(e.target.value)}
              placeholder="Dava türü, taraflar, deliller, hukuki dayanaklar ve diğer önemli faktörleri yazın..."
              className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            />
            <button
              onClick={generatePrediction}
              disabled={!caseDescription.trim() || isAnalyzing}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <BarChart3 className="w-5 h-5" />
              )}
              {isAnalyzing ? 'Analiz Ediliyor...' : 'Tahmin Oluştur'}
            </button>
          </div>
        </div>

        {/* Prediction Results */}
        {prediction && (
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <PieChart className="w-6 h-6 text-blue-600" />
              Tahmin Sonuçları
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Success Probability */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Başarı Olasılığı</h4>
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={`${(prediction.successProbability / 100) * 314} 314`}
                        className="text-blue-600"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">{prediction.successProbability}%</span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Kazanma olasılığı</p>
                </div>
              </div>

              {/* Estimated Duration */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tahmini Süre</h4>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">{prediction.estimatedDuration}</div>
                  <p className="text-gray-600 dark:text-gray-300">Dava süresi</p>
                </div>
              </div>

              {/* Case ID */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Dava No</h4>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">{prediction.caseId}</div>
                  <p className="text-gray-600 dark:text-gray-300">Tahmin ID</p>
                </div>
              </div>
            </div>

            {/* Key Factors */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Kritik Faktörler</h4>
              <div className="space-y-4">
                {prediction.keyFactors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTrendIcon(factor.trend)}
                      <span className="font-medium text-gray-800 dark:text-white">{factor.factor}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${factor.impact}%` }}
                        ></div>
                      </div>
                      <span className={`font-medium ${getTrendColor(factor.trend)}`}>
                        {factor.impact}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risks and Opportunities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Risk Factors */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Risk Faktörleri
                </h4>
                <ul className="space-y-2">
                  {prediction.riskFactors.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Opportunities */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  Fırsatlar
                </h4>
                <ul className="space-y-2">
                  {prediction.opportunities.map((opportunity, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      {opportunity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Similar Cases */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Benzer Davalar</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {prediction.similarCases.map((similarCase, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800 dark:text-white">{similarCase.caseNumber}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        similarCase.outcome === 'Kazanıldı' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {similarCase.outcome}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Benzerlik:</span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${similarCase.similarity}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {similarCase.similarity}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Süre: {similarCase.duration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictiveAnalytics;
