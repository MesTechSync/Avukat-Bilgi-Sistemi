import React, { useState } from 'react';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Lock, 
  Unlock, 
  Eye, 
  Download, 
  Upload, 
  Hash, 
  Link, 
  AlertTriangle,
  Zap,
  Globe,
  Key,
  Database,
  Fingerprint,
  Search,
  BarChart3
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'petition' | 'evidence' | 'certificate' | 'agreement';
  hash: string;
  timestamp: string;
  status: 'verified' | 'pending' | 'failed' | 'expired';
  blockchain: 'ethereum' | 'polygon' | 'binance' | 'custom';
  transactionId: string;
  blockNumber: number;
  gasUsed: number;
  verifier: string;
  integrity: number;
  authenticity: number;
}

interface VerificationResult {
  documentId: string;
  isVerified: boolean;
  verificationTime: string;
  blockchainProof: string;
  integrityScore: number;
  authenticityScore: number;
  warnings: string[];
  recommendations: string[];
}

const BlockchainVerification: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'doc-1',
      name: 'İş Sözleşmesi - Ayşe Demir',
      type: 'contract',
      hash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
      timestamp: '2024-01-15 14:30:25',
      status: 'verified',
      blockchain: 'ethereum',
      transactionId: '0x1234567890abcdef1234567890abcdef12345678',
      blockNumber: 18543210,
      gasUsed: 21000,
      verifier: 'Smart Contract v2.1',
      integrity: 98,
      authenticity: 95
    },
    {
      id: 'doc-2',
      name: 'Velayet Dilekçesi - Ali Kaya',
      type: 'petition',
      hash: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234',
      timestamp: '2024-01-16 09:15:42',
      status: 'pending',
      blockchain: 'polygon',
      transactionId: '0x2345678901bcdef1234567890abcdef1234567890',
      blockNumber: 45234567,
      gasUsed: 15000,
      verifier: 'Smart Contract v2.1',
      integrity: 0,
      authenticity: 0
    },
    {
      id: 'doc-3',
      name: 'Güvenlik Kamerası Kaydı',
      type: 'evidence',
      hash: '0x3c4d5e6f7890abcdef1234567890abcdef123456',
      timestamp: '2024-01-17 16:45:18',
      status: 'verified',
      blockchain: 'binance',
      transactionId: '0x3456789012cdef1234567890abcdef1234567890',
      blockNumber: 32456789,
      gasUsed: 25000,
      verifier: 'Smart Contract v2.1',
      integrity: 99,
      authenticity: 97
    }
  ]);

  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchHash, setSearchHash] = useState('');

  const verifyDocument = async (documentId: string) => {
    setIsVerifying(true);
    
    // Simüle edilmiş blockchain doğrulama
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const document = documents.find(doc => doc.id === documentId);
    if (!document) return;
    
    const result: VerificationResult = {
      documentId,
      isVerified: Math.random() > 0.2, // %80 başarı oranı
      verificationTime: new Date().toLocaleString('tr-TR'),
      blockchainProof: `0x${Math.random().toString(16).substr(2, 40)}`,
      integrityScore: Math.floor(Math.random() * 20) + 80,
      authenticityScore: Math.floor(Math.random() * 20) + 80,
      warnings: document.status === 'pending' ? ['Doğrulama bekleniyor'] : [],
      recommendations: ['Blockchain kaydı güncel', 'Güvenlik seviyesi yüksek']
    };
    
    setVerificationResults(prev => [result, ...prev.slice(0, 9)]);
    
    // Document status güncelle
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, status: result.isVerified ? 'verified' : 'failed' }
        : doc
    ));
    
    setIsVerifying(false);
  };

  const searchByHash = () => {
    if (!searchHash) return;
    
    // Simüle edilmiş hash arama
    const foundDocument = documents.find(doc => 
      doc.hash.toLowerCase().includes(searchHash.toLowerCase())
    );
    
    if (foundDocument) {
      setSelectedDocument(foundDocument);
    } else {
      alert('Belge bulunamadı!');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'expired': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'expired': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contract': return <FileText className="w-4 h-4" />;
      case 'petition': return <FileText className="w-4 h-4" />;
      case 'evidence': return <Eye className="w-4 h-4" />;
      case 'certificate': return <Shield className="w-4 h-4" />;
      case 'agreement': return <Link className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getBlockchainColor = (blockchain: string) => {
    switch (blockchain) {
      case 'ethereum': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'polygon': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'binance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'custom': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Blockchain Belge Doğrulama
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Hukuki belgelerin blockchain üzerinde güvenli doğrulaması ve saklanması
          </p>
        </div>

        {/* Hash Search */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Hash ile Belge Arama
            </h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchHash}
                  onChange={(e) => setSearchHash(e.target.value)}
                  placeholder="Belge hash'ini girin (örn: 0x1a2b3c4d...)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button
                onClick={searchByHash}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Ara
              </button>
            </div>
          </div>
        </div>

        {/* Document List */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Belgeler
              </h3>
              <button
                onClick={() => {/* Upload functionality */}}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Belge Yükle
              </button>
            </div>
            
            <div className="space-y-4">
              {documents.map((document) => (
                <div key={document.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(document.type)}
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">
                          {document.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {document.timestamp}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(document.status)}`}>
                        {getStatusIcon(document.status)}
                        {document.status}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getBlockchainColor(document.blockchain)}`}>
                        {document.blockchain}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hash</p>
                      <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                        {document.hash}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transaction ID</p>
                      <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                        {document.transactionId}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Block Number</p>
                      <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                        {document.blockNumber.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {document.status === 'verified' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bütünlük Skoru</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${document.integrity}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            %{document.integrity}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Orijinallik Skoru</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${document.authenticity}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            %{document.authenticity}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => verifyDocument(document.id)}
                      disabled={isVerifying || document.status === 'verified'}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      {isVerifying ? 'Doğrulanıyor...' : 'Doğrula'}
                    </button>
                    <button
                      onClick={() => setSelectedDocument(document)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Detaylar
                    </button>
                    <button
                      onClick={() => {/* Download functionality */}}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      İndir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Verification Results */}
        {verificationResults.length > 0 && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Doğrulama Sonuçları
              </h3>
              <div className="space-y-4">
                {verificationResults.map((result, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {result.isVerified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">
                            Belge Doğrulama Sonucu
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {result.verificationTime}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.isVerified 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {result.isVerified ? 'Doğrulandı' : 'Doğrulanamadı'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bütünlük Skoru</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${result.integrityScore}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            %{result.integrityScore}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Orijinallik Skoru</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${result.authenticityScore}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            %{result.authenticityScore}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Blockchain Proof</p>
                      <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                        {result.blockchainProof}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Blockchain Statistics */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Blockchain İstatistikleri
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {documents.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Belge</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {documents.filter(doc => doc.status === 'verified').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Doğrulanmış</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {documents.filter(doc => doc.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Bekleyen</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  %{Math.round((documents.filter(doc => doc.status === 'verified').length / documents.length) * 100)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Başarı Oranı</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainVerification;
