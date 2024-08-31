export class ContextMenu {
  constructor() {
    this.menuElement = null; // Biến lưu trữ menu
    this.currentScrollElement = null; // Phần tử hiện tại lắng nghe sự kiện scroll
    this.scrollHandler = this.hideMenu.bind(this); // Hàm xử lý scroll để ẩn menu
    this.initEvents(); // Khởi tạo sự kiện chung
  }

  createMenu(menuItems) {
    if (!this.menuElement) {
      this.menuElement = document.createElement("div");
      this.menuElement.classList.add("context-menu");
      document.body.appendChild(this.menuElement);
    }

    this.renderMenu(menuItems);
  }

  renderMenu(menuItems) {
    if (!this.menuElement) return;

    this.menuElement.innerHTML = "";

    menuItems.forEach((item) => {
      const menuItemElement = document.createElement("div");
      menuItemElement.classList.add("context-menu-item");
      menuItemElement.textContent = item.label;

      if (item.action) {
        menuItemElement.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          item.action();
          this.hideMenu();
        });
      }

      this.menuElement.appendChild(menuItemElement);
    });
  }

  initEvents() {
    // Sự kiện click trên document để ẩn menu
    document.addEventListener("click", (e) => {
      if (this.menuElement && !this.menuElement.contains(e.target)) {
        this.hideMenu();
      }
    });

    // Sự kiện phím "Escape" để ẩn menu
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.hideMenu();
    });

    // Sự kiện thay đổi kích thước cửa sổ để ẩn menu
    window.addEventListener("resize", () => this.hideMenu());

    // Sự kiện scroll trên window để ẩn menu
    window.addEventListener("scroll", () => this.hideMenu());
  }

  attachScrollEvent(element) {
    // Gỡ bỏ sự kiện scroll khỏi phần tử trước đó
    if (this.currentScrollElement) {
      this.currentScrollElement.removeEventListener(
        "scroll",
        this.scrollHandler
      );
    }

    // Cập nhật phần tử hiện tại và thêm sự kiện scroll mới
    this.currentScrollElement = element;

    if (this.currentScrollElement) {
      this.currentScrollElement.addEventListener("scroll", this.scrollHandler);
    }
  }

  showMenu(e, menuItems, scrollElement) {
    this.createMenu(menuItems);
    this.menuElement.style.display = "block";
    this.adjustPosition(e);

    // Đính kèm sự kiện scroll cho phần tử được chỉ định
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
    const offset = 15;

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
      this.menuElement.style.display = "none";
    }

    // Gỡ bỏ sự kiện scroll khi menu bị ẩn
    if (this.currentScrollElement) {
      this.currentScrollElement.removeEventListener(
        "scroll",
        this.scrollHandler
      );
      this.currentScrollElement = null;
    }
  }
}

// const contextMenu = new ContextMenu();

// const menuConfigurations = {
//   song: [
//     { label: "Play", action: () => console.log("Play clicked") },
//     {
//       label: "Add to Playlist",
//       action: () => console.log("Add to Playlist clicked"),
//     },
//     { label: "Remove", action: () => console.log("Remove clicked") },
//   ],
// };

// function handleContextMenu(e, type, scrollElement) {
//   e.preventDefault();
//   const menuItems = menuConfigurations[type] || [];
//   contextMenu.showMenu(e, menuItems, scrollElement);
// }

// const songItems = document.querySelectorAll(".playlist__item");
// songItems.forEach((songItem) => {
//   songItem.addEventListener("contextmenu", (e) =>
//     handleContextMenu(e, "song", playlistElement)
//   );
// });

// songImage.addEventListener("contextmenu", (e) => handleContextMenu(e, "song"));
