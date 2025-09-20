// Sesli Komut Fonetik Düzeltme ve Bulanık Eşleştirme Sistemi

import { distance } from 'fastest-levenshtein';

export interface VoiceMatch {
  command: string;
  score: number;
  category: string;
  action: string;
}

// Türkçe fonetik düzeltme haritası
const PHONETIC_MAP: Record<string, string[]> = {
  'ara': ['arax', 'aray', 'aray', 'ara', 'ar'],
  'aç': ['açı', 'açık', 'aç', 'ac'],
  'kaydet': ['kayıt et', 'kaydet', 'kayıt', 'kayıt'],
  'sil': ['sil', 'sıl', 'sıl', 'sil'],
  'düzenle': ['düzenle', 'düzenle', 'düzenle', 'düzenle'],
  'yazdır': ['yazdır', 'yazdır', 'yazdır', 'yazdır'],
  'gönder': ['gönder', 'gönder', 'gönder', 'gönder'],
  'filtrele': ['filtrele', 'filtrele', 'filtrele', 'filtrele'],
  'sırala': ['sırala', 'sırala', 'sırala', 'sırala'],
  'ana sayfa': ['ana sayfa', 'ana sayfa', 'ana sayfa', 'ana sayfa'],
  'davalar': ['davalar', 'davalar', 'davalar', 'davalar'],
  'müvekkiller': ['müvekkiller', 'müvekkiller', 'müvekkiller', 'müvekkiller'],
  'randevular': ['randevular', 'randevular', 'randevular', 'randevular'],
  'ayarlar': ['ayarlar', 'ayarlar', 'ayarlar', 'ayarlar'],
  'karanlık mod': ['karanlık mod', 'karanlık mod', 'karanlık mod', 'karanlık mod'],
  'aydınlık mod': ['aydınlık mod', 'aydınlık mod', 'aydınlık mod', 'aydınlık mod'],
};

// Yaygın yanlış telaffuz düzeltmeleri
const COMMON_MISHEARS: Record<string, string> = {
    'arax': 'ara',
    'aray': 'ara',
  'açı': 'aç',
  'açık': 'aç',
  'kayıt et': 'kaydet',
  'kayıt': 'kaydet',
  'sıl': 'sil',
  'düzenle': 'düzenle',
  'yazdır': 'yazdır',
  'gönder': 'gönder',
  'filtrele': 'filtrele',
  'sırala': 'sırala',
  'ana sayfa': 'ana sayfa',
  'davalar': 'davalar',
  'müvekkiller': 'müvekkiller',
  'randevular': 'randevular',
  'ayarlar': 'ayarlar',
  'karanlık mod': 'karanlık mod',
  'aydınlık mod': 'aydınlık mod',
};

// Levenshtein mesafesi ile bulanık eşleştirme
export function findBestMatches(
  input: string,
  commands: Array<{ patterns: string[]; category: string; action: string }>,
  threshold: number = 0.7
): VoiceMatch[] {
  const normalizedInput = input.toLowerCase().trim();
  const matches: VoiceMatch[] = [];

  for (const commandGroup of commands) {
    for (const pattern of commandGroup.patterns) {
      const normalizedPattern = pattern.toLowerCase().trim();
      
      // Tam eşleşme kontrolü
      if (normalizedInput === normalizedPattern) {
        matches.push({
          command: pattern,
          score: 1.0,
          category: commandGroup.category,
          action: commandGroup.action
        });
        continue;
      }

      // Fonetik düzeltme kontrolü
      const correctedInput = correctPhonetics(normalizedInput);
      if (correctedInput === normalizedPattern) {
        matches.push({
          command: pattern,
          score: 0.95,
          category: commandGroup.category,
          action: commandGroup.action
        });
        continue;
      }

      // Bulanık eşleştirme
      const distanceScore = calculateSimilarity(normalizedInput, normalizedPattern);
      if (distanceScore >= threshold) {
        matches.push({
          command: pattern,
          score: distanceScore,
          category: commandGroup.category,
          action: commandGroup.action
        });
      }
    }
  }

  // Skorlara göre sırala (yüksekten düşüğe)
  return matches.sort((a, b) => b.score - a.score);
}

// Fonetik düzeltme fonksiyonu
function correctPhonetics(input: string): string {
  let corrected = input;
  
  // Yaygın yanlış telaffuzları düzelt
  for (const [mishear, correct] of Object.entries(COMMON_MISHEARS)) {
    if (corrected.includes(mishear)) {
      corrected = corrected.replace(mishear, correct);
    }
  }
  
  return corrected;
}

// Benzerlik skoru hesaplama (Levenshtein mesafesi tabanlı)
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1.0;
  
  const dist = distance(str1, str2);
  return 1 - (dist / maxLength);
}

// Bağlamsal düzeltme sınıfı
export class ContextAwareCorrector {
  private history: string[] = [];
  private maxHistorySize = 10;

  addToHistory(transcript: string): void {
    this.history.unshift(transcript.toLowerCase().trim());
    if (this.history.length > this.maxHistorySize) {
      this.history.pop();
    }
  }

  suggestBasedOnContext(): string[] {
    const suggestions: string[] = [];
    
    // Son komutlara göre öneriler
    if (this.history.length > 0) {
      const lastCommand = this.history[0];
      
      // Eğer son komut bir sayfa açma komutuysa, o sayfayla ilgili komutlar öner
      if (lastCommand.includes('davalar') || lastCommand.includes('dava')) {
        suggestions.push('dava ekle', 'dava ara', 'dava filtrele');
      }
      if (lastCommand.includes('müvekkiller') || lastCommand.includes('müvekkil')) {
        suggestions.push('müvekkil ekle', 'müvekkil ara', 'müvekkil filtrele');
      }
      if (lastCommand.includes('randevular') || lastCommand.includes('randevu')) {
        suggestions.push('randevu ekle', 'randevu ara', 'randevu filtrele');
      }
    }
    
    return suggestions;
  }

  getHistory(): string[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }
}

// Ses komutları için özel fonetik düzeltme
export function normalizeVoiceInput(input: string): string {
  let normalized = input.toLowerCase().trim();
  
  // Yaygın sesli komut hatalarını düzelt
  const corrections: Array<[RegExp, string]> = [
    [/\barax\b/g, 'ara'],
    [/\baray\b/g, 'ara'],
    [/\baro\b/g, 'ara'],
    [/\baçı\b/g, 'aç'],
    [/\baçık\b/g, 'aç'],
    [/\bkayıt et\b/g, 'kaydet'],
    [/\bkayıt\b/g, 'kaydet'],
    [/\bsıl\b/g, 'sil'],
    [/\bdüzenle\b/g, 'düzenle'],
    [/\byazdır\b/g, 'yazdır'],
    [/\bgönder\b/g, 'gönder'],
    [/\bfiltrele\b/g, 'filtrele'],
    [/\bsırala\b/g, 'sırala'],
    [/\bana sayfa\b/g, 'ana sayfa'],
    [/\bdavalar\b/g, 'davalar'],
    [/\bmüvekkiller\b/g, 'müvekkiller'],
    [/\brandevular\b/g, 'randevular'],
    [/\bayarlar\b/g, 'ayarlar'],
    [/\bkaranlık mod\b/g, 'karanlık mod'],
    [/\baydınlık mod\b/g, 'aydınlık mod'],
  ];
  
  for (const [pattern, replacement] of corrections) {
    normalized = normalized.replace(pattern, replacement);
  }
  
  return normalized;
}

// Komut önerisi sistemi
export function suggestCommands(input: string, availableCommands: string[]): string[] {
  const normalizedInput = normalizeVoiceInput(input);
  const suggestions: string[] = [];
  
  for (const command of availableCommands) {
    const similarity = calculateSimilarity(normalizedInput, command);
    if (similarity >= 0.6) {
      suggestions.push(command);
    }
  }
  
  return suggestions.sort((a, b) => 
    calculateSimilarity(normalizedInput, b) - calculateSimilarity(normalizedInput, a)
  );
}