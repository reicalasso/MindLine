import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeSelector from '../components/ThemeSelector';
import { 
  Settings as SettingsIcon, 
  Palette, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Monitor,
  Smartphone,
  Save,
  RotateCcw
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
  privacy: {
    profileVisible: boolean;
    activityVisible: boolean;
  };
  preferences: {
    language: string;
    dateFormat: string;
    theme: string;
  };
}

const defaultSettings: UserSettings = {
  notifications: {
    email: true,
    push: true,
    reminders: true,
  },
  privacy: {
    profileVisible: true,
    activityVisible: true,
  },
  preferences: {
    language: 'tr',
    dateFormat: 'DD/MM/YYYY',
    theme: 'cat',
  },
};

export default function Settings() {
  const { currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('theme');

  useEffect(() => {
    fetchSettings();
  }, [currentUser]);

  const fetchSettings = async () => {
    if (!currentUser) return;
    
    try {
      const settingsDoc = await getDoc(doc(db, 'userSettings', currentUser.uid));
      if (settingsDoc.exists()) {
        setSettings({ ...defaultSettings, ...settingsDoc.data() });
      }
    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    try {
      await setDoc(doc(db, 'userSettings', currentUser.uid), settings, { merge: true });
      toast.success('Ayarlar kaydedildi! ⚙️');
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
      toast.error('Ayarlar kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    if (window.confirm('Tüm ayarları varsayılana döndürmek istediğinizden emin misiniz?')) {
      setSettings(defaultSettings);
      toast.success('Ayarlar sıfırlandı');
    }
  };

  const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'theme', label: 'Tema', icon: Palette, emoji: '🎨' },
    { id: 'notifications', label: 'Bildirimler', icon: Bell, emoji: '🔔' },
    { id: 'privacy', label: 'Gizlilik', icon: Shield, emoji: '🔒' },
    { id: 'preferences', label: 'Tercihler', icon: Globe, emoji: '🌍' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-romantic-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Başlık */}
      <div className="text-center">
        <h1 className="text-4xl font-romantic text-gray-800 mb-2 flex items-center justify-center">
          <SettingsIcon className="w-8 h-8 mr-3" />
          Ayarlar
        </h1>
        <p className="text-lg text-gray-700 font-elegant">
          Uygulamanızı kişiselleştirin...
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Tab Navigation */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-romantic-200 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-love-gradient text-white shadow-lg'
                    : 'text-gray-600 hover:bg-romantic-50 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:block font-medium">{tab.label}</span>
                <span className="text-lg">{tab.emoji}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-romantic-200">
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Palette className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-romantic text-gray-800">Tema Ayarları</h2>
              </div>
              
              {/* Tema Bilgisi */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{currentTheme.emoji}</span>
                  <div>
                    <h3 className="font-medium text-purple-800">{currentTheme.name}</h3>
                    <p className="text-sm text-purple-600">{currentTheme.description}</p>
                  </div>
                </div>
              </div>

              {/* Tema Seçici */}
              <ThemeSelector variant="grid" showLabel={false} />
              
              {/* Tema Önizleme */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Önizleme</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: currentTheme.colors.surface,
                      borderColor: currentTheme.colors.border,
                      color: currentTheme.colors.text
                    }}
                  >
                    <h4 className="font-medium mb-2">Örnek Kart</h4>
                    <p className="text-sm opacity-80">Bu bir örnek metin</p>
                  </div>
                  <div 
                    className="p-4 rounded-lg"
                    style={{ 
                      background: currentTheme.colors.primaryGradient,
                      color: 'white'
                    }}
                  >
                    <h4 className="font-medium mb-2">Örnek Buton</h4>
                    <p className="text-sm opacity-90">Tıklanabilir alan</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Bell className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-romantic text-gray-800">Bildirim Ayarları</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📧</span>
                    <div>
                      <h3 className="font-medium text-gray-800">E-posta Bildirimleri</h3>
                      <p className="text-sm text-gray-600">Yeni mesajlar için e-posta al</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={(e) => updateSettings('notifications', 'email', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🔔</span>
                    <div>
                      <h3 className="font-medium text-gray-800">Push Bildirimleri</h3>
                      <p className="text-sm text-gray-600">Anlık bildirimler</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.push}
                      onChange={(e) => updateSettings('notifications', 'push', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">⏰</span>
                    <div>
                      <h3 className="font-medium text-gray-800">Hatırlatmalar</h3>
                      <p className="text-sm text-gray-600">Özel günler için hatırlatmalar</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.reminders}
                      onChange={(e) => updateSettings('notifications', 'reminders', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-romantic text-gray-800">Gizlilik Ayarları</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">👤</span>
                    <div>
                      <h3 className="font-medium text-gray-800">Profil Görünürlüğü</h3>
                      <p className="text-sm text-gray-600">Profilinizi diğerleri görebilsin</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacy.profileVisible}
                      onChange={(e) => updateSettings('privacy', 'profileVisible', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <h3 className="font-medium text-gray-800">Aktivite Görünürlüğü</h3>
                      <p className="text-sm text-gray-600">Son aktiviteleriniz görünsün</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacy.activityVisible}
                      onChange={(e) => updateSettings('privacy', 'activityVisible', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Globe className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-romantic text-gray-800">Genel Tercihler</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dil
                  </label>
                  <select
                    value={settings.preferences.language}
                    onChange={(e) => updateSettings('preferences', 'language', e.target.value)}
                    className="w-full px-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50"
                  >
                    <option value="tr">🇹🇷 Türkçe</option>
                    <option value="en">🇺🇸 English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarih Formatı
                  </label>
                  <select
                    value={settings.preferences.dateFormat}
                    onChange={(e) => updateSettings('preferences', 'dateFormat', e.target.value)}
                    className="w-full px-4 py-2 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              {/* Cihaz Bilgileri */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <Monitor className="w-5 h-5 mr-2" />
                  Cihaz Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4" />
                    <span>Tarayıcı: {navigator.userAgent.split(' ').pop()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-4 h-4" />
                    <span>Çözünürlük: {window.screen.width}x{window.screen.height}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              onClick={resetSettings}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Sıfırla</span>
            </button>
            
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-love-gradient text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
