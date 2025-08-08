# 🐱💕 MindLine - Kedili Aşk Dünyası

MindLine, sevgili çiftler için özel tasarlanmış, kedili temalı bir ilişki ve anı paylaşım uygulamasıdır. Bu uygulama, çiftlerin birlikte anılar oluşturmasına, planlar yapmasına ve iletişim kurmasına yardımcı olur.

## ✨ Özellikler

### 💌 Ana Özellikler
- **Aşk Mektupları**: Sevgilinize özel mektuplar yazın ve saklayın
- **Gerçek Zamanlı Sohbet**: Anlık mesajlaşma ve dosya paylaşımı
- **Anı Galerisi**: Özel fotoğraflarınızı organize edin ve paylaşın
- **Film & Müzik**: Birlikte izlemek istediğiniz filmler ve müzikler listeleyin
- **Yapılacaklar**: Birlikte planladığınız görevleri yönetin
- **Özel Günler**: Önemli tarihleri takip edin ve hatırlatmalar alın

### 🚀 Teknik Özellikler
- **TypeScript**: Tam tip güvenliği
- **React 18**: Modern React özellikleri
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görün��m
- **Progressive Web App**: Mobil uygulama benzeri deneyim
- **Offline Desteği**: İnternet bağlantısı olmadan çalışma
- **Accessibility**: WCAG 2.1 AA standartlarına uygun
- **Performance**: Optimized bundle size ve lazy loading

## 🛠️ Teknolojiler

### Frontend
- **React 18** - UI framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Form yönetimi
- **React Hot Toast** - Bildirimler
- **Lucide React** - Icon library
- **Date-fns** - Tarih işlemleri

### Backend & Veritabanı
- **Firebase Authentication** - Kullanıcı kimlik doğrulama
- **Cloud Firestore** - NoSQL veritabanı
- **Firebase Storage** - Dosya depolama
- **Firebase Hosting** - Hosting

### Development & Testing
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Web Vitals** - Performance monitoring

## 📁 Proje Yapısı

```
src/
├── components/          # Yeniden kullanılabilir bileşenler
│   ├── ui/             # UI bileşenleri (Button, Input, Card, Modal)
│   ├── ErrorBoundary.tsx
│   ├── Navbar.tsx
│   ├── ParticleEffect.tsx
│   └── ProtectedRoute.js
├── contexts/           # React context'leri
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
│   └── index.ts
├── pages/              # Sayfa bileşenleri
│   ├── Dashboard.js
│   ├── Login.js
│   ├── Letters.js
│   ├── Chat.js
│   ├── Movies.js
│   ├── Music.js
│   ├── Calendar.js
│   ├── Gallery.js
│   ├── Todos.js
│   ├── Profile.js
│   └── ThemeShowcase.js
├── types/              # TypeScript tip tanımları
│   └── index.ts
├── utils/              # Utility fonksiyonları
│   ├── index.ts
│   ├── accessibility.ts
│   └── __tests__/
├── App.tsx             # Ana uygulama bileşeni
├── index.tsx           # Uygulama giriş noktası
├── index.css           # Global stiller
└── firebase.js         # Firebase yapılandırması
```

## 🚀 Kurulum

### Gereksinimler
- Node.js 16+
- npm veya yarn
- Firebase projesi

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd mindline
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Firebase yapılandırması**
   - Firebase Console'da yeni proje oluşturun
   - Authentication, Firestore ve Storage'ı etkinleştirin
   - `src/firebase.js` dosyasında Firebase config'i güncelleyin
   - `ALLOWED_EMAILS` listesine izinli email adreslerini ekleyin

4. **Uygulamayı başlatın**
```bash
npm start
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## 📱 Kullanım

### İlk Kurulum
1. İzinli email adresi ile kayıt olun
2. Profil bilgilerinizi tamamlayın
3. Partnerinizi davet edin

### Özellik Kullanımı
- **Mektuplar**: Sol menüden "Mektuplar" seçin ve yeni mektup oluşturun
- **Sohbet**: Gerçek zamanlı mesajlaşma için "Sohbet" bölümünü kullanın
- **Galeri**: Fotoğraflarınızı yüklemek için "Galeri" bölümüne gidin
- **Filmler**: İzlenecek film listesi oluşturmak için "Filmler" bölümünü kullanın

## 🧪 Test

### Test çalıştırma
```bash
# Tüm testleri çalıştır
npm test

# Coverage raporu ile
npm run test:coverage

# CI ortamında
npm run test:ci
```

### Test türleri
- **Unit Tests**: Utility fonksiyonları ve hooks
- **Component Tests**: UI bileşenleri
- **Integration Tests**: Sayfa bileşenleri
- **Accessibility Tests**: A11y kontrolü

## 🔧 Development

### Code Quality
```bash
# TypeScript kontrol
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check
```

### Build & Deploy
```bash
# Production build
npm run build

# Bundle analizi
npm run bundle-analyzer

# Performance analizi
npm run lighthouse
```

## ♿ Accessibility

Bu proje WCAG 2.1 AA standartlarını destekler:
- Klavye navigasyonu
- Screen reader desteği
- Yüksek kontrast modu
- Azaltılmış hareket tercihi
- Focus yönetimi
- ARIA özellikleri

## 🎨 Tema ve Stil

### Renk Paleti
- **Cat Theme**: Turuncu tonları (#f59133)
- **Paw Theme**: Pembe tonları (#ec4899)
- **Romantic Theme**: Kırmızı tonları (#ef4444)
- **Magic Theme**: Mor tonları (#a855f7)

### Tipografi
- **Primary**: Montserrat (Elegant)
- **Headings**: Indie Flower (Cat)
- **Decorative**: Dancing Script, Caveat (Romantic)

## 📈 Performance

### Optimizasyonlar
- **Lazy Loading**: Sayfa bileşenleri
- **Code Splitting**: Route bazlı bölme
- **Image Optimization**: WebP desteği
- **Bundle Size**: Gzipped < 500KB
- **Caching**: Service Worker
- **Memory Management**: Component memoization

### Metrikleri
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **TTFB**: < 600ms

## 🔒 Güvenlik

### Güvenlik Önlemleri
- Firebase Security Rules
- Email whitelist sistemi
- Input validation
- XSS koruması
- CSRF koruması
- Secure headers

### Gizlilik
- Sadece izinli kullanıcılar
- End-to-end şifreleme (planlanıyor)
- Veri minimizasyonu
- GDPR uyumluluğu

## 🐛 Bilinen Sorunlar

- [ ] Safari'de bazı animasyon sorunları
- [ ] iOS Safari'de viewport height sorunu
- [ ] Eski Android tarayıcılarda performance

## 🚧 Roadmap

### v2.0.0 (Gelecek)
- [ ] Push bildirimleri
- [ ] Video mesajlaşma
- [ ] Tema özelleştirme
- [ ] Çoklu dil desteği
- [ ] Dark mode

### v2.1.0
- [ ] Backup/restore özelliği
- [ ] Export işlemleri
- [ ] Gelişmiş arama
- [ ] Widget'lar

## 🤝 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit'leyin (`git commit -m 'Add amazing feature'`)
4. Push'layın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

### Geliştirme Kuralları
- TypeScript kullanın
- Test yazın
- ESLint kurallarına uyun
- Commit mesajlarında conventional commits kullanın
- Accessibility'yi göz önünde bulundurun

## 📄 Lisans

Bu proje özel kullanım içindir. Ticari kullanım yasaktır.

## 📞 İletişim

Sorularınız için issue açabilir veya email gönderebilirsiniz.

---

Made with 💕 by [Your Name] for all the cat-loving couples out there! 🐱💖
