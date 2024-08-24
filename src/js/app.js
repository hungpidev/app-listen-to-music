import { RangeControl } from "./components/RangeControl.js";
import { RippleEffect } from "./effect/RippleEffect.js";
import { Scrollbar } from "./components/Scrollbar.js";
import { SmoothScroller } from "./components/SmoothScroller.js";
import { musics } from "./data/musics.js";
import { pauseIcon, playIcon } from "./icon/icon.js";
import { loading, waveEffect } from "./effect/effect.js";

const songName = document.querySelector(".song-name");
const songSinger = document.querySelector(".song-singer");
const songImage = document.querySelector(".song-image");
const playBtn = document.querySelector(".play-btn");
const repeatBtn = document.querySelector(".repeat-btn");
const shuffleBtn = document.querySelector(".shuffle-btn");
const nextBtn = document.querySelector(".next-btn");
const prevBtn = document.querySelector(".prev-btn");
const currentTimeElement = document.querySelector(".current-time");
const totalTimeElement = document.querySelector(".total-time");
const playlistContainer = document.querySelector(".playlist");

class MusicPlayer {
  constructor(songs, seekBar) {
    this.audio = new Audio();
    this.songs = songs;
    this.seekBar = seekBar;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isRepeating = false;
    this.isShuffling = false;
    this.isDragging = false;
    this.playedSongs = [];
    this.initSong();
    this.loadState();

    this.audio.addEventListener("waiting", () => {
      playBtn.innerHTML = loading;

      const currentActiveWave = document.querySelector(
        `.playlist__item[data-index="${this.currentIndex}"] .overlay-wave`
      );

      if (currentActiveWave) {
        currentActiveWave.classList.add("active-wave");
        currentActiveWave.innerHTML = loading;
        currentActiveWave.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      }
    });

    this.audio.addEventListener("playing", () => {
      playBtn.innerHTML = pauseIcon;

      const currentActiveWave = document.querySelector(
        `.playlist__item[data-index="${this.currentIndex}"] .overlay-wave`
      );

      if (currentActiveWave) {
        currentActiveWave.innerHTML = waveEffect;
        currentActiveWave.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      }
    });

    // Định nghĩa hàm handler cho sự kiện timeupdate
    this.updateProgressHandler = () => {
      this.updateProgress();
      this.updateTimeDisplay();
      this.updateSongDurationDisplay();
    };

    // Thêm sự kiện timeupdate sử dụng hàm handler đã định nghĩa
    this.audio.addEventListener("timeupdate", this.updateProgressHandler);

    this.audio.addEventListener("ended", this.endSong.bind(this));

    this.seekBar.onDragStart = () => {
      if (isFinite(this.audio.duration)) {
        this.isDragging = true;
        this.audio.removeEventListener(
          "timeupdate",
          this.updateProgressHandler
        );
      } else {
        return;
      }
    };

    this.seekBar.onInput = (value) => {
      if (isFinite(this.audio.duration)) {
        const seekTime = (value / 100) * this.audio.duration;
        currentTimeElement.textContent = this.formatTime(seekTime);
      }
    };

    this.seekBar.onDragEnd = (value) => {
      if (this.isDragging) {
        if (isFinite(this.audio.duration)) {
          const seekTime = (value / 100) * this.audio.duration;
          this.audio.currentTime = seekTime;
        }
        this.isDragging = false;
      }
      this.audio.addEventListener("timeupdate", this.updateProgressHandler);
    };
  }

  renderPlaylist() {
    const playlistElement = document.querySelector(".playlist__list");
    playlistElement.innerHTML = this.songs
      .map(
        (song, index) =>
          `<li class="playlist__item ${
            index === this.currentIndex ? "active-song" : ""
          }" data-index="${index}">
          <div class="thumb-container">
            <div class="playlist__item-thumb">
              <img src="${song.image}" alt="${song.name}">
            </div>
            <div class="overlay-wave ${
              index === this.currentIndex ? "active-wave" : ""
            }">
            </div>
          </div>
          <div class="playlist__item-details">
            <span class="playlist__item-name">${song.name}</span>
            <span class="playlist__item-singer">${song.singer}</span>
          </div>
          <div class="playlist__item-duration ${
            index === this.currentIndex ? "active__current-time" : ""
          }">${song.duration}</div>
        </li>`
      )
      .join("");

    const items = document.querySelectorAll(".playlist__item");
    items.forEach((item) => {
      new RippleEffect(item, {
        backgroundColor: "#2d2d2d",
        scale: 3,
        duration: 1500,
      });
    });

    playlistElement.addEventListener("click", (e) => {
      const item = e.target.closest(".playlist__item");
      if (item) {
        const index = parseInt(item.dataset.index, 10);
        this.selectSong(index);
      }
    });
  }

  updateSongDurationDisplay() {
    const currentDurationElement = document.querySelector(
      `.playlist__item[data-index="${this.currentIndex}"] .playlist__item-duration`
    );

    if (currentDurationElement && this.audio.duration) {
      currentDurationElement.textContent = this.formatTime(
        this.audio.currentTime
      );
    }
  }

  resetPreviousSongDuration() {
    const previousDurationElement = document.querySelector(
      `.playlist__item[data-index="${this.currentIndex}"] .playlist__item-duration`
    );

    if (previousDurationElement) {
      const previousSong = this.songs[this.currentIndex];
      previousDurationElement.textContent = previousSong.duration;
    }
  }

  selectSong(index) {
    if (this.currentIndex === index && this.isPlaying) {
      return;
    } else {
      this.resetPreviousSongDuration();
      this.currentIndex = index;
      this.loadCurrentSong();
      this.playSong();
      this.saveState();
      this.scrollActiveSongIntoView();
    }
  }

  scrollActiveSongIntoView() {
    const container = document.querySelector(".playlist__list");
    const activeSongElement = document.querySelector(
      ".playlist__item.active-song"
    );
    const scroller = new SmoothScroller(container);
    scroller.scrollToCenter(activeSongElement);
  }

  saveState() {
    const state = {
      currentIndex: this.currentIndex,
      isRepeating: this.isRepeating,
      isShuffling: this.isShuffling,
    };
    localStorage.setItem("musicPlayerState", JSON.stringify(state));
  }

  loadState() {
    const state = JSON.parse(localStorage.getItem("musicPlayerState"));
    if (state) {
      this.currentIndex = state.currentIndex;
      this.isRepeating = state.isRepeating;
      this.isShuffling = state.isShuffling;

      repeatBtn.classList.toggle("active", this.isRepeating);
      shuffleBtn.classList.toggle("active", this.isShuffling);
    }
  }

  clearState() {
    localStorage.removeItem("musicPlayerState");
  }

  initSong() {
    this.audio.src = this.getCurrentSong().path;
    this.updateSongDetails();
    this.loadState();
    this.pauseSong();
    this.renderPlaylist();
    this.scrollActiveSongIntoView();
  }

  getCurrentSong() {
    return this.songs[this.currentIndex];
  }

  next() {
    this.resetPreviousSongDuration();
    this.currentIndex = (this.currentIndex + 1) % this.songs.length;
    this.loadCurrentSong();
    this.playSong();
    this.saveState();
    this.scrollActiveSongIntoView();
  }

  prev() {
    this.resetPreviousSongDuration();
    this.currentIndex =
      (this.currentIndex - 1 + this.songs.length) % this.songs.length;
    this.loadCurrentSong();
    this.playSong();
    this.saveState();
    this.scrollActiveSongIntoView();
  }

  playSong() {
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then((_) => {})
        .catch((_) => {
          console.log(
            `%cCó lẽ kết nối internet đang chạy marathon chậm rãi, nhưng ngón tay của bạn thì lại muốn về đích trước rồi!  🤣 🤣 🤣`,
            "font-size: 30px; color: #73ff26;"
          );
        });
    }
    this.isPlaying = true;
    playBtn.innerHTML = pauseIcon;
    this.activeWave();
  }

  pauseSong() {
    this.audio.pause();
    this.isPlaying = false;
    playBtn.innerHTML = playIcon;
    this.activeWave();
  }

  togglePlaySong() {
    if (this.isPlaying) {
      this.pauseSong();
    } else {
      this.playSong();
    }
  }

  toggleRepeat() {
    this.isRepeating = !this.isRepeating;
    if (this.isRepeating) {
      this.isShuffling = false;
      shuffleBtn.classList.remove("active");
    }
    repeatBtn.classList.toggle("active", this.isRepeating);
    this.saveState();
  }

  toggleShuffle() {
    this.isShuffling = !this.isShuffling;
    if (this.isShuffling) {
      this.isRepeating = false;
      repeatBtn.classList.remove("active");

      if (this.playedSongs.length >= this.songs.length) {
        this.playedSongs = [];
      }

      if (!this.playedSongs.includes(this.currentIndex)) {
        this.playedSongs.push(this.currentIndex);
      }
    } else {
      this.playedSongs = [];
    }
    shuffleBtn.classList.toggle("active", this.isShuffling);
    this.saveState();
  }

  shuffle() {
    if (this.playedSongs.length >= this.songs.length) {
      console.log("All songs have been played");
      this.isShuffling = false;
      shuffleBtn.classList.remove("active");
      this.currentIndex = 0;
      this.loadCurrentSong();
      this.pauseSong();
      this.saveState();
      return;
    }

    if (!this.playedSongs.includes(this.currentIndex)) {
      this.playedSongs.push(this.currentIndex);
    }

    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * this.songs.length);
    } while (this.playedSongs.includes(randomIndex));

    this.playedSongs.push(randomIndex);
    this.currentIndex = randomIndex;
    this.loadCurrentSong();
    this.playSong();
    this.scrollActiveSongIntoView();
  }

  endSong() {
    if (this.isRepeating) {
      this.playSong();
    } else if (this.isShuffling) {
      this.shuffle();
    } else {
      this.next();
    }
  }

  activeSong() {
    const previousActiveItem = document.querySelector(".active-song");
    const currentActiveItem = document.querySelector(`
      .playlist__item[data-index="${this.currentIndex}"]`);
    if (previousActiveItem) {
      previousActiveItem.classList.remove("active-song");
    }
    if (currentActiveItem) {
      currentActiveItem.classList.add("active-song");
    }
  }

  activeWave() {
    const previousActiveWave = document.querySelector(".active-wave");
    const currentActiveWave = document.querySelector(`
      .playlist__item[data-index="${this.currentIndex}"] .overlay-wave
    `);

    if (previousActiveWave) {
      previousActiveWave.classList.remove("active-wave");
      previousActiveWave.innerHTML = "";
      previousActiveWave.style.backgroundColor = "transparent";
    }

    if (this.isPlaying) {
      currentActiveWave.classList.add("active-wave");
      currentActiveWave.innerHTML = waveEffect;
      currentActiveWave.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    }
  }

  loadCurrentSong() {
    this.audio.src = this.getCurrentSong().path;
    this.updateSongDetails();
    this.activeSong();
  }

  updateSongDetails() {
    const song = this.getCurrentSong();
    songName.textContent = song.name;
    songSinger.textContent = song.singer;
    songImage.innerHTML = `<img src="${song.image}" alt="${song.name}">`;
  }

  updateProgress() {
    if (this.audio.readyState === 0) {
      this.seekBar.setRangeValue(0);
    } else {
      const progressPercent =
        (this.audio.currentTime / this.audio.duration) * 100;
      this.seekBar.setRangeValue(progressPercent);
    }
  }

  updateTimeDisplay() {
    const currentTime = this.audio.currentTime;
    const duration = this.audio.duration;
    currentTimeElement.textContent = this.formatTime(currentTime);
    totalTimeElement.textContent = this.formatTime(
      isFinite(duration) ? duration : 0
    );
  }

  formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
}

const seekBarElement = document.querySelector(".seek-bar");
const seekBar = new RangeControl(seekBarElement);
const player = new MusicPlayer(musics, seekBar);

playBtn.addEventListener("click", () => {
  player.togglePlaySong();
});

nextBtn.addEventListener("click", () => {
  player.next();
});

prevBtn.addEventListener("click", () => {
  player.prev();
});

repeatBtn.addEventListener("click", () => {
  player.toggleRepeat();
});

shuffleBtn.addEventListener("click", () => {
  player.toggleShuffle();
});
player.initSong();

const buttonList = document.querySelector(".icon-list");
buttonList.addEventListener("click", () => {
  playlistContainer.classList.toggle("show");
});

const playlist = document.querySelector(".playlist__list");
new Scrollbar(playlistContainer, playlist);
