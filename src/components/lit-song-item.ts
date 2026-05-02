import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { RootData, EventData, Song } from '../types';
import { marked } from 'marked';
import { spotifyIcon, playIcon } from '../styles/icons';

@customElement('lit-song-item')
export class LitSongItem extends LitElement {
  @property({ type: Object }) song!: Song;

  static styles = css`
    :host {
      display: block;
    }

    .lit-song {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      transition: var(--transition-fast);
      background: #fafafa;
      position: relative;
    }

    .lit-song--playable {
      cursor: pointer;
    }

    .lit-song:hover {
      background: var(--color-surface);
      box-shadow: var(--shadow-sm);
      border-color: var(--color-blue);
    }

    .lit-song__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .lit-song__title-wrap {
      display: flex;
      align-items: baseline;
      gap: 0.8rem;
    }

    .lit-song__title {
      font-size: 1.25rem;
      font-weight: bold;
      margin: 0;
      color: var(--color-text-primary);
    }

    .lit-song__author {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      margin: 0;
    }

    .lit-song__actions {
      display: flex;
      gap: 8px;
    }

    .lit-btn-action {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--color-text-secondary);
      transition: var(--transition-fast);
    }

    .lit-btn-action:hover {
      transform: scale(1.1);
    }

    .lit-btn-action--play:hover {
      color: var(--color-red);
    }

    .lit-btn-action--spotify {
      color: #1ed760;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
    }
    
    .lit-btn-action--spotify:hover {
      color: #1fdf64;
    }

    .lit-song__desc {
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }

    .lit-song__desc p {
      margin: 0.2rem 0;
    }

    .lit-song__desc a {
      color: var(--color-blue);
      text-decoration: none;
    }

    .lit-song__desc a:hover {
      text-decoration: underline;
    }
  `;

  private handlePlay() {
    this.dispatchEvent(new CustomEvent('play-song', {
      detail: { song: this.song },
      bubbles: true,
      composed: true
    }));
  }

  private handleLinkClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor) {
      e.stopPropagation();
      const href = anchor.getAttribute('href');
      if (href && href.toLowerCase().endsWith('.md')) {
        e.preventDefault();
        this.dispatchEvent(new CustomEvent('open-markdown', {
          detail: { url: href },
          bubbles: true,
          composed: true
        }));
      }
    }
  }

  render() {
    const description = this.song.description || '';
    const ytMatch = this.song.youtubeUrl?.match(/(?:\/\/|https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    const youtubeId = ytMatch ? ytMatch[1] : null;

    return html`
      <div class="lit-song ${youtubeId ? 'lit-song--playable' : ''}" @click=${youtubeId ? this.handlePlay : null}>
        <div class="lit-song__header">
          <div class="lit-song__title-wrap">
            <h4 class="lit-song__title">${this.song.title}</h4>
            <span class="lit-song__author">${this.song.author}</span>
            ${this.song.spotify ? html`
              <a href="${this.song.spotify}" target="_blank" rel="noopener noreferrer" class="lit-btn-action lit-btn-action--spotify" title="Play on Spotify" @click=${(e: Event) => e.stopPropagation()}>
                ${spotifyIcon}
              </a>
            ` : ''}
          </div>
          <div class="lit-song__actions">
            ${youtubeId ? html`
              <div class="lit-btn-action lit-btn-action--play" title="Play on YouTube">
                ${playIcon}
              </div>
            ` : ''}
          </div>
        </div>
        <div class="lit-song__desc" @click=${this.handleLinkClick}>
          ${description ? html`<div .innerHTML=${marked.parse(description, { breaks: true })}></div>` : ''}
          <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.5rem; font-size: 0.8rem; color: var(--color-text-secondary);">
              <div>
                🎤 
                [DAM] ${this.song.damNumber ? (this.song.damUrl ? html`<a href="${this.song.damUrl}" target="_blank" rel="noopener">${this.song.damNumber}</a>` : this.song.damNumber) : '404 NotFound'}
                [JOYSOUND] ${this.song.joyNumber ? (this.song.joyUrl ? html`<a href="${this.song.joyUrl}" target="_blank" rel="noopener">${this.song.joyNumber}</a>` : this.song.joyNumber) : '404 NotFound'}
              </div>
            ${this.song.lyricsUrl ? html`
              <div>
                [歌詞] <a href="${this.song.lyricsUrl}" target="_blank" rel="noopener">${this.song.lyricsSiteName || '歌詞サイト'}</a>
              </div>
            ` : ''}
            ${this.song.youtubeUrl && !youtubeId ? html`
              <div>
                [動画] <a href="${this.song.youtubeUrl}" target="_blank" rel="noopener">YouTube</a>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
}
