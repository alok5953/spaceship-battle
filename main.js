// main.js
// Three.js spaceship scene with WASD and mouse controls, starry background, and lighting

import * as THREE from "https://unpkg.com/three@0.152.2/build/three.module.js?module";
import { GLTFLoader } from "https://unpkg.com/three@0.152.2/examples/jsm/loaders/GLTFLoader.js?module";

// --- GLTF LOADER SETUP ---
let shipGLB = null;
const shipGLBPath = "assets/Spaceship.glb";
const loader = new GLTFLoader();

function setShipModel(mesh, gltfRoot) {
  // Remove old children
  while (mesh.children.length) mesh.remove(mesh.children[0]);
  // Clone and rotate model so nose points +Z (Three.js forward)
  const model = gltfRoot.clone();
  // Rotate so nose points +Z (Three.js default forward)
  model.rotation.set(0, 0, 0); // reset
  model.position.set(0, 0, 0);
  model.scale.set(0.6, 0.6, 0.6);
  model.traverse((child) => {
    if (child.isMesh) {
      // Force replace material with a compatible one
      child.material = new THREE.MeshStandardMaterial();
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  mesh.add(model);
}

// Load main player's ship
loader.load(
  shipGLBPath,
  (gltf) => {
    shipGLB = gltf.scene;
    setShipModel(ship, shipGLB);
    ship.scale.set(0.6, 0.6, 0.6);
  },
  undefined,
  (e) => {
    console.error("GLB load error", e);
  }
);

// For other players
function setOtherPlayerShipModel(mesh) {
  if (!shipGLB) return;
  setShipModel(mesh, shipGLB);
  mesh.scale.set(0.6, 0.6, 0.6);
}

// Replace createPlayerShip to use GLB
function createPlayerShip(color) {
  // Base mesh
  const mesh = new THREE.Group();
  mesh.rotation.x = 0;
  mesh.userData.color = color;
  // Add GLB if loaded
  if (shipGLB) {
    setShipModel(mesh, shipGLB.clone());
    mesh.scale.set(0.6, 0.6, 0.6);
  }
  return mesh;
}

// When new GLB loads after other players already exist
function updateAllOtherPlayerModels() {
  Object.values(otherPlayers).forEach((p) => {
    setOtherPlayerShipModel(p.mesh);
  });
}

// Update other players' mesh when GLB loads
loader.load(
  shipGLBPath,
  (gltf) => {
    shipGLB = gltf.scene;
    setShipModel(ship, shipGLB.clone());
    ship.scale.set(1, 1, 1);
    updateAllOtherPlayerModels();
  },
  undefined,
  (e) => {
    console.error("GLB load error", e);
  }
);

// Scene setup
const scene = new THREE.Scene();

// Starry background
document.body.style.margin = 0;
document.body.style.overflow = "hidden";
const starGeometry = new THREE.BufferGeometry();
const starCount = 2000;
const starVertices = [];
for (let i = 0; i < starCount; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = (Math.random() - 0.5) * 2000;
  starVertices.push(x, y, z);
}
starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVertices, 3)
);
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);
camera.position.set(0, 2, 10);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

// Spaceship (simple geometry for now)
const ship = createPlayerShip(0x00ffcc);
scene.add(ship);

// --- SMOOTH FLIGHT CONTROLS (FOLLOW-THE-CURSOR + WASD) ---
let targetYaw = 0,
  targetPitch = 0;
let mouseX = 0,
  mouseY = 0;
const mouseSensitivity = 0.002;
const maxYawSpeed = 0.06; // radians/frame
const maxPitchSpeed = 0.06;

// Center reference for mouse
const centerX = () => window.innerWidth / 2;
const centerY = () => window.innerHeight / 2;

document.addEventListener("mousemove", (e) => {
  if (pointerLocked) {
    mouseX += e.movementX;
    mouseY += e.movementY;
    // Clamp for pitch (up/down)
    mouseY = Math.max(-centerY(), Math.min(centerY(), mouseY));
  }
});

function updateTargetOrientation() {
  // Map mouseX/Y to rotation deltas
  targetYaw = yaw - mouseX * mouseSensitivity;
  targetPitch = pitch - mouseY * mouseSensitivity;
  // Clamp pitch
  targetPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetPitch));
  // RESET mouse deltas so rotation only happens on new movement
  mouseX = 0;
  mouseY = 0;
}

// --- Crosshair ---
function createCrosshair() {
  let el = document.getElementById("crosshair");
  if (!el) {
    el = document.createElement("div");
    el.id = "crosshair";
    el.style.position = "fixed";
    el.style.left = "50%";
    el.style.top = "50%";
    el.style.transform = "translate(-50%, -50%)";
    el.style.width = "28px";
    el.style.height = "28px";
    el.style.border = "2px solid #fff";
    el.style.borderRadius = "50%";
    el.style.boxShadow = "0 0 10px #0ff";
    el.style.pointerEvents = "none";
    el.style.zIndex = "1002";
    document.body.appendChild(el);
  }
}
createCrosshair();

// --- ENEMY HUD MARKER ---
function highlightEnemiesInView() {
  // Remove old markers
  document.querySelectorAll(".enemy-marker").forEach((el) => el.remove());
  for (const id in otherPlayers) {
    const p = otherPlayers[id];
    if (!p.mesh.visible) continue;
    // Project to screen
    const pos = p.mesh.position.clone();
    pos.project(camera);
    const sx = (pos.x * 0.5 + 0.5) * window.innerWidth;
    const sy = (-pos.y * 0.5 + 0.5) * window.innerHeight;
    // Only if in front
    if (pos.z < 1 && pos.z > -1) {
      const marker = document.createElement("div");
      marker.className = "enemy-marker";
      marker.style.position = "fixed";
      marker.style.left = `${sx - 12}px`;
      marker.style.top = `${sy - 12}px`;
      marker.style.width = "24px";
      marker.style.height = "24px";
      marker.style.border = "2px solid #f00";
      marker.style.borderRadius = "50%";
      marker.style.pointerEvents = "none";
      marker.style.zIndex = "1002";
      marker.style.boxShadow = "0 0 10px #f00";
      document.body.appendChild(marker);
    }
  }
}

// --- AUTO-TARGET ASSIST (MAGNETISM) ---
function getClosestEnemyToCrosshair() {
  let minDist = 10000;
  let closest = null;
  let screenCenter = new THREE.Vector2(centerX(), centerY());
  for (const id in otherPlayers) {
    const p = otherPlayers[id];
    if (!p.mesh.visible) continue;
    const pos = p.mesh.position.clone();
    pos.project(camera);
    const sx = (pos.x * 0.5 + 0.5) * window.innerWidth;
    const sy = (-pos.y * 0.5 + 0.5) * window.innerHeight;
    const dist = Math.sqrt(
      (sx - screenCenter.x) ** 2 + (sy - screenCenter.y) ** 2
    );
    if (dist < minDist) {
      minDist = dist;
      closest = { player: p, screenDist: dist, sx, sy };
    }
  }
  return closest && closest.screenDist < 60 ? closest : null;
}

// --- PROJECTILE AUTO-AIM ---
function getAutoAimDirection(baseDir) {
  const closest = getClosestEnemyToCrosshair();
  if (!closest) return baseDir;
  // Vector from ship to enemy
  const toEnemy = closest.player.mesh.position
    .clone()
    .sub(ship.position)
    .normalize();
  // Interpolate direction (mild homing)
  return baseDir.clone().lerp(toEnemy, 0.18).normalize();
}

// --- REPLACE SHOOT FUNCTION FOR AUTO-AIM ---
function shootProjectileSync() {
  // Play laser sound
  const laserSound = new Audio('assets/456591_5052309-lq.mp3');
  laserSound.currentTime = 0;
  laserSound.play();

  // Laser spawns at ship's nose (front, +Z)
  const laser = new THREE.Mesh(projectileGeometry, projectileMaterial.clone());
  // Place at ship position + nose offset (forward +Z)
  const noseOffset = new THREE.Vector3(0, 0, 2.7); // 2.7 units ahead in +Z
  noseOffset.applyEuler(ship.rotation);
  laser.position.copy(ship.position).add(noseOffset);
  // Direction: +Z in local space, rotated by ship.rotation
  let direction = new THREE.Vector3(0, 0, 1);
  direction.applyEuler(ship.rotation);
  direction = getAutoAimDirection(direction);
  laser.rotation.copy(ship.rotation); // Align laser visually
  projectiles.push({
    mesh: laser,
    direction,
    spawnTime: performance.now(),
  });
  scene.add(laser);
  // Emit shoot event
  socket.emit("shoot", {
    position: { x: laser.position.x, y: laser.position.y, z: laser.position.z },
    rotation: { x: laser.rotation.x, y: laser.rotation.y, z: laser.rotation.z },
    direction: { x: direction.x, y: direction.y, z: direction.z },
  });
}

// Controls variables
const move = { forward: false, backward: false, left: false, right: false };
let yaw = 0,
  pitch = 0;
let pointerLocked = false;

// Pointer lock for mouse aiming
document.body.addEventListener("click", () => {
  renderer.domElement.requestPointerLock();
});
document.addEventListener("pointerlockchange", () => {
  pointerLocked = document.pointerLockElement === renderer.domElement;
});

document.addEventListener("keydown", (e) => {
  if (e.code === "KeyW" || e.code === "ArrowUp") move.forward = true;
  if (e.code === "KeyS" || e.code === "ArrowDown") move.backward = true;
  if (e.code === "KeyA" || e.code === "ArrowLeft") move.left = true;
  if (e.code === "KeyD" || e.code === "ArrowRight") move.right = true;
});
document.addEventListener("keyup", (e) => {
  if (e.code === "KeyW" || e.code === "ArrowUp") move.forward = false;
  if (e.code === "KeyS" || e.code === "ArrowDown") move.backward = false;
  if (e.code === "KeyA" || e.code === "ArrowLeft") move.left = false;
  if (e.code === "KeyD" || e.code === "ArrowRight") move.right = false;
});

// --- SOCKET.IO MULTIPLAYER ---
// @ts-ignore
const socket = window.io();

// Store other players: { id, mesh, color, lastState }
const otherPlayers = {};
const otherProjectiles = {};

// Add new player
function addOtherPlayer(player) {
  if (player.id === socket.id) return;
  if (otherPlayers[player.id]) return;
  const mesh = createPlayerShip(player.color);
  mesh.position.set(player.position.x, player.position.y, player.position.z);
  mesh.rotation.set(player.rotation.x, player.rotation.y, player.rotation.z);
  scene.add(mesh);
  otherPlayers[player.id] = {
    mesh,
    color: player.color,
    lastState: player,
    hp: 100,
  };
}

// Remove player
function removeOtherPlayer(id) {
  if (otherPlayers[id]) {
    scene.remove(otherPlayers[id].mesh);
    delete otherPlayers[id];
  }
}

// Handle initial players
socket.on("currentPlayers", (players) => {
  Object.values(players).forEach(addOtherPlayer);
});
// New player joined
socket.on("newPlayer", addOtherPlayer);
// Player moved
socket.on("playerMoved", (data) => {
  if (otherPlayers[data.id]) {
    const mesh = otherPlayers[data.id].mesh;
    mesh.position.set(data.position.x, data.position.y, data.position.z);
    mesh.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
    otherPlayers[data.id].lastState = data;
  }
});
// Player left
socket.on("playerDisconnected", removeOtherPlayer);

// --- SYNC SHOOTING ---
socket.on("playerShot", (data) => {
  if (data.id === socket.id) return;
  // Create projectile for remote player
  const laser = new THREE.Mesh(
    projectileGeometry,
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  laser.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
  laser.position.set(data.position.x, data.position.y, data.position.z);
  const direction = new THREE.Vector3(
    data.direction.x,
    data.direction.y,
    data.direction.z
  );
  direction.normalize();
  otherProjectiles.push({
    mesh: laser,
    direction,
    spawnTime: Date.now(),
  });
  scene.add(laser);
});

// --- SEND LOCAL STATE ---
function sendState() {
  socket.emit("updateState", {
    position: { x: ship.position.x, y: ship.position.y, z: ship.position.z },
    rotation: { x: ship.rotation.x, y: ship.rotation.y, z: ship.rotation.z },
  });
}
setInterval(sendState, 50); // 20Hz update

// --- SHOOTING: override shootProjectile to sync ---
const projectileSpeed = 2.5;
const projectileLifetime = 3000; // ms
const projectileGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2, 8);
const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0xff2222 });
const projectiles = [];

// Fire on left mouse click (but not when pointer lock is requested)
document.addEventListener("mousedown", (e) => {
  if (pointerLocked && e.button === 0) {
    shootProjectileSync();
  }
});

// --- HEALTH SYSTEM ---
let hp = 100;
let alive = true;
let respawnTimeout = null;

function showHP() {
  let el = document.getElementById("hpbar");
  if (!el) {
    el = document.createElement("div");
    el.id = "hpbar";
    el.style.position = "fixed";
    el.style.bottom = "20px";
    el.style.left = "20px";
    el.style.background = "rgba(0,0,0,0.7)";
    el.style.color = "lime";
    el.style.padding = "8px 20px";
    el.style.font = "bold 22px monospace";
    el.style.borderRadius = "8px";
    el.style.zIndex = "1000";
    document.body.appendChild(el);
  }
  el.textContent = `HP: ${alive ? hp : 0}`;
  el.style.display = alive ? "block" : "none";
}
showHP();

// Listen for hit and death events
socket.on("playerHit", (data) => {
  if (data.id === socket.id) {
    hp = data.hp;
    showHP();
  } else if (otherPlayers[data.id]) {
    otherPlayers[data.id].hp = data.hp;
  }
});
socket.on("playerDied", (data) => {
  if (data.id === socket.id) {
    // Play ship destroyed sound
    const destroyedSound = new Audio('assets/19105_60285-lq.mp3');
    destroyedSound.currentTime = 0;
    destroyedSound.play();
    alive = false;
    hp = 0;
    showHP();
    ship.visible = false;
    // Disable controls while dead
    move.forward = move.backward = move.left = move.right = false;
    // Optionally, respawn after a delay
    if (respawnTimeout) clearTimeout(respawnTimeout);
    respawnTimeout = setTimeout(() => {
      socket.emit("respawn");
    }, 2500);
  } else if (otherPlayers[data.id]) {
    otherPlayers[data.id].mesh.visible = false;
  }
});
socket.on("playerRespawn", (data) => {
  if (data.id === socket.id) {
    alive = true;
    hp = 100;
    ship.position.set(data.position.x, data.position.y, data.position.z);
    showHP();
    ship.visible = true;
  } else if (otherPlayers[data.id]) {
    otherPlayers[data.id].mesh.position.set(
      data.position.x,
      data.position.y,
      data.position.z
    );
    otherPlayers[data.id].mesh.visible = true;
  }
});

// --- SCOREBOARD ---
let scoreboardData = [];
function renderScoreboard() {
  let el = document.getElementById("scoreboard");
  if (!el) {
    el = document.createElement("div");
    el.id = "scoreboard";
    el.style.position = "fixed";
    el.style.top = "20px";
    el.style.right = "20px";
    el.style.background = "rgba(0,0,0,0.8)";
    el.style.color = "white";
    el.style.padding = "14px 24px";
    el.style.font = "16px monospace";
    el.style.borderRadius = "8px";
    el.style.zIndex = "1001";
    el.style.minWidth = "260px";
    el.style.maxHeight = "60vh";
    el.style.overflowY = "auto";
    document.body.appendChild(el);
  }
  let html =
    '<b style="font-size:18px">SCOREBOARD</b><br><table style="width:100%;margin-top:6px;font-size:15px"><tr><th style="text-align:left">Name</th><th>K</th><th>D</th></tr>';
  scoreboardData.sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
  for (const p of scoreboardData) {
    const you = p.id === socket.id ? " (You)" : "";
    html += `<tr><td style="color:${p.color};font-weight:bold">${p.username}${you}</td><td>${p.kills}</td><td>${p.deaths}</td></tr>`;
  }
  html += "</table>";
  el.innerHTML = html;
}
socket.on("scoreboard", (data) => {
  scoreboardData = data;
  renderScoreboard();
});
renderScoreboard();

// --- FLIGHT CONTROL ANIMATION LOOP REPLACEMENT ---
function updateShipModelRotation() {
  if (ship.children[0]) {
    ship.children[0].rotation.set(0, 0, 0); // model nose +Z
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (alive) {
    updateTargetOrientation();
    const closest = getClosestEnemyToCrosshair();
    let yawAssist = 0,
      pitchAssist = 0;
    let turnRateFactor = 1;
    if (closest) {
      const toEnemy = closest.player.mesh.position
        .clone()
        .sub(ship.position)
        .normalize();
      const shipDir = new THREE.Vector3(0, 0, 1).applyEuler(ship.rotation);
      const cross = new THREE.Vector3().crossVectors(shipDir, toEnemy);
      yawAssist = cross.y * 0.12;
      pitchAssist = cross.x * 0.12;
      turnRateFactor = 0.55;
    }
    const yawDelta = (targetYaw + yawAssist - yaw) * turnRateFactor;
    const pitchDelta = (targetPitch + pitchAssist - pitch) * turnRateFactor;
    yaw += Math.max(-maxYawSpeed, Math.min(maxYawSpeed, yawDelta));
    pitch += Math.max(-maxPitchSpeed, Math.min(maxPitchSpeed, pitchDelta));
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
    // --- SPEED BOOST: Increase thrust when forward key is pressed ---
    // Default thrust values
    let thrust = move.forward ? 0.28 : move.backward ? -0.13 : 0;
    // Speed boost when forward (W or ArrowUp) is pressed
    if (move.forward) {
      thrust = 0.55; // Double the normal forward speed
    }
    const strafe = move.left ? -0.16 : move.right ? 0.16 : 0;
    const forward = new THREE.Vector3(0, 0, 1)
      .applyEuler(ship.rotation)
      .normalize();
    const right = new THREE.Vector3(1, 0, 0)
      .applyEuler(ship.rotation)
      .normalize();
    if (alive) {
      ship.position.addScaledVector(forward, thrust);
      ship.position.addScaledVector(right, strafe);
    }
    // Set ship.rotation and ensure model stays aligned
    ship.rotation.set(pitch, yaw, 0, "ZYX");
    updateShipModelRotation();
    camera.position.x = ship.position.x - 10 * Math.sin(yaw);
    camera.position.y = ship.position.y + 4;
    camera.position.z = ship.position.z - 10 * Math.cos(yaw);
    camera.lookAt(ship.position);
  }
  // --- Update projectiles (local) ---
  const now = performance.now();
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.mesh.position.addScaledVector(p.direction, projectileSpeed);
    if (now - p.spawnTime > projectileLifetime) {
      scene.remove(p.mesh);
      projectiles.splice(i, 1);
    }
  }
  // --- Update other players' projectiles ---
  const now2 = Date.now();
  for (let i = otherProjectiles.length - 1; i >= 0; i--) {
    const p = otherProjectiles[i];
    p.mesh.position.addScaledVector(p.direction, projectileSpeed);
    if (now2 - p.spawnTime > projectileLifetime) {
      scene.remove(p.mesh);
      otherProjectiles.splice(i, 1);
    }
  }
  checkProjectileHitSelf();
  highlightEnemiesInView();
  renderer.render(scene, camera);
}

// --- Collision detection for local (self) ---
function checkProjectileHitSelf() {
  if (!alive) return;
  for (let i = otherProjectiles.length - 1; i >= 0; i--) {
    const p = otherProjectiles[i];
    const dx = p.mesh.position.x - ship.position.x;
    const dy = p.mesh.position.y - ship.position.y;
    const dz = p.mesh.position.z - ship.position.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < 2.2) {
      // Remove projectile
      scene.remove(p.mesh);
      otherProjectiles.splice(i, 1);
      // HP/hit will be handled by server via playerHit event
      break;
    }
  }
}

// --- Listen for player name from start screen ---
let playerName = window.localStorage.getItem("playerName") || "";
window.addEventListener("playerNameEntered", (e) => {
  playerName = e.detail;
  if (socket && socket.connected) {
    socket.emit("setUsername", playerName);
  }
  showPlayerNameHUD(playerName);
});

// Show player name on HUD (top left)
function showPlayerNameHUD(name) {
  let el = document.getElementById("playerNameHUD");
  if (!el) {
    el = document.createElement("div");
    el.id = "playerNameHUD";
    el.style.position = "fixed";
    el.style.top = "20px";
    el.style.left = "20px";
    el.style.background = "rgba(0,0,0,0.7)";
    el.style.color = "cyan";
    el.style.padding = "8px 20px";
    el.style.font = "bold 20px monospace";
    el.style.borderRadius = "8px";
    el.style.zIndex = "1000";
    document.body.appendChild(el);
  }
  el.textContent = `Pilot: ${name}`;
  el.style.display = name ? "block" : "none";
}

// Show name if already set on load
if (playerName && typeof socket !== "undefined" && socket.connected) {
  socket.emit("setUsername", playerName);
  showPlayerNameHUD(playerName);
} else if (typeof socket !== "undefined") {
  socket.on("connect", () => {
    if (playerName) {
      socket.emit("setUsername", playerName);
      showPlayerNameHUD(playerName);
    }
  });
}

showHP();
animate();

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
