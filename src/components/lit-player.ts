import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { QueuedSong } from '../types';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

@customElement('lit-player')
export class LitPlayer extends LitElement {
  @property({ type: Array }) queue: QueuedSong[] = [];
  @property({ type: Number }) currentIndex: number = 0;

  @state() private isOpen = false;
  @state() private isPlaying = false;
  @state() private isMVMode = false;
  @state() private isShuffle = false;
  @state() private isRepeat = false;
  @state() private volume = 100;
  
  private ytPlayer: any = null;

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
      display: flex;
      align-items: center;
      padding: 0 16px;
      height: 80px;
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
      flex: 1;
      display: flex;
      align-items: center;
      gap: 16px;
      overflow: hidden;
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
      flex: 1;
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
      gap: 8px;
      margin-left: 16px;
      color: var(--color-text-secondary);
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

  updated(changedProperties: Map<string, any>) {
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
  
  private toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  private loadCurrentSong() {
    const song = this.queue[this.currentIndex];
    if (!song) return;
    
    const ytMatch = song.description.match(/\/\/youtu\.be\/([\w-]+)/);
    const videoId = ytMatch ? ytMatch[1] : null;
    
    if (videoId) {
      if (!this.ytPlayer) {
        this.initYouTubePlayer(videoId);
      } else {
        this.ytPlayer.loadVideoById(videoId);
      }
      this.isPlaying = true;
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
    event.target.playVideo();
  }

  private onPlayerStateChange(event: any) {
    // 0 = ended, 1 = playing, 2 = paused
    if (event.data === 1) {
      this.isPlaying = true;
    } else if (event.data === 2) {
      this.isPlaying = false;
    } else if (event.data === 0) {
      if (this.isRepeat) {
        // Repeat One: Restart the same video
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
    } else {
      this.ytPlayer.playVideo();
    }
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

  render() {
    const song = this.queue[this.currentIndex];
    const ytMatch = song?.description.match(/\/\/youtu\.be\/([\w-]+)/);
    const videoId = ytMatch ? ytMatch[1] : null;
    const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : '';

    return html`
      <link rel="stylesheet" href="https://use.fontawesome.com/releases/v6.4.0/css/all.css" />
      <div class="lit-player ${this.isOpen ? 'lit-player--open' : ''}">
        <!-- YT Container FIRST (TOP) -->
        <div class="lit-player__yt ${this.isMVMode ? 'lit-player__yt--visible' : ''}">
          <div id="yt-player-container"></div>
        </div>

        ${this.queue.length > 0 ? html`
          <button class="lit-player__toggle" @click=${this.toggleOpen}>
            <i class="fa ${this.isOpen ? 'fa-chevron-down' : 'fa-chevron-up'}"></i>
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
              <a href="${song.spotify}" target="_blank" class="lit-player__spotify" title="Open on Spotify">
                <i class="fa-brands fa-spotify"></i>
              </a>
            ` : ''}
          </div>
          
          <div class="lit-player__controls">
            <button class="lit-btn-control" @click=${() => this.isShuffle = !this.isShuffle} style="color: ${this.isShuffle ? 'var(--color-blue)' : ''}" title="Shuffle">
              <i class="fa-solid fa-shuffle"></i>
            </button>
            <button class="lit-btn-control" @click=${() => this.isRepeat = !this.isRepeat} style="color: ${this.isRepeat ? 'var(--color-blue)' : ''}" title="Repeat One">
              <i class="fa-solid fa-repeat"></i>
            </button>
            <button class="lit-btn-control lit-btn-control--mv ${this.isMVMode ? 'active' : ''}" @click=${() => this.isMVMode = !this.isMVMode} title="Toggle MV Mode">
              <i class="fa-solid fa-film"></i>
            </button>
            <button class="lit-btn-control" @click=${this.handlePrev} ?disabled=${this.currentIndex === 0 && !this.isShuffle}>
              <i class="fa-solid fa-backward-step"></i>
            </button>
            <button class="lit-btn-control lit-btn-control--play" @click=${this.togglePlay} style="color: var(--color-red)">
              <i class="fa-solid ${this.isPlaying ? 'fa-pause' : 'fa-play'}" style="font-size: 2rem;"></i>
            </button>
            <button class="lit-btn-control" @click=${this.handleNext} ?disabled=${this.currentIndex >= this.queue.length - 1 && !this.isRepeat && !this.isShuffle}>
              <i class="fa-solid fa-forward-step"></i>
            </button>
            <div class="lit-player__volume">
              <i class="fa-solid ${this.volume === 0 ? 'fa-volume-xmark' : (this.volume < 50 ? 'fa-volume-low' : 'fa-volume-high')}"></i>
              <input type="range" min="0" max="100" .value=${this.volume} @input=${this.handleVolumeChange}>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
