/**
 * Input Validation and Sanitization Utilities
 * Enhanced security for user inputs
 */

// XSS Protection
export const sanitizeHtml = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/&/g, '&amp;')
    .trim();
};

// SQL Injection Protection
export const sanitizeForDatabase = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .trim()
    .substring(0, 1000); // Limit length
};

// General string sanitization
export const sanitizeString = (input: string, maxLength: number = 500): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/[<>\"'&\n\r\t]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, maxLength);
};

// Email validation
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// UUID validation
export const validateUuid = (uuid: string): boolean => {
  if (!uuid || typeof uuid !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Username validation
export const validateUsername = (username: string): boolean => {
  if (!username || typeof username !== 'string') return false;
  
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// Password strength validation
export const validatePasswordStrength = (password: string): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Amount validation for payments
export const validatePaymentAmount = (amount: number): boolean => {
  return typeof amount === 'number' && 
         Number.isInteger(amount) && 
         amount >= 100 && // $1 minimum
         amount <= 100000; // $1000 maximum
};

// Rate limiting validation
export const validateRateLimit = (
  lastRequests: number[], 
  maxRequests: number = 10, 
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const recentRequests = lastRequests.filter(time => now - time < windowMs);
  return recentRequests.length < maxRequests;
};

// Content-Security-Policy validation
export const validateCSP = (content: string): boolean => {
  // Check for inline scripts or dangerous content
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:\s*text\/html/i,
    /vbscript:/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(content));
};

// File upload validation
export const validateFileUpload = (file: File): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!file) {
    errors.push('File is required');
    return { isValid: false, errors };
  }
  
  if (file.size > maxSize) {
    errors.push('File size must be less than 5MB');
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type must be JPEG, PNG, GIF, or WebP');
  }
  
  return { isValid: errors.length === 0, errors };
};

// URL validation
export const validateUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Phone number validation (basic)
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};