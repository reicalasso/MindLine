import { Timestamp } from 'firebase/firestore';

// Firebase Auth tiplerini genişlet
export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

// Firestore belge tipleri
export interface FirestoreDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  author: string;
}

// Mektup tipi
export interface Letter extends FirestoreDocument {
  title: string;
  content: string;
  recipientName: string;
  mood?: string;
  isPrivate?: boolean;
  tags?: string[];
}

// Sohbet mesajı tipi
export interface ChatMessage extends FirestoreDocument {
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead?: boolean;
  replyTo?: string;
  reactions?: Reaction[];
}

// Reaksiyon tipi
export interface Reaction {
  emoji: string;
  userId: string;
  timestamp: Timestamp;
}

// Film tipi
export interface Movie extends FirestoreDocument {
  title: string;
  director?: string;
  year?: number;
  genre?: string[];
  rating?: number;
  myRating?: number;
  notes?: string;
  posterUrl?: string;
  watchedDate?: Timestamp;
  isWatched: boolean;
  isFavorite?: boolean;
  tmdbId?: number;
}

// Müzik tipi
export interface MusicTrack extends FirestoreDocument {
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  genre?: string[];
  rating?: number;
  notes?: string;
  albumArt?: string;
  spotifyId?: string;
  youtubeId?: string;
  isPlaying?: boolean;
  isFavorite?: boolean;
  playCount?: number;
}

// Görev tipi
export interface Todo extends FirestoreDocument {
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: Timestamp;
  assignedTo?: string;
  tags?: string[];
  subTasks?: SubTask[];
}

// Alt görev tipi
export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Timestamp;
}

// Takvim etkinliği tipi
export interface CalendarEvent extends FirestoreDocument {
  title: string;
  description?: string;
  date: Timestamp;
  endDate?: Timestamp;
  location?: string;
  type: 'anniversary' | 'date' | 'reminder' | 'special' | 'other';
  isAllDay?: boolean;
  reminder?: number; // dakika olarak
  color?: string;
  recurring?: RecurrenceRule;
}

// Tekrarlama kuralı tipi
export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Timestamp;
  count?: number;
}

// Galeri fotoğrafı tipi
export interface GalleryPhoto extends FirestoreDocument {
  url: string;
  caption?: string;
  tags?: string[];
  location?: string;
  dateTaken?: Timestamp;
  isPrivate?: boolean;
  isFavorite?: boolean;
  thumbnailUrl?: string;
  metadata?: PhotoMetadata;
}

// Fotoğraf metadata tipi
export interface PhotoMetadata {
  width: number;
  height: number;
  size: number;
  format: string;
  camera?: string;
  lens?: string;
  iso?: number;
  aperture?: string;
  shutterSpeed?: string;
  gps?: {
    latitude: number;
    longitude: number;
  };
}

// Profil tipi
export interface UserProfile extends FirestoreDocument {
  displayName: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  favoriteEmoji?: string;
  birthDate?: Timestamp;
  relationship?: 'single' | 'dating' | 'engaged' | 'married';
  partnerUserId?: string;
  interests?: string[];
  favoriteColors?: string[];
  theme?: 'cat' | 'romantic' | 'magic' | 'default';
  privacy?: PrivacySettings;
  notifications?: NotificationSettings;
}

// Gizlilik ayarları tipi
export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  allowMessages: boolean;
  allowFriendRequests: boolean;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
}

// Bildirim ayarları tipi
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  newMessage: boolean;
  newLetter: boolean;
  reminders: boolean;
  updates: boolean;
}

// Dashboard istatistikleri tipi
export interface DashboardStats {
  letters: number;
  messages: number;
  movies: number;
  todos: number;
  completedTodos: number;
  music: number;
  photos: number;
  totalItems?: number;
  completionRate?: number;
}

// Aktivite tipi
export interface Activity {
  id: string;
  type: 'letter' | 'message' | 'photo' | 'movie' | 'music' | 'todo' | 'calendar';
  title: string;
  time?: Date;
  author?: string;
  icon: any; // Lucide React icon
  color: string;
  emoji: string;
  bg: string;
  preview?: string;
}

// Hızlı işlem tipi
export interface QuickAction {
  title: string;
  description: string;
  icon: any; // Lucide React icon
  emoji: string;
  link: string;
  gradient: string;
  hover: string;
  category: string;
}

// Form durumu tipi
export interface FormState<T = any> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

// API yanıt tipi
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Genel seçenek tipi
export interface Option {
  value: string;
  label: string;
  emoji?: string;
  color?: string;
  disabled?: boolean;
}

// Theme types - import from theme.ts
export * from './theme';

// Component props tipleri
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  error?: string;
  helperText?: string;
  icon?: any;
  rightIcon?: any;
}

// Modal props tipi
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
}

// Dropdown props tipi
export interface DropdownProps extends BaseComponentProps {
  trigger: React.ReactNode;
  items: Array<{
    label: string;
    value: string;
    icon?: any;
    onClick: () => void;
    disabled?: boolean;
  }>;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

// Loading durumu tipi
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Hata tipi
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Utility tiplerini dışa aktar
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
