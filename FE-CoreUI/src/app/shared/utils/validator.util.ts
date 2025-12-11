import { Validators, AbstractControl, ValidationErrors } from '@angular/forms';

// ==========================================
// 1. CUSTOM VALIDATOR FUNCTIONS
// ==========================================

/**
 * Checks if a string contains only whitespace.
 * Returns { whitespace: true } if invalid.
 */
export function NoWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null; // Let Validators.required handle empty

  const isWhitespace = value.toString().trim().length === 0;
  return isWhitespace ? { whitespace: true } : null;
}

// ==========================================
// 2. REGEX PATTERNS
// ==========================================

export const AppPatterns = {
  // Letters (Unicode) + Spaces. No numbers, no symbols. Allow ' and -
  NAME: /^[\p{L}\s'-]+$/u,

  // Strict Email
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // 1 Upper, 1 Lower, 1 Digit, 1 Special
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?]).{8,255}$/
};

// ==========================================
// 3. COMPOSITE VALIDATORS (PRE-MADE ARRAYS)
// ==========================================

export const AppValidators = {
  fullName: [
    Validators.required,
    Validators.maxLength(255),
    Validators.pattern(AppPatterns.NAME),
    NoWhitespaceValidator // <--- Included automatically!
  ],
  email: [
    Validators.required,
    Validators.pattern(AppPatterns.EMAIL)
  ],
  password: [
    Validators.required,
    Validators.minLength(8),
    Validators.pattern(AppPatterns.PASSWORD)
  ],
  username: [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(255),
    NoWhitespaceValidator // <--- Included automatically!
  ]
};
