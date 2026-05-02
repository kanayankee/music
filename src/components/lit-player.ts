import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { QueuedSong } from '../types';
import { 
  spotifyIcon, playIcon, pauseIcon, shuffleIcon, repeatIcon, 
  filmIcon, backwardIcon, forwardIcon, volumeHighIcon, 
  volumeLowIcon, volumeXIcon, chevronUpIcon, chevronDownIcon 
} from '../styles/icons';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

@customElement('lit-player')
export class LitPlayer extends LitElement {
  @property({ type: String }) eventName: string = '';
  @property({ type: Array }) queue: QueuedSong[] = [];
  @property({ type: Number }) currentIndex: number = 0;

  @state() private isOpen = false;
  @state() private isPlaying = false;
  @state() private isMVMode = false;
  @state() private isShuffle = false;
  @state() private isRepeat = false;
  @state() private volume = 100;
  @state() private currentTime = 0;
  @state() private duration = 0;
  
  private ytPlayer: any = null;
  private progressInterval: number | undefined;

  static styles = css`
    :host {
      display: block;
    }

    .lit-player {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--color-surface);
      box-shadow: var(--shadow-lg);
      transform: translateY(100%);
      transition: var(--transition-smooth);
      z-index: 1000;
      border-top: 1px solid var(--color-border);
    }

    .lit-player--open {
      transform: translateY(0);
    }

    .lit-player__container {
      max-width: 1024px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      padding: 0 16px;
      height: 80px;
      gap: 24px;
    }
    
    .lit-player__toggle {
      position: absolute;
      top: -32px;
      right: 24px;
      width: 48px;
      height: 32px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-bottom: none;
      border-radius: 8px 8px 0 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-secondary);
      box-shadow: 0 -2px 4px rgba(0,0,0,0.05);
    }

    .lit-player__info {
      display: flex;
      align-items: center;
      gap: 16px;
      overflow: hidden;
      min-width: 0;
    }

    .lit-player__thumb {
      width: 60px;
      height: 45px;
      border-radius: 4px;
      object-fit: cover;
      background: #000;
    }

    .lit-player__text {
      display: flex;
      flex-direction: column;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .lit-player__title {
      font-weight: bold;
      font-size: 1rem;
      color: var(--color-text-primary);
      margin: 0;
    }

    .lit-player__author {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      margin: 0;
    }

    .lit-player__controls {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      width: 420px;
    }

    .lit-player__control-buttons {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .lit-btn-control {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--color-text-secondary);
      transition: var(--transition-fast);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .lit-btn-control:hover {
      background: rgba(0,0,0,0.05);
      color: var(--color-text-primary);
    }

    .lit-btn-control--play {
      font-size: 2rem;
      color: var(--color-red);
      background-color: transparent;
      border-radius: 0;
      width: auto;
      height: auto;
    }
    .lit-btn-control--play {
      animation: color-fade 12s infinite;
    }
    @keyframes color-fade {
      0% { color: var(--color-red); }
      20% { color: var(--color-yellow); }
      40% { color: var(--color-green); }
      60% { color: var(--color-blue); }
      80% { color: var(--color-purple); }
      100% { color: var(--color-red); }
    }
    .lit-btn-control--play:hover {
      opacity: 0.8;
      transform: scale(1.1);
      background-color: transparent;
    }


    .lit-player__progress-container {
      display: flex;
      align-items: center;
      width: 100%;
      gap: 8px;
    }

    .progress-bar {
      flex: 1;
      -webkit-appearance: none;
      appearance: none;
      height: 4px;
      background: transparent; /* The gradient will be applied via inline style */
      border-radius: 2px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .progress-bar:hover {
      opacity: 0.9;
    }

    .progress-bar::-webkit-slider-runnable-track {
      -webkit-appearance: none;
      height: 4px;
    }
    .progress-bar::-moz-range-track {
      -moz-appearance: none;
      height: 4px;
    }

    .progress-bar::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      margin-top: -4px; /* (track-height - thumb-height) / 2 */
      width: 12px;
      height: 12px;
      background: var(--color-text-primary);
      border-radius: 50%;
      border: none;
      transition: transform 0.2s;
    }
    .progress-bar:hover::-webkit-slider-thumb {
      transform: scale(1.2);
    }

    .progress-bar::-moz-range-thumb {
      width: 12px;
      height: 12px;
      background: var(--color-text-primary);
      border-radius: 50%;
      border: none;
      transition: transform 0.2s;
    }
    .progress-bar:hover::-moz-range-thumb {
      transform: scale(1.2);
    }

    .time {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      min-width: 35px;
      text-align: center;
    }

    .lit-player__yt {
      display: none;
      width: 100%;
      height: calc(100vh - 120px);
      background: #000;
    }
    .lit-player__yt--visible {
      display: flex;
      justify-content: center;
    }
    .lit-player__yt--visible iframe {
      width: 100%;
      height: 100%;
    }

    .lit-btn-control--mv {
      font-size: 1.25rem;
      width: auto;
    }
    .lit-btn-control--mv.active {
      color: var(--color-blue);
    }
    .lit-player__volume {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      color: var(--color-text-secondary);
      min-width: 0;
    }
    .lit-player__volume input {
      width: 80px;
      cursor: pointer;
    }
    .active-toggle {
      color: var(--color-blue) !important;
    }

    .lit-player__event {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      margin: 0;
      opacity: 0.8;
    }
    .lit-player__spotify {
      color: #1DB954;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      margin-left: 0.5rem;
      transition: transform 0.2s;
      text-decoration: none;
    }
    .lit-player__spotify:hover {
      transform: scale(1.1);
    }
  `;

  protected updated(changedProperties: Map<PropertyKey, unknown>) {
    if (changedProperties.has('isMVMode')) {
      this.updatePlayerSize();
    }
    if (changedProperties.has('queue') || changedProperties.has('currentIndex')) {
      if (this.queue.length > 0) {
        this.isOpen = true;
        this.loadCurrentSong();
      } else {
        this.isOpen = false;
        if (this.ytPlayer && this.ytPlayer.stopVideo) {
          this.ytPlayer.stopVideo();
        }
      }
    }
  }
  
  private updatePlayerSize() {
    if (this.ytPlayer && typeof this.ytPlayer.setSize === 'function') {
      if (this.isMVMode) {
        this.ytPlayer.setSize(640, 360);
      } else {
        this.ytPlayer.setSize(0, 0);
      }
    }
  }

  private toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  private loadCurrentSong() {
    this.currentTime = 0;
    this.duration = 0;
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }

    const song = this.queue[this.currentIndex];
    if (!song) return;
    
    const ytUrl = song.youtubeUrl || '';
    const ytMatch = ytUrl.match(/(?:\/\/|https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    const videoId = ytMatch ? ytMatch[1] : null;
    
    if (videoId) {
      if (!this.ytPlayer) {
        this.initYouTubePlayer(videoId);
      } else {
        this.ytPlayer.loadVideoById(videoId);
      }
      this.isPlaying = true;
    } else {
      if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
        this.ytPlayer.pauseVideo();
      }
      this.isPlaying = false;
    }
  }

  private initYouTubePlayer(videoId: string) {
    // Make sure API is ready
    if (!window.YT || !window.YT.Player) {
      setTimeout(() => this.initYouTubePlayer(videoId), 500);
      return;
    }
    
    const el = this.shadowRoot?.querySelector('#yt-player-container');
    if (!el) return;

    this.ytPlayer = new window.YT.Player(el, {
      height: '0',
      width: '0',
      videoId: videoId,
      playerVars: {
        'autoplay': 1,
        'controls': 1,
        'rel': 0,
        'playsinline': 1
      },
      events: {
        'onReady': this.onPlayerReady.bind(this),
        'onStateChange': this.onPlayerStateChange.bind(this)
      }
    });
  }

  private onPlayerReady(event: any) {
    event.target.setVolume(this.volume);
    event.target.playVideo();
  }

  private isSeeking = false;

  private onPlayerStateChange(event: any) {
    if (event.data === 1) { // Playing
      this.isPlaying = true;
      event.target.setVolume(this.volume);
      this.duration = this.ytPlayer.getDuration();
      this.progressInterval = setInterval(() => {
        if (!this.isSeeking) {
          this.currentTime = this.ytPlayer.getCurrentTime();
        }
      }, 250);
    } else if (event.data === 2) { // Paused
      this.isPlaying = false;
      clearInterval(this.progressInterval);
    } else if (event.data === 0) { // Ended
      this.isPlaying = false;
      clearInterval(this.progressInterval);
      if (this.isRepeat) {
        this.ytPlayer.playVideo();
      } else {
        this.handleNext();
      }
    }
  }

  private togglePlay() {
    if (!this.ytPlayer) return;
    if (this.isPlaying) {
      this.ytPlayer.pauseVideo();
    }
    else {
      this.ytPlayer.playVideo();
    }
    this.updatePlayerSize();
  }

  private handleNext() {
    if (this.isShuffle && !this.isRepeat) {
      const nextIndex = Math.floor(Math.random() * this.queue.length);
      this.dispatchEvent(new CustomEvent('index-changed', { 
        detail: { index: nextIndex },
        bubbles: true,
        composed: true
      }));
      return;
    }

    if (this.currentIndex < this.queue.length - 1) {
      this.dispatchEvent(new CustomEvent('index-changed', { 
        detail: { index: this.currentIndex + 1 },
        bubbles: true,
        composed: true
      }));
    } else {
      // Reached the end. Wrap if Repeat is on.
      if (this.isRepeat) {
        this.dispatchEvent(new CustomEvent('index-changed', { 
          detail: { index: 0 },
          bubbles: true,
          composed: true
        }));
      } else {
        this.isPlaying = false;
        if (this.ytPlayer && this.ytPlayer.stopVideo) this.ytPlayer.stopVideo();
      }
    }
  }

  private handlePrev() {
    // If song is past 3 seconds, just restart from beginning
    if (this.ytPlayer && this.ytPlayer.getCurrentTime) {
      const currentTime = this.ytPlayer.getCurrentTime();
      if (currentTime > 3) {
        this.ytPlayer.seekTo(0);
        return;
      }
    }

    if (this.isShuffle) {
       this.handleNext();
       return;
    }
    if (this.currentIndex > 0) {
      this.dispatchEvent(new CustomEvent('index-changed', { 
        detail: { index: this.currentIndex - 1 },
        bubbles: true,
        composed: true
      }));
    } else if (this.isRepeat) {
      this.dispatchEvent(new CustomEvent('index-changed', { 
        detail: { index: this.queue.length - 1 },
        bubbles: true,
        composed: true
      }));
    }
  }

  private handleVolumeChange(e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value);
    this.volume = val;
    if (this.ytPlayer && this.ytPlayer.setVolume) {
      this.ytPlayer.setVolume(this.volume);
    }
  }

  private formatTime(time: number) {
    if (isNaN(time) || time === 0) return '0:00';
    const seconds = Math.round(time);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private handleSeek(e: Event) {
    if (!this.duration) return;
    const newTime = parseFloat((e.target as HTMLInputElement).value);
    this.currentTime = newTime;
    this.ytPlayer.seekTo(newTime);
  }

  private handleSeekStart() {
    this.isSeeking = true;
  }

  private handleSeekEnd(e: Event) {
    this.isSeeking = false;
    // Final seek after releasing
    this.handleSeek(e);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      this.togglePlay();
    }
  }


  render() {
    const song = this.queue[this.currentIndex];
    const ytMatch = song?.youtubeUrl?.match(/(?:\/\/|https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    const videoId = ytMatch ? ytMatch[1] : null;
    const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : '';

    return html`

      <div class="lit-player ${this.isOpen ? 'lit-player--open' : ''}">
        <!-- YT Container FIRST (TOP) -->
        <div class="lit-player__yt ${this.isMVMode ? 'lit-player__yt--visible' : ''}">
          <div id="yt-player-container"></div>
        </div>

        ${this.queue.length > 0 ? html`
          <button class="lit-player__toggle" @click=${this.toggleOpen}>
            ${this.isOpen ? chevronDownIcon : chevronUpIcon}
          </button>
        ` : ''}
        
        <div class="lit-player__container">
          <div class="lit-player__info">
            ${thumbUrl ? html`<img class="lit-player__thumb" src="${thumbUrl}" alt="Thumbnail">` : ''}
            <div class="lit-player__text">
              <p class="lit-player__event">${song?.eventName || ''}</p>
              <p class="lit-player__title">${song?.title || 'No track selected'}</p>
              <p class="lit-player__author">${song?.author || ''}</p>
            </div>
            ${song?.spotify ? html`
              <a href="${song.spotify}" target="_blank" rel="noopener noreferrer" class="lit-player__spotify" title="Open on Spotify">
                ${spotifyIcon}
              </a>
            ` : ''}
          </div>
          
          <div class="lit-player__controls">
            <div class="lit-player__control-buttons">
              <button class="lit-btn-control" @click=${() => this.isShuffle = !this.isShuffle} style="color: ${this.isShuffle ? 'var(--color-blue)' : ''}" title="Shuffle">
                ${shuffleIcon}
              </button>
              <button class="lit-btn-control" @click=${this.handlePrev} ?disabled=${this.currentIndex === 0 && !this.isShuffle}>
                ${backwardIcon}
              </button>
              <button class="lit-btn-control lit-btn-control--play" @click=${this.togglePlay} title=${this.isPlaying ? 'Pause' : 'Play'}>
                ${this.isPlaying ? pauseIcon : playIcon}
              </button>
              <button class="lit-btn-control" @click=${this.handleNext} ?disabled=${this.currentIndex >= this.queue.length - 1 && !this.isRepeat && !this.isShuffle}>
                ${forwardIcon}
              </button>
              <button class="lit-btn-control" @click=${() => this.isRepeat = !this.isRepeat} style="color: ${this.isRepeat ? 'var(--color-blue)' : ''}" title="Repeat One">
                ${repeatIcon}
              </button>
            </div>
            <div class="lit-player__progress-container">
              <span class="time">${this.formatTime(this.currentTime)}</span>
              <input
                type="range"
                class="progress-bar"
                min="0"
                max=${this.duration || 1}
                .value=${this.currentTime}
                @input=${this.handleSeek}
                @mousedown=${this.handleSeekStart}
                @mouseup=${this.handleSeekEnd}
                @touchstart=${this.handleSeekStart}
                @touchend=${this.handleSeekEnd}
                style="background: linear-gradient(to right, var(--color-text-primary) ${this.duration ? (this.currentTime / this.duration) * 100 : 0}%, var(--color-border) ${this.duration ? (this.currentTime / this.duration) * 100 : 0}%);"
              >
              <span class="time">${this.formatTime(this.duration)}</span>
            </div>
          </div>
          <div class="lit-player__volume">
            <button class="lit-btn-control lit-btn-control--mv ${this.isMVMode ? 'active' : ''}" @click=${() => this.isMVMode = !this.isMVMode} title="Toggle MV Mode" style="width: 32px; height: 32px;">
              ${filmIcon}
            </button>
            <div style="display: flex; align-items: center; gap: 8px;">
              ${this.volume === 0 ? volumeXIcon : (this.volume < 50 ? volumeLowIcon : volumeHighIcon)}
              <input type="range" min="0" max="100" .value=${this.volume} @input=${this.handleVolumeChange}>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
