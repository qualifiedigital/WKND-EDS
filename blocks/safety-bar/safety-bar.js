import { div, button, span } from '../../scripts/dom-helpers.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];
  const collapsedRow = rows[0];
  const expandedRow = rows[1];

  // Extract content from rows
  const collapsedContent = collapsedRow?.querySelector(':scope > div');
  const expandedContent = expandedRow?.querySelector(':scope > div');

  // Build the header with toggle button
  const toggleBtn = button(
    {
      class: 'safety-bar-toggle',
      type: 'button',
      'aria-expanded': 'false',
      'aria-label': 'Expand safety information',
    },
    span({ class: 'safety-bar-icon' }),
  );

  const header = div(
    { class: 'safety-bar-header' },
    span({ class: 'safety-bar-title' }, 'Important Safety Information'),
    toggleBtn,
  );

  // Build collapsed section
  const collapsedSection = div({ class: 'safety-bar-collapsed' });
  if (collapsedContent) {
    moveInstrumentation(collapsedRow, collapsedSection);
    collapsedSection.append(...collapsedContent.childNodes);
  }

  // Build expanded section
  const expandedSection = div({ class: 'safety-bar-expanded' });
  expandedSection.hidden = true;
  if (expandedContent) {
    moveInstrumentation(expandedRow, expandedSection);
    expandedSection.append(...expandedContent.childNodes);
  }

  // Toggle behavior
  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    toggleBtn.setAttribute('aria-label', isExpanded ? 'Expand safety information' : 'Collapse safety information');
    collapsedSection.hidden = !isExpanded;
    expandedSection.hidden = isExpanded;
    block.classList.toggle('expanded', !isExpanded);
  });

  // Replace block content
  block.textContent = '';
  block.append(header, collapsedSection, expandedSection);

  // Add padding to main so fixed bar doesn't overlap content
  const mainEl = document.querySelector('main');
  if (mainEl) {
    const observer = new ResizeObserver(() => {
      const barHeight = block.closest('.safety-bar-container')?.offsetHeight || block.offsetHeight;
      mainEl.style.paddingBottom = `${barHeight}px`;
    });
    observer.observe(block);
  }
}
