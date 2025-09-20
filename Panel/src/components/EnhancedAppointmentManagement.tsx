import React, { useState, useEffect } from 'react';
import { Plus, Calendar, ChevronLeft, ChevronRight, Clock, Edit, Trash2, Search, Filter, User, MapPin, Bell, Phone, Mail } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';

interface EnhancedAppointment {
  id: number;
  title: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  type: string;
  date: string;
  time: string;
  location?: string;
  status: 'Planlandı' | 'Onaylandı' | 'Tamamlandı' | 'İptal Edildi' | 'Beklemede';
  priority: 'Düşük' | 'Normal' | 'Yüksek' | 'Acil';
  notes?: string;
  description?: string;
  client_id?: number;
  case_id?: number;
  createdAt?: string;
}

interface EnhancedAppointmentManagementProps {
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
  'Konsültasyon',
  'Belge Teslimi',
  'İmza',
  'Diğer'
];

const statusOptions = [
  'Planlandı',
  'Onaylandı', 
  'Beklemede',
  'Tamamlandı',
  'İptal Edildi'
];

const priorityOptions = [
  'Düşük',
  'Normal',
  'Yüksek',
  'Acil'
];

const EnhancedAppointmentManagement: React.FC<EnhancedAppointmentManagementProps> = ({ onNavigate }) => {
  const { appointments, clients, cases, addAppointment, updateAppointment, deleteAppointment, loading } = useSupabase();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<EnhancedAppointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<{ from?: string; to?: string } | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Form state keeps select values as strings to work smoothly with HTML inputs
  interface AppointmentFormData {
    title: string;
    clientName: string;
    clientPhone?: string;
    clientEmail?: string;
    type: string;
    date: string;
    time: string;
    location?: string;
    status: 'Planlandı' | 'Onaylandı' | 'Tamamlandı' | 'İptal Edildi' | 'Beklemede';
    priority: 'Düşük' | 'Normal' | 'Yüksek' | 'Acil';
    notes?: string;
    description?: string;
    client_id: string; // store as string for select
    case_id: string;   // store as string for select
  }

  const [formData, setFormData] = useState<AppointmentFormData>({
    title: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    type: appointmentTypes[0],
    date: '',
    time: '',
    location: 'Ofis - Ana Salon',
    status: 'Planlandı',
    priority: 'Normal',
    notes: '',
    description: '',
    client_id: '',
    case_id: ''
  });

  // Helpers (hoisted as function declarations to avoid TDZ runtime errors)
  function getClientName(clientId?: number) {
    if (!clientId) return '';
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : '';
  }

  function getCaseTitle(caseId?: number) {
    if (!caseId) return '';
    const case_ = cases.find(c => c.id === caseId);
    return case_ ? case_.title : '';
  }

  // Fast lookup maps to avoid calling helpers during initial render (prevents TDZ issues)
  const clientsById = React.useMemo(() => {
    const m = new Map<number, string>();
    (clients || []).forEach(c => { if (c && typeof c.id === 'number') m.set(c.id, c.name); });
    return m;
  }, [clients]);

  const casesById = React.useMemo(() => {
    const m = new Map<number, string>();
    (cases || []).forEach(cs => { if (cs && typeof cs.id === 'number') m.set(cs.id, cs.title); });
    return m;
  }, [cases]);

  // Enhanced appointments with priority and additional fields
  const enhancedAppointments: EnhancedAppointment[] = appointments.map(apt => ({
    id: apt.id,
    title: apt.title || apt.clientName || 'Randevu',
    clientName: apt.clientName || (apt.client_id != null ? (clientsById.get(apt.client_id) || '') : ''),
    clientPhone: apt.clientPhone || '',
    clientEmail: apt.clientEmail || '',
    type: apt.type,
    date: apt.date,
    time: apt.time,
    location: apt.location || 'Ofis',
    status: apt.status as any,
    priority: apt.priority || 'Normal',
    notes: apt.notes || apt.description || '',
    description: apt.description,
    client_id: apt.client_id,
    case_id: apt.case_id,
    createdAt: apt.created_at || new Date().toISOString()
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Convert select string values to numbers where applicable
    const clientIdNum = formData.client_id ? Number(formData.client_id) : undefined;
    const caseIdNum = formData.case_id ? Number(formData.case_id) : undefined;

    const appointmentData = {
      title: formData.title || formData.clientName || 'Randevu',
      date: formData.date!,
      time: formData.time!,
      type: formData.type!,
      status: formData.status!,
      client_id: clientIdNum,
      case_id: caseIdNum,
      description: formData.notes || formData.description || '',
      // Extended fields for compatibility
      clientName: formData.clientName!,
      clientPhone: formData.clientPhone,
      clientEmail: formData.clientEmail,
      location: formData.location,
      priority: formData.priority,
      notes: formData.notes
    };

    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, appointmentData);
      } else {
        await addAppointment(appointmentData);
      }
      
      setIsModalOpen(false);
      setEditingAppointment(null);
      resetForm();
    } catch (error) {
      console.error('Randevu işleminde hata:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      type: appointmentTypes[0],
      date: '',
      time: '',
      location: 'Ofis - Ana Salon',
      status: 'Planlandı',
      priority: 'Normal',
      notes: '',
      description: '',
      client_id: '',
      case_id: ''
    });
  };

  const editAppointment = (appointment: EnhancedAppointment) => {
    setEditingAppointment(appointment);
    setFormData({
      title: appointment.title,
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone,
      clientEmail: appointment.clientEmail,
      type: appointment.type,
      date: appointment.date,
      time: appointment.time,
      location: appointment.location,
      status: appointment.status,
      priority: appointment.priority,
      notes: appointment.notes,
      description: appointment.description,
      client_id: appointment.client_id != null ? String(appointment.client_id) : '',
      case_id: appointment.case_id != null ? String(appointment.case_id) : ''
    });
    setIsModalOpen(true);
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  const getDayAppointments = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    return enhancedAppointments.filter(apt => apt.date === dateStr);
  };

  const filteredAppointments = enhancedAppointments.filter(appointment => {
    const matchesSearch = 
      appointment.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesType = filterType === 'all' || (appointment.type || '').toLowerCase() === filterType.toLowerCase();
    const matchesPriority = filterPriority === 'all' || (appointment.priority || '').toLowerCase() === filterPriority.toLowerCase();
    const matchesDate = !filterDateRange || (!filterDateRange.from && !filterDateRange.to) || (() => {
      const d = new Date(appointment.date).getTime();
      const fromOk = !filterDateRange.from || d >= new Date(filterDateRange.from).getTime();
      const toOk = !filterDateRange.to || d <= new Date(filterDateRange.to).getTime();
      return fromOk && toOk;
    })();
    return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planlandı': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Onaylandı': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Tamamlandı': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'İptal Edildi': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'Beklemede': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
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

  // getClientName/getCaseTitle moved above

  // Voice actions listener
  useEffect(() => {
    const handler = (e: Event) => {
      const intent = (e as CustomEvent).detail?.intent as { action?: string; parameters?: any };
      if (!intent) return;
      switch (intent.action) {
        case 'APPOINTMENTS_VIEW': {
          const v = intent.parameters?.view as 'calendar' | 'list' | undefined;
          if (v) setViewMode(v);
          break;
        }
        case 'APPOINTMENTS_NEW': {
          setIsModalOpen(true);
          break;
        }
        case 'APPOINTMENTS_FILTER_STATUS': {
          const status = intent.parameters?.status as string | undefined;
          if (status) setFilterStatus(status);
          break;
        }
        case 'APPOINTMENTS_FILTER_TYPE': {
          const t = intent.parameters?.type as string | undefined;
          if (t) setFilterType(t);
          break;
        }
        case 'APPOINTMENTS_FILTER_PRIORITY': {
          const p = intent.parameters?.priority as string | undefined;
          if (p) setFilterPriority(p.toLowerCase());
          break;
        }
        case 'APPOINTMENTS_FILTER_DATE_RANGE': {
          const from = intent.parameters?.from as string | undefined;
          const to = intent.parameters?.to as string | undefined;
          setFilterDateRange({ from, to });
          break;
        }
        case 'APPOINTMENTS_CLEAR_FILTERS': {
          setFilterStatus('all');
          setFilterType('all');
          setFilterPriority('all');
          setFilterDateRange(null);
          setSearchTerm('');
          setPage(1);
          setSelectedIndex(null);
          break;
        }
        case 'APPOINTMENTS_SEARCH': {
          const q = (intent.parameters?.query as string) || '';
          if (q) setSearchTerm(q);
          break;
        }
        case 'APPOINTMENTS_CAL_NAV': {
          const step = intent.parameters?.step as 'next' | 'prev' | 'today' | undefined;
          if (step === 'next') setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
          else if (step === 'prev') setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
          else if (step === 'today') setCurrentDate(new Date());
          break;
        }
        case 'APPOINTMENTS_PAGE_NEXT': {
          setViewMode('list');
          setPage(p => p + 1);
          break;
        }
        case 'APPOINTMENTS_PAGE_PREV': {
          setViewMode('list');
          setPage(p => Math.max(1, p - 1));
          break;
        }
        case 'APPOINTMENTS_OPEN_INDEX': {
          const idx = Number(intent.parameters?.index || 0);
          if (idx > 0) { setViewMode('list'); setSelectedIndex(idx); }
          break;
        }
        case 'APPOINTMENTS_EDIT_INDEX': {
          const idx = Number(intent.parameters?.index || 0);
          if (idx > 0) {
            const item = filteredAppointments.slice((page - 1) * pageSize, page * pageSize)[idx - 1];
            if (item) editAppointment(item);
          }
          break;
        }
        case 'APPOINTMENTS_DELETE_INDEX': {
          const idx = Number(intent.parameters?.index || 0);
          if (idx > 0) {
            const item = filteredAppointments.slice((page - 1) * pageSize, page * pageSize)[idx - 1];
            if (item) deleteAppointment(item.id);
          }
          break;
        }
      }
    };
    window.addEventListener('appointments-action', handler);
    return () => window.removeEventListener('appointments-action', handler);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                📅 Gelişmiş Randevu Yönetimi
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Müvekkil randevularınızı planlayın ve takip edin - Gelişmiş özelliklerle! ✨
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'calendar' 
                      ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Takvim
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-1" />
                  Liste
                </button>
              </div>
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

        {viewMode === 'calendar' ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Calendar View */}
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
                      title="Önceki ay"
                      aria-label="Önceki ay"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className="px-4 py-2 text-sm bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg transition-colors font-medium"
                      title="Bugüne git"
                      aria-label="Bugüne git"
                    >
                      Bugün
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                      className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                      title="Sonraki ay"
                      aria-label="Sonraki ay"
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
                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(apt.priority!)}`}></div>
                                <span className="truncate font-medium">{apt.clientName || apt.title}</span>
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

            {/* Appointment List Sidebar */}
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
                      title="Durum filtresi"
                      aria-label="Durum filtresi"
                    >
                      <option value="all">Tüm Durumlar</option>
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.slice(0, 10).map(appointment => (
                      <div
                        key={appointment.id}
                        className="p-4 bg-gradient-to-r from-white to-purple-50 dark:from-gray-700/80 dark:to-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-3 h-3 rounded-full ${getPriorityColor(appointment.priority!)}`}></div>
                              <h3 className="font-bold text-gray-900 dark:text-white">{appointment.clientName || appointment.title}</h3>
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
                            {appointment.clientPhone && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                                <Phone className="w-3 h-3" />
                                {appointment.clientPhone}
                              </div>
                            )}
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
        ) : (
          /* List View - Enhanced original list */
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Randevu ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                title="Durum filtresi"
                aria-label="Durum filtresi"
              >
                <option value="all">Tüm Durumlar</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Enhanced List */}
            <div className="space-y-4">
              {filteredAppointments.slice((page - 1) * pageSize, page * pageSize).map((appointment, idx) => (
                <div
                  key={appointment.id}
                  className={`p-6 bg-gradient-to-r from-white to-purple-50 dark:from-gray-700/80 dark:to-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 ${selectedIndex === idx + 1 ? 'ring-2 ring-purple-400 dark:ring-purple-500' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-4 h-4 rounded-full ${getPriorityColor(appointment.priority!)}`}></div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {appointment.title || appointment.clientName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(appointment.date).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          {appointment.time}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                            {appointment.type}
                          </span>
                        </div>
                      </div>

                      {appointment.clientPhone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <Phone className="w-4 h-4" />
                          {appointment.clientPhone}
                        </div>
                      )}

                      {appointment.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <MapPin className="w-4 h-4" />
                          {appointment.location}
                        </div>
                      )}

                      {appointment.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {appointment.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
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
              ))}
            </div>

            {filteredAppointments.length === 0 && (
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
            {/* Pagination */}
            {filteredAppointments.length > pageSize && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded border dark:border-gray-600 disabled:opacity-50">Önceki</button>
                <span className="text-sm text-gray-600 dark:text-gray-300">Sayfa {page} / {Math.ceil(filteredAppointments.length / pageSize)}</span>
                <button onClick={() => setPage(p => Math.min(Math.ceil(filteredAppointments.length / pageSize), p + 1))} disabled={page >= Math.ceil(filteredAppointments.length / pageSize)} className="px-3 py-1.5 rounded border dark:border-gray-600 disabled:opacity-50">Sonraki</button>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/50">
              <div className="p-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                  {editingAppointment ? 'Randevu Düzenle' : 'Yeni Randevu'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Randevu Başlığı *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Örn: Müvekkil görüşmesi"
                      />
                    </div>
                    
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
                        placeholder="Örn: Ad Soyad"
                        title="Müvekkil adı"
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
                        placeholder="Örn: 0532 123 45 67"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        E-posta
                      </label>
                      <input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Örn: musteri@email.com"
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
                        title="Randevu türü seçin"
                        aria-label="Randevu türü"
                      >
                        {appointmentTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Öncelik
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        title="Öncelik seviyesi seçin"
                        aria-label="Öncelik seviyesi"
                      >
                        {priorityOptions.map(priority => (
                          <option key={priority} value={priority}>{priority}</option>
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
                        title="Randevu tarihi seçin"
                        aria-label="Randevu tarihi"
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
                        title="Randevu saati seçin"
                        aria-label="Randevu saati"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Lokasyon
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Örn: Ofis - Ana Salon, Mahkeme"
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
                        title="Randevu durumu seçin"
                        aria-label="Randevu durumu"
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Müvekkil
                      </label>
                      <select
                        value={formData.client_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        title="Müvekkil seçin"
                        aria-label="Müvekkil seçimi"
                      >
                        <option value="">Müvekkil Seçin (İsteğe Bağlı)</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        İlgili Dava
                      </label>
                      <select
                        value={formData.case_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, case_id: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        title="Dava seçin"
                        aria-label="Dava seçimi"
                      >
                        <option value="">Dava Seçin (İsteğe Bağlı)</option>
                        {cases.map(case_ => (
                          <option key={case_.id} value={case_.id}>{case_.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Notlar
                    </label>
                    <textarea
                      rows={4}
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ek notlar, özel istekler, hatırlatmalar..."
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
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {loading ? 'İşleniyor...' : (editingAppointment ? 'Güncelle' : 'Ekle')}
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

export default EnhancedAppointmentManagement;