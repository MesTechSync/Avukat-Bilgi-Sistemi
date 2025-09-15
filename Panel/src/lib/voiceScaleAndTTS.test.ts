import { describe, it, expect, vi } from 'vitest';
import { DynamicCommandGenerator } from './extendedVoiceCommands';
import * as tts from './voiceTTS';

describe('voice scale and TTS', () => {
  it('generator yields > 2000 patterns across groups', () => {
    const gen = new DynamicCommandGenerator();
    const all = gen.generateAll();
    const count = all.reduce((sum, g) => sum + g.patterns.length, 0);
    expect(count).toBeGreaterThan(2000);
  });

  it('speak does not throw and uses speechSynthesis if present', () => {
    const speakSpy = vi.fn();
    // @ts-ignore
    global.window = { speechSynthesis: { speak: speakSpy, getVoices: () => [{ lang: 'tr-TR' }] } } as any;
    tts.speak('Test');
    expect(speakSpy).toHaveBeenCalled();
  });
});
