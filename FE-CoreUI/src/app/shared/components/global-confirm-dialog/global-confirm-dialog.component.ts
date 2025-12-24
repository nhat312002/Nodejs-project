import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule, ModalModule } from '@coreui/angular';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-global-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ModalModule, ButtonModule],
  templateUrl: './global-confirm-dialog.component.html',
  styleUrl: './global-confirm-dialog.component.scss',
})

export class GlobalConfirmDialogComponent {
  // Inject the service to read the Signal
  public service = inject(ConfirmService);

  // Helper to handle backdrop click
  handleVisibleChange(event: boolean) {
    if (!event) {
      this.service.close(false); // Treat closing as "No"
    }
  }
}
