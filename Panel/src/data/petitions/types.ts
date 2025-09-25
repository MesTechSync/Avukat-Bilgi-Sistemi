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
    'Boşanma': ['anlasmali-bosanma', 'haysiyetsizlik-bosanma', 'ayrilik-istemli', 'evliligin-butlani', 'evlenmenin-men-i', 'gaiplik-nedeni-ile-evliligin-feshi', 'bosanma-tazminat', 'bosanma-mal-rejimi'],
    'Velayet': ['velayet-degisikligi', 'cocukla-kisisel-iliskinin-yeniden-duzenlenmesi', 'velayet-kaldirma', 'velayet-teslim', 'velayet-ziyaret', 'velayet-koruma'],
    'Nafaka': ['nafaka-artirimi', 'istirak-nafakasi-arttirimi', 'tedbir-nafakasi', 'nafaka-kesme', 'nafaka-tazminat', 'nafaka-koruma'],
    'Evlilik': ['evliligin-butlani', 'evlenmenin-men-i', 'gaiplik-nedeni-ile-evliligin-feshi', 'evlilik-oncesi-sozlesme', 'evlilik-tazminat', 'evlilik-koruma']
  },
  'Medeni Hukuk': {
    'Miras': ['veraset-ilaminin-iptali', 'veraset-ilaminin-duzeltilmesi', 'veraset-belgesi-verilmesi', 'mirasin-reddinin-tescili', 'olumun-tesbiti', 'miras-payi-artirimi', 'miras-tazminat', 'miras-koruma'],
    'Tapu': ['tapu-iptali', 'kat-mulkiyetinin-devri', 'kat-irtifakinin-devri', 'tapu-düzeltme', 'tapu-tescil', 'tapu-koruma'],
    'Mülkiyet': ['ortak-yere-ayrilan-arsa-payinin-iptali', 'ortak-yere-yapilan-mudahalenin-onlenmesi', 'fuzuli-isgal', 'mulkiyet-tescil', 'mulkiyet-tazminat', 'mulkiyet-koruma']
  },
  'Borçlar Hukuku': {
    'Alacak': ['alacak-davasi', 'temerrut-nedeni-ile-alacak-davasi', 'alacak-takibi', 'borc-odeme', 'alacak-tazminat', 'alacak-koruma'],
    'Sözleşme': ['kira-bedelinin-attirilmasi', 'kiranin-yeni-kosullara-uyarlanmasi', 'sozlesme-iptali', 'sozlesme-feshi', 'sozlesme-tazminat', 'sozlesme-koruma'],
    'Tazminat': ['maddi-tazminat', 'maddi-ve-manevi-tazminat', 'trafik-kazasi-nedeniyle-maddi-tazminat', 'manevi-tazminat', 'tazminat-artirimi', 'tazminat-koruma']
  },
  'İş Hukuku': {
    'İş Sözleşmesi': ['is-sozlesmesi-iptali', 'is-sozlesmesi-feshi', 'is-sozlesmesi-yenileme', 'is-sozlesmesi-degisiklik', 'is-sozlesmesi-tazminat', 'is-sozlesmesi-koruma'],
    'İşçi Hakları': ['isci-haklari-tazminat', 'isci-haklari-ihlal', 'isci-haklari-koruma', 'isci-haklari-dava', 'isci-haklari-tazminat', 'isci-haklari-koruma'],
    'İş Güvenliği': ['is-guvenligi-tazminat', 'is-kazasi-tazminat', 'meslek-hastaligi-tazminat', 'is-yeri-kapatma', 'is-guvenligi-koruma', 'is-kazasi-koruma']
  },
  'İcra ve İflas': {
    'İcra': ['cek-iptali', 'cek-odeme-yasagi', 'menfi-tesbit-ve-icra-takibinin-durdurulmasi', 'icra-takibi', 'icra-tazminat', 'icra-koruma'],
    'İflas': ['konkordatonun-feshi', 'iflas-talebi', 'iflas-iptali', 'konkordato-talebi', 'iflas-tazminat', 'iflas-koruma'],
    'Rehin': ['rehin-iptali', 'rehin-tescil', 'rehin-devri', 'rehin-kaldirma', 'rehin-tazminat', 'rehin-koruma']
  },
  'Ceza Hukuku': {
    'Şikayet': ['suç-duyurusu', 'suç-sikayet', 'suç-tazminat', 'suç-koruma', 'suç-duyuru-tazminat', 'suç-duyuru-koruma'],
    'Tazminat': ['suç-tazminat', 'haksiz-fiil-tazminat', 'zarar-tazminat', 'manevi-tazminat', 'tazminat-artirimi', 'tazminat-koruma'],
    'Koruma': ['ailenin-korunmasi-icin-tedbir', 'valilik-koruma-talebi', 'koruma-karari', 'koruma-genisleme', 'koruma-tazminat', 'koruma-koruma']
  },
  'Ticaret Hukuku': {
    'Şirket': ['sirket-feshi', 'sirket-birlesme', 'sirket-bolunme', 'sirket-devir', 'sirket-tazminat', 'sirket-koruma'],
    'Ticari İşlem': ['ticari-islem-tazminat', 'ticari-sozlesme-iptal', 'ticari-ortaklik-feshi', 'ticari-vekalet-iptal', 'ticari-islem-koruma', 'ticari-sozlesme-koruma'],
    'Rekabet': ['rekabet-tazminat', 'haksiz-rekabet-tazminat', 'rekabet-yasagi-iptal', 'rekabet-düzeltme', 'rekabet-koruma', 'haksiz-rekabet-koruma']
  }
};
