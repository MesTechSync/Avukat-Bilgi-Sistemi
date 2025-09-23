import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  BookOpen, 
  Gavel, 
  FileText, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Share2,
  Filter,
  Search,
  BarChart3,
  PieChart,
  MapPin,
  Zap,
  Target,
  Shield,
  Star,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'law' | 'amendment' | 'decision' | 'regulation' | 'court-ruling' | 'legislative';
  importance: 'high' | 'medium' | 'low';
  impact: 'positive' | 'negative' | 'neutral';
  category: string;
  source: string;
  relatedEvents: string[];
  affectedAreas: string[];
  summary: string;
  keyChanges: string[];
  beforeAfter: {
    before: string;
    after: string;
  };
}

interface TimelineFilter {
  type: string;
  importance: string;
  impact: string;
  category: string;
  dateRange: string;
}

const LegalTimeline: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);
  const [filters, setFilters] = useState<TimelineFilter>({
    type: 'all',
    importance: 'all',
    impact: 'all',
    category: 'all',
    dateRange: 'all'
  });
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentYear, setCurrentYear] = useState(2024);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid' | 'chart'>('timeline');
  const [searchQuery, setSearchQuery] = useState('');

  // Örnek timeline verileri
  useEffect(() => {
    const sampleEvents: TimelineEvent[] = [
      {
        id: 'event-1',
        date: '2024-01-15',
        title: 'Borçlar Kanunu 6098 - Yeni Düzenlemeler',
        description: 'Borçlar Kanunu\'nda sözleşme hukuku ile ilgili önemli değişiklikler yapıldı.',
        type: 'amendment',
        importance: 'high',
        impact: 'positive',
        category: 'Borçlar Hukuku',
        source: 'TBMM',
        relatedEvents: ['event-2', 'event-3'],
        affectedAreas: ['Sözleşme Hukuku', 'Tazminat Hukuku', 'İfa Hukuku'],
        summary: 'Sözleşme kurulması, ifası ve sona ermesi ile ilgili yeni hükümler',
        keyChanges: [
          'Sözleşme kurulması şartları güncellendi',
          'İfa yükümlülükleri yeniden düzenlendi',
          'Sona erme halleri genişletildi'
        ],
        beforeAfter: {
          before: 'Eski Borçlar Kanunu hükümleri',
          after: 'Yeni düzenlemeler ile güncellenmiş hükümler'
        }
      },
      {
        id: 'event-2',
        date: '2024-02-20',
        title: 'Yargıtay 2. Hukuk Dairesi - Velayet Kararı',
        description: 'Velayet değişikliği konusunda önemli bir içtihat kararı verildi.',
        type: 'court-ruling',
        importance: 'high',
        impact: 'positive',
        category: 'Aile Hukuku',
        source: 'Yargıtay 2. Hukuk Dairesi',
        relatedEvents: ['event-1'],
        affectedAreas: ['Velayet Hukuku', 'Çocuk Hakları', 'Aile Hukuku'],
        summary: 'Çocuğun yüksek yararı ilkesi çerçevesinde velayet değişikliği',
        keyChanges: [
          'Çocuğun yüksek yararı ilkesi vurgulandı',
          'Velayet değişikliği şartları netleştirildi',
          'Sosyal inceleme raporu önemi artırıldı'
        ],
        beforeAfter: {
          before: 'Belirsiz velayet değişikliği kriterleri',
          after: 'Net ve objektif değerlendirme kriterleri'
        }
      },
      {
        id: 'event-3',
        date: '2024-03-10',
        title: 'İş Kanunu - Yeni Düzenlemeler',
        description: 'İş Kanunu\'nda çalışma saatleri ve izin hakları ile ilgili değişiklikler.',
        type: 'law',
        importance: 'medium',
        impact: 'positive',
        category: 'İş Hukuku',
        source: 'TBMM',
        relatedEvents: ['event-1'],
        affectedAreas: ['Çalışma Saatleri', 'İzin Hakları', 'Ücret Hukuku'],
        summary: 'Çalışan hakları ve işveren yükümlülükleri güncellendi',
        keyChanges: [
          'Haftalık çalışma saati sınırı güncellendi',
          'Yıllık izin hakları genişletildi',
          'Ücret ödeme yükümlülükleri netleştirildi'
        ],
        beforeAfter: {
          before: 'Eski çalışma saatleri düzenlemeleri',
          after: 'Güncellenmiş çalışma saatleri ve izin hakları'
        }
      },
      {
        id: 'event-4',
        date: '2024-04-05',
        title: 'Yargıtay 9. Hukuk Dairesi - Haksız Fesih',
        description: 'Haksız fesih tazminatı hesaplaması konusunda yeni karar.',
        type: 'decision',
        importance: 'high',
        impact: 'positive',
        category: 'İş Hukuku',
        source: 'Yargıtay 9. Hukuk Dairesi',
        relatedEvents: ['event-3'],
        affectedAreas: ['Haksız Fesih', 'Tazminat Hesaplaması', 'İş Güvencesi'],
        summary: 'Haksız fesih tazminatı hesaplama yöntemi güncellendi',
        keyChanges: [
          'Tazminat hesaplama yöntemi netleştirildi',
          'Kıdem tazminatı ile ilişki düzenlendi',
          'İş güvencesi kapsamı genişletildi'
        ],
        beforeAfter: {
          before: 'Belirsiz tazminat hesaplama yöntemi',
          after: 'Net ve adil tazminat hesaplama sistemi'
        }
      }
    ];

    setEvents(sampleEvents);
    setFilteredEvents(sampleEvents);
  }, []);

  // Filtreleme
  useEffect(() => {
    let filtered = events;

    if (filters.type !== 'all') {
      filtered = filtered.filter(event => event.type === filters.type);
    }
    if (filters.importance !== 'all') {
      filtered = filtered.filter(event => event.importance === filters.importance);
    }
    if (filters.impact !== 'all') {
      filtered = filtered.filter(event => event.impact === filters.impact);
    }
    if (filters.category !== 'all') {
      filtered = filtered.filter(event => event.category === filters.category);
    }
    if (filters.dateRange !== 'all') {
      const currentYear = new Date().getFullYear();
      filtered = filtered.filter(event => {
        const eventYear = new Date(event.date).getFullYear();
        switch (filters.dateRange) {
          case 'this-year':
            return eventYear === currentYear;
          case 'last-year':
            return eventYear === currentYear - 1;
          case 'last-2-years':
            return eventYear >= currentYear - 2;
          default:
            return true;
        }
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, filters, searchQuery]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'law': return <BookOpen className="w-5 h-5" />;
      case 'amendment': return <FileText className="w-5 h-5" />;
      case 'decision': return <Gavel className="w-5 h-5" />;
      case 'regulation': return <FileText className="w-5 h-5" />;
      case 'court-ruling': return <Gavel className="w-5 h-5" />;
      case 'legislative': return <Users className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'law': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'amendment': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'decision': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'regulation': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'court-ruling': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'legislative': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600 dark:text-green-400';
      case 'negative': return 'text-red-600 dark:text-red-400';
      case 'neutral': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <CheckCircle className="w-4 h-4" />;
      case 'negative': return <XCircle className="w-4 h-4" />;
      case 'neutral': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const playTimeline = () => {
    setIsPlaying(true);
    // Timeline animasyonu simülasyonu
    setTimeout(() => setIsPlaying(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Hukuki Zaman Çizelgesi
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Kanun değişiklikleri, kararlar ve hukuki gelişmelerin tarihsel takibi
          </p>
        </div>

        {/* Controls */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Hukuki gelişme ara..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* View Mode */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`p-2 rounded-lg ${viewMode === 'timeline' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <Clock className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('chart')}
                  className={`p-2 rounded-lg ${viewMode === 'chart' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <PieChart className="w-4 h-4" />
                </button>
              </div>

              {/* Play Button */}
              <button
                onClick={playTimeline}
                disabled={isPlaying}
                className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Tüm Türler</option>
                <option value="law">Kanun</option>
                <option value="amendment">Değişiklik</option>
                <option value="decision">Karar</option>
                <option value="regulation">Yönetmelik</option>
                <option value="court-ruling">Mahkeme Kararı</option>
                <option value="legislative">Yasama</option>
              </select>

              <select
                value={filters.importance}
                onChange={(e) => setFilters(prev => ({ ...prev, importance: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Tüm Önem Seviyeleri</option>
                <option value="high">Yüksek</option>
                <option value="medium">Orta</option>
                <option value="low">Düşük</option>
              </select>

              <select
                value={filters.impact}
                onChange={(e) => setFilters(prev => ({ ...prev, impact: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Tüm Etkiler</option>
                <option value="positive">Pozitif</option>
                <option value="negative">Negatif</option>
                <option value="neutral">Nötr</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Tüm Kategoriler</option>
                <option value="Borçlar Hukuku">Borçlar Hukuku</option>
                <option value="Aile Hukuku">Aile Hukuku</option>
                <option value="İş Hukuku">İş Hukuku</option>
                <option value="Ceza Hukuku">Ceza Hukuku</option>
                <option value="Ticaret Hukuku">Ticaret Hukuku</option>
              </select>

              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Tüm Zamanlar</option>
                <option value="this-year">Bu Yıl</option>
                <option value="last-year">Geçen Yıl</option>
                <option value="last-2-years">Son 2 Yıl</option>
              </select>
            </div>
          </div>
        </div>

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
                Hukuki Gelişmeler ({filteredEvents.length})
              </h3>
              
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-indigo-200 dark:bg-indigo-800"></div>
                
                <div className="space-y-8">
                  {filteredEvents.map((event, index) => (
                    <div key={event.id} className="relative flex items-start gap-6">
                      {/* Timeline Dot */}
                      <div className={`relative z-10 w-4 h-4 rounded-full border-4 border-white dark:border-gray-800 ${
                        event.importance === 'high' ? 'bg-red-500' :
                        event.importance === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      
                      {/* Event Content */}
                      <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(event.type)}`}>
                                {getTypeIcon(event.type)}
                                {event.type}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getImportanceColor(event.importance)}`}>
                                {event.importance}
                              </span>
                              <span className={`inline-flex items-center gap-1 text-sm ${getImpactColor(event.impact)}`}>
                                {getImpactIcon(event.impact)}
                                {event.impact}
                              </span>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                              {event.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300 mb-3">
                              {event.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(event.date)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {event.source}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Key Changes */}
                          <div>
                            <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Anahtar Değişiklikler:</h5>
                            <ul className="space-y-1">
                              {event.keyChanges.map((change, changeIndex) => (
                                <li key={changeIndex} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                                  {change}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Affected Areas */}
                          <div>
                            <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Etkilenen Alanlar:</h5>
                            <div className="flex flex-wrap gap-2">
                              {event.affectedAreas.map((area, areaIndex) => (
                                <span key={areaIndex} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 rounded text-xs">
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Before/After */}
                        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                          <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Önce/Sonra:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Önce:</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{event.beforeAfter.before}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Sonra:</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{event.beforeAfter.after}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedEvent(event)}
                              className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                            >
                              <Eye className="w-4 h-4 inline mr-1" />
                              Detaylar
                            </button>
                            <button className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors">
                              <Download className="w-4 h-4 inline mr-1" />
                              İndir
                            </button>
                            <button className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded text-sm hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors">
                              <Share2 className="w-4 h-4 inline mr-1" />
                              Paylaş
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {event.category}
                            </span>
                            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                              <Star className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
                Grid Görünümü ({filteredEvents.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getTypeColor(event.type)}`}>
                        {getTypeIcon(event.type)}
                        {event.type}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs ${getImpactColor(event.impact)}`}>
                        {getImpactIcon(event.impact)}
                        {event.impact}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                      {event.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {event.summary}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatDate(event.date)}</span>
                      <span>{event.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chart View */}
        {viewMode === 'chart' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
                İstatistiksel Görünüm
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {filteredEvents.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Gelişme</div>
                </div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {filteredEvents.filter(e => e.impact === 'positive').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pozitif Etki</div>
                </div>
                <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                    {filteredEvents.filter(e => e.importance === 'high').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Yüksek Önem</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalTimeline;
