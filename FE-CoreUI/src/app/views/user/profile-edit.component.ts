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
    }).subscribe(() => {
      alert('Password changed successfully');
      this.passwordForm.reset();
    });
  }
}
