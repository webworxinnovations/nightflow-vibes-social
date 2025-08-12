import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { SecureInput } from '@/components/forms/SecureInput';
import { validateEmail, validatePasswordStrength } from '@/utils/inputValidation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecureAuthFormProps {
  mode: 'login' | 'signup';
  onSuccess?: () => void;
  onModeChange?: (mode: 'login' | 'signup') => void;
}

export const SecureAuthForm: React.FC<SecureAuthFormProps> = ({
  mode,
  onSuccess,
  onModeChange
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ isValid: false, errors: [] as string[] });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time password strength validation for signup
    if (field === 'password' && mode === 'signup') {
      setPasswordStrength(validatePasswordStrength(value));
    }
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!validateEmail(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (mode === 'signup') {
      if (!passwordStrength.isValid) {
        errors.push(...passwordStrength.errors);
      }

      if (formData.password !== formData.confirmPassword) {
        errors.push('Passwords do not match');
      }

      if (!formData.username || formData.username.length < 3) {
        errors.push('Username must be at least 3 characters long');
      }
    } else {
      if (!formData.password) {
        errors.push('Password is required');
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          throw error;
        }

        toast.success('Successfully logged in!');
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
              full_name: formData.username,
            }
          }
        });

        if (error) {
          throw error;
        }

        toast.success('Account created! Please check your email for verification.');
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // User-friendly error messages
      const errorMessage = error.message.includes('Invalid login credentials') 
        ? 'Invalid email or password. Please try again.'
        : error.message.includes('User already registered')
        ? 'An account with this email already exists. Please try logging in instead.'
        : error.message.includes('Password should be at least')
        ? 'Password must be at least 6 characters long'
        : 'Authentication failed. Please try again.';
        
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Shield className="h-6 w-6" />
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </CardTitle>
        <CardDescription>
          {mode === 'login' 
            ? 'Enter your credentials to access your account'
            : 'Create a secure account to get started'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SecureInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            required={true}
            placeholder="Enter your email"
            sanitizeInput={true}
          />

          {mode === 'signup' && (
            <SecureInput
              label="Username"
              type="text"
              value={formData.username}
              onChange={(value) => handleInputChange('username', value)}
              required={true}
              maxLength={20}
              pattern="^[a-zA-Z0-9_]+$"
              placeholder="Choose a username"
              sanitizeInput={true}
            />
          )}

          <div className="space-y-2">
            <div className="relative">
              <SecureInput
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(value) => handleInputChange('password', value)}
                required={true}
                placeholder="Enter your password"
                sanitizeInput={false}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-8 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            {mode === 'signup' && formData.password && (
              <div className="space-y-1">
                {passwordStrength.errors.map((error, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <AlertTriangle className="h-3 w-3" />
                    {error}
                  </div>
                ))}
              </div>
            )}
          </div>

          {mode === 'signup' && (
            <SecureInput
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(value) => handleInputChange('confirmPassword', value)}
              required={true}
              placeholder="Confirm your password"
              sanitizeInput={false}
              customValidation={(value) => ({
                isValid: value === formData.password,
                errors: value === formData.password ? [] : ['Passwords do not match']
              })}
            />
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>

          <div className="text-center text-sm">
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => onModeChange?.('signup')}
                  className="text-primary hover:underline"
                >
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => onModeChange?.('login')}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </form>

        <Alert className="mt-4">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Your data is protected with enterprise-grade encryption. We never store your password in plain text.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};