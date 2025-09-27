import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar, DollarSign, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import { useDictation } from '../hooks/useDictation';
import DictationButton from './DictationButton';
import { supabase } from '../lib/supabase';

export default function CaseManagement() {
  const { cases, clients, addCase, updateCase, deleteCase, loading, setCases } = useSupabase();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'amount'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [newCase, setNewCase] = useState({
    title: '',
    client_id: '',
    case_type: '',
    yargi_turu: '',
    yargi_birimi: '',
    status: 'Beklemede',
    deadline: '',
    priority: 'Orta',
    amount: '',
    description: ''
  });

  const [editCase, setEditCase] = useState({
    title: '',
    client_id: '',
    case_type: '',
    yargi_turu: '',
    yargi_birimi: '',
    status: 'Beklemede',
    deadline: '',
    priority: 'Orta',
    amount: '',
    description: ''
  });

  // Dikte: Açıklama alanı için
  const {
    isListening: isDictatingDesc,
    isSupported: isDictationSupported,
    interimText: descInterimText,
    startDictation: startDescDictation,
    stopDictation: stopDescDictation,
    clearDictation: clearDescDictation
  } = useDictation({
    onResult: (text) => {
      setNewCase(prev => ({
        ...prev,
        description: (prev.description || '') + (prev.description ? ' ' : '') + text
      }));
      clearDescDictation();
    },
    continuous: false,
    interimResults: true
  });

  // Voice actions listener
  React.useEffect(() => {
    const handler = (e: Event) => {
      const intent = (e as CustomEvent).detail?.intent as { action?: string; parameters?: any };
      if (!intent) return;
      switch (intent.action) {
        case 'CASES_NEW':
          setShowAddModal(true);
          break;
        case 'CASES_SEARCH':
          if (typeof intent.parameters?.query === 'string') setSearchTerm(intent.parameters.query);
          break;
        case 'CASES_FILTER_STATUS':
          if (typeof intent.parameters?.status === 'string') setStatusFilter(intent.parameters.status);
          break;
        case 'CASES_FILTER_TYPE':
          if (typeof intent.parameters?.case_type === 'string') setTypeFilter(intent.parameters.case_type);
          break;
        case 'CASES_FILTER_PRIORITY':
          if (typeof intent.parameters?.priority === 'string') setPriorityFilter(intent.parameters.priority);
          break;
        case 'CASES_SORT': {
          const by = intent.parameters?.by as 'date' | 'title' | 'amount' | undefined;
          const dir = intent.parameters?.dir as 'asc' | 'desc' | undefined;
          if (by) setSortBy(by);
          if (dir) setSortDir(dir);
          break;
        }
        case 'CASES_CLEAR_FILTERS':
          setStatusFilter('');
          setTypeFilter('');
          setPriorityFilter('');
          setSortBy('date');
          setSortDir('desc');
          setSearchTerm('');
          setPage(1);
          setSelectedIndex(null);
          break;
        case 'CASES_PAGE_NEXT':
          setPage(p => p + 1);
          break;
        case 'CASES_PAGE_PREV':
          setPage(p => Math.max(1, p - 1));
          break;
        case 'CASES_OPEN_INDEX': {
          const idx = Number(intent.parameters?.index || 0);
          if (idx > 0) setSelectedIndex(idx);
          break;
        }
      }
    };
    window.addEventListener('cases-action', handler);
    return () => window.removeEventListener('cases-action', handler);
  }, []);

  // Yargı türleri
  const yargiTurleri = [
    'Ceza',
    'Hukuk', 
    'İcra',
    'İdari Yargı',
    'Satış Memurluğu',
    'Arabuluculuk',
    'Cbs',
    'Tazminat Komisyonu Başkanlığı'
  ];

  // Yargı birimleri - türlere göre
  const yargiBirimleri = {
    'Ceza': [
      'AĞIR CEZA MAHKEMESİ',
      'ASLİYE CEZA MAHKEMESİ',
      'Bölge Adliye Mah. Ceza Dairesi',
      'ÇOCUK AĞIR CEZA MAHKEMESİ',
      'ÇOCUK MAHKEMESİ',
      'FİKRİ VE SINAI HAKLAR CEZA MAHKEMESİ',
      'İCRA CEZA HAKİMLİĞİ',
      'İNFAZ HAKİMLİĞİ',
      'İSTİNAF CEZA DAİRESİ (İLK DERECE)',
      'SULH CEZA HAKIMLIGI',
      'TRAFİK MAHKEMESİ',
      'YARGITAY CEZA DAİRESİ (İLK DERECE)'
    ],
    'Hukuk': [
      'AİLE MAHKEMESİ',
      'ASLİYE HUKUK MAHKEMESİ',
      'ASLİYE TİCARET MAHKEMESİ',
      'BAM Hukuk Dairesi(İlk Derece)',
      'Bölge Adliye Mah. Hukuk Dairesi',
      'FİKRİ VE SINAI HAKLAR HUKUK MAHKEMESİ',
      'İCRA HUKUK MAHKEMESİ',
      'İŞ MAHKEMESİ',
      'KADASTRO MAHKEMESİ',
      'KADASTRO MAHKEMESİ(MÜS)',
      'SULH HUKUK MAHKEMESİ'
    ],
    'İdari Yargı': [
      'BÖLGE İDARE MAHKEMESİ',
      'İDARE MAHKEMESİ',
      'VERGİ MAHKEMESİ'
    ],
    'İcra': [
      'İCRA DAİRESİ',
      'İCRA MAHKEMESİ',
      'İFLAS DAİRESİ'
    ],
    'Satış Memurluğu': [
      'SATIŞ MEMURLUĞU'
    ],
    'Arabuluculuk': [
      'ARABULUCULUK MERKEZİ'
    ],
    'Cbs': [
      'CBS MERKEZİ'
    ],
    'Tazminat Komisyonu Başkanlığı': [
      'TAZMİNAT KOMİSYONU'
    ]
  };

  // Eski caseTypes array'ini koruyalım (geriye dönük uyumluluk için)
  const caseTypes = [
    'Ticari Hukuk', 'İş Hukuku', 'Aile Hukuku', 'Ceza Hukuku',
    'İdare Hukuku', 'Medeni Hukuk', 'Borçlar Hukuku', 'Miras Hukuku'
  ];

  const statusOptions = [
    'Beklemede', 'Devam Ediyor', 'İnceleme', 'Tamamlandı', 'İptal'
  ];

  const priorityOptions = ['Düşük', 'Orta', 'Yüksek', 'Acil'];

  const filteredCases = cases
    .filter(case_ => {
      const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           case_.case_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || case_.status === statusFilter;
      const matchesType = !typeFilter || case_.case_type === typeFilter;
      const matchesPriority = !priorityFilter || case_.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesType && matchesPriority;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'title') {
        cmp = a.title.localeCompare(b.title, 'tr');
      } else {
        cmp = (parseFloat(a.amount || '0') || 0) - (parseFloat(b.amount || '0') || 0);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const totalPages = Math.max(1, Math.ceil(filteredCases.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredCases.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAddCase = async (e) => {
    e.preventDefault();
    console.log('=== DAVA EKLEME BAŞLADI ===');
    console.log('Form verisi:', newCase);
    
    // Form validasyonu
    if (!newCase.title.trim()) {
      alert('Dava başlığı gereklidir!');
      return;
    }
    if (!newCase.client_id) {
      alert('Müvekkil seçimi gereklidir!');
      return;
    }
    if (!newCase.yargi_turu) {
      alert('Yargı türü seçimi gereklidir!');
      return;
    }
    if (!newCase.yargi_birimi) {
      alert('Yargı birimi seçimi gereklidir!');
      return;
    }
    
    try {
      // Önce mevcut cases tablosunu kontrol et
      console.log('Mevcut cases tablosu kontrol ediliyor...');
      const { data: existingCases, error: fetchError } = await supabase
        .from('cases')
        .select('*')
        .limit(1);
      
      if (fetchError) {
        console.error('Cases tablosu okuma hatası:', fetchError);
        alert('Veritabanı bağlantı hatası: ' + fetchError.message);
        return;
      }
      
      console.log('Cases tablosu mevcut, örnek veri:', existingCases);
      if (existingCases && existingCases.length > 0) {
        console.log('Cases tablosu kolonları:', Object.keys(existingCases[0]));
      }
      
      // Müvekkil adını client_id'den al
      const selectedClient = clients.find(c => c.id === newCase.client_id);
      const clientName = selectedClient ? selectedClient.name : 'Bilinmeyen Müvekkil';
      
      // Tüm mevcut kolonları kullan
      const caseData = {
        title: newCase.title,
        case_type: newCase.case_type,
        yargi_turu: newCase.yargi_turu,
        yargi_birimi: newCase.yargi_birimi,
        status: newCase.status,
        priority: newCase.priority,
        amount: newCase.amount ? parseFloat(newCase.amount.toString()) : null,
        description: newCase.description,
        deadline: newCase.deadline || null,
        client_name: clientName,
        user_id: null
      };
      
      console.log('Supabase\'e gönderilecek veri:', caseData);
      
      // Direkt Supabase çağrısı yap
      const { data: insertData, error: insertError } = await supabase
        .from('cases')
        .insert([caseData])
        .select();
      
      if (insertError) {
        console.error('Supabase insert hatası:', insertError);
        alert('Dava eklenirken hata oluştu: ' + insertError.message);
        return;
      }
      
      console.log('Dava başarıyla eklendi:', insertData);
      
      // Local state'i güncelle
      setCases(prev => [insertData[0], ...prev]);
      
      setNewCase({
        title: '',
        client_id: '',
        case_type: '',
        yargi_turu: '',
        yargi_birimi: '',
        status: 'Beklemede',
        deadline: '',
        priority: 'Orta',
        amount: '',
        description: ''
      });
      setShowAddModal(false);
      alert('Dava başarıyla eklendi!');
      
    } catch (error) {
      console.error('Dava eklenirken genel hata:', error);
      alert('Dava eklenirken hata oluştu: ' + error.message);
    }
  };

  const handleViewCase = (case_) => {
    setSelectedCase(case_);
    setShowViewModal(true);
  };

  const handleEditCase = (case_) => {
    setSelectedCase(case_);
    // Müvekkil adını ID'ye çevir
    const clientId = clients.find(c => c.name === case_.client_name)?.id || '';
    setEditCase({
      title: case_.title,
      client_id: clientId,
      case_type: case_.case_type || '',
      yargi_turu: case_.yargi_turu || '',
      yargi_birimi: case_.yargi_birimi || '',
      status: case_.status,
      deadline: case_.deadline || '',
      priority: case_.priority,
      amount: case_.amount?.toString() || '',
      description: case_.description || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateCase = async (e) => {
    e.preventDefault();
    try {
      // Müvekkil ID'sini client_name'e çevir
      const selectedClient = clients.find(c => c.id === editCase.client_id);
      const caseData = {
        ...editCase,
        client_name: selectedClient ? selectedClient.name : 'Bilinmeyen Müvekkil'
      };
      
      await updateCase(selectedCase.id, caseData);
      setShowEditModal(false);
      setSelectedCase(null);
    } catch (error) {
      console.error('Dava güncellenirken hata:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Tamamlandı':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Devam Ediyor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'İnceleme':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'İptal':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Acil':
        return 'text-red-600';
      case 'Yüksek':
        return 'text-orange-600';
      case 'Orta':
        return 'text-yellow-600';
      case 'Düşük':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getClientName = (case_) => {
    return case_.client_name || 'Bilinmeyen Müvekkil';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dava Yönetimi</h2>
          <p className="text-gray-600 dark:text-gray-400">Davalarınızı organize edin ve takip edin</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Yeni Dava
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Dava ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" title="Durum filtresi" aria-label="Durum filtresi"
          >
            <option value="">Tüm Durumlar</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {pageItems.map((case_, idx) => (
          <div key={case_.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {case_.title}
                  {selectedIndex === idx + 1 && (
                    <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Seçili</span>
                  )}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(case_.status)}`}>
                    {case_.status}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {case_.yargi_turu && case_.yargi_birimi ? 
                      `${case_.yargi_turu} - ${case_.yargi_birimi}` : 
                      case_.case_type || 'Belirtilmemiş'
                    }
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleViewCase(case_)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Davayı görüntüle" aria-label="Davayı görüntüle"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleEditCase(case_)}
                  className="p-1 text-gray-400 hover:text-green-600 transition-colors" title="Davayı düzenle" aria-label="Davayı düzenle"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteCase(case_.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Davayı sil" aria-label="Davayı sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{getClientName(case_)}</span>
              </div>

              {case_.deadline && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Son Tarih: {new Date(case_.deadline).toLocaleDateString('tr-TR')}</span>
                </div>
              )}

              {case_.amount && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <DollarSign className="w-4 h-4" />
                  <span>{case_.amount} TL</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <AlertTriangle className={`w-4 h-4 ${getPriorityColor(case_.priority)}`} />
                  <span className={`text-sm font-medium ${getPriorityColor(case_.priority)}`}>
                    {case_.priority}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(case_.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>

              {case_.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {case_.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Dava bulunamadı
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Arama kriterlerinizi değiştirin veya yeni bir dava ekleyin.
          </p>
        </div>
      )}

      {/* Pagination controls */}
      {filteredCases.length > pageSize && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded border dark:border-gray-600 disabled:opacity-50">Önceki</button>
          <span className="text-sm text-gray-600 dark:text-gray-300">Sayfa {currentPage} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded border dark:border-gray-600 disabled:opacity-50">Sonraki</button>
        </div>
      )}

      {/* Add Case Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Yeni Dava Ekle
              </h3>
            </div>
            
            <form onSubmit={handleAddCase} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dava Başlığı *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCase.title}
                    onChange={(e) => setNewCase({...newCase, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" placeholder="Dava başlığı" title="Dava başlığı"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Müvekkil *
                  </label>
                  <select
                    required
                    value={newCase.client_id}
                    onChange={(e) => setNewCase({...newCase, client_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" title="Müvekkil seçimi" aria-label="Müvekkil seçimi"
                  >
                    <option value="">Müvekkil Seçin</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Yargı Türü *
                  </label>
                  <select
                    required
                    value={newCase.yargi_turu}
                    onChange={(e) => {
                      setNewCase({...newCase, yargi_turu: e.target.value, yargi_birimi: ''});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    title="Yargı türü"
                    aria-label="Yargı türü"
                  >
                    <option value="">Yargı Türü Seçin</option>
                    {yargiTurleri.map(tur => (
                      <option key={tur} value={tur}>{tur}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Yargı Birimi *
                  </label>
                  <select
                    required
                    value={newCase.yargi_birimi}
                    onChange={(e) => setNewCase({...newCase, yargi_birimi: e.target.value})}
                    disabled={!newCase.yargi_turu}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Yargı birimi"
                    aria-label="Yargı birimi"
                  >
                    <option value="">Seçiniz</option>
                    {newCase.yargi_turu && yargiBirimleri[newCase.yargi_turu]?.map(birim => (
                      <option key={birim} value={birim}>{birim}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Durum
                  </label>
                  <select
                    value={newCase.status}
                    onChange={(e) => setNewCase({...newCase, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" title="Dava durumu" aria-label="Dava durumu"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Son Tarih
                  </label>
                  <input
                    type="date"
                    value={newCase.deadline}
                    onChange={(e) => setNewCase({...newCase, deadline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" title="Son tarih" aria-label="Son tarih"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Öncelik
                  </label>
                  <select
                    value={newCase.priority}
                    onChange={(e) => setNewCase({...newCase, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" title="Öncelik" aria-label="Öncelik"
                  >
                    {priorityOptions.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tutar (TL)
                  </label>
                  <input
                    type="text"
                    value={newCase.amount}
                    onChange={(e) => setNewCase({...newCase, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" placeholder="0" title="Tutar"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Açıklama
                  </label>
                  <DictationButton
                    isListening={isDictatingDesc}
                    isSupported={isDictationSupported}
                    onStart={startDescDictation}
                    onStop={stopDescDictation}
                    size="sm"
                    className="ml-2"
                    title="Açıklamaya dikte et"
                  />
                </div>
                <textarea
                  rows={3}
                  value={newCase.description}
                  onChange={(e) => setNewCase({...newCase, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Dava hakkında detaylar..."
                />
                {isDictatingDesc && descInterimText && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">{descInterimText}</div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Ekleniyor...' : 'Dava Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Case Modal */}
      {showViewModal && selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Dava Detayları
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedCase.title}
                </h4>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedCase.status)}`}>
                    {selectedCase.status}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedCase.case_type}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Users className="w-5 h-5" />
                    <span>{getClientName(selectedCase)}</span>
                  </div>

                  {selectedCase.deadline && (
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-5 h-5" />
                      <span>Son Tarih: {new Date(selectedCase.deadline).toLocaleDateString('tr-TR')}</span>
                    </div>
                  )}

                  {selectedCase.amount && (
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <DollarSign className="w-5 h-5" />
                      <span>{selectedCase.amount} TL</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-5 h-5 ${getPriorityColor(selectedCase.priority)}`} />
                    <span className={`text-sm font-medium ${getPriorityColor(selectedCase.priority)}`}>
                      {selectedCase.priority}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Oluşturulma Tarihi:</span><br />
                    {new Date(selectedCase.created_at).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              </div>

              {selectedCase.description && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Açıklama</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {selectedCase.description}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Kapat
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditCase(selectedCase);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Düzenle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Case Modal */}
      {showEditModal && selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Davayı Düzenle
              </h3>
            </div>
            
            <form onSubmit={handleUpdateCase} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dava Başlığı *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCase.title}
                    onChange={(e) => setEditCase({...editCase, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" placeholder="Dava başlığı" title="Dava başlığı"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Müvekkil *
                  </label>
                  <select
                    required
                    value={editCase.client_id}
                    onChange={(e) => setEditCase({...editCase, client_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" title="Müvekkil seçimi" aria-label="Müvekkil seçimi"
                  >
                    <option value="">Müvekkil Seçin</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Yargı Türü *
                  </label>
                  <select
                    required
                    value={editCase.yargi_turu}
                    onChange={(e) => {
                      setEditCase({...editCase, yargi_turu: e.target.value, yargi_birimi: ''});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    title="Yargı türü"
                    aria-label="Yargı türü"
                  >
                    <option value="">Yargı Türü Seçin</option>
                    {yargiTurleri.map(tur => (
                      <option key={tur} value={tur}>{tur}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Yargı Birimi *
                  </label>
                  <select
                    required
                    value={editCase.yargi_birimi}
                    onChange={(e) => setEditCase({...editCase, yargi_birimi: e.target.value})}
                    disabled={!editCase.yargi_turu}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Yargı birimi"
                    aria-label="Yargı birimi"
                  >
                    <option value="">Seçiniz</option>
                    {editCase.yargi_turu && yargiBirimleri[editCase.yargi_turu]?.map(birim => (
                      <option key={birim} value={birim}>{birim}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Durum
                  </label>
                  <select
                    value={editCase.status}
                    onChange={(e) => setEditCase({...editCase, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" title="Dava durumu" aria-label="Dava durumu"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Son Tarih
                  </label>
                  <input
                    type="date"
                    value={editCase.deadline}
                    onChange={(e) => setEditCase({...editCase, deadline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" title="Son tarih" aria-label="Son tarih"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Öncelik
                  </label>
                  <select
                    value={editCase.priority}
                    onChange={(e) => setEditCase({...editCase, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" title="Öncelik" aria-label="Öncelik"
                  >
                    {priorityOptions.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tutar (TL)
                  </label>
                  <input
                    type="text"
                    value={editCase.amount}
                    onChange={(e) => setEditCase({...editCase, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" placeholder="0" title="Tutar"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  rows={3}
                  value={editCase.description}
                  onChange={(e) => setEditCase({...editCase, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Dava hakkında detaylar..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}