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
});


// Ganti dengan username dan repo kamu
const githubUsername = "rifaichump";
const repo = "database";

async function fetchGalleryImages(id, folderPath) {
  const apiUrl = `https://api.github.com/repos/${githubUsername}/${repo}/contents/${folderPath}`;
  const container = document.getElementById(id);

  try {
    const response = await fetch(apiUrl);
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
    container.innerHTML = `<p class="text-red-400 text-center">Gagal memuat gambar.</p>`;
  }
}


// Minecraft Server
const statusBox = document.getElementById("mcStatus");
async function fetchMCStatsStatus() {
  try {
    const response = await fetch(`https://api.mcstatus.io/v2/status/bedrock/AnimeUnicraft.aternos.me:12698`);
    const data = await response.json();

    const online = data?.online;
    const playersOnline = data?.players?.online ?? 0;
    const playersMax = data?.players?.max ?? "??";
    const version = data?.version?.name ?? "Tidak diketahui";
    const description = cleanMotd(data?.motd?.clean ?? "Tidak ada deskripsi.");

    if (!online) {
      statusBox.innerHTML = `
        <p><span class="font-semibold text-red-400">Status:</span> 🔴 Offline</p>
        <p>Server tidak aktif saat ini.</p>
      `;
      return;
    }

    statusBox.innerHTML = `
      <p><span class="font-semibold text-green-400">Status:</span> 🟢 Online</p>
      <p><span class="font-semibold text-blue-400">Pemain:</span> ${playersOnline} / ${playersMax}</p>
      <p><span class="font-semibold text-yellow-400">Versi:</span> ${version}</p>
      <p><span class="font-semibold text-purple-400">Deskripsi:</span> ${description}</p>
    `;
  } catch (err) {
    statusBox.innerHTML = `<p class="text-red-400">Gagal mengambil data dari mcstats.io</p>`;
    console.error(err);
  }
};
setInterval(fetchMCStatsStatus, 1000);

function cleanMotd(input) {
  return input.replace(/\n\S*/,'');
}