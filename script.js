document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById('menuBtn');
  const menuDropdown = document.getElementById('menuDropdown');

  menuBtn.addEventListener('click', () => {
    menuDropdown.classList.toggle('hidden');
  });

  window.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
      menuDropdown.classList.add('hidden');
    }
  });

  // Gallery
  fetchGalleryImages('minecraftFotbar', 'minecraft');
  fetchGalleryImages('gambarRandom', 'random');
  fetchGalleryImages('nezukoUniverse', 'nezuko');
});

const allT = {
    a: "ghp_qwQtP",
    b: "ZLFwHLHoE9xTH5eE",
    c: "UmRyoVwbQ40ixPS"
  };
const githubToken = allT.a + allT.b + allT.c;

const firebaseConfig = {
  apiKey: "AIzaSyDxbWP-WGyDMK9zRU1MydrC3Ka8nA4uWF8",
  authDomain: "visitorwebauv4.firebaseapp.com",
  databaseURL: "https://visitorwebauv4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "visitorwebauv4",
  storageBucket: "visitorwebauv4.firebasestorage.app",
  messagingSenderId: "323012132107",
  appId: "1:323012132107:web:269ac2eb2c1f139a4b360e",
  measurementId: "G-TLVS3CB9K3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const ref = db.ref("visitors");

const visitedKey = "hasVisitedAnimeAU";

function updateVisitorCount() {
  ref.once("value").then(snapshot => {
    let count = snapshot.val() || 0;
    document.getElementById("visitorCount").textContent = count.toLocaleString("id-ID");
  });
}

if (!localStorage.getItem(visitedKey)) {
  ref.once("value").then(snapshot => {
    let count = snapshot.val() || 0;
    count += 1;
    ref.set(count).then(() => {
      document.getElementById("visitorCount").textContent = count.toLocaleString("id-ID");
      localStorage.setItem(visitedKey, "true");
    });
  });
} else {
  updateVisitorCount();
}

if (window.lucide) lucide.createIcons();

const githubUsername = "rifaichump";
const repo = "database";

async function fetchGalleryImages(id, folderPath) {
  const apiUrl = `https://api.github.com/repos/${githubUsername}/${repo}/contents/${folderPath}`;
  const container = document.getElementById(id);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "Authorization": `Bearer ${githubToken}`
      }
    });
    const files = await response.json();

    if (!Array.isArray(files)) throw new Error("Folder tidak ditemukan atau repo private.");

    files
      .filter(file => file.type === "file" && /\.(jpg|jpeg|png|webp)$/i.test(file.name))
      .forEach(file => {
        const imageUrl = `https://raw.githubusercontent.com/${githubUsername}/${repo}/main/${folderPath}/${file.name}`;
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");

        const slide = document.createElement("div");
        slide.className = "min-w-[250px] snap-start";
        slide.innerHTML = `
          <img src="${imageUrl}" alt="${nameWithoutExt}" class="rounded-xl w-full object-cover h-48 shadow-lg mb-2" />
          <p class="text-center text-sm text-gray-300">${nameWithoutExt}</p>
        `;

        container.appendChild(slide);
      });
  } catch (err) {
    container.innerHTML = `<p class="text-red-400 text-center">Gagal memuat gambar. Upload terlebih dahulu</p>`;
  }
}


// Minecraft Server
const statusBox = document.getElementById("mcStatus");
async function fetchMCStatsStatus() {
  try {
    const response = await fetch(`https://api.mcsrvstat.us/bedrock/2/AnimeUnicraft.aternos.me:12698`);
    const data = await response.json();

    const online = data?.online;
    const playersOnline = data?.players?.online ?? 0;
    const playersMax = data?.players?.max ?? "??";
    const version = data?.version ?? "Tidak diketahui";
    const description = data?.motd?.clean.join(` `) ?? "Tidak ada deskripsi.";

    if (!online) {
      statusBox.innerHTML = `
        <p><span class="font-semibold text-red-400">Status:</span> Offline</p>
        <p>Server tidak aktif saat ini.</p>
      `;
      return;
    }

    statusBox.innerHTML = `
      <p><span class="font-semibold text-green-400">Status:</span> Online</p>
      <p><span class="font-semibold text-blue-400">Pemain:</span> ${playersOnline} / ${playersMax}</p>
      <p><span class="font-semibold text-yellow-400">Versi:</span> ${version}</p>
      <p><span class="font-semibold text-purple-400">Motd:</span> ${description}</p>
    `;
  } catch (err) {
    statusBox.innerHTML = `<p class="text-red-400">Gagal mengambil data</p>`;
    console.error(err);
  }
};
setInterval(fetchMCStatsStatus, 5000);

function cleanMotd(input) {
  return input.replace(/\n\S*/,'');
}