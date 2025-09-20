// Gelişmiş Fonetik Düzeltme ve Bulanık Eşleştirme Sistemi
// 3000+ kelime desteği ile telaffuz hatalarına karşı koruma

import { distance } from 'fastest-levenshtein';
import { 
  REGIONAL_ACCENT_CORRECTIONS, 
  FAST_SPEECH_CORRECTIONS, 
  COMMON_PRONUNCIATION_ERRORS,
  ALL_LEGAL_TERMS,
  type LegalTerm 
} from './expandedLegalTerms';

export interface AdvancedVoiceMatch {
  command: string;
  score: number;
  category: string;
  action: string;
  matchType: 'exact' | 'phonetic' | 'fuzzy' | 'contextual' | 'learned';
  confidence: number;
  suggestions?: string[];
}

// Gelişmiş Fonetik Algoritma Sınıfı
export class AdvancedPhoneticMatcher {
  private userCorrections = new Map<string, string>();
  private frequencyMap = new Map<string, number>();
  private contextPatterns = new Map<string, Set<string>>();
  private recentCommands: string[] = [];
  
  constructor() {
    this.loadUserCorrections();
  }

  // Ana eşleştirme fonksiyonu
  findBestMatches(
    input: string,
    commands: Array<{ patterns: string[]; category: string; action: string }>,
    threshold: number = 0.7
  ): AdvancedVoiceMatch[] {
    const normalizedInput = this.normalizeInput(input);
    const matches: AdvancedVoiceMatch[] = [];

    // 1. Tam eşleşme kontrolü
    const exactMatches = this.findExactMatches(normalizedInput, commands);
    matches.push(...exactMatches);

    // 2. Fonetik eşleştirme
    const phoneticMatches = this.findPhoneticMatches(normalizedInput, commands);
    matches.push(...phoneticMatches);

    // 3. Bulanık eşleştirme (Levenshtein + Jaro-Winkler + Soundex)
    const fuzzyMatches = this.findFuzzyMatches(normalizedInput, commands, threshold);
    matches.push(...fuzzyMatches);

    // 4. Bağlamsal eşleştirme
    const contextualMatches = this.findContextualMatches(normalizedInput, commands);
    matches.push(...contextualMatches);

    // 5. Öğrenilmiş düzeltmeler
    const learnedMatches = this.findLearnedMatches(normalizedInput, commands);
    matches.push(...learnedMatches);

    // Skorlara göre sırala ve tekrarlananları kaldır
    return this.deduplicateAndSort(matches);
  }

  // Girdiyi normalize et
  private normalizeInput(input: string): string {
    let normalized = input.toLowerCase().trim();

    // Dolgu kelimelerini temizle
    const fillers = [' ya ', ' yani ', ' hani ', ' şey ', ' ee ', ' eee ', ' ıı ', ' ııı ', ' aaa ', ' haa ', ' hmm '];
    normalized = ' ' + normalized + ' ';
    for (const filler of fillers) {
      normalized = normalized.split(filler).join(' ');
    }
    normalized = normalized.replace(/\s+/g, ' ').trim();

    // Hızlı konuşma düzeltmeleri
    for (const [fast, correct] of Object.entries(FAST_SPEECH_CORRECTIONS)) {
      normalized = normalized.replace(new RegExp(fast, 'gi'), correct);
    }

    // Bölgesel aksan düzeltmeleri
    for (const [accent, correct] of Object.entries(REGIONAL_ACCENT_CORRECTIONS)) {
      normalized = normalized.replace(new RegExp(`\\b${accent}\\b`, 'gi'), correct);
    }

    // Yaygın telaffuz hataları
    for (const [error, correct] of Object.entries(COMMON_PRONUNCIATION_ERRORS)) {
      normalized = normalized.replace(new RegExp(`\\b${error}\\b`, 'gi'), correct);
    }

    return normalized;
  }

  // Tam eşleşme bulma
  private findExactMatches(
    input: string,
    commands: Array<{ patterns: string[]; category: string; action: string }>
  ): AdvancedVoiceMatch[] {
    const matches: AdvancedVoiceMatch[] = [];

    for (const commandGroup of commands) {
      for (const pattern of commandGroup.patterns) {
        if (input === pattern.toLowerCase()) {
          matches.push({
            command: pattern,
            score: 1.0,
            category: commandGroup.category,
            action: commandGroup.action,
            matchType: 'exact',
            confidence: 1.0
          });
        }
      }
    }

    return matches;
  }

  // Fonetik eşleştirme
  private findPhoneticMatches(
    input: string,
    commands: Array<{ patterns: string[]; category: string; action: string }>
  ): AdvancedVoiceMatch[] {
    const matches: AdvancedVoiceMatch[] = [];

    // Hukuki terimlerle eşleştir
    for (const term of ALL_LEGAL_TERMS) {
      const phoneticScore = this.calculatePhoneticSimilarity(input, term);
      if (phoneticScore > 0.8) {
        // İlgili komutu bul
        const relatedCommand = commands.find(cmd => 
          cmd.patterns.some(pattern => 
            pattern.toLowerCase().includes(term.term.toLowerCase())
          )
        );

        if (relatedCommand) {
          matches.push({
            command: term.term,
            score: phoneticScore,
            category: relatedCommand.category,
            action: relatedCommand.action,
            matchType: 'phonetic',
            confidence: phoneticScore,
            suggestions: term.synonyms.slice(0, 3)
          });
        }
      }
    }

    return matches;
  }

  // Çoklu algoritma ile bulanık eşleştirme
  private findFuzzyMatches(
    input: string,
    commands: Array<{ patterns: string[]; category: string; action: string }>,
    threshold: number
  ): AdvancedVoiceMatch[] {
    const matches: AdvancedVoiceMatch[] = [];

    for (const commandGroup of commands) {
      for (const pattern of commandGroup.patterns) {
        const normalizedPattern = pattern.toLowerCase();
        
        // Çoklu algoritma skoru
        const levenshteinScore = this.calculateLevenshteinSimilarity(input, normalizedPattern);
        const jaroScore = this.calculateJaroWinklerSimilarity(input, normalizedPattern);
        const ngramScore = this.calculateNGramSimilarity(input, normalizedPattern);
        const soundexScore = this.calculateSoundexSimilarity(input, normalizedPattern);

        // Ağırlıklı ortalama
        const compositeScore = (
          levenshteinScore * 0.3 +
          jaroScore * 0.3 +
          ngramScore * 0.2 +
          soundexScore * 0.2
        );

        if (compositeScore >= threshold) {
          matches.push({
            command: pattern,
            score: compositeScore,
            category: commandGroup.category,
            action: commandGroup.action,
            matchType: 'fuzzy',
            confidence: compositeScore
          });
        }
      }
    }

    return matches;
  }

  // Bağlamsal eşleştirme
  private findContextualMatches(
    input: string,
    commands: Array<{ patterns: string[]; category: string; action: string }>
  ): AdvancedVoiceMatch[] {
    const matches: AdvancedVoiceMatch[] = [];

    // Son komutlara göre bağlam oluştur
    const context = this.buildContext();
    
    for (const commandGroup of commands) {
      for (const pattern of commandGroup.patterns) {
        const contextScore = this.calculateContextualSimilarity(input, pattern, context);
        
        if (contextScore > 0.6) {
          matches.push({
            command: pattern,
            score: contextScore,
            category: commandGroup.category,
            action: commandGroup.action,
            matchType: 'contextual',
            confidence: contextScore
          });
        }
      }
    }

    return matches;
  }

  // Öğrenilmiş düzeltmeler
  private findLearnedMatches(
    input: string,
    commands: Array<{ patterns: string[]; category: string; action: string }>
  ): AdvancedVoiceMatch[] {
    const matches: AdvancedVoiceMatch[] = [];

    // Kullanıcı düzeltmelerini kontrol et
    if (this.userCorrections.has(input)) {
      const corrected = this.userCorrections.get(input)!;
      
      const relatedCommand = commands.find(cmd =>
        cmd.patterns.some(pattern => pattern.toLowerCase().includes(corrected.toLowerCase()))
      );

      if (relatedCommand) {
        matches.push({
          command: corrected,
          score: 0.95,
          category: relatedCommand.category,
          action: relatedCommand.action,
          matchType: 'learned',
          confidence: 0.95
        });
      }
    }

    return matches;
  }

  // Fonetik benzerlik hesaplama
  private calculatePhoneticSimilarity(input: string, term: LegalTerm): number {
    let maxScore = 0;

    // Ana terimle karşılaştır
    const mainScore = this.calculateLevenshteinSimilarity(input, term.term);
    maxScore = Math.max(maxScore, mainScore);

    // Fonetik varyasyonlarla karşılaştır
    for (const variation of term.phoneticVariations) {
      const score = this.calculateLevenshteinSimilarity(input, variation);
      maxScore = Math.max(maxScore, score);
    }

    // Bölgesel aksanlarla karşılaştır
    for (const accent of term.regionalAccents) {
      const score = this.calculateLevenshteinSimilarity(input, accent);
      maxScore = Math.max(maxScore, score);
    }

    return maxScore;
  }

  // Levenshtein benzerliği
  private calculateLevenshteinSimilarity(str1: string, str2: string): number {
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 1;
    return 1 - (distance(str1, str2) / maxLen);
  }

  // Jaro-Winkler benzerliği
  private calculateJaroWinklerSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;

    const matchWindow = Math.floor(Math.max(str1.length, str2.length) / 2) - 1;
    const str1Matches = new Array(str1.length).fill(false);
    const str2Matches = new Array(str2.length).fill(false);

    let matches = 0;
    let transpositions = 0;

    // Eşleşmeleri bul
    for (let i = 0; i < str1.length; i++) {
      const start = Math.max(0, i - matchWindow);
      const end = Math.min(i + matchWindow + 1, str2.length);

      for (let j = start; j < end; j++) {
        if (str2Matches[j] || str1[i] !== str2[j]) continue;
        str1Matches[i] = str2Matches[j] = true;
        matches++;
        break;
      }
    }

    if (matches === 0) return 0;

    // Transpositions hesapla
    let k = 0;
    for (let i = 0; i < str1.length; i++) {
      if (!str1Matches[i]) continue;
      while (!str2Matches[k]) k++;
      if (str1[i] !== str2[k]) transpositions++;
      k++;
    }

    const jaro = (matches / str1.length + matches / str2.length + (matches - transpositions / 2) / matches) / 3;

    // Winkler prefix bonus
    let prefix = 0;
    for (let i = 0; i < Math.min(str1.length, str2.length, 4); i++) {
      if (str1[i] === str2[i]) prefix++;
      else break;
    }

    return jaro + (0.1 * prefix * (1 - jaro));
  }

  // N-gram benzerliği
  private calculateNGramSimilarity(str1: string, str2: string, n: number = 2): number {
    if (str1 === str2) return 1;
    if (str1.length < n || str2.length < n) return 0;

    const ngrams1 = this.getNGrams(str1, n);
    const ngrams2 = this.getNGrams(str2, n);

    const intersection = ngrams1.filter(gram => ngrams2.includes(gram));
    const union = [...new Set([...ngrams1, ...ngrams2])];

    return intersection.length / union.length;
  }

  // N-gram oluştur
  private getNGrams(str: string, n: number): string[] {
    const ngrams: string[] = [];
    for (let i = 0; i <= str.length - n; i++) {
      ngrams.push(str.substr(i, n));
    }
    return ngrams;
  }

  // Soundex benzerliği
  private calculateSoundexSimilarity(str1: string, str2: string): number {
    const soundex1 = this.soundex(str1);
    const soundex2 = this.soundex(str2);
    return soundex1 === soundex2 ? 1 : 0;
  }

  // Soundex algoritması (Türkçe uyarlaması)
  private soundex(str: string): string {
    str = str.toLowerCase().replace(/[^a-züçğıöş]/g, '');
    if (!str) return '';

    const first = str[0];
    str = str.replace(/[aeiouüıöçğş]/g, '');
    
    const mapping: Record<string, string> = {
      'b': '1', 'f': '1', 'p': '1', 'v': '1',
      'c': '2', 'g': '2', 'j': '2', 'k': '2', 'q': '2', 's': '2', 'x': '2', 'z': '2',
      'd': '3', 't': '3',
      'l': '4',
      'm': '5', 'n': '5',
      'r': '6'
    };

    let soundex = first;
    for (let i = 1; i < str.length; i++) {
      const code = mapping[str[i]];
      if (code && code !== soundex[soundex.length - 1]) {
        soundex += code;
      }
    }

    return soundex.padEnd(4, '0').substr(0, 4);
  }

  // Bağlam oluştur
  private buildContext(): string[] {
    return this.recentCommands.slice(-5); // Son 5 komut
  }

  // Bağlamsal benzerlik
  private calculateContextualSimilarity(input: string, pattern: string, context: string[]): number {
    let score = 0;
    
    // Bağlamdaki kelimelerle eşleşme kontrolü
    for (const contextItem of context) {
      if (pattern.toLowerCase().includes(contextItem.toLowerCase()) && 
          input.toLowerCase().includes(contextItem.toLowerCase())) {
        score += 0.2;
      }
    }

    return Math.min(score, 1);
  }

  // Tekrarlananları kaldır ve sırala
  private deduplicateAndSort(matches: AdvancedVoiceMatch[]): AdvancedVoiceMatch[] {
    const uniqueMatches = new Map<string, AdvancedVoiceMatch>();

    for (const match of matches) {
      const key = `${match.command}-${match.action}`;
      if (!uniqueMatches.has(key) || uniqueMatches.get(key)!.score < match.score) {
        uniqueMatches.set(key, match);
      }
    }

    return Array.from(uniqueMatches.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // En iyi 10 sonuç
  }

  // Kullanıcı düzeltmesi öğren
  learnFromCorrection(misheard: string, correct: string): void {
    this.userCorrections.set(misheard.toLowerCase(), correct.toLowerCase());
    this.saveUserCorrections();
    this.updateFrequency(correct);
  }

  // Komut geçmişine ekle
  addToHistory(command: string): void {
    this.recentCommands.push(command);
    if (this.recentCommands.length > 20) {
      this.recentCommands.shift();
    }
  }

  // Frekans güncelle
  private updateFrequency(command: string): void {
    const current = this.frequencyMap.get(command) || 0;
    this.frequencyMap.set(command, current + 1);
  }

  // Kullanıcı düzeltmelerini yükle
  private loadUserCorrections(): void {
    try {
      const saved = localStorage.getItem('voice_user_corrections');
      if (saved) {
        const corrections = JSON.parse(saved);
        this.userCorrections = new Map(corrections);
      }
    } catch (error) {
      console.warn('Kullanıcı düzeltmeleri yüklenemedi:', error);
    }
  }

  // Kullanıcı düzeltmelerini kaydet
  private saveUserCorrections(): void {
    try {
      const corrections = Array.from(this.userCorrections.entries());
      localStorage.setItem('voice_user_corrections', JSON.stringify(corrections));
    } catch (error) {
      console.warn('Kullanıcı düzeltmeleri kaydedilemedi:', error);
    }
  }

  // İstatistikleri getir
  getStats() {
    return {
      userCorrections: this.userCorrections.size,
      frequencyEntries: this.frequencyMap.size,
      recentCommands: this.recentCommands.length,
      totalLegalTerms: ALL_LEGAL_TERMS.length
    };
  }
}

// Singleton instance
export const advancedPhoneticMatcher = new AdvancedPhoneticMatcher();

// Export edilen yardımcı fonksiyonlar
export function findAdvancedMatches(
  input: string,
  commands: Array<{ patterns: string[]; category: string; action: string }>,
  threshold: number = 0.7
): AdvancedVoiceMatch[] {
  return advancedPhoneticMatcher.findBestMatches(input, commands, threshold);
}

export function learnCorrection(misheard: string, correct: string): void {
  advancedPhoneticMatcher.learnFromCorrection(misheard, correct);
}

export function addCommandToHistory(command: string): void {
  advancedPhoneticMatcher.addToHistory(command);
}

export function getVoiceStats() {
  return advancedPhoneticMatcher.getStats();
}
