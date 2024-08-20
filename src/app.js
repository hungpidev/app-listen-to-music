import { RangeControl } from "./components/RangeControl.js";
import { RippleEffect } from "./components/RippleEffect.js";
import { Scrollbar } from "./components/Scrollbar.js";
import { SmoothScroller } from "./components/SmoothScroller.js";
import { musics } from "./data/musics.js";

const songName = document.querySelector(".song-name");
const songSinger = document.querySelector(".song-singer");
const songImage = document.querySelector(".song-image");
const playBtn = document.querySelector(".play-btn");
const buttons = document.querySelectorAll(".btn");
const repeatBtn = document.querySelector(".repeat-btn");
const shuffleBtn = document.querySelector(".shuffle-btn");
const nextBtn = document.querySelector(".next-btn");
const prevBtn = document.querySelector(".prev-btn");
const currentTimeElement = document.querySelector(".current-time");
const totalTimeElement = document.querySelector(".total-time");
const playIcon = `<i class="fas fa-play icon__play"></i>`;
const pauseIcon = `<i class="fas fa-pause icon__pause"></i>`;

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
    this.initSong();
    this.loadState();
  }

  renderPlaylist() {
    const playlistElement = document.querySelector(".playlist__list");
    playlistElement.innerHTML = this.songs
      .map(
        (song, index) => `
        <li class="playlist__item ${
          index === this.currentIndex ? "active" : ""
        }" data-index="${index}">
          <div class="playlist__item-thumb">
            <img src="${song.image}" alt="${song.name}">
          </div>
          <div class="playlist__item-details">
            <span class="playlist__item-name">${song.name}</span>
            <span class="playlist__item-singer">${song.singer}</span>
          </div>
          <div class="playlist__item-duration">${song.duration}</div>
        </li>
      `
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

  selectSong(index) {
    if (this.currentIndex === index) {
      return;
    } else {
      this.currentIndex = index;
      this.loadCurrentSong();
      this.saveState();
      this.scrollActiveSongIntoView();
    }
  }

  scrollActiveSongIntoView() {
    const container = document.querySelector(".playlist__list");
    const activeSongElement = document.querySelector(".playlist__item.active");
    const scroller = new SmoothScroller(container);
    scroller.scrollToCenter(activeSongElement);
  }

  updateActiveSong() {
    const items = document.querySelectorAll(".playlist__item");
    items.forEach((item, index) => {
      item.classList.toggle("active", index === this.currentIndex);
    });
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

  // Khởi tạo bài hát
  initSong() {
    this.audio.src = this.getCurrentSong().path;
    this.updateSongDetails();
    this.loadState();
    this.pauseSong();
    this.renderPlaylist();
    this.scrollActiveSongIntoView();
  }

  // Lấy bài hát hiện tại
  getCurrentSong() {
    return this.songs[this.currentIndex];
  }

  // Chuyển bài hát
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.songs.length;
    this.loadCurrentSong();
    this.saveState();
    this.scrollActiveSongIntoView();
  }

  prev() {
    this.currentIndex =
      (this.currentIndex - 1 + this.songs.length) % this.songs.length;
    this.loadCurrentSong();
    this.saveState();
    this.scrollActiveSongIntoView();
  }

  // Phát và tạm dừng bài hát
  playSong() {
    this.audio.play();
    this.isPlaying = true;
    playBtn.innerHTML = pauseIcon;
  }

  pauseSong() {
    this.audio.pause();
    this.isPlaying = false;
    playBtn.innerHTML = playIcon;
  }

  togglePlaySong() {
    if (this.isPlaying) {
      this.pauseSong();
    } else {
      this.playSong();
    }
  }

  // Xử lý lặp lại và xáo trộn
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
    }
    shuffleBtn.classList.toggle("active", this.isShuffling);
    this.saveState();
  }

  // Kết thúc bài hát
  endSong() {
    if (this.isRepeating) {
      this.playSong();
    } else if (this.isShuffling) {
      this.shuffle();
    } else {
      this.next();
    }
  }

  // Xáo trộn bài hát
  shuffle() {
    const randomIndex = Math.floor(Math.random() * this.songs.length);
    this.currentIndex = randomIndex;
    this.loadCurrentSong();
    this.scrollActiveSongIntoView();
  }

  // Tải bài hát hiện tại
  loadCurrentSong() {
    // Remove active class from the previous song
    const previousActiveItem = document.querySelector(".playlist__item.active");
    if (previousActiveItem) {
      previousActiveItem.classList.remove("active");
    }

    // Update the audio source and play the current song
    this.audio.src = this.getCurrentSong().path;
    this.updateSongDetails();
    this.playSong();

    // Add active class to the current song
    const currentActiveItem = document.querySelector(
      `.playlist__item[data-index="${this.currentIndex}"]`
    );
    if (currentActiveItem) {
      currentActiveItem.classList.add("active");
    }
  }

  // Cập nhật thông tin bài hát
  updateSongDetails() {
    const song = this.getCurrentSong();
    songName.textContent = song.name;
    songSinger.textContent = song.singer;
    songImage.innerHTML = `<img src="${song.image}" alt="${song.name}">`;
  }

  updateSeekTime() {
    player.updateTimeDisplay();
    player.updateProgress();
  }

  // Cập nhật tiến trình phát bài hát
  updateProgress() {
    if (!this.isDragging) {
      const progressPercent =
        (this.audio.currentTime / this.audio.duration) * 100;
      this.seekBar.setRangeValue(progressPercent);
    }
  }

  // Cập nhật thời gian hiển thị
  updateTimeDisplay() {
    const currentTime = this.audio.currentTime;
    const duration = this.audio.duration;
    currentTimeElement.textContent = this.formatTime(currentTime);
    totalTimeElement.textContent = this.formatTime(
      isFinite(duration) ? duration : 0
    );
  }

  // Định dạng thời gian
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

player.seekBar.onDragStart = () => {
  player.isDragging = true;
  player.audio.removeEventListener("timeupdate", player.updateSeekTime);
};

player.seekBar.onInput = (value) => {
  if (player.audio.duration) {
    const seekTime = (value / 100) * player.audio.duration;
    currentTimeElement.textContent = player.formatTime(seekTime);
  }
};

player.seekBar.onDragEnd = (value) => {
  if (player.isDragging) {
    const seekTime = (value / 100) * player.audio.duration;
    player.audio.currentTime = seekTime;
    player.isDragging = false;
  }
  player.audio.addEventListener("timeupdate", player.updateSeekTime);
};

player.audio.addEventListener("timeupdate", player.updateSeekTime);

player.audio.addEventListener("ended", player.endSong.bind(player));

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

const playlistContainer = document.querySelector(".playlist");
const playlist = document.querySelector(".playlist__list");
new Scrollbar(playlistContainer, playlist);

buttons.forEach((item) => {
  new RippleEffect(item);
});
