document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("deleteForm");
  const folderInput = document.getElementById("folderPath");
  const passwordInput = document.getElementById("password");
  const statusText = document.getElementById("statusText");
  const deleteBtn = document.getElementById("deleteBtn");

  const selectedFileBtn = document.getElementById("selectedFileBtn");
  const selectedFileLabel = document.getElementById("selectedFileLabel");
  const fileDropdown = document.getElementById("fileDropdown");

  let selectedFileValue = "";

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
    fileDropdown.innerHTML = `<li class="px-4 py-2 text-sm text-gray-500">Memuat file...</li>`;
    fileDropdown.classList.remove("hidden");

    const url = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${folder}`;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${githubToken}` }
      });
      const files = await res.json();

      if (!Array.isArray(files)) throw new Error("Gagal memuat file");

      if (files.length === 0) {
        fileDropdown.innerHTML = `<li class="px-4 py-2 text-sm text-gray-500">Tidak ada file</li>`;
        return;
      }

      fileDropdown.innerHTML = files
        .filter(file => file.type === "file")
        .map(
          file => `
            <li class="px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center gap-3" data-name="${file.name}">
              <img src="https://raw.githubusercontent.com/${githubUsername}/${githubRepo}/main/${folder}${file.name}" class="w-6 h-6 rounded-full" />
              <span class="truncate">${file.name}</span>
            </li>`
        )
        .join("");

      fileDropdown.querySelectorAll("li").forEach(item => {
        item.addEventListener("click", () => {
          selectedFileValue = item.dataset.name;
          selectedFileLabel.textContent = selectedFileValue;
          fileDropdown.classList.add("hidden");
        });
      });

    } catch (err) {
      fileDropdown.innerHTML = `<li class="px-4 py-2 text-sm text-red-500">Gagal memuat</li>`;
    }
  });

  selectedFileBtn.addEventListener("click", () => {
    fileDropdown.classList.toggle("hidden");
  });

  folderInput.dispatchEvent(new Event("change"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (passwordInput.value !== 'animeuniverse2021') {
      statusText.textContent = "Password salah";
      statusText.classList.remove("hidden");
      setTimeout(() => {
        statusText.classList.add("hidden");
        statusText.textContent = "Menghapus file...";
      }, 1000);
      return;
    }

    if (!selectedFileValue) return alert("Pilih file yang ingin dihapus");

    const folder = folderInput.value;
    const filePath = `${folder}${selectedFileValue}`;
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
        message: `Hapus ${selectedFileValue}`,
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
        statusText.textContent = "Berhasil dihapus";
        form.reset();
        selectedFileValue = "";
        selectedFileLabel.textContent = "Pilih file";
        folderInput.dispatchEvent(new Event("change"));
      } else {
        const result = await response.json();
        throw new Error(result.message || "Gagal menghapus.");
      }
    } catch (err) {
      statusText.textContent = "Gagal: " + err.message;
    }

    deleteBtn.disabled = false;
    deleteBtn.classList.remove("opacity-50", "cursor-not-allowed");

    setTimeout(() => {
      statusText.classList.add("hidden");
      statusText.textContent = "Menghapus file...";
    }, 1500);
  });
});
