import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'outline-danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    let variantStyles = '';

    switch (variant) {
      case 'primary':
        variantStyles =
          'bg-[#C2410C] hover:bg-[#9A3412] text-white border border-transparent shadow-none disabled:bg-[#CBD5E1] disabled:text-[#475569]';
        break;
      case 'secondary':
        variantStyles =
          'bg-white hover:bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1] disabled:bg-[#F1F5F9] disabled:text-[#475569]';
        break;
      case 'tertiary':
        variantStyles =
          'bg-transparent hover:bg-[#F1F5F9] text-[#C2410C] hover:text-[#9A3412] border border-transparent disabled:text-[#475569]';
        break;
      case 'danger':
        variantStyles =
          'bg-[#B91C1C] hover:bg-[#991B1B] text-white border border-transparent disabled:bg-[#FCA5A5]';
        break;
      case 'outline-danger':
        variantStyles =
          'bg-white hover:bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5] disabled:border-[#CBD5E1] disabled:text-[#475569]';
        break;
    }

    let sizeStyles = 'min-h-[40px] px-4 py-2 text-sm';
    if (size === 'sm') {
      sizeStyles = 'min-h-[34px] px-3 py-1.5 text-xs';
    } else if (size === 'lg') {
      sizeStyles = 'min-h-[44px] px-6 py-2.5 text-base';
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-semibold rounded-[4px] transition-all duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2 select-none cursor-pointer disabled:cursor-not-allowed ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" aria-hidden="true" />
        ) : (
          leftIcon && <span className="mr-2 inline-flex items-center" aria-hidden="true">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="ml-2 inline-flex items-center" aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
