import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface DictationButtonProps {
  isListening: boolean;
  isSupported: boolean;
  onStart: () => void;
  onStop: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
}

export const DictationButton: React.FC<DictationButtonProps> = ({
  isListening,
  isSupported,
  onStart,
  onStop,
  size = 'md',
  className = '',
  title
}) => {
  if (!isSupported) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const handleClick = () => {
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <button
      onClick={handleClick}
      title={title || (isListening ? 'Dikteyi durdur' : 'Dikteyi başlat')}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-full
        transition-all duration-200
        ${isListening 
          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
          : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105'
        }
        shadow-md hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-blue-300
        ${className}
      `}
      disabled={!isSupported}
    >
      {isListening ? (
        <MicOff className={iconSizes[size]} />
      ) : (
        <Mic className={iconSizes[size]} />
      )}
    </button>
  );
};

export default DictationButton;
