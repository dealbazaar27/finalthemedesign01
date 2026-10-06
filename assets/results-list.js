import { mediaQueryLarge, requestIdleCallback, startViewTransition } from '@theme/utilities';
import PaginatedList from '@theme/paginated-list';

/**
 * A custom element that renders a pagniated results list
 */
export default class ResultsList extends PaginatedList {
  connectedCallback() {
    super.connectedCallback();

    mediaQueryLarge.addEventListener('change', this.#handleMediaQueryChange);
    this.setAttribute('initialized', '');

    const viewport = mediaQueryLarge.matches ? 'desktop' : 'mobile';
    const storedValue = sessionStorage.getItem(`product-grid-view-${viewport}`);
    const defaultValue = viewport === 'desktop' ? 'zoom-out' : 'default';
    const activeValue = storedValue || defaultValue;

    this.#setLayout(activeValue);

    const defaultInput = this.querySelector(`input[name="grid"][value="${activeValue}"]`);
    if (defaultInput instanceof HTMLInputElement) {
      defaultInput.checked = true;
    }
  }

  disconnectedCallback() {
    mediaQueryLarge.removeEventListener('change', this.#handleMediaQueryChange);
  }

  /**
   * Updates the layout.
   *
   * @param {Event} event
   */
  updateLayout({ target }) {
    if (!(target instanceof HTMLInputElement)) return;

    this.#animateLayoutChange(target.value);
  }

  /**
   * Sets the layout.
   *
   * @param {string} value
   */
  #animateLayoutChange = async (value) => {
    const { grid } = this.refs;

    if (!grid) return;

    await startViewTransition(() => this.#setLayout(value), ['product-grid']);

    requestIdleCallback(() => {
      const viewport = mediaQueryLarge.matches ? 'desktop' : 'mobile';
      sessionStorage.setItem(`product-grid-view-${viewport}`, value);
    });
  };

  /**
   * Animates the layout change.
   *
   * @param {string} value
   */
  #setLayout(value) {
    const { grid } = this.refs;
    if (!grid) return;
    grid.setAttribute('product-grid-view', value);
  }

  /**
   * Handles the media query change event.
   *
   * @param {MediaQueryListEvent} event
   */
  #handleMediaQueryChange = (event) => {
    const viewport = event.matches ? 'desktop' : 'mobile';
    const storedValue = sessionStorage.getItem(`product-grid-view-${viewport}`);
    const defaultValue = viewport === 'desktop' ? 'zoom-out' : 'default';
    const activeValue = storedValue || defaultValue;

    const targetElement = this.querySelector(`input[name="grid"][value="${activeValue}"]`);
    if (targetElement instanceof HTMLInputElement) {
      targetElement.checked = true;
    }

    this.#setLayout(activeValue);
  };
}

if (!customElements.get('results-list')) {
  customElements.define('results-list', ResultsList);
}
