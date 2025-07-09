document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("deleteForm");
  const folderInput = document.getElementById("folderPath");
  const fileNameSelect = document.getElementById("fileName");
  const passwordInput = document.getElementById("password");
  const statusText = document.getElementById("statusText");
  const deleteBtn = document.getElementById("deleteBtn");

  const allT = {
    a: "ghp_qwQtP",
    b: "ZLFwHLHoE9xTH5eE",
    c: "UmRyoVwbQ40ixPS"
  };
  const githubToken = allT.a + allT.b + allT.c;
  const githubUsername = "rifaichump";
  const githubRepo = "database";

  folderInput.addEventListener("change", async () => {
    const folder = folderInput.value;
    fileNameSelect.innerHTML = `<option value="">Memuat file...</option>`;

    const url = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${folder}`;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${githubToken}` }
      });
      const files = await res.json();

      if (!Array.isArray(files)) throw new Error("Gagal memuat file");

      fileNameSelect.innerHTML = files
        .filter(file => file.type === "file")
        .map(file => `<option value="${file.name}">${file.name}</option>`)
        .join("") || `<option value="">Tidak ada file</option>`;
    } catch (err) {
      fileNameSelect.innerHTML = `<option value="">Gagal memuat</option>`;
    }
  });
  folderInput.dispatchEvent(new Event("change"));


  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (passwordInput.value !== 'animeuniverse2021') {
      statusText.textContent = "Password salah ❌";
      statusText.classList.remove("hidden");
      setTimeout(() => {
        statusText.classList.add("hidden");
        statusText.textContent = "Menghapus file...";
      }, 1000);
      return;
    }

    const folder = folderInput.value;
    const fileName = fileNameSelect.value;
    if (!fileName) return alert("Pilih file yang ingin dihapus");

    const filePath = `${folder}${fileName}`;
    const apiUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${filePath}`;

    statusText.textContent = "Menghapus file...";
    statusText.classList.remove("hidden");
    deleteBtn.disabled = true;
    deleteBtn.classList.add("opacity-50", "cursor-not-allowed");

    try {
      const fileData = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${githubToken}` }
      }).then(res => res.json());

      if (!fileData.sha) throw new Error("File tidak ditemukan.");

      const payload = {
        message: `Hapus ${fileName}`,
        sha: fileData.sha
      };

      const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${githubToken}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        statusText.textContent = "Berhasil dihapus ✅";
        folderInput.dispatchEvent(new Event("change"));
        form.reset();
        fileNameSelect.innerHTML = `<option value="">Pilih folder terlebih dahulu</option>`;
      } else {
        const result = await response.json();
        folderInput.dispatchEvent(new Event("change"));
        throw new Error(result.message || "Gagal menghapus.");
      }
    } catch (err) {
      statusText.textContent = "Gagal ❌ " + err.message;
    }

    deleteBtn.disabled = false;
    deleteBtn.classList.remove("opacity-50", "cursor-not-allowed");

    setTimeout(() => {
      statusText.classList.add("hidden");
      statusText.textContent = "Menghapus file...";
    }, 1500);
  });
});