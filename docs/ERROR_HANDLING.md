# Hata Yönetimi Dokümantasyonu

Bu doküman, MindLine uygulamasındaki hata yönetimi stratejisini açıklamaktadır.

## Hata Yönetimi İlkeleri

1. **Üretim Ortamında Konsol Mesajları Gizleme**: 
   - `process.env.NODE_ENV !== 'production'` kontrolü ile üretim ortamında hata ayıklama mesajları gösterilmez.
   - Geliştirme ortamında detaylı hata mesajları görüntülenir.

2. **Kullanıcı Dostu Hata Mesajları**:
   - Firebase ve diğer teknik hata mesajları, kullanıcı dostu Türkçe mesajlara dönüştürülür.
   - Hata mesajları için `errorUtils` yardımcı fonksiyonları kullanılır.

3. **Hata İzleme**:
   - İleriki aşamalarda Sentry veya LogRocket gibi bir hata izleme servisi entegre edilebilir.
   - Bu sayede üretim ortamında oluşan hatalar merkezi olarak izlenebilir.

## Kullanım Örnekleri

### Try-Catch Bloklarında

```typescript
try {
  // Riskli kod buraya
} catch (error) {
  // Üretim ortamında konsola yazdırmayı engelle
  if (process.env.NODE_ENV !== 'production') {
    console.error('Hata açıklaması:', error);
  }
  
  // Kullanıcıya dostça bir hata mesajı göster
  toast.error('Kullanıcı dostu hata mesajı');
}
```

### errorUtils Kullanımı

```typescript
import { errorUtils } from '../utils';

try {
  // Firebase ile ilgili kod
} catch (error) {
  // Kullanıcı dostu hata mesajı al
  const message = errorUtils.getFirebaseErrorMessage(error);
  toast.error(message);
}
```

## Kod Temizliği

Üretim build'leri için console.log ve console.error ifadelerini kaldırmak için:

```bash
npm run clean:logs
```

## Güvenlik Notları

- Hassas bilgileri veya detaylı hata mesajlarını kullanıcıya göstermeyin
- Hata mesajlarında yol, dosya adı, kod satırı gibi teknik detaylar bulunmamalı
- Kullanıcıya her zaman "ne yapabilecekleri" hakkında yönlendirme içeren mesajlar gösterin
