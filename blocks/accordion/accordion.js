/**
 * Accordion block: expands/collapses sections for grouped content.
 * Supports single/multi open and all-collapsed-by-default behaviors.
 *
 * @param {Element} block The accordion block element
 */
export default function decorate(block) {
  // Read block options
  const behavior = block.classList.contains('single') ? 'single' : 'multi';
  const allCollapsed = block.classList.contains('collapsed');

  // Find all accordion items (direct children)
  const items = Array.from(block.children);

  items.forEach((item, idx) => {
    item.classList.add('accordion-item');
    // Title is the first element, Content is the rest
    const [header, ...contentEls] = item.children;

    if (header) {
      header.classList.add('accordion-header');
      const content = document.createElement('div');
      content.className = 'accordion-content';
      content.append(...contentEls);
      item.appendChild(content);

      if (allCollapsed || (behavior === 'single' && idx > 0)) {
        content.style.display = 'none';
        item.classList.remove('open');
      } else {
        item.classList.add('open');
      }

      header.tabIndex = 0;
      header.setAttribute('role', 'button');
      header.setAttribute('aria-expanded', !content.style.display || content.style.display !== 'none');

      header.addEventListener('click', () => {
        const isOpen = item.classList.toggle('open');
        content.style.display = isOpen ? '' : 'none';
        header.setAttribute('aria-expanded', isOpen);
        if (behavior === 'single' && isOpen) {
          items.forEach((other) => {
            if (other !== item) {
              other.classList.remove('open');
              const otherContent = other.querySelector('.accordion-content');
              if (otherContent) otherContent.style.display = 'none';
              const otherHeader = other.querySelector('.accordion-header');
              if (otherHeader) otherHeader.setAttribute('aria-expanded', false);
            }
          });
        }
      });

      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          header.click();
          e.preventDefault();
        }
      });
    }
  });
}
