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
  // The block is a visual separator. We clear any content text
  // that might have been added by the author (like "Small" or "50px")
  // to ensures it renders as a pure clean space.
  block.textContent = '';
}
