import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    if (password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Hoş geldin kedici! 😺💕');
      } else {
        await signup(email, password);
        toast.success('Kedili dünyaya hoş geldin! 🐾💖');
      }
      navigate('/');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        toast.error('Bu email adresi ile kayıtlı kullanıcı bulunamadı');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Hatalı şifre');
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error('Bu email adresi zaten kullanımda');
      } else {
        toast.error(error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cat-gradient px-4 py-6 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Arka plan süslemeleri */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-4xl sm:text-6xl opacity-10 animate-float">😺</div>
        <div className="absolute top-20 right-16 text-3xl sm:text-5xl opacity-10 animate-wiggle">🐾</div>
        <div className="absolute bottom-20 left-16 text-3xl sm:text-5xl opacity-10 animate-purr">💕</div>
        <div className="absolute bottom-32 right-10 text-4xl sm:text-6xl opacity-10 animate-float" style={{animationDelay: '1s'}}>🐱</div>
        <div className="absolute top-1/2 left-4 text-2xl sm:text-4xl opacity-10 animate-wiggle" style={{animationDelay: '2s'}}>💖</div>
        <div className="absolute top-1/3 right-4 text-2xl sm:text-4xl opacity-10 animate-purr" style={{animationDelay: '0.5s'}}>😻</div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="cat-card p-6 sm:p-8 lg:p-10 border-2 border-cat-300/30">
          {/* Logo ve başlık */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="relative">
                <span className="text-6xl sm:text-7xl lg:text-8xl animate-bounce-cat">😺</span>
                <span className="absolute -top-2 -right-2 text-2xl sm:text-3xl animate-wiggle">💕</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-cat text-cat-700 mb-2 sm:mb-4">
              MindLine
            </h1>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-sm sm:text-base text-cat-500 font-elegant">Kedili Aşk Dünyası</span>
              <span className="animate-wiggle">🐾</span>
            </div>
            <p className="text-cat-600 font-elegant text-sm sm:text-base lg:text-lg">
              Sadece ikimizin özel kedili alanı
              <span className="inline-block animate-purr ml-2">💖</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Email input */}
            <div>
              <label className="block text-sm font-medium text-cat-700 mb-2 font-elegant">
                🐱 E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cat-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="cat-input w-full pl-10 pr-4 py-3 sm:py-4 font-elegant text-sm sm:text-base"
                  placeholder="kedici@example.com"
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-sm font-medium text-cat-700 mb-2 font-elegant">
                🔐 Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cat-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cat-input w-full pl-10 pr-12 py-3 sm:py-4 font-elegant text-sm sm:text-base"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cat-400 hover:text-cat-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full love-button py-3 sm:py-4 text-base sm:text-lg font-cat disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Kediler koşuyor...</span>
                  <span className="animate-bounce">🐾</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>{isLogin ? 'Kedili Dünyaya Gir' : 'Kedici Ol'}</span>
                  <span className="animate-wiggle">{isLogin ? '🚪' : '🐱'}</span>
                </div>
              )}
            </button>
          </form>

          {/* Toggle form type */}
          <div className="mt-6 sm:mt-8 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-cat-600 hover:text-cat-700 text-sm sm:text-base font-elegant transition-colors paw-trail"
            >
              {isLogin ? (
                <span>Kedili dünyaya katıl 🐾</span>
              ) : (
                <span>Zaten kedici misin? Giriş yap 😺</span>
              )}
            </button>
          </div>

          {/* Security note */}
          <div className="mt-6 sm:mt-8 text-center bg-cat-50 rounded-xl p-3 sm:p-4 border border-cat-200/50">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-lg">🔒</span>
              <span className="text-xs sm:text-sm text-cat-600 font-elegant font-medium">
                Güvenli Kedili Alan
              </span>
            </div>
            <p className="text-xs text-cat-500 font-elegant">
              Bu uygulama sadece özel kullanım içindir
              <span className="animate-wiggle inline-block ml-1">🐾</span>
            </p>
          </div>
        </div>

        {/* Footer cute message */}
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-cat-600 font-elegant text-xs sm:text-sm">
            <span className="animate-float inline-block mr-1">😻</span>
            Kedilerle dolu aşk dolu anılar seni bekliyor
            <span className="animate-float inline-block ml-1">💕</span>
          </p>
        </div>
      </div>
    </div>
  );
}
