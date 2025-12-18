import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
// import { TranslateModule } from '@ngx-translate/core';
import {
  ContainerComponent, ButtonDirective, DropdownModule, AvatarModule, NavbarModule
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

import { LanguageService } from '../../core/services/language.service';
import { AuthService } from '../../core/services/auth.service';
import { ImgUrlPipe } from '../../shared/pipes/img-url.pipe';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, // TranslateModule,
    ContainerComponent, ButtonDirective, DropdownModule, AvatarModule, NavbarModule,
    IconDirective,
    // ImgUrlPipe
  ],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.scss'
})
export class ClientLayoutComponent implements OnInit {
  public langService = inject(LanguageService);
  public authService = inject(AuthService);
  private router = inject(Router);

   handleSignIn(event: Event) {
    const accessToken = this.authService.getAccessToken();
    const refreshToken = this.authService.getRefreshToken();

    // SCENARIO 1: Access Token is valid
    // Action: Log in immediately (Update UI)
    if (accessToken && !this.authService.isAccessTokenExpired()) {
      event.preventDefault(); // Stop navigation
      this.authService.loadUserFromToken();
      return;
    }

    // SCENARIO 2: Access Token Expired, but Refresh Token Exists
    // Action: Stop navigation -> Try Refresh -> If success (Stay) -> If fail (Go to Login)
    if (refreshToken) {
      event.preventDefault(); // Stop navigation immediately while we check

      this.authService.refreshToken().subscribe({
        next: () => {
          // Refresh Success!
          // The service already updated the signals inside the 'tap' operator.
          // The UI will switch to "Logged In" automatically.
          console.log('Session restored via Refresh Token');
        },
        error: () => {
          // Refresh Failed (Token revoked/expired)
          // Now we manually force the user to the login page
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    // SCENARIO 3: No Tokens
    // Action: Do nothing. Let routerLink take user to /login.
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    // this.langService.initLanguages();
  }

  logout() {
    this.authService.logout();
  }
}
