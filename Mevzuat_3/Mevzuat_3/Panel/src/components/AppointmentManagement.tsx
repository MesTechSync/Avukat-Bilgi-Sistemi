import React, { useState } from 'react';
import { Plus, Search, Calendar, Clock, Eye, Edit, Trash2, Users, MapPin, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';

export default function AppointmentManagement() {
  const { appointments, clients, cases, addAppointment, updateAppointment, deleteAppointment, loading } = useSupabase();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [newAppointment, setNewAppointment] = useState({
    title: '',
    date: '',
    time: '',
    type: '',
    status: 'Planlandı',
    client_id: '',
    case_id: '',
    description: ''
  });

  const appointmentTypes = [
    'Görüşme', 'Duruşma', 'Konsültasyon', 'Belge Teslimi', 'İmza', 'Diğer'
  ];

  const statusOptions = [
    'Planlandı', 'Onaylandı', 'Beklemede', 'Tamamlandı', 'İptal'
  ];

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    try {
      await addAppointment(newAppointment);
      setNewAppointment({
        title: '',
        date: '',
        time: '',
        type: '',
        status: 'Planlandı',
        client_id: '',
        case_id: '',
        description: ''
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Randevu eklenirken hata:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Tamamlandı':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Onaylandı':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Beklemede':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'İptal':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Tamamlandı':
        return CheckCircle;
      case 'Onaylandı':
        return CheckCircle;
      case 'Beklemede':
        return AlertCircle;
      case 'İptal':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Bilinmeyen Müvekkil';
  };

  const getCaseTitle = (caseId) => {
    const case_ = cases.find(c => c.id === caseId);
    return case_ ? case_.title : '';
  };

  const isUpcoming = (date, time) => {
    const appointmentDateTime = new Date(`${date}T${time}`);
    return appointmentDateTime > new Date();
  };

  const sortedAppointments = filteredAppointments.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Randevu Yönetimi
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Randevularınızı planlayın ve takip edin
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Yeni Randevu
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Randevu ara..."
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

      {/* Appointments List */}
      <div className="space-y-4">
        {sortedAppointments.map((appointment) => {
          const StatusIcon = getStatusIcon(appointment.status);
          const upcoming = isUpcoming(appointment.date, appointment.time);
          
          return (
            <div key={appointment.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 ${
              upcoming ? 'border-blue-200 dark:border-blue-800' : 'border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${upcoming ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <Calendar className={`w-5 h-5 ${upcoming ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {appointment.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(appointment.date).toLocaleDateString('tr-TR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {appointment.time}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          {appointment.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {appointment.client_id && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{getClientName(appointment.client_id)}</span>
                      </div>
                    )}

                    {appointment.case_id && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>{getCaseTitle(appointment.case_id)}</span>
                      </div>
                    )}
                  </div>

                  {appointment.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {appointment.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-4 h-4" />
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    {upcoming && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                        Yaklaşan
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-4">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteAppointment(appointment.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedAppointments.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Randevu bulunamadı
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Arama kriterlerinizi değiştirin veya yeni bir randevu ekleyin.
          </p>
        </div>
      )}

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Yeni Randevu Ekle
              </h3>
            </div>
            
            <form onSubmit={handleAddAppointment} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Randevu Başlığı *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAppointment.title}
                    onChange={(e) => setNewAppointment({...newAppointment, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tarih *
                  </label>
                  <input
                    type="date"
                    required
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Saat *
                  </label>
                  <input
                    type="time"
                    required
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Randevu Türü *
                  </label>
                  <select
                    required
                    value={newAppointment.type}
                    onChange={(e) => setNewAppointment({...newAppointment, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Tür Seçin</option>
                    {appointmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Durum
                  </label>
                  <select
                    value={newAppointment.status}
                    onChange={(e) => setNewAppointment({...newAppointment, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Müvekkil
                  </label>
                  <select
                    value={newAppointment.client_id}
                    onChange={(e) => setNewAppointment({...newAppointment, client_id: e.target.value})}
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
                    İlgili Dava
                  </label>
                  <select
                    value={newAppointment.case_id}
                    onChange={(e) => setNewAppointment({...newAppointment, case_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Dava Seçin</option>
                    {cases.map(case_ => (
                      <option key={case_.id} value={case_.id}>
                        {case_.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  rows={3}
                  value={newAppointment.description}
                  onChange={(e) => setNewAppointment({...newAppointment, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Randevu hakkında detaylar..."
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
                  {loading ? 'Ekleniyor...' : 'Randevu Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}