import React, { useState } from 'react';
import { sanitizeText } from '../lib/sanitize';
import { FileText, Wand2, Download, Copy, Save, RefreshCw } from 'lucide-react';

interface PetitionTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  template: string;
}

const petitionTemplates: PetitionTemplate[] = [
  {
    id: 'labor-termination',
    name: 'İşten Çıkarma Tazminatı',
    category: 'İş Hukuku',
    description: 'Haksız işten çıkarma durumunda tazminat talebi dilekçesi',
    template: `Sayın Hakim,

Ben {EMPLOYEE_NAME}, {COMPANY_NAME} şirketinde {START_DATE} tarihinden {END_DATE} tarihine kadar {POSITION} pozisyonunda çalışmış bulunmaktayım.

{END_DATE} tarihinde haklı bir sebep gösterilmeksizin işten çıkarılmış bulunmaktayım. Bu durum İş Kanunu'nun 18. maddesine aykırıdır.

Bu nedenle;
1. Kıdem tazminatım: {SEVERANCE_AMOUNT} TL
2. İhbar tazminatım: {NOTICE_AMOUNT} TL
3. Kullanmadığım yıllık izin bedeli: {VACATION_AMOUNT} TL
4. Fazla mesai alacağım: {OVERTIME_AMOUNT} TL

TOPLAM: {TOTAL_AMOUNT} TL

Yukarıda belirtilen meblağın davalı şirketten tahsili ile birlikte yargılama giderlerinin de davalıdan alınmasına karar verilmesini saygılarımla arz ederim.

{DATE}
{EMPLOYEE_NAME}
{SIGNATURE}`
  },
  {
    id: 'commercial-debt',
    name: 'Ticari Alacak',
    category: 'Ticari Hukuk',
    description: 'Ticari borç tahsili için dilekçe',
    template: `Sayın Hakim,

{CREDITOR_NAME} adına, {DEBTOR_NAME} aleyhine açmış olduğum ticari alacak davasında;

Davalı ile aramızda {CONTRACT_DATE} tarihli ticari sözleşme gereği, {SERVICE_DESCRIPTION} karşılığında {DEBT_AMOUNT} TL alacağım bulunmaktadır.

{DUE_DATE} tarihinde vadesi gelen borcun ödenmemesi üzerine {NOTICE_DATE} tarihinde ihtarname gönderilmiş, ancak davalı tarafından ödenmeyen borç için bu davayı açmak zorunda kalmış bulunmaktayım.

Bu nedenle;
- Ana para: {DEBT_AMOUNT} TL
- Gecikme faizi: {INTEREST_AMOUNT} TL
- Toplam: {TOTAL_AMOUNT} TL

Yukarıda belirtilen meblağın davalıdan tahsili ile yargılama giderlerinin davalıdan alınmasına karar verilmesini saygılarımla arz ederim.

{DATE}
{CREDITOR_NAME}
{SIGNATURE}`
  },
  {
    id: 'divorce-petition',
    name: 'Boşanma Davası',
    category: 'Aile Hukuku',
    description: 'Anlaşmalı boşanma dilekçesi',
    template: `Sayın Hakim,

Ben {PLAINTIFF_NAME}, {DEFENDANT_NAME} ile {MARRIAGE_DATE} tarihinde evlenmiş bulunmaktayım.

Evliliğimizden {CHILDREN_COUNT} çocuğumuz bulunmaktadır:
{CHILDREN_INFO}

Eşimle aramızda geçimsizlik nedeniyle ortak kararla boşanmak istiyoruz. Bu konuda mutabakata varmış bulunmaktayım.

Çocuklarımızın velayeti konusunda anlaşmaya varmış bulunmaktayız:
- Velayet: {CUSTODY_ARRANGEMENT}
- Nafaka: {ALIMONY_AMOUNT} TL/ay

Mal rejimi gereği paylaşılacak malvarlığı konusunda da anlaşmaya varmış bulunmaktayız.

Bu nedenle TMK 166/3 maddesi gereği anlaşmalı boşanmamıza karar verilmesini saygılarımla arz ederim.

{DATE}
{PLAINTIFF_NAME}
{SIGNATURE}`
  }
];

export default function PetitionWriter() {
  const [selectedTemplate, setSelectedTemplate] = useState<PetitionTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedPetition, setGeneratedPetition] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Persist generated petition on DICTATE_SAVE as a convenience
  React.useEffect(() => {
    const onVoiceSave = () => {
      if (!generatedPetition) return;
      try {
        const key = `petition_${selectedTemplate?.id || 'custom'}_${Date.now()}`;
        localStorage.setItem(key, generatedPetition);
      } catch {}
    };
    window.addEventListener('voice-dictation-save', onVoiceSave as any);
    return () => window.removeEventListener('voice-dictation-save', onVoiceSave as any);
  }, [generatedPetition, selectedTemplate]);

  const extractPlaceholders = (template: string): string[] => {
    const matches = template.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const generatePetition = () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      let petition = selectedTemplate.template;
      
      Object.entries(formData).forEach(([key, value]) => {
        const safeVal = sanitizeText(value || '');
        petition = petition.replace(new RegExp(`\\{${key}\\}`, 'g'), safeVal || `[${key}]`);
      });

      // Add current date if not provided
      if (!formData.DATE) {
        const today = new Date().toLocaleDateString('tr-TR');
        petition = petition.replace(/\{DATE\}/g, today);
      }

      setGeneratedPetition(petition);
      setIsGenerating(false);
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sanitizeText(generatedPetition));
    alert('Dilekçe panoya kopyalandı!');
  };

  const downloadPetition = () => {
    const element = document.createElement('a');
    const file = new Blob([sanitizeText(generatedPetition)], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedTemplate?.name || 'dilekce'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const placeholders = selectedTemplate ? extractPlaceholders(selectedTemplate.template) : [];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Wand2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Yapay Zeka Destekli Dilekçe Yazım Sistemi
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Hukuki dilekçelerinizi kolayca oluşturun
            </p>
          </div>
        </div>

        {/* Template Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Dilekçe Türü Seçin
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {petitionTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template);
                  setFormData({});
                  setGeneratedPetition('');
                }}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </h4>
                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">
                      {template.category}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        {selectedTemplate && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Bilgileri Doldurun
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {placeholders.map((placeholder) => (
                <div key={placeholder}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {placeholder.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                  <input
                    type="text"
                    value={formData[placeholder] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [placeholder]: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder={`${placeholder.replace(/_/g, ' ').toLowerCase()} girin...`}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={generatePetition}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Wand2 className="w-5 h-5" />
                )}
                {isGenerating ? 'Dilekçe Oluşturuluyor...' : 'Dilekçe Oluştur'}
              </button>
            </div>
          </div>
        )}

        {/* Generated Petition */}
        {generatedPetition && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Oluşturulan Dilekçe
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Kopyala
                </button>
                <button
                  onClick={downloadPetition}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  İndir
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" data-dictation-save="true" title="Kaydet" aria-label="Kaydet" onClick={() => {
                  try {
                    const key = `petition_${selectedTemplate?.id || 'custom'}_${Date.now()}`;
                    localStorage.setItem(key, generatedPetition);
                    alert('Dilekçe yerel olarak kaydedildi');
                  } catch {}
                }}>
                  <Save className="w-4 h-4" />
                  Kaydet
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white font-mono leading-relaxed">
                {generatedPetition}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}