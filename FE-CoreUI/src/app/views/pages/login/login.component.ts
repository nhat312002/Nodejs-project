import { Component, inject } from '@angular/core';
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
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [FormsModule, ContainerComponent, RowComponent, ColComponent, CardGroupComponent, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, NgStyle]
})
export class LoginComponent {
  private authService = inject(AuthService);

  username = '';
  email = '';
  password = '';

  onLogin() {
    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: () => console.log('Login success'),
        error: (err : any) => {
          console.error(err);
          alert('Login failed');
        }
      });
  }
}
