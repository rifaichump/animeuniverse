lucide.createIcons();

const loadingBar = document.getElementById("loadingBar");
let loadingProgress = 0;
let totalTasks = 5;

function updateLoadingProgress() {
  loadingProgress++;
  const progressPercentage = Math.min((loadingProgress / totalTasks) * 100, 100);
  loadingBar.style.width = `${progressPercentage}%`;

  if (progressPercentage >= 100) {
    setTimeout(() => {
      loadingBar.style.opacity = 0;
      setTimeout(() => loadingBar.remove(), 300);
    }, 500);
  }
}


const firebaseConfig = {
  apiKey: "AIzaSyDxbWP-WGyDMK9zRU1MydrC3Ka8nA4uWF8",
  authDomain: "visitorwebauv4.firebaseapp.com",
  databaseURL: "https://visitorwebauv4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "visitorwebauv4",
  storageBucket: "visitorwebauv4.appspot.com",
  messagingSenderId: "323012132107",
  appId: "1:323012132107:web:269ac2eb2c1f139a4b360e",
  measurementId: "G-TLVS3CB9K3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const ref = db.ref("visitors");


const allT = {
  a: "ghp_qwQtP",
  b: "ZLFwHLHoE9xTH5eE",
  c: "UmRyoVwbQ40ixPS"
};
const githubToken = allT.a + allT.b + allT.c;

const BASE_API = "https://apianimeuniverse-production.up.railway.app";
const visitedKey = "hasVisitedAnimeAU";
const gallery = document.getElementById("gallery");

let croppedBlob, cropper;
let lastImageURL = null;

document.getElementById("toggleFormBtn").addEventListener("click", () => {
  document.getElementById("formModal").classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
});

document.getElementById("closeFormBtn").addEventListener("click", () => {
  document.getElementById("formModal").classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
  document.getElementById("uploadForm").reset();
  
  croppedBlob = null;
  lastImageURL = null;
  document.getElementById("previewImage").classList.add("hidden");
  document.getElementById("previewImage").src = "";
  document.getElementById("recropBtn").classList.add("hidden");
  document.getElementById("cropModal").classList.add("hidden");
  cropper?.destroy();
});

if (document.getElementById("fileInput")) {
  document.getElementById("fileInput").addEventListener("change", (e) => {
    const file = e.target.files[0];

    if (!file) {
      croppedBlob = null;
      lastImageURL = null;
      document.getElementById("previewImage").classList.add("hidden");
      document.getElementById("previewImage").src = "";
      document.getElementById("recropBtn").classList.add("hidden");
      document.getElementById("cropModal").classList.add("hidden");
      cropper?.destroy();
      return;
    }

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        lastImageURL = reader.result;
        document.getElementById("cropImage").src = reader.result;
        document.getElementById("cropModal").classList.remove("hidden");
        setTimeout(() => {
          cropper = new Cropper(document.getElementById("cropImage"), {
            aspectRatio: NaN,
            viewMode: 1,
            autoCropArea: 1,
            background: false
          });
        }, 200);
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById("cancelCrop").addEventListener("click", () => {
    cropper?.destroy();
    croppedBlob = null;
    document.getElementById("cropModal").classList.add("hidden");
    document.getElementById("uploadForm").reset();
  });

  document.getElementById("confirmCrop").addEventListener("click", () => {
    if (cropper) {
      cropper.getCroppedCanvas().toBlob(blob => {
        croppedBlob = blob;
        cropper.destroy();
        document.getElementById("cropModal").classList.add("hidden");

        const previewURL = URL.createObjectURL(blob);
        const previewImg = document.getElementById("previewImage");
        previewImg.src = previewURL;
        previewImg.classList.remove("hidden");
        document.getElementById("recropBtn").classList.remove("hidden");
      });
    }
  });

  document.getElementById("recropBtn").addEventListener("click", () => {
    if (lastImageURL) {
      document.getElementById("cropImage").src = lastImageURL;
      document.getElementById("cropModal").classList.remove("hidden");

      setTimeout(() => {
        cropper = new Cropper(document.getElementById("cropImage"), {
          aspectRatio: NaN,
          viewMode: 1,
          autoCropArea: 1,
          background: false
        });
      }, 200);
    }
  });

  // const toggleFormBtn = document.getElementById("toggleFormBtn");
  // const toggleFormText = document.getElementById("toggleFormText");
  // const uploadForm = document.getElementById("uploadForm");

  // toggleFormBtn.addEventListener("click", () => {
  //   const isFormVisible = !uploadForm.classList.contains("hidden");
  //   uploadForm.classList.toggle("hidden");

  //   toggleFormText.textContent = isFormVisible ? "Buat Postingan" : "Batalkan";
  //   toggleFormBtn.querySelector("i").setAttribute("data-lucide", isFormVisible ? "plus-circle" : "x-circle");

  //   lucide.createIcons();
  // });

  document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const caption = document.getElementById("captionInput").value.trim();
    const statusText = document.getElementById("uploadStatus");

    if (!croppedBlob || !caption) return statusText.textContent = "Isi semua data";

    statusText.textContent = "Mengupload...";

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(",")[1];
      const ext = document.getElementById("fileInput").files[0].type.split("/")[1];
      const timestamp = Date.now();
      let filename = `${caption}|${timestamp}.${ext}`;
      if (localStorage.getItem("loginStatus") === "loggedIn") {
        const nomor = localStorage.getItem("nomor");
        if (nomor) filename = `${caption}|${nomor}|${timestamp}.${ext}`;
      }

      try {
        const res = await fetch(`https://api.github.com/repos/rifaichump/database/contents/freepost/${filename}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${githubToken}`
          },
          body: JSON.stringify({ message: `Upload ${filename}`, content: base64 })
        });

        if (res.ok) {
          statusText.textContent = "✅ Berhasil upload!, Postingan kamu akan muncul 15-30 detik kemudian di karenakan proses pembuatan cdn ke server";
          setTimeout(() => {
            document.getElementById("formModal").classList.add("hidden");
            document.body.classList.remove("overflow-hidden");
            document.getElementById("uploadForm").reset();
            document.getElementById("previewImage").classList.add("hidden");
            document.getElementById("previewImage").src = "";
            croppedBlob = null;
            statusText.textContent = "";
            fetchFreepostGallery();
          }, 5000);
        } else {
          statusText.textContent = "❌ Upload gagal.";
        }
      } catch (err) {
        statusText.textContent = "❌ Error koneksi.";
      }
    };
    reader.readAsDataURL(croppedBlob);
  });
}


async function fetchFreepostGallery(id = 'gallery', sortBy = "baru") {
  const apiUrl = `https://api.github.com/repos/rifaichump/database/contents/freepost`;
  const container = document.getElementById(id);
  container.innerHTML = "⏳ Memuat...";

  try {
    const response = await fetch(apiUrl, {
      headers: { "Authorization": `Bearer ${githubToken}` }
    });
    const files = await response.json();
    if (!Array.isArray(files)) throw new Error("Tidak ada file");

    const validImages = await Promise.all(files.filter(file =>
      file.type === "file" && /\.(jpg|jpeg|png|webp)$/i.test(file.name)
    ).map(async file => {
      const parts = file.name.split("|");
      let caption = "Tanpa Caption", nomor = false, timestamp = "";
      if (parts.length === 3) [caption, nomor, timestamp] = parts;
      else if (parts.length === 2) [caption, timestamp] = parts;
      timestamp = timestamp.split(".")[0];
      let username = "Anonymous";
      let profileUrl = "./none.png";
      let isAdmin = false;
      if (nomor) {
        try {
          const snap = await db.ref("users/" + nomor).once("value");
          if (snap.exists()) {
            username = snap.val()?.nama || "Anonymous";
            const res = await fetch(BASE_API + "/info-user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ nomor, profile: true })
            });
            const data = await res.json();
            if (data?.data?.profileUrl) profileUrl = data.data.profileUrl;
            if (data?.data?.isAdmin) isAdmin = data.data.isAdmin;
          }
        } catch (e) {
          console.error("Gagal ambil profil:", e.message);
        }
      }
      return {
        url: `https://raw.githubusercontent.com/rifaichump/database/main/freepost/${file.name}`,
        caption,
        timestamp,
        username,
        profileUrl,
        isAdmin
      };
    }));

    if (sortBy === "baru") validImages.sort((a, b) => b.timestamp - a.timestamp);
    else if (sortBy === "lama") validImages.sort((a, b) => a.timestamp - b.timestamp);
    else if (sortBy === "az") validImages.sort((a, b) => a.caption.localeCompare(b.caption));
    else if (sortBy === "za") validImages.sort((a, b) => b.caption.localeCompare(a.caption));

    container.innerHTML = "";

    validImages.forEach(item => {
      const wrapper = document.createElement("div");
      wrapper.className = "bg-[#1a1a1a] p-3 rounded-lg shadow mb-6 post-item";

      const img = document.createElement("img");
      img.src = ""; // atau bisa ./loading.jpg kalau punya
      img.setAttribute("data-src", item.url + `?t=${item.timestamp}`);
      img.alt = item.caption;
      img.className = "w-full rounded mb-2 lazy-img";
      img.loading = "lazy";

      const caption = document.createElement("p");
      caption.textContent = item.caption;
      caption.className = "text-sm text-gray-300";

      const profileWrapper = document.createElement("div");
      profileWrapper.className = "flex items-center justify-between gap-2 mb-1";

      // Kiri: Foto profil + nama
      const profileLeft = document.createElement("div");
      profileLeft.className = "flex items-center gap-2";

      const avatar = document.createElement("img");
      avatar.src = item.profileUrl;
      avatar.alt = item.username + ` ${item.isAdmin ? '(Admin)' : ''}`;
      avatar.className = "w-4 h-4 rounded-full object-cover";
      avatar.onerror = () => avatar.src = "./none.png";

      const userName = document.createElement("span");
      userName.innerHTML = item.username + (item.isAdmin ? ' <span class="text-yellow-200 font-semibold">(Admin)</span>' : '');
      userName.className = "text-xs text-gray-400";

      profileLeft.appendChild(avatar);
      profileLeft.appendChild(userName);

      const date = document.createElement("span");
      date.textContent = formatDateFromTimestamp(item.timestamp);
      date.className = "text-xs text-gray-500 ml-auto";

      profileWrapper.appendChild(profileLeft);
      profileWrapper.appendChild(date);

      wrapper.appendChild(img);
      wrapper.appendChild(caption);
      wrapper.appendChild(profileWrapper);

      container.appendChild(wrapper);
    });

    lazyLoadImages();
    updateLoadingProgress();
  } catch (err) {
    container.innerHTML = `<p class="text-red-400 text-center">Gagal memuat: ${err.message}</p>`;
  }
}
function lazyLoadImages() {
  const lazyImages = document.querySelectorAll('img.lazy-img[data-src]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => observer.observe(img));
  } else {
    // Browser tidak support, fallback langsung load
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

function formatDateFromTimestamp(timestamp) {
  const date = new Date(Number(timestamp));
  if (isNaN(date)) return "Tanggal tidak valid";
  const secondsAgo = Math.floor((Date.now() - timestamp) / 1000);
  const timeUnits = [
    { label: "tahun", seconds: 31536000 },
    { label: "bulan", seconds: 2592000 },
    { label: "minggu", seconds: 604800 },
    { label: "hari", seconds: 86400 },
    { label: "jam", seconds: 3600 },
    { label: "menit", seconds: 60 },
    { label: "detik", seconds: 1 }
  ];
  for (const unit of timeUnits) {
    const count = Math.floor(secondsAgo / unit.seconds);
    if (count > 0) return `${count} ${unit.label} yang lalu`;
  }
  return `Baru saja`;
}

async function loadProfileData() {
  try {
    const res = await fetch(BASE_API + '/info-group', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: '120363043559522563@g.us', profile: true })
    });
    const { data: { profileUrl, subject, size, participants } } = await res.json();
    members = participants.map(v => v.id);
    document.getElementById("profileImage").src = profileUrl;
    document.getElementById("profileTitle").textContent = subject;
    document.getElementById("profileDesc").textContent = `Memiliki ${size} anggota aktif`;
    return participants;
  } catch (error) {
    document.getElementById("profileImage").src = "./profile.jpg";
    document.getElementById("profileTitle").textContent = "Anime Universe";
    document.getElementById("profileDesc").textContent = "Grup sosial";
  }
  updateLoadingProgress();
  return [];
}

document.addEventListener("DOMContentLoaded", () => {
  const warnLoginForm = document.getElementById("warnLoginForm");
  if(localStorage.getItem("loginStatus")) {
    warnLoginForm.textContent = ''
  } else {
    warnLoginForm.textContent = 'Login agar postinganmu memiliki nama dan foto profile'
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
    ref.once("value").then(snapshot => {
      let count = snapshot.val() || 0;
      document.getElementById("visitorCount").textContent = count.toLocaleString("id-ID");
    });
  }


  const tabBeranda = document.getElementById("tabBeranda");
  const tabFreepost = document.getElementById("tabFreepost");
  const berandaSection = document.getElementById("berandaSection");
  const freepostSection = document.getElementById("freepostSection");

  tabBeranda.addEventListener("click", () => {
    tabBeranda.classList.add("bg-blue-600");
    tabFreepost.classList.remove("bg-blue-600");
    berandaSection.classList.remove("hidden");
    freepostSection.classList.add("hidden");
  });

  tabFreepost.addEventListener("click", () => {
    tabFreepost.classList.add("bg-blue-600");
    tabBeranda.classList.remove("bg-blue-600");
    freepostSection.classList.remove("hidden");
    berandaSection.classList.add("hidden");
  });


  const menuBtn = document.getElementById('menuBtn');
  const menuDropdown = document.getElementById('menuDropdown');
  const userName = document.getElementById('username');
  const userPicture = document.getElementById("userPicture");

  menuBtn.addEventListener('click', () => {
    menuDropdown.classList.toggle('hidden');
  });

  window.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
      menuDropdown.classList.add('hidden');
    }
  });

  
  if (localStorage.getItem("loginStatus") === "loggedIn") {
    const usersRef = db.ref("users/" + localStorage.getItem("nomor"));
    
    usersRef.once("value", async (snap) => {
      if (!snap.exists()) {
        localStorage.removeItem("loginStatus");
        localStorage.removeItem("nomor");
        location.reload();
      } else {
        const res = await fetch(BASE_API + "/info-user", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nomor: localStorage.getItem("nomor"), profile: true })
        }).then(data => data.json())

        const logoutBtn = document.createElement("button");
        const myProfile = document.createElement("button");
        const img = document.createElement("img");
        img.src = res?.data?.profileUrl ?? './none.png';
        img.alt = "Profile";
        img.className = "w-5 h-5 rounded-full object-cover border border-gray-600"

        const username = snap.val().nama;

        logoutBtn.className = "w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2";
        logoutBtn.innerHTML = `<i data-lucide="log-out" class="w-4 h-4"></i> Logout`;
        logoutBtn.onclick = () => {
          localStorage.removeItem("loginStatus");
          localStorage.removeItem("nomor");
          location.reload();
        };

        myProfile.className = "w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2";
        myProfile.innerHTML = `<i data-lucide="user-pen" class="w-4 h-4"></i> Profile Saya`;
        myProfile.onclick = () => window.location.href = "./profile.html";

        userName.textContent = username;
        menuDropdown.insertBefore(myProfile, menuDropdown.firstChild);
        menuDropdown.insertBefore(logoutBtn, menuDropdown.firstChild);
        menuDropdown.querySelector("button[onclick*='login']").remove();
        userPicture.insertBefore(img, userPicture.firstChild);
        lucide.createIcons();
      }
      updateLoadingProgress();
    });
  }
  loadProfileData().then(data => {
    if(localStorage.getItem("loginStatus") === "loggedIn") {
      const members = data.map(v => v.id.split("@")[0]);
      if(![].includes(localStorage.getItem("nomor"))) {
        localStorage.removeItem("loginStatus");
        localStorage.removeItem("nomor");
        location.reload();
      }
    }
  })
  fetchGalleryImages('minecraftFotbar', 'minecraft');
  fetchGalleryImages('gambarRandom', 'random');
  fetchGalleryImages('nezukoUniverse', 'nezuko');
  fetchFreepostGallery();
  document.getElementById("sortSelect")?.addEventListener("change", function () {
    fetchFreepostGallery("gallery", this.value);
  });
});

async function fetchMCStatsStatus() {
  const statusBox = document.getElementById("mcStatus");
  try {
    const response = await fetch(`https://api.mcsrvstat.us/bedrock/2/AnimeUnicraft.aternos.me:12698`);
    const data = await response.json();

    const online = data?.online;
    const playersOnline = data?.players?.online ?? 0;
    const playersMax = data?.players?.max ?? "??";
    const version = data?.version ?? "Tidak diketahui";
    const description = data?.motd?.clean.join(` `) ?? "Tidak ada deskripsi.";

    if (!online) {
      statusBox.innerHTML = `<p><span class="font-semibold text-red-400">Status:</span> Offline</p><p>Server tidak aktif saat ini.</p>`;
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
  }
  updateLoadingProgress();
}

fetchMCStatsStatus();
setInterval(fetchMCStatsStatus, 60000);


async function fetchGalleryImages(id, folderPath) {
  const apiUrl = `https://api.github.com/repos/rifaichump/database/contents/${folderPath}`;
  const container = document.getElementById(id);
  container.innerHTML = `<p id="loading" class="text-yellow-200 text-center">Memuat gambar...</p>`;

  try {
    const response = await fetch(apiUrl, {
      headers: { "Authorization": `Bearer ${githubToken}` }
    });
    const files = await response.json();
    document.getElementById('loading')?.classList.add("hidden");

    if (!Array.isArray(files)) throw new Error("Folder tidak ditemukan.");

    files.filter(file => file.type === "file" && /\.(jpg|jpeg|png|webp)$/i.test(file.name))
      .forEach(file => {
        const imageUrl = `https://raw.githubusercontent.com/rifaichump/database/main/${folderPath}/${file.name}`;
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");

        const slide = document.createElement("div");
        slide.className = "min-w-[250px] snap-start";
        slide.innerHTML = `
          <img src="${imageUrl}" alt="${nameWithoutExt}" class="rounded-xl w-full object-cover h-48 shadow-lg mb-2" />
          <p class="text-center text-sm text-gray-300">${nameWithoutExt}</p>
        `;

        container.appendChild(slide);
      });
    updateLoadingProgress();
  } catch (err) {
    container.innerHTML = `<p class="text-red-400 text-center">Gagal memuat gambar. Upload terlebih dahulu</p>`;
  }
}
