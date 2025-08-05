import React, { useEffect, useRef /*, useCallback */ } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { ModalProps } from '../../types';
import { FocusManager, generateId } from '../../utils/accessibility';
import { useScrollLock, useFocusTrap, useClickOutside } from '../../hooks';
import Button from './Button';

const Modal: React.FC<ModalProps> = ({
  children,
  isOpen,
  onClose,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className = '',
  'data-testid': testId,
  ...props
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useRef(generateId('modal-title'));
  const descriptionId = useRef(generateId('modal-description'));
  const focusManagerRef = useRef<FocusManager | null>(null);

  // Lock scroll when modal is open
  useScrollLock(isOpen);

  // Trap focus within modal
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isOpen);

  // Close modal when clicking outside
  const clickOutsideRef = useClickOutside<HTMLDivElement>(() => {
    if (closeOnOverlayClick) {
      onClose();
    }
  }, []);

  // Size styles
  const sizeStyles = {
    xs: 'max-w-sm',
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEsc && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
    return undefined;
  }, [isOpen, closeOnEsc, onClose]);

  // Manage focus
  useEffect(() => {
    if (isOpen && modalRef.current) {
      focusManagerRef.current = new FocusManager(modalRef.current);
      focusManagerRef.current.trapFocus();

      return () => {
        focusManagerRef.current?.restoreFocus();
      };
    }
    return undefined;
  }, [isOpen]);

  // Announce modal opening/closing to screen readers
  useEffect(() => {
    if (isOpen) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = title ? `${title} penceresi açıldı` : 'Pencere açıldı';
      
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  }, [isOpen, title]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId.current : undefined}
      aria-describedby={descriptionId.current}
      data-testid={testId}
      {...props}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={node => {
          focusTrapRef(node);
          clickOutsideRef(node);
          // Do not assign to modalRef.current if it's readonly
        }}
        className={`
          relative w-full ${sizeStyles[size]} max-h-[90vh] 
          bg-white rounded-3xl shadow-2xl 
          border-2 border-white/20 backdrop-blur-xl
          flex flex-col overflow-hidden
          transform transition-all duration-300
          ${className}
        `.replace(/\s+/g, ' ').trim()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            {title && (
              <h2 
                id={titleId.current}
                className="text-xl sm:text-2xl font-cat text-gray-800 flex-1 pr-4"
              >
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="flex-shrink-0 !p-2 !rounded-full hover:bg-gray-100"
                aria-label="Pencereyi kapat"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div 
          id={descriptionId.current}
          className="flex-1 overflow-y-auto p-6"
        >
          {children}
        </div>
      </div>
    </div>
  );

  // Render modal in portal
  return createPortal(modalContent, document.body);
};

export default Modal;

// Modal hook for easier usage
export const useModal = (initialOpen: boolean = false) => {
  const [isOpen, setIsOpen] = React.useState(initialOpen);

  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);
  const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    setIsOpen
  };
};

// Convenience components
export const ConfirmModal: React.FC<ModalProps & {
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}> = ({
  onConfirm,
  onCancel,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  variant = 'info',
  children,
  ...props
}) => {
  const handleCancel = () => {
    onCancel?.();
    props.onClose();
  };

  const handleConfirm = () => {
    onConfirm();
    props.onClose();
  };

  const variantStyles = {
    danger: 'from-red-500 to-red-600',
    warning: 'from-orange-500 to-orange-600',
    info: 'from-blue-500 to-blue-600'
  };

  return (
    <Modal {...props} size="sm">
      <div className="text-center">
        <div className="mb-6">
          {children}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="order-2 sm:order-1"
          >
            {cancelText}
          </Button>
          
          <Button
            onClick={handleConfirm}
            className={`order-1 sm:order-2 bg-gradient-to-r ${variantStyles[variant]} text-white`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
