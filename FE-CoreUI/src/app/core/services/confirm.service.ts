import { inject, Injectable, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  color?: string; // 'danger', 'primary', 'warning'
  hideCancel?: boolean; // <--- ADD THIS

}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private router = inject(Router);
  // 1. State Signal (Controls the UI)
  state = signal<{
    visible: boolean;
    options: ConfirmOptions;
  }>({
    visible: false,
    options: { message: '' }
  });

   constructor() {
    // --- GLOBAL CLEANUP LISTENER ---
    // This catches: Links, Back Button, Forward Button, Redirects
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(() => {
      // Force close the modal if we are moving to another page
      if (this.state().visible) {
        this.close(false);
      }
    });
  }
  // 2. The Resolver (Stores the pending Promise)
  private resolveRef: ((result: boolean) => void) | null = null;

  // 3. The Public Method (Components call this)
  ask(options: ConfirmOptions): Promise<boolean> {
    // Show the modal
    this.state.set({
      visible: true,
      options: {
        title: options.title || 'Confirm Action',
        message: options.message,
        confirmText: options.confirmText || 'Yes',
        cancelText: options.cancelText || 'Cancel',
        color: options.color || 'primary',
        hideCancel: options.hideCancel || false // Default to showing it
      }
    });

    // Return a new Promise that waits for the user
    return new Promise((resolve) => {
      this.resolveRef = resolve;
    });
  }

  alert(options: ConfirmOptions): Promise<void> {
    // Force hideCancel to true
    return this.ask({
      ...options,
      title: options.title || 'Alert',
      confirmText: options.confirmText || 'OK', // Default to "OK"
      color: options.color || 'primary',
      hideCancel: true
    }).then(() => { }); // Return void, we don't care about true/false
  }

  // 4. Internal Methods (Called by the Component HTML)
  close(result: boolean) {
    this.state.update(s => ({ ...s, visible: false }));

    if (this.resolveRef) {
      this.resolveRef(result);
      this.resolveRef = null;
    }
  }
}
