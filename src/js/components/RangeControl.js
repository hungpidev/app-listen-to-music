export class RangeControl {
  constructor(container, options = {}) {
    this.container = container;
    this.thumb = container.querySelector(".slider-thumb");
    this.fill = container.querySelector(".slider-fill");
    this.valueDisplay = options.valueDisplay || null;
    this.minValue = options.minValue || 0;
    this.maxValue = options.maxValue || 100;
    this.currentValue = options.initialValue || 0;
    this.isDragging = false;
    this.onDragStart = options.onDragStart || (() => {});
    this.onDragEnd = options.onDragEnd || (() => {});
    this.onInput = options.onInput || (() => {});
    this.isVertical = options.isVertical || false;

    this.init();
  }

  setRangeValue(value, triggerInput = true) {
    value = Math.max(this.minValue, Math.min(this.maxValue, value));

    const percent =
      ((value - this.minValue) / (this.maxValue - this.minValue)) * 100;

    if (this.isVertical) {
      this.thumb.style.bottom = `${percent}%`;
      this.fill.style.height = `${percent}%`;
    } else {
      this.thumb.style.left = `${percent}%`;
      this.fill.style.width = `${percent}%`;
    }

    if (this.valueDisplay) {
      this.valueDisplay.textContent = value;
    }

    this.container.setAttribute("aria-valuenow", value);
    this.currentValue = value;

    if (triggerInput && this.onInput) {
      this.onInput(value);
    }
  }

  init() {
    this.setRangeValue(this.currentValue, false);

    this.container.addEventListener("mousedown", this.startDragging.bind(this));
    this.container.addEventListener(
      "touchstart",
      this.startTouchDragging.bind(this),
      { passive: false }
    );
    this.container.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  getMouseValue(e) {
    const rect = this.container.getBoundingClientRect();
    const offset = this.isVertical
      ? rect.bottom - e.clientY
      : e.clientX - rect.left;
    const dimension = this.isVertical ? rect.height : rect.width;
    const value =
      this.minValue + (offset / dimension) * (this.maxValue - this.minValue);
    return value;
  }

  getTouchValue(e) {
    const rect = this.container.getBoundingClientRect();
    const offset = this.isVertical
      ? rect.bottom - e.touches[0].clientY
      : e.touches[0].clientX - rect.left;
    const dimension = this.isVertical ? rect.height : rect.width;
    const value =
      this.minValue + (offset / dimension) * (this.maxValue - this.minValue);
    return value;
  }

  startDragging(e) {
    e.preventDefault();
    this.isDragging = true;
    this.setRangeValue(this.getMouseValue(e));
    if (this.onDragStart) this.onDragStart();
    document.addEventListener("mousemove", this.onMouseMove.bind(this));
    document.addEventListener("mouseup", this.stopDragging.bind(this));
  }

  startTouchDragging(e) {
    if (e.cancelable) e.preventDefault();
    this.isDragging = true;
    this.setRangeValue(this.getTouchValue(e));
    if (this.onDragStart) this.onDragStart();
    document.addEventListener("touchmove", this.onTouchMove.bind(this), {
      passive: false,
    });
    document.addEventListener("touchend", this.stopTouchDragging.bind(this));
  }

  onMouseMove(e) {
    if (!this.isDragging) return;
    this.setRangeValue(this.getMouseValue(e));
  }

  onTouchMove(e) {
    if (!this.isDragging) return;
    if (e.cancelable) e.preventDefault();
    this.setRangeValue(this.getTouchValue(e));
  }

  stopDragging() {
    if (this.isDragging && this.onDragEnd) {
      this.onDragEnd(this.currentValue);
    }
    this.isDragging = false;
    document.removeEventListener("mousemove", this.onMouseMove.bind(this));
    document.removeEventListener("mouseup", this.stopDragging.bind(this));
  }

  stopTouchDragging() {
    if (this.isDragging && this.onDragEnd) {
      this.onDragEnd(this.currentValue);
    }
    this.isDragging = false;
    document.removeEventListener("touchmove", this.onTouchMove.bind(this));
    document.removeEventListener("touchend", this.stopTouchDragging.bind(this));
  }

  handleKeyDown(e) {
    const increment = (this.maxValue - this.minValue) / 100;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      this.setRangeValue(this.currentValue - increment);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      this.setRangeValue(this.currentValue + increment);
    }
  }
}
