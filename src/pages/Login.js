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
        toast.success('Hoş geldin! 💕');
      } else {
        await signup(email, password);
        toast.success('Hesap oluşturuldu! 💕');
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
    <div className="min-h-screen flex items-center justify-center bg-romantic-gradient px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-romantic-200">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Heart className="w-16 h-16 text-romantic-500 heartbeat" />
            </div>
            <h1 className="text-4xl font-romantic text-romantic-700 mb-2">MindLine</h1>
            <p className="text-romantic-600 font-elegant text-lg">
              Sadece ikimizin özel alanı 💕
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-romantic-700 mb-2">
                E-posta
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-romantic-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50 transition-all"
                  placeholder="ornek@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-romantic-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-romantic-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-romantic-200 rounded-lg focus:ring-2 focus:ring-romantic-500 focus:border-transparent bg-white/50 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-romantic-400 hover:text-romantic-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-love-gradient text-white py-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Yükleniyor...
                </div>
              ) : (
                isLogin ? 'Giriş Yap' : 'Hesap Oluştur'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-romantic-600 hover:text-romantic-700 text-sm font-medium transition-colors"
            >
              {isLogin ? 'Hesap oluştur' : 'Zaten hesabım var'}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-romantic-500">
              Bu uygulama sadece özel kullanım içindir 🔒
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
