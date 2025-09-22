import React from 'react';
import { Menu as MenuIcon, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  center?: React.ReactNode; // e.g., global search
  right?: React.ReactNode;  // actions + user/profile
  showBackButton?: boolean;
  onBack?: () => void;
}

// Unified main header for the panel. Provides consistent spacing, accessibility, and slots.
const Header: React.FC<HeaderProps> = ({ title, subtitle, sidebarOpen = true, onToggleSidebar, center, right, showBackButton = false, onBack }) => {
  return (
    <header className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg border-b border-white/20 dark:border-gray-700/50 px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: menu toggle + page heading */}
        <div className="flex items-center gap-4 min-w-0">
          {showBackButton && (
            <button
              onClick={onBack || (() => window.history.back())}
              title="Geri"
              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-all duration-200 backdrop-blur-sm"
              aria-label="Geri"
            >
              <ArrowLeft className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            </button>
          )}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              title={sidebarOpen ? 'Menüyü daralt' : 'Menüyü genişlet'}
              className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 backdrop-blur-sm md:hidden flex-shrink-0"
              aria-label={sidebarOpen ? 'Menüyü daralt' : 'Menüyü genişlet'}
            >
              <MenuIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">{title}</h2>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Center: optional global search / breadcrumbs */}
        {center && (
          <div className="flex-1 hidden md:flex items-center justify-center min-w-[200px] max-w-2xl">
            {center}
          </div>
        )}

        {/* Right: actions (mic, theme, notifications, backend, settings, user) */}
        <div className="flex items-center gap-3 ml-auto">
          {right}
        </div>
      </div>
    </header>
  );
};

export default Header;
