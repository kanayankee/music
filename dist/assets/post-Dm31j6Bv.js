import"./modulepreload-polyfill-B5Qt9EMX.js";const q=document.getElementById("songs-container"),k=document.getElementById("add-song-btn");function y(){var t;const e=document.createElement("div");e.className="song-block",e.style.padding="1rem",e.style.border="1px solid #e2e8f0",e.style.marginBottom="1rem",e.style.borderRadius="8px",e.style.background="#f8fafc",e.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h3 style="margin: 0; font-size: 1rem; color: #475569;">曲</h3>
      <button type="button" class="del-song-btn" style="background: transparent; color: #ef4444; border: 1px solid #ef4444; padding: 0.2rem 0.6rem; width: auto; font-size: 0.8rem; margin: 0;">削除</button>
    </div>
    <div class="field">
      <label>曲名 <span style="color:red">*</span></label>
      <input type="text" class="s-title" placeholder="偉星人" required>
    </div>
    <div class="field">
      <label>アーティスト <span class="optional">(任意)</span></label>
      <input type="text" class="s-author" placeholder="Vaundy">
    </div>
    <div class="field-row" style="display:flex; gap:1rem;">
      <div class="field" style="flex:1;">
        <label>YouTube URL <span class="optional">(任意)</span></label>
        <input type="url" class="s-youtube" placeholder="https://youtu.be/xxxxxx">
      </div>
      <div class="field" style="flex:1;">
        <label>Spotify URL <span class="optional">(任意)</span></label>
        <input type="url" class="s-spotify" placeholder="https://open.spotify.com/...">
      </div>
    </div>
    <div class="field-row" style="display:flex; gap:1rem;">
      <div class="field" style="flex:1;">
        <label>DAM カラオケ番号 <span class="optional">(ない場合は空欄でOK)</span></label>
        <input type="text" class="s-damNum" placeholder="1234-56">
      </div>
      <div class="field" style="flex:1;">
        <label>DAM ページURL <span class="optional">(任意)</span></label>
        <input type="url" class="s-damUrl" placeholder="https://www.clubdam.com/...">
      </div>
    </div>
    <div class="field-row" style="display:flex; gap:1rem;">
      <div class="field" style="flex:1;">
        <label>JOYSOUND カラオケ番号 <span class="optional">(ない場合は空欄でOK)</span></label>
        <input type="text" class="s-joyNum" placeholder="123456">
      </div>
      <div class="field" style="flex:1;">
        <label>JOYSOUND ページURL <span class="optional">(任意)</span></label>
        <input type="url" class="s-joyUrl" placeholder="https://www.joysound.com/...">
      </div>
    </div>
    <div class="field">
      <label>歌詞リンク URL <span class="optional">(任意)</span></label>
      <input type="url" class="s-lyricsUrl" placeholder="https://j-lyric.net/...">
    </div>
    <div class="field">
      <label>曲の概要 (Markdown可) <span class="optional">(任意)</span></label>
      <input type="text" class="s-songDesc" placeholder="映画「○○」主題歌">
    </div>
  `,(t=e.querySelector(".del-song-btn"))==null||t.addEventListener("click",()=>{e.remove()}),q.appendChild(e)}y();k.addEventListener("click",y);var u;(u=document.getElementById("post-form"))==null||u.addEventListener("submit",e=>{e.preventDefault();const t=document.getElementById("eventName").value,p=`Add: ${t}`,r=document.getElementById("backgroundUrl").value,o={name:t};r?o.background=r:o.background="";const m=Array.from(document.querySelectorAll(".song-block")).map(l=>{const f=l.querySelector(".s-title").value,g=l.querySelector(".s-author").value,n=l.querySelector(".s-youtube").value,h=l.querySelector(".s-spotify").value,U=l.querySelector(".s-damNum").value,x=l.querySelector(".s-damUrl").value,S=l.querySelector(".s-joyNum").value,j=l.querySelector(".s-joyUrl").value,c=l.querySelector(".s-lyricsUrl").value,N=l.querySelector(".s-songDesc").value;let i="";if(n){const s=n.match(/(?:(?:youtu\.be\/)|(?:v=))([a-zA-Z0-9_-]{11})/);s?i=`//youtu.be/${s[1]}`:i=n}let d="";if(c)try{d=new URL(c).hostname}catch{d="歌詞サイト"}const a={title:f,author:g,description:N,spotify:h||void 0,damNumber:U||"",damUrl:x||"",joyNumber:S||"",joyUrl:j||"",lyricsSiteName:d||void 0,lyricsUrl:c||void 0,youtubeUrl:i||void 0};return Object.keys(a).forEach(s=>a[s]===void 0&&delete a[s]),a});o.songs=m;const b=`以下のイベント/曲の追加をお願いします。

\`\`\`json
${JSON.stringify(o,null,2)}
\`\`\`
`,v=`https://github.com/lit-kansai-members/music/issues/new?title=${encodeURIComponent(p)}&labels=New%20Song%20Request&body=${encodeURIComponent(b)}`;window.open(v,"_blank")});
