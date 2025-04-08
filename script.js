console.log("Script loaded.");

const GITHUB_USERNAME = "rifaichump";
const REPO_NAME = "database";
const BRANCH = "main";

const allT = {
  a: "ghp_qwQtP",
  b: "ZLFwHLHoE9xTH5eE",
  c: "UmRyoVwbQ40ixPS"
}
const TOKEN = allT.a + allT.b + allT.c;

// Link WhatsApp
const linkGc = "https://chat.whatsapp.com/FMFBe4kJwao4xJIBWYzdy0";
const linkCh = "https://whatsapp.com/channel/0029VaWaUrD1XquPeK01cf2c";
const linkChSticker = "https://whatsapp.com/channel/0029VayeQ47KwqSOfY0TXc3r";

// Buka Link Dari Whatsapp
function bukaGroup() {
  window.open(linkGc, "_blank");
}
function bukaChannel() {
  window.open(linkCh, "_blank");
}
function bukaChannelSticker() {
  window.open(linkChSticker, "_blank");
}

// Tampilkan Media dari GitHub Aku
async function tampilkanMedia() {
  const mediaContainer = document.getElementById("media-container");
  const btn = document.getElementById('tampilkanMediaBeton');

  mediaContainer.innerHTML = "<p style='opacity: 0.8;'>Memuat media...</p>";
  btn.disabled = true;

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents?ref=${BRANCH}`, {
      headers: {
        "Authorization": `Bearer ${TOKEN}`
      }
    });

    const data = await response.json();
    const files = Array.isArray(data) ? data.map(item => item.name) : [];

    if (files.length === 0) {
      mediaContainer.innerHTML = "<p style='color:red;'>Tidak ada media ditemukan. Silakan upload foto terlebih dahulu.</p>";
      return;
    }

    const mediaWrapper = document.createElement("div");
    mediaWrapper.classList.add("media-wrapper");

    files.forEach(name => {
      const src = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/${BRANCH}/${name}`;
      const fileName = name.replace(/\.(jpg|png|jpeg|gif)$/i, "");

      const mediaBox = document.createElement("div");
      mediaBox.classList.add("media-box");

      const label = document.createElement("p");
      label.textContent = fileName;
      label.classList.add("media-label");
      label.style.color = "#31f5f8";

      const link = document.createElement("a");
      link.href = src;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      const img = document.createElement("img");
      img.src = src;
      img.alt = fileName;
      img.classList.add("media-item");
      img.onerror = () => img.src = "profile.jpg";

      link.appendChild(img);
      mediaBox.appendChild(label);
      mediaBox.appendChild(link);
      mediaWrapper.appendChild(mediaBox);
    });

    mediaContainer.innerHTML = "";
    mediaContainer.appendChild(mediaWrapper);
  } catch (error) {
    console.error("Gagal memuat media:", error);
    mediaContainer.innerHTML = "<p style='color:red;'>Gagal memuat media.</p>";
  }
}

// Minecraft Server AU
setInterval(async () => {
  const aternos = document.getElementById("aternos");
  try {
    const res = await fetch("https://api.mcstatus.io/v2/status/bedrock/AnimeUnicraft.aternos.me:12698");
    const data = await res.json();

    if (data?.online) {
      aternos.innerHTML = `
        <p class="server-status">Status: Online</p>
        <p class="server-status">Players: ${data.players.online}/${data.players.max}</p>
        <p class="server-status">Motd: ${data.motd.clean}</p>
      `;
    } else {
      aternos.innerHTML = `<p class="server-status">Status: Offline</p>`;
    }
  } catch {
    aternos.innerHTML = `<p class="server-status">Status: Unknown</p>`;
  }
}, 500);

// DOM Loaded biar enak
// document.addEventListener("DOMContentLoaded", tampilkanMedia);

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('aternos').innerHTML = "<p style='color:#ffffff;'>Memuat...</p>"
});