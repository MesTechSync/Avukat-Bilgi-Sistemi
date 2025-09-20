import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Download, Copy, Save, Wand2, Building, Users, Calendar, DollarSign, Sparkles, AlertTriangle, CheckSquare } from 'lucide-react';
import { useDictation } from '../hooks/useDictation';
import DictationButton from './DictationButton';

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string>('');
  const [optClauses, setOptClauses] = useState<Record<string, boolean>>({});

  // Dikte hook'u - form alanları için
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
      // Aktif form alanına dikte metnini ekle
      const activeField = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
      if (activeField && (activeField.tagName === 'INPUT' || activeField.tagName === 'TEXTAREA')) {
        const fieldId = activeField.id;
        if (fieldId && fieldId.startsWith('field-')) {
          const fieldKey = fieldId.replace('field-', '');
          setFormData(prev => ({
            ...prev,
            [fieldKey]: (prev[fieldKey] || '') + (prev[fieldKey] ? ' ' : '') + text
          }));
        }
      }
      clearDictation();
    },
    onError: (error) => {
      console.error('Dikte hatası:', error);
    },
    continuous: false,
    interimResults: true
  });

  // Optional clause library per template
  const optionalClauses = useMemo(() => ({
    employment: {
      confidentiality: {
        label: 'Gizlilik Maddesi',
        text: `MADDE X - GİZLİLİK\nTaraflar, işbu sözleşmenin ifası nedeniyle öğrendikleri tüm ticari sırları ve kişisel verileri 6698 sayılı KVKK ve ilgili mevzuat hükümlerine uygun olarak gizli tutacaklardır.`
      },
      nonCompete: {
        label: 'Rekabet Yasağı',
        text: `MADDE X - REKABET YASAĞI\nİşçi, iş sözleşmesinin sona ermesinden itibaren makul süreyle işverenin meşru menfaatlerini koruyacak şekilde rekabet etmeme yükümlülüğüne uymayı kabul eder.`
      },
      notice: {
        label: 'Fesih Bildirim Süresi',
        text: `MADDE X - FESİH BİLDİRİMİ\nTaraflar, 4857 sayılı İş Kanunu'ndaki bildirim sürelerine riayet edeceklerdir.`
      }
    },
    rental: {
      maintenance: {
        label: 'Bakım ve Onarım',
        text: `MADDE X - BAKIM VE ONARIM\nKiracı, kiralananı özenle kullanacak; düzenli bakım ve olağan onarımları kendi hesabına yaptıracaktır.`
      },
      sublease: {
        label: 'Alt Kira Yasağı',
        text: `MADDE X - ALT KİRA\nKiracı, kiralananı kiraya verenin yazılı izni olmaksızın üçüncü kişilere kiralayamaz veya kullanım hakkını devredemez.`
      }
    },
    commercial: {
      warranty: {
        label: 'Ayıba Karşı Tekeffül',
        text: `MADDE X - AYIBA KARŞI TEKEFFÜL\nSatıcı, Türk Borçlar Kanunu uyarınca ayıba karşı tekeffül hükümlerine tabidir.`
      },
      forceMajeure: {
        label: 'Mücbir Sebep',
        text: `MADDE X - MÜCBİR SEBEP\nTarafların kontrolü dışında gelişen mücbir sebeplerin varlığı halinde, yükümlülüklerin ifası mücbir sebep süresince askıya alınır.`
      }
    }
  } as const), []);

  // Local storage persistence
  useEffect(() => {
    try {
      const raw = localStorage.getItem('contractGen:last');
      if (raw) {
        const parsed = JSON.parse(raw);
        const tpl = contractTemplates.find(t => t.id === parsed.templateId);
        if (tpl) {
          setSelectedTemplate(tpl);
          setFormData(parsed.formData || {});
          setOptClauses(parsed.optClauses || {});
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('contractGen:last', JSON.stringify({
        templateId: selectedTemplate?.id || null,
        formData,
        optClauses
      }));
    } catch {}
  }, [selectedTemplate, formData, optClauses]);

  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setFormData({});
    setGeneratedContract('');
    setFieldErrors({});
    setAiSuggestions('');
    // initialize optional clause selections to false
    const initial: Record<string, boolean> = {};
    const lib = (optionalClauses as any)[template.id] || {};
    Object.keys(lib).forEach(k => { initial[k] = false; });
    setOptClauses(initial);
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const validate = () => {
    if (!selectedTemplate) return false;
    const errs: Record<string, string> = {};
    for (const f of selectedTemplate.fields) {
      if (f.required && !formData[f.id]) {
        errs[f.id] = 'Bu alan zorunludur';
      }
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const generateContract = () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);

    setTimeout(() => {
      if (!validate()) { setIsGenerating(false); return; }
      let contract = selectedTemplate.template;
      
      // Replace placeholders with form data
      Object.entries(formData).forEach(([key, value]) => {
        const placeholder = `{${key.toUpperCase()}}`;
        contract = contract.replace(new RegExp(placeholder, 'g'), value || `[${key}]`);
      });

      // Add current date if not provided
      const today = new Date().toLocaleDateString('tr-TR');
      contract = contract.replace(/\{DATE\}/g, today);

      // Append optional clauses
      const lib = (optionalClauses as any)[selectedTemplate.id] || {};
      const selectedKeys = Object.keys(optClauses).filter(k => optClauses[k]);
      if (selectedKeys.length) {
        const appendix = selectedKeys.map(k => lib[k]?.text).filter(Boolean).join('\n\n');
        if (appendix) {
          contract = contract + '\n\n' + appendix;
        }
      }

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

  // Simple API helper with fallback bases similar to AIChat
  const postJsonWithFallback = async (path: string, payload: any) => {
    const bases = [] as string[];
    try { const envBase = (import.meta as any)?.env?.VITE_API_BASE; if (envBase) bases.push(envBase); } catch {}
    bases.push('', 'http://127.0.0.1:8000', 'http://localhost:8000');
    let lastErr: any;
    for (const base of bases) {
      const url = base ? `${base}${path}` : path;
      try {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Request failed');
  };

  const requestAISuggestions = async () => {
    if (!selectedTemplate) return;
    setAiLoading(true);
    setAiSuggestions('');
    const summary = Object.entries(formData).map(([k,v]) => `- ${k}: ${v || '-'}`).join('\n');
    const prompt = `Aşağıdaki sözleşme türü ve bilgiler ışığında, Türk hukuku genel ilkeleri ile uyumlu kısa madde önerileri, eksik görülen noktalar ve risk uyarıları üret. Cevabı maddeler halinde, sade Türkçe yaz. Uygulanabildiği ölçüde İş Kanunu/TBK gibi temel mevzuata atıf yapabilirsin. Özel danışmanlık vermeden, genel şablon ve dil öner.\n\nSözleşme türü: ${selectedTemplate.name}\nAçıklama: ${selectedTemplate.description}\nVerilen bilgiler:\n${summary}`;
    try {
      const data = await postJsonWithFallback('/api/ai/chat', { query: prompt, model: 'auto', context: [] });
      if (data?.content) setAiSuggestions(String(data.content));
    } catch (e: any) {
      setAiSuggestions(`AI önerileri alınamadı: ${e?.message || e}`);
    } finally {
      setAiLoading(false);
    }
  };

  const leftoverPlaceholders = useMemo(() => {
    if (!generatedContract) return [] as string[];
    const matches = generatedContract.match(/\{[A-Z_]+\}/g) || [];
    return Array.from(new Set(matches));
  }, [generatedContract]);

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
                const inputId = `field-${field.id}`;
                return (
                  <div key={field.id}>
                    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <IconComponent className="w-4 h-4 inline mr-2" />
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'textarea' ? (
                      <div className="relative">
                        <textarea
                          id={inputId}
                          value={(formData[field.id] || '') + (dictationInterimText ? ' ' + dictationInterimText : '')}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                          className={`w-full px-3 py-2 border ${fieldErrors[field.id] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white pr-12`}
                        />
                        <div className="absolute right-2 top-2">
                          <DictationButton
                            isListening={isDictating}
                            isSupported={isDictationSupported}
                            onStart={startDictation}
                            onStop={stopDictation}
                            size="sm"
                            title="Sesli yazım"
                          />
                        </div>
                      </div>
                    ) : field.type === 'select' ? (
                      <select
                        id={inputId}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={`w-full px-3 py-2 border ${fieldErrors[field.id] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white`}
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
                        id={inputId}
                        type={field.type}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className={`w-full px-3 py-2 border ${fieldErrors[field.id] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white`}
                      />
                    )}
                    {fieldErrors[field.id] && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors[field.id]}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Optional clauses */}
            {selectedTemplate && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" /> Ekleyebileceğiniz Kalıp Maddeler
                </h4>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(((optionalClauses as any)[selectedTemplate.id] || {})).map(([key, cfg]: any) => (
                    <label key={key} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input type="checkbox" className="accent-green-600" checked={!!optClauses[key]} onChange={(e) => setOptClauses(prev => ({ ...prev, [key]: e.target.checked }))} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{cfg.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

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
                onClick={requestAISuggestions}
                disabled={aiLoading}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {aiLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                {aiLoading ? 'Öneriler Alınıyor...' : 'AI Önerileri Al'}
              </button>
              
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
            </div>

            {aiSuggestions && (
              <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-200">AI Önerileri</h4>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white">{aiSuggestions}</pre>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setGeneratedContract(prev => (prev ? `${prev}\n\n${aiSuggestions}` : aiSuggestions))}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >Önerileri Metne Ekle</button>
                  <button
                    onClick={() => setAiSuggestions('')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >Temizle</button>
                </div>
              </div>
            )}
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
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
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

            {leftoverPlaceholders.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-900 dark:text-yellow-200 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 mt-0.5" />
                <div>
                  <strong>Dikkat:</strong> Aşağıdaki yer tutucular hâlâ metinde bulunuyor. İlgili alanları doldurduğunuzdan emin olun: {leftoverPlaceholders.join(', ')}
                </div>
              </div>
            )}

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