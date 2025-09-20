import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { useVoiceControl } from '../../hooks/useVoiceControl';

function HookProbe() {
  const hook = useVoiceControl();
  // expose to global for assertions
  // @ts-ignore
  (globalThis as any).__HOOK__ = hook;
  return null as any;
}

// Smoke test for the hook shape — ensures fields exist
describe('useVoiceControl hook', () => {
  it('exposes required fields', async () => {
    render(React.createElement(HookProbe));
    const hook = (globalThis as any).__HOOK__;
    expect(hook).toBeTruthy();
    expect(hook).toHaveProperty('supported');
    expect(hook).toHaveProperty('listening');
    expect(hook).toHaveProperty('start');
    expect(hook).toHaveProperty('stop');
    expect(hook).toHaveProperty('lastTranscript');
    expect(hook).toHaveProperty('lastIntent');
    expect(hook).toHaveProperty('suggestions');
  });
});
