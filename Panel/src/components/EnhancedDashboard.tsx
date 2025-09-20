import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Gavel, Calendar, DollarSign, TrendingUp, Clock, CheckCircle, Bell, Plus, Scale, FileCheck, AlertTriangle, Star, Bot, Search, FileText, Phone } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { appointments, clients, cases, loading } = useSupabase();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Saati güncelle
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const today = new Date().toDateString();
  const todayAppointments = appointments.filter(apt => 
    new Date(apt.date).toDateString() === today
  );

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const stats = [
    {
      title: 'Toplam Müvekkil',
      value: loading ? '...' : clients.length.toString(),
      change: '↗️ +3 bu ay',
      changeType: 'positive',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Aktif Davalar',
      value: loading ? '...' : cases.length.toString(),
      change: '↗️ +2 bu hafta',
      changeType: 'positive',
      icon: Gavel,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Bugünkü Randevular',
      value: loading ? '...' : todayAppointments.length.toString(),
      change: `📅 ${appointments.length} toplam`,
      changeType: 'neutral',
      icon: Calendar,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Aylık Gelir',
      value: '₺44.109',
      change: '📈 +15% artış',
      changeType: 'positive',
      icon: DollarSign,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'case',
      title: 'Yeni dava eklendi: Ticari Alacak',
      time: '2 saat önce',
      icon: Gavel,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'client',
      title: 'Müvekkil randevusu: Mehmet Yılmaz',
      time: '4 saat önce',
      icon: Users,
      color: 'text-green-600'
    },
    {
      id: 3,
      type: 'ai',
      title: 'AI Asistan: 15 dilekçe oluşturuldu',
      time: '6 saat önce',
      icon: Bot,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'search',
      title: 'İçtihat araması: İş hukuku',
      time: '1 gün önce',
      icon: Search,
      color: 'text-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/50 p-8 mb-8 relative overflow-hidden">
          {/* Arka plan deseni */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
          
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
                <Scale className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Hukuk Bürosu Paneli
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                  Hukuki süreçlerinizi yönetin ve takip edin • {currentTime.toLocaleDateString('tr-TR')} {currentTime.toLocaleTimeString('tr-TR')}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Sistem Operasyonel</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Premium Hesap</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onNavigate?.('settings')}
                  title="Ayarlar ve Bildirimler"
                  className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg group"
                >
                  <Bell className="w-5 h-5 group-hover:animate-pulse" />
                </button>
                <button 
                  onClick={() => onNavigate?.('appointments')}
                  title="Hızlı Randevu Ekle"
                  className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg group"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                </button>
              </div>
              <div className="text-right">
                <div className="text-3xl font-mono font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {currentTime.toLocaleTimeString('tr-TR')}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Canlı Saat</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`bg-gradient-to-br ${stat.color} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                    <p className="text-4xl font-bold mt-2">{stat.value}</p>
                    <p className="text-white/70 text-xs mt-1">{stat.change}</p>
                  </div>
                  <Icon className="w-12 h-12 text-white/70" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Yaklaşan Randevular - Enhanced */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/50 p-8 relative overflow-hidden">
            {/* Arka plan deseni */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-blue-500/5 to-cyan-500/5"></div>
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full blur-xl"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  Yaklaşan Randevular
                </h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-full border border-indigo-200 dark:border-indigo-700">
                  <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                    {upcomingAppointments.length} randevu
                  </span>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment, index) => (
                    <div key={appointment.id} className="group p-6 bg-gradient-to-r from-white via-blue-50/50 to-indigo-50 dark:from-gray-700 dark:via-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-2 border-blue-100 dark:border-blue-800/30 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white font-bold text-lg shadow-lg">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {appointment.client_name || appointment.clientName || appointment.name || appointment.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">{appointment.type}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                                📅 {new Date(appointment.date).toLocaleDateString('tr-TR')}
                              </p>
                              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                                🕐 {appointment.time}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg"></div>
                            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{appointment.status || 'Onaylandı'}</span>
                          </div>
                          <button 
                            onClick={() => onNavigate?.('appointments')}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                          >
                            Detaylar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-700 dark:to-blue-900/30 rounded-2xl inline-block mb-6">
                      <Calendar className="w-20 h-20 mx-auto text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Yaklaşan randevu bulunmuyor</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Yeni randevu eklemek için randevu yönetimi sayfasını kullanın</p>
                    <button 
                      onClick={() => onNavigate?.('appointments')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      Randevu Ekle
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Quick Actions */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/50 p-8 relative overflow-hidden">
            {/* Arka plan deseni */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-xl"></div>
            
            <div className="relative">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                Hızlı İşlemler
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <button 
                  onClick={() => onNavigate?.('appointments')}
                  className="group p-6 bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100 dark:from-blue-900/30 dark:via-blue-800/30 dark:to-cyan-800/30 hover:from-blue-100 hover:via-blue-200 hover:to-cyan-200 dark:hover:from-blue-800/40 dark:hover:via-blue-700/40 dark:hover:to-cyan-700/40 rounded-2xl border-2 border-blue-200 dark:border-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <Calendar className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-2">Yeni Randevu</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Müvekkil randevusu oluştur</p>
                </button>

                <button 
                  onClick={() => onNavigate?.('clients')}
                  className="group p-6 bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 dark:from-green-900/30 dark:via-green-800/30 dark:to-emerald-800/30 hover:from-green-100 hover:via-green-200 hover:to-emerald-200 dark:hover:from-green-800/40 dark:hover:via-green-700/40 dark:hover:to-emerald-700/40 rounded-2xl border-2 border-green-200 dark:border-green-700 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <Users className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-lg font-bold text-green-900 dark:text-green-300 mb-2">Yeni Müvekkil</h3>
                  <p className="text-sm text-green-700 dark:text-green-400">Müvekkil kaydı ekle</p>
                </button>

                <button 
                  onClick={() => onNavigate?.('cases')}
                  className="group p-6 bg-gradient-to-br from-purple-50 via-purple-100 to-violet-100 dark:from-purple-900/30 dark:via-purple-800/30 dark:to-violet-800/30 hover:from-purple-100 hover:via-purple-200 hover:to-violet-200 dark:hover:from-purple-800/40 dark:hover:via-purple-700/40 dark:hover:to-violet-700/40 rounded-2xl border-2 border-purple-200 dark:border-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <Gavel className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-lg font-bold text-purple-900 dark:text-purple-300 mb-2">Yeni Dava</h3>
                  <p className="text-sm text-purple-700 dark:text-purple-400">Dava dosyası aç</p>
                </button>

                <button 
                  onClick={() => onNavigate?.('financials')}
                  className="group p-6 bg-gradient-to-br from-orange-50 via-orange-100 to-amber-100 dark:from-orange-900/30 dark:via-orange-800/30 dark:to-amber-800/30 hover:from-orange-100 hover:via-orange-200 hover:to-amber-200 dark:hover:from-orange-800/40 dark:hover:via-orange-700/40 dark:hover:to-amber-700/40 rounded-2xl border-2 border-orange-200 dark:border-orange-700 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <BarChart3 className="w-12 h-12 text-orange-600 dark:text-orange-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-lg font-bold text-orange-900 dark:text-orange-300 mb-2">Raporlar</h3>
                  <p className="text-sm text-orange-700 dark:text-orange-400">Gelir ve istatistikler</p>
                </button>
              </div>

              {/* AI Hizmetler Bölümü */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-600" />
                  AI Hukuki Hizmetler
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => onNavigate?.('petition-writer')}
                    className="group p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 rounded-xl border border-purple-200 dark:border-purple-700 transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex items-center gap-3">
                      <Bot className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      <div className="text-left">
                        <h4 className="font-semibold text-purple-900 dark:text-purple-300">AI Dilekçe</h4>
                        <p className="text-xs text-purple-700 dark:text-purple-400">Otomatik oluştur</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => onNavigate?.('search')}
                    className="group p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 rounded-xl border border-green-200 dark:border-green-700 transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-8 h-8 text-green-600 dark:text-green-400" />
                      <div className="text-left">
                        <h4 className="font-semibold text-green-900 dark:text-green-300">İçtihat Arama</h4>
                        <p className="text-xs text-green-700 dark:text-green-400">Akıllı arama</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => onNavigate?.('contract-generator')}
                    className="group p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-700 transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      <div className="text-left">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-300">Sözleşme</h4>
                        <p className="text-xs text-blue-700 dark:text-blue-400">Otomatik hazırla</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => onNavigate?.('whatsapp')}
                    className="group p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 rounded-xl border border-orange-200 dark:border-orange-700 transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                      <div className="text-left">
                        <h4 className="font-semibold text-orange-900 dark:text-orange-300">WhatsApp</h4>
                        <p className="text-xs text-orange-700 dark:text-orange-400">7/24 destek</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Sistem Durumu - Geliştirilmiş */}
              <div className="p-6 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-teal-900/20 rounded-2xl border-2 border-emerald-200 dark:border-emerald-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-teal-400/5"></div>
                <div className="relative flex items-start gap-4">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-300">Sistem Durumu: Mükemmel</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">CANLI</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-800 dark:text-emerald-300">Tüm özellikler aktif</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-800 dark:text-emerald-300">Son güncelleme: {currentTime.toLocaleTimeString('tr-TR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-800 dark:text-emerald-300">0 hata, 0 uyarı</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities - Enhanced */}
        <div className="mt-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/50 p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            Son Aktiviteler
          </h2>

          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200">
                  <div className={`p-3 bg-white dark:bg-gray-700 rounded-full shadow-md`}>
                    <Icon className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{activity.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}