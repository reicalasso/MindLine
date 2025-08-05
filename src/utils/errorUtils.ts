// errorUtils.ts - Hata yönetimi için yardımcı fonksiyonlar

/**
 * Hata mesajlarını standartlaştırmak ve işlemek için yardımcı fonksiyonlar
 */
class ErrorUtils {
  /**
   * Hataları konsola yazdırmak ve isteğe bağlı olarak bir hata izleme servisine göndermek için kullanılır
   * Production ortamında console.error yerine bu metot kullanılmalıdır
   */
  logError(error: any, source: string = 'Belirsiz', _additionalInfo: any = {}) {
    // Üretim ortamında console.error kullanımını engelle
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[${source}] Hata:`, error);
    }
    
    // Burada bir hata izleme servisine gönderme işlemi yapılabilir
    // Örneğin: Sentry.captureException(error, { extra: { source, ...additionalInfo } });
  }

  /**
   * Firebase Auth hatalarını kullanıcı dostu mesajlara çevirir
   */
  getFirebaseErrorMessage(error: any): string {
    if (!error.code) return error.message || 'Bir hata oluştu';
    
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'Bu email adresi ile kayıtlı kullanıcı bulunamadı',
      'auth/wrong-password': 'Hatalı şifre',
      'auth/email-already-in-use': 'Bu email adresi zaten kullanımda',
      'auth/weak-password': 'Şifre çok zayıf. En az 6 karakter kullanın',
      'auth/invalid-email': 'Geçersiz email adresi',
      'auth/user-disabled': 'Bu kullanıcı hesabı devre dışı bırakılmış',
      'auth/too-many-requests': 'Çok fazla giriş denemesi yapıldı. Lütfen daha sonra tekrar deneyin',
      'auth/operation-not-allowed': 'Email/Password girişi etkinleştirilmemiş'
    };
    
    return errorMessages[error.code] || error.message || 'Bir hata oluştu';
  }

  /**
   * Firestore hatalarını kullanıcı dostu mesajlara çevirir
   */
  getFirestoreErrorMessage(error: any): string {
    if (!error.code) return error.message || 'Veritabanı hatası oluştu';
    
    const errorMessages: Record<string, string> = {
      'permission-denied': 'Bu işlemi gerçekleştirmek için yetkiniz yok',
      'not-found': 'İstenen belge bulunamadı',
      'already-exists': 'Bu belge zaten mevcut',
      'failed-precondition': 'İşlem gerçekleştirilemedi'
    };
    
    return errorMessages[error.code] || error.message || 'Veritabanı hatası oluştu';
  }
}

export const errorUtils = new ErrorUtils();
