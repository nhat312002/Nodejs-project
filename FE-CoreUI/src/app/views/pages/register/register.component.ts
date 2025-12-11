import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule,
  AbstractControl, ValidationErrors
} from '@angular/forms';

// CoreUI Imports
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective, CardBodyComponent, CardComponent, ColComponent,
  ContainerComponent, FormControlDirective, FormDirective,
  InputGroupComponent, InputGroupTextDirective, RowComponent,
  FormFeedbackComponent, SpinnerComponent
} from '@coreui/angular';

// Services
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    ContainerComponent, RowComponent, ColComponent, CardComponent, CardBodyComponent,
    FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective,
    FormControlDirective, ButtonDirective, FormFeedbackComponent, SpinnerComponent
  ]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor() {
    this.form = this.fb.group({
      // 1. Full Name (Required by your Joi schema)
      full_name: ['', [Validators.required, Validators.maxLength(255)]],

      // 2. Username (Min 8 chars based on your Joi schema)
      username: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(255)]],

      // 3. Email
      email: ['', [Validators.required, Validators.email]],

      // 4. Password (Complex Regex)
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        // Regex: 1 Lower, 1 Upper, 1 Digit, 1 Special Char
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?]).{8,255}$/)
      ]],

      // 5. Confirm Password
      confirm_password: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Helper to determine state: True (Green), False (Red), Undefined (Neutral)
  getValidationState(controlName: string): boolean | undefined {
    const control = this.form.get(controlName);

    // If not touched yet, return undefined (Neutral style - Gray border)
    if (!control || !control.touched) {
      return undefined;
    }

    // If touched, return validity (Green or Red)
    return control.valid;
  }

  // Custom Validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirm = control.get('confirm_password');

    if (password && confirm && password.value !== confirm.value) {
      // Set error on the confirm field specifically so UI updates
      confirm.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Trigger UI red borders
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    // Remove confirm_password before sending
    const { confirm_password, ...payload } = this.form.value;

    this.authService.register(payload).subscribe({
      next: () => {
        alert('Registration successful! Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        // Extract Joi error message
        const msg = err.error?.data?.[0] || err.error?.message || 'Registration failed';
        this.errorMessage.set(msg);
      }
    });
  }
}
