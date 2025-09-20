import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Download, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import { usePrivacy, type PrivacyConsent } from '../lib/privacyManager';

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  consentType: PrivacyConsent['consentType'];
  purpose: string;
  dataCategories: string[];
  retentionPeriod: number;
}

export const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  onReject,
  consentType,
  purpose,
  dataCategories,
  retentionPeriod
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen) return null;

  const getConsentTypeText = (type: PrivacyConsent['consentType']) => {
    switch (type) {
      case 'voice_recording':
        return 'Ses Kaydı ve Analizi';
      case 'data_processing':
        return 'Veri İşleme';
      case 'analytics':
        return 'Analitik Veriler';
      case 'marketing':
        return 'Pazarlama Verileri';
      default:
        return 'Veri İşleme';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            KVKK Uyumlu Rıza Bildirimi
          </h2>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              {getConsentTypeText(consentType)}
            </h3>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              {purpose}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              İşlenecek Veri Kategorileri:
            </h4>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
              {dataCategories.map((category, index) => (
                <li key={index}>{category}</li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Saklama Süresi:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-300">{retentionPeriod} gün</span>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Rıza Türü:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-300">Açık Rıza</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isExpanded ? 'Detayları Gizle' : 'Detaylı Bilgi'}
            </button>

            {isExpanded && (
              <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                <h5 className="font-medium mb-2">KVKK Kapsamında Haklarınız:</h5>
                <ul className="space-y-1">
                  <li>• Verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>• İşlenen verileriniz hakkında bilgi talep etme</li>
                  <li>• Verilerinizin işlenme amacını öğrenme</li>
                  <li>• Verilerinizin silinmesini talep etme</li>
                  <li>• Verilerinizin düzeltilmesini talep etme</li>
                  <li>• Rızanızı geri çekme</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onReject}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <XCircle className="w-4 h-4 inline mr-2" />
            Reddet
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4 inline mr-2" />
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
};

export const DataRightsPanel: React.FC = () => {
  const { consents, isLoading, withdrawConsent, deleteUserData, exportUserData } = usePrivacy();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const handleWithdrawConsent = async (consentType: PrivacyConsent['consentType']) => {
    if (confirm('Bu rızayı geri çekmek istediğinizden emin misiniz?')) {
      await withdrawConsent(consentType);
    }
  };

  const handleDeleteData = async () => {
    if (confirm('TÜM VERİLERİNİZİ SİLMEK İSTEDİĞİNİZDEN EMİN MİSİNİZ? Bu işlem geri alınamaz!')) {
      await deleteUserData();
      setShowDeleteConfirm(false);
    }
  };

  const handleExportData = async () => {
    const data = await exportUserData();
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setShowExportConfirm(false);
  };

  const getConsentStatus = (consent: PrivacyConsent) => {
    if (!consent.granted) return { text: 'Reddedildi', color: 'text-red-600', icon: XCircle };
    
    const expiresAt = consent.expiresAt ? new Date(consent.expiresAt) : null;
    if (expiresAt && expiresAt < new Date()) {
      return { text: 'Süresi Doldu', color: 'text-orange-600', icon: XCircle };
    }
    
    return { text: 'Aktif', color: 'text-green-600', icon: CheckCircle };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Veri Haklarınız
        </h2>
      </div>

      {/* Mevcut Rızalar */}
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
          Mevcut Rızalarınız
        </h3>
        <div className="space-y-3">
          {Array.from(consents.values()).map((consent) => {
            const status = getConsentStatus(consent);
            const StatusIcon = status.icon;
            
            return (
              <div key={consent.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {consent.consentType === 'voice_recording' ? 'Ses Kaydı' :
                       consent.consentType === 'data_processing' ? 'Veri İşleme' :
                       consent.consentType === 'analytics' ? 'Analitik' : 'Pazarlama'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {consent.purpose}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Verilen: {new Date(consent.grantedAt).toLocaleDateString('tr-TR')}</span>
                      {consent.expiresAt && (
                        <span>Süresi: {new Date(consent.expiresAt).toLocaleDateString('tr-TR')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1 ${status.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm">{status.text}</span>
                    </div>
                    {consent.granted && (
                      <button
                        onClick={() => handleWithdrawConsent(consent.consentType)}
                        className="px-3 py-1 text-xs text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded transition-colors"
                        disabled={isLoading}
                      >
                        Geri Çek
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {consents.size === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Henüz rıza verilmemiş
            </div>
          )}
        </div>
      </div>

      {/* Veri Hakları */}
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
          Veri Haklarınız
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setShowExportConfirm(true)}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            disabled={isLoading}
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Veri Taşınabilirliği</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Verilerinizi JSON formatında indirin
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            disabled={isLoading}
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Unutulma Hakkı</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Tüm verilerinizi kalıcı olarak silin
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Onay Modalları */}
      {showExportConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Veri İndirme Onayı
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Tüm verilerinizi JSON formatında indirmek istediğinizden emin misiniz?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExportConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleExportData}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'İndiriliyor...' : 'İndir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-600 mb-4">
              ⚠️ Veri Silme Onayı
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              <strong>DİKKAT:</strong> Bu işlem TÜM VERİLERİNİZİ kalıcı olarak silecektir. 
              Bu işlem geri alınamaz!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteData}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyConsentModal;

