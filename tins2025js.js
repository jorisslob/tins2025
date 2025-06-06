const Gamestate = Object.freeze({
  Title: Symbol("title"),
  Game: Symbol("game"),
  Gameover: Symbol("gameover")
});

let current_state = Gamestate.Title;
let counter = 0;

function setup() {
  createCanvas(800,600);
}


function draw() {
  console.log("hello world");
  switch (current_state) {
    case Gamestate.Title:
      background(255,0,0);
      if (counter > 100) {
        current_state = Gamestate.Game;
        counter = 0;
      }
      break;
    case Gamestate.Game:
      background(0,255,0);
      if (counter > 100) {
        current_state = Gamestate.Gameover;
        counter = 0;
      }
      break;
    case Gamestate.Gameover:
      background(0,0,255);
      if (counter > 100) {
        current_state = Gamestate.Title;
        counter = 0;
      }
      break;
  }
  counter++;
}
