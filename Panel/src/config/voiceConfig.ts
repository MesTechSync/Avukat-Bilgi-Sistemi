export const VOICE_CONFIG = {
  // Dil ayarları
  languages: {
    primary: 'tr-TR',
    fallback: 'en-US',
    supported: ['tr-TR', 'en-US', 'de-DE', 'fr-FR'],
  },

  // Performans ayarları
  performance: {
    maxConcurrentCommands: 3,
    commandTimeout: 5000,
    debounceDelay: 300,
    cacheSize: 100,
  },

  // Güvenlik ayarları
  security: {
    requireConfirmation: ['DELETE', 'LOGOUT', 'BACKUP'],
    sensitiveActions: ['PAYMENT', 'INVOICE', 'CONTRACT'],
    maxAttempts: 3,
    sessionTimeout: 30 * 60 * 1000, // 30 dakika
  },

  // Ses kalitesi
  audio: {
    noiseSupression: true,
    echoCancellation: true,
    autoGainControl: true,
    sampleRate: 16000,
  },

  // Özelleştirme
  customization: {
    shortcuts: true,
    macros: true,
    customCommands: true,
    voiceProfiles: true,
  },
};
