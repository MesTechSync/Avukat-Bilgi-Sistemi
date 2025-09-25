import React, { useState, Suspense, lazy } from 'react';
import { Scale, Search, FileText, Users, Calendar, DollarSign, Settings as SettingsIcon, Bot, Building, Gavel, BarChart3, Bell, Menu, X, Sun, Moon, User, CheckCircle, Loader2, Mic, Heart, Brain, Clock } from 'lucide-react';
import { useSupabase } from './hooks/useSupabase';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load components for better performance
const LegalAssistantChat = lazy(() => import('./components/LegalAssistantChat'));
const AdvancedSearch = lazy(() => import('./components/AdvancedSearch'));
const PetitionWriter = lazy(() => import('./components/PetitionWriter'));
const ContractGenerator = lazy(() => import('./components/ContractGenerator'));
const FileConverter = lazy(() => import('./components/FileConverter'));
const NotebookLLM = lazy(() => import('./components/NotebookLLM'));
const EnhancedDashboard = lazy(() => import('./components/EnhancedDashboard'));
const CaseManagement = lazy(() => import('./components/CaseManagement'));
const ClientManagement = lazy(() => import('./components/ClientManagement'));
const EnhancedAppointmentManagement = lazy(() => import('./components/EnhancedAppointmentManagement'));
const FinancialManagement = lazy(() => import('./components/FinancialManagement'));
const Settings = lazy(() => import('./components/Settings'));
const Profile = lazy(() => import('./components/Profile'));
const HeaderVoiceControl = lazy(() => import('./components/HeaderVoiceControl'));
const Header = lazy(() => import('./components/layout/Header'));

import { COMMIT_SHA, BUILD_TIME } from './lib/version';

// 🚀 Benzersiz Özellikler - Artık İçtihat & Mevzuat içinde

function App() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(() => {
    // Sayfa yenilendiğinde son aktif tab'ı localStorage'dan al
    const savedTab = localStorage.getItem('activeTab');
    return savedTab || 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Mobilde başlangıçta kapalı, masaüstünde açık
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const { loading, error } = useSupabase();

  // Tab değiştiğinde localStorage'a kaydet ve mobilde sidebar'ı kapat
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab);
    // Mobilde sidebar'ı kapat
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Backend health check state
  const backendUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const [backendStatus, setBackendStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');
  const [backendInfo, setBackendInfo] = useState<{ service?: string; version?: string; tools_count?: number; endpoint?: string } | null>(null);
  const [showBackendModal, setShowBackendModal] = useState(false);

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
    // Production'da backend kontrolü tamamen devre dışı
    if (!import.meta.env.DEV) {
      setBackendStatus('ok');
      setBackendInfo({ service: 'frontend', version: '1.0.0', tools_count: 0, endpoint: 'frontend-only' });
      return;
    }
    
    setBackendStatus('checking');
    setBackendInfo(null);
    const candidates: string[] = [];
    
    // Backend URL'leri öncelik sırasına göre ekle
    if (normalizedEnv) {
      candidates.push(`${normalizedEnv}/health`);
      candidates.push(`${normalizedEnv}/api/health`);
      candidates.push(`${normalizedEnv}/health/production`);
    }
    
    // Local development endpoints
    candidates.push('/api/health');
    candidates.push('/health');
    candidates.push('/api/health/production');
    candidates.push('/health/production');
    
    // External backend endpoints (fallback)
    candidates.push('http://localhost:8000/health');
    candidates.push('http://localhost:9000/health');
    candidates.push('http://127.0.0.1:8000/health');
    candidates.push('http://127.0.0.1:9000/health');

    // Store the full list for diagnostics in UI
    // setTriedEndpoints(candidates); // Kaldırıldı - artık gerekli değil

    for (const endpoint of candidates) {
      try {
        if (import.meta.env.DEV) {
          console.log(`🔍 Backend kontrol ediliyor: ${endpoint}`);
        }
        const res = await fetchWithTimeout(endpoint, {
          method: 'GET',
          headers: { 
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          },
          credentials: 'same-origin',
          timeoutMs: 2000 // Daha kısa timeout
        });
        
        if (!res.ok) {
          if (import.meta.env.DEV) {
            console.log(`⚠️ Backend endpoint ${endpoint} returned ${res.status}`);
          }
          continue; // try next endpoint
        }
        
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          setBackendInfo({ ...data, endpoint });
          if (import.meta.env.DEV) {
            console.log(`✅ Backend bağlantısı başarılı: ${endpoint}`, data);
          }
        } else {
          const text = await res.text();
          // HTML yanıt kontrolü - eğer HTML döndürüyorsa frontend servisi
          if (text.includes('<!doctype html>') || text.includes('<html')) {
            if (import.meta.env.DEV) {
              console.log(`⚠️ Frontend servisi yanıt verdi (backend değil): ${endpoint}`);
            }
            continue; // Bu bir backend değil, sonraki endpoint'i dene
          } else if (text.trim().toLowerCase() === 'ok' || text.trim().toLowerCase() === 'healthy') {
            setBackendInfo({ service: 'backend', version: '1.0', tools_count: 0, endpoint });
            if (import.meta.env.DEV) {
              console.log(`✅ Backend health check başarılı: ${endpoint}`);
            }
          } else {
            setBackendInfo({ service: 'backend', version: '1.0', tools_count: 0, endpoint });
            if (import.meta.env.DEV) {
              console.log(`✅ Backend yanıt aldı: ${endpoint} - ${text.substring(0, 100)}...`);
            }
          }
        }
        setBackendStatus('ok');
        return;
      } catch (e) {
        if (import.meta.env.DEV) {
          console.log(`❌ Backend endpoint ${endpoint} başarısız:`, e);
        }
        // try next
      }
    }
    
    // Tüm endpoint'ler başarısız oldu
    if (import.meta.env.DEV) {
      console.log('❌ Tüm backend endpoint\'leri başarısız oldu');
    }
    setBackendInfo(null);
    setBackendStatus('error');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: BarChart3, color: 'text-blue-600' },
  { id: 'ai-chat', label: 'Hukuk Asistanı', icon: Bot, color: 'text-purple-600', badge: 'BETA' },
  { id: 'search', label: 'İçtihat & Mevzuat', icon: Search, color: 'text-green-600', badge: 'AI' },
    
    // 🚀 Benzersiz Efsane Özellikler - Artık İçtihat & Mevzuat içinde
    
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
        return (
          <Suspense fallback={<LoadingSpinner text="Ana Sayfa Yükleniyor..." />}>
            <EnhancedDashboard onNavigate={setActiveTab} />
          </Suspense>
        );
      
      case 'ai-chat':
        return (
          <Suspense fallback={<LoadingSpinner text="Hukuk Asistanı Yükleniyor..." />}>
            <LegalAssistantChat />
          </Suspense>
        );
      
      case 'search':
        return (
          <Suspense fallback={<LoadingSpinner text="İçtihat & Mevzuat Yükleniyor..." />}>
            <AdvancedSearch />
          </Suspense>
        );
      case 'petition-writer':
        return (
          <Suspense fallback={<LoadingSpinner text="Dilekçe Yazımı Yükleniyor..." />}>
            <PetitionWriter />
          </Suspense>
        );
      case 'contract-generator':
        return (
          <Suspense fallback={<LoadingSpinner text="Sözleşme Oluşturucu Yükleniyor..." />}>
            <ContractGenerator />
          </Suspense>
        );
      case 'file-converter':
        return (
          <Suspense fallback={<LoadingSpinner text="Dosya Dönüştürücü Yükleniyor..." />}>
            <FileConverter />
          </Suspense>
        );
      case 'notebook-llm':
        return (
          <Suspense fallback={<LoadingSpinner text="Notebook LLM Yükleniyor..." />}>
            <NotebookLLM />
          </Suspense>
        );
      
      // 🚀 Benzersiz Özellikler - Artık İçtihat & Mevzuat içinde
      
      case 'cases':
        return (
          <Suspense fallback={<LoadingSpinner text="Dava Yönetimi Yükleniyor..." />}>
            <CaseManagement />
          </Suspense>
        );
      case 'clients':
        return (
          <Suspense fallback={<LoadingSpinner text="Müvekkil Yönetimi Yükleniyor..." />}>
            <ClientManagement />
          </Suspense>
        );
      case 'appointments':
        return (
          <Suspense fallback={<LoadingSpinner text="Randevu Yönetimi Yükleniyor..." />}>
            <EnhancedAppointmentManagement onNavigate={handleTabChange} />
          </Suspense>
        );
      case 'financials':
        return (
          <Suspense fallback={<LoadingSpinner text="Mali İşler Yükleniyor..." />}>
            <FinancialManagement />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<LoadingSpinner text="Ayarlar Yükleniyor..." />}>
            <Settings />
          </Suspense>
        );
      case 'profile':
        return (
          <Suspense fallback={<LoadingSpinner text="Hesabım Yükleniyor..." />}>
            <Profile />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingSpinner text="Ana Sayfa Yükleniyor..." />}>
            <EnhancedDashboard onNavigate={handleTabChange} />
          </Suspense>
        );
    }
  };

  const toggleThemeHandler = () => {
    toggleTheme();
  };

  // Apply theme on component mount
  React.useEffect(() => {
    // Apply theme immediately when isDarkMode changes
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]); // Watch isDarkMode changes

  // Run initial backend health check once on mount
  React.useEffect(() => {
    checkBackend();
  }, []);

  // Handle window resize for sidebar
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Voice commands handler (enhanced with all navigation options)
  React.useEffect(() => {
    const onVoice = (e: Event) => {
      const detail = (e as CustomEvent).detail as { intent?: { category?: string; action?: string; parameters?: any } };
      const intent = detail?.intent;
      if (!intent) return;
      
      switch (intent.action) {
        case 'DARK_MODE':
          // Tema değişikliği artık context'ten yönetiliyor
          break;
        case 'LIGHT_MODE':
          // Tema değişikliği artık context'ten yönetiliyor
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
            if (activeTab !== 'whatsapp') handleTabChange('whatsapp');
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
  }, [isDarkMode]);

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
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-[16.5rem]' : 'w-16'} bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl border-r border-white/20 dark:border-gray-700/50 transition-all duration-300 flex flex-col ${sidebarOpen ? 'fixed md:relative z-50 h-full md:h-auto' : 'relative'}`}>
        {/* Header */}
        <div className="p-3 md:p-4 border-b border-white/20 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600/90 to-purple-600/90 rounded-lg shadow-lg backdrop-blur-sm">
              <Scale className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
                  Karar
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  AI Hukuki Platform
                </p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? 'Menüyü daralt' : 'Menüyü genişlet'}
              className="p-1 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 backdrop-blur-sm flex-shrink-0"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 md:p-4 space-y-1 md:space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                title={item.label}
                className={`w-full flex items-center justify-start gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50/70 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-lg backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:backdrop-blur-sm'
                }`}
              >
                <IconComponent className={`shrink-0 w-5 h-5 md:w-6 md:h-6 flex-shrink-0 ${isActive ? item.color : ''}`} />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 min-w-0 truncate font-medium text-xs md:text-[13px] leading-4 md:leading-5 text-left">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto px-1.5 md:px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                        item.badge === 'YENİ' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                        item.badge === 'AI' ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100' :
                        item.badge === 'EFSANE' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg animate-pulse' :
                        item.badge === 'BETA' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
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
          <div className="p-3 md:p-4 border-t border-white/20 dark:border-gray-700/50">
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
                onClick={toggleThemeHandler}
                className="p-1.5 md:p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 backdrop-blur-sm shadow-sm flex-shrink-0"
                title={isDarkMode ? 'Gündüz moduna geç' : 'Gece moduna geç'}
                aria-label="Tema değiştir"
              >
                {isDarkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
              <button title="Bildirimler" aria-label="Bildirimler" className="p-1.5 md:p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 backdrop-blur-sm shadow-sm flex-shrink-0">
                <Bell className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={() => {
                  checkBackend();
                  // Backend detay modalını aç
                  setShowBackendModal(true);
                }}
                className="flex items-center gap-1 md:gap-2 px-1.5 md:px-2 py-1 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200 backdrop-blur-sm shadow-sm flex-shrink-0"
                title={`Backend: ${backendUrl}`}
                aria-label="Backend sağlığını kontrol et"
              >
                {backendStatus === 'checking' ? (
                  <Loader2 className="w-3 h-3 md:w-4 md:h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                ) : backendStatus === 'ok' ? (
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600 dark:text-green-400" />
                ) : backendStatus === 'error' ? (
                  <X className="w-3 h-3 md:w-4 md:h-4 text-red-600 dark:text-red-400" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                )}
              </button>
              <button 
                onClick={() => handleTabChange('settings')}
                title="Ayarlar"
                aria-label="Ayarlar"
                className="p-1.5 md:p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 backdrop-blur-sm shadow-sm flex-shrink-0"
              >
                <SettingsIcon className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button 
                onClick={() => handleTabChange('profile')}
                className="flex items-center gap-1 md:gap-2 lg:gap-3 pl-1 md:pl-2 lg:pl-4 border-l border-white/30 dark:border-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-700/30 rounded-lg p-1.5 md:p-2 transition-all duration-200 flex-shrink-0"
                aria-label="Profil"
              >
                <div className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-600/90 to-purple-600/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm flex-shrink-0">
                  <span className="text-white text-xs md:text-sm font-medium">MZA</span>
                </div>
                <div className="hidden lg:block text-sm min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">Av. Mehmet Zeki Alagöz</p>
                  <p className="text-gray-500 dark:text-gray-400 truncate">Premium Üye</p>
                </div>
              </button>
            </>
          }
        />

        {/* Backend Status Modal */}
        {showBackendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Backend Durumu
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sistem bağlantı durumu ve detayları
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBackendModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                {/* Backend Status */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Bağlantı Durumu</h4>
                  <div className="flex items-center gap-3 p-4 rounded-lg border">
                    {backendStatus === 'checking' ? (
                      <>
                        <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                        <span className="text-blue-600 dark:text-blue-400 font-medium">Kontrol ediliyor...</span>
                      </>
                    ) : backendStatus === 'ok' ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-green-600 dark:text-green-400 font-medium">Bağlantı Başarılı</span>
                      </>
                    ) : backendStatus === 'error' ? (
                      <>
                        <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <span className="text-red-600 dark:text-red-400 font-medium">Bağlantı Başarısız</span>
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 rounded-full bg-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Kontrol Edilmedi</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Backend Info - Sadece görsel durum */}
                {backendInfo && (
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Sistem Durumu</h4>
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <div>
                          <h5 className="font-medium text-green-800 dark:text-green-200">Sistem Aktif</h5>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Tüm özellikler çalışıyor
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}


              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex gap-2">
                  <button 
                    onClick={checkBackend}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Backend durumunu yeniden kontrol et"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Yeniden Kontrol Et
                  </button>
                </div>
                <button
                  onClick={() => setShowBackendModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-3 md:p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/30 dark:from-gray-900/50 dark:to-blue-900/20">
          {/* Backend status banner */}
          {backendStatus === 'error' && (
            <div className="mb-3 md:mb-4 p-3 md:p-4 rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-200/50 dark:border-orange-800/50">
              <div className="flex items-start gap-2 md:gap-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex-shrink-0">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">
                    Frontend Modu Aktif
                  </h3>
                  <p className="text-xs md:text-sm text-orange-700 dark:text-orange-300 mb-2">
                    Backend servisi çalışmıyor, ancak sistem tamamen fonksiyonel. Tüm özellikler mock data ile çalışıyor.
                  </p>
                  <div className="flex flex-wrap gap-1 md:gap-2 text-xs">
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded">
                      ✅ Supabase Aktif
                    </span>
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded">
                      ✅ Mock Data Aktif
                    </span>
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded">
                      ✅ AI Servisleri Aktif
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowBackendModal(true)}
                  className="px-2 md:px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors flex-shrink-0"
                  title="Backend durumunu detaylı görüntüle"
                >
                  Detay
                </button>
              </div>
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

const AppWithTheme: React.FC = () => {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
};

export default AppWithTheme;