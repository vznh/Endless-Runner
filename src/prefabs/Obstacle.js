// Hazard.js
class Hazard extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setSize(this.width * 0.8, this.height * 0.8);
    this.moveSpeed = 3;
  }

  update() {
    this.x -= this.moveSpeed;
    if (this.x < -this.width) {
      this.destroy();
    }
  }
}
