import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    if (password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalı');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Giriş başarılı! 😺');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        toast.error('Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Hatalı şifre');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Geçersiz e-posta adresi');
      } else {
        toast.error('Giriş yapılamadı: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${currentTheme.styles.backgroundClass} relative overflow-hidden`}>
      {/* Background Decorations */}
      <div className="background-decorations">
        <div className="absolute top-10 left-10 text-4xl sm:text-6xl opacity-20 animate-float text-cat-500">😺</div>
        <div className="absolute top-20 right-16 text-3xl sm:text-5xl opacity-20 animate-wiggle text-cat-600">💕</div>
        <div className="absolute bottom-20 left-16 text-3xl sm:text-5xl opacity-20 animate-purr text-cat-500">🐾</div>
        <div className="absolute bottom-32 right-10 text-4xl sm:text-6xl opacity-20 animate-sparkle text-cat-600" style={{animationDelay: '1s'}}>💖</div>
      </div>

      <div className="floating-particles"></div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Login Form Container */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className={`w-full max-w-md ${currentTheme.styles.cardClass} p-6 sm:p-8 backdrop-blur-xl border border-white/20 relative overflow-hidden`}>
            
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 z-20">
              <ThemeToggle variant="button" showLabel={false} />
            </div>

            {/* Logo ve başlık */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="relative">
                  <span className={`text-6xl sm:text-7xl lg:text-8xl animate-bounce-cat ${currentTheme.styles.textClass}`}>
                    😺
                  </span>
                  <span className="absolute -top-2 -right-2 text-2xl sm:text-3xl animate-wiggle">
                    💕
                  </span>
                </div>
              </div>
              
              <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-cat ${currentTheme.styles.textClass} mb-2 sm:mb-4`}>
                MindLine
              </h1>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-sm sm:text-base font-elegant" style={{ color: currentTheme.colors.textSecondary }}>
                  Kedili Aşk Dünyası
                </span>
                <span className="animate-wiggle">🐾</span>
              </div>
            </div>
            
            <p className="font-elegant text-sm sm:text-base lg:text-lg" style={{ color: currentTheme.colors.textSecondary }}>
              Sadece ikimizin özel kedili alanı
              <span className="inline-block ml-2 animate-purr">
                💖
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Email input */}
            <div>
              <label className={`block text-sm font-medium mb-2 font-elegant ${currentTheme.styles.textClass}`}>
                🐱 E-posta Adresi
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full ${currentTheme.styles.inputClass} pl-4 pr-12 placeholder:text-gray-400 font-elegant`}
                  placeholder="kedi@sevgili.com"
                  required
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text
                  }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-lg animate-wiggle">💌</span>
                </div>
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className={`block text-sm font-medium mb-2 font-elegant ${currentTheme.styles.textClass}`}>
                🔐 Şifre
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full ${currentTheme.styles.inputClass} pl-4 pr-12 placeholder:text-gray-400 font-elegant`}
                  placeholder="Gizli kedili şifren"
                  required
                  minLength={6}
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text
                  }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-lg animate-sparkle">🔑</span>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${currentTheme.styles.buttonClass} py-3 sm:py-4 font-elegant font-semibold text-base sm:text-lg relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300`}
              style={{
                backgroundColor: loading ? currentTheme.colors.secondary + '80' : currentTheme.colors.primary,
                color: currentTheme.colors.text,
                borderColor: currentTheme.colors.border
              }}
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                {loading ? (
                  <>
                    <div className="spinner w-5 h-5"></div>
                    <span>Giriş yapılıyor...</span>
                  </>
                ) : (
                  <>
                    <span>Kedili Alana Gir</span>
                    <span className="text-xl group-hover:animate-bounce-love">💖</span>
                  </>
                )}
              </span>
            </button>

            {/* Additional info */}
            <div className="text-center pt-4">
              <p className="text-xs sm:text-sm font-elegant" style={{ color: currentTheme.colors.textSecondary }}>
                Henüz hesabın yok mu? Sadece ikimiz için tasarlandı 
                <span className="inline-block ml-1 animate-heartbeat">😻</span>
              </p>
              
              <div className="mt-4 pt-4 border-t border-current/10">
                <p className="text-xs font-elegant opacity-70" style={{ color: currentTheme.colors.textSecondary }}>
                  Bu özel alan sadece bizim için ❤️
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
