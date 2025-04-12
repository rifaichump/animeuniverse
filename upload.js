const GITHUB_USERNAME = "rifaichump";
const REPO_NAME = "database";
const BRANCH = "main";
const pwnya = "animeuniverse2021";

// Token
const allT = {
  a: "ghp_qwQtP",
  b: "ZLFwHLHoE9xTH5eE",
  c: "UmRyoVwbQ40ixPS"
};
const TOKEN = allT.a + allT.b + allT.c;

// DOM Elements
const deleteBeton = document.getElementById('deleteBeton');
const delstatus = document.getElementById('delstatus');

// Ambil daftar file dari repo
function checkListImage() {
  const formListImage = document.getElementById('formListImage');

  fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents?ref=${BRANCH}`, {
    headers: {
      "Authorization": `Bearer ${TOKEN}`
    }
  })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        const fileNames = data.map(item => item.name);

        if (!fileNames.length) {
          deleteBeton.disabled = true;
          delstatus.textContent = `File Kosong`;
          return;
        }

        for (let name of fileNames) {
          const option = document.createElement('option');
          option.value = name;
          option.textContent = name;
          formListImage.appendChild(option);
        }
      } else {
        deleteBeton.disabled = true;
        delstatus.textContent = `File Kosong`;
      }
    });
}

checkListImage();

// Upload File ke GitHub
async function uploadGithub(event) {
  event.preventDefault();

  const pw = document.getElementById('pw');
  const fn = document.getElementById('filename');
  const status = document.getElementById('status');
  const gambar = document.getElementById('image');
  const uploadBeton = document.getElementById('uploadBeton');

  const file = gambar.files[0];

  if (pw.value !== pwnya) {
    status.textContent = "Password salah!, Silahkan minta Password ke Rifai.";
    return;
  }

  // Cek nama file duplikat
  const existingFiles = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents?ref=${BRANCH}`, {
    headers: {
      "Authorization": `Bearer ${TOKEN}`
    }
  }).then(res => res.json()).then(data => {
    return Array.isArray(data) ? data.map(item => item.name.replace(/\.(jpg|png|jpeg|gif)$/i, "")) : [];
  });

  if (fn.value && existingFiles.includes(fn.value)) {
    status.textContent = `Nama file sudah ada!`;
    return;
  }

  uploadBeton.disabled = true;
  uploadBeton.textContent = "Loading....";

  const reader = new FileReader();
  reader.onload = async function () {
    const base64Image = reader.result.split(',')[1];

    try {
      const response = await uploadToGitHubFile({
        owner: GITHUB_USERNAME,
        repo: REPO_NAME,
        token: TOKEN,
        path: `${fn.value ? fn.value.trim() : `${Date.now()}`}.${file.type.split('/')[1]}`,
        content: base64Image,
        message: `Upload ${file.name}`
      });

      if (response) console.log(response);
      window.location.href = "index.html";
    } catch (err) {
      console.error(err);
      uploadBeton.disabled = false;
      status.textContent = `Gagal upload: ${err.message}`;
    }
  };

  reader.readAsDataURL(file);
}

// Hapus File dari GitHub
async function deleteFileGithub(event) {
  event.preventDefault();

  const formListImage = document.getElementById('formListImage');
  const pwdel = document.getElementById('pwdel');

  if (!pwdel.value) {
    delstatus.textContent = 'Harap masukan Password!';
    return;
  }

  if (pwdel.value !== pwnya) {
    delstatus.textContent = "Password salah!, Silahkan minta Password ke Rifai.";
    return;
  }

  try {
    const res = await deleteFileFromGitHub({
      owner: GITHUB_USERNAME,
      repo: REPO_NAME,
      path: formListImage.value,
      token: TOKEN
    });

    console.log(res);
    delstatus.textContent = `Berhasil Menghapus file: ${formListImage.value}`;
    window.location.href = "index.html";
  } catch (err) {
    delstatus.textContent = `Error Code 500`;
  }
}

// Upload ke GitHub API
async function uploadToGitHubFile({ owner, repo, path, token, content, message = "Upload file via API" }) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const body = {
    message,
    content
  };

  const response = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      "Authorization": `token ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const result = await response.json();
  if (!response.ok) throw new Error(`GitHub API error: ${result.message}`);
  return result;
}

// Hapus file via GitHub API
async function deleteFileFromGitHub({ token, owner, repo, path, branch = "main", commitMessage = "Delete file via API" }) {
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/vnd.github.v3+json"
  };

  try {
    const shaResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, { headers });
    if (!shaResponse.ok) throw new Error("Gagal mendapatkan SHA file");

    const fileData = await shaResponse.json();
    const sha = fileData.sha;

    const deleteResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "DELETE",
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: commitMessage,
        sha,
        branch
      })
    });

    if (!deleteResponse.ok) throw new Error("Gagal menghapus file");

    const result = await deleteResponse.json();
    console.log("File berhasil dihapus:", result);
    return result;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}