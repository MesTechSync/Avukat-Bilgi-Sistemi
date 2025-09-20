import React, { useState, useEffect } from 'react';
import { Plus, Calendar, ChevronLeft, ChevronRight, Clock, Edit, Trash2, Search, Filter, User, MapPin, Bell } from 'lucide-react';

interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  type: string;
  date: string;
  time: string;
  location: string;
  status: 'Planlandı' | 'Onaylandı' | 'Tamamlandı' | 'İptal Edildi';
  priority: 'Düşük' | 'Normal' | 'Yüksek' | 'Acil';
  notes: string;
  createdAt: string;
}

interface AppointmentManagementProps {
  onNavigate?: (tab: string) => void;
}

const appointmentTypes = [
  'Müvekkil Görüşmesi',
  'Duruşma',
  'Uzlaştırma',
  'Keşif',
  'İcra Takibi',
  'Noterlik İşlemleri',
  'Mahkeme Başvurusu',
  'Danışmanlık',
  'Diğer'
];

const AppointmentManagement: React.FC<AppointmentManagementProps> = ({ onNavigate }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState<Omit<Appointment, 'id' | 'createdAt'>>({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    type: appointmentTypes[0],
    date: '',
    time: '',
    location: 'Ofis - Ana Salon',
    status: 'Planlandı',
    priority: 'Normal',
    notes: ''
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = () => {
    const saved = localStorage.getItem('appointments');
    if (saved) {
      setAppointments(JSON.parse(saved));
    }
  };

  const saveAppointments = (newAppointments: Appointment[]) => {
    localStorage.setItem('appointments', JSON.stringify(newAppointments));
    setAppointments(newAppointments);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAppointment) {
      const updatedAppointments = appointments.map(apt => 
        apt.id === editingAppointment.id 
          ? { ...formData, id: editingAppointment.id, createdAt: editingAppointment.createdAt }
          : apt
      );
      saveAppointments(updatedAppointments);
    } else {
      const newAppointment: Appointment = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      saveAppointments([...appointments, newAppointment]);
    }

    setIsModalOpen(false);
    setEditingAppointment(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      type: appointmentTypes[0],
      date: '',
      time: '',
      location: 'Ofis - Ana Salon',
      status: 'Planlandı',
      priority: 'Normal',
      notes: ''
    });
  };

  const deleteAppointment = (id: string) => {
    const updatedAppointments = appointments.filter(apt => apt.id !== id);
    saveAppointments(updatedAppointments);
  };

  const editAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone,
      clientEmail: appointment.clientEmail,
      type: appointment.type,
      date: appointment.date,
      time: appointment.time,
      location: appointment.location,
      status: appointment.status,
      priority: appointment.priority,
      notes: appointment.notes
    });
    setIsModalOpen(true);
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  const getDayAppointments = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateStr);
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planlandı': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Onaylandı': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Tamamlandı': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'İptal Edildi': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Acil': return 'bg-red-500';
      case 'Yüksek': return 'bg-orange-500';
      case 'Normal': return 'bg-blue-500';
      case 'Düşük': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                📅 Randevu Yönetimi
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Müvekkil randevularınızı planlayın ve takip edin - Gelişmiş tasarım! ✨
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-1"
              >
                <Plus className="w-5 h-5" />
                Yeni Randevu
              </button>
              <button 
                title="Bildirimler"
                className="p-3 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Takvim */}
          <div className="xl:col-span-2">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-purple-600" />
                  {monthName}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-2 text-sm bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg transition-colors font-medium"
                  >
                    Bugün
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map(day => (
                  <div key={day} className="p-3 text-center text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }, (_, i) => (
                  <div key={`empty-${i}`} className="p-2 h-28"></div>
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dayAppointments = getDayAppointments(day);
                  const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                  
                  return (
                    <div
                      key={day}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0]
                        }));
                        setIsModalOpen(true);
                      }}
                      className={`p-2 h-28 border-2 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 ${
                        isToday 
                          ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300 dark:from-purple-900/30 dark:to-pink-900/30 dark:border-purple-600' 
                          : 'bg-white/60 dark:bg-gray-700/60 border-gray-200 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                      }`}
                    >
                      <div className={`text-sm font-bold ${isToday ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-white'}`}>
                        {day}
                      </div>
                      <div className="mt-1 space-y-1">
                        {dayAppointments.slice(0, 2).map(apt => (
                          <div
                            key={apt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              editAppointment(apt);
                            }}
                            className={`text-xs p-1 rounded-lg truncate cursor-pointer hover:shadow-md transition-all ${getStatusColor(apt.status)}`}
                          >
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(apt.priority)}`}></div>
                              <span className="truncate font-medium">{apt.clientName}</span>
                            </div>
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                            +{dayAppointments.length - 2} daha
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Randevu Listesi */}
          <div className="xl:col-span-1">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-6 h-6 text-purple-600" />
                Randevu Listesi
              </h2>
              
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Müvekkil ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/70 dark:bg-gray-700/70 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/70 dark:bg-gray-700/70 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="Planlandı">Planlandı</option>
                    <option value="Onaylandı">Onaylandı</option>
                    <option value="Tamamlandı">Tamamlandı</option>
                    <option value="İptal Edildi">İptal Edildi</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map(appointment => (
                    <div
                      key={appointment.id}
                      className="p-4 bg-gradient-to-r from-white to-purple-50 dark:from-gray-700/80 dark:to-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(appointment.priority)}`}></div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{appointment.clientName}</h3>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{appointment.type}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(appointment.date).toLocaleDateString('tr-TR')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {appointment.time}
                            </div>
                          </div>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-2">
                          <button
                            onClick={() => editAppointment(appointment)}
                            className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 transition-colors"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteAppointment(appointment.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">Henüz randevu bulunmuyor</p>
                    <p className="text-sm mt-1">Yeni randevu eklemek için yukarıdaki butonu kullanın</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/50">
              <div className="p-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                  {editingAppointment ? 'Randevu Düzenle' : 'Yeni Randevu'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Müvekkil Adı *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.clientName}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Randevu Türü *
                      </label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {appointmentTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Tarih *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Saat *
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.time}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Durum
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="Planlandı">Planlandı</option>
                        <option value="Onaylandı">Onaylandı</option>
                        <option value="Tamamlandı">Tamamlandı</option>
                        <option value="İptal Edildi">İptal Edildi</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Notlar
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ek notlar..."
                    />
                  </div>
                  
                  <div className="flex items-center justify-end gap-3 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingAppointment(null);
                        resetForm();
                      }}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {editingAppointment ? 'Güncelle' : 'Ekle'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(156, 163, 175, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9333ea, #ec4899);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #db2777);
        }
      `}</style>
    </div>
  );
};

export default AppointmentManagement;
