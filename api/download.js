export default async function handler(req, res) {
  try {
    const data = Buffer
      .from(req.query.id, "base64url")
      .toString("utf8")      
    const json = JSON.parse(data);
    sendDownloadPage(res, {
      fileName: json.name,
      downloadUrl: json.url
    });
  } catch (e) {
    sendErrorPage(res, { message: e.message });
  }
}

function sendErrorPage(res, { title = "Error", message = "Terjadi kesalahan", code = 500 }) {
  const html = `
  <!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${title}</title>
    <style>
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        background: #0f172a;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
      }
      .box {
        text-align: center;
        padding: 30px;
        background: #1e293b;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        width: 320px;
      }
      .code {
        font-size: 28px;
        font-weight: bold;
        color: #ef4444;
        margin-bottom: 10px;
      }
      .title {
        font-size: 18px;
        margin-bottom: 10px;
      }
      .message {
        font-size: 14px;
        opacity: 0.8;
        margin-bottom: 20px;
        word-break: break-word;
      }
      .btn {
        display: inline-block;
        padding: 10px 16px;
        background: #ef4444;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: bold;
      }
      .btn:hover {
        background: #dc2626;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <div class="code">${code}</div>
      <div class="title">${title}</div>
      <div class="message">${message}</div>
      <a class="btn" href="javascript:location.reload()">Coba Lagi</a>
    </div>
  </body>
  </html>
  `;

  res.status(code).setHeader("Content-Type", "text/html");
  res.send(html);
}

function sendDownloadPage(res, { fileName, downloadUrl }) {
  const html = `
  <!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Download File</title>
    <style>
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        background: #0f172a;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
      }
      .box {
        text-align: center;
        padding: 30px;
        background: #1e293b;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        width: 300px;
      }
      .filename {
        font-size: 16px;
        margin-bottom: 20px;
        word-break: break-word;
      }
      .btn {
        display: inline-block;
        padding: 12px 20px;
        background: #22c55e;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: bold;
        transition: 0.2s;
      }
      .btn:hover {
        background: #16a34a;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <div class="filename">${fileName}</div>
      <a class="btn" href="${downloadUrl}" download>Unduh</a>
    </div>
  </body>
  </html>
  `;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
}