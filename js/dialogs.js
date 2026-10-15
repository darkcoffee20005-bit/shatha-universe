/**
 * Shared behaviour for native <dialog> elements: close buttons, backdrop
 * click, focus return, and a promise-based confirm dialog.
 * Escape-to-close is provided natively by showModal().
 */

/** Wire a dialog once. `[data-close]` buttons close it. */
export function setupDialog(dialog) {
  if (!dialog || dialog.dataset.wired) return;
  dialog.dataset.wired = 'true';
  dialog.addEventListener('click', (event) => {
    // A click on the ::backdrop targets the dialog element itself.
    if (event.target === dialog) dialog.close('backdrop');
    if (event.target.closest('[data-close]')) dialog.close('button');
  });
}

/** Open as modal and return focus to `returnTo` when it closes. */
export function openDialog(dialog, returnTo = document.activeElement) {
  if (!dialog.open) {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }
  dialog.addEventListener(
    'close',
    () => {
      if (returnTo?.isConnected) returnTo.focus({ preventScroll: true });
    },
    { once: true },
  );
}

export function closeDialog(dialog) {
  if (dialog?.open) dialog.close();
}

/** Resolve true/false from the confirm dialog in index.html. */
export function confirmDialog(dialog, { title, message, yes, no }) {
  setupDialog(dialog);
  dialog.querySelector('[data-confirm-title]').textContent = title;
  dialog.querySelector('[data-confirm-text]').textContent = message;
  const yesBtn = dialog.querySelector('[data-confirm-yes]');
  const noBtn = dialog.querySelector('[data-confirm-no]');
  yesBtn.textContent = yes;
  noBtn.textContent = no;

  return new Promise((resolve) => {
    const controller = new AbortController();
    const { signal } = controller;
    yesBtn.addEventListener('click', () => dialog.close('yes'), { signal });
    noBtn.addEventListener('click', () => dialog.close('no'), { signal });
    dialog.addEventListener(
      'close',
      () => {
        controller.abort();
        resolve(dialog.returnValue === 'yes');
      },
      { signal },
    );
    dialog.returnValue = '';
    openDialog(dialog);
    noBtn.focus();
  });
}
