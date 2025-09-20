#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const targets = [
  'src/components/AIChat.tsx',
  'src/components/LegalAssistantChat.tsx'
];

let failed = false;

for (const rel of targets) {
  const p = path.join(process.cwd(), rel);
  if (!fs.existsSync(p)) continue;
  const txt = fs.readFileSync(p, 'utf8');
  const lines = txt.split(/\r?\n/);
  // Count only lines that start with "import React" to avoid comment duplication or partial matches
  const importReactCount = lines.filter(l => /^import React\b/.test(l.trim())).length;
  const hasEndMarker = /END OF FILE/i.test(txt);
  if (importReactCount > 1) {
    console.error(`[FAIL] ${rel}: duplicate React import (${importReactCount}).`);
    failed = true;
  }
  if (lines.length > 350) {
    console.error(`[FAIL] ${rel}: line count ${lines.length} > 350.`);
    failed = true;
  }
  if (rel.endsWith('AIChat.tsx') && fs.existsSync(path.join(process.cwd(), 'src/components/AIChat.tsx'))) {
    // AIChat should have been removed (renamed). If it exists and is large, flag.
    if (lines.length > 350 || importReactCount > 1) {
      console.error('[WARN] Legacy AIChat.tsx appears corrupted.');
    }
  }
  if (!hasEndMarker && rel.includes('LegalAssistantChat')) {
    console.error(`[FAIL] ${rel}: missing END OF FILE marker.`);
    failed = true;
  }
  // Auto-trim for thin wrapper corruption
  if (rel.endsWith('AIChat.tsx')) {
    const markerIndex = lines.findIndex(l => l.includes('END WRAPPER'));
    if (markerIndex >= 0 && markerIndex < lines.length - 1) {
      const trimmed = lines.slice(0, markerIndex + 1).join('\n') + '\n';
      if (trimmed.length < txt.length) {
        fs.writeFileSync(p, trimmed, 'utf8');
        console.log(`[FIX] Trimmed trailing injected content in ${rel}.`);
      }
    }
  }
  if (!failed) {
    console.log(`[OK ] ${rel}: ${lines.length} lines, React imports=${importReactCount}.`);
  }
}

if (failed) {
  console.error('\nIntegrity check failed.');
  process.exit(1);
} else {
  console.log('\nIntegrity check passed.');
}
