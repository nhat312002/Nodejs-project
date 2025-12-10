import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
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
    ImgUrlPipe
  ],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.scss'
})
export class ClientLayoutComponent implements OnInit {
  public langService = inject(LanguageService);
  public authService = inject(AuthService);

  ngOnInit() {
    // this.langService.initLanguages();
  }

  logout() {
    this.authService.logout();
  }
}
