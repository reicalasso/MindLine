import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { ButtonProps } from '../../types';

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    onClick,
    type = 'button',
    'data-testid': testId,
    ...props
  }, ref) => {
    // Base styles
    const baseStyles = `
      inline-flex items-center justify-center
      font-medium rounded-full
      transition-all duration-300
      focus:outline-none focus:ring-4
      disabled:opacity-50 disabled:cursor-not-allowed
      relative overflow-hidden
    `;

    // Variant styles
    const variantStyles = {
      primary: `
        bg-gradient-to-r from-pink-500 to-purple-500
        text-white shadow-lg
        hover:from-pink-600 hover:to-purple-600
        hover:shadow-xl hover:scale-105
        focus:ring-pink-300
        active:scale-95
      `,
      secondary: `
        bg-gradient-to-r from-blue-500 to-cyan-500
        text-white shadow-lg
        hover:from-blue-600 hover:to-cyan-600
        hover:shadow-xl hover:scale-105
        focus:ring-blue-300
        active:scale-95
      `,
      outline: `
        border-2 border-gray-300 bg-white
        text-gray-700
        hover:border-gray-400 hover:bg-gray-50
        hover:shadow-md hover:scale-105
        focus:ring-gray-300
        active:scale-95
      `,
      ghost: `
        bg-transparent text-gray-700
        hover:bg-gray-100 hover:text-gray-900
        hover:scale-105
        focus:ring-gray-300
        active:scale-95
      `
    };

    // Size styles
    const sizeStyles = {
      xs: 'px-3 py-1.5 text-xs',
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
      xl: 'px-10 py-5 text-xl'
    };

    // Combine all styles
    const combinedStyles = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${className}
    `.replace(/\s+/g, ' ').trim();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return;
      onClick?.(event);
    };

    return (
      <button
        ref={ref}
        type={type}
        className={combinedStyles}
        onClick={handleClick}
        disabled={disabled || loading}
        data-testid={testId}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        )}
        
        {/* Content */}
        <span className={loading ? 'opacity-75' : ''}>
          {children}
        </span>

        {/* Shimmer effect */}
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

// Convenience components
export const PrimaryButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="primary" {...props} />
);

export const SecondaryButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="secondary" {...props} />
);

export const OutlineButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="outline" {...props} />
);

export const GhostButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="ghost" {...props} />
);

PrimaryButton.displayName = 'PrimaryButton';
SecondaryButton.displayName = 'SecondaryButton';
OutlineButton.displayName = 'OutlineButton';
GhostButton.displayName = 'GhostButton';
