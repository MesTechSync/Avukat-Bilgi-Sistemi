import React, { useState, useRef, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Camera, 
  Mic, 
  MicOff, 
  Users, 
  Gavel, 
  BookOpen, 
  Zap,
  Target,
  Shield,
  Brain,
  Globe,
  Monitor,
  Smartphone,
  Headphones
} from 'lucide-react';

interface CourtroomParticipant {
  id: string;
  name: string;
  role: 'judge' | 'lawyer' | 'witness' | 'defendant' | 'plaintiff';
  avatar: string;
  isSpeaking: boolean;
  isMuted: boolean;
  position: { x: number; y: number; z: number };
}

interface EvidenceItem {
  id: string;
  name: string;
  type: 'document' | 'video' | 'audio' | 'image' | '3d-model';
  url: string;
  description: string;
  isExhibited: boolean;
  position: { x: number; y: number; z: number };
}

const ARVRCourtroom: React.FC = () => {
  const [isARMode, setIsARMode] = useState(false);
  const [isVRMode, setIsVRMode] = useState(false);
  const [is3DMode, setIs3DMode] = useState(true);
  const [currentView, setCurrentView] = useState<'judge' | 'lawyer' | 'witness' | 'spectator'>('lawyer');
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [participants, setParticipants] = useState<CourtroomParticipant[]>([
    {
      id: 'judge-1',
      name: 'Hakim Mehmet Yılmaz',
      role: 'judge',
      avatar: '👨‍⚖️',
      isSpeaking: false,
      isMuted: false,
      position: { x: 0, y: 0, z: 0 }
    },
    {
      id: 'lawyer-1',
      name: 'Av. Ayşe Demir',
      role: 'lawyer',
      avatar: '👩‍💼',
      isSpeaking: true,
      isMuted: false,
      position: { x: -2, y: 0, z: 1 }
    },
    {
      id: 'witness-1',
      name: 'Tanık Ali Kaya',
      role: 'witness',
      avatar: '👨',
      isSpeaking: false,
      isMuted: false,
      position: { x: 2, y: 0, z: 1 }
    }
  ]);

  const [evidence, setEvidence] = useState<EvidenceItem[]>([
    {
      id: 'evidence-1',
      name: 'İş Sözleşmesi',
      type: 'document',
      url: '/documents/contract.pdf',
      description: 'Taraflar arasındaki iş sözleşmesi',
      isExhibited: true,
      position: { x: 0, y: 1, z: 0 }
    },
    {
      id: 'evidence-2',
      name: 'Güvenlik Kamerası Kaydı',
      type: 'video',
      url: '/videos/security-footage.mp4',
      description: 'Olay anındaki güvenlik kamerası kaydı',
      isExhibited: false,
      position: { x: 1, y: 1, z: 0 }
    }
  ]);

  const [courtroomStats, setCourtroomStats] = useState({
    sessionDuration: '02:34:15',
    participantsCount: 3,
    evidenceCount: 2,
    recordingSize: '1.2 GB',
    networkLatency: '12ms'
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 3D Mahkeme Salonu Simülasyonu
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawCourtroom = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Mahkeme salonu arka planı
      ctx.fillStyle = '#2D3748';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Hakim kürsüsü
      ctx.fillStyle = '#4A5568';
      ctx.fillRect(canvas.width / 2 - 100, 50, 200, 80);
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '16px Arial';
      ctx.fillText('HAKİM KÜRSÜSÜ', canvas.width / 2 - 60, 90);
      
      // Avukat masaları
      ctx.fillStyle = '#4A5568';
      ctx.fillRect(100, canvas.height - 150, 150, 100);
      ctx.fillRect(canvas.width - 250, canvas.height - 150, 150, 100);
      
      // Tanık kürsüsü
      ctx.fillStyle = '#4A5568';
      ctx.fillRect(canvas.width / 2 - 75, canvas.height - 200, 150, 50);
      
      // Katılımcılar
      participants.forEach((participant, index) => {
        const x = participant.position.x * 50 + canvas.width / 2;
        const y = participant.position.y * 50 + canvas.height / 2;
        
        ctx.fillStyle = participant.isSpeaking ? '#48BB78' : '#718096';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#E2E8F0';
        ctx.font = '12px Arial';
        ctx.fillText(participant.name.split(' ')[0], x - 30, y + 35);
      });
      
      // Deliller
      evidence.forEach((item, index) => {
        const x = item.position.x * 50 + canvas.width / 2;
        const y = item.position.y * 50 + canvas.height / 2;
        
        ctx.fillStyle = item.isExhibited ? '#ED8936' : '#A0AEC0';
        ctx.fillRect(x - 15, y - 15, 30, 30);
        
        ctx.fillStyle = '#E2E8F0';
        ctx.font = '10px Arial';
        ctx.fillText(item.name, x - 20, y + 40);
      });
    };

    drawCourtroom();
    const interval = setInterval(drawCourtroom, 100);
    
    return () => clearInterval(interval);
  }, [participants, evidence]);

  const toggleARMode = () => {
    setIsARMode(!isARMode);
    if (isVRMode) setIsVRMode(false);
  };

  const toggleVRMode = () => {
    setIsVRMode(!isVRMode);
    if (isARMode) setIsARMode(false);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const changeView = (view: typeof currentView) => {
    setCurrentView(view);
  };

  const exhibitEvidence = (evidenceId: string) => {
    setEvidence(prev => prev.map(item => 
      item.id === evidenceId 
        ? { ...item, isExhibited: !item.isExhibited }
        : item
    ));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'judge': return <Gavel className="w-4 h-4" />;
      case 'lawyer': return <BookOpen className="w-4 h-4" />;
      case 'witness': return <Users className="w-4 h-4" />;
      case 'defendant': return <Shield className="w-4 h-4" />;
      case 'plaintiff': return <Target className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'judge': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'lawyer': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'witness': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'defendant': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'plaintiff': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-lg">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AR/VR Sanal Mahkeme
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Gerçekçi 3D mahkeme salonu deneyimi ve sanal duruşma
          </p>
        </div>

        {/* Mode Controls */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Görüntüleme Modları
            </h3>
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={() => setIs3DMode(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  is3DMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <Monitor className="w-4 h-4" />
                3D Masaüstü
              </button>
              <button
                onClick={toggleARMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isARMode ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                AR Modu
              </button>
              <button
                onClick={toggleVRMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isVRMode ? 'bg-pink-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <Headphones className="w-4 h-4" />
                VR Modu
              </button>
            </div>

            {/* View Controls */}
            <div className="flex flex-wrap gap-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 w-full">Görüş Açısı:</h4>
              {[
                { id: 'judge', label: 'Hakim', icon: Gavel },
                { id: 'lawyer', label: 'Avukat', icon: BookOpen },
                { id: 'witness', label: 'Tanık', icon: Users },
                { id: 'spectator', label: 'İzleyici', icon: Eye }
              ].map((view) => {
                const IconComponent = view.icon;
                return (
                  <button
                    key={view.id}
                    onClick={() => changeView(view.id as any)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      currentView === view.id
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {view.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3D Courtroom Canvas */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                3D Mahkeme Salonu
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleRecording}
                  className={`p-2 rounded-lg transition-colors ${
                    isRecording 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleMute}
                  className={`p-2 rounded-lg transition-colors ${
                    isMuted 
                      ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gray-500" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>
            </div>
            
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full h-96 bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600"
              />
              
              {/* Status Overlay */}
              <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg">
                <div className="text-sm space-y-1">
                  <div>Mod: {isARMode ? 'AR' : isVRMode ? 'VR' : '3D'}</div>
                  <div>Görüş: {currentView}</div>
                  <div>Kayıt: {isRecording ? 'Aktif' : 'Pasif'}</div>
                  <div>Ses: {isMuted ? 'Kapalı' : 'Açık'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Participants Panel */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Mahkeme Katılımcıları
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants.map((participant) => (
                <div key={participant.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{participant.avatar}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 dark:text-white">
                        {participant.name}
                      </h4>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getRoleColor(participant.role)}`}>
                        {getRoleIcon(participant.role)}
                        {participant.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${participant.isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {participant.isSpeaking ? 'Konuşuyor' : 'Sessiz'}
                    </span>
                    {participant.isMuted && (
                      <span className="text-red-500 text-xs">🔇</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Evidence Panel */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Deliller ve Belgeler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evidence.map((item) => (
                <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      {item.name}
                    </h4>
                    <button
                      onClick={() => exhibitEvidence(item.id)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        item.isExhibited
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {item.isExhibited ? 'Sergileniyor' : 'Sergile'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="capitalize">{item.type}</span>
                    <span>•</span>
                    <span>Pozisyon: ({item.position.x}, {item.position.y}, {item.position.z})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Courtroom Stats */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Mahkeme İstatistikleri
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {courtroomStats.sessionDuration}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Oturum Süresi</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {courtroomStats.participantsCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Katılımcı</div>
              </div>
              <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {courtroomStats.evidenceCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Delil</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {courtroomStats.recordingSize}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Kayıt Boyutu</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {courtroomStats.networkLatency}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Gecikme</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARVRCourtroom;
