/**
 * Decorates the white-space block.
 * This block is primarily visual and controlled by CSS classes (variants).
 *
 * Variants:
 * - Sizes: small, medium, large, xlarge
 * - Colors: red, gray, white
 *
 * @param {Element} block The white-space block element
 */
export default function decorate(block) {
  // If the block has content, we treat it as a "quote" or "text" spacer
  const content = block.textContent.trim();
  
  if (content) {
    // Wrap text in a span for styling (lines, spacing)
    const textWrapper = document.createElement('span');
    textWrapper.className = 'white-space-text';
    textWrapper.textContent = content;
    
    block.textContent = '';
    block.appendChild(textWrapper);
    block.classList.add('has-text');
  } else {
    // If empty, ensure it is truly empty for the pure spacer variants
    block.textContent = '';
  }
}
