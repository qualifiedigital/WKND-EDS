import { div, button, span } from '../../scripts/dom-helpers.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function openModal(overlay) {
  overlay.hidden = false;
  // Force reflow so transition triggers
  // eslint-disable-next-line no-unused-expressions
  overlay.offsetHeight;
  overlay.classList.add('open');
  document.body.classList.add('modal-open');

  // Focus the close button for accessibility
  const closeBtn = overlay.querySelector('.overlay-modal-close');
  if (closeBtn) closeBtn.focus();
}

function closeModal(overlay, modalId, isForced) {
  overlay.classList.remove('open');
  document.body.classList.remove('modal-open');

  if (isForced) {
    sessionStorage.setItem(`overlay-modal-dismissed-${modalId}`, 'true');
  }

  // Hide after transition completes
  const onEnd = () => { overlay.hidden = true; };
  overlay.addEventListener('transitionend', onEnd, { once: true });
  // Fallback in case transitionend doesn't fire
  setTimeout(onEnd, 350);
}

export default function decorate(block) {
  const rows = [...block.children];

  // Row 0: modal ID
  const modalId = rows[0]?.querySelector(':scope > div')?.textContent?.trim() || 'overlay-modal';

  // Row 1: modal content
  const contentCell = rows[1]?.querySelector(':scope > div');

  const isForced = block.classList.contains('forced');

  // Build the close button
  const closeBtn = button(
    {
      class: 'overlay-modal-close',
      type: 'button',
      'aria-label': 'Close',
    },
    span({ class: 'overlay-modal-close-icon' }, '\u00D7'),
  );

  // Build the modal body
  const modalBody = div({ class: 'overlay-modal-body' });
  if (contentCell) {
    moveInstrumentation(rows[1], modalBody);
    modalBody.append(...contentCell.childNodes);
  }

  // Build the dialog panel
  const dialog = div(
    { class: 'overlay-modal-dialog' },
    closeBtn,
    modalBody,
  );

  // Build the full overlay
  const overlay = div(
    {
      class: 'overlay-modal-overlay',
      id: modalId,
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Information',
    },
    dialog,
  );
  overlay.hidden = true;

  // Close handlers
  const close = () => closeModal(overlay, modalId, isForced);

  closeBtn.addEventListener('click', close);

  // Backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // Escape key
  const escHandler = (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      close();
    }
  };
  document.addEventListener('keydown', escHandler);

  // Hide original block rows
  rows.forEach((row) => { row.style.display = 'none'; });

  // Append overlay to body so it layers above everything
  document.body.append(overlay);

  // Trigger logic
  if (isForced) {
    const storageKey = `overlay-modal-dismissed-${modalId}`;
    if (!sessionStorage.getItem(storageKey)) {
      // Small delay to let page render first
      requestAnimationFrame(() => openModal(overlay));
    }
  } else {
    // Default: triggered by links pointing to #modalId
    document.querySelectorAll(`a[href="#${modalId}"]`).forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(overlay);
      });
    });
  }
}
