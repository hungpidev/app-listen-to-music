export class Scrollbar {
  constructor(container, content) {
    this.container = container;
    this.content = content;
    this.scrollbar = null;
    this.thumb = null;
    this.dragging = false;
    this.hideTimeout = null;

    this.createScrollbar();
    this.addEventListeners();
    this.observeContentHeight();
    this.observeContainerVisibility();
  }

  createScrollbar() {
    if (!this.scrollbar) {
      this.scrollbar = document.createElement("div");
      this.scrollbar.classList.add("custom-scrollbar");

      this.thumb = document.createElement("div");
      this.thumb.classList.add("scroll-thumb");

      this.scrollbar.appendChild(this.thumb);
      this.container.appendChild(this.scrollbar);
    }

    this.updateThumbSize();
  }

  updateThumbSize() {
    const containerHeight = this.container.clientHeight;
    const contentHeight = this.content.scrollHeight;

    if (contentHeight <= containerHeight) {
      this.removeScrollbarFromDOM();
      return;
    }

    const thumbHeight = Math.max(
      (containerHeight / contentHeight) * containerHeight,
      30
    );
    this.thumb.style.height = `${thumbHeight}px`;
    this.showScrollbar(); // Hiển thị thanh cuộn nếu có nội dung để cuộn
  }

  updateThumbPosition() {
    const containerHeight = this.container.clientHeight;
    const contentHeight = this.content.scrollHeight;

    if (contentHeight <= containerHeight) {
      this.removeScrollbarFromDOM();
      return;
    }

    const scrollTop = this.content.scrollTop;
    const thumbTop = (scrollTop / contentHeight) * containerHeight;
    this.thumb.style.top = `${thumbTop}px`;
  }

  addEventListeners() {
    if (this.scrollbar) {
      this.thumb.addEventListener("mousedown", this.onDragStart.bind(this));
      document.addEventListener("mousemove", this.onDrag.bind(this));
      document.addEventListener("mouseup", this.onDragEnd.bind(this));
    }

    this.content.addEventListener("scroll", () => {
      if (!this.isContainerVisible()) {
        this.removeScrollbarFromDOM();
        return;
      }

      this.createScrollbar();
      this.updateThumbPosition();

      clearTimeout(this.hideTimeout);
      this.hideTimeout = setTimeout(() => this.hideScrollbar(), 1000);
    });

    window.addEventListener("resize", () => {
      this.createScrollbar();
      this.updateThumbSize();
      this.updateThumbPosition();
    });

    document.addEventListener("click", () => {
      if (!this.isContainerVisible()) {
        this.removeScrollbarFromDOM();
      }
    });
  }

  observeContentHeight() {
    const resizeObserver = new ResizeObserver(() => {
      if (!this.isContainerVisible()) {
        this.removeScrollbarFromDOM();
        return;
      }
      this.createScrollbar();
      this.updateThumbSize();
      this.updateThumbPosition();
    });

    resizeObserver.observe(this.content);
    resizeObserver.observe(this.container);
  }

  observeContainerVisibility() {
    const observer = new MutationObserver(() => {
      const containerHeight = this.container.clientHeight;
      const contentHeight = this.content.scrollHeight;

      if (contentHeight <= containerHeight) {
        this.removeScrollbarFromDOM();
      } else {
        this.createScrollbar();
        this.updateThumbSize();
        this.updateThumbPosition();
      }
    });

    observer.observe(this.container, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
  }

  isContainerVisible() {
    return window.getComputedStyle(this.container).display !== "none";
  }

  showScrollbar() {
    if (this.scrollbar) {
      this.scrollbar.style.opacity = "1";
      this.scrollbar.style.visibility = "visible";
      this.thumb.style.opacity = "1";
      this.thumb.style.visibility = "visible";
    }
  }

  hideScrollbar() {
    if (!this.dragging && this.scrollbar) {
      this.scrollbar.style.opacity = "0";
      this.scrollbar.style.visibility = "hidden";
      this.thumb.style.opacity = "0";
      this.thumb.style.visibility = "hidden";
    }
  }

  hideScrollbarImmediately() {
    if (this.scrollbar) {
      clearTimeout(this.hideTimeout);
      this.scrollbar.style.opacity = "0";
      this.scrollbar.style.visibility = "hidden";
      this.thumb.style.opacity = "0";
      this.thumb.style.visibility = "hidden";
    }
  }

  removeScrollbarFromDOM() {
    if (this.scrollbar) {
      this.container.removeChild(this.scrollbar);
      this.scrollbar = null;
      this.thumb = null;
    }
  }

  onDragStart(event) {
    if (!this.isContainerVisible()) {
      this.removeScrollbarFromDOM();
      return;
    }
    this.dragging = true;
    this.startY = event.clientY;
    this.startTop = parseInt(window.getComputedStyle(this.thumb).top, 10);
    this.showScrollbar();
  }

  onDrag(event) {
    if (!this.dragging || !this.scrollbar) return;
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
