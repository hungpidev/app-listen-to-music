export class RangeControl {
  constructor(container, options = {}) {
    this.container = container;
    this.thumb = container.querySelector(".slider-thumb");
    this.fill = container.querySelector(".slider-fill");
    this.valueDisplay = options.valueDisplay || null;
    this.minValue = options.minValue || 0;
    this.maxValue = options.maxValue || 100;
    this.stepValue = options.stepValue || 0.001;
    this.currentValue = options.initialValue || 0;
    this.isDragging = false;
    this.onDragStart = options.onDragStart || (() => {});
    this.onDragEnd = options.onDragEnd || (() => {});
    this.onInput = options.onInput || (() => {});

    this.init();
  }

  setRangeValue(value, triggerInput = true) {
    value = Math.round(value / this.stepValue) * this.stepValue;
    value = Math.max(this.minValue, Math.min(this.maxValue, value));
    const percent =
      ((value - this.minValue) / (this.maxValue - this.minValue)) * 100;

    this.thumb.style.left = `calc(${percent}% - ${
      this.thumb.offsetWidth / 2
    }px)`;

    this.fill.style.width = `${percent}%`;

    if (this.valueDisplay) {
      this.valueDisplay.textContent = value;
    }
    this.container.setAttribute("aria-valuenow", value);
    this.currentValue = value;

    // Gọi onInput liên tục khi giá trị thay đổi
    if (triggerInput && this.onInput) {
      this.onInput(value);
    }
  }

  init() {
    this.setRangeValue(this.currentValue, false);
    this.container.addEventListener("mousedown", this.startDragging.bind(this));
    this.container.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  getMouseValue(e) {
    let rect = this.container.getBoundingClientRect();
    let offsetX = e.clientX - rect.left;
    let value =
      this.minValue + (offsetX / rect.width) * (this.maxValue - this.minValue);
    return value;
  }

  startDragging(e) {
    this.isDragging = true;
    this.setRangeValue(this.getMouseValue(e));
    if (this.onDragStart) this.onDragStart();
    document.addEventListener("mousemove", this.onMouseMove.bind(this));
    document.addEventListener("mouseup", this.stopDragging.bind(this));
  }

  onMouseMove(e) {
    if (!this.isDragging) return;
    this.setRangeValue(this.getMouseValue(e)); // Gọi onInput mỗi khi mousemove xảy ra
  }

  stopDragging(e) {
    if (this.isDragging) {
      if (this.onDragEnd) this.onDragEnd(this.currentValue);
    }
    this.isDragging = false;
    document.removeEventListener("mousemove", this.onMouseMove.bind(this));
    document.removeEventListener("mouseup", this.stopDragging.bind(this));
  }

  handleKeyDown(e) {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      this.setRangeValue(this.currentValue - this.stepValue);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      this.setRangeValue(this.currentValue + this.stepValue);
    }
  }
}
