import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';

// CoreUI
import {
  CardModule, FormModule, ButtonDirective, SpinnerModule,
  GridModule, AlertModule
} from '@coreui/angular';

// Phone Library
import { NgxIntlTelInputModule, CountryISO, SearchCountryField, PhoneNumberFormat } from 'ngx-intl-tel-input';

// Shared
import { UserProfileService } from '../../core/services/user-profile.service';
import { AppValidators } from '../../shared/utils/validator.util';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    CardModule, FormModule, ButtonDirective, SpinnerModule, GridModule, AlertModule,
    NgxIntlTelInputModule
  ],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss'
})
export class ProfileEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(UserProfileService);

  // --- PHONE CONFIG ---
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.Vietnam, CountryISO.UnitedStates];

  // --- STATE ---
  isLoading = signal(false);

  // Feedback Messages (Success/Error)
  profileMessage = signal<{type: string, text: string} | null>(null);
  passwordMessage = signal<{type: string, text: string} | null>(null);

  // --- FORMS ---

  // 1. Personal Info
  profileForm = this.fb.group({
    fullName: ['', AppValidators.fullName], // Uses strict regex
    phone: ['', [Validators.required]] // Library handles format validation
  });

  // 2. Password
  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', AppValidators.password], // Uses strict regex (1 Upper, 1 Special...)
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatch });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.profileService.getProfile().subscribe({
      next: (res) => {
        if (res.success) {
          const user = res.data;
          this.profileForm.patchValue({
            fullName: user.full_name,
            phone: user.phone // Format: "+84..."
          });
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  passwordMatch(control: AbstractControl) {
    const pass = control.get('newPassword')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  // --- ACTIONS ---

  updateProfile() {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) return;

    this.isLoading.set(true);
    this.profileMessage.set(null);

    // Extract phone string from object
    const formVal = this.profileForm.value;
    const phoneValue = formVal.phone ? (formVal.phone as any).e164Number : '';

    this.profileService.updateProfile({
      fullName: formVal.fullName || '',
      phone: phoneValue
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.profileMessage.set({ type: 'success', text: 'Profile updated successfully.' });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.profileMessage.set({ type: 'danger', text: err.error?.message || 'Failed to update.' });
      }
    });
  }

  changePassword() {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) return;

    this.isLoading.set(true);
    this.passwordMessage.set(null);

    this.profileService.changePassword({
      currentPassword: this.passwordForm.value.currentPassword!,
      newPassword: this.passwordForm.value.newPassword!
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.passwordMessage.set({ type: 'success', text: 'Password changed successfully.' });
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isLoading.set(false);
        // Handle array errors from Joi
        let msg = 'Failed to change password';
        if (err.error?.data?.[0]) msg = err.error.data[0];
        else if (err.error?.message) msg = err.error.message;

        this.passwordMessage.set({ type: 'danger', text: msg });
      }
    });
  }
}
