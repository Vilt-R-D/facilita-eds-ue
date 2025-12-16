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
      // Create semantic h3 header and move only text content
      const h3Header = document.createElement('h3');
      h3Header.classList.add('accordion-header');
      h3Header.className = 'accordion-header';
      h3Header.textContent = header.textContent;
      header.replaceWith(h3Header);
      
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

      h3Header.tabIndex = 0;
      h3Header.setAttribute('role', 'button');
      h3Header.setAttribute('aria-expanded', !content.style.display || content.style.display !== 'none');

      h3Header.addEventListener('click', () => {
        const isOpen = item.classList.toggle('open');
        content.style.display = isOpen ? '' : 'none';
        h3Header.setAttribute('aria-expanded', isOpen);
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

      h3Header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          h3Header.click();
          e.preventDefault();
        }
      });
    }
  });
}
