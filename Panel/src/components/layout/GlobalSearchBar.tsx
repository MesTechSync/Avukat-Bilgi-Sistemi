import React from 'react';
import { Search } from 'lucide-react';

interface GlobalSearchBarProps {
  onSearch: (query: string) => void;
}

const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({ onSearch }) => {
  const [q, setQ] = React.useState('');

  const submit: React.FormEventHandler = (e) => {
    e.preventDefault();
    const query = q.trim();
    if (query) onSearch(query);
  };

  return (
    <form onSubmit={submit} className="w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Hızlı arama: karar, mevzuat, konu..."
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/70 dark:bg-gray-700/70 border border-gray-200/60 dark:border-gray-600/60 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Genel arama"
        />
      </div>
    </form>
  );
};

export default GlobalSearchBar;
