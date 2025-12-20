import { Component, inject, OnInit } from '@angular/core';
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
  RowComponent
} from '@coreui/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [FormsModule, ContainerComponent, RowComponent, ColComponent, CardGroupComponent, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, NgStyle, RouterLink]
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  username = '';
  email = '';
  password = '';

  returnUrl: string = '/';

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }


  onLogin() {
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
          alert('Login failed');
        }
      });
  }
}
