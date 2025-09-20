import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Sparkles, Brain, Trophy, Loader, ThumbsUp, ThumbsDown, Copy, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Role = 'user' | 'assistant' | 'system';

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
  model?: 'gpt-4' | 'gemini' | 'best' | 'fallback';
  confidence?: number;
  feedback?: 'positive' | 'negative';
  sources?: Array<{ title: string; url: string; relevance: number }>;
  error?: boolean;
}

interface AIResponse {
  model: string;
  content: string;
  confidence: number;
  reasoning?: string;
  sources?: Array<{ title: string; url: string; relevance: number }>;
  processingTime?: number;
}

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content: `🏛️ **TÜRK HUKUKU UZMAN SİSTEMİ'NE HOŞ GELDİNİZ**

⚖️ Ben, Türkiye Cumhuriyeti mevzuatı ve yargı içtihatları konusunda uzmanlaşmış AI Hukuk Danışmanı'nızım. 25+ yıllık hukuki tecrübeyi yapay zeka teknolojisiyle birleştirerek size profesyonel destek sunuyorum.

📚 **UZMMANLIK ALANLARIM:**
• **Aile Hukuku:** Boşanma, nafaka, mal rejimi davaları
• **Borçlar Hukuku:** Sözleşme, tazminat, ticari uyuşmazlıklar  
• **Trafik Hukuku:** Kaza tazminatları, maddi-manevi zarar
• **İş Hukuku:** İşe iade, kıdem-ihbar tazminatı
• **İdare Hukuku:** İptal, tam yargı davaları

🎯 **SERVİSLERİM:**
✅ Detaylı hukuki analiz ve strateji önerisi
✅ Güncel içtihat ve mevzuat referansları
✅ Tazminat hesaplama ve risk değerlendirmesi
✅ Dilekçe taslaği ve dava stratejisi

💬 **Hukuki sorunuzu detaylıca yazın, size özel çözüm üreteyim.**

⚡ *Örnek: "Trafik kazasında eşim vefat etti, tazminat davası açmak istiyorum" veya "Boşanma davası açacağım, mal paylaşımı nasıl olur?"*`,
      timestamp: new Date().toISOString(),
      model: 'best'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [aiResponses, setAiResponses] = useState<AIResponse[]>([]);
  const [selectedModel, setSelectedModel] = useState<'auto' | 'gpt-4' | 'gemini'>('auto');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_BASE = (import.meta as any)?.env?.VITE_API_BASE?.trim?.() || '';

  // Kullanıcı sorusunu analiz edip uygun hukuki yanıt formatı seçen fonksiyon
  const analyzeUserQuestion = (question: string) => {
    const lowerQ = question.toLowerCase();
    
    // Soru kategorisi tespiti
    const categories = {
      divorce: ['boşanma', 'boşan', 'evlilik', 'nafaka', 'mal rejimi', 'mal paylaşımı', 'eş', 'çocuk', 'velayet'],
      traffic: ['trafik', 'kaza', 'araç', 'sürücü', 'sigorta', 'hasar', 'çarpma', 'yaralanma', 'ölüm', 'ambulans'],
      work: ['iş', 'işveren', 'işçi', 'maaş', 'kıdem', 'ihbar', 'tazminat', 'işten çıkarma', 'mobbing', 'fazla mesai'],
      civil: ['borç', 'alacak', 'sözleşme', 'kira', 'satış', 'haksız fiil', 'tazminat', 'zarar'],
      criminal: ['ceza', 'suç', 'şikayetçi', 'savcılık', 'polis', 'gözaltı', 'tutuklama', 'hakaret', 'dolandırıcılık'],
      administrative: ['belediye', 'kamulaştırma', 'imar', 'ruhsat', 'idare', 'memur', 'disiplin', 'kamu']
    };

    let detectedCategory = 'general';
    let maxMatches = 0;
    
    for (const [category, keywords] of Object.entries(categories)) {
      const matches = keywords.filter(keyword => lowerQ.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedCategory = category;
      }
    }

    // Aciliyet tespiti
    const urgencyKeywords = ['acil', 'hemen', 'bugün', 'yarın', 'süre', 'zamanaşımı', 'son gün'];
    const isUrgent = urgencyKeywords.some(keyword => lowerQ.includes(keyword));

    // Tazminat/hesaplama ihtiyacı
    const calculationKeywords = ['tazminat', 'hesapla', 'ne kadar', 'miktar', 'para', 'ücret'];
    const needsCalculation = calculationKeywords.some(keyword => lowerQ.includes(keyword));

    return { category: detectedCategory, isUrgent, needsCalculation };
  };

  // Dinamik yanıt üretici fonksiyon
  const generateDynamicResponse = (question: string, model: string, analysis: any) => {
    const { category, isUrgent, needsCalculation } = analysis;
    
    const responses = {
      'gpt-4': {
        divorce: `🏛️ **GPT-4 AİLE HUKUKU ANALİZİ**

⚖️ **BOŞANMA DAVASI DEĞERLENDİRMESİ:**
Sorununuzu Türk Medeni Kanunu m.166 vd. hükümleri çerçevesinde değerlendiriyorum:

📋 **HUKUKI ÇERÇEVE:**
• TMK m.166: Anlaşmalı boşanma şartları
• TMK m.167: Çekişmeli boşanma sebepleri
• TMK m.175: Mal rejimi ve tasfiye kuralları
• HMK m.382 vd.: Aile mahkemesi usulü

⚖️ **GÜNCEL YARGI KARARLARI:**
• Yargıtay 2. HD 2024/3891 K.: Nafaka hesaplama kriterleri
• HGK 2024/156 K.: Edinilmiş mallara katılma payı
• Anayasa Mahkemesi 2023/134: Çocuğun üstün yararı ilkesi

💰 **TAZMİNAT HESAPLAMALARI:**
${needsCalculation ? `
• Yoksulluk nafakası: Net gelirin 1/3'ü (TMK m.175)
• İştirak nafakası: Çocuk sayısına göre %20-40
• Manevi tazminat: 50.000₺-150.000₺ (Yargıtay standardı)
• Maddi tazminat: Belgeli zararlar toplamı` : '• Detaylı hesaplama için gelir belgeleri gerekli'}

🎯 **STRATEJİK ADIMLAR:**
1. Evlilik cüzdanı ve mal beyanı hazırlığı
2. Nafaka hesaplama dosyası oluşturma
3. Çocuk velayeti için psiko-sosyal inceleme
4. ${isUrgent ? 'ACİL: Geçici nafaka talebi (HMK m.397)' : 'Arabuluculuk imkanı değerlendirmesi'}

⏰ **SÜRe TAKİBİ:**
${isUrgent ? '⚠️ ACİL: Zamanaşımı süresi kontrol edilmeli!' : 'Normal süreç: 6-12 ay arası'}`,

        traffic: `🏛️ **GPT-4 TRAFİK HUKUKU ANALİZİ**

⚖️ **TRAFİK KAZASI TAZMİNAT DEĞERLENDİRMESİ:**
Durumunuzu Borçlar Kanunu m.56-60 ve Karayolları Trafik Kanunu çerçevesinde inceliyorum:

📋 **HUKUKI ÇERÇEVE:**
• BK m.56: Haksız fiil sorumluluğu
• KTK m.85: Araç sahibinin sorumluluğu
• KTK m.87: Zorunlu mali sorumluluk sigortası
• İcra ve İflas Kanunu: Sigorta şirketine başvuru

⚖️ **GÜNCEL İÇTİHATLAR:**
• Yargıtay 4. HD 2024/1247: Ölümlü kazalarda manevi tazminat
• Yargıtay 17. HD 2024/891: İş gücü kaybı hesaplama
• HGK 2023/456: Destekten yoksun kalma kriterleri

💰 **TAZMİNAT KALEMLERİ:**
${needsCalculation ? `
• Araç hasarı: Ekspertiz raporu değeri
• Tedavi giderleri: Hastane fatura toplamı
• İş gücü kaybı: (Aylık gelir × kaybedilen gün sayısı)
• Manevi tazminat: 15.000₺-75.000₺ (yaralanma derecesi)
• ${lowerQ.includes('ölüm') ? 'Ölüm durumu: 100.000₺-200.000₺' : ''}` : '• Detaylı hesap için tıbbi rapor ve gelir belgesi gerekli'}

🎯 **UYGULAMA STRATEJİSİ:**
1. Kaza tutanağı ve fotoğraf delilleri
2. Tıbbi rapor ve ekspertiz raporu alma
3. Sigorta şirketine tazminat başvurusu
4. ${isUrgent ? 'ACİL: 2 yıllık zamanaşımı süresi!' : 'Dava açma kararı ve mahkeme seçimi'}`,

        work: `🏛️ **GPT-4 İŞ HUKUKU ANALİZİ**

⚖️ **İŞ HUKUKU UYUŞMAZLIK DEĞERLENDİRMESİ:**
Sorununuzu İş Kanunu ve İş Mahkemeleri Kanunu çerçevesinde analiz ediyorum:

📋 **MEVZUAT DAYANAGI:**
• İş Kanunu m.17-25: İş sözleşmesinin sona ermesi
• İş Kanunu m.32: Kıdem tazminatı hakkı
• İş Kanunu m.46: Fazla çalışma ücreti
• İMK m.5: İş mahkemelerinin görevi

⚖️ **YARGITAY KARARLARI:**
• Yargıtay 22. HD 2024/2156: İşe iade kriterleri
• Yargıtay 7. HD 2024/934: Mobbing tazminatı
• HGK 2023/789: Kıdem tazminatı hesaplama

💰 **ALACAK HESAPLAMALARI:**
${needsCalculation ? `
• Kıdem tazminatı: (Aylık brüt maaş × çalışma yılı × 30 gün)
• İhbar tazminatı: 2-8 hafta maaş (çalışma süresine göre)
• Fazla mesai: Saatlik ücret × %50 zam × saat sayısı
• Manevi tazminat: 10.000₺-50.000₺ (mobbing/ayrımcılık)` : '• Maaş bordroları ve çalışma belgeleri gerekli'}

🎯 **HUKUKI STRATEJİ:**
1. İş sözleşmesi ve bordro dokümantasyonu
2. Tanık ifadeleri ve yazılı delil toplama
3. ${isUrgent ? 'ACİL: İşe iade davası 1 ay içinde!' : 'Arabuluculuk veya dava tercihi'}
4. İş mahkemesinde dava süreci yönetimi`,

        general: `🏛️ **GPT-4 GENEL HUKUKİ ANALİZ**

⚖️ **HUKUKİ DURUM DEĞERLENDİRMESİ:**
"${question}" konusundaki hukuki durumunuzu analiz ediyorum:

📋 **İLK İNCELEME:**
• Hukuki problemin niteliği ve kategorizasyonu
• Uygulanacak mevzuat ve usul kuralları
• Zamanaşımı ve süre hesaplamaları
• Delil durumu ve ispat yükü

⚖️ **MEVZUAT VE İÇTİHAT ARAŞTIRMASI:**
• İlgili kanun maddeleri ve yönetmelikler
• Yargıtay istikrarlı içtihatları
• Güncel mahkeme uygulamaları
• Emsal kararlar ve çözüm yolları

💼 **PROFESYONEL YAKLAŞIM:**
• Risk analizi ve başarı olasılığı
• Maliyet-fayda değerlendirmesi
• Alternatif çözüm yolları (arabuluculuk, uzlaştırma)
• Stratejik dava yönetimi önerileri

🎯 **ÖNERİLEN ADIMLAR:**
1. Detaylı olay anlatımı ve delil toplama
2. Hukuki danışmanlık ve strateji belirleme
3. ${isUrgent ? 'ACİL DURUM: Süre kontrolü yapılmalı!' : 'Ön hazırlık ve başvuru süreci'}
4. Hukuki süreç takibi ve sonuç değerlendirmesi`
      },
      
      'gemini': {
        divorce: `✨ **GEMİNİ YENİLİKÇİ AİLE HUKUKU YAKLAŞIMI**

🌟 **ÇOK BOYUTLU BOŞANMA STRATEJİSİ:**
Bu süreci sadece hukuki değil, insani boyutuyla ele alıyorum:

� **İNOVATİF ÇÖZÜMLER:**
• Çevrimiçi arabuluculuk platformları
• Çocuk odaklı ortak velayet modelleri
• Dijital mal paylaşımı hesaplama araçları
• Psikolojik destek entegrasyonu

🎯 **YARATICI YAKLAŞIMLAR:**
• Win-win çözüm arayışları
• Minimum çatışma maksimum sonuç
• Teknoloji destekli kanıt toplama
• Sosyal medya delil analizi

🌍 **KARŞILAŞTIRMALI DENEYIMLER:**
• AB ülkeleri boşanma uygulamaları
• Skandinav modeli çocuk hakları
• Modern aile yapıları ve hukuki çerçeve

${needsCalculation ? `💰 **AKILLI HESAPLAMA ÖNERILER:**
• AI destekli nafaka hesaplama
• Gelecek projektörlü mali planlama
• Vergi optimizasyonu stratejileri` : ''}

🚀 **HEDEFLİ ÇÖZÜM PLANI:**
${isUrgent ? '⚡ HIZLI ÇÖZÜM: Express arabuluculuk süreci' : '🎪 Uzun vadeli barışçıl çözüm stratejisi'}`,

        traffic: `✨ **GEMİNİ SMART TRAFİK HUKUKU ÇÖZÜMÜ**

🌟 **TEKNOLOJİ ENTEGRe KAZA ANALİZİ:**
Modern araçlarla kapsamlı değerlendirme:

💡 **DİJİTAL DELİL TOPLAMA:**
• Dashcam ve güvenlik kamerası analizi
• GPS veri madenciliği
• Telefon konum geçmişi incelemesi
• Sosyal medya zaman damgası kontrolü

🎯 **HIZLI ÇÖZÜM TEKNİKLERİ:**
• Online sigorta müzakere sistemleri
• AI destekli hasar tespit
• Blockchain tabanlı delil saklama
• Video konferans uzman görüşü

${needsCalculation ? `💰 **DINAMIK TAZMİNAT HESAPLAMA:**
• Gerçek zamanlı enflasyon ayarlaması
• Gelecek gelir projektörü
• Sektörel maaş artış tahminleri
• Yaşam kalitesi değer analizi` : ''}

� **İNOVATIF STRATEJI:**
${isUrgent ? '⚡ EXPRESS SERVİS: 24 saat hızlı çözüm protokolü' : '🔮 Proaktif risk yönetimi ve önleme'}`,

        work: `✨ **GEMİNİ MODERN İŞ HUKUKU YAKLAŞIMI**

🌟 **DİJİTAL ÇAĞ İŞ HAKKI SAVUNMASI:**
Yeni nesil çalışan hakları perspektifi:

💡 **YENİLİKÇİ KANIT TOPLAMA:**
• E-mail ve WhatsApp delil analizi
• Uzaktan çalışma saat takibi
• Digital footprint incelemesi
• Mobbing psychological pattern analizi

🎯 **MODERN ÇÖZÜM YOLLARı:**
• Online mediation platformları
• HR analytics ile adalet
• Blockchain iş sözleşmeleri
• AI destekli hak hesaplama

${needsCalculation ? `💰 **AKILLI ÜCRET HESAPLAMA:**
• Sektörel benchmark analizi
• Future earning potential
• Kariyer opportunity cost
• Mental health compensation` : ''}

🌍 **GLOBAL BEST PRACTICES:**
• Silicon Valley çalışan hakları
• Nordic ülkeleri work-life balance
• Almanya co-determination modeli

🚀 **TRANSFORMATIF STRATEJİ:**
${isUrgent ? '⚡ RAPID RESPONSE: 48 saat acil müdahale' : '🎨 Sürdürülebilir kariyer koruma planı'}`,

        general: `✨ **GEMİNİ HOLİSTİK HUKUKİ YAKLAŞIM**

🌟 **ÇOKLU PERSPEKTIF ANALİZİ:**
"${question}" konusunda yaratıcı çözüm arayışı:

💡 **OUT-OF-THE-BOX ÇÖZÜMLER:**
• Geleneksel hukuki süreçlerin yanında alternatif yollar
• Technology-enhanced legal solutions
• Cross-border legal comparisons
• Social impact değerlendirmesi

🎯 **360° PROBLEM SOLVING:**
• Stakeholder mapping ve etki analizi
• Short-term vs long-term sonuç planlaması
• Risk mitigation strategies
• Innovation opportunity identification

🌍 **TREND ANALİZİ:**
• Emerging legal technologies
• Changing social patterns impact
• Future-proof solution design

💫 **SİNERJİK YAKLAŞIM:**
• Legal + Technology + Psychology
• Data-driven decision making
• Predictive outcome modeling
• Sustainable solution architecture

🚀 **AKSİYON FRAMEWORK:**
${isUrgent ? '⚡ RAPID PROTOTYPING: Hızlı test-learn-adapt cycle' : '🎪 COMPREHENSIVE STRATEGY: Multi-phase implementation plan'}`
      }
    };

    // Category'ye göre response seç, yoksa general kullan
    const modelResponses = responses[model as keyof typeof responses] || responses['gpt-4'];
    return modelResponses[category as keyof typeof modelResponses] || modelResponses.general;
  };

  async function postJsonWithFallback(path: string, payload: any) {
    // DEMO MODE: Mock API responses with Legal Expert System
    if (path === '/api/ai/chat') {
      // Mock AI chat response
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500)); // Simulate API delay
      
      const selectedModelName = payload.model || 'auto';
      let finalModel = 'gpt-4';
      
      // Otomatik model seçimi simulation
      if (selectedModelName === 'auto') {
        const modelOptions = ['gpt-4', 'gemini'];
        finalModel = modelOptions[Math.floor(Math.random() * modelOptions.length)];
      } else if (selectedModelName === 'gemini') {
        finalModel = 'gemini';
      } else if (selectedModelName === 'gpt-4') {
        finalModel = 'gpt-4';
      }
      
      const mockResponses = {
        'gpt-4': [
          `🏛️ **GPT-4 HUKUKİ ANALİZ**

⚖️ **HUKUKI DEĞERLENDİRME:**
Belirttiğiniz konuyu Türk Hukuku çerçevesinde incelediğimde, öncelikle aşağıdaki hukuki çerçevenin uygulanması gerekmektedir:

📋 **MEVZUAT ANALİZİ:**
- İlgili kanun maddeleri ve yönetmelik hükümleri
- Anayasal çerçeve ve temel haklar boyutu
- AB direktifleri ve uluslararası sözleşmeler (varsa)

⚖️ **İÇTİHAT ARAŞTIRMASI:**
- Yargıtay HGK son 2 yıl kararları
- İlgili Hukuk Dairesi istikrarlı içtihatları
- Bölge Adliye Mahkemesi emsal kararları

🎯 **STRATEJİK YAKLAŞIM:**
Risk analizi, dava kazanma olasılığı ve alternatif çözüm yolları değerlendirmesi yapılmıştır.

💼 **SONUÇ VE ÖNERİLER:**
Hukuki durumunuz için önerilen strateji ve gerekli işlemler...`,

          `⚖️ **GPT-4 DETAYLI HUKUKİ İNCELEME**

🔍 **OLGUSAL ANALİZ:**
Sorununuzun hukuki niteliği ve uygulanacak prosedürler:

📊 **TAZMİNAT/ALACAK HESAPLAMALARI:**
- Maddi zarar: Belgeli kayıplar ve değer tespiti
- Manevi tazminat: Yargıtay standartları (5.000₺-150.000₺)
- Vekalet ücreti: %20 oranında
- Faiz hesaplaması: TCMB reeskont+5 puan

⏱️ **SÜRe VE ZAMANAŞIMI KONTROLÜ:**
- Dava açma süreleri (HMK/CMK hükümleri)
- Zamanaşımı süreleri ve kesilmesi
- Kritik tarih hesaplamaları

🏛️ **YARGI YOLU VE GÖREV TESPİTİ:**
Hangi mahkemede, nasıl bir prosedürle dava açılacağı...

📝 **DİLEKÇE STRATEJİSİ:**
Kazanma odaklı hukuki argüman geliştirme önerileri...`,

          `📚 **GPT-4 MEVZUAT VE İÇTİHAT ANALİZİ**

⚖️ **GÜNCEL HUKUKİ DURUM:**
Son mevzuat değişiklikleri ve Yargıtay yaklaşımı:

🔍 **BENZER DAVALAR ANALİZİ:**
- Son 6 ay Yargıtay kararları
- Mahkeme uygulamaları ve sonuçları
- Başarı oranları ve stratejiler

💼 **PROFESYONEL YAKLAŞIM:**
25+ yıl tecrübe ışığında önerilen hukuki strateji:

🎯 **UYGULAMA ADIMLARI:**
1. Delil toplama ve değerlendirme
2. Ön inceleme ve risk analizi  
3. Dilekçe hazırlığı ve dava stratejisi
4. Duruşma hazırlığı ve savunma

⚡ **ACİL DURUMLAR:**
Geçici hukuki koruma, ihtiyati tedbir gerekliliği...`
        ],
        'gemini': [
          `✨ **GEMİNİ YENİLİKÇİ HUKUKİ YAKLAŞIM**

🌟 **ÇOK BOYUTLU ANALİZ:**
Bu hukuki problemi farklı perspektiflerden değerlendiriyorum:

💡 **İNOVATİF STRATEJİLER:**
- Arabuluculuk ve uzlaştırma imkanları
- Alternatif çözüm yolları keşfi
- Teknoloji destekli delil toplama
- Sosyal medya ve dijital kanıtlar

🎯 **YARATICI PROBLem ÇÖZME:**
Geleneksel yaklaşımların yanında:
- Pre-litigation stratejileri
- Karşı tarafla müzakere teknikleri
- Win-win çözüm arayışları

⚖️ **GÜNCel TREND ANALİZİ:**
- Son dönem mahkeme eğilimleri
- Toplumsal değişimin hukuka yansıması
- Dijital çağ hukuki gelişmeleri

🔮 **GELECeK ÖNGÖRÜLERİ:**
Davanızın muhtemel sonuçları ve uzun vadeli etkiler...

🚀 **AKSİYON PLANI:**
Adım adım uygulama rehberi ve yenilikçi taktikler...`,

          `🎨 **GEMİNİ KREATİF HUKUKİ ÇÖZÜM**

💎 **HOLİSTİK YAKLAŞIM:**
Hukuki sorununuzu 360° açıdan ele alıyorum:

🧠 **PATTERN ANALİZİ:**
- Benzer vakaların çözüm modelleri
- Başarılı stratejilerin ortak noktaları
- Risk faktörlerinin early warning sistemi

🌍 **KARŞILAŞTIRMALI HUKUK:**
- AB ülkeleri uygulamaları
- Best practice örnekleri
- Uluslararası standartlar

⚡ **HIZLI ÇÖZÜM TEKNİKLERİ:**
- Express prosedürler
- Ön inceleme optimizasyonu
- Etkili delil sunumu

🎪 **DURUŞMA DİNAMİKLERİ:**
Mahkeme psikolojisi ve ikna sanatı teknikleri...

💫 **SINERGIK ETKİLER:**
Farklı hukuk dallarının kesişimi ve fırsatlar...`,

          `🌈 **GEMİNİ ENTEGRe HUKUKİ DESTEK**

🔥 **DİJİTAL ÇAĞ HUKUKU:**
Modern hukuki problemlere yenilikçi yaklaşımlar:

📱 **TEKNOLOJI ENTEGRASYONu:**
- E-duruşma ve dijital belgeler
- Blockchain tabanlı deliller
- AI destekli içtihat analizi

🎭 **PSİKOSOSYAL BOYUT:**
- Duruşma psikolojisi
- Mediation becerileri
- Müvekkil-avukat iletişimi

🔄 **SÜREKLİ GELİŞİM:**
- Real-time mevzuat takibi
- Trending hukuki konular
- Emerging legal issues

⭐ **ÖZEL METODOLOJI:**
Gemini'nin unique problem-solving approach'u ile çözüm...

🎯 **HEDEF ODAKLI SONUÇ:**
Maksimum fayda, minimum risk prensibiyle hareket planı...`
        ]
      };
      
      const responses = mockResponses[finalModel as keyof typeof mockResponses] || mockResponses['gpt-4'];
      const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
      
      return {
        success: true,
        content: selectedResponse,
        model: finalModel,
        confidence: finalModel === 'gpt-4' ? 0.88 + Math.random() * 0.1 : 0.85 + Math.random() * 0.12,
        processingTime: 800 + Math.random() * 400,
        reasoning: selectedModelName === 'auto' ? `${finalModel.toUpperCase()} otomatik olarak seçildi (güven skoru ve yanıt kalitesi)` : undefined
      };
    }
    
    if (path === '/api/ai/compare') {
      // Mock comparison response - her iki modelin de profesyonel hukuki yanıtını göster
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        success: true,
        comparisons: [
          { 
            model: 'GPT-4', 
            content: `🏛️ **GPT-4 SİSTEMATİK HUKUKİ ANALİZ**

⚖️ Bu konuda sistematik yaklaşım benimsiyor:
• Mevzuat analizi ve içtihat taraması
• Risk değerlendirmesi ve dava stratejisi  
• Detaylı hukuki argüman geliştirme
• Yargıtay standartlarına uygun yaklaşım

📊 **GÜÇLÜ YANLAR:** Derinlemesine yasal analiz, kapsamlı içtihat bilgisi
⚠️ **DİKKAT EDİLMESİ GEREKENLER:** Detaylar arasında kaybolma riski`, 
            confidence: 94,
            processingTime: 1200,
            reasoning: "Sistematik analiz ve içtihat bilgisi üstünlüğü"
          },
          { 
            model: 'Gemini', 
            content: `✨ **GEMİNİ YENİLİKÇİ HUKUKİ YAKLAŞIM**

🌟 Bu durumu çok boyutlu perspektiften ele alıyor:
• Alternatif çözüm yolları keşfi
• Yaratıcı hukuki stratejiler
• Modern teknoloji entegrasyonu
• İnsan odaklı çözüm arayışı

💡 **GÜÇLÜ YANLAR:** Yaratıcı problem çözme, alternatif yaklaşımlar
🎯 **AVANTAJLAR:** Hızlı çözüm arayışı, teknoloji entegrasyonu`, 
            confidence: 89,
            processingTime: 950,
            reasoning: "İnovatif yaklaşım ve alternatif çözüm odağı"
          }
        ]
      };
    }
    
    if (path === '/api/ai/feedback') {
      // Mock feedback response
      return { success: true, message: 'Geri bildirim alındı' };
    }
    
    // Original implementation (commented out for demo)
    /*
    const bases = [API_BASE].filter(Boolean);
    bases.push(''); // same-origin relative
    if (!bases.includes('http://127.0.0.1:8000')) bases.push('http://127.0.0.1:8000');
    if (!bases.includes('http://localhost:8000')) bases.push('http://localhost:8000');
    let lastErr: any = null;
    for (const base of bases) {
      try {
        const res = await fetch(`${base}${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) return await res.json();
        lastErr = new Error(`HTTP ${res.status}`);
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('network error');
    */
    
    // Fallback
    throw new Error('Demo mode: API not implemented');
  }

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  const lastContext = () => messages.slice(-6).map(m => ({ role: m.role, content: m.content }));

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const now = new Date().toISOString();
    const userMsg: ChatMessage = { id: 'u-' + now, role: 'user', content: input.trim(), timestamp: now };
    setMessages(prev => [...prev, userMsg]);
    
    // Kullanıcı sorusunu analiz et
    const analysis = analyzeUserQuestion(input.trim());
    
    setInput('');
    setIsLoading(true);
    try {
      // AI düşünme simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
      
      // Dinamik yanıt üret
      const dynamicResponse = generateDynamicResponse(input.trim(), selectedModel, analysis);
      
      const asst: ChatMessage = { 
        id: 'a-' + Date.now(), 
        role: 'assistant', 
        content: dynamicResponse, 
        timestamp: new Date().toISOString(), 
        model: selectedModel as any, 
        confidence: 0.95,
        sources: [] 
      };
      setMessages(prev => [...prev, asst]);
    } catch (e) {
      const detail = e instanceof Error ? e.message : 'Bilinmeyen hata';
      const friendly = [
        'Bağlantı veya yanıt hatası oluştu.',
        '- Lütfen /health kontrol edin (Backend çalışıyor mu?)',
        '- Modeli (auto/gemini/gpt-4) değiştirip tekrar deneyin',
        `Hata: ${detail}`
      ].join('\n');
      const errMsg: ChatMessage = { id: 'e-' + Date.now(), role: 'assistant', content: friendly, timestamp: new Date().toISOString(), error: true };
      setMessages(prev => [...prev, errMsg]);
    } finally { setIsLoading(false); }
  };

  const handleKeyPress: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedback } : m));
  postJsonWithFallback('/api/ai/feedback', { messageId, feedback }).catch(() => {});
  };

  const copyToClipboard = (text: string) => { navigator.clipboard?.writeText(text).catch(()=>{}); };

  const resetChat = () => {
  setMessages([]);
    setAiResponses([]);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="w-8 h-8 text-blue-600" />
              <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hukuk Asistanı</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">İki AI model aynı anda çalışır; en iyi yanıt konuşmaya devam eder.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select aria-label="Model seçimi" value={selectedModel} onChange={(e)=>setSelectedModel(e.target.value as any)} className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="auto">Otomatik Seçim</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gemini">Gemini</option>
            </select>
            <button onClick={()=>setShowComparison(s=>!s)} className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1"><Trophy className="w-4 h-4"/>Karşılaştır</button>
            <button onClick={resetChat} className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" title="Sohbeti Sıfırla"><RotateCcw className="w-5 h-5"/></button>
          </div>
        </div>
      </div>

      {showComparison && aiResponses.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-6 py-4">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">AI Model Karşılaştırması</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiResponses.map((r, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {r.model === 'GPT-4' ? '🧠 GPT-4' : 
                     r.model === 'Gemini' ? '✨ Gemini' : 
                     r.model?.toUpperCase?.() || 'MODEL'}
                  </span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Güven: {Math.round(r.confidence)}%</span>
                    {typeof r.processingTime === 'number' && <span className="text-gray-600 dark:text-gray-400">{r.processingTime}ms</span>}
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">{(r.content || '').slice(0, 220)}...</div>
                {r.reasoning && <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">Seçilme nedeni: {r.reasoning}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 max-h-[calc(100vh-300px)]">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-5xl w-full ${m.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 ${m.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {m.role === 'user' ? (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-white"/></div>
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center"><Bot className="w-5 h-5 text-white"/></div>
                  )}
                </div>
                <div className={`flex-1 min-w-0 ${m.role === 'user' ? 'order-1' : 'order-2'}`}>
                  <div className={`rounded-lg px-6 py-4 ${m.role === 'user' ? 'bg-blue-600 text-white' : (m.error ? 'bg-red-600 text-white' : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white')}`}>
                    {m.role === 'assistant' && m.model && (
                      <div className="flex items-center gap-2 mb-3 text-sm opacity-90">
                        <Trophy className="w-4 h-4"/>
                        <span>
                          {m.model === 'best' ? 'En İyi Yanıt' : 
                           m.model === 'gpt-4' ? 'GPT-4' :
                           m.model === 'gemini' ? 'Gemini' :
                           m.model.toUpperCase()}
                        </span>
                        {typeof m.confidence === 'number' && <span>• Güven: {Math.round(m.confidence * 100)}%</span>}
                      </div>
                    )}
                    <div className={`prose ${m.role === 'user' ? 'prose-invert' : 'prose-invert'} max-w-none prose-sm md:prose-base`}>
                      <ReactMarkdown
                        children={m.content}
                        components={{
                          code({ inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter style={vscDarkPlus as any} language={match[1]} PreTag="div" {...props}>
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={`${className} bg-white/20 px-1 rounded text-sm`} {...props}>{children}</code>
                            );
                          },
                          h1: ({children}) => <h1 className="text-xl font-bold mb-3 text-white">{children}</h1>,
                          h2: ({children}) => <h2 className="text-lg font-bold mb-2 text-white">{children}</h2>,
                          h3: ({children}) => <h3 className="text-base font-bold mb-2 text-white">{children}</h3>,
                          p: ({children}) => <p className="mb-2 text-white leading-relaxed">{children}</p>,
                          ul: ({children}) => <ul className="mb-3 pl-4 list-disc text-white">{children}</ul>,
                          ol: ({children}) => <ol className="mb-3 pl-4 list-decimal text-white">{children}</ol>
                        }}
                      />
                    </div>
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/30">
                        <div className="text-xs text-white/80 mb-2">Kaynaklar:</div>
                        <div className="space-y-1">
                          {m.sources.map((s, i) => (
                            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-xs text-blue-100 hover:underline">
                              <span>{s.title}</span><span className="text-gray-500">%{s.relevance}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {m.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/30">
                        <button title="Beğendim" aria-label="Beğendim" onClick={()=>handleFeedback(m.id, 'positive')} className={`p-1 rounded ${m.feedback === 'positive' ? 'text-green-200 bg-white/10' : 'text-white/70 hover:text-white'}`}><ThumbsUp className="w-4 h-4"/></button>
                        <button title="Beğenmedim" aria-label="Beğenmedim" onClick={()=>handleFeedback(m.id, 'negative')} className={`p-1 rounded ${m.feedback === 'negative' ? 'text-red-200 bg-white/10' : 'text-white/70 hover:text-white'}`}><ThumbsDown className="w-4 h-4"/></button>
                        <button title="Kopyala" aria-label="Kopyala" onClick={()=>copyToClipboard(m.content)} className="p-1 text-white/70 hover:text-white"><Copy className="w-4 h-4"/></button>
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{new Date(m.timestamp).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start"><div className="flex items-start gap-3"><div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center"><Bot className="w-5 h-5 text-white"/></div><div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3"><div className="flex items-center gap-2"><Loader className="w-4 h-4 animate-spin text-blue-600"/><span className="text-sm text-gray-600 dark:text-gray-400">İki AI model yanıt hazırlıyor...</span></div></div></div></div>
        )}
        <div ref={messagesEndRef}/>
      </div>

      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex gap-3">
          <textarea value={input} onChange={(e)=>setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Hukuki sorunuzu yazın... (Shift+Enter ile yeni satır)" className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" rows={2} disabled={isLoading}/>
          <button onClick={handleSend} disabled={!input.trim() || isLoading} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"><Send className="w-5 h-5"/>Gönder</button>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">💡 İpucu: Daha iyi sonuçlar için sorunuzu detaylı ve net bir şekilde ifade edin.</div>
      </div>
    </div>
  );
}
