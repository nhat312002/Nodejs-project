import { inject, DestroyRef } from '@angular/core';

export function useModalCleanup() {
  const destroyRef = inject(DestroyRef);

  destroyRef.onDestroy(() => {
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');

    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
  });
}
