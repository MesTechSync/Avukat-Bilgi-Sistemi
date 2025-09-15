import { describe, it, expect, beforeEach } from 'vitest';
import { anonymizeTranscript, setConsent, hasConsent, setRemoteLogging, isRemoteLoggingEnabled, setPIIMasking, isPIIMaskingEnabled } from './voicePrivacy';

describe('voice privacy', () => {
  beforeEach(() => {
    // reset flags
    setConsent(false);
    setRemoteLogging(false);
    setPIIMasking(true);
  });

  it('masks emails, phones, ids, case numbers and names', () => {
    const input = 'Ahmet Yılmaz 2024/12345 555-123-4567 ahmet@example.com TCKN 12345678901';
    const out = anonymizeTranscript(input);
    expect(out).not.toContain('Ahmet');
    expect(out).not.toContain('Yılmaz');
    expect(out).toContain('[case-no]');
    expect(out).toContain('[phone]');
    expect(out).toContain('[email]');
    expect(out).toContain('[id]');
  });

  it('consent and logging flags default to off', () => {
    expect(hasConsent()).toBe(false);
    expect(isRemoteLoggingEnabled()).toBe(false);
    expect(isPIIMaskingEnabled()).toBe(true);
  });

  it('flags can be toggled', () => {
    setConsent(true);
    setRemoteLogging(true);
    setPIIMasking(false);
    expect(hasConsent()).toBe(true);
    expect(isRemoteLoggingEnabled()).toBe(true);
    expect(isPIIMaskingEnabled()).toBe(false);
  });
});
