let height1 = 500;
let evo;
//let cnv;
let world;

function setup() {
  cnv = createCanvas(500, 700);
  evo = new Evolution();
  while (true) {
    evo.nextGeneration();
    if (evo.population[0].fitness == 50000 || evo.data.length > 19) {
      break;
    }
  }
  world = new Game();
}


function draw() {
  background(200);
  let chance = evo.population[0].nn.evaluate(world.poleX - (world.birdX + world.square), (world.poleY + world.gap) - (world.birdY + world.square), world.birdY - world.poleY);
  if (0.5 < chance ? world.flap() : null);
  world.show();
  world.update();
  evo.population[0].nn.show(25, 525, 450, 150);
  line(0, 500, width, 500);
}



class Game {
  constructor() {
    //Game
    this.speed = 5;
    this.roof = 0;
    this.hard = 0;
    //Bird
    this.birdX = 50;
    this.birdY = 50;
    this.square = 10;
    this.score = 0;
    this.gravity = 0.5;
    this.strength = 10;
    this.vel = 0;
    //Pole
    this.gap = 130;
    this.indent = 10;
    this.thickness = 70;
    this.poleX = 300;
    this.poleY = 0;
    this.newPole();
  }

  show() {
    push();
    rect(this.birdX, this.birdY, this.square, this.square);
    if (world.checkDead()) {
      fill(200, 0, 100);
    }
    rect(this.poleX, -1, this.thickness, this.poleY + 1);
    rect(this.poleX, this.poleY + this.gap, this.thickness, height1 - (this.poleY + this.gap));
    pop();
  }

  newPole() {
    this.poleY = this.indent + floor(random() * (height1 - 2 * this.indent - this.gap));
  }

  flap() {
    this.vel = -this.strength;
  }

  update() {
    //Bird
    this.vel += this.gravity;
    this.birdY += this.vel;
    //Pole
    this.poleX -= this.speed;
    this.score += this.speed;
    if (this.poleX + this.thickness < this.birdX) {
      this.poleX += 400;
      this.newPole();
    }
  }

  checkDead() {
    if (this.birdY + this.square > height1) {
      return true;
    } else if (this.birdY + this.square < this.roof) {
      return true;
    } else if (this.birdX + this.square > this.poleX && this.birdX < this.poleX + this.thickness) {
      if (this.birdY < this.indent + this.poleY) {
        return true;
      } else if (this.birdY + this.square > this.poleY + this.gap) {
        return true;
      }
    }
  }

}
