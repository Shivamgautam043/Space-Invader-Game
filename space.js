//total size of the board
let tileSize = 32 * 1.45;
let rows = 16 * 1.45;
let columns = 16 * 1.45;
let isSingle = false;

let board;
let boardWidth = tileSize * columns; // 32 * 16
let boardHeight = tileSize * rows; // 32 * 16
let context;
let round = 1;
//ship ki height and width
let shipWidth = tileSize * 2.5;
let shipHeight = tileSize * 2.5;
let shipX = boardWidth / 2 - tileSize;
let shipY = boardHeight - tileSize * 2.5;

// yeh ship ka object hai containing its all detail
let ship = {
  x: shipX,
  y: shipY,
  width: shipWidth,
  height: shipHeight,
};

let shipImg;
let shipVelocityX = tileSize; //ship moving speed

//aliens ki properties
let alienArray = [];
let alienWidth = tileSize * 1.5;
let alienHeight = tileSize * 1.2;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; //number of aliens to defeat
let alienVelocityX = 1; //alien moving speed

//bullets
let bulletArray = [];
let bulletArray2 = [];
let bulletArray3 = [];
let bulletVelocityY = -10; //bullet moving speed

let score = 0;
let gameOver = false;
// -----------------------------------------------------------------------------------------
// when the page loads
window.onload = function () {
  board = document.getElementById("board");
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext("2d"); //used for drawing on the board

  //draw initial ship
  //load images
  shipImg = new Image();
  shipImg.src = "./ironman.png";
  shipImg.onload = function () {
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
  };

  alienImg = new Image();
  alienImg.src = "./alien.png";
  createAliens();

  requestAnimationFrame(update);
  document.addEventListener("keydown", moveShip);
  document.addEventListener("keyup", shoot);
  document.addEventListener("keyup", changeSingle);
  document.addEventListener("click", handleClick);
  //   document.addEventListener("keydown", shoot);
  //   if i make the shoot to the keydown then it will shoot like a lazer beam😂😂😂😂😂
};

function update() {
  requestAnimationFrame(update);

  if (gameOver) {
    return;
  }

  context.clearRect(0, 0, board.width, board.height);

  //ship
  context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

  //alien
  for (let i = 0; i < alienArray.length; i++) {
    let alien = alienArray[i];
    if (alien.alive) {
      alien.x += alienVelocityX;

      //if alien touches the borders
      if (alien.x + alien.width >= board.width || alien.x <= 0) {
        alienVelocityX *= -1;
        alien.x += alienVelocityX * 2;

        //move all aliens up by one row
        for (let j = 0; j < alienArray.length; j++) {
          alienArray[j].y += alienHeight;
        }
      }
      context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

      if (alien.y >= ship.y) {
        gameOver = true;
      }
    }
  }

  //bullets
  for (let i = 0; i < bulletArray.length; i++) {
    let bullet = bulletArray[i];
    bullet.y += bulletVelocityY;
    context.fillStyle = "white";
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

    //bullet collision with aliens
    for (let j = 0; j < alienArray.length; j++) {
      let alien = alienArray[j];
      if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
        bullet.used = true;
        alien.alive = false;
        alienCount--;
        score += 100;
      }
    }
  }
  // this code is done by mr robot
  if (isSingle) {
    bulletArray2 = [];
    bulletArray3 = [];
  }

  //bullets
  for (let i = 0; i < bulletArray2.length; i++) {
    let bullet = bulletArray2[i];
    bullet.y += bulletVelocityY;
    bullet.x += bulletVelocityY * 0.2;
    context.fillStyle = "white";
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

    //bullet collision with aliens
    for (let j = 0; j < alienArray.length; j++) {
      let alien = alienArray[j];
      if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
        bullet.used = true;
        alien.alive = false;
        alienCount--;
        score += 100;
      }
    }
  }

  //bullets
  for (let i = 0; i < bulletArray3.length; i++) {
    let bullet = bulletArray3[i];
    bullet.y += bulletVelocityY;
    bullet.x += bulletVelocityY * -0.2;
    context.fillStyle = "white";
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

    //bullet collision with aliens
    for (let j = 0; j < alienArray.length; j++) {
      let alien = alienArray[j];
      if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
        bullet.used = true;
        alien.alive = false;
        alienCount--;
        score += 100;
      }
    }
  }

  //clear bullets
  while (
    bulletArray.length > 0 &&
    (bulletArray[0].used || bulletArray[0].y < 0)
  ) {
    bulletArray.shift(); //removes the first element of the array
  }

  while (
    bulletArray2.length > 0 &&
    (bulletArray2[0].used || bulletArray2[0].y < 0)
  ) {
    bulletArray2.shift(); //removes the first element of the array
  }

  while (
    bulletArray3.length > 0 &&
    (bulletArray3[0].used || bulletArray3[0].y < 0)
  ) {
    bulletArray3.shift(); //removes the first element of the array
  }

  //next level
  if (alienCount == 0) {
    round++;
    //increase the number of aliens in columns and rows by 1
    playKillingSpreeSound();

    alienColumns = Math.min(alienColumns + 1, columns / 2 - 2); //cap at 16/2 -2 = 6
    alienRows = Math.min(alienRows + 1, rows - 4); //cap at 16-4 = 12
    if (alienVelocityX > 0) {
      alienVelocityX += 1; //increase  alien movement speed towards  right
    } else {
      alienVelocityX -= 1; //increase  alien movement speed towards  left
    }
    alienArray = [];
    bulletArray = [];
    bulletArray2 = [];
    bulletArray3 = [];

    createAliens();
  }

  //score
  context.fillStyle = "white";
  context.font = "32px courier";
  context.fillText("Score:" + score, 15, 25);

  context.fillStyle = "white";
  context.font = "24px courier";
  context.fillText("Change Gun🔫", 15, 75);

  context.fillStyle = "white";
  context.font = "32px courier";
  context.fillText("Round:" + round, 915, 25);

  context.fillStyle = "white";
  context.font = "30px courier";
  context.fillText("Sabka badla lega tera tony", 315, 25);
}

function moveShip(e) {
  if (gameOver) {
    return;
  }

  if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
    ship.x -= shipVelocityX * 0.2; //move left one tile
  } else if (
    e.code == "ArrowRight" &&
    ship.x + shipVelocityX + ship.width <= board.width
  ) {
    ship.x += shipVelocityX * 0.2; //move right one tile
  }
}

function createAliens() {
  for (let c = 0; c < alienColumns; c++) {
    for (let r = 0; r < alienRows; r++) {
      let alien = {
        img: alienImg,
        x: alienX + c * alienWidth,
        y: alienY + r * alienHeight,
        width: alienWidth,
        height: alienHeight,
        alive: true,
      };
      alienArray.push(alien);
    }
  }
  alienCount = alienArray.length;
}

function changeSingle(e) {
  if (e.code == "KeyC") {
    isSingle = !isSingle;
    console.log("change to:" + isSingle);
  }
}

function shoot(e) {
  if (gameOver) {
    return;
  }

  if (e.code == "Space") {
    playKShootSound();
    //shoot
    let bullet1 = {
      x: ship.x + (shipWidth * 15) / 32 - 26,
      y: ship.y - 20,
      width: tileSize / 4,
      height: tileSize / 1,
      used: false,
    };
    bulletArray.push(bullet1);

    let bullet2 = {
      x: ship.x + (shipWidth * 15) / 32 - 26,
      y: ship.y - 20,
      width: tileSize / 4,
      height: tileSize / 1,
      used: false,
    };
    bulletArray2.push(bullet2);

    let bullet3 = {
      x: ship.x + (shipWidth * 15) / 32 - 26,
      y: ship.y - 20,
      width: tileSize / 4,
      height: tileSize / 1,
      used: false,
    };
    bulletArray3.push(bullet3);
  }
}

function detectCollision(a, b) {
  const collision =
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;

  if (collision) {
    playBlastSound();
  }

  return collision;
}

function playBlastSound() {
  const blastSound = new Audio("./hit.wav");
  blastSound.play();
}

function playKillingSpreeSound() {
  const killingSound = new Audio("./killing-spree.mp3");
  killingSound.play();
}
function playKShootSound() {
  const shootSound = new Audio("./blaster.mp3");
  shootSound.play();
}

function handleClick(event) {
  // Get the canvas element
  const canvas = document.getElementById("board");

  const clickX = event.clientX - canvas.getBoundingClientRect().left;
  const clickY = event.clientY - canvas.getBoundingClientRect().top;

  const textBoundingBox = {
    x: 15,
    y: 55,
    width: context.measureText("Change Gun").width,
    height: 32, // Assuming font size is 32px
  };

  if (
    clickX >= textBoundingBox.x &&
    clickX <= textBoundingBox.x + textBoundingBox.width &&
    clickY >= textBoundingBox.y &&
    clickY <= textBoundingBox.y + textBoundingBox.height
  ) {
    let e = {
      code: "KeyC",
    };
    changeSingle(e);
  }
}
