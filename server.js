// server.js
// Simple multiplayer server for spaceship demo using Node.js and Socket.io

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Serve static files (client)
app.use(express.static(__dirname));

// Track players: { [id]: { position, rotation, color, hp, kills, deaths, username, alive } }
const players = {};

function randomSpawn() {
    return {
        x: (Math.random() - 0.5) * 100,
        y: 0,
        z: (Math.random() - 0.5) * 100
    };
}

let userCount = 1;
function randomUsername() {
    return `Player${userCount++}`;
}

// Track projectiles: { id, ownerId, position, direction, spawnTime }
let projectiles = [];

io.on('connection', (socket) => {
    // Assign a random color, spawn, and username to each new player
    const color = `hsl(${Math.floor(Math.random()*360)},80%,60%)`;
    const username = randomUsername();
    players[socket.id] = {
        position: randomSpawn(),
        rotation: { x: 0, y: 0, z: 0 },
        color,
        id: socket.id,
        hp: 100,
        alive: true,
        kills: 0,
        deaths: 0,
        username,
    };
    // Send current players to the new player
    socket.emit('currentPlayers', players);
    // Notify others of new player
    socket.broadcast.emit('newPlayer', players[socket.id]);
    io.emit('scoreboard', getScoreboard());

    // Receive state updates
    socket.on('updateState', (data) => {
        if (players[socket.id] && players[socket.id].alive) {
            players[socket.id].position = data.position;
            players[socket.id].rotation = data.rotation;
        }
        // Broadcast to others
        socket.broadcast.emit('playerMoved', {
            id: socket.id,
            position: data.position,
            rotation: data.rotation,
        });
    });

    // Receive shooting event
    socket.on('shoot', (data) => {
        if (!players[socket.id] || !players[socket.id].alive) return;
        // Check collision with other players
        Object.entries(players).forEach(([pid, p]) => {
            if (pid === socket.id || !p.alive) return;
            // Simple sphere collision (ship radius ~1.5)
            const dx = p.position.x - data.position.x;
            const dy = p.position.y - data.position.y;
            const dz = p.position.z - data.position.z;
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            if (dist < 2.2) {
                p.hp -= 34;
                if (p.hp <= 0) {
                    p.alive = false;
                    p.deaths++;
                    players[socket.id].kills++;
                    io.emit('playerDied', { id: pid });
                    io.emit('scoreboard', getScoreboard());
                    setTimeout(() => {
                        p.position = randomSpawn();
                        p.hp = 100;
                        p.alive = true;
                        io.emit('playerRespawn', { id: pid, position: p.position });
                    }, 3000);
                } else {
                    io.emit('playerHit', { id: pid, hp: p.hp });
                }
            }
        });
        // Broadcast to all (including self for consistency)
        io.emit('playerShot', {
            id: socket.id,
            position: data.position,
            rotation: data.rotation,
            direction: data.direction,
            timestamp: Date.now(),
        });
    });

    // Listen for username set by client
    socket.on('setUsername', (name) => {
        if (players[socket.id]) {
            players[socket.id].username = String(name).slice(0, 16) || randomUsername();
            io.emit('scoreboard', getScoreboard());
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
        io.emit('scoreboard', getScoreboard());
    });
});

function getScoreboard() {
    return Object.values(players).map(p => ({
        id: p.id,
        username: p.username,
        kills: p.kills,
        deaths: p.deaths,
        color: p.color,
    }));
}

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
