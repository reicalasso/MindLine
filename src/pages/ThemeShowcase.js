import { useTheme } from '../contexts/ThemeContext';
import { useThemeStyles, useThemeColors, useThemeAnimations } from '../hooks/useThemeStyles';
import ThemeSelector from '../components/ThemeSelector';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Palette, Heart, Star, Moon, Sun, Zap } from 'lucide-react';

export default function ThemeShowcase() {
  const { currentTheme, toggleTheme } = useTheme();
  const styles = useThemeStyles();
  const colors = useThemeColors();
  const animations = useThemeAnimations();

  const handleQuickToggle = () => {
    toggleTheme();
  };

  return (
    <div 
      className="min-h-screen p-8"
      style={{ background: colors.backgroundGradient }}
    >
      <div className={styles.container.className}>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 
              className="text-4xl font-bold mb-4"
              style={{ 
                color: colors.text,
                fontFamily: currentTheme.typography.fontFamilyHeading 
              }}
            >
              🎨 Tema Sistemi Vitrini
            </h1>
            <p 
              className="text-lg mb-6"
              style={{ color: colors.textSecondary }}
            >
              Yeni tema sistemimizdeki tüm özellikleri keşfedin
            </p>
            
            <div className="flex justify-center space-x-4 mb-8">
              <Button 
                onClick={handleQuickToggle}
                className={`flex items-center space-x-2 ${
                  currentTheme.id === 'skull-bunny' 
                    ? 'bg-skull-bunny-primary-gradient text-skull-bunny-parchment hover:shadow-skull-bunny-glow' 
                    : ''
                }`}
                style={{
                  background: currentTheme.id !== 'skull-bunny' ? colors.primaryGradient : undefined,
                  color: currentTheme.id !== 'skull-bunny' ? 'white' : undefined,
                }}
              >
                <Palette className="w-5 h-5" />
                <span>Tema Değiştir</span>
              </Button>
            </div>
          </div>

          {/* Theme Selector Variants */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <Card 
              className="p-6"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
                Dropdown Seçici
              </h3>
              <ThemeSelector variant="dropdown" />
            </Card>

            <Card 
              className="p-6"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
                Tab Seçici
              </h3>
              <ThemeSelector variant="tabs" />
            </Card>

            <Card 
              className="p-6"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
                Mevcut Tema
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{currentTheme.emoji}</span>
                  <div>
                    <div className="font-medium" style={{ color: colors.text }}>
                      {currentTheme.name}
                    </div>
                    <div className="text-sm" style={{ color: colors.textSecondary }}>
                      {currentTheme.description}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: colors.primary }}
                    title="Ana Renk"
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: colors.secondary }}
                    title="İkincil Renk"
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: colors.accent }}
                    title="Vurgu Rengi"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Grid Theme Selector */}
          <Card 
            className="p-6"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <ThemeSelector variant="grid" />
          </Card>

          {/* Color Palette Display */}
          <Card 
            className="p-6"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <h3 className="text-lg font-semibold mb-6" style={{ color: colors.text }}>
              Renk Paleti
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(colors).map(([name, color]) => {
                if (name.includes('Gradient')) return null;
                return (
                  <div key={name} className="text-center space-y-2">
                    <div 
                      className="w-16 h-16 mx-auto rounded-lg border-2 border-white shadow-md"
                      style={{ backgroundColor: color }}
                    />
                    <div>
                      <div className="text-sm font-medium" style={{ color: colors.text }}>
                        {name}
                      </div>
                      <div className="text-xs font-mono" style={{ color: colors.textMuted }}>
                        {color}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Components Demo */}
          <Card 
            className="p-6"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <h3 className="text-lg font-semibold mb-6" style={{ color: colors.text }}>
              Bileşen Önizlemeleri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Buttons */}
              <div className="space-y-3">
                <h4 className="font-medium" style={{ color: colors.text }}>Butonlar</h4>
                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    style={{
                      background: colors.primaryGradient,
                      color: 'white',
                    }}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Ana Buton
                  </Button>
                  <Button 
                    variant="secondary"
                    className="w-full"
                    style={{
                      backgroundColor: colors.secondary,
                      color: 'white',
                    }}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    İkincil Buton
                  </Button>
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-3">
                <h4 className="font-medium" style={{ color: colors.text }}>Giriş Alanları</h4>
                <div className="space-y-2">
                  <Input 
                    placeholder="Metin girin..."
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                    }}
                  />
                  <Input 
                    type="email"
                    placeholder="E-posta adresi"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                    }}
                  />
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                <h4 className="font-medium" style={{ color: colors.text }}>Kartlar</h4>
                <div className="space-y-2">
                  <Card 
                    className="p-4"
                    style={{
                      backgroundColor: colors.surfaceVariant,
                      borderColor: colors.borderLight,
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <Moon className="w-5 h-5" style={{ color: colors.primary }} />
                      <span style={{ color: colors.text }}>Varyant Kart</span>
                    </div>
                  </Card>
                  <Card 
                    className="p-4"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <Sun className="w-5 h-5" style={{ color: colors.accent }} />
                      <span style={{ color: colors.text }}>Normal Kart</span>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </Card>

          {/* Animation Examples */}
          {currentTheme.animations.custom && (
            <Card 
              className="p-6"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <h3 className="text-lg font-semibold mb-6" style={{ color: colors.text }}>
                Özel Animasyonlar
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(currentTheme.animations.custom).map(([name, animation]) => (
                  <div key={name} className="text-center space-y-2">
                    <div 
                      className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center text-2xl"
                      style={{ 
                        backgroundColor: colors.primary,
                        animation: animation,
                      }}
                    >
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-sm" style={{ color: colors.text }}>
                      {name}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Typography Examples */}
          <Card 
            className="p-6"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <h3 className="text-lg font-semibold mb-6" style={{ color: colors.text }}>
              Tipografi
            </h3>
            <div className="space-y-4">
              <div>
                <h1 
                  className="text-4xl font-bold"
                  style={{ 
                    color: colors.text,
                    fontFamily: currentTheme.typography.fontFamilyHeading 
                  }}
                >
                  Ana Başlık (Heading Font)
                </h1>
              </div>
              <div>
                <p 
                  className="text-lg"
                  style={{ 
                    color: colors.text,
                    fontFamily: currentTheme.typography.fontFamily 
                  }}
                >
                  Bu normal metin örneğidir. (Base Font)
                </p>
              </div>
              <div>
                <code 
                  className="text-sm bg-gray-100 px-2 py-1 rounded"
                  style={{ 
                    color: colors.text,
                    fontFamily: currentTheme.typography.fontFamilyMono,
                    backgroundColor: colors.surfaceVariant,
                  }}
                >
                  console.log('Monospace font örneği');
                </code>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
