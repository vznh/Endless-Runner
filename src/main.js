// main.js
let config = {
  type: Phaser.AUTO,
  width: 320,
  height: 240,
  pixelArt: true, // pixel-perfect rendering
  scene: [Menu, Play],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
};

let game = new Phaser.Game(config);
let keyRESET;
