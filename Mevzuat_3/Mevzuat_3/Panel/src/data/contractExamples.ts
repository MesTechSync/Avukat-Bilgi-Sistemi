// Sözleşme Örnekleri Veritabanı

export interface ContractExample {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  content: string;
  keywords: string[];
  variables: string[];
}

// İş Sözleşmesi Örnekleri
export const employmentContracts: ContractExample[] = [
  {
    id: 'emp-001',
    title: 'Belirsiz Süreli İş Sözleşmesi',
    category: 'İş Hukuku',
    subcategory: 'İş Sözleşmesi',
    keywords: ['iş sözleşmesi', 'belirsiz süreli', 'çalışan', 'maaş'],
    variables: ['COMPANY_NAME', 'EMPLOYEE_NAME', 'POSITION', 'SALARY', 'START_DATE'],
    content: `BELİRSİZ SÜRELİ İŞ SÖZLEŞMESİ

İŞVEREN: {COMPANY_NAME}
Vergi Dairesi: {TAX_OFFICE}
Vergi No: {TAX_NO}
Adres: {COMPANY_ADDRESS}
Telefon: {COMPANY_PHONE}

İŞÇİ: {EMPLOYEE_NAME}
T.C. Kimlik No: {EMPLOYEE_TC}
Doğum Tarihi: {BIRTH_DATE}
Adres: {EMPLOYEE_ADDRESS}
Telefon: {EMPLOYEE_PHONE}

Yukarıda kimlik bilgileri yazılı taraflar arasında aşağıdaki şartlarla iş sözleşmesi akdedilmiştir:

MADDE 1 - İŞİN KONUSU VE YERİ
İşçi, işverenin {WORKPLACE_ADDRESS} adresindeki işyerinde {POSITION} pozisyonunda çalışacaktır.

MADDE 2 - İŞE BAŞLAMA TARİHİ
İşçi {START_DATE} tarihinde işe başlayacaktır.

MADDE 3 - ÜCRET
İşçinin aylık brüt ücreti {SALARY} TL'dir. Bu ücret her yıl yasal artış oranında artırılacaktır.

MADDE 4 - ÇALIŞMA SAAVLERİ
Haftalık çalışma süresi {WEEKLY_HOURS} saattir. Günlük çalışma {DAILY_HOURS} saat olup, mesai saatleri {START_TIME} - {END_TIME} arasındadır.

MADDE 5 - DENEME SÜRESİ
Bu sözleşmede {PROBATION_PERIOD} aylık deneme süresi uygulanacaktır.

MADDE 6 - YILLIK İZİN
İşçi yıllık ücretli izin hakkını 4857 sayılı İş Kanunu hükümlerine göre kullanacaktır.

MADDE 7 - FESİH
Bu sözleşme 4857 sayılı İş Kanunu hükümlerine göre feshedilebilir.

MADDE 8 - DİĞER HÜKÜMLER
Bu sözleşmede hüküm bulunmayan hallerde 4857 sayılı İş Kanunu ve ilgili mevzuat hükümleri uygulanır.

Bu sözleşme {CONTRACT_DATE} tarihinde 2 nüsha halinde düzenlenmiş olup, taraflar birer nüshasını almışlardır.

İŞVEREN                           İŞÇİ
{COMPANY_NAME}                     {EMPLOYEE_NAME}
İmza: _____________                İmza: _____________`
  }
];

// Kira Sözleşmesi Örnekleri
export const rentalContracts: ContractExample[] = [
  {
    id: 'rent-001',
    title: 'Konut Kira Sözleşmesi',
    category: 'Kira Hukuku',
    subcategory: 'Konut Kirası',
    keywords: ['kira sözleşmesi', 'konut', 'kira bedeli', 'depozito'],
    variables: ['LANDLORD_NAME', 'TENANT_NAME', 'PROPERTY_ADDRESS', 'MONTHLY_RENT', 'DEPOSIT'],
    content: `KONUT KİRA SÖZLEŞMESİ

KİRALAYAN: {LANDLORD_NAME}
T.C. Kimlik No: {LANDLORD_TC}
Adres: {LANDLORD_ADDRESS}
Telefon: {LANDLORD_PHONE}

KİRACI: {TENANT_NAME}
T.C. Kimlik No: {TENANT_TC}
Adres: {TENANT_ADDRESS}
Telefon: {TENANT_PHONE}

Yukarıda kimlik bilgileri yazılı taraflar arasında aşağıdaki şartlarla kira sözleşmesi akdedilmiştir:

MADDE 1 - KİRALANAN GAYRİMENKUL
{PROPERTY_ADDRESS} adresinde bulunan, {ROOM_COUNT} oda {HALL_COUNT} salon, {TOTAL_AREA} m² yüzölçümündeki konut kiraya verilmiştir.

MADDE 2 - KİRA SÜRESİ
Kira süresi {CONTRACT_DURATION} yıldır. Sözleşme {START_DATE} tarihinde başlayıp {END_DATE} tarihinde sona erecektir.

MADDE 3 - KİRA BEDELİ
Aylık kira bedeli {MONTHLY_RENT} TL'dir. Kira bedeli her yıl TÜFE oranında artırılacaktır.

MADDE 4 - ÖDEME KOŞULLARI
Kira bedeli her ayın {PAYMENT_DAY}. günü peşin olarak ödenecektir.

MADDE 5 - DEPOZİTO
Kiracı tarafından {DEPOSIT} TL depozito ödenmiştir.

MADDE 6 - AİDAT VE GİDERLER
{EXPENSES_CLAUSE}

MADDE 7 - KULLANIM ŞARTI
Gayrimenkul sadece konut olarak kullanılacaktır.

MADDE 8 - FESİH
Bu sözleşme 6098 sayılı Türk Borçlar Kanunu hükümlerine göre feshedilebilir.

Bu sözleşme {CONTRACT_DATE} tarihinde 2 nüsha halinde düzenlenmiş olup, taraflar birer nüshasını almışlardır.

KİRALAYAN                         KİRACI
{LANDLORD_NAME}                    {TENANT_NAME}
İmza: _____________               İmza: _____________`
  }
];

// Ticari Sözleşme Örnekleri
export const commercialContracts: ContractExample[] = [
  {
    id: 'comm-001',
    title: 'Hizmet Alım Sözleşmesi',
    category: 'Ticari Hukuk',
    subcategory: 'Hizmet Sözleşmesi',
    keywords: ['hizmet sözleşmesi', 'ticari', 'hizmet bedeli', 'teslim'],
    variables: ['CLIENT_COMPANY', 'PROVIDER_COMPANY', 'SERVICE_DESCRIPTION', 'SERVICE_FEE', 'DELIVERY_DATE'],
    content: `HİZMET ALIM SÖZLEŞMESİ

MÜŞTERİ: {CLIENT_COMPANY}
Vergi Dairesi: {CLIENT_TAX_OFFICE}
Vergi No: {CLIENT_TAX_NO}
Adres: {CLIENT_ADDRESS}

HİZMET SAĞLAYICI: {PROVIDER_COMPANY}
Vergi Dairesi: {PROVIDER_TAX_OFFICE}
Vergi No: {PROVIDER_TAX_NO}
Adres: {PROVIDER_ADDRESS}

Yukarıda kimlik bilgileri yazılı taraflar arasında aşağıdaki şartlarla hizmet alım sözleşmesi akdedilmiştir:

MADDE 1 - HİZMETİN KONUSU
Hizmet sağlayıcı, müşteri için {SERVICE_DESCRIPTION} hizmetini verecektir.

MADDE 2 - HİZMET BEDELİ
Toplam hizmet bedeli {SERVICE_FEE} TL + KDV'dir.

MADDE 3 - ÖDEME KOŞULLARI
{PAYMENT_TERMS}

MADDE 4 - TESLİM TARİHİ
Hizmet {DELIVERY_DATE} tarihine kadar tamamlanacaktır.

MADDE 5 - YÜKÜMLÜLÜKLER
{OBLIGATIONS_CLAUSE}

MADDE 6 - GARANTİ
{WARRANTY_CLAUSE}

MADDE 7 - FESİH VE İPTAL
{TERMINATION_CLAUSE}

Bu sözleşme {CONTRACT_DATE} tarihinde 2 nüsha halinde düzenlenmiş olup, taraflar birer nüshasını almışlardır.

MÜŞTERİ                           HİZMET SAĞLAYICI
{CLIENT_COMPANY}                   {PROVIDER_COMPANY}
İmza: _____________               İmza: _____________`
  }
];

// Tüm sözleşme örnekleri
export const allContractExamples = [
  ...employmentContracts,
  ...rentalContracts,
  ...commercialContracts
];

// Kategori bazında arama
export const getContractsByCategory = (category: string): ContractExample[] => {
  return allContractExamples.filter(contract => 
    contract.category.toLowerCase().includes(category.toLowerCase())
  );
};

// Anahtar kelime bazında arama
export const searchContracts = (keyword: string): ContractExample[] => {
  return allContractExamples.filter(contract =>
    contract.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase())) ||
    contract.title.toLowerCase().includes(keyword.toLowerCase()) ||
    contract.content.toLowerCase().includes(keyword.toLowerCase())
  );
};