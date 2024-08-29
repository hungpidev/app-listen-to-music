export class Scrollbar {
  constructor(container, content) {
    this.container = container;
    this.content = content;
    this.scrollbar = null;
    this.thumb = null;
    this.dragging = false;
    this.hideTimeout = null;
    this.startY = 0;
    this.startTop = 0;

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

      this.scrollbar.addEventListener(
        "mousedown",
        this.onScrollbarClick.bind(this)
      );
      this.thumb.addEventListener("mousedown", this.onDragStart.bind(this));

      this.thumb.addEventListener("touchstart", this.onDragStart.bind(this), {
        passive: true,
      });
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
  }

  updateThumbPosition() {
    const containerHeight = this.container.clientHeight;
    const contentHeight = this.content.scrollHeight;

    if (contentHeight <= containerHeight) {
      this.removeScrollbarFromDOM();
      return;
    }

    const scrollTop = this.content.scrollTop;
    const thumbTop =
      (scrollTop / (contentHeight - containerHeight)) *
      (containerHeight - this.thumb.clientHeight);
    this.thumb.style.top = `${thumbTop}px`;
  }

  addEventListeners() {
    this.content.addEventListener("scroll", () => {
      if (!this.scrollbar) {
        this.createScrollbar();
      }
      this.showScrollbar();
      this.updateThumbPosition();

      clearTimeout(this.hideTimeout);
      this.hideTimeout = setTimeout(() => this.hideScrollbar(), 2000);
    });

    window.addEventListener("resize", () => {
      if (this.scrollbar) {
        this.updateThumbSize();
        this.updateThumbPosition();
      }
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
      if (!this.scrollbar) {
        this.createScrollbar();
      }
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
      } else if (!this.scrollbar) {
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

  removeScrollbarFromDOM() {
    if (this.scrollbar && this.container.contains(this.scrollbar)) {
      this.container.removeChild(this.scrollbar);
      this.scrollbar = null;
      this.thumb = null;
    }
  }

  showScrollbar() {
    if (this.scrollbar) {
      this.scrollbar.style.opacity = "1";
      this.scrollbar.style.visibility = "visible";
    }
  }

  hideScrollbar() {
    if (!this.dragging && this.scrollbar) {
      this.scrollbar.style.opacity = "0";
      this.scrollbar.style.visibility = "hidden";
    }
  }

  onDragStart(event) {
    if (!this.isContainerVisible() || !this.scrollbar) {
      this.removeScrollbarFromDOM();
      return;
    }

    this.dragging = true;
    this.startY = event.touches ? event.touches[0].clientY : event.clientY;
    this.startTop = parseInt(window.getComputedStyle(this.thumb).top, 10);

    document.addEventListener("mousemove", this.onDrag.bind(this));
    document.addEventListener("mouseup", this.onDragEnd.bind(this));
    document.addEventListener("touchmove", this.onDrag.bind(this), {
      passive: true,
    });
    document.addEventListener("touchend", this.onDragEnd.bind(this), {
      passive: true,
    });

    document.body.style.userSelect = "none";
  }

  onDrag(event) {
    if (!this.dragging || !this.scrollbar) return;

    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    const deltaY = clientY - this.startY;

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

    document.removeEventListener("mousemove", this.onDrag.bind(this));
    document.removeEventListener("mouseup", this.onDragEnd.bind(this));
    document.removeEventListener("touchmove", this.onDrag.bind(this));
    document.removeEventListener("touchend", this.onDragEnd.bind(this));

    document.body.style.userSelect = "";

    clearTimeout(this.hideTimeout);
    this.hideTimeout = setTimeout(() => this.hideScrollbar(), 2000);
  }

  onScrollbarClick(event) {
    if (event.target !== this.scrollbar) return;

    const containerRect = this.scrollbar.getBoundingClientRect();
    const clickY = event.clientY - containerRect.top;
    const thumbHeight = this.thumb.clientHeight;

    const newThumbTop = Math.min(
      Math.max(clickY - thumbHeight / 2, 0),
      this.container.clientHeight - thumbHeight
    );

    this.thumb.style.top = `${newThumbTop}px`;

    const scrollRatio =
      newThumbTop / (this.container.clientHeight - thumbHeight);
    this.content.scrollTop =
      scrollRatio * (this.content.scrollHeight - this.container.clientHeight);

    this.showScrollbar();
  }
}
