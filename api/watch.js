export default async function handler(req, res) {
  const isWhatsApp = req.headers['x-requested-with'] === 'com.whatsapp'
  if (isWhatsApp) {
    let video = decode(req.query.video);
    let dataAnime = decode(req.query.anime);
    res.send(showHTML(video, dataAnime));
  } else {
    res.json({ status: false });
  }
}

function decode(data) {
  const ngen = Buffer
    .from(data, "base64url")
    .toString("utf8");
  const json = JSON.parse(ngen);
  return json;
}

function showHTML(video, animeData) {
    const jsonString = JSON.stringify(video);
    
    return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Anime Universe Watch</title>

<style>
*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:Segoe UI,sans-serif;
}

body{
    background:#12091f;
    color:#fff;
}

.container{
    max-width:900px;
    margin:auto;
    padding:25px;
}

.title{
    font-size:28px;
    font-weight:bold;
    margin-bottom:20px;
    color:#d8b4fe;
}

/* ===== Player wrapper ===== */
.player{
    position:relative;
    width:100%;
    border-radius:18px;
    overflow:hidden;
    background:#000;
    border:2px solid #8b5cf6;
    box-shadow:0 0 30px rgba(139,92,246,.35);
}

.player.fullscreen-active{
    border-radius:0;
    border:none;
    width: 100vw;
    height: 100vh;
}

video{
    width:100%;
    display:block;
    background:#000;
    max-height:80vh;
}

.player.fullscreen-active video{
    max-height:100vh;
    height:100vh;
    object-fit: contain;
}

/* ===== Klik area buat toggle play/pause ===== */
.video-click-layer{
    position:absolute;
    inset:0;
    z-index:2;
}

/* ===== Resolusi - pojok kanan atas ===== */
.reso-wrapper{
    position:absolute;
    top:14px;
    right:14px;
    z-index:20;
    opacity:0;
    transform:translateY(-6px);
    transition:opacity .25s ease, transform .25s ease;
    pointer-events:none;
}

/* Tampilkan resolusi jika ada kelas aktif */
.player.controls-visible .reso-wrapper,
.reso-wrapper.force-visible{
    opacity:1;
    transform:translateY(0);
    pointer-events:auto;
}

/* Hover hanya untuk perangkat non-touch screen */
@media (hover: hover) {
    .player:hover:not(.user-inactive) .reso-wrapper {
        opacity:1;
        transform:translateY(0);
        pointer-events:auto;
    }
}

.reso-btn{
    display:flex;
    align-items:center;
    gap:6px;
    background:rgba(30,10,50,.75);
    border:1px solid rgba(139,92,246,.6);
    color:#e9d5ff;
    padding:8px 12px;
    border-radius:10px;
    font-size:13px;
    font-weight:600;
    cursor:pointer;
    backdrop-filter:blur(6px);
    transition:.2s;
}

.reso-btn:hover{
    background:rgba(124,58,237,.85);
    border-color:#c084fc;
}

.reso-btn svg{
    width:14px;
    height:14px;
    fill:#e9d5ff;
}

.reso-menu{
    position:absolute;
    top:calc(100% + 8px);
    right:0;
    background:rgba(20,8,38,.95);
    border:1px solid rgba(139,92,246,.5);
    border-radius:12px;
    padding:8px;
    min-width:150px;
    display:none;
    flex-direction:column;
    gap:4px;
    backdrop-filter:blur(8px);
    box-shadow:0 8px 24px rgba(0,0,0,.5);
}

.reso-menu.open{
    display:flex;
}

.reso-option{
    display:flex;
    justify-content:space-between;
    align-items:center;
    border:none;
    background:transparent;
    color:#ddd;
    padding:9px 10px;
    border-radius:8px;
    cursor:pointer;
    font-size:13px;
    transition:.15s;
}

.reso-option:hover{
    background:rgba(139,92,246,.25);
}

.reso-option.active{
    background:#7c3aed;
    color:#fff;
    box-shadow:0 0 12px rgba(147,51,234,.6);
}

.reso-option .size{
    font-size:11px;
    opacity:.7;
    margin-left:10px;
}

/* ===== Custom controls bar ===== */
.controls{
    position:absolute;
    left:0;
    right:0;
    bottom:0;
    z-index:5;
    padding:10px 14px 12px;
    background:linear-gradient(to top, rgba(0,0,0,.85), rgba(0,0,0,0));
    display:flex;
    flex-direction:column;
    gap:8px;
    opacity:0;
    transform:translateY(6px);
    transition:opacity .25s ease, transform .25s ease;
    pointer-events: none;
}

.controls * {
    pointer-events: auto;
}

.player.controls-visible .controls{
    opacity:1;
    transform:translateY(0);
}

@media (hover: hover) {
    .player:hover:not(.user-inactive) .controls {
        opacity:1;
        transform:translateY(0);
    }
}

.player.fullscreen-active.user-inactive {
    cursor: none;
}

.progress-row{
    display:flex;
    align-items:center;
    gap:10px;
}

.progress-bar{
    flex:1;
    height:6px;
    border-radius:6px;
    background:rgba(255,255,255,.2);
    position:relative;
    cursor:pointer;
    overflow:hidden;
}

.progress-fill{
    position:absolute;
    left:0;
    top:0;
    height:100%;
    width:0%;
    background:linear-gradient(90deg,#8b5cf6,#c084fc);
    border-radius:6px;
}

.progress-buffer{
    position:absolute;
    left:0;
    top:0;
    height:100%;
    width:0%;
    background:rgba(255,255,255,.15);
}

.time{
    font-size:12px;
    color:#e9d5ff;
    min-width:88px;
    text-align:center;
    font-variant-numeric:tabular-nums;
}

.buttons-row{
    display:flex;
    align-items:center;
    gap:14px;
}

.ctrl-btn{
    background:none;
    border:none;
    cursor:pointer;
    color:#e9d5ff;
    padding:6px;
    border-radius:8px;
    display:flex;
    align-items:center;
    justify-content:center;
    transition:.2s;
}

.ctrl-btn:hover{
    background:rgba(139,92,246,.3);
    color:#fff;
}

.ctrl-btn svg{
    width:20px;
    height:20px;
    fill:currentColor;
}

.volume-row{
    display:flex;
    align-items:center;
    gap:6px;
}

.volume-slider{
    width:70px;
    accent-color:#9333ea;
    cursor:pointer;
}

.spacer{
    flex:1;
}

.big-play{
    position:absolute;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
    width:64px;
    height:64px;
    border-radius:50%;
    background:rgba(124,58,237,.55);
    border:2px solid rgba(216,180,254,.7);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:4;
    backdrop-filter:blur(3px);
    pointer-events:none;
    opacity:0;
    transition:opacity .2s;
}

.big-play svg{
    width:26px;
    height:26px;
    fill:#f3e8ff;
    margin-left:3px;
}

.big-play.show{
    opacity:1;
}

.info{
    margin-top:20px;
}

.label{
    color:#c4b5fd;
    font-weight:600;
    margin-bottom:12px;
}

.footer{
    margin-top:25px;
    color:#b8a9d9;
    line-height:1.7;
    background:#1f1033;
    padding:18px;
    border-radius:14px;
}
</style>
</head>
<body>

<div class="container">

    <div class="title">
        Anime Universe Video Play
    </div>

    <div class="player controls-visible" id="player">

        <video id="video"></video>

        <div class="video-click-layer" id="clickLayer"></div>

        <div class="big-play" id="bigPlay">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>

        <!-- Resolusi pojok kanan atas -->
        <div class="reso-wrapper">
            <button class="reso-btn" id="resoBtn">
                <svg viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z"/></svg>
                <span id="resoLabel">Auto</span>
            </button>
            <div class="reso-menu" id="resoMenu"></div>
        </div>

        <!-- Custom controls -->
        <div class="controls" id="controls">

            <div class="progress-row">
                <div class="progress-bar" id="progressBar">
                    <div class="progress-buffer" id="progressBuffer"></div>
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="time" id="timeLabel">00:00 / 00:00</div>
            </div>

            <div class="buttons-row">
                <button class="ctrl-btn" id="playBtn" title="Play/Pause">
                    <svg id="playIcon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>

                <button class="ctrl-btn" id="rewindBtn" title="Mundur 10 detik">
                    <svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
                </button>

                <button class="ctrl-btn" id="forwardBtn" title="Maju 10 detik">
                    <svg viewBox="0 0 24 24"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/></svg>
                </button>

                <div class="volume-row">
                    <button class="ctrl-btn" id="muteBtn" title="Mute/Unmute">
                        <svg id="volIcon" viewBox="0 0 24 24"><path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                    </button>
                    <input type="range" class="volume-slider" id="volumeSlider" min="0" max="1" step="0.05" value="1">
                </div>

                <div class="spacer"></div>

                <button class="ctrl-btn" id="fullscreenBtn" title="Fullscreen">
                    <svg id="fsIcon" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                </button>
            </div>

        </div>

    </div>

    <div class="info">
        <div class="label">
            Judul: ${animeData.judul}
        </div>
        <div style="font-size:13px;color:#a78bda;">
            Web ini hanya untuk menampilkan video anime, Selamat menonton!
            
            <br><br>Di buat oleh Rifai
        </div>
    </div>

    <div class="footer">
        Penting:
        Beberapa video mungkin tidak bisa di putar karna kendala source video yang udah hilang
    </div>

</div>

<script>

const api = ${jsonString};

const data = api.data[0];

const video = document.getElementById("video");
const player = document.getElementById("player");
const clickLayer = document.getElementById("clickLayer");
const bigPlay = document.getElementById("bigPlay");

const resoBtn = document.getElementById("resoBtn");
const resoMenu = document.getElementById("resoMenu");
const resoLabel = document.getElementById("resoLabel");

const playBtn = document.getElementById("playBtn");
const playIcon = document.getElementById("playIcon");
const rewindBtn = document.getElementById("rewindBtn");
const forwardBtn = document.getElementById("forwardBtn");

const muteBtn = document.getElementById("muteBtn");
const volIcon = document.getElementById("volIcon");
const volumeSlider = document.getElementById("volumeSlider");

const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const progressBuffer = document.getElementById("progressBuffer");
const timeLabel = document.getElementById("timeLabel");

const fullscreenBtn = document.getElementById("fullscreenBtn");
const controls = document.getElementById("controls");

const ICON_PLAY = '<path d="M8 5v14l11-7z"/>';
const ICON_PAUSE = '<path d="M6 5h4v14H6zm8 0h4v14h-4z"/>';
const ICON_VOL_ON = '<path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
const ICON_VOL_MUTE = '<path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.42.05-.63zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.94 8.94 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
const ICON_FS_EXPAND = '<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>';
const ICON_FS_COMPRESS = '<path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>';

let currentReso = null;
let savedTime = 0;

function buildResoMenu(){
    resoMenu.innerHTML = "";
    data.reso.forEach((reso)=>{
        const opt = document.createElement("button");
        opt.className = "reso-option";
        opt.dataset.reso = reso;
        opt.innerHTML = \`<span>\${reso}</span><span class="size">\${data.resoSize[reso] || "-"}</span>\`;
        opt.onclick = (e)=>{
            e.stopPropagation();
            changeResolution(reso);
            resoMenu.classList.remove("open");
        };
        resoMenu.appendChild(opt);
    });
}

function changeResolution(reso){
    if(reso === currentReso) return;

    savedTime = video.currentTime || 0;
    const wasPaused = video.paused;

    currentReso = reso;
    resoLabel.textContent = reso;

    document.querySelectorAll(".reso-option").forEach(e=>{
        e.classList.toggle("active", e.dataset.reso === reso);
    });

    video.src = data.streams[reso][0].link;
    video.load();

    video.addEventListener("loadedmetadata", function onLoaded(){
        video.currentTime = savedTime;
        if(!wasPaused) video.play();
        video.removeEventListener("loadedmetadata", onLoaded);
    });
}

resoBtn.onclick = (e)=>{
    e.stopPropagation();
    resoMenu.classList.toggle("open");
    document.querySelector(".reso-wrapper").classList.toggle("force-visible", resoMenu.classList.contains("open"));
};

document.addEventListener("click", ()=>{
    resoMenu.classList.remove("open");
    document.querySelector(".reso-wrapper").classList.remove("force-visible");
});

function togglePlay(){
    if(video.paused){
        video.play();
    }else{
        video.pause();
    }
}

playBtn.onclick = togglePlay;
clickLayer.onclick = togglePlay;

video.addEventListener("play", ()=>{
    playIcon.innerHTML = ICON_PAUSE;
    bigPlay.classList.remove("show");
    showControlsTemporarily();
});

video.addEventListener("pause", ()=>{
    playIcon.innerHTML = ICON_PLAY;
    bigPlay.classList.add("show");
    player.classList.add("controls-visible");
    player.classList.remove("user-inactive");
    clearTimeout(hideTimeout);
});

rewindBtn.onclick = ()=>{ video.currentTime = Math.max(0, video.currentTime - 10); };
forwardBtn.onclick = ()=>{ video.currentTime = Math.min(video.duration || 0, video.currentTime + 10); };

muteBtn.onclick = ()=>{
    video.muted = !video.muted;
    volIcon.innerHTML = video.muted ? ICON_VOL_MUTE : ICON_VOL_ON;
    volumeSlider.value = video.muted ? 0 : video.volume;
};

volumeSlider.oninput = ()=>{
    video.volume = volumeSlider.value;
    video.muted = (video.volume == 0);
    volIcon.innerHTML = video.muted ? ICON_VOL_MUTE : ICON_VOL_ON;
};

function formatTime(sec){
    if(!isFinite(sec)) return "00:00";
    const m = Math.floor(sec/60).toString().padStart(2,"0");
    const s = Math.floor(sec%60).toString().padStart(2,"0");
    return \`\${m}:\${s}\`;
}

video.addEventListener("timeupdate", ()=>{
    const pct = (video.currentTime / (video.duration || 1)) * 100;
    progressFill.style.width = pct + "%";
    timeLabel.textContent = \`\${formatTime(video.currentTime)} / \${formatTime(video.duration)}\`;
});

video.addEventListener("progress", ()=>{
    if(video.buffered.length){
        const end = video.buffered.end(video.buffered.length - 1);
        const pct = (end / (video.duration || 1)) * 100;
        progressBuffer.style.width = pct + "%";
    }
});

progressBar.onclick = (e)=>{
    const rect = progressBar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * (video.duration || 0);
};

function getFsElement(){
    return document.fullscreenElement ||
           document.webkitFullscreenElement ||
           document.mozFullScreenElement ||
           document.msFullscreenElement ||
           null;
}

function requestFs(el){
    const req = el.requestFullscreen ||
                el.webkitRequestFullscreen ||
                el.webkitEnterFullscreen ||
                el.mozRequestFullScreen ||
                el.msRequestFullscreen;
    if(req){
        return req.call(el);
    }
    return Promise.reject(new Error("Fullscreen tidak didukung"));
}

function exitFs(){
    const exit = document.exitFullscreen ||
                 document.webkitExitFullscreen ||
                 document.mozCancelFullScreen ||
                 document.msExitFullscreen;
    if(exit){
        return exit.call(document);
    }
    return Promise.resolve();
}

fullscreenBtn.onclick = ()=>{
    if(!getFsElement()){
        requestFs(player).catch(()=>{
            requestFs(video).catch((err)=>{
                console.warn("Fullscreen gagal:", err);
            });
        });
    }else{
        exitFs();
    }
};

function onFsChange(){
    const isFs = !!getFsElement();
    player.classList.toggle("fullscreen-active", isFs);
    document.getElementById("fsIcon").innerHTML = isFs ? ICON_FS_COMPRESS : ICON_FS_EXPAND;

    if(isFs){
        if(screen.orientation && screen.orientation.lock){
            screen.orientation.lock("landscape").catch(()=>{});
        }
    }else{
        if(screen.orientation && screen.orientation.unlock){
            try{ screen.orientation.unlock(); }catch(e){}
        }
    }
}

["fullscreenchange","webkitfullscreenchange","mozfullscreenchange","MSFullscreenChange"].forEach(evt=>{
    document.addEventListener(evt, onFsChange);
});

let hideTimeout;
function showControlsTemporarily(){
    player.classList.add("controls-visible");
    player.classList.remove("user-inactive");
    
    clearTimeout(hideTimeout);
    
    if(!video.paused){
        hideTimeout = setTimeout(()=>{
            if (!resoMenu.classList.contains("open")) {
                player.classList.remove("controls-visible");
                player.classList.add("user-inactive");
            }
        }, 2500);
    }
}

player.addEventListener("mousemove", showControlsTemporarily);
player.addEventListener("touchstart", showControlsTemporarily, {passive: true});
player.addEventListener("click", showControlsTemporarily);

buildResoMenu();
changeResolution('720p');
bigPlay.classList.add("show");

</script>

</body>
</html>`;
}