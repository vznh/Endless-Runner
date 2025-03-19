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
    this.backgroundSpeed = 2;  // This might be too slow, let's increase it
    this.lastObstacleX = 0;
    this.obstacleSpacing = 400; // Space between obstacles
    this.lastJumpTime = 0;  // Track last jump time for double jump
    this.doubleJumpWindow = 300;  // Window for double jump in milliseconds
    this.normalJumpForce = -400;  // Normal jump velocity
    this.doubleJumpForce = -600;  // Higher jump velocity for double tap
    this.powerupActive = false;
    this.powerupTimer = null;

    // Background
    this.background = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'background')
      .setOrigin(0, 0);
    this.background.setScale(0.5);
    this.background.setDepth(-1);

    // Platform
    this.platform = this.add.rectangle(0, game.config.height - 40, game.config.width, 40, 0x808080);
    this.platform.setOrigin(0, 0);
    this.platform.setDepth(0);

    // Make platform static for physics
    this.platformBody = this.physics.add.existing(this.platform, true);

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

    // Instructions text
    let instructionsConfig = {
      fontFamily: "'Press Start 2P', Courier",
      fontSize: "12px",
      backgroundColor: "#222",
      color: "#FFF",
      align: "center",
      padding: { top: 4, bottom: 4 },
      fixedWidth: 250,
    };
    this.instructionsText = this.add.text(
      game.config.width / 2,
      borderUISize + 4,
      "Double tap/space to jump higher!",
      instructionsConfig,
    ).setOrigin(0.5, 0);

    // Menu return text
    let menuConfig = {
      fontFamily: "'Press Start 2P', Courier",
      fontSize: "12px",
      backgroundColor: "#222",
      color: "#FFF",
      align: "right",
      padding: { top: 4, bottom: 4 },
      fixedWidth: 200,
    };
    this.menuText = this.add.text(
      game.config.width - borderUISize - 4,
      game.config.height - borderUISize - 20,
      "Press ESC to return to menu",
      menuConfig,
    ).setOrigin(1, 1);

    // Runner
    this.runner = this.physics.add
      .sprite(50, game.config.height - 60, "runner")
      .setOrigin(0.5);
    this.runner.setScale(0.1);
    this.runner.body.setSize(this.runner.width * 0.8, this.runner.height * 0.9);
    this.runner.body.setBounce(0);
    this.runner.body.setCollideWorldBounds(true);
    this.runner.body.setGravityY(300); // Add gravity only to the runner

    // Obstacle group
    this.obstacles = this.physics.add.group();

    // Power-up group
    this.powerups = this.physics.add.group();

    // Initial obstacle placement
    this.placeInitialObstacles();

    // Initial power-up
    this.placePowerup();

    // Increase difficulty
    this.time.addEvent({
      delay: 5000,
      callback: this.increaseDifficulty,
      callbackScope: this,
      loop: true,
    });

    // Keys
    keyRESET = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Runner jump on pointer or space
    this.input.on("pointerdown", () => {
      if (!this.gameOver) {
        const currentTime = this.time.now;
        if (currentTime - this.lastJumpTime < this.doubleJumpWindow) {
          // Double tap detected - jump higher
          this.runner.setVelocityY(this.doubleJumpForce);
        } else {
          // Single tap - normal jump
          this.runner.setVelocityY(this.normalJumpForce);
        }
        this.lastJumpTime = currentTime;
        // Play jump sound
        this.sound.play('jump');
      }
    });

    // Collision detection
    this.physics.add.collider(
      this.runner,
      this.obstacles,
      this.handleCollision,
      null,
      this,
    );
    this.physics.add.collider(
      this.runner,
      this.platform,
      this.handlePlatformCollision,
      null,
      this,
    );
    
    // Power-up collection
    this.physics.add.overlap(
      this.runner,
      this.powerups,
      this.collectPowerup,
      null,
      this
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
    
    // Check ESC key
    if (Phaser.Input.Keyboard.JustDown(keyESC)) {
      this.sound.stopAll();  // Stop all audio before transitioning
      this.scene.start('menuScene');
    }

    // Check for space key jump
    if (!this.gameOver && Phaser.Input.Keyboard.JustDown(keySPACE)) {
      const currentTime = this.time.now;
      if (currentTime - this.lastJumpTime < this.doubleJumpWindow) {
        // Double tap detected - jump higher
        this.runner.setVelocityY(this.doubleJumpForce);
      } else {
        // Single tap - normal jump
        this.runner.setVelocityY(this.normalJumpForce);
      }
      this.lastJumpTime = currentTime;
      // Play jump sound
      this.sound.play('jump');
    }

    if (this.gameOver) return;

    // Update background scroll - increase the speed for more noticeable movement
    this.background.tilePositionX += 4;  // Increased from backgroundSpeed to a fixed value of 4
    console.log('Background position:', this.background.tilePositionX); // Debug log

    // boundaries
    if (this.runner.y < 16) {
      this.runner.y = 16;
      this.runner.setVelocityY(0);
    }
    if (this.runner.y > game.config.height - 60) {
      this.runner.y = game.config.height - 60;
      this.runner.setVelocityY(0);
    }

    // Move obstacles with background
    this.obstacles.getChildren().forEach((obstacle) => {
      obstacle.x -= this.backgroundSpeed;
      if (obstacle.x < -obstacle.width) {
        obstacle.destroy();
      }
    });

    // Move power-ups with background
    this.powerups.getChildren().forEach((powerup) => {
      powerup.x -= this.backgroundSpeed;
      if (powerup.x < -powerup.width) {
        powerup.destroy();
        this.placePowerup(); // Place a new power-up when old one goes off screen
      }
    });

    // Check if we need to place more obstacles
    this.checkAndPlaceObstacles();
  }

  placeInitialObstacles() {
    // Place initial obstacles beyond the player's starting position
    for (let i = 0; i < 10; i++) {
      this.placeObstacle(400 + (i * this.obstacleSpacing));
    }
    this.lastObstacleX = 400 + (9 * this.obstacleSpacing);
  }

  checkAndPlaceObstacles() {
    // Get the rightmost visible position
    const rightmostVisible = this.cameras.main.scrollX + this.cameras.main.width;
    
    // If we're close to the last obstacle, place more
    if (rightmostVisible > this.lastObstacleX - 400) {
      this.placeObstacle(this.lastObstacleX + this.obstacleSpacing);
      this.lastObstacleX += this.obstacleSpacing;
    }
  }

  placeObstacle(x) {
    let obstacle = new Obstacle(this, x, game.config.height - 60, "hazard");
    obstacle.setScale(0.026); // Increased from 0.02 to 0.026 (1.3x larger)
    obstacle.body.setImmovable(true);
    obstacle.body.allowGravity = false;
    this.obstacles.add(obstacle);
  }

  placePowerup() {
    // Place power-up at a random height between platform and top of screen
    const minY = 50;
    const maxY = game.config.height - 100;
    const y = Phaser.Math.Between(minY, maxY);
    
    // Place power-up far ahead of the player
    const x = this.lastObstacleX + Phaser.Math.Between(200, 400);
    
    let powerup = this.physics.add.sprite(x, y, 'powerup');
    powerup.setScale(0.1); // Adjust scale as needed
    powerup.body.setAllowGravity(false);
    powerup.body.setImmovable(true);
    this.powerups.add(powerup);
  }

  collectPowerup(runner, powerup) {
    // Play power-up sound
    this.sound.play('powerup');
    
    // Remove the power-up sprite
    powerup.destroy();
    
    // Activate hover mode
    this.powerupActive = true;
    runner.body.setAllowGravity(false);
    runner.setVelocityY(0);
    
    // Clear existing timer if there is one
    if (this.powerupTimer) {
      this.powerupTimer.remove();
    }
    
    // Set timer for power-up duration
    this.powerupTimer = this.time.delayedCall(7000, () => {
      this.powerupActive = false;
      runner.body.setAllowGravity(true);
      this.placePowerup(); // Place a new power-up when effect ends
    }, null, this);
  }

  increaseDifficulty() {
    this.difficultyLevel++;
    this.backgroundSpeed += 0.5;
  }

  handleCollision() {
    this.gameOver = true;
    this.runner.setVelocityY(0);
    this.physics.pause();
    this.timer.paused = true;
    
    // Clear power-up timer if it exists
    if (this.powerupTimer) {
      this.powerupTimer.remove();
    }

    // Play death sound
    this.sound.play('death');

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

  handlePlatformCollision() {
    // Only stop vertical movement if power-up is not active
    if (!this.powerupActive) {
      this.runner.setVelocityY(0);
    }
  }

  updateScore() {
    if (!this.gameOver) {
      this.timeElapsed++;
      this.scoreText.setText("Score: " + this.timeElapsed);
    }
  }
}
