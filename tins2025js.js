const Gamestate = Object.freeze({
  Title: Symbol("title"),
  Game: Symbol("game"),
});

const Tool = Object.freeze({
  Grass: Symbol("grass")
});

let current_state = Gamestate.Title;
let tool = Tool.Grass;
let img_title;
let waterDrops = [];

function setup() {
  cnv = createCanvas(800,600);
  let newCanvasX = (windowWidth - 800)/2;
  let newCanvasY = (windowHeight - 600)/2;
  cnv.position(newCanvasX, newCanvasY);
}

function preload() {
  img_title = loadImage('/assets/title.png');
}


function draw() {
  switch (current_state) {
    case Gamestate.Title:
      title();
      break;
    case Gamestate.Game:
      gameloop();
      break;
  }
}

function title() {
  background(0,0,0);
  image(img_title, 0, 0);
  if (mouseIsPressed === true) {
    current_state = Gamestate.Game;
  }
}

function gameloop() {
  background(0,0,0);
  fill(139,69,19);
  // Layer one, bedrock
  circle(300,300,300);
  // Layer two, water
  drawWater();
}

function drawWater() {
  waterDrops = waterDrops.filter(drop => drop.d != 1);
  for (let i = 0; i < waterDrops.length; i++) {
    let drop = waterDrops[i];
    for (let j = 0; j < waterDrops.length; j++) {
      if (i != j) {
        let other = waterDrops[j];
        let d = dist(drop.x, drop.y, other.x, other.y);
        if (d < (drop.d + other.d)/2) {
          other.d += drop.d;
          drop.d = 1;
        } else {      
          drop.x += (other.x - drop.x) / d**2;
          drop.y += (other.y - drop.y) / d**2;
        }
      }
    }
    fill(0, 100, 255, 150);
    ellipse(drop.x, drop.y, drop.d, drop.d);
  }
}

function mouseClicked(event) {
  if (current_state == Gamestate.Title) {
    current_state = Gamestate.Game;
  } else {
    // We are in the game!
    if (mouseX >= 600) {
      console.log("select tool!");
    }
    else {
      console.log("use tool!");
      d_center = dist(mouseX, mouseY, 300, 300);
      if (d_center < 150) {
        waterDrops.push({ x: mouseX, y: mouseY, d: 2 });
        console.log(waterDrops.length);
      }
    }
  } 
}
