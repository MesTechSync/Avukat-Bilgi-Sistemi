import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Database, Save, Eye, EyeOff, MessageCircle, Code, ExternalLink } from 'lucide-react';
import LiveSupport from './LiveSupport';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showLiveSupport, setShowLiveSupport] = useState(false);
  const [settings, setSettings] = useState({
    // Profile Settings
    name: 'Av. Mehmet Zeki Alagöz',
    email: 'mehmet@hukuk.com',
    phone: '+90 532 123 4567',
    title: 'Avukat',
    company: 'Hukuk Bürosu',
    bio: 'Deneyimli hukuk uzmanı',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    caseUpdates: true,
    appointmentReminders: true,
    
    // Security Settings
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '30',
    
    // Appearance Settings
    theme: 'system',
    language: 'tr',
    dateFormat: 'dd/mm/yyyy',
    timeFormat: '24h',
    
    // System Settings
    autoBackup: true,
    dataRetention: '12',
    apiAccess: false
  });

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'security', label: 'Güvenlik', icon: Shield },
    { id: 'appearance', label: 'Görünüm', icon: Palette },
    { id: 'system', label: 'Sistem', icon: Database },
    { id: 'support', label: 'AI Destek', icon: MessageCircle },
    { id: 'developer', label: 'Geliştirici', icon: Code }
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Ses komutları için event listener
  useEffect(() => {
    const handleSettingsTabChange = (event: CustomEvent) => {
      const { tab } = event.detail;
      if (tab && tabs.find(t => t.id === tab)) {
        setActiveTab(tab);
      }
    };

    window.addEventListener('settings-tab-change', handleSettingsTabChange as EventListener);
    
    return () => {
      window.removeEventListener('settings-tab-change', handleSettingsTabChange as EventListener);
    };
  }, []);

  const handleSave = () => {
    // Save settings logic here
    alert('Ayarlar kaydedildi!');
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-2xl font-bold">
            {settings.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Fotoğraf Değiştir
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            JPG, PNG veya GIF. Maksimum 2MB.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ad Soyad
          </label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => handleSettingChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            E-posta
          </label>
          <input
            type="email"
            value={settings.email}
            onChange={(e) => handleSettingChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Telefon
          </label>
          <input
            type="tel"
            value={settings.phone}
            onChange={(e) => handleSettingChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Unvan
          </label>
          <input
            type="text"
            value={settings.title}
            onChange={(e) => handleSettingChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Şirket
          </label>
          <input
            type="text"
            value={settings.company}
            onChange={(e) => handleSettingChange('company', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Biyografi
          </label>
          <textarea
            rows={3}
            value={settings.bio}
            onChange={(e) => handleSettingChange('bio', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Kendiniz hakkında kısa bilgi..."
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Bildirim Tercihleri
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">E-posta Bildirimleri</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Önemli güncellemeler için e-posta alın</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">SMS Bildirimleri</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Acil durumlar için SMS alın</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Push Bildirimleri</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tarayıcı bildirimleri alın</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Dava Güncellemeleri</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dava durumu değişikliklerinde bildirim alın</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.caseUpdates}
                onChange={(e) => handleSettingChange('caseUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Randevu Hatırlatmaları</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Yaklaşan randevular için hatırlatma alın</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.appointmentReminders}
                onChange={(e) => handleSettingChange('appointmentReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Güvenlik Ayarları
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mevcut Şifre
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white pr-10"
                placeholder="Mevcut şifrenizi girin"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Yeni Şifre
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Yeni şifre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Şifre Tekrar
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Şifre tekrar"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">İki Faktörlü Doğrulama</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Hesabınız için ek güvenlik katmanı</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.twoFactorAuth}
                onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Giriş Uyarıları</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Yeni cihazdan giriş yapıldığında bildirim alın</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.loginAlerts}
                onChange={(e) => handleSettingChange('loginAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Oturum Zaman Aşımı (dakika)
            </label>
            <select
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="15">15 dakika</option>
              <option value="30">30 dakika</option>
              <option value="60">1 saat</option>
              <option value="120">2 saat</option>
              <option value="480">8 saat</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Görünüm Ayarları
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tema
            </label>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="light">Açık Tema</option>
              <option value="dark">Koyu Tema</option>
              <option value="system">Sistem Ayarı</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dil
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tarih Formatı
              </label>
              <select
                value={settings.dateFormat}
                onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                <option value="yyyy-mm-dd">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Saat Formatı
              </label>
              <select
                value={settings.timeFormat}
                onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="24h">24 Saat</option>
                <option value="12h">12 Saat (AM/PM)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Sistem Ayarları
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Otomatik Yedekleme</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Verilerinizi otomatik olarak yedekleyin</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Veri Saklama Süresi (ay)
            </label>
            <select
              value={settings.dataRetention}
              onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="6">6 ay</option>
              <option value="12">12 ay</option>
              <option value="24">24 ay</option>
              <option value="60">5 yıl</option>
              <option value="-1">Süresiz</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">API Erişimi</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Üçüncü taraf uygulamalar için API erişimi</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.apiAccess}
                onChange={(e) => handleSettingChange('apiAccess', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Tehlikeli Bölge</h4>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                Tüm Verileri Dışa Aktar
              </button>
              <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Hesabı Sil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSupportTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          AI Destek & Sistem Tanıtımı
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Yapay zeka destek asistanımızla anında iletişime geçin. Sistem arızalarını gidermek ve sorularınızı yanıtlamak için buradayız.
        </p>
      </div>

      {/* System Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h4 className="font-semibold text-blue-800 dark:text-blue-200">Sistem Tanıtımı</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">🏛️ Ana Modüller:</h5>
            <ul className="space-y-1 text-blue-700 dark:text-blue-300">
              <li>• Dava Yönetimi (Case Management)</li>
              <li>• Müvekkil Takibi (Client Management)</li>
              <li>• Randevu Sistemi (Appointment)</li>
              <li>• Mali Yönetim (Financial)</li>
              <li>• Hukuki Arama (Legal Search)</li>
              <li>• AI Asistan (AI Assistant)</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">🔧 Teknik Özellikler:</h5>
            <ul className="space-y-1 text-blue-700 dark:text-blue-300">
              <li>• React + TypeScript Frontend</li>
              <li>• FastAPI Backend</li>
              <li>• Supabase Database</li>
              <li>• Gemini AI Entegrasyonu</li>
              <li>• Gerçek Zamanlı Veri</li>
              <li>• Güvenli API Bağlantıları</li>
            </ul>
          </div>
        </div>
      </div>

      {/* AI Deep Thinking */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h4 className="font-semibold text-purple-800 dark:text-purple-200">🧠 Derin Düşünme AI</h4>
        </div>
        <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
          AI asistanımız karmaşık sorunları analiz eder, çözüm önerileri sunar ve sistem arızalarını otomatik olarak tespit eder.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
            <h5 className="font-medium text-purple-900 dark:text-purple-100 mb-1">🔍 Problem Analizi</h5>
            <p className="text-xs text-purple-600 dark:text-purple-400">Sorunları derinlemesine analiz eder</p>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
            <h5 className="font-medium text-purple-900 dark:text-purple-100 mb-1">💡 Çözüm Önerileri</h5>
            <p className="text-xs text-purple-600 dark:text-purple-400">Adım adım çözüm sunar</p>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
            <h5 className="font-medium text-purple-900 dark:text-purple-100 mb-1">🛠️ Otomatik Düzeltme</h5>
            <p className="text-xs text-purple-600 dark:text-purple-400">Bazı sorunları otomatik çözer</p>
          </div>
        </div>
      </div>

      {/* Support Status */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h4 className="font-semibold text-green-800 dark:text-green-200">AI Destek Asistanı Aktif</h4>
        </div>
        <p className="text-sm text-green-700 dark:text-green-300 mb-4">
          Ortalama yanıt süresi: Anında • 7/24 hizmet • Derin düşünme modu aktif
        </p>
        <button
          onClick={() => setShowLiveSupport(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          AI Destek Başlat
        </button>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">AI Destek</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Yapay zeka ile anında yanıt alın
          </p>
          <button
            onClick={() => setShowLiveSupport(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
          >
            AI Destek Başlat
          </button>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">E-posta Desteği</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Detaylı sorularınız için e-posta gönderin
          </p>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors">
            E-posta Gönder
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Sık Sorulan Sorular & Sistem Arızaları</h4>
        <div className="space-y-3">
          <div className="border-l-4 border-blue-500 pl-4">
            <h5 className="font-medium text-gray-900 dark:text-white">Sistem nasıl çalışır?</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Avukat Bilgi Sistemi, hukuki süreçlerinizi dijitalleştiren kapsamlı bir platformdur. React frontend, FastAPI backend ve Supabase veritabanı ile çalışır.
            </p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <h5 className="font-medium text-gray-900 dark:text-white">🚨 Sistem arızası nasıl çözerim?</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI Destek'e sorununuzu detaylı açıklayın. Sistem otomatik tanı koyar ve çözüm önerir. Örnek: "Dava ekleme butonu çalışmıyor" veya "Veri yüklenmiyor"
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h5 className="font-medium text-gray-900 dark:text-white">Verilerim güvende mi?</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tüm verileriniz şifrelenerek saklanır ve güvenlik protokolleri ile korunur. Supabase güvenlik standartları kullanılır.
            </p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4">
            <h5 className="font-medium text-gray-900 dark:text-white">⚠️ Yavaş çalışma sorunu?</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI Destek'e "Sistem yavaş çalışıyor" yazın. Tarayıcı cache temizleme, internet bağlantısı kontrolü ve sistem optimizasyonu önerileri alın.
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h5 className="font-medium text-gray-900 dark:text-white">Nasıl yedekleme yaparım?</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sistem otomatik yedekleme yapar, manuel yedekleme için Ayarlar &gt; Sistem bölümünü kullanın.
            </p>
          </div>
          <div className="border-l-4 border-indigo-500 pl-4">
            <h5 className="font-medium text-gray-900 dark:text-white">🔧 API bağlantı hatası?</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              "API bağlantı hatası" yazın. Backend servis durumu, CORS ayarları ve network bağlantısı kontrol edilir.
            </p>
          </div>
        </div>
      </div>

      {/* Troubleshooting Guide */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
            <MessageCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h4 className="font-semibold text-orange-800 dark:text-orange-200">🛠️ Hızlı Sorun Giderme</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-orange-900 dark:text-orange-100 mb-2">Yaygın Sorunlar:</h5>
            <ul className="space-y-1 text-orange-700 dark:text-orange-300">
              <li>• Sayfa yüklenmiyor → Tarayıcı yenile</li>
              <li>• Veri kaydedilmiyor → İnternet kontrolü</li>
              <li>• Buton çalışmıyor → JavaScript aktif mi?</li>
              <li>• Yavaş performans → Cache temizle</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-orange-900 dark:text-orange-100 mb-2">AI'ya Sorabilecekleriniz:</h5>
            <ul className="space-y-1 text-orange-700 dark:text-orange-300">
              <li>• "Sistem çöktü, ne yapmalıyım?"</li>
              <li>• "Veri kaybettim, kurtarılabilir mi?"</li>
              <li>• "Bu hata ne anlama geliyor?"</li>
              <li>• "Nasıl optimize edebilirim?"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeveloperTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Geliştirici Bilgileri
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Sistem geliştirici bilgileri ve teknik detaylar
        </p>
      </div>

      {/* Developer Info */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Code className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h4 className="font-semibold text-purple-800 dark:text-purple-200">Arax Teknoloji</h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">Sistem Geliştiricisi</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-700 dark:text-purple-300">Web Sitesi:</span>
            <a 
              href="https://arax.tr/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition-colors"
            >
              arax.tr
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-700 dark:text-purple-300">Sistem Versiyonu:</span>
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">v1.0.0</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-700 dark:text-purple-300">Build Tarihi:</span>
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
              {new Date().toLocaleDateString('tr-TR')}
            </span>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Teknoloji Stack</h4>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div>• React + TypeScript</div>
            <div>• Supabase Database</div>
            <div>• Gemini AI Integration</div>
            <div>• OpenAI API</div>
            <div>• Tailwind CSS</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Özellikler</h4>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div>• AI Destek Asistanı</div>
            <div>• Dava Yönetimi</div>
            <div>• Müvekkil Takibi</div>
            <div>• Mali İşler</div>
            <div>• Hukuki Analiz</div>
          </div>
        </div>
      </div>

      {/* Contact Developer */}
      <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Geliştirici ile İletişim</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Sistem ile ilgili teknik sorularınız için geliştirici ile iletişime geçebilirsiniz.
        </p>
        <div className="flex gap-3">
          <a 
            href="https://arax.tr/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Web Sitesi
          </a>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
            <MessageCircle className="w-4 h-4" />
            Mesaj Gönder
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'security':
        return renderSecurityTab();
      case 'appearance':
        return renderAppearanceTab();
      case 'system':
        return renderSystemTab();
      case 'support':
        return renderSupportTab();
      case 'developer':
        return renderDeveloperTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white p-4 md:p-8 rounded-xl backdrop-blur-xl shadow-2xl border border-white/20">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <SettingsIcon className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-bold truncate">Ayarlar</h1>
            <p className="text-blue-100 text-sm md:text-base truncate">Hesap ve sistem ayarlarınızı yönetin</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 backdrop-blur-xl p-3 md:p-4">
            <nav className="space-y-1 md:space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-50/70 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-lg backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:backdrop-blur-sm'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <span className="text-sm md:text-base font-medium text-left">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 backdrop-blur-xl p-3 md:p-6">
            {renderTabContent()}
            
            {/* Save Button */}
            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3">
                <button className="px-4 md:px-6 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors order-2 sm:order-1">
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors order-1 sm:order-2"
                >
                  <Save className="w-4 h-4" />
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Support Modal */}
      <LiveSupport 
        isOpen={showLiveSupport} 
        onClose={() => setShowLiveSupport(false)} 
      />
    </div>
  );
}