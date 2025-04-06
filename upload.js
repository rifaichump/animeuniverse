const GITHUB_USERNAME = "rifaichump";
const REPO_NAME = "database";
const BRANCH = "main";
const pwnya = "animeuniverse2021";

const allT = {
  a: "ghp_qwQtP",
  b: "ZLFwHLHoE9xTH5eE",
  c: "UmRyoVwbQ40ixPS"
}
const TOKEN = allT.a + allT.b + allT.c;

const deleteBeton = document.getElementById('deleteBeton');
const delstatus = document.getElementById('delstatus');

function checkLimits() {
  fetch("https://api.github.com/rate_limit", {
    headers: {
      "Authorization": `Bearer ${TOKEN}`
    }
  }).then(res => res.json()).then(data => document.getElementById('limitCheck').textContent = `Sisa limit: ${data.rate.remaining}`)
}
checkLimits()

function checkListImage() {
  const formListImage = document.getElementById('formListImage');
  fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents?ref=${BRANCH}`, {
    headers: {
      "Authorization": `Bearer ${TOKEN}`
    }
  }).then(res => res.json())
  .then(data => {
    console.log(data)
    if (Array.isArray(data)) {
      const fileNames = data.map(item => item.name);
      if(!fileNames.length) {
        deleteBeton.disabled = true
        delstatus.textContent = `File Kosong`
        return
      }
      for(let names of fileNames) {
        const section = document.createElement('option')
        section.value = names
        section.textContent = names
        
        formListImage.appendChild(section)
      }
    } else {
      deleteBeton.disabled = true;
      delstatus.textContent = `File Kosong`;
    }
  });
}
checkListImage()

async function uploadGithub(event) {
  event.preventDefault();
  const pw = document.getElementById('pw');
  const fn = document.getElementById('filename');
  const status = document.getElementById('status');
  const gambar = document.getElementById('image');
  const uploadBeton = document.getElementById('uploadBeton');
  
  console.log({
    password: pw.value,
    filename: fn.value,
    file: gambar.files
  })
  
  const file = gambar.files[0];
  if(pw.value !== pwnya) {
    status.innerHTML = "Password salah!, Silahkan minta Password ke Rifai.";
    return;
  }
  
  const sources = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents?ref=${BRANCH}`, {
    headers: {
      "Authorization": `Bearer ${TOKEN}`
    }
  }).then(res => res.json()).then(data => {
    if(Array.isArray(data)) {
      return data.map(item => item.name.replace('.jpg','').replace('.png',''));
    } else {
      return [];
    }
  });
  if(fn.value) {
    if(sources.includes(fn.value)) {
      status.textContent = `Nama file sudah ada!`;
      return;
    }
  };
  
  uploadBeton.disabled = true;
  uploadBeton.textContent = "Loading...."

  const reader = new FileReader();
  reader.onload = async function() {
    const base64Image = reader.result.split(',')[1];

    try {
      const res = await uploadToGitHubFile({
        owner: GITHUB_USERNAME,
        repo: REPO_NAME,
        token: TOKEN,
        path: `${fn.value ? fn.value.trim() : `${new Date() * 1}`}.${file.type.split('/')[1]}`,
        content: base64Image,
        message: `Upload ${file.name}`
      });
      if(res) {
        console.log(res)
      }
      window.location.href = "index.html";
    } catch (err) {
      console.error(err);
      uploadBeton.disabled = false;
      status.textContent = `Gagal upload: ${err.message}`
    }
  };
  reader.readAsDataURL(file);
}

async function deleteFileGithub(event) {
  event.preventDefault();
  const formListImage = document.getElementById('formListImage');
  const pwdel = document.getElementById('pwdel');
  
  if(!pwdel.value) {
    delstatus.textContent = 'Harap masukan Password!';
    return;
  };
  
  if(pwdel.value !== pwnya) {
    delstatus.textContent = "Password salah!, Silahkan minta Password ke Rifai.";
    return;
  };
  
  try {
    const res = await deleteFileFromGitHub({
      owner: GITHUB_USERNAME,
      repo: REPO_NAME,
      path: formListImage.value,
      token: TOKEN
    });
    console.log(res);
    delstatus.textContent = `Berhasil Menghapus file: ${formListImage.value}`
    window.location.href = "index.html";
  } catch (err) {
    delstatus.textContent = `Error Code 500`
  };
};

async function uploadToGitHubFile({ owner, repo, path, token, content, message = "Upload file via API" }) {
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

async function deleteFileFromGitHub({ token, owner, repo, path, branch = "main", commitMessage = "Delete file via API" }) {
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/vnd.github.v3+json"
  };

  try {
    // 1. Ambil SHA file yang mau dihapus
    const shaResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, { headers });
    if (!shaResponse.ok) throw new Error("Gagal mendapatkan SHA file");
    
    const fileData = await shaResponse.json();
    const sha = fileData.sha;

    // 2. Kirim permintaan DELETE
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
