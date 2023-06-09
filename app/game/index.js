import KeyListener from "./helpers/keylistener.js";
import Socket from "./helpers/sockets.js";
import { Rocket } from "./models/rocket.js";
import { lerp } from "./helpers/math.js";
import { Button } from "../../node_modules/@pixi/ui";
const socket = new Socket();
const app = new PIXI.Application(window.innerWidth, window.innerHeight, { backgroundColor: 0x1099bb });
const Listener = new KeyListener();
//https://developer.mozilla.org/en-US/docs/Games/Techniques/Control_mechanisms/Mobile_touch
const el = document.getElementById("gameCanvas");
el.addEventListener("touchstart", handleTouchStart);
el.addEventListener("touchmove", handleTouchMove);
el.addEventListener("touchend", handleTouchStop);
el.addEventListener("touchcancel", handleTouchStop);
window.addEventListener("resize", function() {
	app.renderer.resize(window.innerWidth, window.innerHeight);
});
//const button = new Button(new Graphics().beginFill(0xFFFFFF).drawRoundRect(0, 0, 100, 50, 15));
//app.stage.appendChild(button);
var touchY;
var touchX;
var xChange = 0;
var yChange = 0;
let packetsArray = [];

let rocketStats = null;

function handleTouchStart(e) {
  if (e.touches) {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }
}

function handleTouchMove(e) {
  if (e.touches) {
    xChange = Math.sign(e.changedTouches[0].clientX - touchX);
    yChange = Math.sign(e.changedTouches[0].clientY - touchY);
    e.preventDefault();
  }
}

function handleTouchStop(e) {
  xChange = 0;
  yChange = 0;
}

function createPlayer(playerdata) {
  const rocket = new Rocket(playerdata);
  app.stage.addChild(rocket);
}

function interPolate() {
  if (packetsArray.length < 5) return;
  const past = 140,
    now = Date.now(),
    renderTime = now - past;

  const t1 = packetsArray[1].timestamp,
    t2 = packetsArray[0].timestamp;

  if (renderTime <= t2 && renderTime >= t1) {
    // total time from t1 to t2
    const total = t2 - t1,
      // how far between t1 and t2 this entity is as of 'renderTime'
      portion = renderTime - t1,
      // fractional distance between t1 and t2
      ratio = portion / total;

    const t1Players = packetsArray[0].data,
      t2Players = packetsArray[1].data;
    t1Players.forEach(player => {
      const t2Player = t2Players.filter(item => player.id === item.id)[0];
      if (!t2Player) return;

      const interpX = lerp(t2Player.x, player.x, ratio);
      const interpY = lerp(t2Player.y, player.y, ratio);
      const cords = { x: interpX, y: interpY };
      if (rocketStats.id !== player.id) {
        editPlayerPosition(player, cords);
      }
    });
    packetsArray.slice();
  }
}

function editPlayerPosition(player, cords) {
  const playerSprite = getCurrentPlayerSprite(player.id);
  if (!playerSprite) {
    createPlayer(player);
    const newPlayerSprite = getCurrentPlayerSprite(player.id);
    newPlayerSprite.x = cords.x;
    newPlayerSprite.y = cords.y;
  } else {
    playerSprite.x = cords.x;
    playerSprite.y = cords.y;
  }
}

function getCurrentPlayerSprite(id) {
  return app.stage.children.filter(children => children.id === id)[0];
}

function sendData() {
  const currentPlayerStats = getCurrentPlayerSprite(rocketStats.id);
  currentPlayerStats.x = rocketStats.x;
  currentPlayerStats.y = rocketStats.y;
  socket.send({
    type: "input",
    data: rocketStats
  });
}

socket.connection.onmessage = signal => {
  const payload = JSON.parse(signal.data);
  switch (payload.type) {
    case "init":
      rocketStats = payload.data;
      createPlayer(payload.data);
      break;
    case "update":
      packetsArray.unshift(payload);
      break;
  }
};

app.ticker.add(delta => {
  if (rocketStats) {
    interPolate();
  }
  if (xChange != 0 || yChange != 0) {
    rocketStats.x += 4*xChange;
    rocketStats.y += 4*yChange;
    sendData();
  }
  /* commenting out keyboard for now
  Listener.on("W", () => {
    rocketStats.y -= 4;
    sendData();
  });

  Listener.on("S", () => {
    rocketStats.y += 4;
    sendData();
  });

  Listener.on("A", () => {
    rocketStats.x -= 4;
    sendData();
  });

  Listener.on("D", () => {
    rocketStats.x += 4;
    sendData();
  });*/
});

document.getElementById("gameCanvas").appendChild(app.view);
