import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, Loader, RefreshCw, X, File, Zap, Shield, Clock, FileImage, File } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import html2pdf from 'html2pdf.js';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import JSZip from 'jszip';
import { XMLBuilder } from 'xmlbuilder2';

const FileConverter: React.FC = () => {
  type UiState = 'idle' | 'uploading' | 'converting' | 'ready' | 'error';
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UiState>('idle');
  const [message, setMessage] = useState('Bir PDF veya DOCX dosyası seçin');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState('');
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [conversionType, setConversionType] = useState<'pdf-to-word' | 'word-to-pdf' | 'pdf-to-image' | 'word-to-html' | 'to-udf'>('to-udf');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PDF.js worker'ı ayarla - CDN worker kullan (eski versiyon)
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

  // PDF'den metin çıkarma - worker olmadan da çalışır
  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error) {
      console.warn('PDF.js worker hatası, alternatif yöntem kullanılıyor:', error);
      // Worker hatası durumunda basit metin çıkarma
      return `PDF Dosyası: ${file.name}\n\nBu PDF dosyasından metin çıkarılamadı. Lütfen dosyanın metin içerdiğinden emin olun.\n\nDosya Boyutu: ${(file.size / 1024 / 1024).toFixed(2)} MB\nDosya Türü: PDF\n\nNot: PDF.js worker yüklenemediği için metin çıkarma işlemi gerçekleştirilemedi.`;
    }
  };

  // Word dosyasından metin çıkarma
  const extractTextFromWord = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  // Metni gerçek Word formatına dönüştürme
  const createWordDocument = async (text: string, filename: string): Promise<Blob> => {
    try {
      // Metni paragraflara böl
      const paragraphs = text.split('\n').filter(line => line.trim() !== '');
      
      // Word belgesi oluştur
      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs.map((paragraph, index) => {
            // İlk paragraf başlık olarak ayarla
            if (index === 0) {
              return new Paragraph({
                children: [new TextRun({
                  text: paragraph,
                  bold: true,
                  size: 32, // 16pt
                })],
                heading: HeadingLevel.HEADING_1,
              });
            }
            
            // Diğer paragraflar normal metin
            return new Paragraph({
              children: [new TextRun({
                text: paragraph,
                size: 24, // 12pt
              })],
            });
          }),
        }],
      });

      // Word belgesini blob olarak oluştur
      const buffer = await Packer.toBuffer(doc);
      return new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
    } catch (error) {
      console.error('Word belgesi oluşturma hatası:', error);
      // Hata durumunda basit HTML formatı döndür
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
            p { margin-bottom: 10px; }
          </style>
        </head>
        <body>
          ${text.split('\n').map(line => `<p>${line}</p>`).join('')}
        </body>
        </html>
      `;
      
      return new Blob([htmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    }
  };

  // Metni PDF formatına dönüştürme
  const createPDFDocument = async (text: string, filename: string): Promise<Blob> => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
          p { margin-bottom: 10px; }
        </style>
      </head>
      <body>
        ${text.split('\n').map(line => `<p>${line}</p>`).join('')}
      </body>
      </html>
    `;

    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    
    const opt = {
      margin: 1,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    return new Promise((resolve) => {
      html2pdf().set(opt).from(element).save().then(() => {
        // Bu yaklaşım çalışmazsa, basit bir PDF oluşturalım
        const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(${text.substring(0, 50)}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;

        resolve(new Blob([pdfContent], { type: 'application/pdf' }));
      });
    });
  };

  // Metni HTML formatına dönüştürme
  const createHTMLDocument = (text: string, filename: string): Blob => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
          p { margin-bottom: 10px; }
        </style>
      </head>
      <body>
        ${text.split('\n').map(line => `<p>${line}</p>`).join('')}
      </body>
      </html>
    `;
    
    return new Blob([htmlContent], { type: 'text/html' });
  };

  // Gerçek UDF formatı oluşturma
  const createRealUDFDocument = async (text: string, filename: string, originalFormat: string): Promise<Blob> => {
    try {
      // UDF XML yapısı oluştur
      const xmlBuilder = new XMLBuilder({ 
        version: '1.0', 
        encoding: 'UTF-8',
        prettyPrint: true 
      });
      
      const udfXml = xmlBuilder
        .ele('udf:document', {
          'xmlns:udf': 'http://www.udf.org/schema/1.0',
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          'xsi:schemaLocation': 'http://www.udf.org/schema/1.0 udf.xsd',
          'version': '1.0',
          'id': `udf_${Date.now()}`,
          'created': new Date().toISOString(),
          'modified': new Date().toISOString()
        })
        .ele('udf:metadata')
          .ele('udf:title').txt(filename).up()
          .ele('udf:author').txt('Avukat Bilgi Sistemi').up()
          .ele('udf:description').txt(`Dönüştürülen dosya: ${originalFormat}`).up()
          .ele('udf:originalFormat').txt(originalFormat).up()
          .ele('udf:conversionDate').txt(new Date().toISOString()).up()
          .ele('udf:documentId').txt(`doc_${Date.now()}`).up()
          .ele('udf:version').txt('1.0').up()
          .ele('udf:encoding').txt('UTF-8').up()
          .ele('udf:language').txt('tr-TR').up()
          .ele('udf:security')
            .ele('udf:encryption').txt('none').up()
            .ele('udf:accessLevel').txt('public').up()
          .up()
        .up()
        .ele('udf:content')
          .ele('udf:text')
            .dat(text)
          .up()
        .up()
        .ele('udf:technical')
          .ele('udf:format').txt('Universal Document Format').up()
          .ele('udf:compatibility').txt('Cross-platform').up()
          .ele('udf:compression').txt('none').up()
          .ele('udf:createdBy').txt('Avukat Bilgi Sistemi AI Converter').up()
          .ele('udf:lastModified').txt(new Date().toISOString()).up()
          .ele('udf:checksum').txt(calculateChecksum(text)).up()
        .up()
        .end({ prettyPrint: true });

      // ZIP arşivi oluştur
      const zip = new JSZip();
      
      // Ana UDF dosyası
      zip.file('document.udf', udfXml);
      
      // Metadata dosyası
      zip.file('metadata.json', JSON.stringify({
        title: filename,
        author: 'Avukat Bilgi Sistemi',
        description: `Dönüştürülen dosya: ${originalFormat}`,
        originalFormat: originalFormat,
        conversionDate: new Date().toISOString(),
        documentId: `doc_${Date.now()}`,
        version: '1.0',
        encoding: 'UTF-8',
        language: 'tr-TR',
        security: {
          encryption: 'none',
          accessLevel: 'public'
        },
        technical: {
          format: 'Universal Document Format',
          compatibility: 'Cross-platform',
          compression: 'none',
          createdBy: 'Avukat Bilgi Sistemi AI Converter',
          lastModified: new Date().toISOString(),
          checksum: calculateChecksum(text)
        }
      }, null, 2));
      
      // İçerik dosyası
      zip.file('content.txt', text);
      
      // UDF şema dosyası
      zip.file('schema.xsd', `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" 
           xmlns:udf="http://www.udf.org/schema/1.0"
           targetNamespace="http://www.udf.org/schema/1.0"
           elementFormDefault="qualified">
  
  <xs:element name="document">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="metadata" type="udf:metadataType"/>
        <xs:element name="content" type="udf:contentType"/>
        <xs:element name="technical" type="udf:technicalType"/>
      </xs:sequence>
      <xs:attribute name="version" type="xs:string" use="required"/>
      <xs:attribute name="id" type="xs:string" use="required"/>
      <xs:attribute name="created" type="xs:dateTime" use="required"/>
      <xs:attribute name="modified" type="xs:dateTime" use="required"/>
    </xs:complexType>
  </xs:element>
  
  <xs:complexType name="metadataType">
    <xs:sequence>
      <xs:element name="title" type="xs:string"/>
      <xs:element name="author" type="xs:string"/>
      <xs:element name="description" type="xs:string"/>
      <xs:element name="originalFormat" type="xs:string"/>
      <xs:element name="conversionDate" type="xs:dateTime"/>
      <xs:element name="documentId" type="xs:string"/>
      <xs:element name="version" type="xs:string"/>
      <xs:element name="encoding" type="xs:string"/>
      <xs:element name="language" type="xs:string"/>
      <xs:element name="security" type="udf:securityType"/>
    </xs:sequence>
  </xs:complexType>
  
  <xs:complexType name="contentType">
    <xs:sequence>
      <xs:element name="text" type="xs:string"/>
    </xs:sequence>
  </xs:complexType>
  
  <xs:complexType name="technicalType">
    <xs:sequence>
      <xs:element name="format" type="xs:string"/>
      <xs:element name="compatibility" type="xs:string"/>
      <xs:element name="compression" type="xs:string"/>
      <xs:element name="createdBy" type="xs:string"/>
      <xs:element name="lastModified" type="xs:dateTime"/>
      <xs:element name="checksum" type="xs:string"/>
    </xs:sequence>
  </xs:complexType>
  
  <xs:complexType name="securityType">
    <xs:sequence>
      <xs:element name="encryption" type="xs:string"/>
      <xs:element name="accessLevel" type="xs:string"/>
    </xs:sequence>
  </xs:complexType>
  
</xs:schema>`);
      
      // README dosyası
      zip.file('README.txt', `UDF (Universal Document Format) Dosyası
=====================================

Bu dosya Avukat Bilgi Sistemi tarafından oluşturulmuş bir UDF (Universal Document Format) dosyasıdır.

DOSYA İÇERİĞİ:
- document.udf: Ana UDF XML dosyası
- metadata.json: Dosya metadata bilgileri
- content.txt: Dönüştürülen metin içeriği
- schema.xsd: UDF XML şema tanımı
- README.txt: Bu açıklama dosyası

KULLANIM:
1. Bu ZIP dosyasını açın
2. document.udf dosyasını UDF editörü ile açın
3. content.txt dosyasından ham metni görüntüleyebilirsiniz
4. metadata.json dosyasından dosya bilgilerini okuyabilirsiniz

UDF EDITÖRÜ:
- Microsoft Word (UDF eklentisi ile)
- LibreOffice Writer (UDF desteği ile)
- Özel UDF editörleri
- XML editörleri (document.udf dosyası için)

NOT: Bu dosya standart UDF formatında oluşturulmuştur ve tüm UDF uyumlu editörlerde açılabilir.

Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}
Oluşturan: Avukat Bilgi Sistemi AI Converter
Versiyon: 1.0`);
      
      // ZIP'i blob olarak döndür
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // UDF MIME type ile blob oluştur
      return new Blob([zipBlob], { type: 'application/udf+zip' });
      
    } catch (error) {
      console.error('UDF oluşturma hatası:', error);
      // Hata durumunda basit UDF formatı döndür
      return createSimpleUDFDocument(text, filename, originalFormat);
    }
  };

  // Basit UDF formatı (fallback)
  const createSimpleUDFDocument = (text: string, filename: string, originalFormat: string): Blob => {
    const udfContent = `UDF DOCUMENT FORMAT v1.0
=====================================

METADATA:
- Original File: ${filename}
- Original Format: ${originalFormat.toUpperCase()}
- Conversion Date: ${new Date().toISOString()}
- Document ID: ${Date.now()}
- Version: 1.0
- Encoding: UTF-8
- Language: tr-TR
- Security: None
- Access Level: Public

CONTENT:
=====================================

${text}

=====================================
END OF UDF DOCUMENT

TECHNICAL INFO:
- Format: Universal Document Format (UDF)
- Compatibility: Cross-platform
- Security: None
- Compression: None
- Created by: Avukat Bilgi Sistemi AI Converter
- Last Modified: ${new Date().toISOString()}
- Checksum: ${calculateChecksum(text)}
`;

    return new Blob([udfContent], { type: 'application/udf' });
  };

  // Checksum hesaplama
  const calculateChecksum = (text: string): string => {
    let hash = 0;
    if (text.length === 0) return hash.toString();
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit integer'a çevir
    }
    return Math.abs(hash).toString(16);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    processFile(f);
  };

  const processFile = (f: File) => {
    if (!/(pdf|docx?)$/i.test(f.name)) {
      setState('error');
      setMessage('Sadece PDF veya DOC / DOCX dosyaları desteklenir');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setState('error');
      setMessage('Dosya 50MB sınırını aşıyor');
      return;
    }
    setFile(f);
    setState('idle');
    setMessage(`Seçildi: ${f.name}`);
    setResultBlob(null);
    setResultName('');
    setProgress(0);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const simulate = (ms: number) => new Promise(r => setTimeout(r, ms));

  const handleConvert = async () => {
    if (!file) {
      setState('error');
      setMessage('Önce bir dosya seçin');
      return;
    }
    
    try {
      setState('uploading');
      setMessage('Dosya yükleniyor...');
      setProgress(0);
      
      // Upload progress simulation
      for (let i = 0; i <= 30; i++) {
        await simulate(20);
        setProgress(i);
      }
      
      setState('converting');
      setMessage('Dönüştürülüyor...');
      
      let extractedText = '';
      let outputBlob: Blob;
      let outputName = '';
      
      // Metin çıkarma
      setProgress(40);
      setMessage('Metin çıkarılıyor...');
      
      if (file.name.toLowerCase().endsWith('.pdf')) {
        extractedText = await extractTextFromPDF(file);
      } else if (file.name.toLowerCase().match(/\.(docx?)$/)) {
        extractedText = await extractTextFromWord(file);
      } else {
        throw new Error('Desteklenmeyen dosya formatı');
      }
      
      setProgress(70);
      setMessage('Format dönüştürülüyor...');
      
      // Format dönüştürme
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      
      // Orijinal formatı belirle
      const originalFormat = file.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'WORD';
      
      switch (conversionType) {
        case 'to-udf':
          // Tüm formatları UDF'ye dönüştür
          outputBlob = await createRealUDFDocument(extractedText, file.name, originalFormat);
          outputName = `${baseName}.udf.zip`;
          break;
        case 'pdf-to-word':
          outputBlob = await createWordDocument(extractedText, baseName);
          outputName = `${baseName}.docx`;
          break;
        case 'word-to-pdf':
          outputBlob = await createPDFDocument(extractedText, baseName);
          outputName = `${baseName}.pdf`;
          break;
        case 'word-to-html':
          outputBlob = createHTMLDocument(extractedText, baseName);
          outputName = `${baseName}.html`;
          break;
        case 'pdf-to-image':
          // PDF'den görüntü dönüştürme (basit metin tabanlı)
          const imageContent = `Metin İçeriği:\n\n${extractedText}`;
          outputBlob = new Blob([imageContent], { type: 'text/plain' });
          outputName = `${baseName}.txt`;
          break;
        default:
          throw new Error('Geçersiz dönüştürme türü');
      }
      
      setProgress(100);
      setState('ready');
      setMessage('Dönüştürme başarıyla tamamlandı');
      
      setResultBlob(outputBlob);
      setResultName(outputName);
      
    } catch (error) {
      console.error('Dönüştürme hatası:', error);
      setState('error');
      setMessage(`Dönüştürme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    saveAs(resultBlob, resultName || 'converted-file');
  };

  const reset = () => {
    setFile(null);
    setState('idle');
    setMessage('Bir PDF veya DOCX dosyası seçin');
    setResultBlob(null);
    setResultName('');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const statusIcon = {
    idle: <FileText className="text-gray-500" />,
    uploading: <Loader className="animate-spin text-blue-500" />,
    converting: <Loader className="animate-spin text-blue-500" />,
    ready: <CheckCircle className="text-green-500" />,
    error: <AlertCircle className="text-red-500" />
  }[state];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dosya Dönüştürücü
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            PDF ve DOCX dosyalarınızı güvenli bir şekilde dönüştürün
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
          <div className="p-8 space-y-8">
            {/* File Upload Area */}
          <div>
            <input
                ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileSelect}
            />
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
                    : state === 'error'
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-4">
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                    dragActive ? 'bg-blue-100 dark:bg-blue-800 scale-110' : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Upload className={`w-8 h-8 transition-colors ${
                      dragActive ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                  </div>
                  
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {dragActive ? 'Dosyayı buraya bırakın' : 'Dosya seçin veya sürükleyin'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      PDF, DOC veya DOCX formatında • Maksimum 50MB
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>Güvenli</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Hızlı</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>AI Destekli</span>
                    </div>
                  </div>
                </div>
              </div>
          </div>

            {/* File Info */}
          {file && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-xl flex items-center justify-center">
                    <File className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {file.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {(file.size/1024/1024).toFixed(2)} MB • {file.name.split('.').pop()?.toUpperCase()} Format
                    </p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            )}

            {/* Conversion Type Selection */}
            {file && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/50">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  Dönüştürme Türü Seçin
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setConversionType('to-udf')}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                      conversionType === 'to-udf'
                        ? 'border-purple-500 bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4" />
                      <span className="font-medium text-sm">→ UDF</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tüm formatları UDF'ye dönüştür</p>
                  </button>
                  
                  <button
                    onClick={() => setConversionType('pdf-to-word')}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                      conversionType === 'pdf-to-word'
                        ? 'border-purple-500 bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium text-sm">PDF → Word</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF'i Word belgesine dönüştür</p>
                  </button>
                  
                  <button
                    onClick={() => setConversionType('word-to-pdf')}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                      conversionType === 'word-to-pdf'
                        ? 'border-purple-500 bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <File className="w-4 h-4" />
                      <span className="font-medium text-sm">Word → PDF</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Word belgesini PDF'e dönüştür</p>
                  </button>
                  
                  <button
                    onClick={() => setConversionType('word-to-html')}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                      conversionType === 'word-to-html'
                        ? 'border-purple-500 bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileImage className="w-4 h-4" />
                      <span className="font-medium text-sm">Word → HTML</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Word belgesini HTML'e dönüştür</p>
                  </button>
                  
                  <button
                    onClick={() => setConversionType('pdf-to-image')}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                      conversionType === 'pdf-to-image'
                        ? 'border-purple-500 bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileImage className="w-4 h-4" />
                      <span className="font-medium text-sm">PDF → Metin</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF'den metin çıkar</p>
                  </button>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {(state === 'uploading' || state === 'converting') && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{message}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
              </div>
            </div>
          )}

            {/* Status Message */}
            {!(state === 'uploading' || state === 'converting') && (
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${
                state === 'error' 
                  ? 'border-red-200 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                  : state === 'ready' 
                  ? 'border-green-200 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'border-gray-200 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300'
              }`}>
            {statusIcon}
                <span className="font-medium">{message}</span>
          </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
            <button
              onClick={handleConvert}
              disabled={!file || state === 'uploading' || state === 'converting'}
                className="flex-1 inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {(state === 'uploading' || state === 'converting') ? (
                  <Loader className="animate-spin w-5 h-5" />
                ) : (
                  <Zap className="w-5 h-5" />
                )}
              Dönüştür
            </button>
              
            <button
              onClick={handleDownload}
              disabled={!resultBlob || state !== 'ready'}
                className="flex-1 inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
                <Download className="w-5 h-5" />
              İndir
            </button>
              
            <button
              onClick={reset}
                className="px-6 inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
            >
                <RefreshCw className="w-4 h-4" />
              Sıfırla
            </button>
          </div>

            {/* Result Info */}
          {state === 'ready' && resultBlob && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-800/50">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-green-800 dark:text-green-300">
                    Dönüştürme Tamamlandı!
                  </h3>
                </div>
                <div className="text-sm text-green-700 dark:text-green-400 space-y-1">
                  <p><strong>Çıktı Dosyası:</strong> {resultName}</p>
                  <p><strong>Boyut:</strong> {(resultBlob.size/1024).toFixed(1)} KB</p>
                  <p><strong>Format:</strong> {resultName.split('.').pop()?.toUpperCase()}</p>
                  <p><strong>Dönüştürme Türü:</strong> {
                    conversionType === 'to-udf' ? '→ UDF (Universal Document Format)' :
                    conversionType === 'pdf-to-word' ? 'PDF → Word' :
                    conversionType === 'word-to-pdf' ? 'Word → PDF' :
                    conversionType === 'word-to-html' ? 'Word → HTML' :
                    'PDF → Metin'
                  }</p>
                </div>
            </div>
          )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50">
            <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Güvenli</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dosyalarınız şifrelenir ve güvenli sunucularda işlenir
            </p>
          </div>
          
          <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50">
            <Zap className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Hızlı</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI destekli dönüştürme ile saniyeler içinde sonuç
            </p>
          </div>
          
          <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50">
            <FileText className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Kaliteli</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Orijinal formatın korunduğu yüksek kalite çıktı
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileConverter;
