import React, { forwardRef } from 'react';
import { BaseComponentProps } from '../../types';

interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  loading?: boolean;
}

interface CardHeaderProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

interface CardContentProps extends BaseComponentProps {}

interface CardFooterProps extends BaseComponentProps {
  actions?: React.ReactNode;
}

// Main Card Component
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    children,
    variant = 'default',
    size = 'md',
    interactive = false,
    loading = false,
    className = '',
    'data-testid': testId,
    ...props
  }, ref) => {
    // Base styles
    const baseStyles = `
      relative rounded-3xl transition-all duration-300
      font-elegant overflow-hidden
    `;

    // Variant styles
    const variantStyles = {
      default: `
        bg-white/90 backdrop-blur-xl
        border border-white/40 shadow-soft
      `,
      elevated: `
        bg-white/95 backdrop-blur-xl
        border-2 border-white/50 shadow-magic
      `,
      outlined: `
        bg-white/80 backdrop-blur-sm
        border-2 border-gray-200 shadow-sm
      `,
      filled: `
        bg-gradient-to-br from-white to-gray-50
        border border-gray-100 shadow-md
      `
    };

    // Size styles
    const sizeStyles = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    };

    // Interactive styles
    const interactiveStyles = interactive ? `
      cursor-pointer
      hover:scale-[1.02] hover:shadow-magic
      hover:border-cat-300/50
      active:scale-[0.98]
    ` : '';

    // Loading styles
    const loadingStyles = loading ? 'animate-pulse' : '';

    // Combine all styles
    const combinedStyles = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${interactiveStyles}
      ${loadingStyles}
      ${className}
    `.replace(/\s+/g, ' ').trim();

    return (
      <div
        ref={ref}
        className={combinedStyles}
        data-testid={testId}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-[1] rounded-3xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin"></div>
              <span className="text-gray-600 font-medium">Yükleniyor...</span>
            </div>
          </div>
        )}
        {children}
      </div>
    );
  }
);

// Card Header Component
const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({
    children,
    title,
    subtitle,
    action,
    className = '',
    'data-testid': testId,
    ...props
  }, ref) => {
    const headerStyles = `
      flex items-start justify-between
      pb-4 mb-4 border-b border-gray-100
      ${className}
    `.replace(/\s+/g, ' ').trim();

    return (
      <div
        ref={ref}
        className={headerStyles}
        data-testid={testId}
        {...props}
      >
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-lg sm:text-xl font-cat text-gray-800 mb-1 truncate">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 font-elegant">
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {action && (
          <div className="flex-shrink-0 ml-4">
            {action}
          </div>
        )}
      </div>
    );
  }
);

// Card Content Component
const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({
    children,
    className = '',
    'data-testid': testId,
    ...props
  }, ref) => {
    const contentStyles = `
      text-gray-700 leading-relaxed
      ${className}
    `.replace(/\s+/g, ' ').trim();

    return (
      <div
        ref={ref}
        className={contentStyles}
        data-testid={testId}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// Card Footer Component
const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({
    children,
    actions,
    className = '',
    'data-testid': testId,
    ...props
  }, ref) => {
    const footerStyles = `
      flex items-center justify-between
      pt-4 mt-4 border-t border-gray-100
      ${className}
    `.replace(/\s+/g, ' ').trim();

    return (
      <div
        ref={ref}
        className={footerStyles}
        data-testid={testId}
        {...props}
      >
        <div className="flex-1">
          {children}
        </div>
        {actions && (
          <div className="flex items-center space-x-2 ml-4">
            {actions}
          </div>
        )}
      </div>
    );
  }
);

// Set display names
Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

// Export all components
export { Card, CardHeader, CardContent, CardFooter };
export default Card;

// Specialized card variants
export const StatCard = forwardRef<HTMLDivElement, CardProps & {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  emoji?: string;
  gradient?: string;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
}>(
  ({
    title,
    value,
    icon,
    emoji,
    gradient = 'bg-gradient-to-br from-blue-400 to-blue-600',
    change,
    trend = 'stable',
    className = '',
    ...props
  }, ref) => {
    const trendColors = {
      up: 'text-green-600',
      down: 'text-red-600',
      stable: 'text-gray-600'
    };

    return (
      <Card
        ref={ref}
        variant="elevated"
        interactive
        className={`group ${className}`}
        {...props}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:animate-purr`}>
            {emoji ? (
              <span className="text-2xl">{emoji}</span>
            ) : (
              icon
            )}
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-600 mb-1 font-elegant">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-800 font-cat mb-2">
            {value}
          </p>
          {change && (
            <p className={`text-xs flex items-center ${trendColors[trend]}`}>
              {change}
            </p>
          )}
        </div>
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';
