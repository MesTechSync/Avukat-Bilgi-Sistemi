import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, Database, Key, Save, Eye, EyeOff } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
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
    { id: 'voice', label: 'Ses', icon: Globe }
  ];

  React.useEffect(() => {
    const onSelect = (e: Event) => {
      const tab = (e as CustomEvent).detail?.tab as string | undefined;
      if (!tab) return;
      const found = tabs.find(t => t.id === tab);
      if (found) setActiveTab(found.id);
    };
    window.addEventListener('settings-select-tab', onSelect as any);
    // Apply pending tab deep-link if present
    try {
      const pending = localStorage.getItem('pending_settings_tab');
      if (pending) {
        const found = tabs.find(t => t.id === pending);
        if (found) setActiveTab(found.id);
        localStorage.removeItem('pending_settings_tab');
      }
    } catch {}
    return () => window.removeEventListener('settings-select-tab', onSelect as any);
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Save settings logic here
    alert('Ayarlar kaydedildi!');
  };

  const VoiceSettingsTab: React.FC = () => {
    const get = (k: string, fallback: string) => {
      try { return localStorage.getItem(k) ?? fallback; } catch { return fallback; }
    };
    const set = (k: string, v: string) => {
      try { localStorage.setItem(k, v); } catch {}
    };
    const [consent, setConsent] = useState(get('voice_privacy_consent_v1', 'false') === 'true');
    const [remote, setRemote] = useState(get('voice_privacy_remote_logging_v1', 'false') === 'true');
    const [pii, setPii] = useState(get('voice_privacy_pii_masking_v1', 'true') === 'true');
    const [fuzzy, setFuzzy] = useState(get('VITE_VOICE_FUZZY', 'on') !== 'off');
    const [th, setTh] = useState(get('VITE_VOICE_FUZZY_THRESHOLD', '0.6'));
    const [strict, setStrict] = useState(get('VITE_VOICE_FUZZY_STRICT_SCORE', '0.85'));
    const [ctx, setCtx] = useState(get('VITE_VOICE_FUZZY_CONTEXT_SCORE', '0.65'));
  const [recLang, setRecLang] = useState(get('voice_recognition_lang', 'tr-TR'));
    const [debugOverlay, setDebugOverlay] = useState(get('voice_debug_overlay', 'off') === 'on');
    const [autoRestart, setAutoRestart] = useState(get('voice_autorestart', 'on') !== 'off');
    const [minConf, setMinConf] = useState(get('voice_min_confidence', '0'));
  const [pushToTalk, setPushToTalk] = useState(get('voice_push_to_talk', 'off') === 'on');
  const [ttsGate, setTtsGate] = useState(get('voice_tts_gate', 'on') !== 'off');

    const saveAll = () => {
      set('voice_privacy_consent_v1', consent ? 'true' : 'false');
      set('voice_privacy_remote_logging_v1', remote ? 'true' : 'false');
      set('voice_privacy_pii_masking_v1', pii ? 'true' : 'false');
      set('VITE_VOICE_FUZZY', fuzzy ? 'on' : 'off');
      set('VITE_VOICE_FUZZY_THRESHOLD', th);
      set('VITE_VOICE_FUZZY_STRICT_SCORE', strict);
      set('VITE_VOICE_FUZZY_CONTEXT_SCORE', ctx);
  set('voice_recognition_lang', recLang);
      set('voice_debug_overlay', debugOverlay ? 'on' : 'off');
      set('voice_autorestart', autoRestart ? 'on' : 'off');
      set('voice_min_confidence', minConf);
      set('voice_push_to_talk', pushToTalk ? 'on' : 'off');
      set('voice_tts_gate', ttsGate ? 'on' : 'off');
      alert('Ses ayarları kaydedildi. Değişiklikler bir sonraki ses oturumunda geçerli olacaktır.');
    };

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ses ve Gizlilik</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">KVKK Onayı</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ses verilerinin işlenmesi için açık rıza</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input aria-label="KVKK onayı" type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:w-5 after:h-5 after:bg-white after:rounded-full after:top-[2px] after:left-[2px] after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Uzak Kayıt</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ses geçmişini sunucuya kaydet</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input aria-label="Uzak kayıt" type="checkbox" checked={remote} onChange={e => setRemote(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:w-5 after:h-5 after:bg-white after:rounded-full after:top-[2px] after:left-[2px] after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Kişisel Veri Maskeleme</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">E-posta, telefon, TCKN gibi verileri maskele</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input aria-label="Kişisel veri maskeleme" type="checkbox" checked={pii} onChange={e => setPii(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:w-5 after:h-5 after:bg-white after:rounded-full after:top-[2px] after:left-[2px] after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tanıma Kontrolleri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Hata Sonrası Otomatik Başlat</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Hata olduğunda dinlemeyi otomatik başlat</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input aria-label="Otomatik başlat" type="checkbox" checked={autoRestart} onChange={e => setAutoRestart(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:w-5 after:h-5 after:bg-white after:rounded-full after:top-[2px] after:left-[2px] after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
            <div>
              <label htmlFor="voice-min-conf" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Asgari Güven (0-1)</label>
              <input id="voice-min-conf" aria-label="Asgari güven" type="number" min="0" max="1" step="0.01" value={minConf} onChange={e => setMinConf(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Bu değerin altında ise komut üretme (debug için)</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Bas Konuş (Space)</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Boşluk tuşu basılıyken dinle</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input aria-label="Bas konuş" type="checkbox" checked={pushToTalk} onChange={e => setPushToTalk(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:w-5 after:h-5 after:bg-white after:rounded-full after:top-[2px] after:left-[2px] after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bulanık Eşleşme</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="voice-rec-lang" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ses Tanıma Dili</label>
              <select id="voice-rec-lang" value={recLang} onChange={e => setRecLang(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="tr-TR">Türkçe (tr-TR)</option>
                <option value="en-US">English (en-US)</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tarayıcıdaki tanıma motoru bu dili kullanır.</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Fuzzy Motoru</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Hatalı telaffuzlarda tolerans</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input aria-label="Bulanık eşleşme" type="checkbox" checked={fuzzy} onChange={e => setFuzzy(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:w-5 after:h-5 after:bg-white after:rounded-full after:top-[2px] after:left-[2px] after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="voice-fuzzy-th" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Eşik</label>
              <input id="voice-fuzzy-th" aria-label="Fuzzy eşik" type="number" min="0" max="1" step="0.01" value={th} onChange={e => setTh(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label htmlFor="voice-fuzzy-strict" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Katı Eşik</label>
              <input id="voice-fuzzy-strict" aria-label="Katı eşik" type="number" min="0" max="1" step="0.01" value={strict} onChange={e => setStrict(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label htmlFor="voice-fuzzy-ctx" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kontekst Eşiği</label>
              <input id="voice-fuzzy-ctx" aria-label="Kontekst eşiği" type="number" min="0" max="1" step="0.01" value={ctx} onChange={e => setCtx(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
          </div>

          <div className="pt-2">
            <button onClick={saveAll} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"><Save className="w-4 h-4" /> Kaydet</button>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700"></div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Debug Overlay</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ekranın sol alt köşesinde canlı log</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input aria-label="Debug overlay" type="checkbox" checked={debugOverlay} onChange={e => setDebugOverlay(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:w-5 after:h-5 after:bg-white after:rounded-full after:top-[2px] after:left-[2px] after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">TTS Sırasında Dinlemeyi Duraklat</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sistem konuşurken yeni komutları beklet</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input aria-label="TTS esnasında beklet" type="checkbox" checked={ttsGate} onChange={e => setTtsGate(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:w-5 after:h-5 after:bg-white after:rounded-full after:top-[2px] after:left-[2px] after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>
        </div>
      </div>
    );
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
          <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ad Soyad
          </label>
          <input id="profile-name" aria-label="Ad soyad"
            type="text"
            value={settings.name}
            onChange={(e) => handleSettingChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            E-posta
          </label>
          <input id="profile-email" aria-label="E-posta"
            type="email"
            value={settings.email}
            onChange={(e) => handleSettingChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Telefon
          </label>
          <input id="profile-phone" aria-label="Telefon"
            type="tel"
            value={settings.phone}
            onChange={(e) => handleSettingChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="profile-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Unvan
          </label>
          <input id="profile-title" aria-label="Unvan"
            type="text"
            value={settings.title}
            onChange={(e) => handleSettingChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="profile-company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Şirket
          </label>
          <input id="profile-company" aria-label="Şirket"
            type="text"
            value={settings.company}
            onChange={(e) => handleSettingChange('company', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="profile-bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Biyografi
          </label>
          <textarea id="profile-bio" aria-label="Biyografi"
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
              <input aria-label="E-posta bildirimleri"
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
              <input aria-label="SMS bildirimleri"
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
              <input aria-label="Push bildirimleri"
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
              <input aria-label="Dava güncellemeleri"
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
              <input aria-label="Randevu hatırlatmaları"
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
              <input aria-label="Mevcut şifre"
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
              <input aria-label="Yeni şifre"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Yeni şifre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Şifre Tekrar
              </label>
              <input aria-label="Şifre tekrar"
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
              <input aria-label="İki faktörlü doğrulama"
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
              <input aria-label="Giriş uyarıları"
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
              <label htmlFor="security-session-timeout" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Oturum Zaman Aşımı (dakika)
              </label>
              <select id="security-session-timeout"
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
              <label htmlFor="appearance-theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tema
              </label>
              <select id="appearance-theme"
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
              <label htmlFor="appearance-language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dil
              </label>
              <select id="appearance-language"
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
                <label htmlFor="appearance-date-format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tarih Formatı
                </label>
                <select id="appearance-date-format"
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
                <label htmlFor="appearance-time-format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Saat Formatı
                </label>
                <select id="appearance-time-format"
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
              <input aria-label="Otomatik yedekleme"
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
              <label htmlFor="system-data-retention" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Veri Saklama Süresi (ay)
              </label>
              <select id="system-data-retention"
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
              <input aria-label="API erişimi"
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
      case 'voice':
        return <VoiceSettingsTab />;
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white p-8 rounded-xl backdrop-blur-xl shadow-2xl border border-white/20">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <SettingsIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Ayarlar</h1>
            <p className="text-blue-100">Hesap ve sistem ayarlarınızı yönetin</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 backdrop-blur-xl p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-50/70 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-lg backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:backdrop-blur-sm'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 backdrop-blur-xl p-6">
            {renderTabContent()}
            
            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end gap-3">
                <button className="px-6 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}