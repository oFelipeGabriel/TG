class Particula{
  constructor(brain){
    this.fitness = 0;
    this.dead = false;
    this.finished = false;
    this.pos = createVector(start.x, start.y);
    this.vel = createVector();
    this.acc = createVector();
    this.maxspeed = 5;
    this.maxforce = 0.2;
    this.sight = SIGHT;
    this.rays = [];
    this.index = 0;
    this.counter = 0;
    this.img = loadImage('assets/Red_racing_car_top_view.png'); // Load the image
    for(let a = -45; a < 45; a += 15){
      this.rays.push(new Raio(this.pos, radians(a)));
    }
    if(brain){
      this.brain = brain.copy();
    }else{
      this.brain = new RedeNaural(this.rays.length,this.rays.length*2, 2)
    }

  }
  dispose(){

  }

  mutate() {
    this.brain.mutate(MUTATION_RATE);
  }
  toFile(){
    //console.log('cliclu');
    this.brain.save();
  }
  applyForce(force){
    this.acc.add(force);
  }

  update(){
    if(!this.dead & !this.finished){
      this.pos.add(this.vel);
      this.vel.add(this.acc);
      this.vel.limit(this.maxspeed);
      this.acc.set(0,0);
      this.counter++;
      if(this.counter > LIFESPAN){
        this.dead = true;
      }

      for(let i = 0; i < this.rays.length; i++){
        this.rays[i].rotate(this.vel.heading());
      }
    }
  }
  check(checkpoints){
    if(!this.finished){
      this.goal = checkpoints[this.index];
      const d = pldistance(
        this.goal.a, this.goal.b,
        this.pos.x,  this.pos.y
      );
      if(d < 5 ){
        this.index = (this.index + 1) % checkpoints.length;
        this.fitness++;
        this.counter = 0;
      }
    }
  }
  calculateFitness(){
    this.fitness = pow(2, this.fitness);
  }
  look(walls){
    const inputs = [];
    for(let i=0; i<this.rays.length;i++){
      const ray = this.rays[i];
      let closest = null;
      let record = this.sight;
      for(let wall of walls){
        const pt = ray.cast(wall);
        if(pt){
          const d = p5.Vector.dist(this.pos, pt);
          if(d < record && d < this.sight){
            record = d;
            closest = pt;
          }
        }
      }
      if(record<5){
        this.dead = true;
      }
      inputs[i] = map(record, 0, 50, 1, 0);
    }
    const output = this.brain.predict(inputs);
    let angle = map(output[0], 0, 1, -PI, PI);
    let speed = map(output[1], 0, 1, 0, this.maxspeed);
    angle += this.vel.heading();
    const steering = p5.Vector.fromAngle(angle);
    steering.setMag(speed);
    steering.sub(this.vel);
    steering.limit(this.maxforce);
    this.applyForce(steering);
  }
  bounds(){
    if(
      this.pos.x > width ||
      this.pos.x < 0 ||
      this.pos.y > height ||
      this.pos.y < 0
    ){
    this.dead = true;
    }
  }
  show(){
    push();

    translate(this.pos.x, this.pos.y);

    const heading = this.vel.heading();
    rotate(heading);
    fill(0, 100, 0);
    rectMode(CENTER);
    rect(0,0,10,5);
    pop();
  }
  image(){
    return image(this.img, this.pos.x, this.pos.y, 40, 40);;
  }
  highlight() {
    push();
    translate(this.pos.x, this.pos.y);
    const heading = this.vel.heading();
    rotate(heading);
    stroke(0, 255, 0);
    fill(0, 255, 0);
    rectMode(CENTER);
    rect(0, 0, 20, 10, 50, 50);

    pop();
    for (let ray of this.rays) {
      ray.show();
    }
    if (this.goal) {
      //this.goal.show();
    }
  }
}
