import { RangeControl } from "./components/RangeControl.js";
import { RippleEffect } from "./effect/RippleEffect.js";
import { Scrollbar } from "./components/Scrollbar.js";
import { SmoothScroller } from "./components/SmoothScroller.js";
import { musics } from "./data/musics.js";
import {
  muteIcon,
  pauseIcon,
  playIcon,
  volumeHightIcon,
  volumeLowIcon,
  volumeMediumIcon,
} from "./icon/icon.js";
import { loading, waveEffect } from "./effect/effect.js";
import { MusicSearch } from "./components/MusicSearch.js";
import { SecurityBlocker } from "./components/securityblocker.js";

const songName = document.querySelector(".song-name");
const songSinger = document.querySelector(".song-singer");
const songImage = document.querySelector(".song-image");
const playlistElement = document.querySelector(".playlist__list");
const playBtn = document.querySelector(".play-btn");
const repeatBtn = document.querySelector(".repeat-btn");
const shuffleBtn = document.querySelector(".shuffle-btn");
const nextBtn = document.querySelector(".next-btn");
const prevBtn = document.querySelector(".prev-btn");
const currentTimeElement = document.querySelector(".current-time");
const totalTimeElement = document.querySelector(".total-time");
const playlistContainer = document.querySelector(".playlist");
const mute = document.querySelector(".mute");
const volumeControls = document.querySelector(".volume-controls");

class MusicPlayer {
  constructor(songs, seekBar, volumekBar) {
    this.audio = new Audio();
    this.songs = songs;
    this.seekBar = seekBar;
    this.volumekBar = volumekBar;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isRepeating = false;
    this.isShuffling = false;
    this.isDragging = false;
    this.playedSongs = [];
    this.lastVolume = 1;
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

    this.updateProgressHandler = () => {
      this.updateProgress();
      this.updateTimeDisplay();
      this.updateSongDurationDisplay();
      this.saveState();
    };

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

    // volume

    this.volumekBar.setRangeValue(this.audio.volume);

    this.volumekBar.onInput = (value) => {
      this.audio.volume = value;
      if (value === 0) {
        player.audio.muted = true;
        mute.innerHTML = muteIcon;
      } else if (value < 0.3) {
        player.audio.muted = false;
        mute.innerHTML = volumeLowIcon;
      } else if (value < 0.6) {
        player.audio.muted = false;
        mute.innerHTML = volumeMediumIcon;
      } else {
        player.audio.muted = false;
        mute.innerHTML = volumeHightIcon;
      }
      this.lastVolume = value > 0 ? value : this.lastVolume;
      this.saveState();
    };
  }

  renderPlaylist() {
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
      currentTime: this.audio.currentTime,
      isRepeating: this.isRepeating,
      isShuffling: this.isShuffling,
      volume: this.audio.volume,
      muted: this.audio.muted,
    };
    localStorage.setItem("musicPlayerState", JSON.stringify(state));
  }

  loadState() {
    const state = JSON.parse(localStorage.getItem("musicPlayerState"));
    if (state) {
      this.currentIndex = state.currentIndex;
      this.isRepeating = state.isRepeating;
      this.isShuffling = state.isShuffling;

      this.audio.currentTime = state.currentTime || 0;

      this.audio.volume = state.volume !== undefined ? state.volume : 1;
      this.audio.muted = state.muted !== undefined ? state.muted : false;

      this.volumekBar.setRangeValue(this.audio.volume);
      if (this.audio.muted) {
        mute.innerHTML = muteIcon;
      } else {
        if (this.audio.volume === 0) {
          mute.innerHTML = muteIcon;
        } else if (this.audio.volume < 0.3) {
          mute.innerHTML = volumeLowIcon;
        } else if (this.audio.volume < 0.6) {
          mute.innerHTML = volumeMediumIcon;
        } else {
          mute.innerHTML = volumeHightIcon;
        }
      }

      repeatBtn.classList.toggle("active", this.isRepeating);
      shuffleBtn.classList.toggle("active", this.isShuffling);
    }
  }

  clearState() {
    localStorage.removeItem("musicPlayerState");
  }

  initSong() {
    this.loadState();
    this.audio.src = this.getCurrentSong().path;
    this.updateSongDetails();
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
      playPromise.then((_) => {}).catch((_) => {});
    }
    this.isPlaying = true;
    playBtn.innerHTML = pauseIcon;
    volumeControls.style.opacity = 1;
    volumeControls.style.visibility = "visible";
    this.activeWave();
  }

  pauseSong() {
    this.audio.pause();
    this.isPlaying = false;
    playBtn.innerHTML = playIcon;
    volumeControls.style.opacity = 0;
    volumeControls.style.visibility = "hidden";
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
const volumeBarElement = document.querySelector(".volume-bar");
const seekBar = new RangeControl(seekBarElement);
const volumekBar = new RangeControl(volumeBarElement, {
  maxValue: 1,
  stepValue: 0.01,
});
const player = new MusicPlayer(musics, seekBar, volumekBar);

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

const buttonList = document.querySelector(".playlist-btn");
buttonList.addEventListener("click", () => {
  playlistContainer.classList.toggle("show");
  buttonList.classList.toggle("active");
});

const playlist = document.querySelector(".playlist__list");

const searchInput = document.querySelector(".search-input");
const searchResults = document.querySelector(".search-results");
const searchResultsContainer = document.querySelector(
  ".search-results-container"
);

const musicSearch = new MusicSearch(searchInput, searchResults, musics, player);

searchInput.addEventListener("input", musicSearch);

mute.addEventListener("click", () => {
  if (player.audio.muted) {
    player.audio.muted = false;
    player.volumekBar.currentValue = player.lastVolume;
    player.audio.volume = player.lastVolume;
  } else {
    player.audio.muted = true;
    player.lastVolume =
      player.audio.volume > 0 ? player.audio.volume : player.lastVolume;
    player.volumekBar.currentValue = 0;
    player.audio.volume = 0;
  }
  player.volumekBar.setRangeValue(player.audio.volume);
  player.saveState();
});

new Scrollbar(playlistContainer, playlist);
new Scrollbar(searchResultsContainer, searchResults);
