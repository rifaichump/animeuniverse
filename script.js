console.log("OK")

const GITHUB_USERNAME = "rifaichump";
const REPO_NAME = "database";
const BRANCH = "main";

const allT = {
  a: "ghp_qwQtP",
  b: "ZLFwHLHoE9xTH5eE",
  c: "UmRyoVwbQ40ixPS"
}
const TOKEN = allT.a + allT.b + allT.c;


const linkGc = "https://chat.whatsapp.com/FMFBe4kJwao4xJIBWYzdy0"
const linkCh = "https://whatsapp.com/channel/0029VaWaUrD1XquPeK01cf2c"
const linkChSticker = "https://whatsapp.com/channel/0029VayeQ47KwqSOfY0TXc3r"

function imgWindow(path) {
  window.location.href = path
}

async function tampilkanMedia() {
    const mediaContainer = document.getElementById("media-container");
    
    mediaContainer.innerHTML = "";

    mediaContainer.classList.add("media-scroll");
    
    const sources = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents?ref=${BRANCH}`, {
      headers: {
        "Authorization": `Bearer ${TOKEN}`
      }
    }).then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        const fileNames = data.map(item => item.name);
        return fileNames;
      } else {
        return [];
      }
    });
    console.log(sources)
    
    if(!sources.length) {
      console.log("Mana fotonya jir");
      return;
    };
    
    let images = [];
    for(let nameImg of sources) {
      const result = await fetch(`https://api.github.com/repos/rifaichump/database/contents/${nameImg}?ref=main`, {
        headers: {
          "Authorization": `Bearer ${TOKEN}`
        }
      }).then(data => data.json())
      images.push(result.download_url)
    };
    
    console.log(images)

    const mediaWrapper = document.createElement("div");
    mediaWrapper.classList.add("media-wrapper");

     images.forEach(src => {
        const mediaBox = document.createElement("div");
        mediaBox.classList.add("media-box");
        
        const fileName = src.split('/').pop().replace('.jpg','');
        
        // Label nama file
        const label = document.createElement("p");
        label.textContent = fileName;
        label.classList.add("media-label");

        // Link + Gambar
        const link = document.createElement("a");
        link.href = src;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const img = document.createElement("img");
        img.src = src;
        img.alt = fileName;
        img.classList.add("media-item");

        link.appendChild(img);
        mediaBox.appendChild(label);
        mediaBox.appendChild(link);
        mediaWrapper.appendChild(mediaBox);
    });
    mediaContainer.appendChild(mediaWrapper);
}
tampilkanMedia()

function bukaGroup() {
  window.location.href = linkGc
}

function bukaChannel() {
  window.location.href = linkCh
}

function bukaChannelSticker() {
  window.location.href = linkChSticker
}

setInterval(async() => {
  const aternos = document.getElementById("aternos");
  try {
    const data = await (await fetch("https://api.mcstatus.io/v2/status/bedrock/AnimeUnicraft.aternos.me:12698")).json();
    if(data && data.online) {
      aternos.innerHTML = `
      <p class="server-status">Status: Online</p>
      <p class="server-status">Players: ${data.players.online}/${data.players.max}</p>
      `;
    } else {
      aternos.innerHTML = `
      <p class="server-status">Status: Offline</p>
      `;
    }
  } catch (e) {
    aternos.innerHTML = `
    <p class="server-status">Status: Unknown</p>
    `;
  }
}, 0)