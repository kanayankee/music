import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { RootData, EventData, Song, QueuedSong } from '../types';
import { starIcon, arrowUpIcon, arrowDownIcon } from '../styles/icons';
import { marked } from 'marked';
import dataJson from '../data/index.json';
import loadingWords from '../data/loading.json';

import './lit-event-card';
import './lit-player';

const allData = dataJson as unknown as RootData;
const COLORS = [
  'var(--color-red)',
  'var(--color-yellow)',
  'var(--color-green)',
  'var(--color-blue)',
  'var(--color-orange)',
  'var(--color-purple)'
];

function createId(str: string) {
  return 'a-' + str.toString().replace(/[!-/:-@\\[-`{-~ \s]/g, '-');
}

@customElement('lit-music-app')
export class LitMusicApp extends LitElement {
  @state()
  private activeTab: 'camp' | 'school' | 'event' = 'camp';

  @state()
  private playerQueue: QueuedSong[] = [];

  @state()
  private currentSongIndex: number = 0;

  @state()
  private currentEventName: string = '';

  @state()
  private playerQueueTab: 'camp' | 'school' | 'event' | '' = '';

  @state()
  private videoOffsetTop = 0;

  @state()
  private isLoaded: boolean = false;

  @state()
  private splashActive: boolean = true;

  @state()
  private loadingWord: string = '';

  @state()
  private isMarkdownModalOpen = false;

  @state()
  private markdownModalContent = '';

  @state()
  private markdownModalTitle = '';

  @state()
  private isMVMode: boolean = false;

  @state()
  private isMobile: boolean = window.innerWidth <= 768;

  @state()
  private navigationTop: number = 0;

  @state()
  private introProgress: number = 0;

  @state()
  private isAtPageTop: boolean = true;

  constructor() {
    super();
    const msgs = loadingWords || ["なんと！　ななんと！　なななんと！"];
    this.loadingWord = msgs[Math.floor(Math.random() * msgs.length)];
  }

  private get currentPlayingSong(): QueuedSong | undefined {
    return this.playerQueue[this.currentSongIndex];
  }

  private syncResponsiveMode() {
    const nextIsMobile = window.innerWidth <= 768;
    if (nextIsMobile !== this.isMobile) {
      this.isMobile = nextIsMobile;
    }

    if (this.isMobile) {
      this.classList.remove('mv-active');
    } else if (this.isMVMode) {
      this.classList.add('mv-active');
    } else {
      this.classList.remove('mv-active');
    }
  }

  private handleResize = () => {
    this.syncResponsiveMode();
    this.updateIntroProgress();
    this.updateNavigationTop();
  }

  private handleScroll = () => {
    this.updateIntroProgress();
  }

  private updateIntroProgress() {
    const progress = Math.min(window.scrollY / window.innerHeight, 1);
    if (progress !== this.introProgress) {
      this.introProgress = progress;
    }

    const atTop = window.scrollY <= 1;
    if (atTop !== this.isAtPageTop) {
      this.isAtPageTop = atTop;
    }
  }

  private updateNavigationTop() {
    this.navigationTop = 184;
  }

  firstUpdated() {
    this.updateIntroProgress();
    this.updateNavigationTop();

    setTimeout(() => {
      const mark = this.shadowRoot?.querySelector('#mark') as HTMLElement;
      if (mark) {
        const markRect = mark.getBoundingClientRect();
        mark.style.transform = `translateX(${window.innerWidth / 2 - markRect.left}px) translateX(-50%)`;
      }

      setTimeout(() => {
        this.isLoaded = true;
        setTimeout(() => {
          if (mark) {
            mark.style.transition = 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)';
            mark.style.transform = 'none';
          }
          this.splashActive = false;
        }, 300);
      }, 2000);
    }, 50);
  }

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      padding-bottom: 100px; /* space for player */
      transition: padding-right 0.3s ease;
    }

    :host(.mv-active) {
      /* Padding moved to children to avoid squashing the whole container */
    }

    :host(.mv-active) .lit-header {
      width: 50%;
      padding-right: 1rem;
      box-sizing: border-box;
    }

    :host(.mv-active) .lit-main {
      max-width: none;
      margin: 0;
      width: 50%;
      padding-right: 1rem;
      box-sizing: border-box;
    }

    :host(.mv-active) #navigations {
      right: calc(50% + 1rem);
    }

    @media (max-width: 768px) {
      :host {
        padding-bottom: 0; /* Player bar is hidden on mobile */
        position: relative; /* Ensure absolute positioning works for lit-player */
      }
      :host(.mv-active) {
        padding-bottom: 0;
      }
      :host(.mv-active) .lit-header {
        width: 100%;
        padding-right: 0;
      }
      :host(.mv-active) .lit-main {
        width: 100%;
        padding-right: 0;
        box-sizing: border-box;
      }
      :host(.mv-active) #navigations {
        display: none;
      }

      .lit-main {
        padding-right: 0;
        box-sizing: border-box;
      }
    }

    .lit-modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
    }
    .lit-modal-content {
      background: var(--color-surface);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 600px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: modalFadeIn 0.2s ease-out;
    }
    @keyframes modalFadeIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .lit-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--color-border);
      background: var(--color-background);
    }
    .lit-modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--color-text-primary);
    }
    .lit-modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--color-text-secondary);
    }
    .lit-modal-close:hover {
      color: var(--color-text-primary);
    }
    .lit-modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      color: var(--color-text-primary);
      line-height: 1.6;
    }
    .lit-modal-body p {
      margin-top: 0;
    }

    .lit-header {
      background: var(--color-surface);
      box-shadow: var(--shadow-sm);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      height: calc((1 - var(--intro-progress, 0)) * 100vh + var(--intro-progress, 0) * 128px);
      transition: box-shadow var(--transition-fast);
    }

    .lit-header__inner {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .lit-intro-spacer {
      width: 100%;
      height: 100vh;
    }

    .lit-header__logos {
      display: flex;
      align-items: center;
      gap: 0;
      padding: 0;
      height: 56px;
      transform: scale(calc(1 - (var(--intro-progress, 0) * 0.28)));
      transform-origin: center;
      margin-bottom: calc((1 - var(--intro-progress, 0)) * 1.5rem + var(--intro-progress, 0) * 0.35rem);
    }

    .lit-scroll-down {
      position: absolute;
      bottom: 150px;
      left: 50%;
      transform: translateX(-50%);
      border: none;
      background: transparent;
      color: var(--color-text-secondary);
      padding: 0.2rem 0.4rem;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 0.1rem;
      cursor: pointer;
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.03em;
      line-height: 1;
      transition: opacity var(--transition-fast), transform var(--transition-fast);
      opacity: 0.62;
    }

    .lit-scroll-down:hover {
      transform: translateX(-50%) translateY(-1px);
      opacity: calc((1 - var(--intro-progress, 0)) * 0.82);
    }

    .lit-scroll-down__chevron {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;
      margin-top: 1px;
    }

    .lit-scroll-down__chevron-line {
      width: 6px;
      height: 6px;
      border-right: 1px solid currentColor;
      border-bottom: 1px solid currentColor;
      transform: rotate(45deg);
    }

    .lit-scroll-down--hidden {
      opacity: 0;
      pointer-events: none;
      transform: translateX(-50%);
    }

    .lit-header__logos img {
      height: 100%;
    }

    /* Splash & Loading Animations */
    #loading {
      width: 100vw;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      background: #fff;
      z-index: 9999;
      transition: opacity 0.5s, visibility 0.5s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #loading.loaded {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    #loading img {
      height: 60px;
    }

    #loading-message {
      position: absolute;
      bottom: 20%;
      font-weight: bold;
      text-align: center;
      width: 100%;
      opacity: 0.5;
      color: #333;
    }

    .lit-header__logos #logo,
    .lit-header__logos #music {
      transition: opacity 1s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1s cubic-bezier(0.2, 0.8, 0.2, 1);
      opacity: 1;
      transform: translateX(0);
    }

    .lit-header__logos.splash-active #logo {
      opacity: 0;
      transform: translateX(-20px);
    }

    .lit-header__logos.splash-active #music {
      opacity: 0;
      transform: translateX(20px);
    }

    .lit-tabs {
      display: flex;
      gap: 8px;
      background: #f1f5f9;
      padding: 4px;
      border-radius: var(--radius-full);
    }

    @media (max-width: 768px) {
      .lit-scroll-down {
        bottom: 2.75rem;
      }
    }

    .lit-tabs__button {
      border: none;
      background: transparent;
      padding: 8px 24px;
      font-size: 1rem;
      font-weight: bold;
      color: var(--color-text-secondary);
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: var(--transition-fast);
    }

    .lit-tabs__button--active {
      background: var(--color-surface);
      color: var(--color-blue);
      box-shadow: var(--shadow-sm);
    }

    .lit-tabs__button:hover:not(.lit-tabs__button--active) {
      color: var(--color-text-primary);
    }

    .lit-main {
      max-width: 800px;
      margin: 0 auto;
      padding: 128px 1rem 2rem;
    }

    .lit-controls {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 2rem;
    }

    .lit-btn-random {
      background: var(--color-blue);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: var(--radius-full);
      font-weight: bold;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: var(--shadow-sm);
      transition: var(--transition-fast);
    }

    .lit-btn-random:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      background: #004ecc;
    }

    .lit-footer {
      background: #f1f5f9;
      padding: 3rem 1rem;
      text-align: center;
      margin-top: 4rem;
      border-top: 1px solid #e2e8f0;
      color: var(--color-text-secondary);
    }

    .lit-footer__inner {
      max-width: 800px;
      margin: 0 auto;
    }

    #thanks {
      font-size: 2rem;
      font-weight: 800;
      margin-bottom: 2rem;
      text-transform: uppercase;
      letter-spacing: 0;
    }

    .copyright {
      font-size: 0.8rem;
      margin-top: 2rem;
    }

    .colorful {
      display: inline-block;
      transition: transform 0.3s;
    }

    .colorful:hover {
      transform: translateY(-5px);
    }

    .colorful:nth-child(6n+1) { color: var(--color-red); }
    .colorful:nth-child(6n+2) { color: var(--color-yellow); }
    .colorful:nth-child(6n+3) { color: var(--color-green); }
    .colorful:nth-child(6n+4) { color: var(--color-blue); }
    .colorful:nth-child(6n+5) { color: var(--color-orange); }
    .colorful:nth-child(6n+0) { color: var(--color-purple); }

    .icon-gh {
      height: 1.2em;
      vertical-align: middle;
    }

    .lit-footer a {
      color: var(--color-blue);
      text-decoration: none;
      font-weight: bold;
    }

    .lit-footer a:hover {
      text-decoration: underline;
    }

    /* Right Navigation similar to v1 */
    #navigations {
      position: fixed;
      display: flex;
      align-items: flex-end;
      flex-direction: column;
      top: 50%;
      transform: translateY(-50%);
      right: 1em;
      z-index: 110;
      padding: 0;
      margin: 0;
      list-style: none;
      font-size: 0.8em;
    }

    .nav-year {
      cursor: pointer;
      position: relative;
      margin: 0.5em 0;
      display: grid;
      grid-template-columns: min-content;
      grid-template-rows: 2em;
      z-index: 1;
    }

    .nav-year:hover {
      z-index: 10;
    }

    .nav-year > a.year-main-link {
      grid-column: 1;
      grid-row: 1;
      background: var(--theme-color);
      border: solid 2px var(--theme-color);
      color: #fff;
      border-radius: 2em;
      text-decoration: none;
      display: flex;
      align-items: center;
      height: 2em;
      min-width: 2em;
      box-sizing: border-box;
      transition: background 0.4s, color 0.4s, border-radius 0.4s ease;
      position: relative;
      z-index: 2;
    }

    .nav-year > a.year-main-link .label {
      display: none;
      padding: 0.5em;
      flex: 1;
      text-align: left;
      font-weight: bold;
    }

    .nav-year > a.year-main-link .short-label {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      font-weight: bold;
    }

    .nav-year:hover > a.year-main-link {
      background: #fff;
      color: var(--theme-color);
      border-radius: 2em 2em 2em 0;
    }

    .nav-year.no-panel:hover > a.year-main-link {
      border-radius: 2em;
    }

    .nav-year:hover > a.year-main-link .label {
      display: block;
    }

    .nav-year:hover > a.year-main-link .short-label {
      display: none;
    }

    .nav-year .sub-nav-panel {
      grid-column: 1;
      grid-row: 1;
      align-self: start;
      justify-self: stretch;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      max-width: 0;
      max-height: 0;
      opacity: 0;
      background: var(--theme-color);
      border-radius: 0 0 0.5em 0.5em;
      margin-right: 2em;
      margin-top: calc(2em - 2px);
      transition: max-width 0.4s ease, max-height 0.4s ease, opacity 0.3s ease, margin-right 0.4s ease;
      white-space: nowrap;
      z-index: 1;
    }

    .nav-year:hover .sub-nav-panel {
      max-width: 500px;
      max-height: 500px;
      opacity: 1;
      margin-right: 2.8em;
    }

    .nav-year .sub-nav-panel a {
      color: #fff;
      text-decoration: none;
      font-size: 0.85em;
      font-weight: 500;
      padding: 0.4em 1em;
      transition: background 0.2s;
      border-bottom: 1px solid rgba(255, 255, 255, 0.4);
      text-align: left;
    }

    .nav-year .sub-nav-panel a:last-child {
      border-bottom: none;
    }

    .nav-year .sub-nav-panel a:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `;

  private setTab(tab: 'camp' | 'school' | 'event') {
    this.activeTab = tab;
    this.scrollToContentStart();
  }

  private handlePlayRandom() {
    const allSongs = this.buildTabQueue();

    // Shuffle
    for (let i = allSongs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
    }

    const playableSongs = allSongs.filter(s => s.youtubeUrl && s.youtubeUrl.match(/(?:\/\/|https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/));

    if (playableSongs.length > 0) {
      this.playerQueue = playableSongs;
      this.currentSongIndex = 0;
      this.playerQueueTab = this.activeTab;
      this.currentEventName = this.playerQueue[0]?.eventName || '';

      const player = this.shadowRoot?.querySelector('lit-player') as any;
      if (!this.isMobile && player && typeof player.playSongImmediately === 'function') {
        player.playSongImmediately(this.playerQueue, this.currentSongIndex);
      }
    } else {
      alert('No playable songs found in this category.');
    }
  }

  async updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('currentSongIndex')) {
      await this.updateComplete;
      this.scrollToCurrentSong();
    }
  }

  private scrollToCurrentSong() {
    // Only scroll if we are in the same tab as the queue
    if (this.activeTab !== this.playerQueueTab) return;

    const currentSong = this.playerQueue[this.currentSongIndex] as any;
    if (!currentSong || !currentSong.eventName) return;

    const el = this.shadowRoot?.querySelector(`[data-event="${currentSong.eventName}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  private buildTabQueue(): QueuedSong[] {
    const queue: QueuedSong[] = [];
    const currentYearsData = allData[this.activeTab];
    const sortedYearsData = Object.entries(currentYearsData)
      .sort(([yearA], [yearB]) => {
        if (yearA === '番外編') return 1;
        if (yearB === '番外編') return -1;
        return parseInt(yearB) - parseInt(yearA);
      });

    for (const [year, events] of sortedYearsData) {
      const sortedEvents = [...events].sort((a, b) => {
        const getSeasonRank = (name: string) => {
          if (name.includes('Winter')) return 4;
          if (name.includes('Autumn')) return 3;
          if (name.includes('Summer')) return 2;
          if (name.includes('Spring')) return 1;
          return 0;
        };
        return getSeasonRank(b.name) - getSeasonRank(a.name);
      });

      for (const ev of sortedEvents) {
        for (const song of ev.songs) {
          queue.push({ ...song, eventName: ev.name });
        }
      }
    }
    return queue;
  }

  private handlePlaySongWithQueue(e: CustomEvent<{ song: Song, eventName: string }>) {
    const fullQueue = this.buildTabQueue();
    this.playerQueue = fullQueue;
    this.playerQueueTab = this.activeTab;
    this.currentSongIndex = fullQueue.findIndex(s => s.title === e.detail.song.title && s.eventName === e.detail.eventName);
    if (this.currentSongIndex === -1) this.currentSongIndex = 0;
    this.currentEventName = e.detail.eventName;

    const player = this.shadowRoot?.querySelector('lit-player') as any;
    if (!this.isMobile && player && typeof player.playSongImmediately === 'function') {
      player.playSongImmediately(this.playerQueue, this.currentSongIndex);
    }
  }

  private scrollToId(e: Event, id: string) {
    e.preventDefault();
    const el = this.shadowRoot?.querySelector('#' + id);
    if (el) {
      const header = this.shadowRoot?.querySelector('.lit-header') as HTMLElement | null;
      const headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 128;
      const safeMargin = 24;
      const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - safeMargin;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  private scrollToEvent(e: Event, eventName: string) {
    e.preventDefault();
    const el = this.shadowRoot?.querySelector(`[data-event="${eventName}"]`);
    if (el) {
      const header = this.shadowRoot?.querySelector('.lit-header') as HTMLElement | null;
      const headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 128;
      const safeMargin = 24;
      const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - safeMargin;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  private async handleOpenMarkdown(e: CustomEvent<{ url: string }>) {
    const url = e.detail.url;
    const filename = url.split('/').pop() || 'Markdown';
    this.markdownModalTitle = decodeURIComponent(filename.replace(/\.md$/i, ''));
    this.isMarkdownModalOpen = true;
    this.markdownModalContent = '<p>Loading...</p>';

    try {
      // relative URL fetching
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network error');
      const text = await res.text();
      this.markdownModalContent = await marked.parse(text, { breaks: true });
    } catch (err) {
      this.markdownModalContent = '<p style="color:var(--color-red)">Failed to load content.</p>';
    }
  }

  private closeMarkdownModal() {
    this.isMarkdownModalOpen = false;
  }

  private scrollToContentStart() {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  }

  private renderLogoGroup(animated = false) {
    const base = import.meta.env.BASE_URL;
    if (animated) {
      return html`
        <div class="lit-header__logos ${this.splashActive ? 'splash-active' : ''}">
          <img src="${base}res/img/mark.svg" alt="Mark" id="mark">
          <img src="${base}res/img/logo.svg" alt="Life is Tech!" id="logo">
          <img src="${base}res/img/music.svg" alt="music" id="music">
        </div>
      `;
    }

    return html`
      <div class="lit-header__logos">
        <img src="${base}res/img/mark.svg" alt="Mark">
        <img src="${base}res/img/logo.svg" alt="Life is Tech!">
        <img src="${base}res/img/music.svg" alt="music">
      </div>
    `;
  }

  private renderTabButtons() {
    return html`
      <div class="lit-tabs">
        <button 
          class="lit-tabs__button ${this.activeTab === 'camp' ? 'lit-tabs__button--active' : ''}"
          @click=${() => this.setTab('camp')}
        >
          Camp
        </button>
        <button 
          class="lit-tabs__button ${this.activeTab === 'school' ? 'lit-tabs__button--active' : ''}"
          @click=${() => this.setTab('school')}
        >
          School
        </button>
        <button 
          class="lit-tabs__button ${this.activeTab === 'event' ? 'lit-tabs__button--active' : ''}"
          @click=${() => this.setTab('event')}
        >
          Event
        </button>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.syncResponsiveMode();
    this.addEventListener('video-position-changed', this.handleVideoPositionChanged as EventListener);
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('resize', this.handleResize);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('video-position-changed', this.handleVideoPositionChanged as EventListener);
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
  }

  private handleVideoPositionChanged = (e: CustomEvent<{ top: number }>) => {
    const appRect = this.getBoundingClientRect();
    // e.detail.top is the absolute document Y coordinate.
    // appRect.top + window.scrollY is the absolute document Y coordinate of lit-app.
    const appAbsoluteTop = appRect.top + window.scrollY;
    this.videoOffsetTop = e.detail.top - appAbsoluteTop;
  }

  render() {
    const currentYearsData = allData[this.activeTab];

    const sortedYears = Object.entries(currentYearsData)
      .sort(([yearA], [yearB]) => {
        if (yearA === '番外編') return 1;
        if (yearB === '番外編') return -1;
        return parseInt(yearB) - parseInt(yearA);
      });

    const isScrollDownVisible = this.isAtPageTop;
    const isSideNavVisible = this.introProgress > 0.92;

    const base = import.meta.env.BASE_URL;
    return html`
      <div id="loading" class="${this.isLoaded ? 'loaded' : ''}">
        <p id="loading-message">${this.loadingWord}</p>
        <img src="${base}res/img/loading.svg" alt="Loading">
      </div>

      <header class="lit-header" style="--intro-progress: ${this.introProgress};">
        <div class="lit-header__inner">
          ${this.renderLogoGroup(true)}
          ${this.renderTabButtons()}
          <button class="lit-scroll-down ${isScrollDownVisible ? '' : 'lit-scroll-down--hidden'}" @click=${this.scrollToContentStart} aria-label="Scroll down">
            <span>School Down</span>
            <span class="lit-scroll-down__chevron" aria-hidden="true">
              <span class="lit-scroll-down__chevron-line"></span>
              <span class="lit-scroll-down__chevron-line"></span>
            </span>
          </button>
        </div>
      </header>

      <div class="lit-intro-spacer"></div>

      ${!this.isMobile ? html`
      <ul id="navigations" style="${this.navigationTop ? `--nav-top: ${this.navigationTop}px;` : ''} opacity: ${isSideNavVisible ? 1 : 0}; pointer-events: ${isSideNavVisible ? 'auto' : 'none'}; transition: opacity var(--transition-fast);">
        <li class="nav-year no-panel" style="--theme-color: #333;">
          <a class="year-main-link" href="#" @click=${(e: Event) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <span class="label">TOP</span>
            <span class="short-label">${arrowUpIcon}</span>
          </a>
        </li>
        ${sortedYears.map(([year, _events], index) => {
      const color = COLORS[index % COLORS.length];
      const sortedEvents = [..._events].sort((a, b) => {
        const getSeasonRank = (name: string) => {
          if (name.includes('Winter')) return 4;
          if (name.includes('Autumn')) return 3;
          if (name.includes('Summer')) return 2;
          if (name.includes('Spring')) return 1;
          return 0;
        };
        return getSeasonRank(b.name) - getSeasonRank(a.name);
      });
      return html`
            <li class="nav-year" style="--theme-color: ${color};">
              <a class="year-main-link" href="#" @click=${(e: Event) => { this.scrollToId(e, createId('year-' + year)); }}>
                <span class="label">${year}</span>
                <span class="short-label">${isNaN(Number(year)) ? starIcon : year.slice(-2)}</span>
              </a>
              <div class="sub-nav-panel">
                ${sortedEvents.map(ev => html`
                  <a href="#" @click=${(e: Event) => { e.preventDefault(); e.stopPropagation(); this.scrollToEvent(e, ev.name); }}>
                    ${ev.name}
                  </a>
                `)}
              </div>
            </li>
          `;
    })}
        <li class="nav-year no-panel" style="--theme-color: #333;">
          <a class="year-main-link" href="#" @click=${(e: Event) => { e.preventDefault(); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }}>
            <span class="label">Thanks!</span>
            <span class="short-label">!</span>
          </a>
        </li>
      </ul>
      ` : ''}

      <main class="lit-main" @open-markdown=${this.handleOpenMarkdown}>
        ${sortedYears.map(([year, events]) => {
      const sortedEvents = [...events].sort((a, b) => {
        const getSeasonRank = (name: string) => {
          if (name.includes('Winter')) return 4;
          if (name.includes('Autumn')) return 3;
          if (name.includes('Summer')) return 2;
          if (name.includes('Spring')) return 1;
          return 0;
        };
        return getSeasonRank(b.name) - getSeasonRank(a.name);
      });

      return html`
            <h2 id="${createId('year-' + year)}" style="text-align:center; font-size: 2rem; margin: 3rem 0 1rem; color: var(--color-blue);">${year}</h2>
            ${sortedEvents.map(ev => html`
              <div data-event="${ev.name}">
                <lit-event-card 
                  .event=${{ ...ev, year }}
                  .playingSongTitle=${this.currentPlayingSong?.title || ''}
                  .playingEventName=${this.currentPlayingSong?.eventName || this.currentEventName}
                  .isMobile=${this.isMobile}
                  @play-song-queue=${this.handlePlaySongWithQueue}
                ></lit-event-card>
              </div>
            `)}
          `;
    })}
      </main>

      ${this.isMarkdownModalOpen ? html`
        <div class="lit-modal-overlay" @click=${this.closeMarkdownModal}>
          <div class="lit-modal-content" @click=${(e: Event) => e.stopPropagation()}>
            <div class="lit-modal-header">
              <h3>${this.markdownModalTitle}</h3>
              <button class="lit-modal-close" @click=${this.closeMarkdownModal}>&times;</button>
            </div>
            <div class="lit-modal-body" .innerHTML=${this.markdownModalContent}></div>
          </div>
        </div>
      ` : ''}

      <footer class="lit-footer">
        <div class="lit-footer__inner">
          <p id="thanks">
            ${Array.from("Thanks for visiting!").map(char => html`
              <span class="colorful" style="${char === ' ' ? 'margin-right:0.5em;' : ''}">${char}</span>
            `)}
          </p>
          <p>
            Do you have any information?<br>
            Tell me on <a href="https://www.facebook.com/LiTmusic-182225395894104" target="_blank" rel="noopener">Facebook</a>,<br>
            or<br>
            You can check it on <a href="https://github.com/lit-kansai-members/music" target="_blank" rel="noopener">
              <img src="${base}res/img/github-mark.svg" alt="GitHub" class="icon-gh"> GitHub
            </a>.<br>
            <br>
            曲はこちらからリクエストできます！<br>
            <a href="${base}post/">→掲載をリクエストする (GitHubアカウントが必要です)</a><br>
            <br>
            <small>This project is unofficial.</small>
          </p>
          <p class="copyright">&copy; Life is Tech ! Kansai Members</p>
        </div>
      </footer>

      ${!this.isMobile ? html`
      <lit-player 
        style="--video-offset-top: ${this.videoOffsetTop}px;"
        .queue=${this.playerQueue}
        .currentIndex=${this.currentSongIndex}
        .eventName=${this.currentEventName}
        @index-changed=${(e: CustomEvent<{ index: number }>) => { this.currentSongIndex = e.detail.index; }}
        @mv-mode-changed=${(e: CustomEvent<{ active: boolean }>) => {
          this.isMVMode = e.detail.active;
          if (this.isMVMode) {
            this.classList.add('mv-active');
          } else {
            this.classList.remove('mv-active');
          }
        }}
      ></lit-player>
      ` : ''}
    `;
  }
}
