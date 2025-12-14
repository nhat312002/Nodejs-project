import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule,
  AbstractControl, ValidationErrors,
  FormControl
} from '@angular/forms';
// import { FormInputComponent } from '../../../shared/components/form-input/form-input.component';
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

import { AppValidators } from '../../../shared/utils/validator.util';
@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    ContainerComponent, RowComponent, ColComponent, CardComponent, CardBodyComponent,
    InputGroupComponent, InputGroupTextDirective, IconDirective,
    FormControlDirective, ButtonDirective, FormFeedbackComponent, SpinnerComponent,
    // FormInputComponent
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
      // Use the Shared Validators
      full_name: ['', AppValidators.fullName],
      username: ['', AppValidators.username],
      email: ['', AppValidators.email],
      password: ['', AppValidators.password],
      confirm_password: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  getControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
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
