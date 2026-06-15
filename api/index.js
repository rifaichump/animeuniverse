const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require('path');
const multer = require("multer");
const fs = require('fs');
const cors = require("cors");
const _ = require('lodash');
const admin = require("firebase-admin");
var low = require('./lib/lowdb');
const { spawn } = require('child_process');
const { ZipArchive } = require('archiver');
const properties = require('minecraft-server-properties');
const {
  parseMinecraftEvent
} = require('./lib/func');

fs.mkdirSync("./files/temp", { recursive: true });
fs.mkdirSync("./files/default", { recursive: true });
fs.mkdirSync("./servermc", { recursive: true });

const META_FILE = "./files/metadata.json";
if (!fs.existsSync(META_FILE)) {
  fs.writeFileSync(META_FILE, "[]");
}

function readMeta() {
  return JSON.parse(fs.readFileSync(META_FILE, "utf8"));
}

function writeMeta(data) {
  fs.writeFileSync(META_FILE, JSON.stringify(data, null, 2));
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const folder = req.body.permanent === "true"
      ? "./files/default"
      : "./files/temp";

    cb(null, folder);
  },
  filename(req, file, cb) {
    const ext = path.extname(req.body.filename);
    const safe = req.body.filename.replace(/ /g, "_").replace(ext, '');
    const name = `${safe}-${Math.floor(Date.now()/100)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

const PROPERTIES_FILE = path.join(__dirname, 'servermc', 'server.properties');
const allowlistPath = path.join(__dirname, "servermc", "allowlist.json");

function readAllowlist() {
    if (!fs.existsSync(allowlistPath)) {
        fs.writeFileSync(allowlistPath, "[]");
    }
    return JSON.parse(fs.readFileSync(allowlistPath, "utf8"));
}

function saveAllowlist(data) {
    fs.writeFileSync(
        allowlistPath,
        JSON.stringify(data)+'\n'
    );
}

const logger = {
  mc: (log) => console.log(`[MC] ${log}`),
  chat: (log) => console.log(`[CHAT] ${log}`),
  stream: (log) => console.log(`[STREAM] ${log}`),
  server: (log) => console.log(`[SERVER] ${log}`)
}

const tellraw = (cp, args = [], tag = "@a") => {
  const command = `tellraw ${tag} ` + JSON.stringify({
    rawtext: args.map(value => ({
      text: value
    }))
  });

  if (cp && cp.stdin.writable) {
    cp.stdin.write(command + '\n');
  }
}

const titleraw = (cp, type = "title", args = [], tag = "@a") => {
  const command =
    `titleraw ${tag} ${type} ` +
    JSON.stringify({
      rawtext: args.map(value => ({
        text: value
      }))
    });

  if (cp && cp.stdin.writable) {
    cp.stdin.write(command + '\n');
  }
}

const serviceAccount = require("./service-account.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://animeuniversenew-default-rtdb.asia-southeast1.firebasedatabase.app/"
})

const fdb = admin.database();
const app = express();
const server = http.createServer(app);
const PORT = process.env.SERVER_PORT || 3000;
const { Low, JSONFile } = low;

let db = new Low(new JSONFile(`database.json`));
const loadDatabase = async function loadDatabase() {
  if (db.READ) return new Promise((resolve) => setInterval(function () { (!db.READ ? (clearInterval(this), resolve(db.data == null ? loadDatabase() : db.data)) : null) }, 1 * 1000));
  if (db.data !== null) return;
  db.READ = true;
  await db.read();
  db.READ = false;
  db.data = {
    chats: [],
    ...(db.data || {})
  };
  db.chain = _.chain(db.data)
}
loadDatabase();

const allowedIps = [
  '127.0.0.1',
  '45.251.7.63'
];

const TOKEN = "HWOXNIJ10DJXNDNQOJBX87G2VBN49DB";
app.use(express.json());
app.use(cors());
app.use("/files/temp", express.static("./files/temp"));
app.use("/files/default", express.static("./files/default"));

app.post("/file/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      msg: "File not found"
    });
  }

  if (!req.body.filename) {
    return res.status(400).json({
      success: false,
      msg: "Filename not found"
    });
  }
  
  const permanent = String(req.body.permanent).toLowerCase() === "true";
  const type = permanent ? "default" : "temp";

  if (!permanent) {
    const meta = readMeta();
    meta.push({
      filename: req.file.filename,
      path: req.file.path,
      expires: Date.now() + 300000
    });
    writeMeta(meta);
  }

  return res.status(200).json({
    success: true,
    filename: req.file.filename,
    path: `/files/${type}/${req.file.filename}`
  });
});

/* const ip = req.ip.replace('::ffff:', '');

  if (allowedIps.includes(ip)) {
    console.log(`[${req.method}] ${req.url} | IP: ${ip} | ${req.headers['content-type'] || '-'} | Accepted`);
    return next();
  }
  
  const auth = req.headers.authorization;
  if (!auth) {
    console.log(`[${req.method}] ${req.url} | IP: ${ip} | ${req.headers['content-type'] || '-'} | Rejected`);
    return res.status(403).send('Forbidden');
  }

  const [type, token] = auth.split(' ');
  if (type !== 'Bearer' || token !== TOKEN) {
    console.log(`[${req.method}] ${req.url} | IP: ${ip} | ${req.headers['content-type'] || '-'} | Rejected`);
    return res.status(403).send('Forbidden');
  }
  
  console.log(`[${req.method}] ${req.url} | IP: ${ip} | ${req.headers['content-type'] || '-'} | Accepted`);
  
  next();
}); */

app.use((req, res, next) => {
  const ip = req.ip.replace('::ffff:', '');
  const contentType = req.headers['content-type'] || '-';

  let accepted = false;
  if (allowedIps.includes(ip)) {
    accepted = true;
  } else {
    const auth = req.headers.authorization;
    if (auth) {
      const [type, token] = auth.split(' ');
      if (type === 'Bearer' && token === TOKEN) {
        accepted = true;
      }
    }
  }

  console.log(`[${req.method}] ${ip} | ${req.url} | ${accepted ? 'Accepted' : 'Rejected'}`);

  if (!accepted) {
    return res.status(403).send('Forbidden');
  }

  next();
});

app.get("/", (req, res) => {
    res.json({
        status: true,
        message: "API aktif"
    });
});

// Server Minecraft
let mcProcess = null;
let onlinePlayers = [];

function startServerMc() {
  mcProcess = spawn('./bedrock_server', [], {
    cwd: '/home/container/servermc',
    stdio: 'pipe'
  });

  mcProcess.stdout.on('data', (data) => {
    const logs = data.toString().split('\n');

    logs.forEach((line) => {
      if (!line.trim()) return;
      
      const log = line.toLowerCase();
      if (log.includes('starting server')) {
        logger.mc('Starting server');
      }
      if (log.includes('server started')) {
        logger.mc('Server started.');
      }
      
      // Join & Left players
      const logParse = parseMinecraftEvent(line);
      if (!logParse) return;
      const username = logParse.name;
      const event = logParse.event;
      if (event === 'join') {
        logger.mc(`${username} joined the game`);
        setTimeout(() => {
          tellraw(mcProcess,[
            `§bSelamat datang ${username} di Server Anime Unicraft, Selamat bermain...`
          ], username);
        }, 10000);
        
        if (!onlinePlayers.includes(username)) {
          onlinePlayers.push(username);
        }
      } else if (event === 'left') {
        logger.mc(`${username} left the game`);
        
        const index = onlinePlayers.indexOf(username);
        if (index !== -1) {
          onlinePlayers.splice(index, 1);
        }
      }

    });
  });

  mcProcess.stderr.on('data', (data) => {
    console.log(`[MC ERROR] ${data}`);
  });

  mcProcess.on('close', (code) => {
    logger.mc(`Stopping server code: ${code}`);
    onlinePlayers = [];
    mcProcess = null;
  });
}

app.get('/servermc/start', (req, res) => {
  if (mcProcess) {
    return res.send('Server sudah jalan');
  }
  
  startServerMc();
  res.send('Server minecraft berhasil dijalankan');
});

app.get('/servermc/restart', (req, res) => {
  if (!mcProcess) {
    startServerMc();
    return res.send('Server tidak jalan, server otomatis dijalankan');
  }

  onlinePlayers = [];
  mcProcess.stdin.write('stop\n');

  mcProcess.once('close', () => {
    startServerMc();
  });

  res.send('Server minecraft sedang direstart');
});

app.get('/servermc/stop', (req, res) => {
  if (!mcProcess) {
    return res.send('Server tidak jalan');
  }
  
  onlinePlayers = [];
  mcProcess.stdin.write('stop\n');

  res.send('Server minecraft dimatikan');
});

app.post("/servermc/addplayer", (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.json({
        success: false,
        message: "name wajib diisi"
      });
    }

    const allowlist = readAllowlist();

    const exists = allowlist.find(p => p.name.toLowerCase() === name.toLowerCase());

    if (exists) {
      return res.json({
        success: false,
        message: "Player sudah ada di allowlist"
      });
    }

    allowlist.push({ name });

    saveAllowlist(allowlist);

    if (mcProcess) {
      mcProcess.stdin.write("allowlist reload\n");
    }
    
    logger.mc(`${name} added to allowlist`);
    res.json({
      success: true,
      message: `${name} berhasil ditambahkan`
    });

  } catch (err) {
    res.json({
      success: false,
      message: "Terjadi kesalahan server"
    });
  }
});

app.post("/servermc/removeplayer", (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.json({
        success: false,
        message: "name wajib diisi"
      });
    }

    const allowlist = readAllowlist();

    const newAllowlist = allowlist.filter(p => p.name.toLowerCase() !== name.toLowerCase());

    if (newAllowlist.length === allowlist.length) {
      return res.json({
        success: false,
        message: "Player tidak ditemukan"
      });
    }

    saveAllowlist(newAllowlist);

    if (mcProcess) {
      mcProcess.stdin.write("allowlist reload\n");
    }

    logger.mc(`${name} removed from allowlist`);
    res.json({
      success: true,
      message: `${name} berhasil dihapus`
    });
  } catch (err) {
    res.json({
      success: false,
      message: "Terjadi kesalahan server"
    });
  }
});

app.post('/servermc/command', (req, res) => {
  if (!mcProcess) {
    return res.send('Server tidak jalan');
  }

  const { command } = req.body;
  if (!command) {
    return res.send('Command tidak ada');
  }
  
  mcProcess.stdin.write(`${command}\n`);
  
  logger.mc(`Command: ${command}`)
  res.send('Command executed');
});

app.get('/servermc/backup', async (req, res) => {
  logger.mc('Backup world');
  if (mcProcess) {
    return res.status(500).json({
      error: "Pastikan server sudah dimatikan"
    });
  }

  try {
    const worldPath = path.resolve('servermc/worlds/world');

    if (!fs.existsSync(worldPath)) {
      return res.status(404).json({
        error: 'World tidak ditemukan'
      });
    }

    const zipName = `world-${Date.now()}.zip`;
    const zipPath = path.resolve('servermc', zipName);

    const output = fs.createWriteStream(zipPath);

    const archive = new ZipArchive({
      zlib: { level: 9 }
    });

    archive.on('error', (err) => {
      console.error(err);

      if (!res.headersSent) {
        res.status(500).json({
          error: err.message
        });
      }
    });

    archive.pipe(output);

    output.on('close', () => {
      res.download(zipPath, zipName, (err) => {
        fs.unlink(zipPath, () => {});

        if (err) {
          console.error(err);

          if (!res.headersSent) {
            res.status(500).json({
              error: 'Gagal mengirim backup'
            });
          }
        }
      });
    });

    archive.directory(worldPath, 'world');

    await archive.finalize();

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.get('/servermc/status', (req, res) => {
  logger.mc('Getting server stats');
  
  if (!mcProcess) {
      return res.json({ online: false });
  }
  
  res.json({
    online: true,
    players: onlinePlayers
  });
});

app.get('/servermc/detail', (req, res) => {
  try {
    if (!fs.existsSync(PROPERTIES_FILE)) {
      return res.status(404).json({
        success: false,
        message: 'server.properties tidak ditemukan'
      });
    }

    const text = fs.readFileSync(PROPERTIES_FILE, 'utf8');
    const data = properties.parse(text);

    res.json({
      success: true,
      data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

app.get('/servermc/whitelist', (req, res) => {
  logger.mc('Allowlist reading');
  try {
    res.json(readAllowlist());
  } catch {
    res.json([]);
  }
});

// WebSocket
const wssChat = new WebSocket.Server({ noServer: true });
const wssStream = new WebSocket.Server({ noServer: true });

// Chat Socket
wssChat.on("connection", (ws, req) => {
  logger.chat("Client connected");
  
  wssChat.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        event: "online",
        data: { count: wssChat.clients.size }
      }));
    }
  });
  
  ws.on("message", (msg) => {
    try {
      let data = JSON.parse(msg.toString());
      const payload = JSON.stringify({
        event: "chat",
        data: {
          user: data.user,
          message: data.message,
          messageId: data.messageId,
          date: data.date,
          replyToUserId: data.replyToUserId,
          replyToMessage: data.replyToMessage,
          replyToMessageId: data.replyToMessageId
        }
      });
      db.data.chats.push(payload)
      wssChat.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
          }
      });
      
      admin.messaging().send({
        topic: "chat",
        data: {
          type: "chat",
          senderId: data.user,
          body: data.message
        }
      });
    } catch (err) {
      logger.chat(`Error message`);
    }
  });

  ws.on("close", () => {
    logger.chat("Client disconnected");
    
    wssChat.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          event: "online",
          data: { count: wssChat.clients.size }
        }));
      }
    });
  });
  
  ws.send(JSON.stringify({
    event: "loadchat",
    data: db.data.chats
  }));
});

// Stream Socket
wssStream.on("connection", (ws) => {
    logger.stream("Client connected");
    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: "time",
                timestamp: Date.now()
            }));
        }
    }, 1000);

    ws.on("close", () => {
        clearInterval(interval);
        logger.stream("Client disconnected");
    });
});

// WS PATH
server.on("upgrade", (request, socket, head) => {
    const url = request.url;
    if (url === "/websocket/chat") {
        wssChat.handleUpgrade(request, socket, head, (ws) => {
            wssChat.emit("connection", ws, request);
        });
    } else if (url === "/websocket/stream") {
        wssStream.handleUpgrade(request, socket, head, (ws) => {
            wssStream.emit("connection", ws, request);
        });
    } else {
        socket.destroy();
    }
});

setInterval(async () => {
  if (db.data) await db.write().catch(console.error);
  const now = Date.now();
  let meta = readMeta();
  meta = meta.filter(file => {
    if (file.expires <= now) {
      try {
        fs.unlinkSync(file.path);
      } catch {}
      return false;
    }
    return true;
  });
  writeMeta(meta);
}, 5000);
  
// START SERVER
server.listen(PORT, async() => {
  logger.server(`Server starting, port: ${PORT}`);
});