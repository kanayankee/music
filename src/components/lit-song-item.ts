import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Song } from '../types';
import { marked } from 'marked';
import { fontAwesomeLink } from '../styles/shared-styles';

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

  render() {
    const description = this.song.description || '';
    // Parse youtube ID from description if present
    const ytMatch = description.match(/\/\/youtu\.be\/([\w-]+)/);
    const youtubeId = ytMatch ? ytMatch[1] : null;
    
    // Strip youtube text from description
    const cleanDesc = description.replace(/^\s*\[YouTube\]\((\/\/youtu\.be\/([\w-]+))\)\s*$/mg, "");

    return html`
      ${fontAwesomeLink}
      <div class="lit-song ${youtubeId ? 'lit-song--playable' : ''}" @click=${youtubeId ? this.handlePlay : null}>
        <div class="lit-song__header">
          <div class="lit-song__title-wrap">
            <h4 class="lit-song__title">${this.song.title}</h4>
            <span class="lit-song__author">${this.song.author}</span>
            ${this.song.spotify ? html`
              <a href="${this.song.spotify}" target="_blank" rel="noopener noreferrer" class="lit-btn-action lit-btn-action--spotify" title="Play on Spotify" @click=${(e: Event) => e.stopPropagation()}>
                <i class="fab fa-spotify"></i>
              </a>
            ` : ''}
          </div>
          <div class="lit-song__actions">
            ${youtubeId ? html`
              <div class="lit-btn-action lit-btn-action--play" title="Play on YouTube">
                <i class="fas fa-play-circle"></i>
              </div>
            ` : ''}
          </div>
        </div>
        <div class="lit-song__desc" .innerHTML=${marked.parse(cleanDesc, { breaks: true })}></div>
      </div>
    `;
  }
}
