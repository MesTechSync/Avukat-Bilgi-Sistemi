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
import { 
  realPetitions,
  searchPetitionsByCategory,
  searchPetitionsByKeyword 
} from '../data/realPetitions';

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
   - SMS mesajları, e-postalar (yemin karşılığı)
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

interface LegalAssistantChatProps {
  onNavigate?: (tab: string) => void;
}

export default function LegalAssistantChat({ onNavigate }: LegalAssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 'welcome', role: 'assistant', content: '👋 **Merhaba! SonKarar AI Hukuk Asistanınız burada.**\n\nHukuki sorunlarınızda size pratik ve detaylı bilgiler verebilirim. Sadece sorunuzu yazın:\n\n💡 **Örnek sorular:**\n• "Boşanma davası nasıl açılır, ne kadar sürer?"\n• "Trafik kazasında 50.000 TL tazminat alabilir miyim?"\n• "İşten haksız çıkarıldım, ne kadar hakım var?"\n\nSorunuzu ne kadar detaylı yazarsanız, size o kadar spesifik bilgi verebilirim.', timestamp: new Date().toISOString(), model: 'auto' }]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState<Model>('auto');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const clearChat = () => setMessages([{ id: 'welcome', role: 'assistant', content: '🔄 **Sohbet temizlendi!**\n\nYeni bir hukuki soru sorabilirsiniz. Size en detaylı şekilde yardımcı olmaya çalışacağım.', timestamp: new Date().toISOString(), model: 'auto' }]);

  const send = async () => {
    if (!input.trim() || loading) return; const q = input.trim(); setInput('');
    const userMsg: ChatMessage = { id: 'u-' + Date.now(), role: 'user', content: q, timestamp: new Date().toISOString() };
    setMessages(m => [...m, userMsg]); setLoading(true);
    const tid = 't-' + Date.now(); setMessages(m => [...m, { id: tid, role: 'assistant', content: '🤔 Sorunuzu analiz ediyorum ve size en faydalı bilgiyi hazırlıyorum...', timestamp: new Date().toISOString(), model: 'auto' }]);
    try {
      await new Promise(r => setTimeout(r, 340));
      const analysis = analyze(q);
      const ans = model === 'auto' ? chooseBest(q, analysis) : { content: buildAnswer(q, model, analysis), model: model === 'auto' ? 'gpt-4' : model, confidence: 0.9 } as AIResponse;
      setMessages(m => m.filter(x => x.id !== tid).concat({ id: 'a-' + Date.now(), role: 'assistant', content: ans.content, timestamp: new Date().toISOString(), model, actualModel: ans.model, confidence: ans.confidence }));
    } catch {
      setMessages(m => m.filter(x => x.id !== tid).concat({ id: 'err-' + Date.now(), role: 'assistant', content: '❌ **Üzgünüm, bir teknik sorun oluştu.**\n\nLütfen sorunuzu tekrar yazarmısınız? Size yardımcı olmak istiyorum.', timestamp: new Date().toISOString(), model: 'auto', isError: true }));
    } finally { setLoading(false); }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  const copyText = (t: string) => navigator.clipboard?.writeText(t).catch(() => {});
  const feedback = (id: string, f: 'positive' | 'negative') => setMessages(ms => ms.map(m => m.id === id ? { ...m, feedback: f } : m));

  return (
    <div className="flex flex-col h-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-3"><Bot className="w-6 h-6 text-blue-600" /><div><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">SonKarar AI Hukuk</h3><p className="text-xs text-gray-500 dark:text-gray-400">Genel ön bilgi sağlar</p></div></div>
        <div className="flex items-center gap-2">
          <select aria-label="Model seçimi" value={model} onChange={e => setModel(e.target.value as Model)} className="text-xs border rounded px-2 py-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"><option value="auto">🤖 Otomatik</option><option value="gpt-4">⚡ GPT-4</option><option value="gemini">✨ Gemini</option></select>
          <button onClick={clearChat} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" title="Temizle"><Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-300" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white' : msg.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700'}`}>
              {msg.role === 'assistant' && (msg.actualModel || msg.model) && !msg.isError && (
                <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wide opacity-70">
                  {(msg.actualModel || msg.model) === 'gpt-4' ? 'GPT-4' : (msg.actualModel || msg.model) === 'gemini' ? 'GEMINI' : 'AI'}
                  {msg.model === 'auto' && msg.actualModel && <span className="px-1 bg-blue-200 text-blue-800 rounded">Auto</span>}
                  {msg.confidence && <span>{Math.round(msg.confidence * 100)}%</span>}
                </div>
              )}
              <ReactMarkdown>{msg.content}</ReactMarkdown>
              {msg.role === 'assistant' && !msg.isError && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <button onClick={() => copyText(msg.content)} className="p-1 hover:bg-white/40 rounded" title="Kopyala"><Copy className="w-3 h-3" /></button>
                  <button onClick={() => feedback(msg.id, 'positive')} className={`p-1 rounded ${msg.feedback === 'positive' ? 'bg-green-200 text-green-800' : 'hover:bg-white/40'}`} title="Beğen"><ThumbsUp className="w-3 h-3" /></button>
                  <button onClick={() => feedback(msg.id, 'negative')} className={`p-1 rounded ${msg.feedback === 'negative' ? 'bg-red-200 text-red-800' : 'hover:bg-white/40'}`} title="Beğenme"><ThumbsDown className="w-3 h-3" /></button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="flex items-center gap-2 text-xs text-gray-500"><Zap className="w-4 h-4 animate-pulse text-blue-500" /><span>Hazırlanıyor...</span></div>}
        <div ref={endRef} />
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="flex gap-3">
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown} rows={3} placeholder="Hukuki sorunuzu detaylı yazın... Örn: 'Boşanma davası açmak istiyorum, eşimle anlaşamıyoruz, çocuk var, ne yapmalıyım?'" className="flex-1 text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" disabled={loading} />
          <button onClick={send} disabled={!input.trim() || loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2 text-sm font-medium"><Send className="w-4 h-4" /> Gönder</button>
        </div>
        <p className="mt-2 text-[10px] text-gray-500 dark:text-gray-400">⚖️ Bu yanıtlar bilgilendirme amaçlıdır, bağlayıcı hukuki görüş değildir. Kesin bilgi için avukata başvurun.</p>
      </div>
    </div>
  );
}

// END OF FILE (integrity marker)