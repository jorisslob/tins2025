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

const canvaswidth = 800;
const canvasheight = 615;
const buttonwidth = 200;
const buttonheight = 123;

const PLANET_RADIUS = 150;
const PLANET_CENTER = { x: 300, y: 300 };

let scene;
let maskImage;

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


function setup() {
  const cnv = createCanvas(canvaswidth, canvasheight);
  const newCanvasX = (windowWidth - canvaswidth) / 2;
  const newCanvasY = (windowHeight - canvasheight) / 2;
  cnv.position(newCanvasX, newCanvasY);
  for (let i = 0; i < PLANET_RADIUS*2; i++) {
    dirt[i] = []
    for (let j = 0; j < PLANET_RADIUS*2; j++) {
      dirt[i][j] = 0;
    }
  }
  scene = createGraphics(canvaswidth - buttonwidth, canvasheight);
  // Make space around the planet back
  const maskLayer = createGraphics(canvaswidth - buttonwidth, canvasheight);
  maskLayer.background(0, 0, 0, 0);
  maskLayer.fill(255, 255, 255, 255);
  maskLayer.circle(PLANET_CENTER.x, PLANET_CENTER.y, PLANET_RADIUS*2);

  maskImage = maskLayer.get();
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
  background(0, 0, 0);
  image(img_title, 0, 0);
  if (mouseIsPressed === true) {
    current_state = Gamestate.Game;
  }
}

function gameloop() {
  background(0, 0, 0);


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

  const sceneImage = scene.get();
  sceneImage.mask(maskImage);
  image(sceneImage, 0, 0);

  // Layer 7, tools
  image(img_water, canvaswidth - buttonwidth, 0);
  fill(255);
  text(str(int(listSum(waterDrops))), canvaswidth - 80, buttonheight / 2)
  image(img_plant, canvaswidth - buttonwidth, buttonheight);
  text(str(int(listSum(plants))), canvaswidth - 80, buttonheight * 1.5)
  image(img_orago, canvaswidth - buttonwidth, 2 * buttonheight);
  text(str(int(listSum(oragos))), canvaswidth - 80, buttonheight * 2.5)
  image(img_kakora, canvaswidth - buttonwidth, 3 * buttonheight);
  text(str(int(listSum(kakoras))), canvaswidth - 80, buttonheight * 3.5)
  image(img_mycelon, canvaswidth - buttonwidth, 4 * buttonheight);
  text(str(int(listSum(mycelons))), canvaswidth - 80, buttonheight * 4.5)

  // Layer 8, selected tool
  const active_circleX = canvaswidth - 20;
  let active_circleY = 0;
  switch (current_tool) {
    case Tool.Water:
      active_circleY = buttonheight / 2;
      break;
    case Tool.Plant:
      active_circleY = buttonheight * 1.5;
      break;
    case Tool.Orago:
      active_circleY = buttonheight * 2.5;
      break;
    case Tool.Kakora:
      active_circleY = buttonheight * 3.5;
      break;
    case Tool.Mycelon:
      active_circleY = buttonheight * 4.5;
      break;
  }
  fill(0, 255, 0);
  circle(active_circleX, active_circleY, 10);

  // Layer 9, score
  const wscore = listSum(waterDrops)
  const pscore = listSum(plants)
  const oscore = listSum(oragos)
  const kscore = listSum(kakoras)
  const mscore = listSum(mycelons)
  const tscore = wscore + pscore + oscore + kscore + mscore;
  let biodiv;
  biodiv = 0;
  if (wscore > 0) { biodiv += (wscore / tscore) * log(wscore / tscore); }
  if (pscore > 0) { biodiv += (pscore / tscore) * log(pscore / tscore); }
  if (oscore > 0) { biodiv += (oscore / tscore) * log(oscore / tscore); }
  if (kscore > 0) { biodiv += (kscore / tscore) * log(kscore / tscore); }
  if (mscore > 0) { biodiv += (mscore / tscore) * log(mscore / tscore); }
  biodiv = -int(biodiv * 10)
  text("Bio-score: " + biodiv, 50, canvasheight - 50);
  let soil = 0
  for (let i = 0; i < PLANET_RADIUS*2; i++) {
    for (let j = 0; j < PLANET_RADIUS*2; j++) {
      soil += dirt[i][j];
    }
  }
  text("Soil health: " + soil, 50, canvasheight - 25);
}

function drawDirt(fg) {
  fg.loadPixels();
  for (let i = 0; i < dirt.length; i++) {
    for (let j = 0; j < dirt[i].length; j++) {
      const index = ((i + 150) + (j + 150) * fg.width) * 4;
      const val = dirt[i][j];
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
  if (random(0, 100) > 98) {
    const x1 = random(-PLANET_RADIUS, PLANET_RADIUS) + PLANET_RADIUS*2;
    const y1 = random(-PLANET_RADIUS, PLANET_RADIUS) + PLANET_RADIUS*2;
    if (dist(x1, y1, PLANET_CENTER.x, PLANET_CENTER.y) < PLANET_RADIUS) {
      waterDrops.push({ x: x1, y: y1, d: random(2, 13) })
    }
  }
  for (let i = 0; i < waterDrops.length; i++) {
    let drop = waterDrops[i];
    for (let j = 0; j < waterDrops.length; j++) {
      if (i != j) {
        const other = waterDrops[j];
        let d = dist(drop.x, drop.y, other.x, other.y);
        if (d < (drop.d + other.d) / 2) {
          other.x = ((drop.x * drop.d) + (other.x * other.d)) / (drop.d + other.d);
          other.y = ((drop.y * drop.d) + (other.y * other.d)) / (drop.d + other.d);
          other.d = ((other.d * other.d) + (drop.d * drop.d)) ** 0.5;
          drop.d = 1;
        } else {
          drop.x += (other.x - drop.x) / d ** 2;
          drop.y += (other.y - drop.y) / d ** 2;
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
  if (random(0, 1000) > 998) {
    const x1 = random(-PLANET_RADIUS, PLANET_RADIUS) + PLANET_RADIUS*2;
    const y1 = random(-PLANET_RADIUS, PLANET_RADIUS) + PLANET_RADIUS*2;
    if (dist(x1, y1, PLANET_CENTER.x, PLANET_CENTER.y) < PLANET_RADIUS) {
      plants.push({ x: x1, y: y1, d: random(3, 8) })
    }
  }
  fg.fill(0, 255, 0, 150);
  fg.noStroke();
  for (let i = 0; i < plants.length; i++) {
    let plant = plants[i];
    for (let j = 0; j < waterDrops.length; j++) {
      let drop = waterDrops[j];
      let d = dist(plant.x, plant.y, drop.x, drop.y);
      if (d < (plant.d + drop.d) / 2) {
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
  fg.fill(93, 66, 4, 150);
  for (let i = 0; i < oragos.length; i++) {
    let orago = oragos[i];
    if (random(0, 1000) > 990) {
      orago.d -= 1;
    }
    closest = closestTo(orago, plants);
    if (closest != null) {
      closest_d = dist(orago.x, orago.y, closest.x, closest.y);
      if (closest_d < (orago.d + closest.d) / 2) {
        orago.d += 1;
        closest.d -= 1;
      } else {
        moveToward(orago, closest, 2);
      }
    }
    fg.circle(orago.x, orago.y, orago.d);
  }
}

function drawKakoras(fg) {
  makeDirtFromDyingInList(kakoras, 5);
  kakoras = kakoras.filter(kakora => kakora.d > 5);
  fg.fill(255, 0, 0, 150);
  for (let i = 0; i < kakoras.length; i++) {
    let kakora = kakoras[i];
    if (random(0, 1000) > 990) {
      kakora.d -= random(1, 5);
    }
    closest = closestTo(kakora, oragos);
    if (closest != null) {
      closest_d = dist(kakora.x, kakora.y, closest.x, closest.y);
      if (closest_d < (kakora.d + closest.d) / 2) {
        kakora.d += 1;
        closest.d -= 1;
      } else {
        moveToward(kakora, closest, 1);
      }
    }
    fg.circle(kakora.x, kakora.y, kakora.d);
  }
}

function drawMycelons(fg) {
  mycelons = mycelons.filter(kakora => kakora.d > 8);
  fg.fill(56, 10, 73, 150);
  for (let i = 0; i < mycelons.length; i++) {
    let mycelon = mycelons[i];
    if (random(0, 1000) > 990) {

      switch (int(random(0, 4))) {
        case 0:
          waterDrops.push({ x: mycelon.x, y: mycelon.y, d: 2 })
          mycelon.d -= 2;
          break;
        case 1:
          plants.push({ x: mycelon.x, y: mycelon.y, d: 3 })
          mycelon.d -= 3;
          break;
        case 2:
          oragos.push({ x: mycelon.x, y: mycelon.y, d: 5 })
          mycelon.d -= 5;
          break;
        case 3:
          kakoras.push({ x: mycelon.x, y: mycelon.y, d: 8 })
          mycelon.d -= 8;
          break;
      }
    }
    const dirtx = mycelon.x - PLANET_RADIUS;
    const dirty = mycelon.y - PLANET_RADIUS;
    if (dirtx >= 0 && dirtx < PLANET_RADIUS*2 && dirty >= 0 && dirty < PLANET_RADIUS*2) {
      if (dirt[int(dirtx)][int(dirty)] > 0) {
        mycelon.d += dirt[int(dirtx)][int(dirty)];
        dirt[int(dirtx)][int(dirty)] = 0;
      } else {
        randomMove(mycelon);
      }
    }
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
      } else if (mouseY <= 2 * buttonheight) {
        current_tool = Tool.Plant;
      } else if (mouseY <= 3 * buttonheight) {
        current_tool = Tool.Orago;
      } else if (mouseY <= 4 * buttonheight) {
        current_tool = Tool.Kakora;
      } else {
        current_tool = Tool.Mycelon;
      }
    }
    else {
      const d_center = dist(mouseX, mouseY, PLANET_CENTER.x, PLANET_CENTER.y);
      if (d_center < 150) {
        switch (current_tool) {
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
  const dx = obj2.x - obj1.x;
  const dy = obj2.y - obj1.y;
  const distance = (dx ** 2 + dy ** 2) ** 0.5;
  if (distance > 0) {
    obj1.x += (dx / distance) * speed * (random(1, 100) / 100);
    obj1.y += (dy / distance) * speed * (random(1, 100) / 100);
  }
}

function randomMove(obj1) {
  obj1.x += (random(0, 101) - 50) / 100;
  obj1.y += (random(0, 101) - 50) / 100;
  if (dist(obj1.x, obj1.y, PLANET_CENTER.x, PLANET_CENTER.y) > PLANET_RADIUS*0.75) {
    const center = { x: 300, y: 300 };
    moveToward(obj1, center, 1);
  }
}

function closestTo(obj1, list) {
  let closest = null;
  let closest_d = 1000;
  for (let j = 0; j < list.length; j++) {
    const obj2 = list[j];
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
    const creature = list[i];
    if (creature.d <= deathnum) {
      const dirtx = creature.x - 150;
      const dirty = creature.y - 150;
      if (dirtx >= 0 && dirtx < 300 && dirty >= 0 && dirty < 300) {
        dirt[int(dirtx)][int(dirty)] += creature.d * 5;
      }
    }
  }
}

function listSum(list) {
  let sum = 0;
  for (let i = 0; i < list.length; i++) {
    sum += list[i].d;
  }
  return sum;
}
