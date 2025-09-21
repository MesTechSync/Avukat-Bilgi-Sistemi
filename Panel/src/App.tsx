import React, { useState } from 'react';
import { Scale, Search, FileText, Users, Calendar, DollarSign, Settings as SettingsIcon, Bot, Building, Gavel, BarChart3, Bell, Menu, X, Sun, Moon, User, CheckCircle, Loader2 } from 'lucide-react';
import { useSupabase } from './hooks/useSupabase';

// Import all components
// Using the new cleaned component (renamed to avoid prior corruption triggers)
import LegalAssistantChat from './components/LegalAssistantChat';
import AdvancedSearch from './components/AdvancedSearch';
import PetitionWriter from './components/PetitionWriter';
import ContractGenerator from './components/ContractGenerator';
import FileConverter from './components/FileConverter';
import NotebookLLM from './components/NotebookLLM';
import EnhancedDashboard from './components/EnhancedDashboard';
import CaseManagement from './components/CaseManagement';
import ClientManagement from './components/ClientManagement';
import AppointmentManagement from './components/AppointmentManagement';
import EnhancedAppointmentManagement from './components/EnhancedAppointmentManagement';
import FinancialManagement from './components/FinancialManagement';
import Settings from './components/Settings';
import Profile from './components/Profile';
import HeaderVoiceControl from './components/HeaderVoiceControl';
import { COMMIT_SHA, BUILD_TIME } from './lib/version';
import Header from './components/layout/Header';

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
  const backendUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const [backendStatus, setBackendStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');
  const [backendInfo, setBackendInfo] = useState<{ service?: string; version?: string; tools_count?: number; endpoint?: string } | null>(null);
  const [triedEndpoints, setTriedEndpoints] = useState<string[]>([]);

  const ENV_BACKEND = (import.meta as any).env?.VITE_BACKEND_URL as string | undefined;
  const normalizedEnv = (ENV_BACKEND || '').replace(/\/$/, '');

  const fetchWithTimeout = async (input: RequestInfo | URL, init: RequestInit & { timeoutMs?: number } = {}) => {
    const { timeoutMs = 6000, ...rest } = init;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(input, { ...rest, signal: controller.signal });
    } finally {
      clearTimeout(id);
    }
  };

  const checkBackend = async () => {
    setBackendStatus('checking');
    setBackendInfo(null);
    const candidates: string[] = [];
    if (normalizedEnv) {
      candidates.push(`${normalizedEnv}/health`);
      candidates.push(`${normalizedEnv}/health/production`);
    }
    candidates.push('/api/health');
    candidates.push('/api/health/production');
    candidates.push('/health');
    candidates.push('/health/production');

    // Store the full list for diagnostics in UI
    setTriedEndpoints(candidates);

    for (const endpoint of candidates) {
      try {
        const res = await fetchWithTimeout(endpoint, {
          headers: { 'Accept': 'application/json, text/plain' },
          credentials: 'same-origin',
          timeoutMs: 6000
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          setBackendInfo({ ...data, endpoint });
        } else {
          const text = await res.text();
          if (text.trim().toLowerCase() === 'ok') {
            setBackendInfo({ service: 'nginx', version: undefined, tools_count: undefined, endpoint });
          } else {
            setBackendInfo({ service: undefined, version: undefined, tools_count: undefined, endpoint });
          }
        }
        setBackendStatus('ok');
        return;
      } catch (e) {
        // try next
      }
    }
    setBackendInfo(null);
    setBackendStatus('error');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: BarChart3, color: 'text-blue-600' },
  { id: 'ai-chat', label: 'Hukuk Asistanı', icon: Bot, color: 'text-purple-600', badge: 'BETA' },
  { id: 'search', label: 'İçtihat & Mevzuat', icon: Search, color: 'text-green-600', badge: 'AI' },
    { id: 'petition-writer', label: 'Dilekçe Yazım', icon: FileText, color: 'text-orange-600', badge: 'AI' },
    { id: 'contract-generator', label: 'Sözleşme Oluştur', icon: Building, color: 'text-indigo-600', badge: 'YENİ' },
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
        return <EnhancedDashboard onNavigate={setActiveTab} />;
      
      case 'ai-chat':
        return <LegalAssistantChat />;
      
      case 'search':
        return <AdvancedSearch />;
      case 'petition-writer':
        return <PetitionWriter />;
      case 'contract-generator':
        return <ContractGenerator />;
      case 'file-converter':
        return <FileConverter />;
      case 'notebook-llm':
        return <NotebookLLM />;
      case 'cases':
        return <CaseManagement />;
      case 'clients':
        return <ClientManagement />;
      case 'appointments':
        return <EnhancedAppointmentManagement onNavigate={setActiveTab} />;
      case 'financials':
        return <FinancialManagement />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      default:
        return <EnhancedDashboard onNavigate={setActiveTab} />;
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
  }, []);

  // Voice commands handler (enhanced with all navigation options)
  React.useEffect(() => {
    const onVoice = (e: Event) => {
      const detail = (e as CustomEvent).detail as { intent?: { category?: string; action?: string; parameters?: any } };
      const intent = detail?.intent;
      if (!intent) return;
      
      switch (intent.action) {
        case 'DARK_MODE':
          if (!darkMode) {
            setDarkMode(true);
            localStorage.setItem('darkMode', 'true');
          }
          break;
        case 'LIGHT_MODE':
          if (darkMode) {
            setDarkMode(false);
            localStorage.setItem('darkMode', 'false');
          }
          break;
        case 'NAV_DASHBOARD':
          setActiveTab('dashboard');
          break;
        case 'NAV_CASES':
          setActiveTab('cases');
          break;
        case 'NAV_CLIENTS':
          setActiveTab('clients');
          break;
        case 'NAV_APPOINTMENTS':
          setActiveTab('appointments');
          break;
        case 'NAV_SETTINGS':
          setActiveTab('settings');
          // If a specific tab is requested (from analyzeIntent), notify Settings component
          try {
            const tab = (intent as any)?.parameters?.tab;
            if (tab) {
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('settings-tab-change', { detail: { tab } }));
              }, 100);
            }
          } catch {}
          break;
        case 'NAV_AI_ASSISTANT':
          setActiveTab('ai-chat');
          break;
        case 'NAV_SEARCH':
          setActiveTab('search');
          break;
        case 'NAV_PETITION_WRITER':
          setActiveTab('petition-writer');
          break;
        case 'NAV_CONTRACT_GENERATOR':
          setActiveTab('contract-generator');
          break;
        case 'NAV_FILE_CONVERTER':
          setActiveTab('file-converter');
          break;
        case 'NAV_FINANCIALS':
          setActiveTab('financials');
          break;
        case 'NAV_PROFILE':
          setActiveTab('profile');
          break;
        case 'NAV_NOTEBOOK_LLM':
          setActiveTab('notebook-llm');
          break;
        // Deep page actions: Appointments
        case 'APPOINTMENTS_VIEW':
        case 'APPOINTMENTS_NEW':
        case 'APPOINTMENTS_FILTER_STATUS':
        case 'APPOINTMENTS_FILTER_TYPE':
        case 'APPOINTMENTS_FILTER_PRIORITY':
        case 'APPOINTMENTS_FILTER_DATE_RANGE':
        case 'APPOINTMENTS_CLEAR_FILTERS':
        case 'APPOINTMENTS_SEARCH':
        case 'APPOINTMENTS_CAL_NAV':
        case 'APPOINTMENTS_PAGE_NEXT':
        case 'APPOINTMENTS_PAGE_PREV':
        case 'APPOINTMENTS_OPEN_INDEX':
        case 'APPOINTMENTS_EDIT_INDEX':
        case 'APPOINTMENTS_DELETE_INDEX':
          setActiveTab('appointments');
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('appointments-action', { detail: { intent } }));
          }, 50);
          break;
        // Advanced Search actions
        case 'SEARCH_SET_MODE':
        case 'SEARCH_SET_COURT':
        case 'SEARCH_SET_LEGAL_AREA':
        case 'SEARCH_SET_DATE_RANGE':
        case 'SEARCH_TOGGLE_FILTERS':
        case 'SEARCH_SORT':
        case 'SEARCH_RUN':
        case 'SEARCH_PAGE_NEXT':
        case 'SEARCH_PAGE_PREV':
        case 'SEARCH_OPEN_INDEX':
          setActiveTab('search');
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('advanced-search-action', { detail: { intent } }));
          }, 50);
          break;
        // Financials actions
        case 'FINANCIALS_TAB':
        case 'FINANCIALS_FILTER':
        case 'FINANCIALS_EXPORT':
        case 'FINANCIALS_TIME_RANGE':
          setActiveTab('financials');
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('financials-action', { detail: { intent } }));
          }, 50);
          break;
        // Clients actions
        case 'CLIENTS_NEW':
        case 'CLIENTS_SEARCH':
        case 'CLIENTS_FILTER_COMPANY':
        case 'CLIENTS_SORT':
        case 'CLIENTS_CLEAR_FILTERS':
        case 'CLIENTS_PAGE_NEXT':
        case 'CLIENTS_PAGE_PREV':
        case 'CLIENTS_OPEN_INDEX':
          setActiveTab('clients');
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('clients-action', { detail: { intent } }));
          }, 50);
          break;
        // Cases actions
        case 'CASES_NEW':
        case 'CASES_SEARCH':
        case 'CASES_FILTER_STATUS':
        case 'CASES_FILTER_TYPE':
        case 'CASES_FILTER_PRIORITY':
        case 'CASES_SORT':
        case 'CASES_CLEAR_FILTERS':
        case 'CASES_PAGE_NEXT':
        case 'CASES_PAGE_PREV':
        case 'CASES_OPEN_INDEX':
          setActiveTab('cases');
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('cases-action', { detail: { intent } }));
          }, 50);
          break;
        case 'SETTINGS_TAB':
          setActiveTab('settings');
          // Ayarlar alt menüsü için özel işlem
          if (intent.parameters && intent.parameters[0]) {
            const settingsTab = intent.parameters[0];
            // Ayarlar sayfasında alt menüyü açmak için event gönder
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('settings-tab-change', { 
                detail: { tab: settingsTab } 
              }));
            }, 100);
          }
          break;
        case 'SEARCH':
          setActiveTab('search');
          // Ensure AdvancedSearch mounts, then re-dispatch for it to pick up the query
          const intentCopy = intent;
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('voice-command', { detail: { intent: intentCopy } }));
          }, 0);
          break;
        case 'DICTATE_START': {
          // Dikte başlatma - hedefe göre yönlendir
          const target = (intent as any)?.parameters?.target as string | undefined;
          if (target === 'whatsapp_input') {
            // WhatsApp mesaj alanına odaklan ve dikteyi başlat
            if (activeTab !== 'whatsapp') setActiveTab('whatsapp');
            setTimeout(() => {
              try { window.dispatchEvent(new CustomEvent('focus-whatsapp-input')); } catch {}
              try { window.dispatchEvent(new CustomEvent('dictate-start', { detail: { target: 'whatsapp_input' } })); } catch {}
            }, 120);
          } else {
            window.dispatchEvent(new CustomEvent('dictate-start'));
          }
          break;
        }
        case 'DICTATE_STOP':
          // Dikte durdurma - tüm bileşenlerde dikte durdurulur
          window.dispatchEvent(new CustomEvent('dictate-stop'));
          break;
        case 'DICTATE_SAVE':
          // Dikte kaydetme - aktif bileşende dikte kaydedilir
          window.dispatchEvent(new CustomEvent('dictate-save'));
          break;
        case 'DICTATE_CLEAR':
          // Dikte temizleme - aktif bileşende dikte temizlenir
          window.dispatchEvent(new CustomEvent('dictate-clear'));
          break;
        case 'VOICE_START':
          // Ses tanıma başlatma
          console.log('Ses tanıma başlatıldı');
          break;
        case 'VOICE_STOP':
          // Ses tanıma durdurma
          console.log('Ses tanıma durduruldu');
          break;
        default:
          console.log('Bilinmeyen ses komutu:', intent.action);
          break;
      }
    };
    window.addEventListener('voice-command', onVoice as any);
    return () => window.removeEventListener('voice-command', onVoice as any);
  }, [darkMode]);

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
  <div className={`${sidebarOpen ? 'w-[16.5rem]' : 'w-16'} bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl border-r border-white/20 dark:border-gray-700/50 transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-white/20 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600/90 to-purple-600/90 rounded-lg shadow-lg backdrop-blur-sm">
              <Scale className="w-7 h-7 text-white" />
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
                title={item.label}
                className={`w-full flex items-center justify-start gap-2 px-2 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50/70 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-lg backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:backdrop-blur-sm'
                }`}
              >
                <IconComponent className={`shrink-0 w-6 h-6 ${isActive ? item.color : ''}`} />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 min-w-0 truncate font-medium text-[13px] leading-5 text-left">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto px-2 py-0.5 text-xs font-medium rounded-full ${
                        item.badge === 'YENİ' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                        item.badge === 'AI' ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100' :
                        item.badge === '7/24' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
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
              <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500">
                Build: {COMMIT_SHA.slice(0,7)}{BUILD_TIME ? ` · ${BUILD_TIME}` : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - unified header */}
        <Header
          title={menuItems.find(item => item.id === activeTab)?.label || 'Ana Sayfa'}
          subtitle={
            activeTab === 'dashboard' ? 'Hukuki süreçlerinizi yönetin ve takip edin' :
            activeTab === 'search' ? 'Milyonlarca karar arasından arama yapın' :
            activeTab === 'petition-writer' ? 'AI ile profesyonel dilekçeler oluşturun' :
            activeTab === 'contract-generator' ? 'Hukuki sözleşmelerinizi hazırlayın' :
            activeTab === 'whatsapp' ? '7/24 WhatsApp üzerinden hukuki destek' :
            activeTab === 'cases' ? 'Davalarınızı organize edin ve takip edin' :
            activeTab === 'clients' ? 'Müvekkillerinizi yönetin' :
            activeTab === 'appointments' ? 'Randevularınızı planlayın' :
            activeTab === 'financials' ? 'Mali durumunuzu takip edin' :
            activeTab === 'settings' ? 'Sistem ayarlarınızı yapılandırın' :
            activeTab === 'profile' ? 'Profil bilgilerinizi yönetin' : undefined
          }
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          showBackButton={activeTab !== 'dashboard'}
          onBack={() => setActiveTab('dashboard')}
          right={
            <>
              <HeaderVoiceControl />
              <button 
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 backdrop-blur-sm shadow-sm"
                title={darkMode ? 'Gündüz moduna geç' : 'Gece moduna geç'}
                aria-label="Tema değiştir"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button title="Bildirimler" aria-label="Bildirimler" className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 backdrop-blur-sm shadow-sm">
                <Bell className="w-5 h-5" />
              </button>
              <button
                onClick={checkBackend}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200 backdrop-blur-sm shadow-sm"
                title={`Backend: ${backendUrl}`}
                aria-label="Backend sağlığını kontrol et"
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
                aria-label="Ayarlar"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 backdrop-blur-sm shadow-sm"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-3 pl-4 border-l border-white/30 dark:border-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-700/30 rounded-lg p-2 transition-all duration-200"
                aria-label="Profil"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600/90 to-purple-600/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                  <span className="text-white text-sm font-medium">MZA</span>
                </div>
                <div className="hidden md:block text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">Av. Mehmet Zeki Alagöz</p>
                  <p className="text-gray-500 dark:text-gray-400">Premium Üye</p>
                </div>
              </button>
            </>
          }
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/30 dark:from-gray-900/50 dark:to-blue-900/20">
          {/* Backend status banner */}
          {backendStatus === 'error' && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-100 border border-red-200/50 dark:border-red-800/50">
              Backend'e bağlanılamadı. Lütfen backend adresini ve reverse proxy ayarlarını kontrol edin.
              <div className="text-xs mt-1 opacity-80">
                Denenen uç noktalar: {triedEndpoints && triedEndpoints.length > 0 ? triedEndpoints.join(', ') : '—'}
              </div>
            </div>
          )}
          {backendStatus === 'ok' && backendInfo && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-100 border border-green-200/50 dark:border-green-800/50 text-sm">
              <span className="font-medium">Backend Sağlıklı</span> · {backendInfo.service || 'Service'} v{backendInfo.version || ''} · Araçlar: {backendInfo.tools_count ?? '—'} · Endpoint: {backendInfo.endpoint || '—'}
            </div>
          )}
          {renderContent()}
          {/* Floating voice control (hidden to keep UI clean) */}
          {/* <VoiceControl /> */}
        </main>
      </div>
    </div>
  );
}

export default App;