# City Builder (Multiplayer 3D Space Shooter)

A browser-based multiplayer 3D spaceship game built with Three.js, Node.js, and Socket.IO. Fly your ship, shoot lasers, battle other players in real-time, and enjoy immersive sound and visuals!

## Features
- **3D Spaceship Controls:** WASD to move, mouse to aim, smooth flight physics.
- **Multiplayer:** Real-time battles with other players using WebSockets.
- **GLTF Model Support:** Detailed spaceship models loaded via GLTF.
- **Starfield Background:** Procedurally generated 3D starfield.
- **Laser Firing:** Click to shoot, with synchronized projectiles and sound effects.
- **Health and Respawn:** Ships have HP, can be destroyed, and respawn after a delay.
- **Sound Effects:** Audio feedback for shooting and ship destruction.
- **Scoreboard:** Track kills and deaths in real-time.

## Getting Started

### Prerequisites
- Node.js (v16 or later recommended)
- npm

### Installation
```bash
npm install
```

### Running the Game
```bash
npm start
```
Then, open your browser and go to [http://localhost:3000](http://localhost:3000)

### Controls
- **WASD / Arrow Keys:** Move your ship
- **Mouse:** Aim
- **Left Click:** Fire laser

## Project Structure
- `main.js` — Client-side game logic (Three.js, controls, rendering)
- `server.js` — Node.js server (Socket.IO, game state, collision, multiplayer)
- `assets/` — 3D models (GLB), sound effects (mp3)
- `index.html` — Main HTML file

## Assets
- Spaceship models (`.glb`) and sound effects (`.mp3`) are included in the `assets/` folder.

## Deployment
This project is designed to be run locally. For public deployment, you may need to adjust server settings and asset paths.

## License
This project is for educational/demo purposes. Please check individual asset licenses before redistribution.

---

Enjoy building and battling in space! 🚀
