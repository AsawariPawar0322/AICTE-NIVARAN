import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, required, id, className = '', ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor={inputId} className="text-xs font-semibold text-[#1A1F2B] flex items-center gap-1">
          {label}
          {required && <span className="text-[#B91C1C]" aria-hidden="true">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
          className={`h-10 px-3 py-2 text-sm bg-white border rounded-[4px] text-[#1A1F2B] placeholder-[#4B5565] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2 transition-colors ${
            error ? 'border-[#B91C1C]' : 'border-[#CBD2DC] hover:border-[#4B5565]'
          } ${className}`}
          {...props}
        />
        {helperText && !error && (
          <span id={`${inputId}-help`} className="text-xs text-[#4B5565]">
            {helperText}
          </span>
        )}
        {error && (
          <span id={`${inputId}-error`} className="text-xs text-[#B91C1C] flex items-center gap-1 font-medium mt-0.5">
            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, helperText, error, required, id, maxLength, value, className = '', ...props }, ref) => {
    const inputId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="flex flex-col gap-1 w-full">
        <div className="flex justify-between items-center">
          <label htmlFor={inputId} className="text-xs font-semibold text-[#1A1F2B] flex items-center gap-1">
            {label}
            {required && <span className="text-[#B91C1C]" aria-hidden="true">*</span>}
          </label>
          {maxLength && (
            <span className="text-[11px] text-[#4B5565]">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={inputId}
          maxLength={maxLength}
          value={value}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
          className={`p-3 text-sm bg-white border rounded-[4px] text-[#1A1F2B] placeholder-[#4B5565] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2 transition-colors min-h-[90px] ${
            error ? 'border-[#B91C1C]' : 'border-[#CBD2DC] hover:border-[#4B5565]'
          } ${className}`}
          {...props}
        />
        {helperText && !error && (
          <span id={`${inputId}-help`} className="text-xs text-[#4B5565]">
            {helperText}
          </span>
        )}
        {error && (
          <span id={`${inputId}-error`} className="text-xs text-[#B91C1C] flex items-center gap-1 font-medium mt-0.5">
            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            {error}
          </span>
        )}
      </div>
    );
  }
);
TextArea.displayName = 'TextArea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { label: string; value: string }[];
  helperText?: string;
  error?: string;
  required?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, helperText, error, required, id, className = '', ...props }, ref) => {
    const inputId = id || `select-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor={inputId} className="text-xs font-semibold text-[#1A1F2B] flex items-center gap-1">
          {label}
          {required && <span className="text-[#B91C1C]" aria-hidden="true">*</span>}
        </label>
        <select
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
          className={`h-10 px-3 py-2 text-sm bg-white border rounded-[4px] text-[#1A1F2B] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2 transition-colors ${
            error ? 'border-[#B91C1C]' : 'border-[#CBD2DC] hover:border-[#4B5565]'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {helperText && !error && (
          <span id={`${inputId}-help`} className="text-xs text-[#4B5565]">
            {helperText}
          </span>
        )}
        {error && (
          <span id={`${inputId}-error`} className="text-xs text-[#B91C1C] flex items-center gap-1 font-medium mt-0.5">
            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            {error}
          </span>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
