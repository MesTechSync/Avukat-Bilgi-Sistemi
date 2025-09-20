import React, { useState } from 'react';
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  Search, 
  MessageSquare, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Scale,
  Brain,
  BookOpen,
  FileSearch,
  PenTool,
  NotebookPen,
  Calculator,
  Gavel,
  ArrowLeft,
  Menu
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, collapsed, onToggleCollapse }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: Home, description: 'Genel bakış ve istatistikler' },
    { id: 'ai-chat', label: 'SonKarar AI Chat', icon: MessageSquare, badge: 'BETA', description: 'AI hukuki asistan' },
    { id: 'advanced-search', label: 'İçtihat Arama', icon: Search, badge: 'AI', description: 'İçtihat ve mevzuat arama' },
    { id: 'petition-writer', label: 'Dilekçe Yazım', icon: PenTool, badge: 'AI', description: 'Otomatik dilekçe oluşturma' },
    { id: 'contract-generator', label: 'Sözleşme Oluştur', icon: FileText, badge: 'YENİ', description: 'Profesyonel sözleşmeler' },
    { id: 'notebook-llm', label: 'Notebook LLM', icon: NotebookPen, badge: 'BETA', description: 'AI not defteri' },
    { id: 'file-converter', label: 'Dosya Dönüştürücü', icon: FileSearch, badge: 'YENİ', description: 'Belge format dönüştürme' },
    { id: 'case-management', label: 'Dava Yönetimi', icon: Gavel, description: 'Dava takip ve yönetimi' },
    { id: 'client-management', label: 'Müvekkil Yönetimi', icon: Users, description: 'Müvekkil bilgileri ve iletişim' },
    { id: 'appointment-management', label: 'Randevu Yönetimi', icon: Calendar, description: 'Randevu planlama ve takip' },
    { id: 'financial-management', label: 'Mali İşler', icon: Calculator, description: 'Finansal takip ve raporlama' },
  ];

  const getItemClasses = (itemId: string) => {
    const baseClasses = "flex items-center w-full p-4 rounded-xl transition-all duration-200 group relative mb-1";
    const activeClasses = "bg-blue-600 text-white shadow-lg transform scale-105";
    const inactiveClasses = "text-gray-300 hover:bg-gray-700/60 hover:text-white hover:transform hover:scale-105";
    
    return `${baseClasses} ${activeSection === itemId ? activeClasses : inactiveClasses}`;
  };

  const getBadgeClasses = (badgeType: string) => {
    switch (badgeType) {
      case 'AI':
        return 'bg-blue-500 text-white';
      case 'YENİ':
        return 'bg-green-500 text-white';
      case 'BETA':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className={`${collapsed ? 'w-16' : 'w-72'} bg-gradient-to-b from-gray-800 to-gray-900 h-screen flex flex-col transition-all duration-300 ease-in-out border-r border-gray-700/50 shadow-xl`}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/30">
        {/* Back button and Menu toggle */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => onSectionChange('dashboard')}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
            title="Ana Sayfaya Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
            title={collapsed ? "Menüyü Genişlet" : "Menüyü Daralt"}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">Karar</h1>
                <p className="text-gray-400 text-sm">AI Hukuki Platform</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
              <Scale className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-6 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => onSectionChange(item.id)}
                className={getItemClasses(item.id)}
                title={collapsed ? item.label : undefined}
              >
                <IconComponent className={`${collapsed ? 'w-6 h-6 mx-auto' : 'w-5 h-5 mr-3'} flex-shrink-0`} />
                
                {!collapsed && (
                  <>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeClasses(item.badge)}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs opacity-75 mt-1">{item.description}</p>
                      )}
                    </div>
                  </>
                )}
              </button>
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                  {item.label}
                  {item.badge && (
                    <span className={`ml-2 px-1 py-0.5 text-xs rounded ${getBadgeClasses(item.badge)}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="space-y-2">
          <button
            onClick={() => onSectionChange('settings')}
            className={`${getItemClasses('settings')} ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Ayarlar' : undefined}
          >
            <Settings className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'} flex-shrink-0`} />
            {!collapsed && <span className="font-medium">Ayarlar</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;