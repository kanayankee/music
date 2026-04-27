import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { fontAwesomeLink } from '../styles/shared-styles';
import dataJson from '../data/index.json';
import loadingWords from '../data/loading.json';
import { RootData, EventData, Song } from '../types';

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
  private playerQueue: Song[] = [];

  @state()
  private currentSongIndex: number = 0;

  @state()
  private expandedNavIndex: number | null = null;

  @state()
  private currentEventName: string = '';

  @state()
  private playerQueueTab: 'camp' | 'school' | 'event' | '' = '';

  @state()
  private isLoaded: boolean = false;

  @state()
  private splashActive: boolean = true;

  @state()
  private loadingWord: string = '';

  constructor() {
    super();
    const msgs = loadingWords || ["なんと！　ななんと！　なななんと！"];
    this.loadingWord = msgs[Math.floor(Math.random() * msgs.length)];
  }

  firstUpdated() {
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
    }

    .lit-header {
      background: var(--color-surface);
      box-shadow: var(--shadow-sm);
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
    }

    .lit-header__logos {
      display: flex;
      align-items: center;
      gap: 0;
      padding: 0;
      height: 40px;
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
      margin-top: 1rem;
      background: #f1f5f9;
      padding: 4px;
      border-radius: var(--radius-md);
    }

    .lit-tabs__button {
      border: none;
      background: transparent;
      padding: 8px 24px;
      font-size: 1rem;
      font-weight: bold;
      color: var(--color-text-secondary);
      border-radius: var(--radius-sm);
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
      padding: 2rem 1rem;
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
      z-index: 90;
      padding: 0;
      margin: 0;
      list-style: none;
      font-size: 0.8em;
    }

    .nav-year {
      cursor: pointer;
      position: relative;
      line-height: 1.5;
      transition: 0.4s;
      height: 1.5em;
      margin: 0.5em 0;
      border-radius: 1em;
      color: #fff;
      border: solid 2px;
      display: flex;
      justify-content: flex-end;
    }

    .nav-year > a {
      color: inherit;
      text-decoration: none;
      display: flex;
      align-items: center;
      padding: 0 0.5em;
      white-space: nowrap;
    }

    .nav-year > a .label {
      padding-right: 0.5em;
      display: none;
    }
    
    .nav-year.expanded > a .label {
      display: inline;
    }

    .nav-year.expanded {
      background: #fff;
    }

    .nav-events {
      position: absolute;
      right: 0;
      top: 1.5em;
      padding: 0.5em;
      border-radius: 0 0 0.5em 0.5em;
      list-style: none;
      margin: 0;
      display: none;
    }

    .nav-year.expanded .nav-events {
      display: block;
    }

    .nav-event {
      white-space: nowrap;
      border-top: solid 1px #fff;
    }
    .nav-event:first-child { border: none; }
    .nav-event a {
      color: #fff;
      text-decoration: none;
      display: block;
      padding: 0.3em;
    }
    .nav-event a:hover {
      background: rgba(255,255,255,0.2);
    }
  `;

  private setTab(tab: 'camp' | 'school' | 'event') {
    this.activeTab = tab;
    this.expandedNavIndex = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private handlePlayRandom() {
    const currentYearsData = allData[this.activeTab];
    const allSongs = Object.values(currentYearsData).flatMap(events => events.flatMap(e => e.songs));

    // Shuffle
    for (let i = allSongs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
    }

    const playableSongs = allSongs.filter(s => s.description.match(/\/\/youtu\.be\/([\w-]+)/));

    if (playableSongs.length > 0) {
      this.playerQueue = playableSongs;
      this.currentSongIndex = 0;
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

  private buildTabQueue(): any[] {
    const queue: any[] = [];
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
  }

  private toggleNav(index: number) {
    if (this.expandedNavIndex === index) {
      this.expandedNavIndex = null;
    } else {
      this.expandedNavIndex = index;
    }
  }

  private scrollToId(e: Event, id: string) {
    e.preventDefault();
    const el = this.shadowRoot?.querySelector('#' + id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  render() {
    const currentYearsData = allData[this.activeTab];
    const sortedYears = Object.entries(currentYearsData)
      .sort(([yearA], [yearB]) => {
        if (yearA === '番外編') return 1;
        if (yearB === '番外編') return -1;
        return parseInt(yearB) - parseInt(yearA);
      });

    const base = import.meta.env.BASE_URL;
    return html`
      ${fontAwesomeLink}
      <div id="loading" class="${this.isLoaded ? 'loaded' : ''}">
        <p id="loading-message">${this.loadingWord}</p>
        <img src="${base}res/img/loading.svg" alt="Loading">
      </div>

      <header class="lit-header">
        <div class="lit-header__logos ${this.splashActive ? 'splash-active' : ''}">
          <img src="${base}res/img/mark.svg" alt="Mark" id="mark">
          <img src="${base}res/img/logo.svg" alt="Life is Tech!" id="logo">
          <img src="${base}res/img/music.svg" alt="music" id="music">
        </div>
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
      </header>

      <ul id="navigations">
        <li class="nav-year" style="border-color: #333; color: #333;">
          <a href="#" @click=${(e: Event) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <span class="label">TOP</span>
            <i class="fa-solid fa-arrow-up"></i>
          </a>
        </li>
        ${sortedYears.map(([year, events], index) => {
      const color = COLORS[index % COLORS.length];
      const isExpanded = this.expandedNavIndex === index;
      return html`
            <li class="nav-year ${isExpanded ? 'expanded' : ''}" 
                style="background: ${isExpanded ? '#fff' : color}; border-color: ${color};"
            >
              <a href="#" style="color: ${isExpanded ? color : '#fff'};" @click=${(e: Event) => this.scrollToId(e, createId('year-' + year))}>
                <span class="label">${year}</span>
                <span>${isNaN(Number(year)) ? html`<i class="fa-solid fa-star"></i>` : year.slice(-2)}</span>
              </a>
              <ul class="nav-events" style="background: ${color};">
                ${events.map(ev => html`
                  <li class="nav-event">
                    <a href="#" @click=${(e: Event) => this.scrollToId(e, createId(ev.name))}>${ev.name}</a>
                  </li>
                `)}
              </ul>
            </li>
          `;
    })}
      </ul>

      <main class="lit-main">
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
                  @play-song-queue=${this.handlePlaySongWithQueue}
                ></lit-event-card>
              </div>
            `)}
          `;
        })}
      </main>

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

      <lit-player 
        .queue=${this.playerQueue}
        .currentIndex=${this.currentSongIndex}
        .eventName=${this.currentEventName}
        @index-changed=${(e: CustomEvent<{ index: number }>) => { this.currentSongIndex = e.detail.index; }}
      ></lit-player>
    `;
  }
}
