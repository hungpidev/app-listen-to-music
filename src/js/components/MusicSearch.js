export class MusicSearch {
  constructor(searchInput, searchResults, musics, player) {
    this.searchInput = searchInput;
    this.searchResults = searchResults;
    this.musics = musics;
    this.player = player;

    this.init();
  }

  init() {
    this.searchInput.addEventListener("input", () => this.handleSearch());
  }

  handleSearch() {
    const query = this.searchInput.value.toLowerCase().trim();
    this.searchResults.innerHTML = "";

    if (query === "") {
      this.searchResults.style.display = "none";
      return;
    }

    const normalizedQuery = this.normalizeString(query);

    const filteredSongs = this.musics
      .filter((music) => {
        const normalizedSongName = this.normalizeString(music.name);
        return normalizedSongName.startsWith(normalizedQuery);
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    if (filteredSongs.length > 0) {
      this.displayResults(filteredSongs);
    } else {
      this.searchResults.style.display = "none";
    }
  }

  normalizeString(str) {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  displayResults(songs) {
    songs.forEach((song) => {
      const resultItem = this.createResultItem(song);
      this.searchResults.appendChild(resultItem);
    });

    this.searchResults.style.display = "block";
    this.addResultItemListeners();
  }

  createResultItem(song) {
    const resultItem = document.createElement("div");
    resultItem.classList.add("result-item");

    resultItem.setAttribute("data-index", this.musics.indexOf(song));

    resultItem.innerHTML = `
      <div class="result-thumb">
        <img src="${song.image}" alt="${song.name}">
      </div>
      <div class="result-details">
        <span class="result-name">${song.name}</span>
        <span class="result-singer">${song.singer}</span>
      </div>
    `;

    return resultItem;
  }

  addResultItemListeners() {
    document.querySelectorAll(".result-item").forEach((item) => {
      item.addEventListener("click", () => this.handleResultItemClick(item));
    });
  }

  handleResultItemClick(item) {
    const index = parseInt(item.getAttribute("data-index"), 10);
    this.player.selectSong(index);
    this.searchInput.value = "";
    this.searchResults.style.display = "none";
  }
}
