export interface PetitionTemplate {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  description: string;
  keywords: string[];
  content: string;
  requiredFields: string[];
  legalBasis: string[];
  courtType: string;
  estimatedTime: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  lastUpdated: string;
  usageCount: number;
  rating: number;
}

export const petitionCategories = {
  'Aile Hukuku': {
    'Boşanma': ['anlasmali-bosanma', 'haysiyetsizlik-bosanma', 'ayrilik-istemli', 'evliligin-butlani', 'evlenmenin-men-i', 'gaiplik-nedeni-ile-evliligin-feshi'],
    'Velayet': ['velayet-degisikligi', 'cocukla-kisisel-iliskinin-yeniden-duzenlenmesi', 'velayet-kaldirma'],
    'Nafaka': ['nafaka-artirimi', 'istirak-nafakasi-arttirimi', 'tedbir-nafakasi', 'nafaka-kesme'],
    'Evlilik': ['evliligin-butlani', 'evlenmenin-men-i', 'gaiplik-nedeni-ile-evliligin-feshi', 'evlilik-oncesi-sozlesme']
  },
  'Medeni Hukuk': {
    'Miras': ['veraset-ilaminin-iptali', 'veraset-ilaminin-duzeltilmesi', 'veraset-belgesi-verilmesi', 'mirasin-reddinin-tescili', 'olumun-tesbiti', 'miras-payi-artirimi'],
    'Tapu': ['tapu-iptali-ve-tescil', 'kat-mulkiyetinin-devri', 'kat-irtifakinin-devri', 'tapu-düzeltme'],
    'Mülkiyet': ['ortak-yere-ayrilan-arsa-payinin-iptali', 'ortak-yere-yapilan-mudahalenin-onlenmesi', 'fuzuli-isgal', 'mulkiyet-tescil']
  },
  'Borçlar Hukuku': {
    'Alacak': ['alacak-davasi', 'temerrut-nedeni-ile-alacak-davasi', 'alacak-takibi', 'borc-odeme'],
    'Sözleşme': ['kira-bedelinin-attirilmasi', 'kiranin-yeni-kosullara-uyarlanmasi', 'sozlesme-iptali', 'sozlesme-feshi'],
    'Tazminat': ['maddi-tazminat', 'maddi-ve-manevi-tazminat', 'trafik-kazasi-nedeniyle-maddi-tazminat', 'manevi-tazminat']
  },
  'İş Hukuku': {
    'İş Sözleşmesi': ['calisma-izni-talebi', 'is-sozlesmesi-iptali', 'is-sozlesmesi-feshi', 'is-sozlesmesi-degisiklik'],
    'İşçi Hakları': ['mazeret-dilekcesi', 'isci-haklari-talebi', 'isci-tazminati', 'isci-kidemi'],
    'İş Güvenliği': ['is-guvenligi-talebi', 'is-kazasi-tazminati', 'meslek-hastaligi', 'is-yeri-kapatma']
  },
  'İcra ve İflas': {
    'İcra': ['cek-iptali', 'cek-odeme-yasagi', 'menfi-tesbit-ve-icra-takibinin-durdurulmasi', 'icra-takibi'],
    'İflas': ['konkordatonun-feshi', 'iflas-talebi', 'iflas-iptali', 'konkordato-talebi'],
    'Rehin': ['rehin-iptali', 'rehin-tescil', 'rehin-devri', 'rehin-kaldirma']
  },
  'Ceza Hukuku': {
    'Şikayet': ['savciliga-sikayet-dilekcesi', 'sikayet-iptali', 'sikayet-artirimi', 'sikayet-degisiklik'],
    'Koruma': ['ailenin-korunmasi-icin-tedbir', 'valilik-koruma-talebi', 'koruma-karari', 'koruma-genisleme'],
    'Suç': ['suç-duyurusu', 'suç-tanimi', 'suç-delili', 'suç-ittifaki']
  },
  'Ticaret Hukuku': {
    'Şirket': ['anonim-sirket-kurulusu', 'limited-sirket-kurulusu', 'sirket-birlesmesi', 'sirket-bolunmesi'],
    'Çek': ['cek-iptali', 'cek-odeme-yasagi', 'cek-takibi', 'cek-protestosu'],
    'Senet': ['senet-iptali', 'senet-odeme-yasagi', 'senet-takibi', 'senet-protestosu']
  }
};
