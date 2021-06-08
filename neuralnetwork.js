function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function sigmoidCurve(x1, y1, x2, y2, strength, detail) {
  push();
  noFill();
  beginShape();
  for (let i = 0; i <= (x2 - x1); i += (x2 - x1) / (detail - 1)) {
    let newX = x1 + i;
    let newY = y1 + sigmoid(strength * i / (x2 - x1) - strength / 2) * (y2 - y1);
    vertex(newX, newY);
  }
  endShape();
  pop();
}

class Matrix {
  constructor(i, j) {
    this.data = [];
    this.i = i;
    this.j = j;
    for (let v = 0; v < i; v++) {
      this.data[v] = [];
      for (let x = 0; x < j; x++) {
        this.data[v][x] = 0;
      }
    }
  }
  static mutate(mat, mr) {
    let result = new Matrix(mat.i, mat.j);
    for (let i = 0; i < result.data.length; i++) {
      for (let j = 0; j < result.data[i].length; j++) {
        result.data[i][j] = mat.data[i][j];
        if (random() < mr) {
          result.data[i][j] += 0.5 * (2 * Math.random() - 1);
        }
      }
    }
    return result;
  }
  get(i, j) {
    return this.data[i][j];
  }
  randomize() {
    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < this.data[i].length; j++) {
        this.data[i][j] = Math.floor(Math.random() * 11 - 5);
      }
    }
  }
}

class Evolution {
  constructor() {
    this.population = [];
    this.data = [];
    this.generationSize = 1000;
    this.mutationRate = 0.2;
    for (let i = 0; i < this.generationSize; i++) {
      this.population[i] = {
        nn: new Neuralnetwork(3, 2, 1),
        fitness: 0
      };
    }
  }
  nextGeneration() {
    this.checkFitness();
    this.collectData();
    this.selection();
  }
  checkFitness() {
    for (let i = 0; i < this.population.length; i++) {
      let game = new Game();
      while (!game.checkDead() && game.score < 50000) {
        let chance = this.population[i].nn.evaluate(game.poleX - (game.birdX + game.square), (game.poleY + game.gap) - (game.birdY + game.square), game.birdY - game.poleY);
        if (0.5 < chance ? game.flap() : null);
        game.update();
      }
      this.population[i].fitness = game.score;
    }
    this.population.sort(function(a, b) {
      return b.fitness - a.fitness;
    });
  }
  collectData() {
    let median = 0;
    for (let i = 0; i < this.population.length; i++) {
      median += this.population[i].fitness;
    }
    median /= 1000;
    this.data.push({
      worst: this.population[this.population.length - 1].fitness,
      best: this.population[0].fitness,
      median: median,
      generation: this.data.length + 1
    });
  }
  selection() {
    this.population.splice(44, 1000);
    let count = this.population.length;
    let newA = [];
    for (let i = 1; i <= count; i++) {
      newA.push({
        nn: Neuralnetwork.copy(this.population[i - 1].nn),
        fitness: this.population[i - 1].fitness
      });
      for (let j = 1; j < count + 1 - i; j++) {
        newA.push({
          nn: Neuralnetwork.mutate(this.population[i - 1].nn, this.mutationRate),
          fitness: this.population[i - 1].fitness
        });
      }
      if (i == 1) {
        for (let j = 0; j < 10; j++) {
          newA.push({
            nn: Neuralnetwork.mutate(this.population[i - 1].nn, this.mutationRate),
            fitness: this.population[i - 1].fitness
          });
        }
      }
    }
    this.population = newA;
  }
}

class Neuralnetwork {
  constructor() {
    this.nodes = [];
    this.weights = [];
    this.biases = [];
    this.biggest = 0;
    //Node
    for (let i = 0; i < arguments.length; i++) {
      this.nodes.push(new Array(arguments[i]));
    }
    //Weights
    for (let i = 0; i < arguments.length - 1; i++) {
      this.weights.push(new Matrix(arguments[i + 1], arguments[i]));
      this.weights[i].randomize();
    }
    //Biases
    for (let i = 0; i < arguments.length - 1; i++) {
      this.biases.push(new Matrix(arguments[i + 1], arguments[i]));
      this.biases[i].randomize();
    }
  }
  show(x, y, w, h) {
    push();
    rect(x, y, w, h);
    let r = 10;
    fill(0);
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = 0; j < this.nodes[i].length; j++) {
        let newX = x + i * (1 / (this.nodes.length) * w) + (1 / (this.nodes.length * 2) * w);
        let newY = y + j * (1 / (this.nodes[i].length) * h) + (1 / (this.nodes[i].length * 2) * h);
        ellipse(newX, newY, r * 2);
        let next = (i == this.nodes.length - 1 ? 0 : this.nodes[i + 1].length);
        for (let v = 0; v < next; v++) {
          if (!this.biggest) {
            this.biggest = -Infinity;
            for (let i = 0; i < this.weights.length; i++) {
              for (let j = 0; j < this.weights[i].data.length; j++) {
                for (let v = 0; v < this.weights[i].data[j].length; v++) {
                  if (Math.abs(this.weights[i].data[j][v]) > this.biggest ? this.biggest = Math.abs(this.weights[i].data[j][v]) : null);
                }
              }
            }
          }
          push();
          if (this.weights[i].data[v][j] == 0) {
            stroke(30, 144, 255);
          } else if (this.weights[i].data[v][j] > 0) {
            stroke(30, 144, 255);
          } else {
            stroke(220, 20, 60);
          }
          strokeWeight(1 + Math.abs(this.weights[i].data[v][j] * 5 / this.biggest));
          sigmoidCurve(newX + r + 2, newY, x + (i + 1) * (1 / (this.nodes.length) * w) + (1 / (this.nodes.length * 2) * w), y + v * (1 / (this.nodes[i + 1].length) * h) + (1 / (this.nodes[i + 1].length * 2) * h), 10, 20)
          pop();
        }
      }
    }
    pop();
  }
  static copy(nnn) {
    let nn = new Neuralnetwork(3, 2, 1);
    for (let i = 0; i < nn.weights.length; i++) {
      nn.weights[i] = nnn.weights[i];
    }
    for (let i = 0; i < nn.biases.length; i++) {
      nn.biases[i] = nnn.biases[i];
    }
    return nn;
  }
  static mutate(nnn, mr) {
    let nn = new Neuralnetwork(3, 2, 1);
    for (let i = 0; i < nn.weights.length; i++) {
      nn.weights[i] = Matrix.mutate(nnn.weights[i], mr);
      nn.biases[i] = Matrix.mutate(nnn.biases[i], mr);
    }
    return nn;
  }
  evaluate() {
    if (arguments.length == this.nodes[0].length) {
      for (let i = 0; i < this.nodes[0].length; i++) {
        this.nodes[0][i] = arguments[i];
      }
      for (let i = 1; i < this.nodes.length; i++) {
        for (let j = 0; j < this.nodes[i].length; j++) {
          let end = 0;
          for (let h = 0; h < this.nodes[i - 1].length; h++) {
            end += this.nodes[i - 1][h] * this.weights[i - 1].get(j, h) + this.biases[i - 1].get(j, h);
          }
          this.nodes[i][j] = sigmoid(end);
        }
      }
    }
    //Optional if outputs>1
    return this.nodes[this.nodes.length - 1][0];
  }
}
