// src/utils/validation.ts

export const validatePhone = (phone: string): boolean => {
  // International phone number validation (E.164 format)
  // Allows for an optional '+' prefix and 1 to 14 digits.
  return /^\+?[1-9]\d{1,14}$/.test(phone)
}

export const validateEmail = (email: string): boolean => {
  // RFC 5322 compliant email validation
  // This regex is a common compromise for client-side validation:
  // It's more robust than simple checks but less complex than full RFC 5322.
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
}

export const sanitizeInput = (input: string): string => {
  // Basic XSS prevention: removes HTML tags and trims whitespace.
  // For more robust sanitization, consider a dedicated library.
  return input.trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>?/gm, '') // Remove any HTML tags
    .replace(/&/g, '&amp;') // Encode &
    .replace(/</g, '&lt;')   // Encode <
    .replace(/>/g, '&gt;')   // Encode >
    .replace(/"/g, '&quot;') // Encode "
    .replace(/'/g, '&#039;') // Encode '
}