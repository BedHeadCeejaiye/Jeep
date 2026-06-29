const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

const N = 15; // grid
const cell = canvas.width / N;


const ROAD = [
{x:3, y:6}, {x:3, y:7}, {x:3, y:8},
{x:4, y:6}, {x:4, y:8},
{x:5, y:6}, {x:5, y:8},
{x:6, y:3}, {x:6, y:4}, {x:6, y:5}, {x:6, y:6}, {x:6, y:7}, {x:6, y:8}, {x:6, y:9}, {x:6, y:10}, {x:6, y:11},
{x:7, y:3}, {x:7, y:6}, {x:7, y:8}, {x:7, y:11},
{x:8, y:3}, {x:8, y:4}, {x:8, y:5}, {x:8, y:6}, {x:8, y:7}, {x:8, y:8}, {x:8, y:9}, {x:8, y:10}, {x:8, y:11},
{x:9, y:6}, {x:9, y:8},
{x:10, y:6}, {x:10, y:8},
{x:11, y:6}, {x:11, y:7}, {x:11, y:8}

];

function drawGrid() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle = "#999";
  for (let i=0; i<=N; i++) {
    ctx.beginPath();
    ctx.moveTo(i*cell,0);
    ctx.lineTo(i*cell,canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0,i*cell);
    ctx.lineTo(canvas.width,i*cell);
    ctx.stroke();
  }
  // highlight ROAD tiles
  ROAD.forEach(tile => {
    ctx.fillStyle = "yellow";
    ctx.fillRect(tile.x*cell+1, tile.y*cell+1, cell-2, cell-2);
  });
}


let player = { roadIndex: 0 }; // start at first tile

function drawPlayer() {
  const pos = ROAD[player.roadIndex]; // get current tile
  ctx.fillStyle = "blue";
  ctx.fillRect(pos.x*cell+5, pos.y*cell+5, cell-10, cell-10);
}

function render() {
  drawGrid();
  drawPlayer();
}

function rollDice() {
  return 1 + Math.floor(Math.random()*6);
}

document.getElementById('rollBtn').addEventListener('click', () => {
  const steps = rollDice();
  player.roadIndex = (player.roadIndex + steps) % ROAD.length; // move along ROAD
  render();
});
