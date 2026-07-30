const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 9755 });

const rooms = new Map();
const roomStates = new Map();
// Map untuk menyimpan history chat tiap room
const roomChats = new Map(); 

// Batas maksimal history chat yang disimpan per room
const MAX_CHAT_HISTORY = 50; 

function getCalculatedTime(roomId) {
  const state = roomStates.get(roomId);
  if (!state) return 0;

  if (state.isPaused) {
    return state.currentTime;
  }

  const elapsed = (Date.now() - state.lastUpdated) / 1000;
  return state.currentTime + elapsed;
}

function joinRoom(ws, roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }

  rooms.get(roomId).add(ws);

  if (!ws.rooms) {
    ws.rooms = new Set();
  }

  ws.rooms.add(roomId);

  // Inisialisasi state video jika room baru
  if (!roomStates.has(roomId)) {
    roomStates.set(roomId, {
      currentTime: 0,
      isPaused: false,
      lastUpdated: Date.now()
    });
  }

  // Inisialisasi history chat jika room baru
  if (!roomChats.has(roomId)) {
    roomChats.set(roomId, []);
  }

  // 1. Kirim state video saat ini ke user baru
  const currentTime = getCalculatedTime(roomId);
  const state = roomStates.get(roomId);

  ws.send(
    JSON.stringify({
      type: 'stream_sync',
      currentTime: currentTime,
      isPaused: state.isPaused
    })
  );

  // 2. Kirim History Chat ke user baru
  const chatHistory = roomChats.get(roomId);
  ws.send(
    JSON.stringify({
      type: 'chat_history',
      messages: chatHistory
    })
  );
}

function leaveRoom(ws, roomId) {
  const room = rooms.get(roomId);

  if (!room) return;

  room.delete(ws);

  // Jika room kosong, hapus room, state video, dan history chat
  if (room.size === 0) {
    rooms.delete(roomId);
    roomStates.delete(roomId);
    roomChats.delete(roomId);
  }

  ws.rooms?.delete(roomId);
}

function broadcast(roomId, data) {
  const room = rooms.get(roomId);

  if (!room) return;

  for (const ws of room) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }
}

// Interval broadcast stream sync (tiap 1 detik)
setInterval(() => {
  for (const [roomId, room] of rooms.entries()) {
    if (room.size > 0 && roomStates.has(roomId)) {
      const currentTime = getCalculatedTime(roomId);
      const state = roomStates.get(roomId);

      broadcast(roomId, {
        type: 'stream_sync',
        currentTime: currentTime,
        isPaused: state.isPaused
      });
    }
  }
}, 1000);

wss.on('connection', ws => {
  ws.rooms = new Set();

  ws.on('message', raw => {
    try {
      const data = JSON.parse(raw);

      if (data.type === 'join') {
        joinRoom(ws, data.roomId);
        return;
      }

      if (data.type === 'leave') {
        leaveRoom(ws, data.roomId);
        return;
      }

      // Live Chat
      if (data.type === 'message') {
        const chatItem = {
          sender: data.sender,
          message: data.message,
          timestamp: Date.now()
        };

        // Simpan ke history chat room
        if (roomChats.has(data.roomId)) {
          const history = roomChats.get(data.roomId);
          history.push(chatItem);

          // Batasi maksimal pesan agar memori tidak membengkak
          if (history.length > MAX_CHAT_HISTORY) {
            history.shift();
          }
        }

        // Broadcast pesan baru ke semua client di room
        broadcast(data.roomId, {
          type: 'message',
          roomId: data.roomId,
          sender: chatItem.sender,
          message: chatItem.message
        });
        return;
      }

      // Control Sync (Opsional)
      if (data.type === 'control_sync') {
        if (roomStates.has(data.roomId)) {
          roomStates.set(data.roomId, {
            currentTime: data.currentTime || 0,
            isPaused: typeof data.isPaused === 'boolean' ? data.isPaused : false,
            lastUpdated: Date.now()
          });

          broadcast(data.roomId, {
            type: 'stream_sync',
            currentTime: data.currentTime,
            isPaused: data.isPaused
          });
        }
      }
    } catch (e) {
      console.error('Error parsing message:', e);
    }
  });

  ws.on('close', () => {
    for (const roomId of ws.rooms) {
      leaveRoom(ws, roomId);
    }
  });
});

console.log('WebSocket Stream Sync Server + Chat History running');