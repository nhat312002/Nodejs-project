import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl
} from '@angular/forms';
import { UserProfileService } from '../../core/services/user-profile.service';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss'
})
export class ProfileEditComponent {

  profileService = inject(UserProfileService);

  profileForm = new FormGroup({
    fullName: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required)
  });

  passwordForm = new FormGroup({
    currentPassword: new FormControl('', Validators.required),
    newPassword: new FormControl('', Validators.minLength(6)),
    confirmPassword: new FormControl('', Validators.required)
  }, { validators: this.passwordMatch });

  passwordMatch(group: AbstractControl) {
    const pass = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  updateProfile() {
    if (this.profileForm.invalid) return;
    this.profileService.updateProfile(this.profileForm.value as any)
      .subscribe(() => alert('Your information has been updated successfully'));
  }

  changePassword() {
    if (this.passwordForm.invalid) return;
    this.profileService.changePassword({
      currentPassword: this.passwordForm.value.currentPassword!,
      newPassword: this.passwordForm.value.newPassword!
    }).subscribe({
      next: () => {
        alert('Password changed successfully');
        this.passwordForm.reset();
      },
      error: (err) => {
        console.error(err);

        let msg = 'Failed to change password';

        // 1. Check for Validation Array in 'data' (e.g. 422 errors)
        if (err.error?.data && Array.isArray(err.error.data) && err.error.data.length > 0) {
          // Grab the first error message from the array
          msg = err.error.data[0];
        }
        // 2. Check for generic 'message' (e.g. 400/401 errors)
        else if (err.error?.message) {
          msg = err.error.message;
        }

        alert(msg);
      }
    });
  }
}
