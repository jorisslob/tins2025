const Gamestate = Object.freeze({
  Title: Symbol("title"),
  Game: Symbol("game"),
});

const Tool = Object.freeze({
  Water: Symbol("water"),
  Plant: Symbol("plant"),
  Orago: Symbol("orago"),
  Kakora: Symbol("kakora"),
  Mycelon: Symbol("mycelon")
});

let current_state = Gamestate.Title;
let current_tool = Tool.Water;

let img_title;
let img_water;
let img_plant;
let img_orago;
let img_kakora;
let img_mycelon;

let dirt = [];
let waterDrops = [];
let plants = [];
let oragos = [];
let kakoras = [];
let mycelons = [];

let canvaswidth = 800;
let canvasheight = 615;
let buttonwidth = 200;
let buttonheight = 123;

function setup() {
  cnv = createCanvas(canvaswidth,canvasheight);
  let newCanvasX = (windowWidth - canvaswidth)/2;
  let newCanvasY = (windowHeight - canvasheight)/2;
  cnv.position(newCanvasX, newCanvasY);
  for (let i = 0; i < 300; i++) {
    dirt[i] = []
    for (let j = 0; j < 300; j++) {
      dirt[i][j] = 0;
    }
  }
}

function preload() {
  img_title = loadImage('/assets/title.png');
  img_water = loadImage('/assets/water.png');
  img_plant = loadImage('/assets/plant.png');
  img_orago = loadImage('/assets/orago.png');
  img_kakora = loadImage('/assets/kakora.png');
  img_mycelon = loadImage('/assets/mycelon.png');
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
  scene = createGraphics(canvaswidth-buttonwidth, canvasheight);
  
  // Layer 1, planet
  drawDirt(scene);
  
  // Layer 2, water
  drawWater(scene);
  
  // Layer 3, plants
  drawPlants(scene);
  
  // Layer 4, oragos
  drawOragos(scene);
  
  // Layer 5, kakoras
  drawKakoras(scene);
  
  // Layer 6, mycelons
  drawMycelons(scene);

  // Make space around the planet back
  maskLayer = createGraphics(canvaswidth-buttonwidth, canvasheight);
  maskLayer.background(0,0,0,0);
  maskLayer.fill(255,255,255,255);
  maskLayer.circle(300,300,300);
  
  sceneImage = scene.get();
  maskImage = maskLayer.get();
  
  sceneImage.mask(maskImage);
  image(sceneImage,0,0);
  
  // Layer 7, tools
  image(img_water, canvaswidth-buttonwidth, 0);
  image(img_plant, canvaswidth-buttonwidth, buttonheight);
  image(img_orago, canvaswidth-buttonwidth, 2*buttonheight);
  image(img_kakora, canvaswidth-buttonwidth, 3*buttonheight);
  image(img_mycelon, canvaswidth-buttonwidth, 4*buttonheight);
  
  // Layer 8, selected tool
  active_circleX = canvaswidth-20;
  active_circleY = 0;
  switch(current_tool) {
    case Tool.Water:
      active_circleY = buttonheight/2;
      break;
    case Tool.Plant:
      active_circleY = buttonheight*1.5;
      break;
    case Tool.Orago:
      active_circleY = buttonheight*2.5;
      break;
    case Tool.Kakora:
      active_circleY = buttonheight*3.5;
      break;
    case Tool.Mycelon:
      active_circleY = buttonheight*4.5;
      break;
  }
  fill(0,255,0);
  circle(active_circleX, active_circleY, 10);
  }

function drawDirt(fg) {
  fg.loadPixels();
  for (let i=0; i<dirt.length; i++) {
    for (let j=0; j<dirt[i].length; j++) {
      let index = ((i + 150) + (j+150)*fg.width) * 4;
      let val = dirt[i][j];
      fg.pixels[index + 0] = val + 34;
      fg.pixels[index + 1] = val + 13;
      fg.pixels[index + 2] = val + 5;
      fg.pixels[index + 3] = 255;
    }
  }
  fg.updatePixels();
}

function drawWater(fg) {
  waterDrops = waterDrops.filter(drop => drop.d > 1);
  // randomly spawn in a water meteor
  if (random(0,100)>98) {
    x1 = random(-150,150)+300;
    y1 = random(-150,150)+300;
    if (dist(x1, y1, 300, 300)<300) {
      waterDrops.push({x: x1, y: y1, d: random(2,13)})
    }
  }
  for (let i = 0; i < waterDrops.length; i++) {
    let drop = waterDrops[i];
    for (let j = 0; j < waterDrops.length; j++) {
      if (i != j) {
        let other = waterDrops[j];
        let d = dist(drop.x, drop.y, other.x, other.y);
        if (d < (drop.d + other.d)/2) {
          other.d = ((other.d * other.d) + (drop.d * drop.d)) ** 0.5;
          drop.d = 1;
        } else {      
          drop.x += (other.x - drop.x) / d**2;
          drop.y += (other.y - drop.y) / d**2;
        }
      }
    }
    fg.fill(0, 100, 255, 150);
    fg.circle(drop.x, drop.y, drop.d);
  }
}

function drawPlants(fg) {
  makeDirtFromDyingInList(plants, 2);
  plants = plants.filter(plant => plant.d > 2);
  // randomly spawn in a plant meteor
  if (random(0,1000)>998) {
    x1 = random(-150,150)+300;
    y1 = random(-150,150)+300;
    if (dist(x1, y1, 300, 300)<300) {
      plants.push({x: x1, y: y1, d: random(3,8)})
    }
  }
  fg.fill(0, 255, 0, 150);
  fg.noStroke();
  for (let i = 0; i < plants.length; i++) {
    let plant = plants[i];
    for (let j = 0; j < waterDrops.length; j++) {
      let drop = waterDrops[j];
      let d = dist(plant.x, plant.y, drop.x, drop.y);
      if (d < (plant.d + drop.d)/2) {
        plant.d += 1
        drop.d -= 1
        continue;
      }
    }
    fg.circle(plant.x, plant.y, plant.d);
  }
  fg.stroke(0);
}  

function drawOragos(fg) {
  makeDirtFromDyingInList(oragos, 3);
  oragos = oragos.filter(orago => orago.d > 3);
  fg.fill(93,66,4,150);
  for (let i = 0; i < oragos.length; i++) {
    let orago = oragos[i];
    if (random(0,1000)>990) {
      orago.d -= 1;
    }
    closest = closestTo(orago, plants);
    if (closest != null) {
      closest_d = dist(orago.x, orago.y, closest.x, closest.y);
      if (closest_d < (orago.d + closest.d)/2) {
        orago.d += 1;
        closest.d -= 1;
      } else {
        moveToward(orago, closest, 1);
      }
    }
    fg.circle(orago.x, orago.y, orago.d);
  }
}

function drawKakoras(fg) {
  makeDirtFromDyingInList(kakoras, 5);
  kakoras = kakoras.filter(kakora => kakora.d > 5);
  fg.fill(255,0,0,150);
  for (let i = 0; i < kakoras.length; i++) {
    let kakora = kakoras[i];
    if (random(0,1000)>990) {
      kakora.d -= 1;
    }
    closest = closestTo(kakora, oragos);
    if (closest != null) {
      closest_d = dist(kakora.x, kakora.y, closest.x, closest.y);
      if (closest_d < (kakora.d + closest.d)/2) {
        kakora.d += 1;
        closest.d -= 1;
      } else {
        moveToward(kakora, closest, 2);
      }
    }
    fg.circle(kakora.x, kakora.y, kakora.d);
  }
}

function drawMycelons(fg) {
  fg.fill(56,10,73,150);
  for (let i = 0; i < mycelons.length; i++) {
    let mycelon = mycelons[i];
    fg.circle(mycelon.x, mycelon.y, mycelon.d);
  }
}

function mousePressed(event) {
  if (current_state == Gamestate.Title) {
    current_state = Gamestate.Game;
  } else {
    // We are in the game!
    if (mouseX >= 600) {
      if (mouseY <= buttonheight) {
        current_tool = Tool.Water;
      } else if (mouseY <= 2*buttonheight) {
        current_tool = Tool.Plant;
      } else if (mouseY <= 3*buttonheight) {
        current_tool = Tool.Orago;
      } else if (mouseY <= 4*buttonheight) {
        current_tool = Tool.Kakora;
      } else {
        current_tool = Tool.Mycelon;
      }
    }
    else {
      d_center = dist(mouseX, mouseY, 300, 300);
      if (d_center < 150) {
        switch(current_tool) {
          case Tool.Water: 
            waterDrops.push({ x: mouseX, y: mouseY, d: 2 });
            break;
          case Tool.Plant:
            plants.push({ x: mouseX, y: mouseY, d: 3 });
            break;
          case Tool.Orago:
            oragos.push({ x: mouseX, y: mouseY, d: 5 });
            break;
          case Tool.Kakora:
            kakoras.push({ x: mouseX, y: mouseY, d: 8 });
            break;
          case Tool.Mycelon:
            mycelons.push({ x: mouseX, y: mouseY, d: 13 });
            break;
        }
      }
    }
  } 
}

function moveToward(obj1, obj2, speed) {
  let dx = obj2.x - obj1.x;
  let dy = obj2.y - obj1.y;
  let distance = (dx ** 2 + dy ** 2) ** 0.5;
  if (distance > 0) {
    obj1.x += (dx / distance) * speed * (random(1,100)/100);
    obj1.y += (dy / distance) * speed * (random(1,100)/100);
  }
}

function closestTo(obj1, list) {
  let closest = null;
  let closest_d = 1000;
  for (let j = 0; j < list.length; j++) {
    let obj2 = list[j];
    let d = dist(obj1.x, obj1.y, obj2.x, obj2.y);
    if (d < closest_d) {
      closest_d = d;
      closest = obj2;
    }
  }
  return closest;
}

function makeDirtFromDyingInList(list, deathnum) {
  for (let i = 0; i < list.length; i++) {
    let creature = list[i];
    if (creature.d <= deathnum) {
      dirtx = creature.x - 150;
      dirty = creature.y - 150;
      if (dirtx >= 0 && dirtx < 300 && dirty >= 0 && dirty < 300) {
        dirt[int(dirtx)][int(dirty)] += creature.d;
      }
    }
  }
}
