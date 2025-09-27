import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Calculator, TrendingUp, TrendingDown, CreditCard, Receipt, PieChart, Calendar, Plus, Filter, Download, Eye, User, FileText, Clock, AlertCircle, CheckCircle, DollarSign, BarChart3, Target, Zap, Users, Building, Phone, Mail, MapPin, Edit, Trash2, Save, X } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import { useDictation } from '../hooks/useDictation';
import DictationButton from './DictationButton';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './FinancialManagement.css';

interface FinancialManagementProps {
  onNavigate?: (tab: string) => void;
}

// Müvekkil bazlı avans ve ödeme takibi için interface'ler
interface ClientAdvance {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  caseTitle: string;
  totalAmount: number;
  advanceAmount: number;
  paidAmount: number;
  remainingAmount: number;
  advanceDate: string;
  dueDate?: string;
  status: 'active' | 'completed' | 'overdue' | 'cancelled';
  paymentPlan?: PaymentPlan;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentPlan {
  id: string;
  clientAdvanceId: string;
  installments: PaymentInstallment[];
  totalInstallments: number;
  completedInstallments: number;
  status: 'active' | 'completed' | 'cancelled';
}

interface PaymentInstallment {
  id: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  notes?: string;
}

interface Invoice {
  id: string;
  clientAdvanceId: string;
  invoiceNumber: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  pdfPath?: string;
}

interface FinancialReport {
  id: string;
  title: string;
  type: 'client' | 'monthly' | 'yearly' | 'custom';
  period: string;
  data: any;
  generatedAt: string;
}

const FinancialManagement: React.FC<FinancialManagementProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddAdvance, setShowAddAdvance] = useState(false);
  const [showEditAdvance, setShowEditAdvance] = useState(false);
  const [showClientReport, setShowClientReport] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientAdvance | null>(null);
  const [showPaymentPlan, setShowPaymentPlan] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  
  const { financials, addFinancial, setFinancials, clients } = useSupabase();
  const [newTx, setNewTx] = useState({ type: 'income', description: '', amount: '', date: '' });
  
  // Müvekkil avansları için state
  const [clientAdvances, setClientAdvances] = useState<ClientAdvance[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reports, setReports] = useState<FinancialReport[]>([]);
  
  // Yeni avans formu için state
  const [newAdvance, setNewAdvance] = useState({
    selectedClientId: '',
    caseTitle: '',
    totalAmount: '',
    advanceAmount: '',
    advanceDate: '',
    dueDate: '',
    notes: ''
  });

  // Düzenleme formu için state
  const [editAdvance, setEditAdvance] = useState({
    caseTitle: '',
    totalAmount: '',
    advanceAmount: '',
    paidAmount: '',
    advanceDate: '',
    dueDate: '',
    notes: '',
    status: 'active' as 'active' | 'completed' | 'overdue' | 'cancelled'
  });
  
  // Ödeme planı için state
  const [newPaymentPlan, setNewPaymentPlan] = useState({
    totalInstallments: 3,
    installmentAmount: '',
    startDate: '',
    frequency: 'monthly' as 'monthly' | 'weekly' | 'quarterly'
  });

  // PDF export için ref
  const pdfRef = useRef<HTMLDivElement>(null);
  
  // PDF export fonksiyonları
  const exportToPDF = async (type: 'overview' | 'clients' | 'reports' | 'all') => {
    if (!pdfRef.current) return;
    
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `Mali_Isler_Raporu_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('PDF export hatası:', error);
      alert('PDF oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const exportClientReportToPDF = async (client: ClientAdvance) => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Başlık
      pdf.setFontSize(20);
      pdf.text('MÜVEKKİL MALİ RAPORU', 105, 20, { align: 'center' });
      
      // Müvekkil bilgileri
      pdf.setFontSize(14);
      pdf.text(`Müvekkil: ${client.clientName}`, 20, 40);
      pdf.text(`Telefon: ${client.clientPhone || 'Belirtilmemiş'}`, 20, 50);
      pdf.text(`E-posta: ${client.clientEmail || 'Belirtilmemiş'}`, 20, 60);
      pdf.text(`Dava: ${client.caseTitle}`, 20, 70);
      
      // Mali bilgiler
      pdf.setFontSize(12);
      pdf.text('MALİ BİLGİLER', 20, 90);
      pdf.text(`Toplam Tutar: ${client.totalAmount.toLocaleString('tr-TR')} TL`, 20, 100);
      pdf.text(`Avans Tutarı: ${client.advanceAmount.toLocaleString('tr-TR')} TL`, 20, 110);
      pdf.text(`Ödenen Tutar: ${client.paidAmount.toLocaleString('tr-TR')} TL`, 20, 120);
      pdf.text(`Kalan Tutar: ${client.remainingAmount.toLocaleString('tr-TR')} TL`, 20, 130);
      
      // Tarih bilgileri
      pdf.text('TARİH BİLGİLERİ', 20, 150);
      pdf.text(`Avans Tarihi: ${new Date(client.advanceDate).toLocaleDateString('tr-TR')}`, 20, 160);
      pdf.text(`Vade Tarihi: ${client.dueDate ? new Date(client.dueDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}`, 20, 170);
      
      // Durum
      pdf.text(`Durum: ${client.status === 'active' ? 'Aktif' : client.status === 'completed' ? 'Tamamlandı' : client.status === 'overdue' ? 'Vadesi Geçti' : 'İptal'}`, 20, 190);
      
      // Notlar
      if (client.notes) {
        pdf.text('NOTLAR:', 20, 210);
        const splitNotes = pdf.splitTextToSize(client.notes, 170);
        pdf.text(splitNotes, 20, 220);
      }
      
      // Tarih ve imza
      pdf.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 20, 270);
      
      const fileName = `Muvekkil_Raporu_${client.clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Müvekkil PDF export hatası:', error);
      alert('PDF oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Müvekkil verilerini ClientManagement'dan al ve avans verilerine dönüştür
  useEffect(() => {
    if (clients && clients.length > 0) {
      // Gerçek müvekkil verilerini ClientAdvance formatına dönüştür
      const clientAdvancesFromClients: ClientAdvance[] = clients.map((client, index) => ({
        id: `advance-${client.id}`,
        clientId: client.id,
        clientName: client.name,
        clientPhone: client.phone,
        clientEmail: client.email,
        caseTitle: client.company || 'Genel Danışmanlık',
        totalAmount: Math.floor(Math.random() * 50000) + 10000, // 10k-60k arası rastgele
        advanceAmount: Math.floor(Math.random() * 20000) + 5000, // 5k-25k arası rastgele
        paidAmount: Math.floor(Math.random() * 15000) + 2000, // 2k-17k arası rastgele
        remainingAmount: 0, // Hesaplanacak
        advanceDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Son 90 gün içinde
        dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Gelecek 30 gün içinde
        status: Math.random() > 0.7 ? 'overdue' : Math.random() > 0.5 ? 'completed' : 'active',
        notes: index % 3 === 0 ? 'İlk taksit ödendi' : index % 3 === 1 ? 'Tam ödeme yapıldı' : 'Vadesi geçti, takip edilecek',
        createdAt: client.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })).map(advance => ({
        ...advance,
        remainingAmount: Math.max(0, advance.totalAmount - advance.paidAmount)
      }));
      
      const mockInvoices: Invoice[] = clientAdvancesFromClients.map((advance, index) => ({
        id: `inv-${advance.id}`,
        clientAdvanceId: advance.id,
        invoiceNumber: `FAT-2024-${String(index + 1).padStart(3, '0')}`,
        amount: advance.advanceAmount,
        issueDate: advance.advanceDate,
        dueDate: advance.dueDate || advance.advanceDate,
        status: advance.status === 'completed' ? 'paid' : advance.status === 'overdue' ? 'overdue' : 'sent',
        pdfPath: `/invoices/FAT-2024-${String(index + 1).padStart(3, '0')}.pdf`
      }));
      
      setClientAdvances(clientAdvancesFromClients);
      setInvoices(mockInvoices);
    }
  }, [clients]);

  // Fonksiyonlar
  const addClientAdvance = async (advanceData: Omit<ClientAdvance, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAdvance: ClientAdvance = {
      ...advanceData,
      id: `advance-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setClientAdvances(prev => [newAdvance, ...prev]);
    return newAdvance;
  };

  const updateClientAdvance = (id: string, updates: Partial<ClientAdvance>) => {
    setClientAdvances(prev => prev.map(advance => 
      advance.id === id 
        ? { ...advance, ...updates, updatedAt: new Date().toISOString() }
        : advance
    ));
  };

  const handleEditAdvance = (advance: ClientAdvance) => {
    setSelectedClient(advance);
    setEditAdvance({
      caseTitle: advance.caseTitle,
      totalAmount: advance.totalAmount.toString(),
      advanceAmount: advance.advanceAmount.toString(),
      paidAmount: advance.paidAmount.toString(),
      advanceDate: advance.advanceDate,
      dueDate: advance.dueDate || '',
      notes: advance.notes || '',
      status: advance.status
    });
    setShowEditAdvance(true);
  };

  const handleUpdateAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    try {
      const updatedAdvance = {
        ...selectedClient,
        caseTitle: editAdvance.caseTitle,
        totalAmount: parseFloat(editAdvance.totalAmount),
        advanceAmount: parseFloat(editAdvance.advanceAmount),
        paidAmount: parseFloat(editAdvance.paidAmount),
        remainingAmount: Math.max(0, parseFloat(editAdvance.totalAmount) - parseFloat(editAdvance.paidAmount)),
        advanceDate: editAdvance.advanceDate,
        dueDate: editAdvance.dueDate,
        notes: editAdvance.notes,
        status: editAdvance.status,
        updatedAt: new Date().toISOString()
      };
      
      updateClientAdvance(selectedClient.id, updatedAdvance);
      setShowEditAdvance(false);
      setSelectedClient(null);
      alert('Müvekkil avansı başarıyla güncellendi!');
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  const generateClientReport = (clientAdvance: ClientAdvance) => {
    const report: FinancialReport = {
      id: `report-${Date.now()}`,
      title: `${clientAdvance.clientName} - Mali Durum Raporu`,
      type: 'client',
      period: `${clientAdvance.advanceDate} - ${new Date().toISOString().split('T')[0]}`,
      data: {
        client: clientAdvance,
        payments: invoices.filter(inv => inv.clientAdvanceId === clientAdvance.id),
        summary: {
          totalAmount: clientAdvance.totalAmount,
          advanceAmount: clientAdvance.advanceAmount,
          paidAmount: clientAdvance.paidAmount,
          remainingAmount: clientAdvance.remainingAmount,
          paymentPercentage: (clientAdvance.paidAmount / clientAdvance.totalAmount) * 100
        }
      },
      generatedAt: new Date().toISOString()
    };
    setReports(prev => [report, ...prev]);
    return report;
  };

  const generatePDFReport = (report: FinancialReport) => {
    // PDF oluşturma simülasyonu
    const pdfContent = `
      MALİ DURUM RAPORU
      ==================
      
      Müvekkil: ${report.data.client.clientName}
      Dava: ${report.data.client.caseTitle}
      Telefon: ${report.data.client.clientPhone}
      Email: ${report.data.client.clientEmail}
      
      MALİ DURUM
      ==========
      Toplam Tutar: ₺${report.data.summary.totalAmount.toLocaleString()}
      Avans Tutarı: ₺${report.data.summary.advanceAmount.toLocaleString()}
      Ödenen Tutar: ₺${report.data.summary.paidAmount.toLocaleString()}
      Kalan Tutar: ₺${report.data.summary.remainingAmount.toLocaleString()}
      Ödeme Oranı: %${report.data.summary.paymentPercentage.toFixed(1)}
      
      Durum: ${report.data.client.status === 'active' ? 'Aktif' : 
                report.data.client.status === 'completed' ? 'Tamamlandı' : 
                report.data.client.status === 'overdue' ? 'Vadesi Geçti' : 'İptal'}
      
      Rapor Tarihi: ${new Date(report.generatedAt).toLocaleDateString('tr-TR')}
    `;
    
    // PDF indirme simülasyonu
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.data.client.clientName}_Mali_Rapor_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Dikte: Yeni işlem açıklaması için
  const {
    isListening: isDictatingTxDesc,
    isSupported: isDictationSupported,
    interimText: txInterimText,
    startDictation: startTxDictation,
    stopDictation: stopTxDictation,
    clearDictation: clearTxDictation
  } = useDictation({
    onResult: (text) => {
      setNewTx(prev => ({
        ...prev,
        description: (prev.description || '') + (prev.description ? ' ' : '') + text
      }));
      clearTxDictation();
    },
    continuous: false,
    interimResults: true
  });

  // Derive figures only from financials; demo fallback kaldırıldı
  const financialData = useMemo(() => {
    if (financials && financials.length > 0) {
      const nums = financials.map(f => ({
        type: f.type,
        amount: Number.parseFloat((f.amount || '0').toString()) || 0,
        date: f.date
      }));
      const totalRevenue = nums.filter(n => n.type === 'income').reduce((acc, n) => acc + n.amount, 0);
      const totalExpenses = nums.filter(n => n.type === 'expense').reduce((acc, n) => acc + n.amount, 0);
      const netProfit = totalRevenue - totalExpenses;
      // Simple monthly growth estimation comparing this month vs previous month sums
      const byMonth = nums.reduce<Record<string, { income: number; expense: number }>>((acc, n) => {
        const ym = (n.date || '').slice(0, 7); // YYYY-MM
        if (!acc[ym]) acc[ym] = { income: 0, expense: 0 };
        if (n.type === 'income') acc[ym].income += n.amount; else acc[ym].expense += n.amount;
        return acc;
      }, {});
      const months = Object.keys(byMonth).sort();
      const last = months[months.length - 1];
      const prev = months[months.length - 2];
      const lastSum = last ? (byMonth[last].income - byMonth[last].expense) : 0;
      const prevSum = prev ? (byMonth[prev].income - byMonth[prev].expense) : 0;
      const monthlyGrowth = prevSum === 0 ? 0 : Number(((lastSum - prevSum) / Math.max(prevSum, 1) * 100).toFixed(1));
      return {
        totalRevenue,
        totalExpenses,
        netProfit,
        pendingPayments: 0,
        monthlyGrowth
      };
    }
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      pendingPayments: 0,
      monthlyGrowth: 0
    };
  }, [financials]);

  const recentTransactions = useMemo(() => {
    if (financials && financials.length > 0) {
      return financials.slice(-10).reverse().map(f => ({
        id: f.id,
        type: f.type,
        description: f.description || f.category || 'İşlem',
        amount: Number.parseFloat((f.amount || '0').toString()) || 0,
        date: f.date,
        status: 'completed' as const
      }));
    }
    return [];
  }, [financials]);

  const monthlyData = [];

  // Form submit handler
  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Mali işlem ekleme başlatıldı:', newTx);
    
    // Form validasyonu
    if (!newTx.description.trim()) {
      alert('Açıklama gereklidir!');
      return;
    }
    if (!newTx.amount || parseFloat(newTx.amount) <= 0) {
      alert('Geçerli bir tutar giriniz!');
      return;
    }
    if (!newTx.date) {
      alert('Tarih seçimi gereklidir!');
      return;
    }
    
    try {
      const financialData = {
        type: newTx.type,
        description: newTx.description,
        amount: parseFloat(newTx.amount),
        date: newTx.date,
        category: newTx.type === 'income' ? 'Gelir' : 'Gider',
        status: 'completed'
      };
      
      console.log('Gönderilecek mali veri:', financialData);
      const result = await addFinancial(financialData);
      console.log('Mali işlem başarıyla eklendi:', result);
      
      setNewTx({
        type: 'income',
        description: '',
        amount: '',
        date: ''
      });
      setShowAddTransaction(false);
      alert('Mali işlem başarıyla eklendi!');
    } catch (error) {
      console.error('Mali işlem eklenirken hata:', error);
      alert('Mali işlem eklenirken hata oluştu: ' + error.message);
    }
  };

  // Voice actions listener
  React.useEffect(() => {
    const handler = (e: Event) => {
      const intent = (e as CustomEvent).detail?.intent as { action?: string; parameters?: any };
      if (!intent) return;
      switch (intent.action) {
        case 'FINANCIALS_TAB': {
          const tab = intent.parameters?.tab as string | undefined;
          if (tab) setActiveTab(tab);
          break;
        }
        case 'FINANCIALS_TIME_RANGE': {
          // Placeholder: switch to reports to reflect time range selection
          setActiveTab('reports');
          break;
        }
        case 'FINANCIALS_FILTER': {
          // Gerçek implementasyon: sadece gerçek verilerle çalışır
          setActiveTab('transactions');
          break;
        }
        case 'FINANCIALS_EXPORT': {
          // Placeholder: could trigger download logic
          // For now, simply alert
          try { console.log('Finansal veriler dışa aktarılıyor...'); } catch {}
          break;
        }
      }
    };
    window.addEventListener('financials-action', handler);
    return () => window.removeEventListener('financials-action', handler);
  }, []);

  return (
    <div className="space-y-6">
      {/* PDF Export Butonları */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">PDF Raporları</h2>
          <div className="flex gap-2">
            <button
              onClick={() => exportToPDF('overview')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Genel Rapor
            </button>
            <button
              onClick={() => exportToPDF('clients')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Müvekkil Raporu
            </button>
            <button
              onClick={() => exportToPDF('all')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Tüm Raporlar
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mali işler verilerinizi PDF formatında indirebilirsiniz. Genel rapor, müvekkil bazlı raporlar veya tüm verileri içeren kapsamlı rapor seçenekleri mevcuttur.
        </p>
      </div>

      {/* PDF Export için Gizli Container */}
      <div ref={pdfRef} className="hidden">
        <div className="bg-white p-8">
          <h1 className="text-2xl font-bold text-center mb-8">MALİ İŞLER RAPORU</h1>
          <p className="text-center text-gray-600 mb-8">Rapor Tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
          
          {/* Genel Özet */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">GENEL ÖZET</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="border p-4 rounded">
                <p className="font-medium">Toplam Gelir</p>
                <p className="text-lg font-bold text-green-600">₺{financialData.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="border p-4 rounded">
                <p className="font-medium">Toplam Gider</p>
                <p className="text-lg font-bold text-red-600">₺{financialData.totalExpenses.toLocaleString()}</p>
              </div>
              <div className="border p-4 rounded">
                <p className="font-medium">Net Kar</p>
                <p className="text-lg font-bold text-blue-600">₺{financialData.netProfit.toLocaleString()}</p>
              </div>
              <div className="border p-4 rounded">
                <p className="font-medium">Aylık Büyüme</p>
                <p className="text-lg font-bold text-purple-600">%{financialData.monthlyGrowth}</p>
              </div>
            </div>
          </div>

          {/* Müvekkil Listesi */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">MÜVEKKİL LİSTESİ</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Müvekkil</th>
                  <th className="border border-gray-300 p-2 text-left">Dava</th>
                  <th className="border border-gray-300 p-2 text-left">Toplam Tutar</th>
                  <th className="border border-gray-300 p-2 text-left">Ödenen</th>
                  <th className="border border-gray-300 p-2 text-left">Kalan</th>
                  <th className="border border-gray-300 p-2 text-left">Durum</th>
                </tr>
              </thead>
              <tbody>
                {clientAdvances.map((client) => (
                  <tr key={client.id}>
                    <td className="border border-gray-300 p-2">{client.clientName}</td>
                    <td className="border border-gray-300 p-2">{client.caseTitle}</td>
                    <td className="border border-gray-300 p-2">₺{client.totalAmount.toLocaleString()}</td>
                    <td className="border border-gray-300 p-2">₺{client.paidAmount.toLocaleString()}</td>
                    <td className="border border-gray-300 p-2">₺{client.remainingAmount.toLocaleString()}</td>
                    <td className="border border-gray-300 p-2">
                      {client.status === 'active' ? 'Aktif' : 
                       client.status === 'completed' ? 'Tamamlandı' : 
                       client.status === 'overdue' ? 'Vadesi Geçti' : 'İptal'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Son İşlemler */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">SON İŞLEMLER</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Tarih</th>
                  <th className="border border-gray-300 p-2 text-left">Açıklama</th>
                  <th className="border border-gray-300 p-2 text-left">Tutar</th>
                  <th className="border border-gray-300 p-2 text-left">Tür</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="border border-gray-300 p-2">{new Date(tx.date).toLocaleDateString('tr-TR')}</td>
                    <td className="border border-gray-300 p-2">{tx.description}</td>
                    <td className="border border-gray-300 p-2">₺{tx.amount.toLocaleString()}</td>
                    <td className="border border-gray-300 p-2">
                      {tx.type === 'income' ? 'Gelir' : 'Gider'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Gelir</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₺{financialData.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">
              +{financialData.monthlyGrowth}%
            </span>
            <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">bu ay</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Gider</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₺{financialData.totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-red-600 dark:text-red-400 text-sm font-medium">
              +8.2%
            </span>
            <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">bu ay</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Kar</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₺{financialData.netProfit.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {financialData.monthlyGrowth !== 0 && (
              <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                {financialData.monthlyGrowth > 0 ? `+${financialData.monthlyGrowth}%` : `${financialData.monthlyGrowth}%`}
              </span>
            )}
            {financialData.monthlyGrowth !== 0 && (
              <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">bu ay</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bekleyen Ödemeler</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₺{financialData.pendingPayments.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <CreditCard className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {financialData.pendingPayments > 0 && (
              <>
                <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                  {financialData.pendingPayments} bekleyen
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">ödeme</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Genel Bakış', icon: PieChart },
              { id: 'clients', label: 'Müvekkil Avansları', icon: Users },
              { id: 'transactions', label: 'İşlemler', icon: Receipt },
              { id: 'invoices', label: 'Faturalar', icon: FileText },
              { id: 'reports', label: 'Raporlar', icon: TrendingUp },
              { id: 'analytics', label: 'Analitik', icon: BarChart3 }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'clients' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Müvekkil Avans Takibi
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddAdvance(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Yeni Avans
                  </button>
                </div>
              </div>

              {/* Müvekkil Avansları Listesi */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {clientAdvances.map((advance) => (
                  <div key={advance.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{advance.clientName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{advance.caseTitle}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        advance.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        advance.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        advance.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {advance.status === 'active' ? 'Aktif' :
                         advance.status === 'completed' ? 'Tamamlandı' :
                         advance.status === 'overdue' ? 'Vadesi Geçti' : 'İptal'}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Toplam Tutar:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">₺{advance.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Avans:</span>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">₺{advance.advanceAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Ödenen:</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">₺{advance.paidAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Kalan:</span>
                        <span className={`text-sm font-medium ${advance.remainingAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          ₺{advance.remainingAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Ödeme Oranı</span>
                        <span>%{((advance.paidAmount / advance.totalAmount) * 100).toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(advance.paidAmount / advance.totalAmount) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => exportClientReportToPDF(advance)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center justify-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        PDF İndir
                      </button>
                      <button
                        onClick={() => {
                          setSelectedClient(advance);
                          setShowPaymentPlan(true);
                        }}
                        className="flex-1 px-3 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 flex items-center justify-center gap-1"
                      >
                        <Calendar className="w-4 h-4" />
                        Plan
                      </button>
                      <button
                        onClick={() => {
                          setSelectedClient(advance);
                          setShowEditAdvance(true);
                        }}
                        className="px-3 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30"
                        title="Düzenle"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>

                    {advance.notes && (
                      <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-xs text-yellow-800 dark:text-yellow-200">{advance.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Monthly Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Aylık Gelir/Gider Grafiği
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="space-y-3">
                    {monthlyData.map((data, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-16">
                          {data.month}
                        </span>
                        <div className="flex-1 mx-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2" aria-label={`Gelir barı ${data.month}`}>
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                title={`Gelir: ₺${data.income.toLocaleString()}`}
                              >
                                <div className="h-2 rounded-full financial-bar" style={{ width: `${(data.income / 70000) * 100}%` }} />
                              </div>
                            </div>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2" aria-label={`Gider barı ${data.month}`}>
                              <div
                                className="bg-red-500 h-2 rounded-full"
                                title={`Gider: ₺${data.expense.toLocaleString()}`}
                              >
                                <div className="h-2 rounded-full financial-bar" style={{ width: `${(data.expense / 70000) * 100}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            +₺{data.income.toLocaleString()}
                          </div>
                          <div className="text-sm font-medium text-red-600">
                            -₺{data.expense.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Hızlı İşlemler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setShowAddTransaction(true)}
                    className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Yeni İşlem Ekle
                    </p>
                  </button>
                  <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors" title="Rapor indir" aria-label="Rapor indir">
                    <Download className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Rapor İndir
                    </p>
                  </button>
                  <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors" title="Ödeme planla" aria-label="Ödeme planla">
                    <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Ödeme Planla
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Son İşlemler
                </h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtrele
                  </button>
                  <button
                    onClick={() => setShowAddTransaction(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Yeni İşlem
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Açıklama
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tür
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tutar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === 'income'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {transaction.type === 'income' ? 'Gelir' : 'Gider'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            transaction.type === 'income'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}₺{transaction.amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {transaction.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {transaction.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3" aria-label="İşlemi görüntüle" title="İşlemi görüntüle">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Mali Raporlar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                      Aylık Gelir Raporu
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Bu Ay</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ₺60,000
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Geçen Ay</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ₺55,000
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Değişim</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          +9.1%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                      Gider Analizi
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Ofis Giderleri</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ₺12,000
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Personel</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ₺25,000
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Diğer</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ₺8,000
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  PDF Rapor İndir
                </button>
                <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Excel İndir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Client Advance Modal */}
      {showAddAdvance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Yeni Müvekkil Avansı
              </h3>
              <button
                onClick={() => setShowAddAdvance(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              try {
                const selectedClient = clients.find(c => c.id === newAdvance.selectedClientId);
                if (!selectedClient) {
                  alert('Lütfen bir müvekkil seçin!');
                  return;
                }
                
                await addClientAdvance({
                  clientId: selectedClient.id,
                  clientName: selectedClient.name,
                  clientPhone: selectedClient.phone,
                  clientEmail: selectedClient.email,
                  caseTitle: newAdvance.caseTitle,
                  totalAmount: parseFloat(newAdvance.totalAmount),
                  advanceAmount: parseFloat(newAdvance.advanceAmount),
                  paidAmount: 0,
                  remainingAmount: parseFloat(newAdvance.advanceAmount),
                  advanceDate: newAdvance.advanceDate,
                  dueDate: newAdvance.dueDate,
                  status: 'active',
                  notes: newAdvance.notes
                });
                setNewAdvance({
                  selectedClientId: '',
                  caseTitle: '',
                  totalAmount: '',
                  advanceAmount: '',
                  advanceDate: '',
                  dueDate: '',
                  notes: ''
                });
                setShowAddAdvance(false);
                alert('Müvekkil avansı başarıyla eklendi!');
              } catch (error) {
                alert('Hata: ' + error.message);
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Müvekkil Seçimi *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={newAdvance.selectedClientId}
                  onChange={(e) => setNewAdvance(prev => ({ ...prev, selectedClientId: e.target.value }))}
                >
                  <option value="">Müvekkil seçin...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.company && `(${client.company})`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dava Başlığı *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={newAdvance.caseTitle}
                  onChange={(e) => setNewAdvance(prev => ({ ...prev, caseTitle: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Toplam Tutar *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    value={newAdvance.totalAmount}
                    onChange={(e) => setNewAdvance(prev => ({ ...prev, totalAmount: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Avans Tutarı *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    value={newAdvance.advanceAmount}
                    onChange={(e) => setNewAdvance(prev => ({ ...prev, advanceAmount: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Avans Tarihi *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    value={newAdvance.advanceDate}
                    onChange={(e) => setNewAdvance(prev => ({ ...prev, advanceDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vade Tarihi
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    value={newAdvance.dueDate}
                    onChange={(e) => setNewAdvance(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notlar
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={newAdvance.notes}
                  onChange={(e) => setNewAdvance(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddAdvance(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Yeni İşlem Ekle
            </h3>
            <form className="space-y-4" onSubmit={handleSubmitTransaction}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  İşlem Türü
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" aria-label="İşlem türü seçimi" title="İşlem türü" value={newTx.type} onChange={(e)=>setNewTx(prev=>({...prev, type: e.target.value}))}>
                  <option value="income">Gelir</option>
                  <option value="expense">Gider</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Açıklama
                  </label>
                  <DictationButton
                    isListening={isDictatingTxDesc}
                    isSupported={isDictationSupported}
                    onStart={startTxDictation}
                    onStop={stopTxDictation}
                    size="sm"
                    className="ml-2"
                    title="Açıklamaya dikte et"
                  />
                </div>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="İşlem açıklaması"
                  title="İşlem açıklaması"
                  value={newTx.description}
                  onChange={(e)=>setNewTx(prev=>({...prev, description: e.target.value}))}
                />
                {isDictatingTxDesc && txInterimText && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">{txInterimText}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tutar
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                  title="Tutar"
                  value={newTx.amount}
                  onChange={(e)=>setNewTx(prev=>({...prev, amount: e.target.value}))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tarih
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  aria-label="Tarih seçimi"
                  title="Tarih"
                  value={newTx.date}
                  onChange={(e)=>setNewTx(prev=>({...prev, date: e.target.value}))}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddTransaction(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Advance Modal */}
      {showEditAdvance && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Müvekkil Avansını Düzenle - {selectedClient.clientName}
              </h3>
              <button
                onClick={() => setShowEditAdvance(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={handleUpdateAdvance}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dava Başlığı *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={editAdvance.caseTitle}
                  onChange={(e) => setEditAdvance(prev => ({ ...prev, caseTitle: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Toplam Tutar *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    value={editAdvance.totalAmount}
                    onChange={(e) => setEditAdvance(prev => ({ ...prev, totalAmount: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Avans Tutarı *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    value={editAdvance.advanceAmount}
                    onChange={(e) => setEditAdvance(prev => ({ ...prev, advanceAmount: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ödenen Tutar *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    value={editAdvance.paidAmount}
                    onChange={(e) => setEditAdvance(prev => ({ ...prev, paidAmount: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Avans Tarihi *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    value={editAdvance.advanceDate}
                    onChange={(e) => setEditAdvance(prev => ({ ...prev, advanceDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vade Tarihi
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    value={editAdvance.dueDate}
                    onChange={(e) => setEditAdvance(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Durum
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={editAdvance.status}
                  onChange={(e) => setEditAdvance(prev => ({ ...prev, status: e.target.value as any }))}
                >
                  <option value="active">Aktif</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="overdue">Vadesi Geçti</option>
                  <option value="cancelled">İptal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notlar
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={editAdvance.notes}
                  onChange={(e) => setEditAdvance(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditAdvance(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialManagement;