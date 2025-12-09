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
    // Assume first child is header, rest is content
    const [header, ...contentEls] = item.children;
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
        items.forEach((other, i) => {
          if (other !== item) {
            other.classList.remove('open');
            other.querySelector('.accordion-content').style.display = 'none';
            other.querySelector('.accordion-header').setAttribute('aria-expanded', false);
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
  });
}
