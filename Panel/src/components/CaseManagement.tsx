import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar, DollarSign, AlertTriangle, Copy, Users } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import ConfirmDialog from './ConfirmDialog';

export default function CaseManagement() {
  const { cases, clients, addCase, updateCase, deleteCase, duplicateCase, restoreCase, loading } = useSupabase();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<any | null>(null);
  const [toast, setToast] = useState<{msg:string; action?:{label:string; onClick:()=>void}}|null>(null);

  const [newCase, setNewCase] = useState({
    title: '',
    client_id: '',
    case_type: '',
    status: 'Beklemede',
    deadline: '',
    priority: 'Orta',
    amount: '',
    description: ''
  });

  const caseTypes = [
    'Ticari Hukuk', 'İş Hukuku', 'Aile Hukuku', 'Ceza Hukuku',
    'İdare Hukuku', 'Medeni Hukuk', 'Borçlar Hukuku', 'Miras Hukuku'
  ];

  const statusOptions = [
    'Beklemede', 'Devam Ediyor', 'İnceleme', 'Tamamlandı', 'İptal'
  ];

  const priorityOptions = ['Düşük', 'Orta', 'Yüksek', 'Acil'];

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.case_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || case_.status === statusFilter;
    const matchesPriority = !priorityFilter || case_.priority === priorityFilter;
    const matchesType = !typeFilter || case_.case_type === typeFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const ActiveFilters = () => {
    const badges: Array<{ label: string; color: string; onClear?: () => void }> = [];
    if (statusFilter) badges.push({ label: `Durum: ${statusFilter}`, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200', onClear: () => setStatusFilter('') });
    if (priorityFilter) badges.push({ label: `Öncelik: ${priorityFilter}`, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200', onClear: () => setPriorityFilter('') });
    if (typeFilter) badges.push({ label: `Tür: ${typeFilter}`, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200', onClear: () => setTypeFilter('') });
    if (!badges.length) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {badges.map((b, i) => (
          <span key={i} className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${b.color}`}>
            {b.label}
            {b.onClear && (
              <button onClick={b.onClear} className="ml-1 text-current/70 hover:text-current" title="Temizle">×</button>
            )}
          </span>
        ))}
        <button
          onClick={() => { setStatusFilter(''); setPriorityFilter(''); setTypeFilter(''); }}
          className="ml-2 text-xs text-gray-600 dark:text-gray-300 hover:underline"
        >Filtreleri temizle</button>
      </div>
    );
  };

  // Apply list-filter/list-sort (basic: set status = Devam Ediyor for demo)
  React.useEffect(() => {
    const onFilter = (e: Event) => {
      const detail = (e as CustomEvent).detail as any;
      const page = detail?.page as string | undefined;
      if (page && page !== 'cases') return;
      const nextStatus = detail?.filter?.status as string | undefined;
      if (nextStatus) setStatusFilter(nextStatus);
      const nextPrio = detail?.filter?.priority as string | undefined;
      if (nextPrio) setPriorityFilter(nextPrio);
      const nextType = detail?.filter?.case_type as string | undefined;
      if (nextType) setTypeFilter(nextType);
      if (!nextStatus && !nextPrio && !nextType) setStatusFilter(prev => prev || 'Devam Ediyor');
    };
    const onSort = (e: Event) => {
      // Sorting UI yok; gelecekte eklenecek
    };
    window.addEventListener('list-filter', onFilter as any);
    window.addEventListener('list-sort', onSort as any);
    return () => {
      window.removeEventListener('list-filter', onFilter as any);
      window.removeEventListener('list-sort', onSort as any);
    };
  }, []);

  const askDelete = (c:any) => {
    setPendingDelete(c);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!pendingDelete) return;
    const backup = pendingDelete;
    setConfirmOpen(false);
    setPendingDelete(null);
    await deleteCase(backup.id);
    setToast({
      msg: 'Dava silindi',
      action: {
        label: 'Geri Al',
        onClick: async () => {
          setToast(null);
          await restoreCase(backup);
        }
      }
    });
    setTimeout(() => setToast(null), 5000);
  };

  const handleAddCase = async (e) => {
    e.preventDefault();
    try {
      await addCase(newCase);
      setNewCase({
        title: '',
        client_id: '',
        case_type: '',
        status: 'Beklemede',
        deadline: '',
        priority: 'Orta',
        amount: '',
        description: ''
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Dava eklenirken hata:', error);
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
      default:
        return 'text-green-600';
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Bilinmeyen Müvekkil';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dava Yönetimi
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Davalarınızı organize edin ve takip edin
          </p>
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
              data-dictation-default="true"
              title="Dava ara"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            aria-label="Durum filtresi"
            title="Durum filtresi"
          >
            <option value="">Tüm Durumlar</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
  {/* Active filter badges */}
  <ActiveFilters />
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCases.map((case_) => (
          <div key={case_.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {case_.title}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(case_.status)}`}>
                    {case_.status}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {case_.case_type}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors" aria-label="Görüntüle" title="Görüntüle">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-green-600 transition-colors" aria-label="Düzenle" title="Düzenle">
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => duplicateCase(case_.id)}
                  className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                  title="Kopyala"
                  aria-label="Kopyala"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => askDelete(case_)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  aria-label="Sil"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{getClientName(case_.client_id)}</span>
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

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmOpen}
        title="Dava Silinsin mi?"
        message="Bu işlem geri alınamaz. Silmek istediğinize emin misiniz?"
        confirmText="Evet, Sil"
        cancelText="Vazgeç"
        onConfirm={doDelete}
        onCancel={() => { setConfirmOpen(false); setPendingDelete(null); }}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg">
            <span>{toast.msg}</span>
            {toast.action && (
              <button onClick={toast.action.onClick} className="underline font-medium">{toast.action.label}</button>
            )}
          </div>
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    aria-label="Dava Başlığı"
                    placeholder="Dava başlığı"
        data-dictation-default="true"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    aria-label="Müvekkil"
                    title="Müvekkil"
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
                    Dava Türü *
                  </label>
                  <select
                    required
                    value={newCase.case_type}
                    onChange={(e) => setNewCase({...newCase, case_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    aria-label="Dava Türü"
                    title="Dava Türü"
                  >
                    <option value="">Dava Türü Seçin</option>
                    {caseTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    aria-label="Durum"
                    title="Durum"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    aria-label="Son Tarih"
                    title="Son Tarih"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Öncelik
                  </label>
                  <select
                    value={newCase.priority}
                    onChange={(e) => setNewCase({...newCase, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    aria-label="Öncelik"
                    title="Öncelik"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                    aria-label="Tutar"
                    title="Tutar"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  rows={3}
                  value={newCase.description}
                  onChange={(e) => setNewCase({...newCase, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Dava hakkında detaylar..."
                />
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
                  data-dictation-save="true"
                >
                  {loading ? 'Ekleniyor...' : 'Dava Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}