import { Component, inject, OnInit, signal } from '@angular/core';
import { NgStyle } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardGroupComponent,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  SpinnerComponent,
  AlertComponent,
} from '@coreui/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [FormsModule, ContainerComponent, RowComponent, ColComponent, CardGroupComponent, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, NgStyle, RouterLink, SpinnerComponent, AlertComponent]
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  username = '';
  email = '';
  password = '';

  returnUrl: string = '/';
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor() {
    const nav = this.router.currentNavigation();

    // Check if we came from Register Page with success flag
    if (nav?.extras.state?.['registrationSuccess']) {
      this.successMessage.set('Account created successfully! Please sign in.');
    }

  }
  ngOnInit() {

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }


  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Please enter both email and password.');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(''); // Clear previous errors

    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: () => {
          const target = this.returnUrl;

          if (target.startsWith('/') && !target.startsWith('//') && !target.startsWith('http')) {
            // Safe internal redirect
            this.router.navigateByUrl(target);
          } else {
            // Suspicious/External URL detected. Force redirect to Home.
            this.router.navigate(['/']);
          }

        },
        error: (err: any) => {
          console.error(err);
          const msg = err.error?.message || 'Login failed. Please check your credentials.';
          this.errorMessage.set(msg);
          this.isLoading.set(false);
        }
      });
  }
}
