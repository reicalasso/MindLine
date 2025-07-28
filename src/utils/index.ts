import { Timestamp } from 'firebase/firestore';
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

// Tarih/Zaman Utility'leri
export const dateUtils = {
  /**
   * Firestore Timestamp'ı Date'e çevirir
   */
  timestampToDate: (timestamp: Timestamp | null | undefined): Date | null => {
    if (!timestamp) return null;
    return timestamp.toDate();
  },

  /**
   * Date'i Firestore Timestamp'a çevirir
   */
  dateToTimestamp: (date: Date | string): Timestamp => {
    if (typeof date === 'string') {
      return Timestamp.fromDate(parseISO(date));
    }
    return Timestamp.fromDate(date);
  },

  /**
   * Relative time string döndürür (örn: "2 saat önce")
   */
  getRelativeTime: (date: Date | Timestamp | null | undefined): string => {
    if (!date) return '';
    
    const actualDate = date instanceof Timestamp ? date.toDate() : date;
    const now = new Date();
    const diff = now.getTime() - actualDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes}dk`;
    if (hours < 24) return `${hours}sa`;
    if (days < 7) return `${days}g`;
    
    return format(actualDate, 'dd.MM.yyyy', { locale: tr });
  },

  /**
   * Tarihi formatlar
   */
  formatDate: (
    date: Date | Timestamp | null | undefined,
    formatString: string = 'dd.MM.yyyy'
  ): string => {
    if (!date) return '';
    const actualDate = date instanceof Timestamp ? date.toDate() : date;
    return format(actualDate, formatString, { locale: tr });
  },

  /**
   * Bugün mü kontrol eder
   */
  isToday: (date: Date | Timestamp | null | undefined): boolean => {
    if (!date) return false;
    const actualDate = date instanceof Timestamp ? date.toDate() : date;
    return isToday(actualDate);
  },

  /**
   * Dün mü kontrol eder
   */
  isYesterday: (date: Date | Timestamp | null | undefined): boolean => {
    if (!date) return false;
    const actualDate = date instanceof Timestamp ? date.toDate() : date;
    return isYesterday(actualDate);
  },

  /**
   * İnsan dostu tarih string'i döndürür
   */
  getHumanDate: (date: Date | Timestamp | null | undefined): string => {
    if (!date) return '';
    const actualDate = date instanceof Timestamp ? date.toDate() : date;
    
    if (isToday(actualDate)) return 'Bugün';
    if (isYesterday(actualDate)) return 'Dün';
    
    return formatDistanceToNow(actualDate, { 
      addSuffix: true, 
      locale: tr 
    });
  }
};

// String Utility'leri
export const stringUtils = {
  /**
   * String'i truncate eder
   */
  truncate: (str: string, length: number = 100, suffix: string = '...'): string => {
    if (str.length <= length) return str;
    return str.substring(0, length).trim() + suffix;
  },

  /**
   * String'i capitalize eder
   */
  capitalize: (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * String'i title case yapar
   */
  titleCase: (str: string): string => {
    if (!str) return '';
    return str.split(' ')
      .map(word => stringUtils.capitalize(word))
      .join(' ');
  },

  /**
   * Email'i obfuscate eder
   */
  obfuscateEmail: (email: string): string => {
    if (!email || !email.includes('@')) return email;
    const [local, domain] = email.split('@');
    const obfuscatedLocal = local.length > 2 
      ? `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`
      : local;
    return `${obfuscatedLocal}@${domain}`;
  },

  /**
   * Slug oluşturur
   */
  createSlug: (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Özel karakterleri kaldır
      .replace(/[\s_-]+/g, '-') // Boşluk ve alt çizgileri tire ile değiştir
      .replace(/^-+|-+$/g, ''); // Başındaki ve sonundaki tireleri kaldır
  },

  /**
   * Random string oluşturur
   */
  generateRandomString: (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

// Array Utility'leri
export const arrayUtils = {
  /**
   * Array'i shuffle eder
   */
  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /**
   * Array'dan unique değerleri alır
   */
  unique: <T>(array: T[]): T[] => {
    return Array.from(new Set(array));
  },

  /**
   * Array'i gruplara böler
   */
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  /**
   * Array'den rastgele eleman seçer
   */
  random: <T>(array: T[]): T | undefined => {
    if (array.length === 0) return undefined;
    return array[Math.floor(Math.random() * array.length)];
  },

  /**
   * Array'i belirli bir key'e göre gruplar
   */
  groupBy: <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }
};

// Number Utility'leri
export const numberUtils = {
  /**
   * Sayıyı formatlar (1000 -> 1K)
   */
  formatNumber: (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  /**
   * Yüzde hesaplar
   */
  percentage: (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  },

  /**
   * Sayıyı belirli aralıkla sınırlar
   */
  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * Random sayı üretir
   */
  random: (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

// File Utility'leri
export const fileUtils = {
  /**
   * Dosya boyutunu formatlar
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Dosya uzantısını alır
   */
  getFileExtension: (filename: string): string => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  /**
   * Dosya tipini kontrol eder
   */
  isImageFile: (filename: string): boolean => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const extension = fileUtils.getFileExtension(filename).toLowerCase();
    return imageExtensions.includes(extension);
  },

  /**
   * Dosya tipini kontrol eder
   */
  isVideoFile: (filename: string): boolean => {
    const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv'];
    const extension = fileUtils.getFileExtension(filename).toLowerCase();
    return videoExtensions.includes(extension);
  }
};

// Color Utility'leri
export const colorUtils = {
  /**
   * Hex rengi RGB'ye çevirir
   */
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  /**
   * RGB'yi hex'e çevirir
   */
  rgbToHex: (r: number, g: number, b: number): string => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  /**
   * Rengin kontrast oranını hesaplar
   */
  getContrastRatio: (color1: string, color2: string): number => {
    // Basit implementasyon - gerçek kullanımda daha karmaşık olabilir
    return 1;
  },

  /**
   * Rastgele renk üretir
   */
  randomColor: (): string => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }
};

// Validation Utility'leri
export const validationUtils = {
  /**
   * Email formatını kontrol eder
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * URL formatını kontrol eder
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Türk telefon numarası formatını kontrol eder
   */
  isValidTurkishPhone: (phone: string): boolean => {
    const phoneRegex = /^(\+90|0)?([5][0-9]{9})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  /**
   * Güçlü şifre kontrol eder
   */
  isStrongPassword: (password: string): boolean => {
    // En az 8 karakter, 1 büyük harf, 1 küçük harf, 1 sayı
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }
};

// Storage Utility'leri
export const storageUtils = {
  /**
   * LocalStorage'a veri kaydeder
   */
  setItem: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('LocalStorage setItem error:', error);
    }
  },

  /**
   * LocalStorage'dan veri alır
   */
  getItem: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('LocalStorage getItem error:', error);
      return defaultValue || null;
    }
  },

  /**
   * LocalStorage'dan veri siler
   */
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('LocalStorage removeItem error:', error);
    }
  },

  /**
   * LocalStorage'ı temizler
   */
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('LocalStorage clear error:', error);
    }
  }
};

// Theme Utility'leri
export const themeUtils = {
  /**
   * Tema rengini CSS variable olarak set eder
   */
  setThemeColor: (property: string, value: string): void => {
    document.documentElement.style.setProperty(property, value);
  },

  /**
   * Koyu tema aktif mi kontrol eder
   */
  isDarkMode: (): boolean => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  },

  /**
   * Sistem tema değişikliklerini dinler
   */
  watchSystemTheme: (callback: (isDark: boolean) => void): () => void => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    
    mediaQuery.addListener(handler);
    
    return () => mediaQuery.removeListener(handler);
  }
};

// URL Utility'leri
export const urlUtils = {
  /**
   * Query parametrelerini parse eder
   */
  parseQueryParams: (search: string): Record<string, string> => {
    const params = new URLSearchParams(search);
    const result: Record<string, string> = {};
    
    for (const [key, value] of params) {
      result[key] = value;
    }
    
    return result;
  },

  /**
   * Query parametrelerini string'e çevirir
   */
  stringifyQueryParams: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    
    return searchParams.toString();
  }
};

// Debounce ve Throttle
export const performanceUtils = {
  /**
   * Fonksiyonu debounce eder
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Fonksiyonu throttle eder
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
};

// Error Handling Utility'leri
export const errorUtils = {
  /**
   * Firebase error'unu user-friendly mesaja çevirir
   */
  getFirebaseErrorMessage: (error: any): string => {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'Bu email adresi ile kayıtlı kullanıcı bulunamadı',
      'auth/wrong-password': 'Hatalı şifre',
      'auth/email-already-in-use': 'Bu email adresi zaten kullanımda',
      'auth/weak-password': 'Şifre çok zayıf',
      'auth/invalid-email': 'Geçersiz email adresi',
      'auth/operation-not-allowed': 'Bu işlem şu anda mevcut değil',
      'auth/too-many-requests': 'Çok fazla deneme yapıldı, lütfen daha sonra tekrar deneyin',
      'permission-denied': 'Bu işlem için yetkiniz yok',
      'not-found': 'Aranan içerik bulunamadı',
      'already-exists': 'Bu içerik zaten mevcut',
      'failed-precondition': 'İşlem gerçekleştirilemedi'
    };

    const errorCode = error?.code || error?.message || 'unknown';
    return errorMessages[errorCode] || 'Bir hata oluştu, lütfen daha sonra tekrar deneyin';
  },

  /**
   * Error'u log'lar
   */
  logError: (error: any, context?: string): void => {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    
    // Production'da error tracking servise gönderebilirsiniz
    // örn: Sentry, LogRocket, etc.
  }
};

// Tüm utility'leri tek objede topla
export const utils = {
  date: dateUtils,
  string: stringUtils,
  array: arrayUtils,
  number: numberUtils,
  file: fileUtils,
  color: colorUtils,
  validation: validationUtils,
  storage: storageUtils,
  theme: themeUtils,
  url: urlUtils,
  performance: performanceUtils,
  error: errorUtils
};

export default utils;
