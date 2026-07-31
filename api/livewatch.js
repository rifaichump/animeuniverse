export default async function handler(req, res) {
  const isWhatsApp = req.headers['x-requested-with'] === 'com.whatsapp'
  if (isWhatsApp) {
    let link = decode(req.query.video);
    let dataAnime = decode(req.query.anime);
    let idRoom = decode(req.query.room_id);
    res.send(showHTML(link, JSON.parse(dataAnime), idRoom));
  } else {
    res.json({ status: false });
  }
}

function decode(data) {
  const ngen = Buffer
    .from(data, "base64url")
    .toString("utf8");
  return ngen;
}

function showHTML(video, animeData, idRoom) {
    return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Anime Live Stream - Watch</title>

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
    display:flex;
    align-items:center;
    gap:10px;
}

.live-badge{
    background:#e11d48;
    color:#fff;
    font-size:12px;
    padding:3px 8px;
    border-radius:4px;
    text-transform:uppercase;
    letter-spacing:1px;
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
    pointer-events:none; /* Nonaktifkan interaksi klik pada video */
}

.player.fullscreen-active video{
    max-height:100vh;
    height:100vh;
    object-fit: contain;
}

/* Overlay Transparan untuk mencegah event klik kanan / klik pada video */
.video-overlay-layer{
    position:absolute;
    inset:0;
    z-index:2;
}

/* ===== Custom controls bar (Minimalis: Hanya Volume & Fullscreen) ===== */
.controls{
    position:absolute;
    left:0;
    right:0;
    bottom:0;
    z-index:5;
    padding:10px 14px 12px;
    background:linear-gradient(to top, rgba(0,0,0,.85), rgba(0,0,0,0));
    display:flex;
    align-items:center;
    gap:14px;
    opacity:0;
    transition:opacity .25s ease;
}

.player:hover .controls,
.player.controls-visible .controls{
    opacity:1;
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
    width:80px;
    accent-color:#9333ea;
    cursor:pointer;
}

.spacer{
    flex:1;
}

.sync-status{
    font-size:12px;
    color:#a78bfa;
    display:flex;
    align-items:center;
    gap:6px;
}

.sync-dot{
    width:8px;
    height:8px;
    border-radius:50%;
    background:#10b981;
}

.info{
    margin-top:20px;
}

.label{
    color:#c4b5fd;
    font-weight:600;
    margin-bottom:12px;
}

/* ===== Live Chat Styles ===== */
.chat-container{
    margin-top:20px;
    background:#190b2b;
    border:1px solid rgba(139,92,246,.4);
    border-radius:14px;
    overflow:hidden;
    box-shadow:0 4px 16px rgba(0,0,0,.3);
}

.chat-header{
    background:rgba(139,92,246,.2);
    padding:12px 18px;
    font-weight:bold;
    color:#e9d5ff;
    border-bottom:1px solid rgba(139,92,246,.3);
    display:flex;
    justify-content:space-between;
    align-items:center;
}

.status-badge{
    font-size:11px;
    padding:4px 8px;
    border-radius:20px;
    background:#e11d48;
    color:#fff;
}

.status-badge.online{
    background:#10b981;
}

.chat-box{
    height:250px;
    overflow-y:auto;
    padding:14px;
    display:flex;
    flex-direction:column;
    gap:10px;
    background:rgba(0,0,0,.2);
}

.chat-msg{
    background:rgba(139,92,246,.15);
    border-left:3px solid #8b5cf6;
    padding:8px 12px;
    border-radius:0 8px 8px 0;
    word-break:break-word;
    font-size:14px;
}

.chat-msg .sender{
    font-size:11px;
    font-weight:bold;
    color:#c084fc;
    margin-bottom:2px;
}

.chat-input-area{
    display:flex;
    padding:10px;
    gap:8px;
    background:rgba(18,9,31,.6);
    border-top:1px solid rgba(139,92,246,.2);
}

.chat-input-area input{
    background:rgba(255,255,255,.07);
    border:1px solid rgba(139,92,246,.4);
    padding:10px 14px;
    border-radius:8px;
    color:#fff;
    outline:none;
    font-size:14px;
}

.chat-input-area input:focus{
    border-color:#c084fc;
}

#chatText{
    flex:1;
}

.chat-btn{
    background:#7c3aed;
    color:#fff;
    border:none;
    padding:0 18px;
    border-radius:8px;
    cursor:pointer;
    font-weight:600;
    transition:.2s;
}

.chat-btn:hover{
    background:#9333ea;
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
        <span>Anime Universe Party</span>
        <span class="live-badge">Live</span>
    </div>

    <div class="player" id="player">

        <video id="video" autoplay playsinline muted></video>

        <div class="video-overlay-layer"></div>

        <div class="controls" id="controls">

            <div class="volume-row">
                <button class="ctrl-btn" id="muteBtn" title="Mute/Unmute">
                    <svg id="volIcon" viewBox="0 0 24 24"><path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                </button>
                <input type="range" class="volume-slider" id="volumeSlider" min="0" max="1" step="0.05" value="0">
            </div>

            <div class="sync-status">
                <div class="sync-dot"></div>
                <span id="syncText">Mencari Sinyal Stream...</span>
            </div>

            <div class="spacer"></div>

            <button class="ctrl-btn" id="fullscreenBtn" title="Fullscreen">
                <svg id="fsIcon" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
            </button>

        </div>

    </div>

    <div class="info">
        <div class="label">
            Judul: ${animeData.judul}
        </div>
        <div style="font-size:13px;color:#a78bda;">
            Ini adalah mode nobar atau live, Kalian bisa berbagi chat di kolom live chat. Video di putar dengan durasi yang sama untuk semua orang. Selamat menonton!
            <br><br>Dibuat oleh Rifai
        </div>
    </div>

    <div class="chat-container">
        <div class="chat-header">
            <span>Live Chat</span>
            <span class="status-badge" id="chatStatus">Disconnected</span>
        </div>
        <div class="chat-box" id="chatBox"></div>
        <div class="chat-input-area">
            <input type="text" id="chatText" placeholder="Ketik pesan..." onkeypress="if(event.key==='Enter') sendChatMessage()">
            <button class="chat-btn" onclick="sendChatMessage()">Kirim</button>
        </div>
    </div>

    <div class="footer">
        Penting:
        Beberapa video mungkin mengalami kendala karena source video yang sudah usang atau sudah tidak ada lagi.
    </div>

</div>

<script>

const video = document.getElementById("video");
const player = document.getElementById("player");

const muteBtn = document.getElementById("muteBtn");
const volIcon = document.getElementById("volIcon");
const volumeSlider = document.getElementById("volumeSlider");

const fullscreenBtn = document.getElementById("fullscreenBtn");
const syncText = document.getElementById("syncText");

const ICON_VOL_ON = '<path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
const ICON_VOL_MUTE = '<path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.42.05-.63zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.94 8.94 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
const ICON_FS_EXPAND = '<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>';
const ICON_FS_COMPRESS = '<path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>';

video.src = ${JSON.stringify(video)};

muteBtn.onclick = () => {
    video.muted = !video.muted;
    volIcon.innerHTML = video.muted ? ICON_VOL_MUTE : ICON_VOL_ON;
    volumeSlider.value = video.muted ? 0 : (video.volume || 0.5);
};

volumeSlider.oninput = () => {
    video.volume = volumeSlider.value;
    video.muted = (video.volume == 0);
    volIcon.innerHTML = video.muted ? ICON_VOL_MUTE : ICON_VOL_ON;
};

function getFsElement() {
    return document.fullscreenElement ||
           document.webkitFullscreenElement ||
           document.mozFullScreenElement ||
           document.msFullscreenElement ||
           null;
}

function requestFs(el) {
    const req = el.requestFullscreen ||
                el.webkitRequestFullscreen ||
                el.webkitEnterFullscreen ||
                el.mozRequestFullScreen ||
                el.msRequestFullscreen;
    if(req) return req.call(el);
    return Promise.reject(new Error("Fullscreen tidak didukung"));
}

function exitFs() {
    const exit = document.exitFullscreen ||
                 document.webkitExitFullscreen ||
                 document.mozCancelFullScreen ||
                 document.msExitFullscreen;
    if(exit) return exit.call(document);
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
}

["fullscreenchange","webkitfullscreenchange","mozfullscreenchange","MSFullscreenChange"].forEach(evt=>{
    document.addEventListener(evt, onFsChange);
});

const currentRoomId = ${JSON.stringify(idRoom)};
const chatBox = document.getElementById("chatBox");
const chatStatus = document.getElementById("chatStatus");

const wsUrl = "wss://ws.animeunicraft.my.id";

let ws;

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

function initWebSocket() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        chatStatus.textContent = "Online";
        chatStatus.classList.add("online");

        ws.send(JSON.stringify({
            type: "join",
            roomId: currentRoomId
        }));
    };
    
    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            if (data.type === "chat_history") {
                chatBox.innerHTML = "";
                if (Array.isArray(data.messages)) {
                    data.messages.forEach(msg => {
                        appendChatMessage(msg.sender, msg.message);
                    });
                }
            }
            
            if (data.type === "message") {
                appendChatMessage(data.sender, data.message);
            }
            
            if (data.type === "stream_sync" || data.type === "sync_state") {
                handleVideoSync(data.currentTime, data.isPaused);
            }

        } catch (e) {
            console.error("Gagal membaca pesan WebSocket:", e);
        }
    };


    ws.onclose = () => {
        chatStatus.textContent = "Disconnected";
        chatStatus.classList.remove("online");
        syncText.textContent = "Koneksi Terputus...";
        setTimeout(initWebSocket, 3000);
    };

    ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws.close();
    };
}

function handleVideoSync(serverTime, isPaused) {
    if (serverTime === undefined) return;

    syncText.textContent = "Terhubung dengan Server Stream";

    if (isPaused && !video.paused) {
        video.pause();
    } else if (!isPaused && video.paused) {
        video.play().catch(()=>{});
    }

    const timeDifference = Math.abs(video.currentTime - serverTime);
    if (timeDifference > 1.5) {
        video.currentTime = serverTime;
    }
}

function sendChatMessage() {
    const textInput = document.getElementById("chatText");

    const sender = "Ini siapa njir?";
    const message = textInput.value.trim();

    if (!message) return;

    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: "message",
            roomId: currentRoomId,
            sender: sender,
            message: message
        }));
        textInput.value = "";
    } else {
        alert("Koneksi chat terputus. Menghubungkan ulang...");
    }
}

function appendChatMessage(sender, message) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "chat-msg";
    msgDiv.innerHTML = \`<div class="sender">\${escapeHTML(sender)}</div><div>\${escapeHTML(message)}</div>\`;
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

initWebSocket();

</script>

</body>
</html>`;
}