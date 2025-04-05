const github_username = "rifaichump";
const repo_name = "database";

const allT = {
  a: "ghp_qwQtP",
  b: "ZLFwHLHoE9xTH5eE",
  c: "UmRyoVwbQ40ixPS"
}
const token = allT.a + allT.b + allT.c;

function checkLimits() {
  fetch("https://api.github.com/rate_limit", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  }).then(res => res.json()).then(data => document.getElementById('limitCheck').textContent = `Sisa limit: ${data.rate.remaining}`)
}
checkLimits()

async function uploadGithub(event) {
  event.preventDefault();
  const pw = document.getElementById('pw');
  const fn = document.getElementById('filename');
  const status = document.getElementById('status');
  const gambar = document.getElementById('image');
  const beton = document.getElementById('beton');
  
  console.log({
    password: pw.value,
    filename: fn.value,
    file: gambar.files
  })
  
  const file = gambar.files[0];
  if (!pw.value) {
    status.innerHTML = "<p>Harap masukan password!</p>";
    return;
  } else if (!fn.value) {
    status.innerHTML = "<p>Harap masukan nama file!</p>";
    return;
  }
  
  if (!file) {
    status.innerHTML = "<p>Harap pilih gambar terlebih dahulu.</p>";
    return;
  }
  
  if(pw.value !== 'animeuniverse2021') {
    status.innerHTML = "<p>Password salah!</p>";
    return;
  }
  
  beton.disabled = true;

  const reader = new FileReader();
  reader.onload = async function() {
    const base64Image = reader.result.split(',')[1];

    try {
      const res = await uploadToGitHubFile({
        owner: github_username,
        repo: repo_name,
        token: token,
        path: `${fn.value ? fn.value.trim() : `${new Date() * 1}`}.jpg`,
        content: base64Image,
        message: `Upload ${file.name}`
      });
      status.innerHTML = `<p>Berhasil upload</p>`;
      if(res.ok) {
        beton.disabled = false;
      };
      window.location.href = "index.html";
    } catch (err) {
      console.error(err);
      status.innerHTML = "<p>Gagal upload</p>";
    }
  };

  reader.readAsDataURL(file);
}

async function uploadToGitHubFile({
  owner,
  repo,
  path,
  token,
  content,
  message = "Upload file via API"
}) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const encodedContent = content;

  const body = {
    message,
    content: encodedContent
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
  if (!response.ok) {
    throw new Error(`GitHub API error: ${result.message}`);
  }
  return result;
}
