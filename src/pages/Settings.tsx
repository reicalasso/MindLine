import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useThemeColors } from '../hooks/useThemeStyles';
import ThemeSelector from '../components/ThemeSelector';
import { 
  Settings as SettingsIcon, 
  Palette, 
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
  const colors = useThemeColors();
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
      <div 
        className="flex items-center justify-center min-h-[400px]"
        style={{ 
          backgroundColor: colors.background,
          backgroundImage: colors.backgroundGradient 
        }}
      >
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: colors.primary }}
        ></div>
      </div>
    );
  }

  return (
    <div 
      className="space-y-8"
      style={{ 
        backgroundColor: colors.background,
        backgroundImage: colors.backgroundGradient,
        minHeight: '100vh',
        padding: '2rem 1rem'
      }}
    >
      {/* Başlık */}
      <div className="text-center">
        <h1 
          className={`text-4xl mb-2 flex items-center justify-center ${
            currentTheme.id === 'cat' ? 'font-romantic' : 'font-elegant'
          }`}
          style={{
            color: colors.text,
            fontFamily: currentTheme.typography.fontFamilyHeading
          }}
        >
          <SettingsIcon className="w-8 h-8 mr-3" />
          {currentTheme.id === 'skull-bunny' ? 'Dark Settings' : 'Ayarlar'}
        </h1>
        <p 
          className="text-lg"
          style={{
            color: colors.textSecondary,
            fontFamily: currentTheme.typography.fontFamily
          }}
        >
          {currentTheme.id === 'skull-bunny' ? 'Configure your dark preferences...' :
           currentTheme.id === 'ocean' ? 'Okyanus kadar derin ayarlarınızı yapılandırın...' :
           currentTheme.id === 'cat' ? 'Uygulamanızı kişiselleştirin...' :
           'Ayarlarınızı düzenleyin...'}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Tab Navigation */}
        <div 
          className="backdrop-blur-sm rounded-xl p-2 shadow-lg border mb-8"
          style={{
            backgroundColor: colors.surface + '90',
            borderColor: colors.border
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                  currentTheme.id === 'ocean' ? 'hover:animate-ripple' : 
                  currentTheme.id === 'cat' ? 'hover:animate-wiggle' : ''
                }`}
                style={{
                  backgroundColor: activeTab === tab.id ? colors.primary : 'transparent',
                  color: activeTab === tab.id ? 'white' : colors.textSecondary,
                  fontFamily: currentTheme.typography.fontFamily
                }}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:block font-medium">{tab.label}</span>
                <span className="text-lg">{tab.emoji}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div 
          className="backdrop-blur-sm rounded-xl p-6 shadow-lg border"
          style={{
            backgroundColor: colors.surface + '90',
            borderColor: colors.border
          }}
        >
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Palette 
                  className="w-6 h-6" 
                  style={{ color: colors.primary }}
                />
                <h2 
                  className={`text-2xl ${
                    currentTheme.id === 'cat' ? 'font-romantic' : 'font-elegant'
                  }`}
                  style={{
                    color: colors.text,
                    fontFamily: currentTheme.typography.fontFamilyHeading
                  }}
                >
                  Tema Ayarları
                </h2>
              </div>
              
              {/* Tema Bilgisi */}
              <div 
                className="rounded-lg p-4 border"
                style={{
                  background: colors.primaryGradient + '20',
                  borderColor: colors.primary + '40'
                }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{currentTheme.emoji}</span>
                  <div>
                    <h3 
                      className="font-medium"
                      style={{
                        color: colors.text,
                        fontFamily: currentTheme.typography.fontFamilyHeading
                      }}
                    >
                      {currentTheme.name}
                    </h3>
                    <p 
                      className="text-sm"
                      style={{
                        color: colors.textSecondary,
                        fontFamily: currentTheme.typography.fontFamily
                      }}
                    >
                      {currentTheme.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tema Seçici */}
              <ThemeSelector variant="grid" showLabel={false} />
              
              {/* Tema Önizleme */}
              <div 
                className="rounded-lg p-4"
                style={{
                  backgroundColor: colors.surfaceVariant,
                  border: `1px solid ${colors.borderLight}`
                }}
              >
                <h3 
                  className="text-lg font-medium mb-4"
                  style={{
                    color: colors.text,
                    fontFamily: currentTheme.typography.fontFamilyHeading
                  }}
                >
                  Önizleme
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text
                    }}
                  >
                    <h4 className="font-medium mb-2">Örnek Kart</h4>
                    <p className="text-sm opacity-80">Bu bir örnek metin</p>
                  </div>
                  <div 
                    className="p-4 rounded-lg"
                    style={{ 
                      background: colors.primaryGradient,
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
                <Bell 
                  className="w-6 h-6" 
                  style={{ color: colors.info }}
                />
                <h2 
                  className={`text-2xl ${
                    currentTheme.id === 'cat' ? 'font-romantic' : 'font-elegant'
                  }`}
                  style={{
                    color: colors.text,
                    fontFamily: currentTheme.typography.fontFamilyHeading
                  }}
                >
                  Bildirim Ayarları
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'email', icon: '📧', title: 'E-posta Bildirimleri', desc: 'Yeni mesajlar için e-posta al', color: colors.info },
                  { key: 'push', icon: '🔔', title: 'Push Bildirimleri', desc: 'Anlık bildirimler', color: colors.success },
                  { key: 'reminders', icon: '⏰', title: 'Hatırlatmalar', desc: 'Özel günler için hatırlatmalar', color: colors.warning }
                ].map((item) => (
                  <div 
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{
                      backgroundColor: item.color + '10',
                      border: `1px solid ${item.color}30`
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h3 
                          className="font-medium"
                          style={{
                            color: colors.text,
                            fontFamily: currentTheme.typography.fontFamily
                          }}
                        >
                          {item.title}
                        </h3>
                        <p 
                          className="text-sm"
                          style={{
                            color: colors.textSecondary,
                            fontFamily: currentTheme.typography.fontFamily
                          }}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                        onChange={(e) => updateSettings('notifications', item.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div 
                        className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                        style={{
                          backgroundColor: settings.notifications[item.key as keyof typeof settings.notifications] ? item.color : colors.border,
                          borderColor: colors.border
                        }}
                      ></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Shield 
                  className="w-6 h-6" 
                  style={{ color: colors.success }}
                />
                <h2 
                  className={`text-2xl ${
                    currentTheme.id === 'cat' ? 'font-romantic' : 'font-elegant'
                  }`}
                  style={{
                    color: colors.text,
                    fontFamily: currentTheme.typography.fontFamilyHeading
                  }}
                >
                  Gizlilik Ayarları
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'profileVisible', icon: '👤', title: 'Profil Görünürlüğü', desc: 'Profilinizi diğerleri görebilsin', color: colors.success },
                  { key: 'activityVisible', icon: '📊', title: 'Aktivite Görünürlüğü', desc: 'Son aktiviteleriniz görünsün', color: colors.info }
                ].map((item) => (
                  <div 
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{
                      backgroundColor: item.color + '10',
                      border: `1px solid ${item.color}30`
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h3 
                          className="font-medium"
                          style={{
                            color: colors.text,
                            fontFamily: currentTheme.typography.fontFamily
                          }}
                        >
                          {item.title}
                        </h3>
                        <p 
                          className="text-sm"
                          style={{
                            color: colors.textSecondary,
                            fontFamily: currentTheme.typography.fontFamily
                          }}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy[item.key as keyof typeof settings.privacy]}
                        onChange={(e) => updateSettings('privacy', item.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div 
                        className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                        style={{
                          backgroundColor: settings.privacy[item.key as keyof typeof settings.privacy] ? item.color : colors.border,
                          borderColor: colors.border
                        }}
                      ></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Globe 
                  className="w-6 h-6" 
                  style={{ color: colors.warning }}
                />
                <h2 
                  className={`text-2xl ${
                    currentTheme.id === 'cat' ? 'font-romantic' : 'font-elegant'
                  }`}
                  style={{
                    color: colors.text,
                    fontFamily: currentTheme.typography.fontFamilyHeading
                  }}
                >
                  Genel Tercihler
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{
                      color: colors.text,
                      fontFamily: currentTheme.typography.fontFamily
                    }}
                  >
                    Dil
                  </label>
                  <select
                    value={settings.preferences.language}
                    onChange={(e) => updateSettings('preferences', 'language', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent backdrop-blur-sm"
                    style={{
                      backgroundColor: colors.surface + '50',
                      borderColor: colors.border,
                      color: colors.text,
                      fontFamily: currentTheme.typography.fontFamily
                    }}
                  >
                    <option value="tr">🇹🇷 Türkçe</option>
                    <option value="en">🇺🇸 English</option>
                  </select>
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{
                      color: colors.text,
                      fontFamily: currentTheme.typography.fontFamily
                    }}
                  >
                    Tarih Formatı
                  </label>
                  <select
                    value={settings.preferences.dateFormat}
                    onChange={(e) => updateSettings('preferences', 'dateFormat', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent backdrop-blur-sm"
                    style={{
                      backgroundColor: colors.surface + '50',
                      borderColor: colors.border,
                      color: colors.text,
                      fontFamily: currentTheme.typography.fontFamily
                    }}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              {/* Cihaz Bilgileri */}
              <div 
                className="rounded-lg p-4"
                style={{
                  backgroundColor: colors.surfaceVariant,
                  border: `1px solid ${colors.borderLight}`
                }}
              >
                <h3 
                  className="text-lg font-medium mb-4 flex items-center"
                  style={{
                    color: colors.text,
                    fontFamily: currentTheme.typography.fontFamilyHeading
                  }}
                >
                  <Monitor className="w-5 h-5 mr-2" />
                  Cihaz Bilgileri
                </h3>
                <div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
                  style={{
                    color: colors.textSecondary,
                    fontFamily: currentTheme.typography.fontFamily
                  }}
                >
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
          <div 
            className="flex justify-between pt-6 border-t"
            style={{ borderColor: colors.border }}
          >
            <button
              onClick={resetSettings}
              className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:shadow-lg transition-colors"
              style={{
                color: colors.textSecondary,
                borderColor: colors.border,
                backgroundColor: colors.surface
              }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Sıfırla</span>
            </button>
            
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              style={{
                background: colors.primaryGradient,
                color: 'white'
              }}
            >
              {saving ? (
                <div 
                  className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent"
                  style={{ borderColor: 'white' }}
                ></div>
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
