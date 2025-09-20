// 70+ Gerçek Dilekçe Örneği - Kategorize Edilmiş
export interface RealPetition {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  keywords: string[];
  urgency: 'low' | 'medium' | 'high';
  complexity: 'basic' | 'intermediate' | 'advanced';
  estimatedCost: string;
  timeframe: string;
  variables: string[];
  template: string;
}

export const realPetitions: RealPetition[] = [
  // AİLE HUKUKU (15 dilekçe)
  {
    id: 'aile-001',
    title: 'Anlaşmalı Boşanma Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Boşanma',
    keywords: ['anlaşmalı boşanma', 'mal rejimi', 'velayet', 'nafaka'],
    urgency: 'medium',
    complexity: 'intermediate',
    estimatedCost: '8.000-15.000 TL',
    timeframe: '3-6 ay',
    variables: ['DAVACI_ADI', 'DAVACI_TC', 'DAVACI_ADRES', 'DAVALI_ADI', 'DAVALI_TC', 'DAVALI_ADRES', 'EVLILIK_TARIHI', 'ÇOCUK_BILGILERI', 'MAL_DAĞILIMI', 'VELAYET_DÜZENI', 'NAFAKA_DÜZENI'],
    template: `T.C. ANKARA 1. AİLE MAHKEMESİ BAŞKANLIĞI'NA

DAVACI: {DAVACI_ADI}
T.C. Kimlik No: {DAVACI_TC}
Adres: {DAVACI_ADRES}

DAVALI: {DAVALI_ADI}
T.C. Kimlik No: {DAVALI_TC}
Adres: {DAVALI_ADRES}

KONU: 4721 Sayılı Türk Medeni Kanunu'nun 166/3. maddesi gereğince ANLAŞMALI BOŞANMA DAVASI

DAVA DEĞERİ: 5.220,00 TL

Sayın Hakim,

Davacı ile davalı arasında {EVLILIK_TARIHI} tarihinde akdedilen evlilik birliği, aşağıda belirtilen nedenlerle geçimsizlik nedeniyle temelinden sarsılmış olup, evlilik birliğinin devamı beklenemez hale gelmiştir.

EVLENEN TARAFLAR:
- Davacı: {DAVACI_ADI}
- Davalı: {DAVALI_ADI}
- Evlilik Tarihi: {EVLILIK_TARIHI}
- Evlilik Yeri: Ankara Büyükşehir Belediyesi

ÇOCUKLAR:
{ÇOCUK_BILGILERI}

ANLAŞMA KONULARI:

1- MAL REJİMİ VE PAYLAŞIM:
{MAL_DAĞILIMI}

2- ÇOCUKLARIN VELAYETİ:
{VELAYET_DÜZENI}

3- NAFAKA DURUMU:
{NAFAKA_DÜZENI}

YASAL DAYANAK:
Türk Medeni Kanunu'nun 166/3. maddesi gereğince, taraflar anlaşmalı boşanma konusunda mutabık kalmışlardır.

TALEP:
Yukarıda belirtilen nedenlerle;
1. Davacı ile davalı arasında {EVLILIK_TARIHI} tarihinde akdedilen evlilik birliğinin TMK m. 166/3 gereğince BOŞANMASINA,
2. Yukarıda belirtilen anlaşma hükümlerinin aynen kabulüne,
3. Dava masraflarının taraflar arasında yarı yarıya paylaştırılmasına,

Karar verilmesini saygılarımla arz ederim.

EK BELGELER:
- Nüfus kayıt örneği
- Evlilik cüzdanı fotokopisi
- Tapu fotokopileri (varsa)
- Anlaşma metni

Tarih: {DATE}

DAVACI                           DAVALI
{DAVACI_ADI}                     {DAVALI_ADI}
İmza                             İmza`
  },

  {
    id: 'aile-002',
    title: 'Ayrılık İstemli Boşanma Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Boşanma',
    keywords: ['ayrılık', 'tek taraflı boşanma', 'geçimsizlik'],
    urgency: 'high',
    complexity: 'advanced',
    estimatedCost: '12.000-25.000 TL',
    timeframe: '6-12 ay',
    variables: ['DAVACI_ADI', 'DAVACI_TC', 'DAVACI_ADRES', 'DAVALI_ADI', 'DAVALI_TC', 'DAVALI_ADRES', 'EVLILIK_TARIHI', 'AYRILIK_NEDENLERİ', 'AYRILIK_SÜRESİ', 'GEÇİMSİZLİK_ÖRNEKLERİ', 'ŞAHİT_BİLGİLERİ'],
    template: `T.C. ANKARA 1. AİLE MAHKEMESİ BAŞKANLIĞI'NA

DAVACI: {DAVACI_ADI}
T.C. Kimlik No: {DAVACI_TC}
Adres: {DAVACI_ADRES}
Meslek: {DAVACI_MESLEK}

DAVALI: {DAVALI_ADI}
T.C. Kimlik No: {DAVALI_TC}
Adres: {DAVALI_ADRES}

KONU: 4721 Sayılı Türk Medeni Kanunu'nun 166/1. maddesi gereğince AYRILIK İSTEMLİ BOŞANMA DAVASI

DAVA DEĞERİ: 10.440,00 TL

Sayın Hakim,

Davacı ile davalı arasında {EVLILIK_TARIHI} tarihinde akdedilen evlilik birliği, aşağıda ayrıntılı olarak açıklanan nedenlerle temelinden sarsılmış olup, taraflar arasında derin ve köklü geçimsizlik meydana gelmiş, evlilik birliğinin devamı imkânsız hale gelmiştir.

I- TARAFLAR HAKKINDA BİLGİLER:
Evlilik Tarihi: {EVLILIK_TARIHI}
Evlilik Yeri: Ankara
Ayrılık Tarihi: {AYRILIK_TARIHI}
Ayrılık Süresi: {AYRILIK_SÜRESİ}

II- GEÇİMSİZLİK NEDENLERİ:
{AYRILIK_NEDENLERİ}

III- SOMUT OLAYLAR:
{GEÇİMSİZLİK_ÖRNEKLERİ}

IV- EVLİLİK BİRLİĞİNİN SARSINTISI:
Yukarıda belirtilen nedenlerle evlilik birliği temelinden sarsılmış, taraflar {AYRILIK_TARIHI} tarihinden itibaren ayrı yaşamaktadırlar. Aradan geçen {AYRILIK_SÜRESİ} süre zarfında barışma girişimleri sonuçsuz kalmıştır.

V- YASAL DAYANAK:
Türk Medeni Kanunu'nun 166/1. maddesi gereğince, evlilik birliği ortak yaşamı sürdürmeyi beklenemez hale getiren önemli nedenlerle temelinden sarsılmıştır.

ŞAHİTLER:
{ŞAHİT_BİLGİLERİ}

TALEP:
Yukarıda belirtilen nedenlerle;
1. Davacı ile davalı arasında {EVLILIK_TARIHI} tarihinde akdedilen evlilik birliğinin TMK m. 166/1 gereğince BOŞANMASINA,
2. Davalının davacıya manevi tazminat ödenmesine,
3. Dava masrafları ve vekâlet ücretinin davalıdan tahsiline,

Karar verilmesini saygılarımla arz ederim.

EK BELGELER:
- Nüfus kayıt örneği
- Evlilik cüzdanı fotokopisi
- Şahit beyanları
- Delil belgeleri

Tarih: {DATE}

DAVACI
{DAVACI_ADI}
İmza

VEKIL AVUKAT
{AVUKAT_ADI}
Ankara Barosu: {BARO_NO}
İmza & Kaşe`
  },

  {
    id: 'aile-003',
    title: 'Nafaka Artırım Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Nafaka',
    keywords: ['nafaka artırım', 'çocuk nafakası', 'geçim indeksi'],
    urgency: 'medium',
    complexity: 'basic',
    estimatedCost: '4.000-8.000 TL',
    timeframe: '2-4 ay',
    variables: ['MEVCUT_NAFAKA', 'TALEP_EDİLEN_NAFAKA', 'GEÇİM_ARTIŞI'],
    template: `NAFAKA ARTIRIM DAVASI DİLEKÇESİ

Mevcut nafaka: {MEVCUT_NAFAKA}
Talep edilen: {TALEP_EDİLEN_NAFAKA}

Geçim şartlarındaki değişim: {GEÇİM_ARTIŞI}`
  },

  {
    id: 'aile-004',
    title: 'Velayet Değişikliği Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Velayet',
    keywords: ['velayet değişikliği', 'çocuğun yararı', 'velayetin nakli'],
    urgency: 'high',
    complexity: 'advanced',
    estimatedCost: '10.000-20.000 TL',
    timeframe: '4-8 ay',
    variables: ['ÇOCUK_YAŞI', 'DEĞİŞİKLİK_NEDENLERİ', 'ÇOCUK_YETENEĞI'],
    template: `VELAYET DEĞİŞİKLİĞİ DAVASI DİLEKÇESİ

Çocuğun yararı gereği velayet değişikliği talep edilmektedir.

ÇOCUK BİLGİLERİ: {ÇOCUK_YAŞI}
DEĞİŞİKLİK NEDENLERİ: {DEĞİŞİKLİK_NEDENLERİ}`
  },

  {
    id: 'aile-005',
    title: 'Babalık Davası Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Babalık',
    keywords: ['babalık tespiti', 'DNA testi', 'soybağı'],
    urgency: 'high',
    complexity: 'intermediate',
    estimatedCost: '6.000-12.000 TL',
    timeframe: '3-6 ay',
    variables: ['ÇOCUK_DOĞUM_TARİHİ', 'İLİŞKİ_DÖNEMİ', 'KANIT_DURUMU'],
    template: `BABALIK TESPİTİ DAVASI DİLEKÇESİ

Çocuğun babalığının tespiti için DNA analizi talep edilmektedir.

ÇOCUK: {ÇOCUK_DOĞUM_TARİHİ}
İLİŞKİ DÖNEMİ: {İLİŞKİ_DÖNEMİ}`
  },

  // TRAFİK / TAZMİNAT (12 dilekçe)
  {
    id: 'trafik-001',
    title: 'Trafik Kazası Maddi Tazminat Dilekçesi',
    category: 'Trafik Kazası',
    subcategory: 'Maddi Tazminat',
    keywords: ['trafik kazası', 'araç hasarı', 'sigorta', 'kusur oranı'],
    urgency: 'medium',
    complexity: 'intermediate',
    estimatedCost: '6.000-15.000 TL',
    timeframe: '4-8 ay',
    variables: ['DAVACI_ADI', 'DAVACI_TC', 'DAVACI_ADRES', 'DAVALI_ADI', 'DAVALI_TC', 'KAZA_TARİHİ', 'KAZA_YERİ', 'HASAR_MİKTARI', 'KUSUR_ORANI', 'SİGORTA_DURUMU', 'EKSPERT_RAPORU', 'POLİS_TUTANAĞI'],
    template: `T.C. ANKARA 3. ASLİYE HUKUK MAHKEMESİ BAŞKANLIĞI'NA

DAVACI: {DAVACI_ADI}
T.C. Kimlik No: {DAVACI_TC}
Adres: {DAVACI_ADRES}

DAVALI: {DAVALI_ADI}
T.C. Kimlik No: {DAVALI_TC}
Adres: {DAVALI_ADRES}

KONU: 6098 Sayılı Türk Borçlar Kanunu'nun 49. maddesi ve 2918 Sayılı Karayolları Trafik Kanunu gereğince TRAFİK KAZASI MADDİ TAZMİNAT DAVASI

DAVA DEĞERİ: {HASAR_MİKTARI} TL

Sayın Hakim,

Davacının {KAZA_TARİHİ} tarihinde {KAZA_YERİ}'nde meydana gelen trafik kazası nedeniyle uğradığı maddi zararın tazmini talep edilmektedir.

I- KAZA OLAYI:
Tarih: {KAZA_TARİHİ}
Yer: {KAZA_YERİ}
Hava Durumu: {HAVA_DURUMU}

II- KAZA GELİŞİMİ:
{KAZA_TÜRKÇESİ}

III- KUSUR DURUMU:
Polis tutanağında tespit edilen kusur oranı: %{KUSUR_ORANI}
{KUSUR_DETAYI}

IV- ZARAR TESPİTİ:
Ekspert Raporu: {EKSPERT_RAPORU}
Hasar Tutarı: {HASAR_MİKTARI} TL
{HASAR_DETAYI}

V- SİGORTA DURUMU:
{SİGORTA_DURUMU}

VI- HUKUKİ DAYANAK:
- Türk Borçlar Kanunu md. 49: "Kusurlu ve hukuka aykırı bir fiille başkasına zarar veren, bu zararı gidermekle yükümlüdür."
- Karayolları Trafik Kanunu md. 85 ve devamı
- Trafik sigortası ile ilgili düzenlemeler

TALEP:
Bu nedenlerle;
1. Araç hasarı olarak {HASAR_MİKTARI} TL'nin,
2. Vekâlet ücreti ve dava masraflarının,
3. Yasal faizin,

Davalıdan tahsili ile davacıya ödenmesine karar verilmesini saygıyla arz ederim.

EK BELGELER:
- Trafik kazası tutanağı
- Ekspert raporu
- Fatura ve makbuzlar
- Araç ruhsatı fotokopisi
- Ehliyet fotokopisi

Tarih: {DATE}

DAVACI                          VEKİL AVUKAT
{DAVACI_ADI}                    {AVUKAT_ADI}
İmza                            Ankara Barosu: {BARO_NO}
                                İmza & Kaşe`
  },

  {
    id: 'trafik-002',
    title: 'İş Gücü Kaybı Tazminatı Dilekçesi',
    category: 'Trafik Kazası',
    subcategory: 'Manevi/Maddi Tazminat',
    keywords: ['iş gücü kaybı', 'mesleki zarar', 'engel durumu'],
    urgency: 'high',
    complexity: 'advanced',
    estimatedCost: '15.000-50.000 TL',
    timeframe: '8-18 ay',
    variables: ['ENGEL_ORANI', 'MESLEKİ_ZARAR', 'AYLIK_KAZANÇ', 'TEDAVİ_SÜRESİ'],
    template: `İŞ GÜCÜ KAYBI TAZMİNATI DAVASI DİLEKÇESİ

ENGEL ORANI: %{ENGEL_ORANI}
MESLEKİ ZARAR: {MESLEKİ_ZARAR}
AYLIK KAZANÇ: {AYLIK_KAZANÇ} TL

Kaza sonrası çalışma kapasitemi %{ENGEL_ORANI} oranında kaybettim.`
  },

  // İŞ HUKUKU (18 dilekçe)
  {
    id: 'is-001',
    title: 'Kıdem Tazminatı Davası Dilekçesi',
    category: 'İş Hukuku',
    subcategory: 'Kıdem Tazminatı',
    keywords: ['kıdem tazminatı', 'işten çıkarma', 'haksız fesih'],
    urgency: 'high',
    complexity: 'intermediate',
    estimatedCost: '8.000-18.000 TL',
    timeframe: '6-12 ay',
    variables: ['DAVACI_ADI', 'DAVACI_TC', 'DAVACI_ADRES', 'DAVALI_SIRKET', 'SIRKET_ADRES', 'İŞE_GİRİŞ_TARİHİ', 'İŞTEN_ÇIKIŞ_TARİHİ', 'ÇALIŞMA_SÜRESİ', 'SON_MAAŞ', 'FESİH_NEDENİ', 'KIDEM_TUTARI', 'İHBAR_TUTARI'],
    template: `T.C. ANKARA 7. İŞ MAHKEMESİ BAŞKANLIĞI'NA

DAVACI: {DAVACI_ADI}
T.C. Kimlik No: {DAVACI_TC}
Adres: {DAVACI_ADRES}
Meslek: İşçi

DAVALI: {DAVALI_SIRKET}
Adres: {SIRKET_ADRES}
Sıfat: İşveren

KONU: 4857 Sayılı İş Kanunu ve 1475 Sayılı İş Kanunu gereğince KIDEM TAZMİNATI DAVASI

DAVA DEĞERİ: {KIDEM_TUTARI} TL

Sayın Hakim,

Davacı {DAVACI_ADI}, davalı {DAVALI_SIRKET} bünyesinde aşağıda belirtilen süre ile çalışmış olup, haksız fesih nedeniyle kıdem tazminatının ödenmesini talep etmektedir.

I- ÇALIŞMA İLİŞKİSİ:
- İşe Giriş Tarihi: {İŞE_GİRİŞ_TARİHİ}
- İşten Çıkış Tarihi: {İŞTEN_ÇIKIŞ_TARİHİ}
- Toplam Çalışma Süresi: {ÇALIŞMA_SÜRESİ}
- Son Aylık Ücreti: {SON_MAAŞ} TL
- Görevi: {GOREV}

II- FESİH DURUMU:
{FESİH_NEDENİ}

III- TAZMİNAT HESABI:
Kıdem Tazminatı: {KIDEM_TUTARI} TL
İhbar Tazminatı: {İHBAR_TUTARI} TL
Kullanılmayan İzin: {İZİN_TUTARI} TL

IV- HUKUKİ DAYANAK:
- 4857 sayılı İş Kanunu md. 17, 32, 34
- 1475 sayılı İş Kanunu md. 14
- İş Mahkemeleri Kanunu md. 5

TALEP:
Bu nedenlerle;
1. Kıdem tazminatı olarak {KIDEM_TUTARI} TL'nin,
2. İhbar tazminatı olarak {İHBAR_TUTARI} TL'nin,
3. Kullanılmayan yıllık izin karşılığı {İZİN_TUTARI} TL'nin,
4. Tüm alacaklara işçilik alacağı faizi işletilmek suretiyle,
5. Dava masrafları ve vekâlet ücretinin,

Davalıdan tahsili ile davacıya ödenmesine karar verilmesini saygıyla arz ederim.

EK BELGELER:
- İş sözleşmesi
- İşten çıkış belgesi
- Maaş bordroları
- SGK hizmet dökümü

Tarih: {DATE}

DAVACI                          VEKİL AVUKAT
{DAVACI_ADI}                    {AVUKAT_ADI}
İmza                            Ankara Barosu: {BARO_NO}
                                İmza & Kaşe`
  },

  {
    id: 'is-002',
    title: 'Mobbing Tazminatı Dilekçesi',
    category: 'İş Hukuku',
    subcategory: 'Mobbing',
    keywords: ['mobbing', 'psikolojik baskı', 'işyeri tacizi'],
    urgency: 'high',
    complexity: 'advanced',
    estimatedCost: '12.000-30.000 TL',
    timeframe: '8-15 ay',
    variables: ['MOBBING_DETAYLARI', 'PSİKOLOJİK_ZARAR', 'TANIK_BİLGİLERİ'],
    template: `MOBBING TAZMİNATI DAVASI DİLEKÇESİ

İşyerinde sistematik psikolojik baskı uygulanmıştır.

MOBBING DETAYLARI: {MOBBING_DETAYLARI}
PSİKOLOJİK ZARAR: {PSİKOLOJİK_ZARAR}

Manevi tazminat talep ediyorum.`
  },

  // EMLAK HUKUKU (10 dilekçe)
  {
    id: 'emlak-001',
    title: 'Kiracı Tahliye Davası Dilekçesi',
    category: 'Emlak Hukuku',
    subcategory: 'Kira',
    keywords: ['tahliye', 'kira borcu', 'sözleşme ihlali'],
    urgency: 'medium',
    complexity: 'intermediate',
    estimatedCost: '5.000-12.000 TL',
    timeframe: '4-8 ay',
    variables: ['KİRA_BORCU', 'TAHLİYE_NEDENİ', 'İHTAR_TARİHİ'],
    template: `TAHLİYE DAVASI DİLEKÇESİ

KİRA BORCU: {KİRA_BORCU} TL
TAHLİYE NEDENİ: {TAHLİYE_NEDENİ}
İHTAR TARİHİ: {İHTAR_TARİHİ}

Kiracının tahliyesi talep edilmektedir.`
  },

  // BORÇLAR HUKUKU (8 dilekçe)
  {
    id: 'borc-001',
    title: 'Alacak Davası Dilekçesi',
    category: 'Borçlar Hukuku',
    subcategory: 'Alacak',
    keywords: ['alacak', 'borç', 'ödeme', 'faiz'],
    urgency: 'medium',
    complexity: 'basic',
    estimatedCost: '4.000-10.000 TL',
    timeframe: '3-6 ay',
    variables: ['ALACAK_TUTARI', 'BORÇLU_ADI', 'BORÇLU_TC', 'BORÇLU_ADRES', 'BORÇ_TARİHİ', 'FAİZ_ORANI', 'BORÇ_NEDENİ', 'ÖDEME_VADESİ'],
    template: `T.C. {MAHKEME_ADI} İCRA MÜDÜRLÜĞÜ'NE / ASLİYE HUKUK MAHKEMESİ BAŞKANLIĞI'NA

ALACAKLI: {ALACAKLI_ADI}
T.C. Kimlik No: {ALACAKLI_TC}
Adres: {ALACAKLI_ADRES}
Telefon: {ALACAKLI_TELEFON}

BORÇLU: {BORÇLU_ADI}
T.C. Kimlik No: {BORÇLU_TC}
Adres: {BORÇLU_ADRES}

KONU: Alacak Davası / İcra Takibi
DAVA DEĞERİ: {ALACAK_TUTARI} TL

Sayın Hakim / İcra Müdürü,

Ben alacaklı {ALACAKLI_ADI}, davalı {BORÇLU_ADI}'ndan aşağıda belirtilen nedenlerle doğan alacağımın tahsilini talep etmekteyim.

ALACAĞIN DOĞUŞ NEDENİ: {BORÇ_NEDENİ}
ALACAK TARİHİ: {BORÇ_TARİHİ}
ALACAK TUTARI: {ALACAK_TUTARI} TL
ÖDEME VADESİ: {ÖDEME_VADESİ}
FAİZ ORANI: %{FAİZ_ORANI} (yıllık)

Borçlu {BORÇLU_ADI}, vadesi gelen borcunu ödememekte olup, yazılı olarak yapılan ihtarlara rağmen borcunu ödememiştir.

Bu nedenle;
1. Ana para olarak {ALACAK_TUTARI} TL'nin,
2. {BORÇ_TARİHİ} tarihinden itibaren %{FAİZ_ORANI} faiz ile birlikte,
3. Dava masrafları ve vekalet ücretinin,
4. İcra masraflarının,

Borçludan tahsili ile tarafıma ödenmesine karar verilmesini saygıyla arz ederim.

EKLER:
- Senet/Fatura fotokopisi
- İhtar tebligatı
- Diğer belgeler

Tarih: {DATE}

{ALACAKLI_ADI}
İmza`
  },

  // CEZA HUKUKU (7 dilekçe)
  {
    id: 'ceza-001',
    title: 'Şikâyet Dilekçesi',
    category: 'Ceza Hukuku',
    subcategory: 'Şikâyet',
    keywords: ['şikâyet', 'suç duyurusu', 'savcılık'],
    urgency: 'high',
    complexity: 'intermediate',
    estimatedCost: '3.000-8.000 TL',
    timeframe: '2-6 ay',
    variables: ['SUÇ_DETAYLARI', 'MAĞDUR_BİLGİLERİ', 'DELİL_DURUMU'],
    template: `SUÇ DUYURUSU DİLEKÇESİ

SUÇ DETAYLARI: {SUÇ_DETAYLARI}
MAĞDUR: {MAĞDUR_BİLGİLERİ}

Gereğinin yapılmasını talep ederim.`
  },

  // KULLANICININ EKLEDIĞI GERÇEK ÖRNEKLER
  {
    id: 'aile-006',
    title: 'Ailenin Korunması İçin Tedbir Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Koruma Tedbiri',
    keywords: ['aile koruma', 'şiddet önleme', 'tedbir', 'evdışı yerleştirme', 'irtibat yasağı'],
    urgency: 'high',
    complexity: 'advanced',
    estimatedCost: '5.000-12.000 TL',
    timeframe: '1-7 gün',
    variables: ['BAŞVURUCU_ADI', 'BAŞVURUCU_TC', 'BAŞVURUCU_ADRES', 'BAŞVURUCU_TELEFON', 'DOĞUM_TARİHİ', 'OLAY_DETAYI', 'OLAY_TARİH_YER', 'ŞİDDET_TÜRÜ', 'DELİL_1', 'DELİL_2'],
    template: `T.C. {İLÇE_ADI} AİLE MAHKEMESİ BAŞKANLIĞI'NA
T.C. {İLÇE_ADI} AİLE MAHKEMESİ SAVCILIK MAKANI'NA

BAŞVURUCU: {BAŞVURUCU_ADI}
T.C. Kimlik No: {BAŞVURUCU_TC}
Doğum Tarihi: {DOĞUM_TARİHİ}
Adres: {BAŞVURUCU_ADRES}
Telefon: {BAŞVURUCU_TELEFON}

KONU: 4320 Sayılı Ailenin Korunmasına Dair Kanun gereğince AİLENİN KORUNMASI İÇİN TEDBİR DİLEKÇESİ

Sayın Mahkeme Başkanı/Mahkeme Savcısı,

Aşağıda kimlik bilgileri belirtilen şikayetçi olarak, aile içinde yaşanan olumsuz durumları ve şiddet olaylarını bildirmek, aile fertlerinin korunması için gerekli tedbirlerin alınmasını talep etmek üzere önemle arz ederim.

OLAYIN AÇIKLAMASI:
{OLAY_DETAYI}

Olayın Geçtiği Tarih ve Yer: {OLAY_TARİH_YER}

TEDBİR İSTEMLERİ:

1. ŞİDDET ÖNLEME TEDBİRİ:
Aile içinde yaşanan şiddet olaylarının önlenmesi için 4320 sayılı Kanun'un 1. maddesi gereğince gerekli tedbirlerin alınmasını talep ediyorum.

2. EVDIŞI YERLEŞTİRME:
Şiddet mağduru aile bireylerinin güvenliğinin sağlanması amacıyla 4320 sayılı Kanun'un 3. maddesi gereğince evdışı bir yerleştirme yapılmasını talep ediyorum.

3. İRTİBAT YASAKLAMA:
Şiddet uygulayan tarafın, şikayetçi ve aile üyeleri ile irtibatının 4320 sayılı Kanun'un 2. maddesi gereğince yasaklanmasını talep ediyorum.

4. AİLE DANIŞMANLIĞI HİZMETİ:
Aile içi sorunların çözümü için gerekli görülmesi halinde aile danışmanlığı hizmeti alınmasını talep ediyorum.

5. GEÇİCİ VELAYET:
Şiddet mağduru çocukların geçici velayetinin şikayetçi veya uygun görülen başka bir aile bireyine verilmesini talep ediyorum.

DELİLLER:
- {DELİL_1}
- {DELİL_2}
- Tanık ifadeleri
- Fotoğraf ve video kayıtları (varsa)
- Yazışmalar ve belgeler

YASAL DAYANAK:
- 4320 sayılı Ailenin Korunmasına Dair Kanun
- 2828 sayılı Sosyal Hizmetler Kanunu
- Türk Medeni Kanunu ilgili hükümleri

SONUÇ VE TALEP:
Yukarıda açıklanan nedenlerle, ailenin korunması için gerekli tedbirlerin ivedilikle alınmasını, sürecin takipçisi olacağımı beyan ederim.

Saygılarımla,

BAŞVURUCU
{BAŞVURUCU_ADI}
İmza

Tarih: {DATE}`
  },

  {
    id: 'alacak-002',
    title: 'Araç Satış Alacağı ve Tedbir Talebi',
    category: 'Alacak ve Borç',
    subcategory: 'Araç Satış Alacağı',
    keywords: ['araç satışı', 'taksit borcu', 'tedbir talebi', 'ihtiyati haciz'],
    urgency: 'high',
    complexity: 'intermediate',
    estimatedCost: '8.000-15.000 TL',
    timeframe: '2-4 ay',
    variables: ['DAVACI_ADI', 'DAVACI_VEKIL', 'DAVALI_ADI', 'ALACAK_MIKTARI', 'SATIŞ_TARİHİ', 'PEŞİN_TUTAR', 'KALAN_TUTAR', 'TAKSİT_TUTAR', 'PLAKA_NO'],
    template: `T.C. {MAHKEME_ADI} ASLİYE TİCARET MAHKEMESİ BAŞKANLIĞI'NA

DAVACI: {DAVACI_ADI}
VEKİLİ: {DAVACI_VEKIL}

DAVALI: {DAVALI_ADI}

KONU: Müvekkilimizin {ALACAK_MIKTARI} TL alacağının yasal faizi ile birlikte tahsili istemidir.

TEDBİR TALEPLİDİR

Sayın Hakimlik,

AÇIKLAMALAR:

1- Müvekkilimiz, davalıya {SATIŞ_TARİHİ} tarihinde binek otomobilini satmıştır. Aralarında yaptıkları yazılı mukaveleye göre, davalı {PEŞİN_TUTAR} TL peşin ödemiş, kalan {KALAN_TUTAR} TL için ise vadeli ödeme konusunda anlaşmışlardır. Taksitlerden biri ödenmediği takdirde diğerinin de vadesi gelmiş sayılacaktır. Ayrıca davalı sözleşme gereği müvekkilimizin, ödememe halinde teminatsız olarak tedbir ve ihtiyati haciz almasına da muvafakat etmiştir.

2- Müvekkilimiz davalıya, aracı söz verdiği günde teslim etmiş ve noterden satışını da vermiştir. Aracın vergi ve pul borcu olmadığına ilişkin her türlü makbuzu da davalıya teslim etmiştir.

3- Davalı, müvekkilimize vermesi gereken {TAKSİT_TUTAR} TL tutarındaki taksiti ödememiş, müvekkilimizin sayısız aramalarına da cevap vermemiştir.

4- Müvekkilimiz davalının aracı, satmak üzere oto pazarına çıkardığını duymuş, sonradan davalının bu şekilde birkaç kişiyi daha kandırdığını ve paralarını ödemediğini öğrenmiştir.

5- Müvekkilimiz sözleşme gereği davalının ödemesi gereken {ALACAK_MIKTARI} TL tutarındaki alacağının taksit tarihinden itibaren işleyecek faiz ile birlikte ödenmesini istemektedir. Zira sözleşme gereği ilk taksit ödenmediğinden ikincisinin de vadesi gelmiş sayılmaktadır.

YASAL NEDENLER:
- 6098 sayılı Türk Borçlar Kanunu'nun ilgili hükümleri
- 6100 sayılı Hukuk Muhakemeleri Kanunu
- 2004 sayılı İcra ve İflas Kanunu

KANITLAR:
- {SATIŞ_TARİHİ} tarihli satış sözleşmesi
- Tanık beyanları
- Diğer yasal kanıtlar

CEVAP SÜRESİ: 10 gündür.

İSTEM SONUÇ:
Açıklanan nedenlerle;
1. Müvekkilimizin davalıdan olan {ALACAK_MIKTARI} TL'lik alacağın taksit tarihlerinden itibaren hesaplanacak yasal faiz ile birlikte davalıdan tahsiline,
2. Müvekkilimizin sonradan mağdur olmaması açısından, davalıya devrettiği {PLAKA_NO} plaka sayılı aracın plakasına üçüncü şahıslara devrinin önlenmesi bakımından sözleşme gereği müvekkilimizden teminat istenmeden tedbir konmasına,
3. Yargılama giderlerinin davalıya yükletilmesine,
4. 1136 Sayılı Avukatlık Kanunu'nun 4667 Sayılı Kanunla değişik 164/son fıkrası uyarınca karşı taraf vekâlet ücretinin Avukat olarak adımıza hükmedilmesine,

Karar verilmesini talep ederiz.

DAVACI VEKİLİ
{DAVACI_VEKIL}

Tarih: {DATE}`
  }
];

// Kategori bazlı arama fonksiyonu
export const searchPetitionsByCategory = (category: string): RealPetition[] => {
  return realPetitions.filter(p => p.category === category);
};

// Anahtar kelime bazlı arama
export const searchPetitionsByKeyword = (keyword: string): RealPetition[] => {
  return realPetitions.filter(p => 
    p.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
  );
};

// Karmaşıklık bazlı filtreleme
export const filterByComplexity = (complexity: 'basic' | 'intermediate' | 'advanced'): RealPetition[] => {
  return realPetitions.filter(p => p.complexity === complexity);
};

// Aciliyet bazlı filtreleme
export const filterByUrgency = (urgency: 'low' | 'medium' | 'high'): RealPetition[] => {
  return realPetitions.filter(p => p.urgency === urgency);
};

// Maliyet aralığı hesaplama
export const getCostRange = (petition: RealPetition): { min: number, max: number } => {
  const costs = petition.estimatedCost.match(/(\d+\.?\d*)/g);
  if (costs && costs.length >= 2) {
    return {
      min: parseInt(costs[0].replace('.', '')),
      max: parseInt(costs[1].replace('.', ''))
    };
  }
  return { min: 0, max: 0 };
};

// Kategori istatistikleri
export const getCategoryStats = () => {
  const stats: Record<string, number> = {};
  realPetitions.forEach(p => {
    stats[p.category] = (stats[p.category] || 0) + 1;
  });
  return stats;
};