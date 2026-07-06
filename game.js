const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

const N = 15; // grid size
const cell = canvas.width / N;

const ROAD = [
  {x:3,y:6},{x:4,y:6},{x:5,y:6},
  {x:6,y:6},{x:6,y:5},{x:6,y:4},
  {x:6,y:3},{x:7,y:3},{x:8,y:3},
  {x:8,y:4},{x:8,y:5},{x:8,y:6},
  {x:9,y:6},{x:10,y:6},{x:11,y:6},
  {x:11,y:7},{x:11,y:8},{x:10,y:8},
  {x:9,y:8},{x:8,y:8},{x:8,y:9},
  {x:8,y:10},{x:8,y:11},{x:7,y:11},
  {x:6,y:11},{x:6,y:10},{x:6,y:9},
  {x:6,y:8},{x:5,y:8},{x:4,y:8},
  {x:3,y:8},{x:3,y:7}
];

const STATIONS = [
  {x:7,y:2},   // top
  {x:7,y:12},  // bottom
  {x:2,y:7},   // left
  {x:12,y:7}   // right
];

const MIDDLES = [
  {x:6,y:7},{x:7,y:6},{x:7,y:8},{x:8,y:7}
];

//borken paths
const INTERSECTIONS = [
  { pos:{x:6,y:6}, options:[
      {path:[{x:6,y:6},{x:6,y:5},{x:6,y:4},{x:6,y:3}]}, // upward
      {path:[{x:6,y:6},{x:7,y:6},{x:8,y:6},{x:9,y:6}]}  // right
  ]},
  { pos:{x:6,y:8}, options:[
      {path:[{x:6,y:8},{x:5,y:8},{x:4,y:8},{x:3,y:8}]}, // left
      {path:[{x:6,y:8},{x:6,y:9},{x:6,y:10},{x:6,y:11}]} // down
  ]},
  { pos:{x:8,y:6}, options:[
      {path:[{x:8,y:6},{x:9,y:6},{x:10,y:6},{x:11,y:6}]}, // right
      {path:[{x:8,y:6},{x:8,y:5},{x:8,y:4},{x:8,y:3}]}    // up
  ]},
  { pos:{x:8,y:8}, options:[
      {path:[{x:8,y:8},{x:8,y:9},{x:8,y:10},{x:8,y:11}]}, // down
      {path:[{x:8,y:8},{x:7,y:8},{x:6,y:8},{x:5,y:8}]}    // left
  ]}
];

let passengers = [];
let score = 0;

function spawnPassengers() {
  passengers = STATIONS.map((s,i)=>({
    id:i,pos:s,waiting:true,pickedUp:false
  }));
}

function drawGrid() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle="#999";
  for (let i=0;i<=N;i++) {
    ctx.beginPath();
    ctx.moveTo(i*cell,0);
    ctx.lineTo(i*cell,canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0,i*cell);
    ctx.lineTo(canvas.width,i*cell);
    ctx.stroke();
  }
  ROAD.forEach(tile=>{
    ctx.fillStyle="yellow";
    ctx.fillRect(tile.x*cell+1,tile.y*cell+1,cell-2,cell-2);
  });
  STATIONS.forEach(s=>{
    ctx.fillStyle="red";
    ctx.fillRect(s.x*cell+1,s.y*cell+1,cell-2,cell-2);
  });
  MIDDLES.forEach(m=>{
    ctx.fillStyle="yellow";
    ctx.fillRect(m.x*cell+1,m.y*cell+1,cell-2,cell-2);
  });
}

let player={
  id:0,
  spawn:{x:4,y:8},
  pos:{x:4,y:8},
  roadIndex:ROAD.findIndex(t=>t.x===4&&t.y===8),
  color:"blue",
  choicePending:false,
  remainingSteps:0
};

function drawPlayer(){
  ctx.fillStyle=player.color;
  ctx.fillRect(player.pos.x*cell+5,player.pos.y*cell+5,cell-10,cell-10);
}

function drawPassengers(){
  passengers.forEach(p=>{
    if(p.waiting&&!p.pickedUp){
      ctx.fillStyle="orange";
      ctx.beginPath();
      ctx.arc(p.pos.x*cell+cell/2,p.pos.y*cell+cell/2,cell/4,0,Math.PI*2);
      ctx.fill();
    }
  });
}

function render(){
  drawGrid();
  drawPlayer();
  drawPassengers();
}

function rollDice(){
  return 1+Math.floor(Math.random()*6);
}

function checkPassengerPickup(){
  const jeepPos=player.pos;
  passengers.forEach(p=>{
    const dx=Math.abs(jeepPos.x-p.pos.x);
    const dy=Math.abs(jeepPos.y-p.pos.y);
    if(p.waiting&&!p.pickedUp&&dx+dy===1){
      p.pickedUp=true;
      p.waiting=false;
      score+=1;
      console.log(`Picked up passenger at station ${p.id}! Score: ${score}`);
    }
  });
}

function animateMove(player,steps,callback){
  let step=0;
  function moveStep(){
    player.roadIndex=(player.roadIndex+1)%ROAD.length;
    player.pos=ROAD[player.roadIndex];
    render();
    const intersection=INTERSECTIONS.find(i=>i.pos.x===player.pos.x&&i.pos.y===player.pos.y);
    if(intersection){
      player.choicePending=true;
      player.remainingSteps=steps-step-1;
      highlightOptions(intersection.options);
      return;
    }
    step++;
    if(step<steps){
      setTimeout(moveStep,200);
    } else {
      if(callback) callback();
    }
  }
  moveStep();
}

function animateBranch(path,callback){
  let step = 1;
  function moveStep(){
    player.pos = path[step];
    render();
    step++;
    if(step < path.length){
      setTimeout(moveStep,200);
    } else {
      
      const idx = ROAD.findIndex(t=>t.x===player.pos.x && t.y===player.pos.y);
      if(idx !== -1) player.roadIndex = idx;

      if(player.remainingSteps > 0){
        animateMove(player, player.remainingSteps, ()=>{
          checkPassengerPickup();
          render();
          rolling = false;
          document.getElementById('rollBtn').disabled = false;
        });
      } else {
        checkPassengerPickup();
        render();
        rolling = false;
        document.getElementById('rollBtn').disabled = false;
      }

      if(callback) callback();
    }
  }
  moveStep();
}

function highlightOptions(options){
  options.forEach(opt=>{
    const tile=opt.path[1];
    ctx.fillStyle="lime";
    ctx.fillRect(tile.x*cell+1,tile.y*cell+1,cell-2,cell-2);
  });
}

canvas.addEventListener('click',(e)=>{
  if(!player.choicePending) return;
  const rect=canvas.getBoundingClientRect();
  const x=Math.floor((e.clientX-rect.left)/cell);
  const y=Math.floor((e.clientY-rect.top)/cell);
  const intersection=INTERSECTIONS.find(i=>i.pos.x===player.pos.x&&i.pos.y===player.pos.y);
  if(!intersection) return;
  const chosen=intersection.options.find(opt=>opt.path[1].x===x&&opt.path[1].y===y);
  if(chosen){
    player.choicePending=false;
    animateBranch(chosen.path,()=>{
    });
  }
});

let rolling=false;
document.getElementById('rollBtn').addEventListener('click',()=>{
  if(rolling) return;
  rolling=true;
  document.getElementById('rollBtn').disabled=true;
  const steps=rollDice();
  animateMove(player,steps,()=>{
    checkPassengerPickup();
    render();
    rolling=false;
    document.getElementById('rollBtn').disabled=false;
  });
});

spawnPassengers();
render();
