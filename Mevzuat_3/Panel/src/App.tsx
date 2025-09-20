import React, { useState } from 'react';
import { Sun, Moon, User } from 'lucide-react';
import { useSupabase } from './hooks/useSupabase';

// Import all components
import Sidebar from './components/Sidebar';
import LegalAssistantChat from './components/LegalAssistantChat';
import AdvancedSearch from './components/AdvancedSearch';
import PetitionWriter from './components/PetitionWriter';
import ContractGenerator from './components/ContractGenerator';
import FileConverter from './components/FileConverter';
import CaseManagement from './components/CaseManagement';
import ClientManagement from './components/ClientManagement';
import AppointmentManagement from './components/AppointmentManagement';
import FinancialManagement from './components/FinancialManagement';
import Dashboard from './components/Dashboard';
import NotebookLLM from './components/NotebookLLM';
import AIChat from './components/AIChat';
import AITraining from './components/AITraining';
import AILegalAssistant from './components/AILegalAssistant';
import { VoiceCommandPanel } from './components/VoiceCommandPanel';
import Settings from './components/Settings';
import Profile from './components/Profile';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user } = useSupabase();

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveSection} />;
      case 'ai-chat':
        return <LegalAssistantChat onNavigate={setActiveSection} />;
      case 'advanced-search':
        return <AdvancedSearch />;
      case 'petition-writer':
        return <PetitionWriter />;
      case 'contract-generator':
        return <ContractGenerator />;
      case 'file-converter':
        return <FileConverter />;
      case 'case-management':
      case 'cases':
        return <CaseManagement onNavigate={setActiveSection} />;
      case 'client-management':
      case 'clients':
        return <ClientManagement onNavigate={setActiveSection} />;
      case 'appointment-management':
      case 'appointments':
        return <AppointmentManagement onNavigate={setActiveSection} />;
      case 'financial-management':
      case 'financial':
        return <FinancialManagement onNavigate={setActiveSection} />;
      case 'notebook-llm':
        return <NotebookLLM />;
      case 'ai-training':
        return <AITraining />;
      case 'ai-legal-assistant':
        return <AILegalAssistant />;
      case 'voice-commands':
        return <VoiceCommandPanel />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''} h-screen flex bg-gray-50 dark:bg-gray-900`}>
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Hukuk Bürosu Yönetim Sistemi
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            
            {user && (
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user.email}
                </span>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
