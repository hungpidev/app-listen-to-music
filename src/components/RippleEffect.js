export class RippleEffect {
  constructor(element, options = {}) {
    this.element = element;
    this.backgroundColor = options.backgroundColor || "#738392";
    this.scale = options.scale || 2;
    this.duration = options.duration || 300;
    this.init();
  }

  init() {
    this.element.style.position = "relative";
    this.element.style.overflow = "hidden";
    this.element.addEventListener("mousedown", this.createRipple.bind(this));
  }

  createRipple(event) {
    const rect = this.element.getBoundingClientRect();
    const ripple = document.createElement("span");

    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.position = "absolute";
    ripple.style.borderRadius = "50%";
    ripple.style.backgroundColor = this.backgroundColor;
    ripple.style.transform = "scale(0)";
    ripple.style.transition = `transform ${this.duration}ms ease, opacity ${this.duration}ms ease`;
    ripple.style.pointerEvents = "none"; // Prevent ripple from interfering with click events
    ripple.style.zIndex = "0"; // Make sure the ripple is below the text

    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    this.element.appendChild(ripple);

    // Start ripple effect
    requestAnimationFrame(() => {
      ripple.style.transform = `scale(${this.scale})`;
    });

    // Remove ripple on mouseup
    const removeRipple = () => {
      ripple.style.opacity = "0";
      ripple.addEventListener("transitionend", () => {
        ripple.remove();
      });
      this.element.removeEventListener("mouseup", removeRipple);
      this.element.removeEventListener("mouseleave", removeRipple);
    };

    this.element.addEventListener("mouseup", removeRipple);
    this.element.addEventListener("mouseleave", removeRipple);
  }
}
