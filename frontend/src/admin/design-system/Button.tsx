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
          'bg-[#C2570C] hover:bg-[#9A4509] text-white border border-transparent shadow-none disabled:bg-[#CBD2DC] disabled:text-[#4B5565]';
        break;
      case 'secondary':
        variantStyles =
          'bg-white hover:bg-[#F3F5F8] text-[#1A1F2B] border border-[#CBD2DC] disabled:bg-[#F3F5F8] disabled:text-[#4B5565]';
        break;
      case 'tertiary':
        variantStyles =
          'bg-transparent hover:bg-[#F3F5F8] text-[#C2570C] hover:text-[#9A4509] border border-transparent disabled:text-[#4B5565]';
        break;
      case 'danger':
        variantStyles =
          'bg-[#B91C1C] hover:bg-[#991B1B] text-white border border-transparent disabled:bg-[#FCA5A5]';
        break;
      case 'outline-danger':
        variantStyles =
          'bg-white hover:bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5] disabled:border-[#CBD2DC] disabled:text-[#4B5565]';
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
        className={`inline-flex items-center justify-center font-semibold rounded-[4px] transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2 select-none cursor-pointer disabled:cursor-not-allowed ${variantStyles} ${sizeStyles} ${className}`}
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
