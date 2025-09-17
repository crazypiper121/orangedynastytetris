// Dark Tetris with Levels, Score, Oranges 🍊

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const linesEl = document.getElementById("lines");
const orangesEl = document.getElementById("oranges");

const ROWS = 20;
const COLS = 10;
const BLOCK = 24;

canvas.width = COLS * BLOCK;
canvas.height = ROWS * BLOCK;

let board;
let current;
let dropStart;
let gameOver;
let score;
let level;
let linesThisLevel;
let oranges;

const colors = [
  "#e67e22", "#f39c12", "#d35400",
  "#3498db", "#9b59b6", "#2ecc71", "#e74c3c"
];

const SHAPES = {
  I: [[1,1,1,1]],
  J: [[1,0,0],[1,1,1]],
  L: [[0,0,1],[1,1,1]],
  O: [[1,1],[1,1]],
  S: [[0,1,1],[1,1,0]],
  T: [[0,1,0],[1,1,1]],
  Z: [[1,1,0],[0,1,1]]
};

const PIECES = Object.keys(SHAPES);

function randomPiece() {
  const key = PIECES[Math.floor(Math.random() * PIECES.length)];
  return new Piece(SHAPES[key], colors[Math.floor(Math.random()*colors.length)]);
}

class Piece {
  constructor(shape,color){
    this.shape=shape;this.color=color;
    this.x=3;this.y=-2;
  }
  draw(ctx){
    this.shape.forEach((row,r)=>{
      row.forEach((val,c)=>{
        if(val){
          ctx.fillStyle=this.color;
          ctx.fillRect((this.x+c)*BLOCK,(this.y+r)*BLOCK,BLOCK-1,BLOCK-1);
          ctx.strokeStyle="#111";
          ctx.strokeRect((this.x+c)*BLOCK,(this.y+r)*BLOCK,BLOCK-1,BLOCK-1);
        }
      });
    });
  }
  move(p){
    this.x+=p.x;this.y+=p.y;
    if(this.collision()){this.x-=p.x;this.y-=p.y;return false;}
    return true;
  }
  collision(){
    return this.shape.some((row,r)=>
      row.some((val,c)=>{
        if(!val) return false;
        let nx=this.x+c,ny=this.y+r;
        return nx<0||nx>=COLS||ny>=ROWS||(ny>=0&&board[ny][nx]);
      })
    );
  }
  lock(){
    this.shape.forEach((row,r)=>{
      row.forEach((val,c)=>{
        if(val){
          let nx=this.x+c,ny=this.y+r;
          if(ny<0){gameOver=true;}
          else board[ny][nx]=this.color;
        }
      });
    });
    clearLines();
  }
  rotate(){
    const rotated=this.shape[0].map((_,i)=>
      this.shape.map(row=>row[i]).reverse());
    let old=this.shape;
    this.shape=rotated;
    if(this.collision()) this.shape=old;
  }
}

function resetGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(""));
  current = randomPiece();
  dropStart = Date.now();
  gameOver = false;
  score = 0;
  level = 1;
  linesThisLevel = 0;
  oranges = 0;
}

function clearLines(){
  let cleared = 0;
  for(let r=ROWS-1;r>=0;r--){
    if(board[r].every(cell=>cell!=="")){
      board.splice(r,1);
      board.unshift(Array(COLS).fill(""));
      cleared++;
      r++;
    }
  }
  if (cleared>0) {
    score += cleared * 100;
    linesThisLevel += cleared;
    if (linesThisLevel >= 5) {
      level++;
      oranges += 5;
      linesThisLevel = 0;
    }
  }
}

function drawBoard(){
  board.forEach((row,r)=>{
    row.forEach((col,c)=>{
      ctx.fillStyle=col||"#1a1a1a";
      ctx.fillRect(c*BLOCK,r*BLOCK,BLOCK,BLOCK);
      ctx.strokeStyle="#111";
      ctx.strokeRect(c*BLOCK,r*BLOCK,BLOCK,BLOCK);
    });
  });
}

function updateStats(){
  scoreEl.textContent = score;
  levelEl.textContent = level;
  linesEl.textContent = `${linesThisLevel} / 5`;
  orangesEl.textContent = `${oranges} 🍊`;
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawBoard();
  current.draw(ctx);
  updateStats();
  if(gameOver){
    ctx.fillStyle="rgba(0,0,0,0.8)";
    ctx.fillRect(0,canvas.height/2-30,canvas.width,60);
    ctx.fillStyle="white";
    ctx.font="18px sans-serif";
    ctx.textAlign="center";
    ctx.fillText("Game Over!",canvas.width/2,canvas.height/2);
  }
}

function drop(){
  if(!gameOver){
    let now=Date.now();
    let interval=700-(level-1)*30;
    if(interval<150) interval=150;
    if(now-dropStart>interval){
      if(!current.move({x:0,y:1})){
        current.lock();
        current=randomPiece();
      }
      dropStart=now;
    }
  }
  draw();
  requestAnimationFrame(drop);
}

document.addEventListener("keydown",e=>{
  if(gameOver) return;
  if(e.key==="ArrowLeft") current.move({x:-1,y:0});
  else if(e.key==="ArrowRight") current.move({x:1,y:0});
  else if(e.key==="ArrowDown") current.move({x:0,y:1});
  else if(e.key===" "){while(current.move({x:0,y:1}));current.lock();current=randomPiece();}
  else if(e.key==="ArrowUp") current.rotate();
});

// Mobile Buttons
document.getElementById("left").onclick=()=>current.move({x:-1,y:0});
document.getElementById("right").onclick=()=>current.move({x:1,y:0});
document.getElementById("down").onclick=()=>current.move({x:0,y:1});
document.getElementById("drop").onclick=()=>{while(current.move({x:0,y:1}));current.lock();current=randomPiece();};
document.getElementById("rotate").onclick=()=>current.rotate();
document.getElementById("restart").onclick=()=>resetGame();

resetGame();
drop();