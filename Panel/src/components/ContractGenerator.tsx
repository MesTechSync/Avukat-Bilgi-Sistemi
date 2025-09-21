import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Download, Copy, Save, Wand2, Building, Users, Calendar, DollarSign, Sparkles, AlertTriangle, CheckSquare, Bot, Zap, Settings, Key, RefreshCw } from 'lucide-react';
import { useDictation } from '../hooks/useDictation';
import DictationButton from './DictationButton';
import { geminiService } from '../services/geminiService';
import { openaiService } from '../services/openaiService';

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

  // AI Settings
  const [showAISettings, setShowAISettings] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string>('AIzaSyDeNAudg6oWG3JLwTXYXGhdspVDrDPGAyk');
  const [openaiApiKey, setOpenaiApiKey] = useState<string>('');
  const [useCustomContract, setUseCustomContract] = useState(false);
  const [customContractData, setCustomContractData] = useState({
    contractType: '',
    description: '',
    requirements: [''],
    parties: [''],
    additionalInfo: ''
  });
  const [aiComparison, setAiComparison] = useState<{
    gemini: string;
    openai: string;
    winner: 'gemini' | 'openai' | null;
  }>({ gemini: '', openai: '', winner: null });

  // AI Services initialization
  useEffect(() => {
    // Gemini'yi başlat
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
    const finalOpenaiKey = openaiApiKey || envOpenaiKey;
    
    if (finalOpenaiKey) {
      try {
        openaiService.initialize(finalOpenaiKey);
        console.log('✅ OpenAI servisi başlatıldı:', finalOpenaiKey.substring(0, 10) + '...');
        // Eğer state'de yoksa environment variable'dan set et
        if (!openaiApiKey && envOpenaiKey) {
          setOpenaiApiKey(envOpenaiKey);
        }
      } catch (error) {
        console.error('❌ OpenAI başlatma hatası:', error);
      }
    }
    
    // Servis durumlarını kontrol et
    console.log('🔍 AI Servis Durumları:');
    console.log('  - Gemini:', geminiService.isInitialized() ? '✅ Aktif' : '❌ Pasif');
    console.log('  - OpenAI:', openaiService.isInitialized() ? '✅ Aktif' : '❌ Pasif');
  }, [geminiApiKey, openaiApiKey]);

  // AI Servislerini Test Et
  const testAIServices = () => {
    console.log('🧪 AI Servisleri Test Ediliyor...');
    console.log('Gemini API Key:', geminiApiKey ? '✅ Mevcut' : '❌ Yok');
    console.log('OpenAI API Key:', openaiApiKey ? '✅ Mevcut' : '❌ Yok');
    console.log('Gemini Servisi:', geminiService.isInitialized() ? '✅ Aktif' : '❌ Pasif');
    console.log('OpenAI Servisi:', openaiService.isInitialized() ? '✅ Aktif' : '❌ Pasif');
    
    // Servisleri yeniden başlat
    if (geminiApiKey) {
      try {
        geminiService.initialize(geminiApiKey);
        console.log('✅ Gemini yeniden başlatıldı');
      } catch (error) {
        console.error('❌ Gemini başlatma hatası:', error);
      }
    }
    
    if (openaiApiKey) {
      try {
        openaiService.initialize(openaiApiKey);
        console.log('✅ OpenAI yeniden başlatıldı');
      } catch (error) {
        console.error('❌ OpenAI başlatma hatası:', error);
      }
    }
  };

  // AI Comparison function
  const compareAIResponses = async (prompt: string) => {
    setAiLoading(true);
    setAiComparison({ gemini: '', openai: '', winner: null });
    
    try {
      const promises = [];
      
      if (geminiService.isInitialized()) {
        promises.push(
          geminiService.analyzeText('Sözleşme oluştur', prompt)
            .then(result => ({ type: 'gemini', result }))
            .catch(error => ({ type: 'gemini', result: `Hata: ${error.message}` }))
        );
      }
      
      if (openaiService.isInitialized()) {
        promises.push(
          openaiService.generateContract({
            contractType: customContractData.contractType,
            description: customContractData.description,
            requirements: customContractData.requirements.filter(r => r.trim()),
            parties: customContractData.parties.filter(p => p.trim()),
            additionalInfo: customContractData.additionalInfo
          })
          .then(result => ({ type: 'openai', result }))
          .catch(error => ({ type: 'openai', result: `Hata: ${error.message}` }))
        );
      }
      
      const results = await Promise.all(promises);
      
      let geminiResult = '';
      let openaiResult = '';
      
      results.forEach(result => {
        if (result.type === 'gemini') {
          geminiResult = result.result;
        } else if (result.type === 'openai') {
          openaiResult = result.result;
        }
      });
      
      // Simple comparison logic - choose the longer, more detailed response
      let winner: 'gemini' | 'openai' | null = null;
      if (geminiResult && openaiResult) {
        winner = geminiResult.length > openaiResult.length ? 'gemini' : 'openai';
      } else if (geminiResult) {
        winner = 'gemini';
      } else if (openaiResult) {
        winner = 'openai';
      }
      
      setAiComparison({ gemini: geminiResult, openai: openaiResult, winner });
      
      // Set the winner as the generated contract
      if (winner === 'gemini') {
        setGeneratedContract(geminiResult);
      } else if (winner === 'openai') {
        setGeneratedContract(openaiResult);
      }
      
    } catch (error) {
      console.error('AI karşılaştırma hatası:', error);
    } finally {
      setAiLoading(false);
    }
  };
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

  const generateContract = async () => {
    if (!selectedTemplate && !useCustomContract) return;

    setIsGenerating(true);

    try {
      if (useCustomContract) {
        // Custom contract generation with AI
        const prompt = `
Sözleşme Türü: ${customContractData.contractType}
Açıklama: ${customContractData.description}

Taraflar:
${customContractData.parties.filter(p => p.trim()).map(party => `- ${party}`).join('\n')}

Gereksinimler:
${customContractData.requirements.filter(r => r.trim()).map(req => `- ${req}`).join('\n')}

${customContractData.additionalInfo ? `Ek Bilgiler:\n${customContractData.additionalInfo}` : ''}

Bu bilgilere göre profesyonel bir hukuki sözleşme hazırla. Türk hukuk sistemine uygun, detaylı ve profesyonel bir sözleşme oluştur.
`;
        
        await compareAIResponses(prompt);
      } else {
        // Template-based generation
        if (!validate()) { 
          setIsGenerating(false); 
          return; 
        }
        
        let contract = selectedTemplate!.template;
      
      // Replace placeholders with form data
      Object.entries(formData).forEach(([key, value]) => {
        const placeholder = `{${key.toUpperCase()}}`;
        contract = contract.replace(new RegExp(placeholder, 'g'), value || `[${key}]`);
      });

      // Add current date if not provided
      const today = new Date().toLocaleDateString('tr-TR');
      contract = contract.replace(/\{DATE\}/g, today);

      // Append optional clauses
        const lib = (optionalClauses as any)[selectedTemplate!.id] || {};
      const selectedKeys = Object.keys(optClauses).filter(k => optClauses[k]);
      if (selectedKeys.length) {
        const appendix = selectedKeys.map(k => lib[k]?.text).filter(Boolean).join('\n\n');
        if (appendix) {
          contract = contract + '\n\n' + appendix;
        }
      }

      setGeneratedContract(contract);
      }
    } catch (error) {
      console.error('Sözleşme oluşturma hatası:', error);
      alert('Sözleşme oluşturulurken hata oluştu: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
          </div>
            <div className="flex-1 flex justify-end gap-2">
              <button
                onClick={testAIServices}
                className="p-3 bg-blue-500/80 dark:bg-blue-600/80 backdrop-blur-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200 dark:border-blue-700 text-white"
                title="AI Servislerini Test Et"
              >
                <Bot className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowAISettings(!showAISettings)}
                className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-gray-700/50"
                title="AI Ayarları"
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Destekli Sözleşme Oluşturucu
          </h1>
            <p className="text-gray-600 dark:text-gray-400">
            Gemini ve OpenAI ile profesyonel hukuki sözleşmelerinizi oluşturun
          </p>
          
          {/* AI Status */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              geminiService.isInitialized() 
                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
            }`}>
              <Bot className="w-4 h-4" />
              Gemini: {geminiService.isInitialized() ? 'Aktif' : 'Pasif'}
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              openaiService.isInitialized() 
                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
            }`}>
              <Zap className="w-4 h-4" />
              OpenAI: {openaiService.isInitialized() ? 'Aktif' : 'Pasif'}
            </div>
          </div>
        </div>

        {/* AI Settings Panel */}
        {showAISettings && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6 text-gray-800 dark:text-gray-200">
              <Key className="w-5 h-5 text-green-600" />
              <span className="text-lg font-semibold">AI API Ayarları</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gemini API Key */}
          <div>
                <label htmlFor="gemini-key" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Gemini API Key *
                </label>
                <div className="flex gap-3">
                  <input
                    id="gemini-key"
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSyC... (Gemini API key'inizi girin)"
                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all duration-300"
                  />
                  <button
                    onClick={() => {
                      if (geminiApiKey.trim()) {
                        geminiService.initialize(geminiApiKey);
                        alert('Gemini API Key başarıyla ayarlandı!');
                      } else {
                        alert('Lütfen geçerli bir Gemini API key girin');
                      }
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Bot className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* OpenAI API Key */}
              <div>
                <label htmlFor="openai-key" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  OpenAI API Key *
                </label>
                <div className="flex gap-3">
                  <input
                    id="openai-key"
                    type="password"
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    placeholder="sk-proj-... (OpenAI API key'inizi girin)"
                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300"
                  />
                  <button
                    onClick={() => {
                      if (openaiApiKey.trim()) {
                        openaiService.initialize(openaiApiKey);
                        alert('OpenAI API Key başarıyla ayarlandı!');
                      } else {
                        alert('Lütfen geçerli bir OpenAI API key girin');
                      }
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">ℹ️ Bilgi</h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p>• <strong>Gemini:</strong> Google'ın AI modeli, Türkçe desteği güçlü</p>
                <p>• <strong>OpenAI:</strong> GPT-4 modeli, profesyonel sözleşmeler için optimize</p>
                <p>• <strong>Karşılaştırma:</strong> Her iki AI da çalışır ve en iyi sonucu seçer</p>
                <p>• <strong>Güvenlik:</strong> API key'leriniz tarayıcınızda saklanır</p>
              </div>
            </div>
          </div>
        )}

        {/* Template Selection */}
        {!selectedTemplate && !useCustomContract && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sözleşme Türü Seçin
            </h3>
              <button
                onClick={() => setUseCustomContract(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Wand2 className="w-4 h-4" />
                AI ile Sıfırdan Oluştur
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contractTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="group p-6 bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 dark:from-gray-700 dark:via-blue-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-blue-100 dark:border-blue-800/30 cursor-pointer hover:border-green-300 dark:hover:border-green-600 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {template.name}
                      </h4>
                      <p className="text-sm text-green-600 dark:text-green-400 mb-2 font-semibold">
                        {template.category}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {template.fields.length} alan
                        </span>
                        <span className="flex items-center gap-1">
                          <Wand2 className="w-3 h-3" />
                          AI destekli
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Contract Form */}
        {useCustomContract && !generatedContract && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  AI ile Sıfırdan Sözleşme Oluştur
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Gemini ve OpenAI ile özel sözleşmenizi oluşturun
                </p>
              </div>
              <button
                onClick={() => setUseCustomContract(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ← Geri Dön
              </button>
            </div>

            <div className="space-y-6">
              {/* Contract Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Sözleşme Türü *
                </label>
                <input
                  type="text"
                  value={customContractData.contractType}
                  onChange={(e) => setCustomContractData(prev => ({ ...prev, contractType: e.target.value }))}
                  placeholder="Örn: İş Sözleşmesi, Kira Sözleşmesi, Satış Sözleşmesi"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all duration-300"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Açıklama *
                </label>
                <textarea
                  value={customContractData.description}
                  onChange={(e) => setCustomContractData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Sözleşmenin amacını ve kapsamını detaylı olarak açıklayın..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all duration-300"
                />
              </div>

              {/* Parties */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Taraflar *
                </label>
                <div className="space-y-2">
                  {customContractData.parties.map((party, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={party}
                        onChange={(e) => {
                          const newParties = [...customContractData.parties];
                          newParties[index] = e.target.value;
                          setCustomContractData(prev => ({ ...prev, parties: newParties }));
                        }}
                        placeholder={`Taraf ${index + 1} (Ad, Soyad, Şirket Adı vb.)`}
                        className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all duration-300"
                      />
                      {customContractData.parties.length > 1 && (
                        <button
                          onClick={() => {
                            const newParties = customContractData.parties.filter((_, i) => i !== index);
                            setCustomContractData(prev => ({ ...prev, parties: newParties }));
                          }}
                          className="px-3 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setCustomContractData(prev => ({ ...prev, parties: [...prev.parties, ''] }))}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    + Taraf Ekle
                  </button>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Gereksinimler *
                </label>
                <div className="space-y-2">
                  {customContractData.requirements.map((req, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => {
                          const newReqs = [...customContractData.requirements];
                          newReqs[index] = e.target.value;
                          setCustomContractData(prev => ({ ...prev, requirements: newReqs }));
                        }}
                        placeholder={`Gereksinim ${index + 1}`}
                        className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all duration-300"
                      />
                      {customContractData.requirements.length > 1 && (
                        <button
                          onClick={() => {
                            const newReqs = customContractData.requirements.filter((_, i) => i !== index);
                            setCustomContractData(prev => ({ ...prev, requirements: newReqs }));
                          }}
                          className="px-3 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setCustomContractData(prev => ({ ...prev, requirements: [...prev.requirements, ''] }))}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    + Gereksinim Ekle
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ek Bilgiler
                </label>
                <textarea
                  value={customContractData.additionalInfo}
                  onChange={(e) => setCustomContractData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  placeholder="Özel şartlar, ödeme koşulları, süreler vb. ek bilgiler..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all duration-300"
                />
              </div>

              {/* Generate Button */}
              <div className="flex gap-4">
                <button
                  onClick={generateContract}
                  disabled={isGenerating || !customContractData.contractType.trim() || !customContractData.description.trim()}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Wand2 className="w-5 h-5" />
                  )}
                  {isGenerating ? 'AI Sözleşme Oluşturuyor...' : 'AI ile Sözleşme Oluştur'}
                </button>
                
                <button
                  onClick={() => setUseCustomContract(false)}
                  className="px-6 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  İptal
                </button>
              </div>
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
          <div className="space-y-6">
            {/* AI Comparison Results */}
            {aiComparison.gemini && aiComparison.openai && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <RefreshCw className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    AI Karşılaştırma Sonuçları
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gemini Result */}
                  <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    aiComparison.winner === 'gemini' 
                      ? 'border-green-300 bg-green-50/50 dark:border-green-600 dark:bg-green-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <Bot className="w-6 h-6 text-green-600" />
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Gemini Sonucu
                      </h4>
                      {aiComparison.winner === 'gemini' && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 rounded-full text-sm font-semibold">
                          KAZANDI
                        </span>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono leading-relaxed">
                        {aiComparison.gemini}
                      </pre>
                    </div>
                    <button
                      onClick={() => setGeneratedContract(aiComparison.gemini)}
                      className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                    >
                      Bu Sonucu Kullan
                    </button>
                  </div>

                  {/* OpenAI Result */}
                  <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    aiComparison.winner === 'openai' 
                      ? 'border-purple-300 bg-purple-50/50 dark:border-purple-600 dark:bg-purple-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="w-6 h-6 text-purple-600" />
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        OpenAI Sonucu
                      </h4>
                      {aiComparison.winner === 'openai' && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 rounded-full text-sm font-semibold">
                          KAZANDI
                        </span>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono leading-relaxed">
                        {aiComparison.openai}
                      </pre>
                    </div>
                    <button
                      onClick={() => setGeneratedContract(aiComparison.openai)}
                      className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                    >
                      Bu Sonucu Kullan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Final Contract */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
              <div className="flex items-center justify-between mb-6">
          <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Oluşturulan Sözleşme
                </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {useCustomContract ? customContractData.contractType : selectedTemplate?.name}
                </p>
              </div>
                <div className="flex gap-3">
                <button
                    onClick={() => {
                      setGeneratedContract('');
                      setAiComparison({ gemini: '', openai: '', winner: null });
                    }}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  ← Düzenle
                </button>
                <button
                  onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  <Copy className="w-4 h-4" />
                  Kopyala
                </button>
                <button
                  onClick={downloadContract}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  <Download className="w-4 h-4" />
                  İndir
                </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300">
                  <Save className="w-4 h-4" />
                  Kaydet
                </button>
              </div>
            </div>
            
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white font-mono leading-relaxed">
                {generatedContract}
              </pre>
            </div>

            {leftoverPlaceholders.length > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-sm text-yellow-900 dark:text-yellow-200 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 mt-0.5" />
                <div>
                  <strong>Dikkat:</strong> Aşağıdaki yer tutucular hâlâ metinde bulunuyor. İlgili alanları doldurduğunuzdan emin olun: {leftoverPlaceholders.join(', ')}
                </div>
              </div>
            )}

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>⚠️ Önemli Uyarı:</strong> Bu sözleşme AI tarafından oluşturulmuştur. 
                Kullanmadan önce mutlaka bir hukuk uzmanından görüş alın ve yerel mevzuata uygunluğunu kontrol ettirin.
              </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}