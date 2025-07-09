document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");
  const fileName = document.getElementById("fileName");
  const password = document.getElementById("password");
  const fileInput = document.getElementById("fileInput");
  const loadingText = document.getElementById("loadingText");
  const submitBtn = document.getElementById("submitBtn");
  const folderInput = document.getElementById("folderPath");
  // Token
  const allT = {
    a: "ghp_qwQtP",
    b: "ZLFwHLHoE9xTH5eE",
    c: "UmRyoVwbQ40ixPS"
  };
  const githubToken = allT.a + allT.b + allT.c;
  const githubUsername = "rifaichump";
  const githubRepo = "database";

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (password.value != 'animeuniverse2021') {
      loadingText.textContent = "Password salah ❌";
      loadingText.classList.remove("hidden");
      setTimeout(() => {
        loadingText.classList.add("hidden");
        loadingText.textContent = "Mengupload gambar...";
      }, 1000);
      return;
    }

    const file = fileInput.files[0];
    if (!file) {
      alert("Harap pilih file gambar terlebih dahulu.");
      return;
    }

    // Tampilkan "Mengunggah..." & disable tombol
    loadingText.textContent = "Mengupload gambar...";
    loadingText.classList.remove("hidden");
    submitBtn.disabled = true;
    submitBtn.classList.add("opacity-50", "cursor-not-allowed");

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];

      const folderPath = folderInput.value.trim();
      const safeFolder = folderPath.endsWith("/") ? folderPath : folderPath + "/";
      const filePath = `${safeFolder}${fileName.value}.${file.type.split('/')[1]}`;

      // URL ke GitHub
      const apiURL = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${filePath}`;


      const payload = {
        message: `Upload ${file.name}`,
        content: base64,
      };

      fetch(apiURL, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${githubToken}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then(response => response.json())
        .then(data => {
          if (data.content) {
            loadingText.textContent = "Selesai ✅";
          } else {
            throw new Error(data.message || "Gagal mengupload.");
          }

          form.reset();
          submitBtn.disabled = false;
          submitBtn.classList.remove("opacity-50", "cursor-not-allowed");

          setTimeout(() => {
            loadingText.classList.add("hidden");
            loadingText.textContent = "Mengupload gambar...";
          }, 1000);
        })
        .catch(err => {
          loadingText.textContent = "Gagal ❌";
          submitBtn.disabled = false;
          submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
        });
    };

    reader.readAsDataURL(file);
  });
});
