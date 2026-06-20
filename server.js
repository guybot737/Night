const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Aktif yayınlar listesi
let activeStreams = {};
let onlineUsers = 0;

// Socket.IO - Gerçek Zamanlı İletişim
io.on('connection', (socket) => {
    console.log('Kullanıcı bağlandı:', socket.id);
    onlineUsers++;
    io.emit('users-online', onlineUsers);

    // Yayın Başlat
    socket.on('start-stream', (streamData) => {
        activeStreams[socket.id] = {
            streamerId: socket.id,
            title: streamData.title,
            category: streamData.category,
            viewers: 0,
            startTime: new Date()
        };
        io.emit('stream-started', activeStreams[socket.id]);
        console.log('Yayın başladı:', streamData.title);
    });

    // Yayın Bitir
    socket.on('stop-stream', () => {
        delete activeStreams[socket.id];
        io.emit('stream-stopped', socket.id);
        console.log('Yayın bitti');
    });

    // Kullanıcı Ayrıldı
    socket.on('disconnect', () => {
        onlineUsers--;
        delete activeStreams[socket.id];
        io.emit('users-online', onlineUsers);
        io.emit('stream-stopped', socket.id);
        console.log('Kullanıcı ayrıldı');
    });
});

// API Endpoint - Aktif Yayınları Getir
app.get('/api/streams', (req, res) => {
    res.json(Object.values(activeStreams));
});

// Sunucuyu Başlat
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
});
