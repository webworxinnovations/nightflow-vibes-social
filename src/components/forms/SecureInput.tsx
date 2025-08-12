/**
 * Secure Input Component with Built-in Validation and Sanitization
 */

import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { sanitizeString, sanitizeHtml } from '@/utils/inputValidation';

interface SecureInputProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'url' | 'tel';
  value: string;
  onChange: (value: string) => void;
  onValidation?: (isValid: boolean, errors: string[]) => void;
  maxLength?: number;
  required?: boolean;
  pattern?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  sanitizeInput?: boolean;
  customValidation?: (value: string) => { isValid: boolean; errors: string[] };
}

export const SecureInput: React.FC<SecureInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  onValidation,
  maxLength = 500,
  required = false,
  pattern,
  placeholder,
  disabled = false,
  className = '',
  sanitizeInput = true,
  customValidation
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [isTouched, setIsTouched] = useState(false);

  const validateInput = useCallback((inputValue: string): { isValid: boolean; errors: string[] } => {
    const validationErrors: string[] = [];

    // Required validation
    if (required && !inputValue.trim()) {
      validationErrors.push(`${label} is required`);
    }

    // Length validation
    if (inputValue.length > maxLength) {
      validationErrors.push(`${label} must be less than ${maxLength} characters`);
    }

    // Pattern validation
    if (pattern && inputValue && !new RegExp(pattern).test(inputValue)) {
      validationErrors.push(`${label} format is invalid`);
    }

    // Type-specific validation
    if (inputValue && type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inputValue)) {
        validationErrors.push('Invalid email format');
      }
    }

    if (inputValue && type === 'url') {
      try {
        new URL(inputValue);
      } catch {
        validationErrors.push('Invalid URL format');
      }
    }

    // Custom validation
    if (customValidation && inputValue) {
      const customResult = customValidation(inputValue);
      if (!customResult.isValid) {
        validationErrors.push(...customResult.errors);
      }
    }

    // XSS prevention check
    if (inputValue && (inputValue.includes('<script') || inputValue.includes('javascript:'))) {
      validationErrors.push('Invalid characters detected');
    }

    return { isValid: validationErrors.length === 0, errors: validationErrors };
  }, [label, maxLength, pattern, required, type, customValidation]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // Sanitize input if enabled
    if (sanitizeInput) {
      if (type === 'email' || type === 'url') {
        // Light sanitization for emails and URLs
        inputValue = inputValue.trim();
      } else {
        // Full sanitization for other inputs
        inputValue = sanitizeString(inputValue, maxLength);
      }
    }

    // Validate input
    const validation = validateInput(inputValue);
    setErrors(validation.errors);

    // Call validation callback
    if (onValidation) {
      onValidation(validation.isValid, validation.errors);
    }

    // Update value
    onChange(inputValue);
  }, [sanitizeInput, type, maxLength, validateInput, onValidation, onChange]);

  const handleBlur = useCallback(() => {
    setIsTouched(true);
  }, []);

  const hasErrors = errors.length > 0 && isTouched;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <Input
        id={label.toLowerCase().replace(/\s+/g, '-')}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        pattern={pattern}
        className={hasErrors ? 'border-destructive focus:border-destructive' : ''}
        aria-invalid={hasErrors}
        aria-describedby={hasErrors ? `${label}-error` : undefined}
      />

      {hasErrors && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription id={`${label}-error`}>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground">
        {value.length}/{maxLength} characters
      </div>
    </div>
  );
};