// Menu.js
class Menu extends Phaser.Scene {
  constructor() {
    super("menuScene");
  }

  preload() {
    this.load.image("background", "./assets/city_background.png");
    this.load.spritesheet("runner", "./assets/runner.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    this.add.image(160, 120, "background");

    let menuConfig = {
      fontFamily: "'Press Start 2P', Courier",
      fontSize: "16px",
      backgroundColor: "#222",
      color: "#0F0",
      align: "center",
      padding: { top: 5, bottom: 5 },
    };

    this.add.text(160, 80, "DARK PIXEL RUNNER", menuConfig).setOrigin(0.5);
    menuConfig.color = "#FFF";
    this.add.text(160, 140, "CLICK TO START", menuConfig).setOrigin(0.5);

    // Add an interactive transparent area to detect clicks
    let startArea = this.add.rectangle(160, 120, 320, 240, 0x000000, 0);
    startArea.setInteractive();

    // Register click event
    startArea.on("pointerdown", () => {
      this.scene.start("playScene");
      console.log("Play scene clicked.");
    });

    // Debugging: Console message to check if scene is ready
    console.log("Menu loaded, waiting for click...");
  }
}
