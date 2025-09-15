import React, { useState } from 'react';
import { FileText, Download, Copy, Save, Wand2, Building, Users, Calendar, DollarSign } from 'lucide-react';

interface ContractTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: ContractField[];
  template: string;
}

interface ContractField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

const contractTemplates: ContractTemplate[] = [
  {
    id: 'employment',
    name: 'İş Sözleşmesi',
    category: 'İş Hukuku',
    description: 'Belirsiz süreli iş sözleşmesi şablonu',
    fields: [
      { id: 'company_name', label: 'Şirket Adı', type: 'text', required: true },
      { id: 'company_address', label: 'Şirket Adresi', type: 'textarea', required: true },
      { id: 'employee_name', label: 'Çalışan Adı Soyadı', type: 'text', required: true },
      { id: 'employee_tc', label: 'T.C. Kimlik No', type: 'text', required: true },
      { id: 'employee_address', label: 'Çalışan Adresi', type: 'textarea', required: true },
      { id: 'position', label: 'Pozisyon', type: 'text', required: true },
      { id: 'salary', label: 'Maaş (TL)', type: 'number', required: true },
      { id: 'start_date', label: 'İşe Başlama Tarihi', type: 'date', required: true },
      { id: 'work_hours', label: 'Haftalık Çalışma Saati', type: 'number', required: true, placeholder: '45' },
      { id: 'probation_period', label: 'Deneme Süresi (Ay)', type: 'number', required: false, placeholder: '2' }
    ],
    template: `İŞ SÖZLEŞMESİ

İşveren: {COMPANY_NAME}
Adres: {COMPANY_ADDRESS}

İşçi: {EMPLOYEE_NAME}
T.C. Kimlik No: {EMPLOYEE_TC}
Adres: {EMPLOYEE_ADDRESS}

Yukarıda kimlik bilgileri yazılı taraflar arasında aşağıdaki şartlarla iş sözleşmesi akdedilmiştir.

MADDE 1 - İŞİN KONUSU VE YERİ
İşçi, işveren tarafından {POSITION} pozisyonunda çalıştırılacaktır. İş, işverenin yukarıda belirtilen adresinde ifa edilecektir.

MADDE 2 - İŞE BAŞLAMA TARİHİ
İşçi {START_DATE} tarihinde işe başlayacaktır.

MADDE 3 - ÇALIŞMA SÜRESİ
Haftalık çalışma süresi {WORK_HOURS} saattir. Günlük çalışma süreleri ve molalar İş Kanunu hükümlerine göre düzenlenecektir.

MADDE 4 - ÜCRET
İşçinin aylık brüt ücreti {SALARY} TL'dir. Ücret her ayın sonunda ödenecektir.

MADDE 5 - DENEME SÜRESİ
{PROBATION_PERIOD} aylık deneme süresi uygulanacaktır.

MADDE 6 - GENEL HÜKÜMLER
Bu sözleşmede hüküm bulunmayan hallerde İş Kanunu ve ilgili mevzuat hükümleri uygulanır.

Sözleşme iki nüsha halinde düzenlenerek taraflarca imzalanmıştır.

Tarih: {DATE}

İşveren                    İşçi
{COMPANY_NAME}            {EMPLOYEE_NAME}`
  },
  {
    id: 'rental',
    name: 'Kira Sözleşmesi',
    category: 'Emlak Hukuku',
    description: 'Konut kira sözleşmesi şablonu',
    fields: [
      { id: 'landlord_name', label: 'Kiralayan Adı Soyadı', type: 'text', required: true },
      { id: 'landlord_tc', label: 'Kiralayan T.C. No', type: 'text', required: true },
      { id: 'tenant_name', label: 'Kiracı Adı Soyadı', type: 'text', required: true },
      { id: 'tenant_tc', label: 'Kiracı T.C. No', type: 'text', required: true },
      { id: 'property_address', label: 'Gayrimenkul Adresi', type: 'textarea', required: true },
      { id: 'monthly_rent', label: 'Aylık Kira (TL)', type: 'number', required: true },
      { id: 'deposit', label: 'Depozito (TL)', type: 'number', required: true },
      { id: 'contract_duration', label: 'Sözleşme Süresi (Yıl)', type: 'number', required: true },
      { id: 'start_date', label: 'Başlangıç Tarihi', type: 'date', required: true },
      { id: 'payment_day', label: 'Kira Ödeme Günü', type: 'number', required: true, placeholder: '5' }
    ],
    template: `KONUT KİRA SÖZLEŞMESİ

Kiralayan: {LANDLORD_NAME}
T.C. Kimlik No: {LANDLORD_TC}

Kiracı: {TENANT_NAME}
T.C. Kimlik No: {TENANT_TC}

Gayrimenkul: {PROPERTY_ADDRESS}

MADDE 1 - KONU
Kiralayan, yukarıda adresi belirtilen gayrimenkulü kiracıya kiralamıştır.

MADDE 2 - SÜRESİ
Kira süresi {CONTRACT_DURATION} yıldır. Sözleşme {START_DATE} tarihinde başlar.

MADDE 3 - KİRA BEDELİ
Aylık kira bedeli {MONTHLY_RENT} TL'dir. Kira her ayın {PAYMENT_DAY}. günü ödenecektir.

MADDE 4 - DEPOZİTO
Kiracı {DEPOSIT} TL depozito vermiştir. Depozito sözleşme sonunda iade edilecektir.

MADDE 5 - YÜKÜMLÜLÜKLER
Kiracı gayrimenkulü özenle kullanacak, bakım ve onarımlarını yaptıracaktır.

MADDE 6 - GENEL HÜKÜMLER
Bu sözleşmede hüküm bulunmayan hallerde Türk Borçlar Kanunu hükümleri uygulanır.

Tarih: {DATE}

Kiralayan                 Kiracı
{LANDLORD_NAME}          {TENANT_NAME}`
  },
  {
    id: 'commercial',
    name: 'Ticari Sözleşme',
    category: 'Ticaret Hukuku',
    description: 'Mal/hizmet alım satım sözleşmesi',
    fields: [
      { id: 'seller_company', label: 'Satıcı Firma', type: 'text', required: true },
      { id: 'seller_address', label: 'Satıcı Adresi', type: 'textarea', required: true },
      { id: 'buyer_company', label: 'Alıcı Firma', type: 'text', required: true },
      { id: 'buyer_address', label: 'Alıcı Adresi', type: 'textarea', required: true },
      { id: 'product_service', label: 'Mal/Hizmet Tanımı', type: 'textarea', required: true },
      { id: 'total_amount', label: 'Toplam Tutar (TL)', type: 'number', required: true },
      { id: 'payment_terms', label: 'Ödeme Şartları', type: 'select', required: true, options: ['Peşin', '30 Gün Vadeli', '60 Gün Vadeli', '90 Gün Vadeli'] },
      { id: 'delivery_date', label: 'Teslimat Tarihi', type: 'date', required: true },
      { id: 'delivery_address', label: 'Teslimat Adresi', type: 'textarea', required: true }
    ],
    template: `TİCARİ SÖZLEŞME

Satıcı: {SELLER_COMPANY}
Adres: {SELLER_ADDRESS}

Alıcı: {BUYER_COMPANY}
Adres: {BUYER_ADDRESS}

MADDE 1 - KONU
Bu sözleşme konusu: {PRODUCT_SERVICE}

MADDE 2 - BEDEL
Toplam sözleşme bedeli {TOTAL_AMOUNT} TL'dir.

MADDE 3 - ÖDEME
Ödeme şartları: {PAYMENT_TERMS}

MADDE 4 - TESLİMAT
Teslimat tarihi: {DELIVERY_DATE}
Teslimat adresi: {DELIVERY_ADDRESS}

MADDE 5 - YÜKÜMLÜLÜKLER
Satıcı, sözleşme konusu mal/hizmeti zamanında ve sözleşmeye uygun şekilde teslim edecektir.
Alıcı, bedeli sözleşme şartlarına göre ödeyecektir.

MADDE 6 - GENEL HÜKÜMLER
Bu sözleşmede hüküm bulunmayan hallerde Türk Borçlar Kanunu hükümleri uygulanır.

Tarih: {DATE}

Satıcı                    Alıcı
{SELLER_COMPANY}         {BUYER_COMPANY}`
  }
];

export default function ContractGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedContract, setGeneratedContract] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setFormData({});
    setGeneratedContract('');
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const generateContract = () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);

    setTimeout(() => {
      let contract = selectedTemplate.template;
      
      // Replace placeholders with form data
      Object.entries(formData).forEach(([key, value]) => {
        const placeholder = `{${key.toUpperCase()}}`;
        contract = contract.replace(new RegExp(placeholder, 'g'), value || `[${key}]`);
      });

      // Add current date if not provided
      const today = new Date().toLocaleDateString('tr-TR');
      contract = contract.replace(/\{DATE\}/g, today);

      setGeneratedContract(contract);
      setIsGenerating(false);
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContract);
    alert('Sözleşme panoya kopyalandı!');
  };

  const downloadContract = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContract], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedTemplate?.name || 'sozlesme'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Persist generated contract on DICTATE_SAVE as a convenience
  React.useEffect(() => {
    const onVoiceSave = () => {
      if (!generatedContract) return;
      try {
        const key = `contract_${selectedTemplate?.id || 'custom'}_${Date.now()}`;
        localStorage.setItem(key, generatedContract);
      } catch {}
    };
    window.addEventListener('voice-dictation-save', onVoiceSave as any);
    return () => window.removeEventListener('voice-dictation-save', onVoiceSave as any);
  }, [generatedContract, selectedTemplate]);

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'text': return Users;
      case 'number': return DollarSign;
      case 'date': return Calendar;
      case 'textarea': return Building;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Yapay Zeka Destekli Sözleşme Oluşturucu
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Profesyonel hukuki sözleşmelerinizi kolayca hazırlayın
            </p>
          </div>
        </div>

        {/* Template Selection */}
        {!selectedTemplate && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Sözleşme Türü Seçin
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contractTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                      <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {template.name}
                      </h4>
                      <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                        {template.category}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {template.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{template.fields.length} alan</span>
                        <span>•</span>
                        <span>Otomatik oluşturma</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Fields */}
        {selectedTemplate && !generatedContract && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedTemplate.name} - Bilgileri Doldurun
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedTemplate.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ← Geri Dön
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {selectedTemplate.fields.map((field) => {
                const IconComponent = getFieldIcon(field.type);
                return (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <IconComponent className="w-4 h-4 inline mr-2" />
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'textarea' ? (
                      <textarea
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                        title={field.label}
                      >
                        <option value="">Seçin...</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4">
              <button
                onClick={generateContract}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Wand2 className="w-5 h-5" />
                )}
                {isGenerating ? 'Sözleşme Oluşturuluyor...' : 'Sözleşme Oluştur'}
              </button>
              
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {/* Generated Contract */}
        {generatedContract && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Oluşturulan Sözleşme
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedTemplate?.name}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setGeneratedContract('')}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ← Düzenle
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Kopyala
                </button>
                <button
                  onClick={downloadContract}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  İndir
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" data-dictation-save="true" onClick={() => {
                  try {
                    const key = `contract_${selectedTemplate?.id || 'custom'}_${Date.now()}`;
                    localStorage.setItem(key, generatedContract);
                    alert('Sözleşme yerel olarak kaydedildi');
                  } catch {}
                }}>
                  <Save className="w-4 h-4" />
                  Kaydet
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white font-mono leading-relaxed">
                {generatedContract}
              </pre>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>⚠️ Önemli Uyarı:</strong> Bu sözleşme AI tarafından oluşturulmuş bir şablondur. 
                Kullanmadan önce mutlaka bir hukuk uzmanından görüş alın ve yerel mevzuata uygunluğunu kontrol ettirin.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}