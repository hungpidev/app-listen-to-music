export class SecurityBlocker {
  constructor() {
    this.init();
  }

  init() {
    this.blockContextMenu();
    this.blockShortcuts();
  }

  blockContextMenu() {
    document.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
  }

  blockShortcuts() {
    document.addEventListener("keydown", (event) => {
      if (
        event.keyCode === 123 ||
        (event.ctrlKey && event.shiftKey && event.keyCode === 73) ||
        (event.ctrlKey && event.shiftKey && event.keyCode === 74) ||
        (event.ctrlKey && event.keyCode === 85)
      ) {
        event.preventDefault();
      }
    });
  }
}
