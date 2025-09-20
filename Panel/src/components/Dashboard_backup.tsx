import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Gavel, Calendar, DollarSign, TrendingUp, Clock, CheckCircle, AlertTriangle, Bot, Search, FileText, Phone, Bell, Plus, Scale, Star } from 'lucide-react';
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
      value: clients.length.toString(),
      change: '+3 bu ay',
      changeType: 'positive',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Aktif Davalar',
      value: cases.length.toString(),
      change: '+2 bu hafta',
      changeType: 'positive',
      icon: Gavel,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Bugünkü Randevular',
      value: todayAppointments.length.toString(),
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
      color: 'bg-green-600',
      action: 'whatsapp'
    }
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      title: 'Ticari Dava - Son Savunma',
      date: '2024-10-20',
      priority: 'high',
      daysLeft: 5
    },
    {
      id: 2,
      title: 'İş Mahkemesi - Duruşma',
      date: '2024-10-25',
      priority: 'medium',
      daysLeft: 10
    },
    {
      id: 3,
      title: 'Boşanma Davası - Belge Teslimi',
      date: '2024-11-01',
      priority: 'low',
      daysLeft: 17
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white p-8 rounded-xl backdrop-blur-xl shadow-2xl border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Hoş Geldiniz, Av. Mehmet Zeki Alagöz! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Bugün 3 randevunuz var ve 2 acil göreviniz bulunuyor.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {new Date().toLocaleDateString('tr-TR', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="text-blue-200">
              {new Date().toLocaleTimeString('tr-TR', { 
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white/70 dark:bg-gray-800/70 p-6 rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 backdrop-blur-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  geçen aya göre
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 backdrop-blur-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🚀 Hızlı İşlemler
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <button
                key={index}
                className="p-4 border border-white/30 dark:border-gray-700/50 rounded-xl hover:shadow-xl transition-all duration-300 text-left group hover:border-blue-300/50 dark:hover:border-blue-600/50 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-gray-800/50"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg backdrop-blur-sm`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {action.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📋 Son Aktiviteler
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 backdrop-blur-sm">
                  <div className={`p-2 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm shadow-sm`}>
                    <IconComponent className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ⏰ Yaklaşan Son Tarihler
          </h3>
          <div className="space-y-4">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="flex items-center justify-between p-3 border border-white/30 dark:border-gray-700/50 rounded-xl bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    deadline.priority === 'high' ? 'bg-red-500' :
                    deadline.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {deadline.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(deadline.date).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    deadline.daysLeft <= 7 ? 'text-red-600' :
                    deadline.daysLeft <= 14 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {deadline.daysLeft} gün
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Assistant Promotion */}
      <div className="bg-gradient-to-r from-purple-50/70 to-blue-50/70 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200/50 dark:border-purple-800/50 rounded-xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100/70 dark:bg-purple-900/70 rounded-xl backdrop-blur-sm shadow-lg">
            <Bot className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-1">
              🤖 AI Hukuki Asistanınız Hazır!
            </h3>
            <p className="text-purple-700 dark:text-purple-300 text-sm">
              Yapay zeka destekli hukuki asistanınız 7/24 hizmetinizde. İçtihat arama, dilekçe hazırlama ve hukuki danışmanlık için hemen başlayın.
            </p>
          </div>
          <button className="px-6 py-3 bg-purple-600/90 text-white rounded-xl hover:bg-purple-700/90 transition-all duration-200 font-medium shadow-lg backdrop-blur-sm hover:shadow-xl">
            AI Asistan'ı Dene
          </button>
        </div>
      </div>
    </div>
  );
}