export const voiceConfig = {
  recognition: {
    language: 'tr-TR',
    continuous: true,
    interimResults: true,
    maxAlternatives: 3,
  },
  commands: {
    prefixes: ['hey avukat', 'asistan', 'yardım'],
    timeout: 5000,
    confirmationRequired: ['sil', 'kaldır', 'iptal'],
  },
};
