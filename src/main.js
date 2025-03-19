// main.js
let config = {
  type: Phaser.AUTO,
  width: 320,
  height: 240,
  pixelArt: true, // pixel-perfect rendering
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
};

// Preload assets
let preload = {
  preload: function() {
    // Load game assets
    this.load.image('background', 'assets/bg.png');
    this.load.image('runner', 'assets/runner.png');
    this.load.image('hazard', 'assets/hazard.png');
    this.load.image('powerup', 'assets/powerup.png');
    
    // Load audio assets
    this.load.audio('bgm', 'assets/bgm.mp3');
    this.load.audio('death', 'assets/death.mp3');
    this.load.audio('jump', 'assets/jump.mp3');
    this.load.audio('powerup', 'assets/powerup.mp3');
    
    // Debug log
    console.log('Preload scene: Assets loaded');
  },
  create: function() {
    // Debug log
    console.log('Preload scene: Starting menu scene');
    this.scene.start('menuScene');
  }
};

// Add scenes to config
config.scene = [preload, Menu, Play];

let game = new Phaser.Game(config);
let keyRESET, keyESC, keySPACE;
