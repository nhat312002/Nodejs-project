import { AbstractControl, ValidationErrors } from '@angular/forms';

export function NoWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  // 1. If empty or null, pass (Let Validators.required handle empty)
  if (!value) {
    return null;
  }

  // 2. Check if the string is ONLY spaces
  const isWhitespace = value.toString().trim().length === 0;

  // 3. Return error if true
  return isWhitespace ? { whitespace: true } : null;
}
