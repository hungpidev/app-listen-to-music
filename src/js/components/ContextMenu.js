export class ContextMenu {
  constructor() {
    this.menuElement = null; // DOM element for the menu
    this.currentScrollElement = null; // Element currently listening to scroll
    this.scrollHandler = this.hideMenu.bind(this); // Scroll handler to hide the menu
    this.initEvents(); // Initialize common events
  }

  createMenu(content) {
    if (!this.menuElement) {
      this.menuElement = document.createElement("div");
      this.menuElement.classList.add("context-menu");
      document.body.appendChild(this.menuElement);
    }

    this.renderContent(content);
  }

  renderContent(content) {
    if (!this.menuElement) return;

    // Clear previous content
    this.menuElement.innerHTML = "";

    if (typeof content === "string") {
      // If the content is a string, set it directly as inner HTML
      this.menuElement.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      // If the content is an HTML element, append it
      this.menuElement.appendChild(content);
    } else if (Array.isArray(content)) {
      // If the content is an array of elements, append each
      content.forEach((item) => {
        if (item instanceof HTMLElement) {
          this.menuElement.appendChild(item);
        } else if (typeof item === "string") {
          this.menuElement.innerHTML += item;
        }
      });
    }
  }

  initEvents() {
    // Click event on document to hide menu
    document.addEventListener("click", (e) => {
      if (this.menuElement && !this.menuElement.contains(e.target)) {
        this.hideMenu();
      }
    });

    // "Escape" key event to hide menu
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.hideMenu();
    });

    // Window resize event to hide menu
    window.addEventListener("resize", () => this.hideMenu());

    // Scroll event on window to hide menu
    window.addEventListener("scroll", () => this.hideMenu());
  }

  attachScrollEvent(element) {
    // Remove scroll event from the previous element
    if (this.currentScrollElement) {
      this.currentScrollElement.removeEventListener(
        "scroll",
        this.scrollHandler
      );
    }

    // Update the current element and add a new scroll event
    this.currentScrollElement = element;

    if (this.currentScrollElement) {
      this.currentScrollElement.addEventListener("scroll", this.scrollHandler);
    }
  }

  showMenu(e, content, scrollElement) {
    this.createMenu(content);
    this.menuElement.style.display = "block";
    this.adjustPosition(e);

    // Attach scroll event to the specified element
    this.attachScrollEvent(scrollElement);
  }

  adjustPosition(e) {
    const menuWidth = this.menuElement.offsetWidth;
    const menuHeight = this.menuElement.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const margin = 20;
    const offset = 1;

    let left = e.clientX + scrollX + offset;
    let top = e.clientY + scrollY + offset;

    if (left + menuWidth > windowWidth + scrollX - margin) {
      left = e.clientX + scrollX - menuWidth - offset;
    }

    if (top + menuHeight > windowHeight + scrollY - margin) {
      top = e.clientY + scrollY - menuHeight - offset;
    }

    if (left < scrollX + margin) {
      left = scrollX + margin;
    }

    if (top < scrollY + margin) {
      top = scrollY + margin;
    }

    this.menuElement.style.left = `${left}px`;
    this.menuElement.style.top = `${top}px`;
    this.menuElement.style.zIndex = 999999;
  }

  hideMenu() {
    if (this.menuElement) {
      // Remove menu from the DOM
      this.menuElement.remove();
      this.menuElement = null;
    }

    // Remove scroll event when menu is hidden
    if (this.currentScrollElement) {
      this.currentScrollElement.removeEventListener(
        "scroll",
        this.scrollHandler
      );
      this.currentScrollElement = null;
    }
  }
}
