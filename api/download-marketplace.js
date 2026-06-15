const axios = require("axios");
const fetch = require("node-fetch");
const path = require("path");
const FormData = require('form-data');
const uploadFile = require("../lib/uploadFile");

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Cara penggunaan:\n${usedPrefix+command} https://marketplace.minecraft.net/en-us/pdp?id=9dc6762f-4cea-4dd9-b8c1-6bea0d6bf6d4`;
  const uuid = getMarketplaceUid(text.trim());
  if (!uuid) throw `Gunakan url yang valid\nContoh url: https://marketplace.minecraft.net/en-us/pdp?id=9dc6762f-4c...`;
  try {
    const cekItem = await checkItem(uuid);
    if (cekItem.success) {
      let files = [];
      let buffers = [];
      const id = cekItem.item.id;
      const item = cekItem.item;
      
      let mainText = `*${item.title}*\nBy ${item.creator}\n\n*Type:* ${item.type}\n*Rating:* ${item.rating} (${item.ratingCount})\n*Price:* ${item.price}\n\n*Description:*\n${item.description}`
      
      const msgPreview = await conn.sendMessage(m.chat, {
        image: { url: item.image },
        caption: mainText
      }, { quoted: m, ...eph });
      
      await conn.sendMessage(m.chat, { image: { url: item.image }, caption: mainText+'\n\nChecking files...', edit: msgPreview.key });
      
      const download = await downloadStart(id);
      const cekStatus = await checkStatus(download.job);
      
      await conn.sendMessage(m.chat, { image: { url: item.image }, caption: mainText+'\n\nDownloading files...', edit: msgPreview.key });
      
      for (let file of cekStatus.files) {
        const data = await downloadFile('https://pokes.pages.dev'+file.url);
        buffers.push({
          name: file.name,
          buffer: data,
          size: data.length
        });
      }
      
      await conn.sendMessage(m.chat, { image: { url: item.image }, caption: mainText+'\n\nUpload files to url...', edit: msgPreview.key });

      for (let b of buffers) {
        const urlData = await uploadFileToServer(b.buffer, b.name);
        files.push({
          name: b.name,
          url: urlData,
          size: b.size
        });
      }
      
      const totalSize = files.reduce((sum, item) => sum + (item.size || 0), 0);
      const doneText = mainText+`\n\n*Files ${formatSize(totalSize)}:*\n${files.map((v, i) => `${i+1}. ${v.name} (${formatSize(v.size)})\n- Url: ${v.url}`).join('\n\n')}`.trimEnd();

      await conn.sendMessage(m.chat, { image: { url: item.image }, caption: doneText, edit: msgPreview.key });
      
    } else {
      m.reply(cekItem.error);
    }
  } catch (e) {
    console.log(e);
    m.reply(`Terjadi kesalahan saat proses mengunduh`)
  }
}
handler.command = "marketplace";
handler.help = ["marketplace"].map(v => v + " <link>");
handler.tags = ["download"];
module.exports = handler;

function formatSize(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unit = 0;
  while (bytes >= 1024 && unit < units.length - 1) {
    bytes /= 1024;
    unit++;
  }
  return `${bytes.toFixed(2)} ${units[unit]}`;
}

async function uploadFileToServer(buffer, name) {
  try {
    const data = new FormData();
    data.append('filename', name);
    data.append('file', buffer, {
      filename: 'blob'
    });
    
    const options = {
      method: 'POST',
      body: data
    };
    
    const response = await fetch('http://animeunicraft.duckdns.org:2033/file/upload', options);
    if (response.ok) {
      const res = await response.json();
      const url = 'http://animeunicraft.duckdns.org:2033'+res.path;
      const result = Buffer.from(url).toString("base64url");
      return 'https://animeuniverse.vercel.app/api/download?id='result;
    } else {
      const res = await response.json();
      console.log(res);
      return null;
    }
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function downloadFile(url) {
  const response = await axios({
    method: "GET",
    url,
    responseType: "stream"
  });
  const chunks = [];
  for await (const chunk of response.data) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function checkItem(uuid) {
  const response = await fetch('https://pokes.pages.dev/api/item?id='+uuid);
  const res = await response.json();
  return res;
}

async function downloadStart(uuid) {
  const data = JSON.stringify({
    "uuid": uuid
  });
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data
  };
  const response = await fetch('https://pokes.pages.dev/api/download/start', options);
  const res = await response.json();
  return res;
}

function getMarketplaceUid(url) {
  try {
    const u = new URL(url);
    if (u.hostname !== "marketplace.minecraft.net") {
      return null;
    }
    return u.searchParams.get("id");
  } catch {
    return null;
  }
}

async function checkStatus(job) {
  while (true) {
    await new Promise(_ => setTimeout(_, 1000));
    const res = await getStatusDownload(job);
    console.log(res.status);
    if (res.status === "done") {
      return res;
    }
  }
}

async function getStatusDownload(job) {
  const response = await fetch('https://pokes.pages.dev/api/download/status?job='+job);
  const res = await response.json();
  return res;
}