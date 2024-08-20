export class Scrollbar {
  constructor(container, content) {
    this.container = container;
    this.content = content;
    this.scrollbar = this.createScrollbar();
    this.thumb = this.createThumb();
    this.dragging = false;
    this.hideTimeout = null;

    this.container.appendChild(this.scrollbar);
    this.scrollbar.appendChild(this.thumb);

    this.updateThumbSize();
    this.addEventListeners();
  }

  createScrollbar() {
    const scrollbar = document.createElement("div");
    scrollbar.classList.add("custom-scrollbar");
    return scrollbar;
  }

  createThumb() {
    const thumb = document.createElement("div");
    thumb.classList.add("scroll-thumb");
    return thumb;
  }

  updateThumbSize() {
    const containerHeight = this.container.clientHeight;
    const contentHeight = this.content.scrollHeight;
    const thumbHeight = Math.max(
      (containerHeight / contentHeight) * containerHeight,
      30
    );
    this.thumb.style.height = `${thumbHeight}px`;
  }

  updateThumbPosition() {
    const scrollTop = this.content.scrollTop;
    const scrollHeight = this.content.scrollHeight;
    const containerHeight = this.container.clientHeight;
    const thumbTop = (scrollTop / scrollHeight) * containerHeight;
    this.thumb.style.top = `${thumbTop}px`;
  }

  addEventListeners() {
    this.thumb.addEventListener("mousedown", this.onDragStart.bind(this));
    document.addEventListener("mousemove", this.onDrag.bind(this));
    document.addEventListener("mouseup", this.onDragEnd.bind(this));

    this.content.addEventListener("scroll", () => {
      this.showScrollbar();
      this.updateThumbPosition();

      // Hide scrollbar after a delay
      clearTimeout(this.hideTimeout);
      this.hideTimeout = setTimeout(() => this.hideScrollbar(), 1000);
    });

    window.addEventListener("resize", () => {
      this.updateThumbSize();
      this.updateThumbPosition();
    });
  }

  showScrollbar() {
    this.scrollbar.style.opacity = "1";
  }

  hideScrollbar() {
    if (!this.dragging) {
      this.scrollbar.style.opacity = "0";
    }
  }

  onDragStart(event) {
    this.dragging = true;
    this.startY = event.clientY;
    this.startTop = parseInt(window.getComputedStyle(this.thumb).top, 10);
    this.showScrollbar();
  }

  onDrag(event) {
    if (!this.dragging) return;
    const deltaY = event.clientY - this.startY;
    const thumbTop = Math.min(
      Math.max(this.startTop + deltaY, 0),
      this.container.clientHeight - this.thumb.clientHeight
    );

    this.thumb.style.top = `${thumbTop}px`;

    const scrollRatio =
      thumbTop / (this.container.clientHeight - this.thumb.clientHeight);
    this.content.scrollTop =
      scrollRatio * (this.content.scrollHeight - this.container.clientHeight);
  }

  onDragEnd() {
    this.dragging = false;
    clearTimeout(this.hideTimeout);
    this.hideTimeout = setTimeout(() => this.hideScrollbar(), 1000);
  }
}
