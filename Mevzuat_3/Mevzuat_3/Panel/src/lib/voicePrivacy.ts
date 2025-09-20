// Ses sistemi gizlilik yönetimi

export function hasConsent(): boolean {
  try {
    return localStorage.getItem('voice_consent') === 'true';
  } catch {
    return false;
  }
}

export function setConsent(consent: boolean): void {
  try {
    localStorage.setItem('voice_consent', consent.toString());
  } catch {
    // Ignore
  }
}

export function isRemoteLoggingEnabled(): boolean {
  try {
    return localStorage.getItem('voice_remote_logging') === 'true';
  } catch {
    return false;
  }
}

export function setRemoteLogging(enabled: boolean): void {
  try {
    localStorage.setItem('voice_remote_logging', enabled.toString());
  } catch {
    // Ignore
  }
}

export function getPrivacySettings() {
  return {
    consent: hasConsent(),
    remoteLogging: isRemoteLoggingEnabled(),
  };
}

export function updatePrivacySettings(settings: { consent?: boolean; remoteLogging?: boolean }) {
  if (settings.consent !== undefined) {
    setConsent(settings.consent);
  }
  if (settings.remoteLogging !== undefined) {
    setRemoteLogging(settings.remoteLogging);
  }
}
