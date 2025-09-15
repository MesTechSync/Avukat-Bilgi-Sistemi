import { distance as levenshtein } from 'fastest-levenshtein';

// Türkçe ses dönüşüm kuralları (tek kaynak)
const PHONETIC_RULES: Array<[RegExp, string]> = [
  [/ç/g, 'c'], [/ş/g, 's'], [/ğ/g, 'g'],
  [/p/g, 'b'], [/t/g, 'd'], [/k/g, 'g'],
  [/ı/g, 'i'], [/ü/g, 'u'], [/ö/g, 'o'],
  [/â/g, 'a'], [/î/g, 'i'], [/û/g, 'u'],
  [/x/g, 'ks'], [/w/g, 'v'], [/q/g, 'k'],
  [/([bcdgklmnprstz])\1+/g, '$1'],
  [/([aeiıoöuü])h([aeiıoöuü])/g, '$1$2'],
];

// Yaygın yanlış algılamalar sözlüğü (tek kaynak)
const COMMON_MISTAKES: Record<string, string[]> = {
  ara: ['arax', 'aray', 'aro'],
  aç: ['ac', 'ach', 'açı', 'aş'],
  bul: ['bol', 'bula', 'bulu'],
  dosya: ['dosa', 'dosiya', 'dosyam', 'tosya'],
  dava: ['tava', 'davaa', 'dawa', 'davai'],
  müvekkil: ['müekkel', 'müekkil', 'müvekil', 'müvekkel'],
  takvim: ['takim', 'takwim', 'takvimi', 'taqvim'],
  ajanda: ['ajanta', 'acanda', 'ajende', 'ajandı'],
  belge: ['belce', 'belke', 'belgem', 'pelge'],
  kaydet: ['kayıt', 'kaydeti', 'kayted'],
  sil: ['sili', 'stil', 'sel', 'şil'],
  güncelle: ['güncele', 'güncelleme', 'güncelli'],
  yeni: ['yenı', 'yenni', 'yenisi', 'yemi'],
  oluştur: ['olustur', 'oluşturu', 'oluştura'],
  görüntüle: ['görüntülü', 'görüntüler', 'görüntüleme', 'görüntüli'],
  düzenle: ['düzenleme', 'düzenli', 'düzene', 'tüzenle'],
  rapor: ['raporlar', 'raporu', 'rabor', 'raport'],
  mahkeme: ['mahkame', 'mehkeme', 'mahkemi', 'mahgeme'],
  duruşma: ['durusma', 'duruşmam', 'turuşma', 'duruşması'],
  dilekçe: ['dilekce', 'dilekşe', 'tilekçe', 'dilekçem'],
  icra: ['icraa', 'icray', 'ikra', 'ecra'],
  temyiz: ['temiz', 'temmiz', 'temyizi', 'temyis'],
  istinaf: ['istinab', 'istinav', 'istimaf', 'istinafi'],
  nafaka: ['nafakaa', 'nafakam', 'mafaka', 'nafakat'],
  boşanma: ['bosanma', 'boşanmak', 'boşanmam', 'poşanma'],
  velayet: ['valayet', 'velayeti', 'velaet', 'welayet'],
  tebligat: ['tebliğat', 'tepligat', 'tebligati', 'tabligat'],
  haciz: ['haczı', 'hacis', 'hacizi', 'aciz'],
  rehin: ['rehini', 'rahin', 'tehin'],
  kira: ['kiraa', 'kiray', 'kıra', 'gira'],
  tapu: ['tabu', 'tapuu', 'tapum', 'dapu'],
  senet: ['seneti', 'sened', 'sanet', 'sennet'],
  çek: ['çeki', 'çeq', 'çekk', 'şek'],
  fatura: ['fattura', 'faturaa', 'faturay', 'vatura'],
  makbuz: ['makbus', 'makbuzu', 'makpuz', 'maqbuz'],
  sözleşme: ['sözlesme', 'sözleşmem', 'sözleşmesi', 'sözleşma'],
  taahhüt: ['tahhüt', 'taahhüd', 'taaüt', 'taahüt'],
  ihtar: ['ihdar'],
  ihtarname: ['ihtarnama', 'ihtarnamesi', 'ihtername', 'ihtarmane'],
  tanık: ['tanıq', 'tanıklar', 'danık', 'tanigi'],
  şahit: ['şahid', 'şait', 'sahit', 'şahitler'],
  davalı: ['davalıy', 'davalım', 'tavalı', 'davali'],
  davacı: ['davacıy', 'davacım', 'tavacı', 'davaci'],
  avukat: ['avukati', 'awukat', 'avukata', 'avokat'],
  hakim: ['hakimi', 'hâkim', 'akim', 'hakem'],
  savcı: ['savcıy', 'savci', 'savcım', 'savçı'],
  noter: ['noteri', 'notere', 'moter', 'nöter'],
  arama: ['arama', 'arama yap', 'aramak', 'aramam'],
  randevu: ['randavu', 'randevü', 'randuvü', 'randavu'],
  ödeme: ['odeme', 'ödmee', 'ödemee', 'ödemei'],
  ayarlar: ['ayar', 'ayarla', 'ayarlarım', 'ayarlarr'],
};

export function toPhonetic(text: string): string {
  let result = text.toLowerCase().trim();
  for (const [pattern, replacement] of PHONETIC_RULES) {
    result = result.replace(pattern, replacement);
  }
  return result.replace(/[^a-z0-9]/g, '');
}

function ngramSimilarity(s1: string, s2: string, n = 2): number {
  const grams = (s: string) => {
    const set = new Set<string>();
    const str = s.toLowerCase();
    for (let i = 0; i <= str.length - n; i++) set.add(str.substring(i, i + n));
    return set;
  };
  const a = grams(s1), b = grams(s2);
  if (a.size === 0 || b.size === 0) return 0;
  const inter = new Set([...a].filter(x => b.has(x)));
  const uni = new Set([...a, ...b]);
  return inter.size / uni.size;
}

export function calculateSimilarity(input: string, target: string): number {
  if (!input || !target) return 0;
  if (input === target) return 1;
  // Apply 'contains' boost only when matching whole word boundaries
  const boundaryRe = new RegExp(`(^|\\b)${target}(\\b|$)`);
  if (boundaryRe.test(input) || boundaryRe.test(target)) {
    return 0.9 - Math.min(0.2, Math.abs(input.length - target.length) * 0.02);
  }
  const phonIn = toPhonetic(input);
  const phonTg = toPhonetic(target);
  if (phonIn === phonTg) return 0.85;
  const maxLen = Math.max(input.length, target.length);
  const lev = 1 - (levenshtein(input, target) / maxLen);
  const phonLev = 1 - (levenshtein(phonIn, phonTg) / Math.max(phonIn.length, phonTg.length || 1));
  const ng = ngramSimilarity(input, target);
  let score = (lev * 0.3) + (phonLev * 0.4) + (ng * 0.3);
  // Damp short target words (<=3) if input doesn't have word-boundary match (e.g., 'ara' vs 'araç')
  if (target.length <= 3 && !boundaryRe.test(input)) {
    score = Math.max(0, score - 0.25);
  }
  return score;
}

export function correctCommonMistakes(input: string): string[] {
  const out = new Set<string>([input]);
  const norm = input.toLowerCase().trim();
  for (const [correct, mistakes] of Object.entries(COMMON_MISTAKES)) {
    for (const m of mistakes) {
      if (calculateSimilarity(norm, m) > 0.7) out.add(correct);
    }
  }
  const corrections: Array<[RegExp, string]> = [
    [/(\w)x(\w)/g, '$1ks$2'],
    [/(\w)w(\w)/g, '$1v$2'],
    [/(\w)q(\w)/g, '$1k$2'],
    [/(\w)\1{2,}/g, '$1$1'],
  ];
  let corr = norm;
  for (const [p, r] of corrections) corr = corr.replace(p, r);
  out.add(corr);
  return [...out];
}

export interface CommandSuggestion {
  command: string;
  score: number;
  category: string;
  action: string;
}

export function findBestMatches(
  input: string,
  commands: Array<{ patterns: string[]; category: string; action: string }>,
  threshold = 0.6
): CommandSuggestion[] {
  const suggestions: CommandSuggestion[] = [];
  const candidates = correctCommonMistakes(input);
  for (const corrected of candidates) {
    for (const cmd of commands) {
      for (const pat of cmd.patterns) {
        const score = calculateSimilarity(corrected, pat);
        if (score >= threshold) suggestions.push({ command: pat, score, category: cmd.category, action: cmd.action });
      }
    }
  }
  return suggestions.sort((a, b) => b.score - a.score).slice(0, 5);
}

export class ContextAwareCorrector {
  private history: string[] = [];
  private contextPatterns: Map<string, string[]> = new Map([
    ['dava', ['dosya', 'görüntüle', 'duruşma', 'dilekçe']],
    ['müvekkil', ['ekle', 'ara', 'dosya', 'randevu']],
    ['belge', ['yükle', 'indir', 'görüntüle', 'düzenle']],
    ['takvim', ['randevu', 'duruşma', 'toplantı', 'etkinlik']],
  ]);

  addToHistory(text: string) {
    this.history.push(text);
    if (this.history.length > 10) this.history.shift();
  }

  suggestBasedOnContext(): string[] {
    const recent = this.history.slice(-3).join(' ');
    const out: string[] = [];
    for (const [k, pats] of this.contextPatterns) if (recent.includes(k)) out.push(...pats);
    return out;
  }
}