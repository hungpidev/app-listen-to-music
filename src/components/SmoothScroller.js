export class SmoothScroller {
  constructor(container, duration = 2000) {
    this.container = container;
    this.duration = duration;
  }

  isElementInView(element) {
    const containerRect = this.container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    return (
      elementRect.top >= containerRect.top &&
      elementRect.bottom <= containerRect.bottom
    );
  }

  scrollToCenter(element) {
    if (this.isElementInView(element)) {
      return; // Không cần cuộn nếu phần tử đã nằm trong tầm nhìn
    }

    const containerRect = this.container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const offsetTop = elementRect.top - containerRect.top;
    const targetScrollTop =
      this.container.scrollTop +
      offsetTop -
      (containerRect.height / 2 - elementRect.height / 2);

    const startScrollTop = this.container.scrollTop;
    const distance = targetScrollTop - startScrollTop;
    const startTime = performance.now();

    const smoothScroll = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / this.duration, 1);

      const easing =
        progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;

      this.container.scrollTop = startScrollTop + distance * easing;

      if (progress < 1) {
        window.requestAnimationFrame(smoothScroll);
      }
    };

    window.requestAnimationFrame(smoothScroll);
  }
}
