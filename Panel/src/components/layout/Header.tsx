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
    <header className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg border-b border-white/20 dark:border-gray-700/50 px-3 md:px-6 py-2 md:py-3">
      <div className="flex items-center justify-between gap-2 md:gap-4">
        {/* Left: menu toggle + page heading */}
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          {showBackButton && (
            <button
              onClick={onBack || (() => window.history.back())}
              title="Geri"
              className="p-1.5 md:p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-all duration-200 backdrop-blur-sm flex-shrink-0"
              aria-label="Geri"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-300" />
            </button>
          )}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              title={sidebarOpen ? 'Menüyü daralt' : 'Menüyü genişlet'}
              className="p-1.5 md:p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 backdrop-blur-sm md:hidden flex-shrink-0"
              aria-label={sidebarOpen ? 'Menüyü daralt' : 'Menüyü genişlet'}
            >
              <MenuIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">{title}</h2>
            {subtitle && (
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Center: optional global search / breadcrumbs */}
        {center && (
          <div className="flex-1 hidden lg:flex items-center justify-center min-w-[200px] max-w-2xl mx-2">
            {center}
          </div>
        )}

        {/* Right: actions (mic, theme, notifications, backend, settings, user) */}
        <div className="flex items-center gap-1 md:gap-2 lg:gap-3 ml-auto flex-shrink-0">
          {right}
        </div>
      </div>
    </header>
  );
};

export default Header;
