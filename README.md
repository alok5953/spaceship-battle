# City Builder (Multiplayer 3D Space Shooter)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)](https://nodejs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r152-blue.svg)](https://threejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4-black.svg)](https://socket.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

> A real-time multiplayer 3D space combat game where players battle in a visually stunning environment. Built with Three.js, WebGL, Node.js, and Socket.IO.

[Play Demo](http://localhost:3000) | [Report Bug](https://github.com/alok5953/city-builder/issues) | [Request Feature](https://github.com/alok5953/city-builder/issues)

![Space Shooter Screenshot](assets/Screenshot%202025-05-06%20at%203.28.17%20PM.png)

## Features
- **3D Spaceship Controls:** WASD to move, mouse to aim, smooth flight physics.
- **Multiplayer:** Real-time battles with other players using WebSockets.
- **GLTF Model Support:** Detailed spaceship models loaded via GLTF.
- **Starfield Background:** Procedurally generated 3D starfield.
- **Laser Firing:** Click to shoot, with synchronized projectiles and sound effects.
- **Health and Respawn:** Ships have HP, can be destroyed, and respawn after a delay.
- **Sound Effects:** Audio feedback for shooting and ship destruction.
- **Scoreboard:** Track kills and deaths in real-time.

## Open Source Contribution Invitation

This project is open source and welcomes contributions from the community! I've started building this game but don't have enough time to complete all planned features. If you're a Three.js developer or interested in browser-based multiplayer games, this is a perfect opportunity to get involved.

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Implement your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Ideas for Contributions
- Add more spaceship models and customization options
- Implement power-ups and special weapons
- Create different game modes (e.g., team battles, capture the flag)
- Improve physics and flight controls
- Add mobile device support with touch controls
- Enhance visual effects (explosions, shield effects, etc.)
- Add game sound tracks and more sound effects
- Implement matchmaking and game lobbies

All skill levels are welcome to contribute!

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

## Technology Stack

- **Frontend:** Three.js, WebGL, HTML5, JavaScript
- **Backend:** Node.js, Express
- **Real-time Communication:** Socket.IO
- **3D Models:** GLTF/GLB format
- **Build Tools:** npm

## Roadmap

See the [open issues](https://github.com/alok5953/city-builder/issues) for a list of proposed features and known issues.

## Assets
- Spaceship models (`.glb`) and sound effects (`.mp3`) are included in the `assets/` folder.

## Deployment
This project is designed to be run locally. For public deployment, you may need to adjust server settings and asset paths.

## License
This project is for educational/demo purposes. Please check individual asset licenses before redistribution.

## Keywords

spaceship game, three.js game, webgl, space shooter, multiplayer game, socket.io game, browser game, 3d game, dogfight simulator, node.js game server, javascript game, open source game, web based multiplayer, real-time multiplayer

---

Enjoy building and battling in space! 🚀
