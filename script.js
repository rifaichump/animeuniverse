const CONFIG = {
  minecraft: {
    api: "https://api.mcstatus.io/v2/status/bedrock/animeunicraft.my.id",
    ip: "animeunicraft.my.id",
    port: 19132
  },
  socials: {
    whatsapp: "https://chat.whatsapp.com/FMFBe4kJwao4xJIBWYzdy0",
    discord: "https://discord.gg/TQTCcQrYP",
    tiktok: "https://tiktok.com/@animeuniverseeee"
  },
  download: {
    url: "#",
    fileName: "animeuniversegroup.apk"
  },
  gallery: [
    "asset/gallery/1.jpg",
    "asset/gallery/2.jpg",
    "asset/gallery/3.jpg",
    "asset/gallery/4.jpg",
    "asset/gallery/5.jpg",
    "asset/gallery/6.jpg",
    "asset/gallery/7.jpg",
    "asset/gallery/8.jpg",
    "asset/gallery/9.jpg",
    "asset/gallery/10.jpg",
    "asset/gallery/11.jpg",
    "asset/gallery/12.jpg",
    "asset/gallery/13.jpg",
    "asset/gallery/14.jpg",
    "asset/gallery/15.jpg",
    "asset/gallery/16.jpg",
    "asset/gallery/17.jpg",
    "asset/gallery/18.jpg",
    "asset/gallery/19.jpg",
    "asset/gallery/20.jpg",
    "asset/gallery/21.jpg"
  ]
};

const statusIp = document.getElementById("status-ip");
const statusStatus = document.getElementById("status-status");
const statusDot = document.getElementById("status-dot");
const statusPlayers = document.getElementById("status-players");

const socialWhatsapp = document.getElementById("social-whatsapp");
const socialDiscord = document.getElementById("social-discord");
const socialTiktok = document.getElementById("social-tiktok");
const downloadBtn = document.getElementById("download-btn");

const galleryBtn = document.getElementById("gallery-btn");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxCounter = document.getElementById("lightbox-counter");

let galleryIndex = 0;

function openGallery() {
  galleryIndex = 0;
  showImage();
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeGallery() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function showImage() {
  lightboxImg.src = CONFIG.gallery[galleryIndex];
  lightboxImg.alt = "Galeri server " + (galleryIndex + 1);
  lightboxCounter.textContent = galleryIndex + 1 + " / " + CONFIG.gallery.length;
}

function nextImage() {
  galleryIndex = (galleryIndex + 1) % CONFIG.gallery.length;
  showImage();
}

function prevImage() {
  galleryIndex = (galleryIndex - 1 + CONFIG.gallery.length) % CONFIG.gallery.length;
  showImage();
}

function initGallery() {
  if (!galleryBtn || !lightbox) return;
  galleryBtn.addEventListener("click", openGallery);
  lightboxPrev.addEventListener("click", nextImage);
  lightboxNext.addEventListener("click", prevImage);
  lightboxClose.addEventListener("click", closeGallery);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeGallery();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeGallery();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  });
}

function applyConfig() {
  statusIp.textContent = CONFIG.minecraft.ip + ":" + CONFIG.minecraft.port;
  if (socialWhatsapp) socialWhatsapp.href = CONFIG.socials.whatsapp;
  if (socialDiscord) socialDiscord.href = CONFIG.socials.discord;
  if (socialTiktok) socialTiktok.href = CONFIG.socials.tiktok;
  if (downloadBtn) {
    downloadBtn.href = CONFIG.download.url;
    downloadBtn.download = CONFIG.download.fileName;
  }
}

async function fetchMinecraftStatus() {
  try {
    const res = await fetch(CONFIG.minecraft.api);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    updateStatus(data);
  } catch (err) {
    setOffline();
  }
}

function updateStatus(data) {
  if (!data.online) {
    setOffline();
    return;
  }

  statusIp.textContent = CONFIG.minecraft.ip + ":" + CONFIG.minecraft.port;

  statusDot.className = "dot online";
  statusStatus.textContent = "Online";

  statusPlayers.textContent = data.players.online + "/" + data.players.max;
}

function setOffline() {
  statusDot.className = "dot offline";
  statusStatus.textContent = "Offline";
  statusPlayers.textContent = "0/0";
}

applyConfig();
initGallery();
fetchMinecraftStatus();

const topbar = document.querySelector(".topbar");
let lastScrollY = window.scrollY;

function handleTopbar() {
  const currentY = window.scrollY;
  if (currentY > lastScrollY && currentY > 64) {
    topbar.classList.add("hidden");
  } else {
    topbar.classList.remove("hidden");
  }
  lastScrollY = currentY;
}

window.addEventListener("scroll", handleTopbar, { passive: true });
