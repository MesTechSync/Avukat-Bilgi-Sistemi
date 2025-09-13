import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar, DollarSign, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';

export default function CaseManagement() {
  const { cases, clients, addCase, updateCase, deleteCase, loading } = useSupabase();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
    return matchesSearch && matchesStatus;
  });

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
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteCase(case_.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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