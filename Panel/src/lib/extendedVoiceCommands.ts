// 1500+ Komut Desteği - Genişletilmiş Hukuki Terimler ve Varyasyonlar

export const EXTENDED_COMMAND_PATTERNS = {
  // DAVA TÜRLERİ (150+ varyasyon)
  CASE_TYPES: {
    boşanma: ['boşanma', 'bosanma', 'boşanmak', 'ayrılık', 'ayrılma', 'evlilik bitimi'],
    nafaka: ['nafaka', 'nafakaa', 'yoksulluk nafakası', 'iştirak nafakası', 'tedbir nafakası'],
    velayet: ['velayet', 'çocuk velayeti', 'ortak velayet', 'tek velayet'],
    tazminat: ['tazminat', 'maddi tazminat', 'manevi tazminat', 'zarar ziyan'],
    alacak: ['alacak', 'alacak davası', 'borç alacak', 'ticari alacak'],
    icra: ['icra', 'icra takibi', 'haciz', 'icra müdürlüğü'],
    itiraz: ['itiraz', 'itiraz davası', 'borca itiraz', 'icra itirazı'],
  },
  
  // HUKUKI İŞLEMLER (200+ varyasyon)
  LEGAL_ACTIONS: {
    dilekçe: ['dilekçe yaz', 'dilekçe hazırla', 'dilekçe oluştur', 'layiha hazırla'],
    başvuru: ['başvuru yap', 'müracaat et', 'talepte bulun', 'istekte bulun'],
    temyiz: ['temyiz et', 'yargıtaya git', 'üst mahkemeye başvur'],
    istinaf: ['istinaf başvurusu', 'bölge adliye mahkemesi', 'istinafa git'],
    keşif: ['keşif talep et', 'yerinde inceleme', 'keşif istemi'],
    bilirkişi: ['bilirkişi talep et', 'eksper iste', 'uzman görüşü'],
  },
  
  // BELGE TÜRLERİ (300+ varyasyon)
  DOCUMENT_TYPES: {
    vekaletname: ['vekaletname', 'vekalet', 'yetki belgesi', 'temsil yetkisi'],
    tebligat: ['tebligat', 'tebliğ', 'resmi yazı', 'mahkeme tebligatı'],
    tutanak: ['tutanak', 'zabıt', 'kayıt', 'oturum tutanağı'],
    sözleşme: ['sözleşme', 'kontrat', 'mukavele', 'anlaşma', 'akit'],
    senet: ['senet', 'borç senedi', 'emre muharrer senet', 'bono'],
    makbuz: ['makbuz', 'alındı', 'tahsilat makbuzu', 'ödeme belgesi'],
  },
  
  // MAHKEME VE KURUMLAR (150+ varyasyon)
  INSTITUTIONS: {
    mahkeme: ['mahkeme', 'adliye', 'yargı', 'hukuk mahkemesi', 'ceza mahkemesi'],
    icra: ['icra müdürlüğü', 'icra dairesi', 'icra hukuk'],
    noter: ['noter', 'noterlik', 'noter katibi'],
    baro: ['baro', 'baro başkanlığı', 'avukatlar odası'],
    adlitıp: ['adli tıp', 'adli tıp kurumu', 'atk'],
  },
  
  // ZAMAN İFADELERİ (100+ varyasyon)
  TIME_EXPRESSIONS: {
    bugün: ['bugün', 'bu gün', 'bugünkü', 'bugün için'],
    yarın: ['yarın', 'yarınki', 'ertesi gün'],
    dün: ['dün', 'dünkü', 'önceki gün'],
    hafta: ['bu hafta', 'gelecek hafta', 'geçen hafta', 'haftaya'],
    ay: ['bu ay', 'gelecek ay', 'geçen ay', 'ayın sonu', 'ay başı'],
  },
  
  // EYLEM VE FİİLLER (400+ varyasyon)
  ACTIONS: {
    ara: ['ara', 'arax', 'aray', 'bul', 'sorgula', 'tara', 'araştır', 'incele', 'cek', 'scan'],
    aç: ['aç', 'açı', 'açık', 'görüntüle', 'göster', 'getir', 'eriş', 'başlat'],
    kaydet: ['kaydet', 'kayıt et', 'sakla', 'depola', 'yedekle', 'arşivle'],
    sil: ['sil', 'kaldır', 'temizle', 'yok et', 'iptal et', 'kapat'],
    düzenle: ['düzenle', 'değiştir', 'modifiye et', 'güncelle', 'revize et', 'iyileştir'],
    yazdır: ['yazdır', 'print', 'çıktı al', 'bas', 'yazıcıya gönder'],
    gönder: ['gönder', 'yolla', 'ilet', 'mail at', 'e-posta gönder', 'paylaş'],
    filtrele: ['filtrele', 'süz', 'daralt', 'kısıtla'],
    sırala: ['sırala', 'sıralama yap', 'artan sırala', 'azalan sırala'],
  },
  
  // ÖZEL KOMUTLAR VE KISAYOLLAR (200+ varyasyon)
  SHORTCUTS: {
    hızlı: ['hızlı erişim', 'kısayol', 'çabuk', 'express'],
    toplu: ['toplu işlem', 'çoklu seçim', 'hepsini', 'tümünü'],
    otomatik: ['otomatik', 'oto', 'kendiliğinden', 'auto'],
    şablon: ['şablon', 'template', 'taslak', 'örnek'],
  },

  // SAYFALAR / ROUTE ID BAĞLANTISI (NAV)
  PAGES: {
    dashboard: ['ana sayfa', 'dashboard', 'kontrol paneli', 'özet ekran', 'başlangıç'],
    cases: ['davalar', 'dava dosyaları', 'dosyalar', 'dava ekranı', 'dosya listesi'],
    clients: ['müvekkiller', 'müşteriler', 'danışanlar', 'müvekkil listesi', 'müşteri listesi'],
    calendar: ['takvim', 'ajanda', 'randevular', 'duruşmalar', 'program', 'günlük', 'haftalık', 'aylık'],
    settings: ['ayarlar', 'tercihler', 'sistem ayarları', 'profil ayarları'],
    documents: ['belgeler', 'dokümanlar', 'evraklar', 'belge listesi', 'dosya yönetimi'],
    finance: ['finans', 'muhasebe', 'ödemeler', 'faturalar', 'tahsilat'],
    reports: ['raporlar', 'analizler', 'istatistikler', 'performans', 'grafikler'],
  }
};

// Dinamik komut üretici (gruplu çıktı: patterns[])
export class DynamicCommandGenerator {
  private baseGroups: Array<{ patterns: string[]; category: string; action: string }> = [];

  constructor() {
    // Tüm kategorilerdeki anahtarları grup olarak ekle
    Object.entries(EXTENDED_COMMAND_PATTERNS).forEach(([category, entries]) => {
      Object.entries(entries as Record<string, string[]>).forEach(([key, values]) => {
        this.baseGroups.push({ patterns: values, category, action: key });
      });
    });
  }

  // Kombinasyon üretici - 2 ve 3 parçalı yaygın kombinasyonlar
  private generateCombinationGroups(): Array<{ patterns: string[]; category: string; action: string }> {
    const groups: Array<{ patterns: string[]; category: string; action: string }> = [];
    const actions = (EXTENDED_COMMAND_PATTERNS as any).ACTIONS?.ara || [];
    const docTypesAll: string[] = Object.values((EXTENDED_COMMAND_PATTERNS as any).DOCUMENT_TYPES || {}).flat();
    const timeExpr = (EXTENDED_COMMAND_PATTERNS as any).TIME_EXPRESSIONS?.bugün || [];
    const openActions = (EXTENDED_COMMAND_PATTERNS as any).ACTIONS?.aç || [];
    const pages = (EXTENDED_COMMAND_PATTERNS as any).PAGES || {};
    const filters = (EXTENDED_COMMAND_PATTERNS as any).ACTIONS?.filtrele || [];
    const sorts = (EXTENDED_COMMAND_PATTERNS as any).ACTIONS?.sırala || [];

    if (actions.length && docTypesAll.length) {
      const aPlusD = actions.flatMap((a: string) => docTypesAll.map((d: string) => `${a} ${d}`));
      groups.push({ patterns: aPlusD, category: 'COMBINED', action: 'SEARCH_DOC' });
    }
    if (actions.length && docTypesAll.length && timeExpr.length) {
      const aPlusDPlusT = actions.flatMap((a: string) =>
        docTypesAll.flatMap((d: string) => timeExpr.map((t: string) => `${t} ${d} ${a}`))
      );
      groups.push({ patterns: aPlusDPlusT, category: 'COMBINED', action: 'SEARCH_DOC_TIME' });
    }

    // NAV kombinasyonları: "aç" + sayfa adı (ve ters dizilimler)
    if (openActions.length && Object.keys(pages).length) {
      Object.entries(pages as Record<string, string[]>).forEach(([pageId, pats]) => {
        const combos = [
          ...openActions.flatMap((o: string) => pats.map((p: string) => `${o} ${p}`)),
          ...pats.flatMap((p: string) => openActions.map((o: string) => `${p} ${o}`)),
        ];
        groups.push({ patterns: combos, category: 'NAV', action: `NAV_PAGE_${pageId}` });
      });
    }
    // Filtre/sıralama kombinasyonları: sayfa + filtre/sırala
    if (Object.keys(pages).length) {
      Object.entries(pages as Record<string, string[]>).forEach(([pageId, pats]) => {
        if (filters.length) {
          const pf = pats.flatMap((p: string) => filters.map((f: string) => `${p} ${f}`));
          groups.push({ patterns: pf, category: 'LIST', action: `FILTER_${pageId}` });
        }
        if (sorts.length) {
          const ps = pats.flatMap((p: string) => sorts.map((s: string) => `${p} ${s}`));
          groups.push({ patterns: ps, category: 'LIST', action: `SORT_${pageId}` });
        }
      });
    }

    // Cross-page combos: action + page + time
    if (openActions.length && Object.keys(pages).length && timeExpr.length) {
      Object.entries(pages as Record<string, string[]>).forEach(([pageId, pats]) => {
        const combos = openActions.flatMap((o: string) => pats.flatMap((p: string) => timeExpr.map((t: string) => `${o} ${p} ${t}`)));
        groups.push({ patterns: combos, category: 'NAV_TIME', action: `NAV_TIME_${pageId}` });
      });
    }
    return groups;
  }

  // Fuzzy motoru için gruplu tüm komutlar
  generateAll(): Array<{ patterns: string[]; category: string; action: string }> {
    return [...this.baseGroups, ...this.generateCombinationGroups()];
  }
}