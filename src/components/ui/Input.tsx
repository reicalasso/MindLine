import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { InputProps } from '../../types';

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    type = 'text',
    placeholder,
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    disabled = false,
    required = false,
    autoFocus = false,
    autoComplete,
    maxLength,
    minLength,
    error,
    helperText,
    icon: Icon,
    rightIcon: RightIcon,
    className = '',
    'data-testid': testId,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isPasswordType = type === 'password';
    const actualType = isPasswordType && showPassword ? 'text' : type;
    const hasError = Boolean(error);
    const hasSuccess = !hasError && value && value.length > 0;

    // Base styles
    const baseStyles = `
      w-full px-4 py-3 text-base
      bg-white/80 backdrop-blur-sm
      border-2 rounded-2xl
      transition-all duration-300
      focus:outline-none
      disabled:opacity-50 disabled:cursor-not-allowed
      font-elegant
    `;

    // State styles
    const stateStyles = (() => {
      if (hasError) {
        return `
          border-red-300 text-red-900 placeholder-red-400
          focus:border-red-500 focus:ring-4 focus:ring-red-200
        `;
      }
      
      if (hasSuccess) {
        return `
          border-green-300 text-green-900 placeholder-green-400
          focus:border-green-500 focus:ring-4 focus:ring-green-200
        `;
      }
      
      if (isFocused) {
        return `
          border-cat-400 text-gray-900 placeholder-gray-500
          ring-4 ring-cat-200/50
        `;
      }
      
      return `
        border-gray-300 text-gray-900 placeholder-gray-500
        hover:border-gray-400
        focus:border-cat-400 focus:ring-4 focus:ring-cat-200/50
      `;
    })();

    // Icon styles
    const iconStyles = "w-5 h-5 flex-shrink-0";
    const leftIconStyles = hasError ? "text-red-400" : hasSuccess ? "text-green-400" : "text-gray-400";
    const rightIconStyles = "text-gray-400 hover:text-gray-600 transition-colors cursor-pointer";

    // Padding adjustments for icons
    const paddingStyles = (() => {
      const hasLeftIcon = Boolean(Icon);
      const hasRightIcon = Boolean(RightIcon) || isPasswordType;
      
      if (hasLeftIcon && hasRightIcon) return "pl-12 pr-12";
      if (hasLeftIcon) return "pl-12 pr-4";
      if (hasRightIcon) return "pl-4 pr-12";
      return "px-4";
    })();

    // Combine all styles
    const combinedStyles = `
      ${baseStyles}
      ${stateStyles}
      ${paddingStyles}
      ${className}
    `.replace(/\s+/g, ' ').trim();

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(event);
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="relative">
        {/* Left Icon */}
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-[1]">
            <Icon className={`${iconStyles} ${leftIconStyles}`} />
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          type={actualType}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          className={combinedStyles}
          data-testid={testId}
          {...props}
        />

        {/* Right Icon / Password Toggle / Status Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 flex items-center space-x-2">
          {/* Status Icon */}
          {hasError && <AlertCircle className={`${iconStyles} text-red-400`} />}
          {hasSuccess && <CheckCircle className={`${iconStyles} text-green-400`} />}
          
          {/* Password Toggle */}
          {isPasswordType && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className={`${iconStyles} ${rightIconStyles}`}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          )}
          
          {/* Custom Right Icon */}
          {RightIcon && !isPasswordType && (
            <RightIcon className={`${iconStyles} ${rightIconStyles}`} />
          )}
        </div>

        {/* Helper Text / Error Message */}
        {(error || helperText) && (
          <div className="mt-2 flex items-start space-x-1">
            {error && <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />}
            <p className={`text-sm font-elegant ${
              error ? 'text-red-600' : 'text-gray-600'
            }`}>
              {error || helperText}
            </p>
          </div>
        )}

        {/* Character Count */}
        {maxLength && (
          <div className="mt-1 text-right">
            <span className={`text-xs ${
              (value?.length || 0) > maxLength * 0.9 ? 'text-orange-500' : 'text-gray-400'
            }`}>
              {value?.length || 0}/{maxLength}
            </span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

// Specialized input components
export const EmailInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => (
    <Input
      ref={ref}
      type="email"
      autoComplete="email"
      {...props}
    />
  )
);

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => (
    <Input
      ref={ref}
      type="password"
      autoComplete="current-password"
      {...props}
    />
  )
);

export const SearchInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => (
    <Input
      ref={ref}
      type="search"
      autoComplete="off"
      {...props}
    />
  )
);

EmailInput.displayName = 'EmailInput';
PasswordInput.displayName = 'PasswordInput';
SearchInput.displayName = 'SearchInput';
