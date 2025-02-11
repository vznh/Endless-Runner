// Runner.js
class Runner extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setSize(this.width * 0.8, this.height * 0.9);
    this.setOffset(this.width * 0.1, this.height * 0.1);

    // Optional runner properties
    this.runSpeed = 100;
    this.jumpSpeed = 200;
  }
}
