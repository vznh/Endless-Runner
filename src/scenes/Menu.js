// Menu.js
class Menu extends Phaser.Scene {
  constructor() {
    super("menuScene");
  }

  preload() {
    // Debug log
    console.log('Menu scene: Starting preload');
    
    // Load background image
    this.load.image("background", "assets/bg.png");
    
    // Debug log
    console.log('Menu scene: Assets loaded');
  }

  create() {
    // Debug log
    console.log('Menu scene: Starting create');
    
    // Stop any existing audio and start background music
    this.sound.stopAll();
    this.bgm = this.sound.add('bgm', { 
      volume: 0.5,
      loop: true 
    });
    this.bgm.play();
    
    // Add background
    this.add.image(160, 120, "background");

    let menuConfig = {
      fontFamily: "'Press Start 2P', Courier",
      fontSize: "16px",
      backgroundColor: "#222",
      color: "#0F0",
      align: "center",
      padding: { top: 5, bottom: 5 },
    };

    // Add title text
    this.add.text(160, 80, "Shadow Runner", menuConfig).setOrigin(0.5);
    
    // Add start instruction
    menuConfig.color = "#FFF";
    this.add.text(160, 140, "START", menuConfig).setOrigin(0.5);

    // Add credits text
    menuConfig.fontSize = "12px";
    menuConfig.color = "#888";
    let creditsText = this.add.text(160, 180, "[C] Credits", menuConfig).setOrigin(0.5);
    creditsText.setInteractive();

    // Credits popup configuration
    let creditsPopupConfig = {
      fontFamily: "'Press Start 2P', Courier",
      fontSize: "12px",
      backgroundColor: "#000",
      color: "#FFF",
      align: "center",
      padding: { top: 10, bottom: 10 },
      fixedWidth: 200
    };

    // Create credits popup (initially hidden)
    this.creditsPopup = this.add.text(160, 120, "All assets are stock.", creditsPopupConfig)
      .setOrigin(0.5)
      .setVisible(false);

    // Add click handler for credits
    creditsText.on('pointerdown', () => {
      this.toggleCredits();
    });

    // Add key for credits
    this.keyC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.input.keyboard.on('keydown-C', () => {
      this.toggleCredits();
    });

    // Add an interactive transparent area to detect clicks
    let startArea = this.add.rectangle(160, 120, 320, 240, 0x000000, 0);
    startArea.setInteractive();
    startArea.setDepth(-1);  // Put it behind everything

    // Register click event
    startArea.on("pointerdown", () => {
      if (!this.creditsPopup.visible) {  // Only start game if credits aren't showing
        console.log("Menu: Click detected, starting play scene");
        this.sound.stopAll();  // Stop music before transitioning to play scene
        this.scene.start("playScene");
      }
    });

    // Debug log
    console.log('Menu scene: Created successfully');
  }

  toggleCredits() {
    this.creditsPopup.setVisible(!this.creditsPopup.visible);
  }
}
