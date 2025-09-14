import React, { useCallback, useState } from 'react';
import { Scale, Search, FileText, Users, Calendar, DollarSign, Settings as SettingsIcon, Bot, Phone, Building, Gavel, BarChart3, Bell, Menu, X, Sun, Moon, User, CheckCircle, Loader2 } from 'lucide-react';
import { useSupabase } from './hooks/useSupabase';

// Import all components
import AILegalAssistant from './components/AILegalAssistant';
import AdvancedSearch from './components/AdvancedSearch';
import PetitionWriter from './components/PetitionWriter';
import ContractGenerator from './components/ContractGenerator';
import WhatsAppIntegration from './components/WhatsAppIntegration';
import FileConverter from './components/FileConverter';
import NotebookLLM from './components/NotebookLLM';
import Dashboard from './components/Dashboard';
import CaseManagement from './components/CaseManagement';
import ClientManagement from './components/ClientManagement';
import AppointmentManagement from './components/AppointmentManagement';
import FinancialManagement from './components/FinancialManagement';
import Settings from './components/Settings';
import Profile from './components/Profile';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const { loading, error } = useSupabase();

  // Backend health check state
  // Prefer same-origin paths; if Panel runs on a different origin (Vite dev), use VITE_BACKEND_URL
  const backendUrl: string = (import.meta as unknown as { env?: { VITE_BACKEND_URL?: string } }).env?.VITE_BACKEND_URL || '';
  const [backendStatus, setBackendStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('checking');
  const [backendInfo, setBackendInfo] = useState<{ service?: string; version?: string; tools_count?: number } | null>(null);

  const checkBackend = useCallback(async () => {
    setBackendStatus('checking');
    const tryHealth = async (base: string) => {
      const url = base ? `${base.replace(/\/$/, '')}/health` : `/health`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    };
    try {
      const base = typeof backendUrl === 'string' ? backendUrl : '';
      // 1) Try same-origin first (single-port)
      try {
        const data = await tryHealth('');
        setBackendInfo(data);
        setBackendStatus('ok');
        return;
      } catch {
        // ignore and try configured URL next
      }
      // 2) If same-origin failed and VITE_BACKEND_URL is provided, try it
      if (base) {
        const data = await tryHealth(base);
        setBackendInfo(data);
        setBackendStatus('ok');
        return;
      }
      throw new Error('No backend reachable');
    } catch {
      setBackendInfo(null);
      setBackendStatus('error');
    }
  }, [backendUrl]);

  const menuItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: BarChart3, color: 'text-blue-600' },
    { id: 'ai-assistant', label: 'AI Hukuki Asistan', icon: Bot, color: 'text-purple-600', badge: 'YENİ' },
    { id: 'search', label: 'İçtihat Arama', icon: Search, color: 'text-green-600', badge: 'AI' },
    { id: 'petition-writer', label: 'Dilekçe Yazım', icon: FileText, color: 'text-orange-600', badge: 'AI' },
    { id: 'contract-generator', label: 'Sözleşme Oluştur', icon: Building, color: 'text-indigo-600', badge: 'YENİ' },
  { id: 'whatsapp', label: 'WhatsApp Destek', icon: Phone, color: 'text-green-500', badge: '7/24' },
  { id: 'notebook-llm', label: 'Notebook LLM', icon: Bot, color: 'text-fuchsia-600', badge: 'BETA' },
  { id: 'file-converter', label: 'Dosya Dönüştürücü', icon: FileText, color: 'text-teal-600', badge: 'YENİ' },
    { id: 'cases', label: 'Dava Yönetimi', icon: Gavel, color: 'text-red-600' },
    { id: 'clients', label: 'Müvekkil Yönetimi', icon: Users, color: 'text-blue-500' },
    { id: 'appointments', label: 'Randevu Yönetimi', icon: Calendar, color: 'text-purple-500' },
    { id: 'financials', label: 'Mali İşler', icon: DollarSign, color: 'text-green-500' },
    { id: 'settings', label: 'Ayarlar', icon: SettingsIcon, color: 'text-gray-600' },
    { id: 'profile', label: 'Hesabım', icon: User, color: 'text-indigo-600' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'ai-assistant':
        return <AILegalAssistant />;
      case 'search':
        return <AdvancedSearch />;
      case 'petition-writer':
        return <PetitionWriter />;
      case 'contract-generator':
        return <ContractGenerator />;
      case 'whatsapp':
        return <WhatsAppIntegration />;
      case 'file-converter':
        return <FileConverter />;
      case 'notebook-llm':
        return <NotebookLLM />;
      case 'cases':
        return <CaseManagement />;
      case 'clients':
        return <ClientManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'financials':
        return <FinancialManagement />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  // Apply theme on component mount
  React.useEffect(() => {
    // Apply theme immediately when darkMode changes
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]); // Watch darkMode changes

  // Run initial backend health check once on mount
  React.useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Sistem yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Bağlantı Hatası
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl border-r border-white/20 dark:border-gray-700/50 transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-white/20 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600/90 to-purple-600/90 rounded-lg shadow-lg backdrop-blur-sm">
              <Scale className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Karar
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  AI Hukuki Platform
                </p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? 'Menüyü daralt' : 'Menüyü genişlet'}
              className="ml-auto p-1 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50/70 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-lg backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:backdrop-blur-sm'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${isActive ? item.color : ''}`} />
                {sidebarOpen && (
                  <>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto px-2 py-0.5 text-xs font-medium rounded-full ${
                        item.badge === 'YENİ' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        item.badge === 'AI' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        item.badge === '7/24' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-white/20 dark:border-gray-700/50">
            <div className="bg-gradient-to-r from-blue-50/70 to-purple-50/70 dark:from-blue-900/30 dark:to-purple-900/30 p-3 rounded-lg backdrop-blur-sm border border-blue-200/30 dark:border-blue-800/30 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  AI Asistan Aktif
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                7/24 hukuki destek için AI asistanınız hazır
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg border-b border-white/20 dark:border-gray-700/50 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Menu button and title */}
            <div className="flex items-center gap-4">
              {/* Menu button - always visible on mobile, hidden on desktop when sidebar is open */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title={sidebarOpen ? 'Menüyü daralt' : 'Menüyü genişlet'}
                className={`p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 backdrop-blur-sm ${
                  sidebarOpen ? 'hidden lg:block' : 'block'
                }`}
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {menuItems.find(item => item.id === activeTab)?.label || 'Ana Sayfa'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activeTab === 'dashboard' && 'Hukuki süreçlerinizi yönetin ve takip edin'}
                  {activeTab === 'ai-assistant' && 'Yapay zeka destekli hukuki danışmanlık'}
                  {activeTab === 'search' && 'Milyonlarca karar arasından arama yapın'}
                  {activeTab === 'petition-writer' && 'AI ile profesyonel dilekçeler oluşturun'}
                  {activeTab === 'contract-generator' && 'Hukuki sözleşmelerinizi hazırlayın'}
                  {activeTab === 'whatsapp' && '7/24 WhatsApp üzerinden hukuki destek'}
                  {activeTab === 'cases' && 'Davalarınızı organize edin ve takip edin'}
                  {activeTab === 'clients' && 'Müvekkillerinizi yönetin'}
                  {activeTab === 'appointments' && 'Randevularınızı planlayın'}
                  {activeTab === 'financials' && 'Mali durumunuzu takip edin'}
                  {activeTab === 'settings' && 'Sistem ayarlarınızı yapılandırın'}
                  {activeTab === 'profile' && 'Profil bilgilerinizi yönetin'}
                </p>
              </div>
            </div>
            
            {/* Right side - Actions and user */}
            <div className="flex items-center gap-4">
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                {/* Theme Toggle Button */}
                <button 
                  onClick={toggleTheme}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 backdrop-blur-sm shadow-sm"
                  title={darkMode ? 'Gündüz moduna geç' : 'Gece moduna geç'}
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                
                <button title="Bildirimler" className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 backdrop-blur-sm shadow-sm">
                  <Bell className="w-5 h-5" />
                </button>
                {/* Backend Health Button */}
                <button
                  onClick={checkBackend}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200 backdrop-blur-sm shadow-sm"
                  title={`Backend: ${backendUrl}`}
                >
                  {backendStatus === 'checking' ? (
                    <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                  ) : backendStatus === 'ok' ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : backendStatus === 'error' ? (
                    <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                  )}
                  <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300">
                    {backendStatus === 'ok' ? 'Backend: Sağlıklı' : backendStatus === 'error' ? 'Backend: Hata' : backendStatus === 'checking' ? 'Backend: Kontrol ediliyor' : 'Backend'}
                  </span>
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  title="Ayarlar"
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 backdrop-blur-sm shadow-sm"
                >
                  <SettingsIcon className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile */}
              <button 
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-3 pl-4 border-l border-white/30 dark:border-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-700/30 rounded-lg p-2 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600/90 to-purple-600/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                  <span className="text-white text-sm font-medium">MZA</span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">Av. Mehmet Zeki Alagöz</p>
                  <p className="text-gray-500 dark:text-gray-400">Premium Üye</p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/30 dark:from-gray-900/50 dark:to-blue-900/20">
          {/* Backend status banner */}
          {backendStatus === 'error' && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200 border border-red-200/50 dark:border-red-800/50">
                  Backend'e bağlanılamadı. Lütfen sunucunun çalıştığını ve erişilebilir olduğunu kontrol edin.
            </div>
          )}
          {backendStatus === 'ok' && backendInfo && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200 border border-green-200/50 dark:border-green-800/50 text-sm">
              <span className="font-medium">Backend Sağlıklı</span> · {backendInfo.service || 'Service'} v{backendInfo.version || ''} · Araçlar: {backendInfo.tools_count ?? '—'}
            </div>
          )}
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;