import React, { useState } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Mail, Phone, Building, MapPin, Calendar } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import { useDictation } from '../hooks/useDictation';
import DictationButton from './DictationButton';

export default function ClientManagement() {
  const { clients, addClient, updateClient, deleteClient, loading } = useSupabase();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [companyFilter, setCompanyFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: ''
  });

  // Dikte: Adres alanı için
  const {
    isListening: isDictatingAddress,
    isSupported: isDictationSupported,
    interimText: addressInterimText,
    startDictation: startAddressDictation,
    stopDictation: stopAddressDictation,
    clearDictation: clearAddressDictation
  } = useDictation({
    onResult: (text) => {
      setNewClient(prev => ({
        ...prev,
        address: (prev.address || '') + (prev.address ? ' ' : '') + text
      }));
      clearAddressDictation();
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
        case 'CLIENTS_NEW':
          setShowAddModal(true);
          break;
        case 'CLIENTS_SEARCH':
          if (typeof intent.parameters?.query === 'string') setSearchTerm(intent.parameters.query);
          break;
        case 'CLIENTS_FILTER_COMPANY':
          if (typeof intent.parameters?.company === 'string') setCompanyFilter(intent.parameters.company);
          break;
        case 'CLIENTS_SORT': {
          const by = intent.parameters?.by as 'name' | 'date' | undefined;
          const dir = intent.parameters?.dir as 'asc' | 'desc' | undefined;
          if (by) setSortBy(by);
          if (dir) setSortDir(dir);
          break;
        }
        case 'CLIENTS_CLEAR_FILTERS':
          setCompanyFilter('');
          setSearchTerm('');
          setSortBy('name');
          setSortDir('asc');
          setPage(1);
          setSelectedIndex(null);
          break;
        case 'CLIENTS_PAGE_NEXT':
          setPage(p => p + 1);
          break;
        case 'CLIENTS_PAGE_PREV':
          setPage(p => Math.max(1, p - 1));
          break;
        case 'CLIENTS_OPEN_INDEX': {
          const idx = Number(intent.parameters?.index || 0);
          if (idx > 0) setSelectedIndex(idx);
          break;
        }
      }
    };
    window.addEventListener('clients-action', handler);
    return () => window.removeEventListener('clients-action', handler);
  }, []);

  const filteredClients = clients
    .filter(client =>
      (client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!companyFilter || client.company.toLowerCase().includes(companyFilter.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        const cmp = a.name.localeCompare(b.name, 'tr');
        return sortDir === 'asc' ? cmp : -cmp;
      } else {
        const da = new Date(a.created_at).getTime();
        const db = new Date(b.created_at).getTime();
        const cmp = da - db;
        return sortDir === 'asc' ? cmp : -cmp;
      }
    });

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredClients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      await addClient(newClient);
      setNewClient({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: ''
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Müvekkil eklenirken hata:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Müvekkil Yönetimi
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Müvekkillerinizi yönetin ve iletişim bilgilerini takip edin
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Yeni Müvekkil
        </button>
      </div>

      {/* Search and filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Müvekkil ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Şirkete göre filtrele" title="Şirkete göre filtrele"
            />
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => { const [b, d] = e.target.value.split('-') as any; setSortBy(b); setSortDir(d); }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              title="Sırala" aria-label="Sırala"
            >
              <option value="name-asc">İsme göre (A-Z)</option>
              <option value="name-desc">İsme göre (Z-A)</option>
              <option value="date-desc">Tarihe göre (Yeni-Eski)</option>
              <option value="date-asc">Tarihe göre (Eski-Yeni)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pageItems.map((client, idx) => (
          <div key={client.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {client.name}
                    {selectedIndex === idx + 1 && (
                      <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Seçili</span>
                    )}
                  </h3>
                  {client.company && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {client.company}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Müvekkili görüntüle" aria-label="Müvekkili görüntüle">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-green-600 transition-colors" title="Müvekkili düzenle" aria-label="Müvekkili düzenle">
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteClient(client.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Müvekkili sil" aria-label="Müvekkili sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${client.email}`} className="hover:text-blue-600 transition-colors">
                  {client.email}
                </a>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <a href={`tel:${client.phone}`} className="hover:text-blue-600 transition-colors">
                  {client.phone}
                </a>
              </div>

              {client.company && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Building className="w-4 h-4" />
                  <span>{client.company}</span>
                </div>
              )}

              {client.address && (
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span className="line-clamp-2">{client.address}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                <Calendar className="w-4 h-4" />
                <span>Kayıt: {new Date(client.created_at).toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Müvekkil bulunamadı
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Arama kriterlerinizi değiştirin veya yeni bir müvekkil ekleyin.
          </p>
        </div>
      )}

      {/* Pagination controls */}
      {filteredClients.length > pageSize && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded border dark:border-gray-600 disabled:opacity-50">Önceki</button>
          <span className="text-sm text-gray-600 dark:text-gray-300">Sayfa {currentPage} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded border dark:border-gray-600 disabled:opacity-50">Sonraki</button>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Yeni Müvekkil Ekle
              </h3>
            </div>
            
            <form onSubmit={handleAddClient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" placeholder="Ad Soyad" title="Ad Soyad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  E-posta *
                </label>
                <input
                  type="email"
                  required
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" placeholder="E-posta" title="E-posta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  required
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" placeholder="Telefon" title="Telefon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Şirket
                </label>
                <input
                  type="text"
                  value={newClient.company}
                  onChange={(e) => setNewClient({...newClient, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" placeholder="Şirket" title="Şirket"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Adres
                  </label>
                  <DictationButton
                    isListening={isDictatingAddress}
                    isSupported={isDictationSupported}
                    onStart={startAddressDictation}
                    onStop={stopAddressDictation}
                    size="sm"
                    className="ml-2"
                    title="Adrese dikte et"
                  />
                </div>
                <textarea
                  rows={3}
                  value={newClient.address}
                  onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" placeholder="Adres" title="Adres"
                />
                {isDictatingAddress && addressInterimText && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">{addressInterimText}</div>
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
                  {loading ? 'Ekleniyor...' : 'Müvekkil Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}