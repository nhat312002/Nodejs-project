import { Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

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

/**
 * Security Check: Explicitly blocks < and > to prevent basic XSS
 * Useful for fields where you allow many symbols but want to stop HTML.
 */
export function NoHtmlValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  // Check for < or >
  const hasHtmlChars = /[<>]/.test(value);
  return hasHtmlChars ? { xss: true } : null;
}

export function smartPatternValidator(pattern: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
        if (!value) return null;

    const virtualCleanValue = value.toString().trim().replace(/\s+/g, ' ');
    const isValid = pattern.test(virtualCleanValue);

    // Return null if valid, or standard 'pattern' error if invalid
    return isValid ? null : { pattern: true };
  };
}
// ==========================================
// 2. REGEX PATTERNS (STRICT MODE)
// ==========================================

export const AppPatterns = {
  // STRICT FULL NAME
  // 1. ^[\p{L}]+ : Must START with at least one letter (Unicode).
  // 2. (?: ... )*: Non-capturing group that can repeat.
  // 3. [\s'-]    : Allowed separators (Space, Apostrophe, Hyphen).
  // 4. [\p{L}]+  : Separator MUST be followed by letters.
  // Result: "Jean-Luc" (OK), "O'Connor" (OK), "---" (Fail), "Name-" (Fail)
  NAME: /^[\p{L}]+(?:[\s'-][\p{L}]+)*$/u,

  // LANGUAGE NAME
  // Similar to Name, but allows parentheses for things like "Chinese (Simplified)"
  // Structure: Letter -> (Separator -> Letter or Parentheses)
  LANGUAGE: /^[\p{L}]+(?:[\s'-][\p{L}()]+)*$/u,

  // CATEGORY NAME

  CATEGORY: /^(?=.*[\p{L}\p{N}])[\p{L}\p{N}.+#&'-]+(?:\s+[\p{L}\p{N}.+#&'-]+)*$/u,

  // Strict Email
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // Password (1 Upper, 1 Lower, 1 Digit, 1 Special, No spaces)
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?])\S{8,255}$/,

  USERNAME: /^[a-zA-Z0-9]+(?:[._][a-zA-Z0-9]+)*$/,
};
// ==========================================
// 3. COMPOSITE VALIDATORS (PRE-MADE ARRAYS)
// ==========================================

export const AppValidators = {
  fullName: [
    Validators.required,
    Validators.maxLength(50),
    // Validators.pattern(AppPatterns.NAME),
    // NoWhitespaceValidator // <--- Included automatically!
    smartPatternValidator(AppPatterns.NAME)
  ],
  // Language Name (e.g., "Tiếng Việt", "English (US)")
  languageName: [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(50),
    smartPatternValidator(AppPatterns.LANGUAGE),
    NoWhitespaceValidator
  ],

  // Category Name (e.g., "C# Programming", "Travel")
  categoryName: [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(50),
    smartPatternValidator(AppPatterns.CATEGORY),
    NoWhitespaceValidator
  ],
  email: [
    Validators.required,
    Validators.maxLength(50),
    Validators.pattern(AppPatterns.EMAIL)
  ],
  password: [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(200),
    Validators.pattern(AppPatterns.PASSWORD)
  ],
  username: [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(50),
    smartPatternValidator(AppPatterns.USERNAME),
    NoWhitespaceValidator // <--- Included automatically!
  ]
};
