// Play.js
class Play extends Phaser.Scene {
  constructor() {
    super("playScene");
  }

  create() {
    // Core variables
    this.gameOver = false;
    this.timeElapsed = 0;
    this.difficultyLevel = 1;
    this.spawnDelay = 2000;
    this.backgroundSpeed = 1;

    // Background
    this.background = this.add
      .tileSprite(0, 0, game.config.width, game.config.height, "background")
      .setOrigin(0, 0);

    // Simple dark borders
    let borderColor = 0x222222;
    let borderUISize = 16;
    this.add
      .rectangle(0, 0, game.config.width, borderUISize, borderColor)
      .setOrigin(0, 0);
    this.add
      .rectangle(
        0,
        game.config.height - borderUISize,
        game.config.width,
        borderUISize,
        borderColor,
      )
      .setOrigin(0, 0);
    this.add
      .rectangle(0, 0, borderUISize, game.config.height, borderColor)
      .setOrigin(0, 0);
    this.add
      .rectangle(
        game.config.width - borderUISize,
        0,
        borderUISize,
        game.config.height,
        borderColor,
      )
      .setOrigin(0, 0);

    // Score display
    let scoreConfig = {
      fontFamily: "'Press Start 2P', Courier",
      fontSize: "14px",
      backgroundColor: "#222",
      color: "#FFF",
      align: "center",
      padding: { top: 4, bottom: 4 },
      fixedWidth: 150,
    };
    this.scoreText = this.add.text(
      borderUISize + 4,
      borderUISize + 4,
      "Score: 0",
      scoreConfig,
    );

    // Runner
    this.runner = this.physics.add
      .sprite(50, game.config.height / 2, "runner")
      .setOrigin(0.5);
    this.runner.body.setSize(this.runner.width * 0.8, this.runner.height * 0.9);
    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("runner", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    this.runner.play("run");

    // Hazard group
    this.hazards = this.physics.add.group();

    // Spawn loop
    this.spawnHazardLoop();

    // Increase difficulty
    this.time.addEvent({
      delay: 5000,
      callback: this.increaseDifficulty,
      callbackScope: this,
      loop: true,
    });

    // Key
    keyRESET = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // Runner jump on pointer
    this.input.on("pointerdown", () => {
      if (!this.gameOver) {
        this.runner.setVelocityY(-200);
      }
    });

    // Collision detection
    this.physics.add.collider(
      this.runner,
      this.hazards,
      this.handleCollision,
      null,
      this,
    );

    // Score timer
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.updateScore,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    // Check restart
    if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyRESET)) {
      this.scene.restart();
    }
    if (this.gameOver) return;

    this.background.tilePositionX += this.backgroundSpeed;

    // boundaries
    if (this.runner.y < 16) {
      this.runner.y = 16;
      this.runner.setVelocityY(0);
    }
    if (this.runner.y > game.config.height - 16) {
      this.runner.y = game.config.height - 16;
      this.runner.setVelocityY(0);
    }

    // hazards
    this.hazards.getChildren().forEach((hazard) => {
      hazard.x -= hazard.moveSpeed;
      if (hazard.x < -hazard.width) {
        hazard.destroy();
      }
    });
  }

  spawnHazardLoop() {
    let randomDelay = Phaser.Math.Between(this.spawnDelay / 2, this.spawnDelay);
    this.time.addEvent({
      delay: randomDelay,
      callback: () => {
        this.spawnMultipleHazards();
        if (!this.gameOver) {
          this.spawnHazardLoop();
        }
      },
      callbackScope: this,
    });
  }

  spawnMultipleHazards() {
    let count = Phaser.Math.Between(1, 3);
    for (let i = 0; i < count; i++) {
      this.spawnHazard();
    }
  }

  spawnHazard() {
    let randomY = Phaser.Math.Between(32, game.config.height - 32);
    let hazard = new Hazard(this, game.config.width, randomY, "hazard");
    hazard.moveSpeed = Phaser.Math.Between(
      2 + this.difficultyLevel,
      6 + this.difficultyLevel,
    );
    this.hazards.add(hazard);
  }

  increaseDifficulty() {
    this.difficultyLevel++;
    this.spawnDelay = Math.max(200, this.spawnDelay - 200);
    this.backgroundSpeed += 0.5;
  }

  handleCollision() {
    this.gameOver = true;
    this.runner.setVelocityY(0);
    this.hazards.setVelocityX(0);
    this.physics.pause();
    this.timer.paused = true;

    let gameOverConfig = {
      fontFamily: "'Press Start 2P', Courier",
      fontSize: "16px",
      backgroundColor: "#F00",
      color: "#FFF",
      align: "center",
      padding: { top: 5, bottom: 5 },
    };
    this.add
      .text(
        game.config.width / 2,
        game.config.height / 2,
        "GAME OVER",
        gameOverConfig,
      )
      .setOrigin(0.5);
    this.add
      .text(
        game.config.width / 2,
        game.config.height / 2 + 32,
        "Press [R] to Restart",
        gameOverConfig,
      )
      .setOrigin(0.5);
  }

  updateScore() {
    if (!this.gameOver) {
      this.timeElapsed++;
      this.scoreText.setText("Score: " + this.timeElapsed);
    }
  }
}
