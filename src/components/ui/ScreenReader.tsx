import React from 'react';

interface ScreenReaderProps {
  children: React.ReactNode;
  announce?: boolean;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
}

/**
 * Screen Reader only component - content visible only to screen readers
 */
export const ScreenReaderOnly: React.FC<ScreenReaderProps> = ({ children }) => {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
};

/**
 * Live Region component for dynamic announcements
 */
export const LiveRegion: React.FC<ScreenReaderProps> = ({
  children,
  priority = 'polite',
  atomic = true
}) => {
  return (
    <div
      aria-live={priority}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
};

/**
 * Skip Link component for keyboard navigation
 */
interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  href,
  children,
  className = ''
}) => {
  return (
    <a
      href={href}
      className={`
        sr-only focus:not-sr-only 
        focus:fixed focus:top-4 focus:left-4 
        bg-blue-600 text-white px-4 py-2 rounded 
        z-[9999999] focus:z-[9999999]
        transition-all duration-200
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {children}
    </a>
  );
};

/**
 * Progress announcement component
 */
interface ProgressAnnouncementProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
}

export const ProgressAnnouncement: React.FC<ProgressAnnouncementProps> = ({
  value,
  max,
  label = 'İlerleme',
  showPercentage = true
}) => {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <LiveRegion priority="polite">
      {showPercentage 
        ? `${label}: %${percentage}`
        : `${label}: ${value} / ${max}`
      }
    </LiveRegion>
  );
};

/**
 * Loading announcement component
 */
interface LoadingAnnouncementProps {
  loading: boolean;
  message?: string;
  completedMessage?: string;
}

export const LoadingAnnouncement: React.FC<LoadingAnnouncementProps> = ({
  loading,
  message = 'Yükleniyor...',
  completedMessage = 'Yükleme tamamlandı'
}) => {
  const [previousLoading, setPreviousLoading] = React.useState(loading);
  const [announcement, setAnnouncement] = React.useState('');

  React.useEffect(() => {
    if (loading && !previousLoading) {
      setAnnouncement(message);
    } else if (!loading && previousLoading) {
      setAnnouncement(completedMessage);
    }
    
    setPreviousLoading(loading);
  }, [loading, previousLoading, message, completedMessage]);

  React.useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => {
        setAnnouncement('');
      }, 1000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [announcement]);

  if (!announcement) return null;

  return (
    <LiveRegion priority="polite">
      {announcement}
    </LiveRegion>
  );
};

/**
 * Error announcement component
 */
interface ErrorAnnouncementProps {
  error: string | null;
  prefix?: string;
}

export const ErrorAnnouncement: React.FC<ErrorAnnouncementProps> = ({
  error,
  prefix = 'Hata:'
}) => {
  if (!error) return null;

  return (
    <LiveRegion priority="assertive">
      {prefix} {error}
    </LiveRegion>
  );
};

/**
 * Success announcement component
 */
interface SuccessAnnouncementProps {
  message: string | null;
  prefix?: string;
}

export const SuccessAnnouncement: React.FC<SuccessAnnouncementProps> = ({
  message,
  prefix = 'Başarılı:'
}) => {
  if (!message) return null;

  return (
    <LiveRegion priority="polite">
      {prefix} {message}
    </LiveRegion>
  );
};

/**
 * Form validation announcements
 */
interface FormValidationAnnouncementProps {
  errors: Record<string, string>;
}

export const FormValidationAnnouncement: React.FC<FormValidationAnnouncementProps> = ({
  errors
}) => {
  const errorCount = Object.keys(errors).length;
  
  if (errorCount === 0) return null;

  const message = errorCount === 1 
    ? '1 hata bulundu. Lütfen formu kontrol edin.'
    : `${errorCount} hata bulundu. Lütfen formu kontrol edin.`;

  return (
    <LiveRegion priority="assertive">
      {message}
    </LiveRegion>
  );
};

/**
 * Page title announcer for SPA navigation
 */
interface PageTitleAnnouncementProps {
  title: string;
}

export const PageTitleAnnouncement: React.FC<PageTitleAnnouncementProps> = ({
  title
}) => {
  const [announcement, setAnnouncement] = React.useState('');

  React.useEffect(() => {
    setAnnouncement(`Sayfa değişti: ${title}`);
    
    const timer = setTimeout(() => {
      setAnnouncement('');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [title]);

  if (!announcement) return null;

  return (
    <LiveRegion priority="polite">
      {announcement}
    </LiveRegion>
  );
};

/**
 * Keyboard shortcut helper
 */
interface KeyboardShortcutProps {
  shortcut: string;
  description: string;
}

export const KeyboardShortcut: React.FC<KeyboardShortcutProps> = ({
  shortcut,
  description
}) => {
  return (
    <ScreenReaderOnly>
      Klavye kısayolu: {shortcut}. {description}
    </ScreenReaderOnly>
  );
};

export default {
  ScreenReaderOnly,
  LiveRegion,
  SkipLink,
  ProgressAnnouncement,
  LoadingAnnouncement,
  ErrorAnnouncement,
  SuccessAnnouncement,
  FormValidationAnnouncement,
  PageTitleAnnouncement,
  KeyboardShortcut
};
