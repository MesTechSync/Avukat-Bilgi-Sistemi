// LegalAssistantChat.tsx (authoritative clean version replacing corrupted AIChat.tsx)
// If this file ever exceeds 350 lines or contains duplicate import React lines, treat as corruption.
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Copy, ThumbsUp, ThumbsDown, Trash2, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { 
  findBestPetitionMatch, 
  searchCombinedByKeyword,
  getCombinedCategoryStats 
} from '../data/petitionExamples';
import { useDictation } from '../hooks/useDictation';
import DictationButton from './DictationButton';
import { 
  realPetitions,
  searchPetitionsByCategory,
  searchPetitionsByKeyword 
} from '../data/realPetitions';
import { geminiService } from '../services/geminiService';
import { openaiService } from '../services/openaiService';

export type Model = 'gpt-4' | 'gemini' | 'auto';

interface ChatMessage { id: string; role: 'user' | 'assistant'; content: string; timestamp: string; model?: Model; actualModel?: 'gpt-4' | 'gemini'; confidence?: number; isError?: boolean; feedback?: 'positive' | 'negative'; }
interface QuestionAnalysis { category: string; isUrgent: boolean; needsCalculation: boolean; complexity: number; }
interface AIResponse { content: string; model: 'gpt-4' | 'gemini'; confidence: number; }

const analyze = (q: string): QuestionAnalysis => {
  const t = q.toLowerCase();
  const cats: Record<string, string[]> = {
    divorce: ['boşan', 'nafaka', 'velayet', 'mal rejimi', 'eş'],
    traffic: ['trafik', 'kaza', 'sigorta', 'araç', 'çarpışma'],
    work: ['iş', 'kıdem', 'ihbar', 'mobbing', 'fazla mesai', 'çalışan'],
    civil: ['borç', 'alacak', 'sözleşme', 'kira', 'tazminat'],
    criminal: ['ceza', 'suç', 'savcılık', 'şikayet', 'mahkeme'],
    inheritance: ['miras', 'vasiyet', 'saklı pay', 'mirascı', 'tereke'],
    real_estate: ['tapu', 'emlak', 'kat mülkiyeti', 'arsa', 'satış']
  };
  let best = 'general'; let max = 0;
  for (const [c, ks] of Object.entries(cats)) { const hits = ks.filter(k => t.includes(k)).length; if (hits > max) { max = hits; best = c; } }
  const isUrgent = ['acil', 'hemen', 'zamanaşımı', 'son gün', 'bugün', 'yarın'].some(k => t.includes(k));
  const needsCalculation = ['tazminat', 'ne kadar', 'hesap', 'ücret', 'miktar', 'tutar', 'para'].some(k => t.includes(k));
  const complexity = q.length > 140 ? 3 : q.length > 80 ? 2 : 1;
  return { category: best, isUrgent, needsCalculation, complexity };
};

// Gerçek petitions'tan en iyi eşleşmeyi bul
const findBestRealPetition = (q: string) => {
  const lowQ = q.toLowerCase();
  let bestMatch = null;
  let maxScore = 0;
  
  for (const petition of realPetitions) {
    let score = 0;
    
    // Başlık eşleşmesi (yüksek puan)
    if (petition.title.toLowerCase().includes(lowQ.substring(0, 10))) {
      score += 10;
    }
    
    // Keyword eşleşmesi
    for (const keyword of petition.keywords) {
      if (lowQ.includes(keyword)) {
        score += 3;
      }
    }
    
    // Kategori eşleşmesi
    if (lowQ.includes(petition.category.toLowerCase())) {
      score += 2;
    }
    
    if (score > maxScore) {
      maxScore = score;
      bestMatch = petition;
    }
  }
  
  return bestMatch;
};

const buildAnswer = (q: string, model: 'gpt-4' | 'gemini', a: QuestionAnalysis): string => {
  const lowQ = q.toLowerCase();
  
  // Önce gerçek örneklerden arama yap
  const realMatch = findBestRealPetition(q);
  if (realMatch && realMatch.keywords.some(k => lowQ.includes(k))) {
    const relatedExamples = realPetitions.filter(r => r.category === realMatch.category && r.id !== realMatch.id).slice(0, 2);
    
    return `## 📋 ${realMatch.title} Hakkında Profesyonel Bilgi

**Kategori:** ${realMatch.category}
**Alt Kategori:** ${realMatch.subcategory}
**Tahmini Maliyet:** ${realMatch.estimatedCost}
**Tahmini Süre:** ${realMatch.timeframe}
**Aciliyet:** ${realMatch.urgency === 'high' ? '🔴 Yüksek' : realMatch.urgency === 'medium' ? '🟡 Orta' : '🟢 Düşük'}
**Karmaşıklık:** ${realMatch.complexity === 'advanced' ? '⚠️ İleri Seviye' : realMatch.complexity === 'intermediate' ? '📊 Orta Seviye' : '✅ Temel Seviye'}

**Bu dilekçe için gerekli bilgiler:**
${realMatch.variables.map(v => `• ${v.replace(/_/g, ' ').replace(/İ/g, 'i').toLowerCase()}`).join('\n')}

**Benzer durumlar:**
${relatedExamples.map(ex => `• ${ex.title} (${ex.timeframe})`).join('\n')}

**Profesyonel tavsiyem:** 
${realMatch.complexity === 'advanced' ? 
  '⚖️ Bu karmaşık bir hukuki durum. Mutlaka deneyimli bir avukatla görüşün ve dosyanızı hazırlattırın.' : 
  realMatch.complexity === 'intermediate' ? 
  '📝 Orta seviye bir süreç. Hukuki destek almanızı öneririm, ancak dilekçeyi sistemimizdeki örneklerle hazırlayabilirsiniz.' : 
  '✨ Basit bir süreç. Sistemdeki template ile dilekçeyi kendiniz hazırlayabilirsiniz.'}

**Gerçek örnek preview:**
\`\`\`
${realMatch.template.split('\n').slice(0, 5).join('\n')}...
\`\`\`

Dilekçe Yazıcı'ya gidip "${realMatch.title}" seçerek profesyonel dilekçenizi hazırlayabilirsiniz.`;
  }
  
  // Model bazlı profesyonel yanıtlar (gerçek örneklerden eşleşme bulunamadığında)
  if (model === 'gpt-4') {
    return generateGPT4Response(a, q);
  } else {
    return generateGeminiResponse(a, q);
  }
};

const generateGPT4Response = (analysis: QuestionAnalysis, query: string): string => {
  const a = analysis;
  const lowQ = query.toLowerCase();
  
  // GPT-4 tarzı uzun, detaylı, profesyonel cevaplar
  if (a.category === 'divorce') {
    return `## ⚖️ Kapsamlı Boşanma Hukuku Analizi

**📋 Boşanma Türleri ve Hukuki Çerçeve**

**1. Anlaşmalı Boşanma (TMK m.134)**
• **Süre:** 2-4 ay (tüm işlemler dahil)
• **Şartlar:** Karşılıklı anlaşma + 1 yıllık evlilik süresi
• **Maliyet:** 2.500-6.000 TL (avukat + harç + noter)
• **Avantajlar:** Hızlı, gizli, ekonomik, stressiz

**2. Çekişmeli Boşanma (TMK m.161-166)**
• **Süre:** 1-3 yıl (karmaşıklığa göre)
• **Sebepler:** Zina, hayata kast, ağır hakaret, suç işleme, terke şayan haller
• **Maliyet:** 8.000-30.000 TL (uzun süreç + delil masrafları)

**📄 Detaylı Belge Listesi**
✅ Evlilik cüzdanı (Nüfus müdürlüğünden güncel)
✅ Nüfus kayıt örnekleri (eş + çocuklar)
✅ Gelir belgeleri (son 6 ay maaş bordrosu/gelir beyannamesi)
✅ Mal bildirim beyanı (taşınmazlar, araçlar, hesaplar)
✅ İkametgah belgesi
✅ Çocuklar için okul kayıt belgesi
✅ Sağlık raporları (varsa özel durumlar için)

**💰 Finansal Analiz ve Tahminler**

**Nafaka Hesaplamaları:**
• **Tedbir Nafakası:** Net gelirin %20-40'ı (acil durumlarda)
• **Sürekli Nafaka:** Yaşam standardı + ihtiyaçlar (süresiz/süreli)
• **Çocuk Nafakası:** Her çocuk için gelirin %15-25'i

**Tazminat Hakları:**
• **Maddi Tazminat:** İş kaybı, tedavi masrafları, taşınma giderleri
• **Manevi Tazminat:** 50.000-200.000 TL (boşanma sebebine göre)

**🔍 Hukuki Strateji Önerileri**

1. **Delil Toplama Aşaması (1-2 hafta)**
   - WhatsApp mesajları, e-postalar (yemin karşılığı)
   - Tanık ifadeleri (aile üyeleri hariç, 3. kişiler tercih)
   - Fotoğraf/video belgeleri (mahkeme onaylı)

2. **Uzlaştırma Stratejisi**
   - Mali durum analizi öncesi hazırlık
   - Çocuk psikolojisi raporları
   - Alternatif çözüm önerileri geliştirme

3. **Mahkeme Süreci Yönetimi**
   - Duruşma tarihleri ve hazırlık süreci
   - İtiraz ve temyiz hakları
   - İcra takibi süreçleri

**⚠️ Kritik Zamanaşımı Süreleri**
• Boşanma davası: Sınırsız (evlilik devam ettiği sürece)
• Tazminat talepleri: 2 yıl (boşanma kararından itibaren)
• Nafaka icra takibi: 5 yıl

**🎯 Size Özel Soru Seti:**
1. Evlilik süreniz ne kadar? (nafaka süresi için kritik)
2. Çocuğunuz var mı? Yaşları? (velayet + nafaka hesabı)
3. Eşinizin gelir durumu nedir? (nafaka miktarı için)
4. Hangi boşanma sebebini öne süreceksiniz?
5. Anlaşma ihtimaliniz var mı?

Bu bilgileri paylaşırsanız, size özel detaylı strateji ve maliyet analizi hazırlayabilirim.`;
  }

  if (a.category === 'traffic') {
    return `## 🚗 Trafik Kazası Tazminat Analizi ve Hukuki Süreç

**📊 Tazminat Kategorileri ve Hesaplama Metodları**

**1. Maddi Tazminat Kalemleri**

**A) Araç Hasarları:**
• **Ekspertiz bedeli:** Sigorta şirketi ekspertizi (%100 güvenilir değil)
• **Bağımsız ekspertiz:** 1.500-3.000 TL (tavsiye edilir)
• **Değer kaybı tazminatı:** Araç değerinin %10-30'u
• **Kiralama bedeli:** Tamir süresince alternatif araç

**B) Tedavi Masrafları:**
• **Hastane faturaları:** Tümü (ambulans dahil)
• **İlaç giderleri:** Reçeteli tüm ilaçlar
• **Fizik tedavi:** Doktor raporu gerektiren seanslar
• **Protez/medikal malzeme:** Özel ihtiyaçlar
• **Psikiyatrik tedavi:** Travma sonrası terapi

**C) Gelir Kaybı Hesaplaması:**
• **Ücretli çalışan:** (Aylık net maaş ÷ 30) × İşe gidemediği gün
• **Serbest meslek:** Son 3 yıl gelir ortalaması
• **Emekli:** Maaş + ek gelirler
• **İşsiz:** Asgari ücret üzerinden

**2. Manevi Tazminat Değerlendirmesi**

**Yaralanma Derecesine Göre:**
• **Hafif yaralanma:** 15.000-35.000 TL
• **Orta derece:** 35.000-75.000 TL
• **Ağır yaralanma:** 75.000-150.000 TL
• **Kalıcı sakatlık:** 150.000-500.000 TL
• **Ölüm:** 300.000-800.000 TL (yakınlık derecesine göre)

**⚖️ Hukuki Süreç ve Zamanaşımı**

**1. Sigorta Başvuru Süreci (İlk 2 Yıl)**
• **Zorunlu Mali Sorumluluk:** Her araçta mevcut
• **Kasko:** Sadece poliçesi olanlarda
• **Eksik ödeme durumu:** Mahkeme yolu açık

**2. Mahkeme Süreci (5 Yıl Zamanaşımı)**
• **Dava açma:** İkamet yeri veya kaza yeri mahkemesi
• **Delil toplama:** Kaza tutanağı, tanık ifadeleri, bilirkişi raporu
• **Uzlaştırma:** Zorunlu ön aşama
• **Karar aşaması:** 6-24 ay (karmaşıklığa göre)

**📋 Kritik Belge ve Delil Listesi**

**Kaza Anında Toplanması Gerekenler:**
✅ Polis/jandarma tutanağı (en kritik belge)
✅ Kaza yeri fotoğrafları (360° detaylı)
✅ Araç hasar fotoğrafları (yakın + uzak çekim)
✅ Ehliyet + ruhsat + sigorta poliçesi karşı taraftan
✅ Tanık bilgileri (ad-soyad, telefon, adres)

**Sonradan Temin Edilecekler:**
✅ Ekspertiz raporu (sigorta + bağımsız)
✅ Hastane kayıtları ve raporlar
✅ İş kaybı belgesi (SGK raporu + bordro)
✅ Geçimlik hesabı (aile üyeleri için)

**� Profesyonel Öneriler**

**Sigorta Şirketi ile Müzakere:**
• İlk teklifi reddetmek (genelde düşük teklif)
• Ekspertiz raporuna itiraz hakkı
• Avukat ile müzakere (daha yüksek teklif)

**Mahkeme Avantajları:**
• Tam tazminat alma ihtimali yüksek
• Vekalet ücreti karşı taraftan alınır
• Faiz ve gecikme zammı eklenir

**⚠️ Yaygın Hatalar ve Kaçınılması Gerekenler**
❌ Kaza yerinden hemen ayrılmak
❌ Polisi çağırmamak
❌ Karşı tarafla anlaşma imzalamak
❌ Sigorta şirketinin ilk teklifini kabul etmek
❌ Delilleri zamanında toplamamak

**🎯 Size Özel Değerlendirme Soruları:**
1. Kaza nasıl gerçekleşti? Kusur durumu nedir?
2. Yaralanma durumunuz nedir? Hastane raporu var mı?
3. Kaç gün işe gitemediniz? Gelir kaybınız ne kadar?
4. Araç hasarı ne kadar? Ekspertiz yaptırdınız mı?
5. Karşı tarafın sigortası var mı? Hangi şirket?

Bu bilgileri paylaşırsanız, size özel tazminat hesaplaması ve hukuki strateji önerisi hazırlayabilirim.`;
  }

  if (a.category === 'work') {
    return `## 💼 Kapsamlı İş Hukuku Haklarınız ve Tazminat Analizi

**📊 Tazminat Türleri ve Hesaplama Formülleri**

**1. Kıdem Tazminatı (İş Kanunu m.120)**

**Hesaplama Formülü:**
(Son brüt maaş × 30 gün × çalışılan yıl sayısı) ÷ 365

**Şartları:**
✅ En az 2 yıl çalışmış olmak (1 gün eksik bile olsa hak yok)
✅ İşten çıkarılmak veya haklı sebeple ayrılmak
✅ Emeklilik, askerlik, evlilik (kadın çalışanlar için)

**2024 Kıdem Tazminatı Tavanı:** 22.341,00 TL

**2. İhbar Tazminatı (İş Kanunu m.17)**

**Çalışma Süresine Göre:**
• **6 ay - 1.5 yıl:** 2 haftalık ücret
• **1.5 yıl - 3 yıl:** 4 haftalık ücret  
• **3 yıl +:** 6 haftalık ücret
• **Belirsiz süreli:** 8 haftalık ücret

**� Detaylı Hesaplama Örnekleri**

**Örnek 1: Orta Düzey Çalışan**
• **Maaş:** 18.000 TL (brüt)
• **Çalışma süresi:** 7 yıl
• **Kıdem:** 18.000 × 30 × 7 ÷ 365 = 10.356 TL
• **İhbar:** 18.000 × 8 hafta ÷ 4.33 = 33.256 TL
• **Toplam:** 43.612 TL

**Örnek 2: Üst Düzey Yönetici**
• **Maaş:** 35.000 TL (brüt)
• **Çalışma süresi:** 12 yıl
• **Kıdem:** 22.341 TL (tavan uygulanır)
• **İhbar:** 35.000 × 8 ÷ 4.33 = 64.665 TL
• **Toplam:** 87.006 TL

**⚖️ Ek Tazminat Hakları**

**3. Haksız Fesih Tazminatı**
• **Tutar:** 4-8 aylık brüt maaş
• **Şartlar:** Feshin geçerli sebebe dayanmaması
• **Süre:** Kıdeme göre artış gösterir

**4. Kullanılmayan Yıllık İzin**
• **Hesaplama:** (Günlük maaş × kullanılmayan gün sayısı)
• **Son 5 yıl:** Talep edilebilir
• **Zamanaşımı:** 5 yıl

**5. Fazla Mesai Alacakları**
• **Normal mesai üstü:** %50 zamlı
• **Hafta sonu/bayram:** %100 zamlı
• **Gece mesaisi:** %25 ek zam
• **Talep süresi:** Son 5 yıl

**6. Prim ve İkramiye Alacakları**
• **Performans primleri**
• **Yıllık ikramiyeler**
• **Sosyal yardımlar**

**📋 Hukuki Süreç ve Strateji**

**1. İş Mahkemesi Süreci**
• **Dava açma süresi:** İşten ayrılıştan itibaren 2 yıl
• **Zorunlu arabuluculuk:** 2024'ten itibaren mecburi
• **Ortalama süre:** 6-18 ay
• **Başarı oranı:** %70-80 (işçi lehine)

**2. Delil ve Belge Toplama**
✅ İş sözleşmesi
✅ Maaş bordroları (tüm çalışma dönemi)
✅ Mesai kayıtları/pdks çıktıları
✅ E-mail kayıtları
✅ Tanık ifadeleri (iş arkadaşları)
✅ İşten çıkarılma belgesi

**⚠️ Kritik Zamanaşımı Süreleri**
• **Kıdem-ihbar tazminatı:** 2 yıl
• **Fazla mesai:** 5 yıl  
• **Yıllık izin:** 5 yıl
• **İş kazası tazminatı:** 2 yıl
• **Mobbing tazminatı:** 2 yıl

**💡 Profesyonel Taktikler**

**İşten Ayrılmadan Önce:**
• Tüm yazışmaları kaydetmek
• Tanık listesi hazırlamak
• Fazla mesai kanıtlarını toplamak
• Sağlık raporları almak (varsa)

**Arabuluculuk Aşamasında:**
• Gerçekçi teklif yapmak
• Taksitli ödeme kabul etmek
• Vergi avantajlarını değerlendirmek

**🎯 Size Özel Değerlendirme**

1. **Kaç yıl çalıştınız?** (kıdem tazminatı hakkı)
2. **Son brüt maaşınız neydi?** (hesaplama için)
3. **İşten çıkarılma sebebi neydi?** (haksız fesih analizi)
4. **Fazla mesai yaptınız mı?** (ek alacaklar)
5. **Kullanmadığınız izin var mı?** (izin alacağı)
6. **İş kazası geçirdiniz mi?** (ayrı tazminat hakları)

Bu bilgileri paylaşırsanız, size özel detaylı tazminat hesaplaması ve hukuki strateji hazırlayabilirim.`;
  }

  // Genel hukuk konuları için
  return `## ⚖️ Hukuki Analiz ve Çözüm Önerileri

**🔍 Durumunuzun Analizi:**
${a.intent ? `Talebin ana konusu: ${a.intent}` : 'Hukuki durumunuz değerlendiriliyor...'}

**📋 Genel Öneriler:**
1. **Delil toplama aşaması** - Tüm belgeleri sistemli organize edin
2. **Hukuki süreç planlaması** - Zamanaşımı sürelerine dikkat
3. **Profesyonel destek** - Uzman avukat konsültasyonu
4. **Maliyet analizi** - Harç, vekalet ücreti, diğer giderler

**⏰ Zamanaşımı Uyarısı:**
Çoğu hukuki hak için 2-5 yıllık zamanaşımı süreleri var. Gecikmeden harekete geçmeniz önemli.

**💡 Özel Tavsiye:**
Durumunuzu daha detaylı anlatırsanız, size özel analiz ve çözüm önerileri sunabilirim.

**📞 Acil Durumlar:**
• Zamanaşımı yaklaşıyorsa hemen harekete geçin
• Önemli belgeler kaybolmasın
• Tanık ifadeleri zamanında alın

Hangi konuda daha detaylı bilgi istiyorsunuz?`;
};

const generateGeminiResponse = (analysis: QuestionAnalysis, query: string): string => {
  const a = analysis;
  const lowQ = query.toLowerCase();
  
  // Gemini tarzı daha kısa, pratik, emojili cevaplar
  if (a.category === 'divorce') {
    return `**🏃‍♀️ Hızlı Boşanma Rehberi**

💡 **En pratik yol:** Anlaşmalı boşanma
⏰ **Süre:** 2-4 ay
💰 **Maliyet:** 3.000-6.000 TL

**📝 Checklist:**
✅ Evlilik cüzdanı
✅ Gelir belgesi  
✅ Mal beyanı
✅ Çocuk bilgileri (varsa)

**💰 Nafaka hesabı:**
• Tedbir: Gelirin %20-40'ı
• Sürekli: Yaşam standardına göre
• Çocuk: Her çocuk için %15-25

**🚀 Hızlı başlangıç:**
1. Belgeleri topla (1 hafta)
2. Avukat bul (uzmanlaşmış)
3. Dilekçe hazırla
4. Mahkemeye başvur

**⚠️ Önemli noktalar:**
• Anlaşmazlık varsa süre uzar (1-3 yıl)
• Şiddet varsa acil tedbir kararı alın
• Çocuk varsa velayet planı yapın

**💬 Sık sorulan:**
"Nafaka ne kadar?" → Gelire göre %20-40
"Süre ne kadar?" → Anlaşmalı 2-4 ay, çekişmeli 1-3 yıl
"Maliyet ne kadar?" → 3K-30K TL arası

Hangi noktada yardım istiyorsunuz? Size pratik çözüm önerelim! 💪`;
  }

  if (a.category === 'traffic') {
    return `**🚗 Trafik Kazası - Hızlı Çözüm**

🎯 **İlk 24 saat critical:**
✅ Kaza tutanağı al
✅ Hastane git (rapor al)
✅ Araç fotoğrafları çek
✅ Tanık bilgileri topla

💰 **Tazminat hesabı:**
• Araç hasarı: Ekspertiz tutarı
• Tedavi: Tüm faturalar
• İş kaybı: Günlük maaş × gün
• Manevi: 15K-100K TL

**⏰ Zamanaşımı:**
• Sigorta: 2 yıl ⚠️
• Mahkeme: 5 yıl
• Delil toplama: Hemen!

**🔥 Pro tips:**
- Sigortanın ilk teklifini kabul etme
- Bağımsız ekspertiz yaptır
- Avukatla git (daha yüksek teklif)

**💡 Hızlı hesaplama:**
Hafif yaralanma: 15-35K TL
Orta yaralanma: 35-75K TL
Ağır yaralanma: 75K+ TL

**🚨 Yaygın hatalar:**
❌ Kaza yerinden kaçmak
❌ Polisi çağırmamak  
❌ İlk teklifi kabul etmek
❌ Belge toplamamak

Kazanın detaylarını anlatın, size tam hesap yapalım! 💪`;
  }

  if (a.category === 'work') {
    return `**💼 İş Hakları - Hızlı Hesap**

🎯 **Temel haklar:**
💰 Kıdem: 30 günlük maaş × yıl (2+ yıl gerekli)
💰 İhbar: 2-8 haftalık maaş (süreye göre)
💰 Haksız fesih: 4-8 aylık maaş

**⚡ Hızlı hesaplama:**
Maaşınız: ___ TL
Çalışma süresi: ___ yıl
➡️ Kıdem tazminatı: Maaş × 30 × yıl ÷ 365

**📋 Ek haklar:**
✅ Kullanılmayan izin (son 5 yıl)
✅ Fazla mesai (%50 zamlı)
✅ Prim/ikramiye alacakları

**⚠️ Zamanaşımı:** 2 yıl (acele et!)

**🚀 Next steps:**
1. Belgeleri topla (bordro, mesai kayıtları)
2. Hesaplama yap
3. Arabuluculuk dene
4. Gerekirse dava aç

**💡 Örnek hesaplama:**
15K maaş × 5 yıl çalışma = 61K TL kıdem + ihbar

**🎯 Kritik sorular:**
• Kaç yıl çalıştınız?
• Son maaşınız ne kadardı?
• Neden işten çıkarıldınız?
• Fazla mesai var mı?

Maaşınızı ve çalışma sürenizi söyleyin, size tam hesap yapalım! 🧮`;
  }

  // Genel konular
  return `**⚖️ Hukuki Destek**

🔍 **Durumunuz:** ${a.intent || 'Analiz ediliyor...'}

**🎯 Hızlı çözüm:**
1. Belge topla 📄
2. Hukuki analiz yap ⚖️  
3. Strateji belirle 🎯
4. Harekete geç 🚀

**⏰ Zamanaşımı uyarısı:** Çoğu hak için 2-5 yıl süre var!

**💡 Size özel:**
• Durumunuzu detaylandırın
• Belgelerinizi hazırlayın
• Profesyonel destek alın

**🔥 Acil durumlar:**
- Zamanaşımı yaklaşıyorsa hemen harekete geç
- Önemli belgeleri kaybet
- Tanık ifadelerini zamanında al

Durumunuzu detaylandırın, size özel çözüm önerelim! 💪`;

};

export default function LegalAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 'welcome', role: 'assistant', content: '👋 **Merhaba! Ben hukuk asistanınızım.**\n\nNormal sohbet edebiliriz! 😊 Hukuki konularda sorular sorduğunuzda ise size detaylı analiz yapabilirim.\n\n💡 **Hukuki soru örnekleri:**\n• "Boşanma davası nasıl açılır?"\n• "Trafik kazasında tazminat alabilir miyim?"\n• "İşten haksız çıkarıldım, haklarım neler?"\n\nNasılsın? 😊', timestamp: new Date().toISOString(), model: 'auto' }]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState<Model>('auto');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // AI Services initialization
  useEffect(() => {
    // Gemini'yi başlat - hardcoded API key
    const geminiApiKey = 'AIzaSyDeNAudg6oWG3JLwTXYXGhdspVDrDPGAyk';
    if (geminiApiKey) {
      try {
        geminiService.initialize(geminiApiKey);
        console.log('✅ Gemini servisi başlatıldı:', geminiApiKey.substring(0, 10) + '...');
      } catch (error) {
        console.error('❌ Gemini başlatma hatası:', error);
      }
    }
    
    // OpenAI'yi başlat - environment variable'dan otomatik al
    const envOpenaiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY || '';
    if (envOpenaiKey) {
      try {
        openaiService.initialize(envOpenaiKey);
        console.log('✅ OpenAI servisi başlatıldı:', envOpenaiKey.substring(0, 10) + '...');
      } catch (error) {
        console.error('❌ OpenAI başlatma hatası:', error);
      }
    }
    
    // Servis durumlarını kontrol et
    console.log('🔍 AI Servis Durumları:');
    console.log('  - Gemini:', geminiService.isInitialized() ? '✅ Aktif' : '❌ Pasif');
    console.log('  - OpenAI:', openaiService.isInitialized() ? '✅ Aktif' : '❌ Pasif');
  }, []);

  // Dikte hook'u
  const {
    isListening: isDictating,
    isSupported: isDictationSupported,
    interimText: dictationInterimText,
    error: dictationError,
    startDictation,
    stopDictation,
    clearDictation
  } = useDictation({
    onResult: (text) => {
      setInput(prev => prev + (prev ? ' ' : '') + text);
      clearDictation();
    },
    onError: (error) => {
      console.error('Dikte hatası:', error);
    },
    continuous: false,
    interimResults: true
  });

  const clearChat = () => setMessages([{ id: 'welcome', role: 'assistant', content: '🔄 **Sohbet temizlendi!**\n\nMerhaba! Ben hukuk asistanınızım. Normal sohbet edebiliriz! 😊', timestamp: new Date().toISOString(), model: 'auto' }]);

  const send = async () => {
    if (!input.trim() || loading) return; 
    const q = input.trim(); 
    setInput('');
    const userMsg: ChatMessage = { id: 'u-' + Date.now(), role: 'user', content: q, timestamp: new Date().toISOString() };
    setMessages(m => [...m, userMsg]); 
    setLoading(true);
    const tid = 't-' + Date.now(); 
    setMessages(m => [...m, { id: tid, role: 'assistant', content: '🤔 Düşünüyorum...', timestamp: new Date().toISOString(), model: 'auto' }]);
    
    try {
      // Önce sorunun hukuki olup olmadığını kontrol et
      const analysis = analyze(q);
      const isLegalQuestion = analysis.category !== 'general' || 
        q.toLowerCase().includes('hukuk') || 
        q.toLowerCase().includes('avukat') || 
        q.toLowerCase().includes('dava') || 
        q.toLowerCase().includes('mahkeme') ||
        q.toLowerCase().includes('tazminat') ||
        q.toLowerCase().includes('sözleşme') ||
        q.toLowerCase().includes('boşanma') ||
        q.toLowerCase().includes('miras') ||
        q.toLowerCase().includes('iş hukuku') ||
        q.toLowerCase().includes('ceza') ||
        q.toLowerCase().includes('trafik') ||
        q.toLowerCase().includes('kira') ||
        q.toLowerCase().includes('borç') ||
        q.toLowerCase().includes('alacak');
      
      let response: AIResponse;
      
      if (!isLegalQuestion) {
        // Hukuki olmayan sorular için doğal sohbet
        let casualResponse = '';
        
        // Son mesajları kontrol et (sohbet geçmişi)
        const lastMessages = messages.slice(-3); // Son 3 mesajı al
        const lastUserMessage = lastMessages.find(m => m.role === 'user')?.content.toLowerCase() || '';
        
        // Kullanıcının cevabına göre uygun yanıt seç
        if (q.toLowerCase().includes('iyiyim') || q.toLowerCase().includes('iyi') || q.toLowerCase().includes('güzel')) {
          if (lastUserMessage.includes('nasıl') || lastUserMessage.includes('nasılsın')) {
            casualResponse = "Harika! 😊 Ben de iyiyim teşekkürler!";
          } else {
            casualResponse = "Güzel! 😄 Ben de iyiyim.";
          }
        } else if (q.toLowerCase().includes('allah') || q.toLowerCase().includes('şükür')) {
          casualResponse = "Allah razı olsun! 😊 Ben de şükürler olsun iyiyim.";
        } else if (q.toLowerCase().includes('nasıl') && q.toLowerCase().includes('sın')) {
          casualResponse = "İyiyim teşekkürler! 😊 Sen nasılsın?";
        } else if (q.toLowerCase().includes('ne yapıyor') || q.toLowerCase().includes('ne yapıyorsun')) {
          casualResponse = "Çalışıyorum biraz, hukuki konularda yardım ediyorum. Sen ne yapıyorsun? 😊";
        } else if (q.toLowerCase().includes('hayat') || q.toLowerCase().includes('nasıl gidiyor')) {
          casualResponse = "Hayat güzel gidiyor! 😄 Sen nasıl gidiyor?";
        } else if (q.toLowerCase().includes('merhaba') || q.toLowerCase().includes('selam')) {
          casualResponse = "Merhaba! 👋 İyiyim, sen nasılsın?";
        } else if (q.toLowerCase().includes('teşekkür') || q.toLowerCase().includes('sağol')) {
          casualResponse = "Rica ederim! 😊 Başka bir şey var mı?";
        } else if (q.toLowerCase().includes('evet') || q.toLowerCase().includes('hayır')) {
          casualResponse = "Anladım! 😊 Başka sorun var mı?";
        } else if (q.toLowerCase().includes('tamam') || q.toLowerCase().includes('ok')) {
          casualResponse = "Tamam! 😊 Başka bir şey lazım mı?";
        } else if (q.toLowerCase().includes('hukuk') || q.toLowerCase().includes('avukat') || q.toLowerCase().includes('dava')) {
          // Hukuki konuya geçiş
          casualResponse = "Ah hukuki bir konu mu? 😊 O zaman size detaylı analiz yapabilirim! Sorunuz nedir?";
        } else {
          // Genel yanıtlar - daha çeşitli ve kısa
          const generalResponses = [
            "Anladım! 😊",
            "Güzel! 😄", 
            "Harika! 👋",
            "Tamam! 😊",
            "İyi! 😄",
            "Güzel gidiyor! 😊",
            "Anladım, teşekkürler! 😊",
            "Güzel, devam edelim! 😄",
            "Tabii! 😊",
            "Elbette! 😄"
          ];
          casualResponse = generalResponses[Math.floor(Math.random() * generalResponses.length)];
        }
        
        response = { content: casualResponse, model: 'gemini', confidence: 0.9 };
        
      } else {
        // Hukuki sorular için AI yarışması
        if (model === 'auto') {
          const promises = [];
          
          if (geminiService.isInitialized()) {
            promises.push(
              geminiService.analyzeText('Hukuki soru', q)
                .then(result => ({ type: 'gemini', result, confidence: 0.9 }))
                .catch(error => ({ type: 'gemini', result: `Gemini hatası: ${error.message}`, confidence: 0.1 }))
            );
          }
          
          if (openaiService.isInitialized()) {
            promises.push(
              openaiService.generateContract({
                contractType: 'Hukuki Danışmanlık',
                description: q,
                requirements: ['Hukuki analiz'],
                parties: ['Danışan'],
                additionalInfo: 'Bu bir hukuki soru. Detaylı analiz ve öneriler sun.'
              })
              .then(result => ({ type: 'openai', result, confidence: 0.9 }))
              .catch(error => ({ type: 'openai', result: `OpenAI hatası: ${error.message}`, confidence: 0.1 }))
            );
          }
          
          if (promises.length === 0) {
            await new Promise(r => setTimeout(r, 340));
            response = chooseBest(q, analysis);
          } else {
            const results = await Promise.all(promises);
            
            let bestResult = '';
            let bestModel: 'gpt-4' | 'gemini' = 'gpt-4';
            let bestConfidence = 0;
            let bestLength = 0;
            
            results.forEach(result => {
              const lengthScore = result.result.length;
              const qualityScore = result.confidence;
              const totalScore = lengthScore * 0.3 + qualityScore * 0.7;
              
              if (totalScore > bestConfidence || (totalScore === bestConfidence && lengthScore > bestLength)) {
                bestResult = result.result;
                bestModel = result.type === 'gemini' ? 'gemini' : 'gpt-4';
                bestConfidence = totalScore;
                bestLength = lengthScore;
              }
            });
            
            const sources = [
              `📚 **Kaynak:** ${bestModel === 'gemini' ? 'Google Gemini AI' : 'OpenAI GPT-4'}`,
              `🎯 **Güven Skoru:** ${Math.round(bestConfidence * 100)}%`,
              `📊 **Yanıt Uzunluğu:** ${bestLength} karakter`,
              `⚖️ **Hukuki Kategori:** ${analysis.category}`,
              `🔍 **Analiz:** ${analysis.isUrgent ? 'Acil' : 'Normal'} - ${analysis.complexity === 3 ? 'Karmaşık' : analysis.complexity === 2 ? 'Orta' : 'Basit'}`
            ];
            
            response = { 
              content: `${bestResult}\n\n---\n\n**🏆 Yarışma Sonucu:**\n${sources.join('\n')}`, 
              model: bestModel, 
              confidence: bestConfidence 
            };
          }
        } else {
          // Belirli model seçimi
          if (model === 'gemini' && geminiService.isInitialized()) {
            const result = await geminiService.analyzeText('Hukuki soru', q);
            response = { content: result, model: 'gemini', confidence: 0.9 };
          } else if (model === 'gpt-4' && openaiService.isInitialized()) {
            const result = await openaiService.generateContract({
              contractType: 'Hukuki Danışmanlık',
              description: q,
              requirements: ['Hukuki analiz'],
              parties: ['Danışan'],
              additionalInfo: 'Bu bir hukuki soru. Detaylı analiz ve öneriler sun.'
            });
            response = { content: result, model: 'gpt-4', confidence: 0.9 };
          } else {
            await new Promise(r => setTimeout(r, 340));
            response = { content: buildAnswer(q, model, analysis), model: model === 'auto' ? 'gpt-4' : model, confidence: 0.9 };
          }
        }
      }
      
      setMessages(m => m.filter(x => x.id !== tid).concat({ 
        id: 'a-' + Date.now(), 
        role: 'assistant', 
        content: response.content, 
        timestamp: new Date().toISOString(), 
        model, 
        actualModel: response.model, 
        confidence: response.confidence 
      }));
      
    } catch (error) {
      console.error('Chat hatası:', error);
      setMessages(m => m.filter(x => x.id !== tid).concat({ 
        id: 'err-' + Date.now(), 
        role: 'assistant', 
        content: '❌ **Üzgünüm, bir teknik sorun oluştu.**\n\nLütfen sorunuzu tekrar yazarmısınız? Size yardımcı olmak istiyorum.', 
        timestamp: new Date().toISOString(), 
        model: 'auto', 
        isError: true 
      }));
    } finally { 
      setLoading(false); 
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  const copyText = (t: string) => navigator.clipboard?.writeText(t).catch(() => {});
  const feedback = (id: string, f: 'positive' | 'negative') => setMessages(ms => ms.map(m => m.id === id ? { ...m, feedback: f } : m));

  return (
    <div className="flex flex-col h-full border border-gray-200 dark:border-gray-700 rounded-lg md:rounded-xl bg-white dark:bg-gray-900 overflow-hidden shadow-lg">
      {/* Ultra Modern Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-3 md:px-6 py-3 md:py-5 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Bot className="w-7 h-7 text-white" />
        </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  🏆 AI Yarışma Arenası
                  <span className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold animate-pulse">
                    CANLI
                  </span>
                </h3>
                <p className="text-purple-100 text-sm font-medium">Gemini vs OpenAI - En iyi cevap kazanır!</p>
      </div>
            </div>
            <div className="flex items-center gap-3">
              <select 
                aria-label="Model seçimi" 
                value={model} 
                onChange={e => setModel(e.target.value as Model)} 
                className="text-sm border border-white/30 rounded-xl px-4 py-2 bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm font-medium"
              >
                <option value="auto" className="text-gray-900">🤖 Otomatik Yarışma</option>
                <option value="gpt-4" className="text-gray-900">⚡ Sadece GPT-4</option>
                <option value="gemini" className="text-gray-900">✨ Sadece Gemini</option>
              </select>
              <button 
                onClick={clearChat} 
                className="p-3 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/30" 
                title="Sohbeti Temizle"
              >
                <Trash2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          
          {/* AI Status Cards */}
          <div className="mt-3 md:mt-4 flex flex-wrap items-center gap-2 md:gap-4">
            <div className={`flex items-center gap-2 md:gap-3 px-2 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl backdrop-blur-sm border ${geminiService.isInitialized() ? 'bg-green-500/20 border-green-400/50' : 'bg-red-500/20 border-red-400/50'}`}>
              <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${geminiService.isInitialized() ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-xs md:text-sm text-white font-medium">
                ✨ Gemini: {geminiService.isInitialized() ? 'Aktif' : 'Pasif'}
              </span>
            </div>
            <div className={`flex items-center gap-2 md:gap-3 px-2 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl backdrop-blur-sm border ${openaiService.isInitialized() ? 'bg-green-500/20 border-green-400/50' : 'bg-red-500/20 border-red-400/50'}`}>
              <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${openaiService.isInitialized() ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-xs md:text-sm text-white font-medium">
                ⚡ OpenAI: {openaiService.isInitialized() ? 'Aktif' : 'Pasif'}
              </span>
            </div>
            <div className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-yellow-500/20 border border-yellow-400/50 rounded-lg md:rounded-xl backdrop-blur-sm">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-xs md:text-sm text-white font-medium">🏆 Yarışma Aktif</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-full md:max-w-4xl rounded-xl md:rounded-2xl px-3 md:px-6 py-3 md:py-5 text-xs md:text-sm ${msg.role === 'user' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl' : msg.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-sm'}`}>
              {msg.role === 'assistant' && (msg.actualModel || msg.model) && !msg.isError && (
                <div className="mb-4 flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 border border-green-200 dark:border-green-700">
                    <div className={`w-3 h-3 rounded-full ${(msg.actualModel || msg.model) === 'gpt-4' ? 'bg-blue-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></div>
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      {(msg.actualModel || msg.model) === 'gpt-4' ? '⚡ OpenAI GPT-4' : (msg.actualModel || msg.model) === 'gemini' ? '✨ Google Gemini' : '🤖 AI'}
                    </span>
                    {msg.model === 'auto' && msg.actualModel && (
                      <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 rounded-full text-xs font-bold animate-pulse">
                        🏆 KAZANDI
                      </span>
                    )}
                    {msg.confidence && (
                      <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                        {Math.round(msg.confidence * 100)}% Güven
                      </span>
                    )}
                  </div>
                </div>
              )}
              <ReactMarkdown className="prose prose-sm max-w-none dark:prose-invert">
                {msg.content}
              </ReactMarkdown>
              {msg.role === 'assistant' && !msg.isError && (
                <div className="mt-4 flex items-center gap-3 text-xs">
                  <button 
                    onClick={() => copyText(msg.content)} 
                    className="flex items-center gap-1 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" 
                    title="Kopyala"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Kopyala</span>
                  </button>
                  <button 
                    onClick={() => feedback(msg.id, 'positive')} 
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${msg.feedback === 'positive' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`} 
                    title="Beğen"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Beğen</span>
                  </button>
                  <button 
                    onClick={() => feedback(msg.id, 'negative')} 
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${msg.feedback === 'negative' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`} 
                    title="Beğenme"
                  >
                    <ThumbsDown className="w-3 h-3" />
                    <span>Beğenme</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 py-6">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span className="font-medium">🏆 AI'lar yarışıyor... En iyi cevabı hazırlıyorlar</span>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 md:p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
          <textarea 
            value={input + (dictationInterimText ? ' ' + dictationInterimText : '')} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={onKeyDown} 
            rows={2} 
            placeholder="🏆 Hukuki sorunuzu detaylı yazın... AI'lar yarışacak ve en iyi cevabı verecek!" 
            className="flex-1 text-xs md:text-sm p-3 md:p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl md:rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all duration-300 shadow-lg" 
            disabled={loading} 
          />
          <div className="flex flex-row sm:flex-col gap-2 md:gap-3">
            <DictationButton
              isListening={isDictating}
              isSupported={isDictationSupported}
              onStart={startDictation}
              onStop={stopDictation}
              size="md"
              title="Sesli yazım"
            />
            <button 
              onClick={send} 
              disabled={loading || !input.trim()} 
              className="px-4 md:px-8 py-2 md:py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl md:rounded-2xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 md:gap-3 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>🏆 Yarışıyor...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Gönder</span>
                </>
              )}
            </button>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center font-medium">🏆 AI'lar yarışıyor! En iyi cevap otomatik seçiliyor • ⚖️ Bu yanıtlar bilgilendirme amaçlıdır, bağlayıcı hukuki görüş değildir</p>
      </div>
    </div>
  );
}

// END OF FILE (integrity marker)