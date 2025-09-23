import React, { useState, useRef } from 'react';
import { 
  Brain, 
  Heart, 
  Smile, 
  Frown, 
  Meh, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Mic,
  MicOff,
  Camera,
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Zap
} from 'lucide-react';

interface EmotionData {
  emotion: string;
  confidence: number;
  intensity: number;
  timestamp: string;
  source: 'voice' | 'video' | 'text';
}

interface ParticipantAnalysis {
  id: string;
  name: string;
  role: string;
  emotions: EmotionData[];
  overallMood: 'positive' | 'negative' | 'neutral';
  stressLevel: number;
  credibility: number;
  keyMoments: Array<{
    timestamp: string;
    emotion: string;
    description: string;
    importance: 'high' | 'medium' | 'low';
  }>;
}

const AIEmotionAnalysis: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'real-time' | 'batch' | 'historical'>('real-time');
  const [participants, setParticipants] = useState<ParticipantAnalysis[]>([
    {
      id: 'participant-1',
      name: 'Tanık Ali Kaya',
      role: 'witness',
      emotions: [
        { emotion: 'nervous', confidence: 0.85, intensity: 0.7, timestamp: '14:32:15', source: 'voice' },
        { emotion: 'truthful', confidence: 0.78, intensity: 0.6, timestamp: '14:32:20', source: 'voice' },
        { emotion: 'anxious', confidence: 0.72, intensity: 0.8, timestamp: '14:32:25', source: 'video' }
      ],
      overallMood: 'negative',
      stressLevel: 0.75,
      credibility: 0.82,
      keyMoments: [
        {
          timestamp: '14:32:15',
          emotion: 'nervous',
          description: 'Soru sorulduğunda ses titremesi',
          importance: 'high'
        },
        {
          timestamp: '14:32:20',
          emotion: 'truthful',
          description: 'Göz teması kurarak cevap verdi',
          importance: 'medium'
        }
      ]
    },
    {
      id: 'participant-2',
      name: 'Müvekkil Ayşe Demir',
      role: 'client',
      emotions: [
        { emotion: 'confident', confidence: 0.88, intensity: 0.6, timestamp: '14:33:10', source: 'voice' },
        { emotion: 'determined', confidence: 0.82, intensity: 0.7, timestamp: '14:33:15', source: 'video' },
        { emotion: 'hopeful', confidence: 0.75, intensity: 0.5, timestamp: '14:33:20', source: 'voice' }
      ],
      overallMood: 'positive',
      stressLevel: 0.35,
      credibility: 0.91,
      keyMoments: [
        {
          timestamp: '14:33:10',
          emotion: 'confident',
          description: 'Net ve kararlı ifade',
          importance: 'high'
        }
      ]
    }
  ]);

  const [emotionStats, setEmotionStats] = useState({
    totalEmotions: 156,
    positiveEmotions: 89,
    negativeEmotions: 45,
    neutralEmotions: 22,
    averageConfidence: 0.82,
    stressLevel: 0.55,
    credibilityScore: 0.86
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setIsRecording(true);
    
    // Simüle edilmiş analiz
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Yeni duygu verisi ekle
    const newEmotion: EmotionData = {
      emotion: 'focused',
      confidence: 0.85,
      intensity: 0.6,
      timestamp: new Date().toLocaleTimeString('tr-TR'),
      source: 'voice'
    };
    
    setParticipants(prev => prev.map(p => ({
      ...p,
      emotions: [...p.emotions, newEmotion]
    })));
    
    setIsAnalyzing(false);
  };

  const stopAnalysis = () => {
    setIsRecording(false);
    setIsAnalyzing(false);
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'happy': return <Smile className="w-4 h-4 text-green-500" />;
      case 'sad': return <Frown className="w-4 h-4 text-blue-500" />;
      case 'angry': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'nervous': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'confident': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'truthful': return <Heart className="w-4 h-4 text-pink-500" />;
      case 'anxious': return <Zap className="w-4 h-4 text-orange-500" />;
      case 'focused': return <Brain className="w-4 h-4 text-purple-500" />;
      default: return <Meh className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'happy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'sad': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'angry': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'nervous': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'confident': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'truthful': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'anxious': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'focused': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'positive': return 'text-green-600 dark:text-green-400';
      case 'negative': return 'text-red-600 dark:text-red-400';
      case 'neutral': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-xl shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              AI Duygu Analizi
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Müvekkil ve tanık ifadelerinin duygusal analizi ve güvenilirlik değerlendirmesi
          </p>
        </div>

        {/* Analysis Controls */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Analiz Kontrolleri
            </h3>
            
            {/* Mode Selection */}
            <div className="flex flex-wrap gap-4 mb-6">
              {[
                { id: 'real-time', label: 'Gerçek Zamanlı', icon: Zap },
                { id: 'batch', label: 'Toplu Analiz', icon: FileText },
                { id: 'historical', label: 'Geçmiş Analiz', icon: Clock }
              ].map((mode) => {
                const IconComponent = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setAnalysisMode(mode.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      analysisMode === mode.id
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {mode.label}
                  </button>
                );
              })}
            </div>

            {/* Analysis Actions */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={isRecording ? stopAnalysis : startAnalysis}
                disabled={isAnalyzing}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isAnalyzing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
                {isAnalyzing ? 'Analiz Ediliyor...' : isRecording ? 'Analizi Durdur' : 'Analizi Başlat'}
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Camera className="w-5 h-5" />
                Dosya Yükle
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,audio/*,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    console.log('Dosya yüklendi:', e.target.files[0].name);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Emotion Statistics */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Duygu İstatistikleri
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {emotionStats.positiveEmotions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pozitif</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {emotionStats.negativeEmotions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Negatif</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {emotionStats.neutralEmotions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Nötr</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  %{Math.round(emotionStats.averageConfidence * 100)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Güven</div>
              </div>
            </div>
          </div>
        </div>

        {/* Participants Analysis */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Katılımcı Analizi
            </h3>
            <div className="space-y-6">
              {participants.map((participant) => (
                <div key={participant.id} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {participant.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {participant.role}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getMoodColor(participant.overallMood)}`}>
                          {participant.overallMood === 'positive' ? '😊' : 
                           participant.overallMood === 'negative' ? '😟' : '😐'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Genel Ruh Hali</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          %{Math.round(participant.stressLevel * 100)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Stres Seviyesi</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          %{Math.round(participant.credibility * 100)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Güvenilirlik</div>
                      </div>
                    </div>
                  </div>

                  {/* Emotions Timeline */}
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Duygu Zaman Çizelgesi</h5>
                    <div className="flex flex-wrap gap-2">
                      {participant.emotions.map((emotion, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getEmotionColor(emotion.emotion)}`}
                        >
                          {getEmotionIcon(emotion.emotion)}
                          <span className="capitalize">{emotion.emotion}</span>
                          <span className="text-xs opacity-75">
                            %{Math.round(emotion.confidence * 100)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Moments */}
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Kritik Anlar</h5>
                    <div className="space-y-2">
                      {participant.keyMoments.map((moment, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getImportanceColor(moment.importance)}`}>
                              {moment.importance}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {moment.timestamp}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {moment.description}
                            </p>
                          </div>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${getEmotionColor(moment.emotion)}`}>
                            {getEmotionIcon(moment.emotion)}
                            <span className="capitalize">{moment.emotion}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Analiz Özeti
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-gray-800 dark:text-white">Genel Durum</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Katılımcılar genel olarak {emotionStats.positiveEmotions > emotionStats.negativeEmotions ? 'pozitif' : 'negatif'} bir ruh hali sergiliyor.
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <h4 className="font-medium text-gray-800 dark:text-white">Dikkat Edilmesi Gerekenler</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Yüksek stres seviyesi ve güvenilirlik skorları dikkatle değerlendirilmelidir.
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <h4 className="font-medium text-gray-800 dark:text-white">Öneriler</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Duygu analizi sonuçları dava stratejisi belirlemede kullanılabilir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIEmotionAnalysis;
