//  renju-drawing.js:
//    This file defines game board and stone drawing functions
//  ==========================================================================

//  Note:
//  *)  Know the difference among viewport coordinates, document coordinates and canvas position:
//    1)  Viewport coordinates: a.k.a window coordinates. It's relative position to current viewport.
//    2)  Viewport coordinates: It's absolute position to the current document.
//    3)  Canvas position: It's relative position to the canvas, and the top-left point of canvas has canvas position (0,0);

//  *)  Play the game:
//    1)  User put a stone
//    2)  Machine calculate the most proper place(There maybe more than one choices based on points, if so, a random pos will be chosen. This makes the game more fun because you may get different route by following the same pattern.) and put a stone.
//    3)  User action, and then machine action until game is over(either side has 5 stones in line first)
//

window.onload = function() {
  canvas = document.getElementById("board");
  context = canvas.getContext("2d");
 
  //displayRectInfo(rect);  // default: 300*150
  
  context.canvas.width = (GRID_SIZE-1) * UNIT_SIZE + GAP_SIZE * 2;
  context.canvas.height = (GRID_SIZE-1) * UNIT_SIZE + GAP_SIZE * 2;
  
  //var rect = canvas.getBoundingClientRect();    // viewport coordinates
  //console.log("\n=== Viewport Coordinates of Canvas ===");
  //displayRectInfo(rect);
  
  board.init(GRID_SIZE);
  drawBoard(GRID_SIZE);
  $('fieldset').css({
    width:  context.canvas.width,
  });
  canvas.addEventListener("click", fClick, false);
  $('#restart').click(fRestart);
  // initialization
  hd = null;
  lastBoardPos = null;
  flash = false;
};



//  Return canvas position from board position ((0,0) => (size,size))
//  This is used to locate the center of each stone
function getCanvasPos(boardPos) {
  var cx = boardPos.x * UNIT_SIZE + GAP_SIZE;
  var cy = boardPos.y * UNIT_SIZE + GAP_SIZE;
  return {x: cx, y: cy};
}

function distance(posA, posB) {
  var a = posB.x - posA.x;
  var b = posB.y - posA.y;
  
  return Math.sqrt(a*a + b*b);
}

function playSound(soundFile) {
  var audio = document.getElementById("audio");
  if (!audio.src) {
    audio.src = soundFile;
  }
  audio.play();
}

//  Given viewport coordinates, return:
//  *)  Board position ((0,0) => (size,size)) if mouse click is within stone circle area.
//  *)  null if mouse click is out of stone circle area
function getBoardPos(vpc) {
  var canvasPos = viewportToCanvasPos(vpc, canvas);
    
  // transformed canvasPos for calculating borad position
  var px = canvasPos.x - GAP_SIZE + UNIT_SIZE/2;
  var py = canvasPos.y - GAP_SIZE + UNIT_SIZE/2;
  
  //var boardPos = {x: Math.floor(px/UNIT_SIZE), y: Math.floor(py/UNIT_SIZE)};
  var boardPos = board.getPosition(Math.floor(px/UNIT_SIZE), Math.floor(py/UNIT_SIZE));
  //console.log("Board position:");
  //boardPos.displayInfo();
  
  // calculate the distance(straight line) between canvasPos and the canvasPos of boardPos
  if (distance(canvasPos, getCanvasPos(boardPos)) <= STONE_RADIUS) {
    return boardPos;
  } else {
    return null;
  }
}

// convert viewport coordinates to document coordinates
function viewportToDocumentCoordinates(vpc) {
  return {x: vpc.x + window.pageXOffset,
          y: vpc.y + window.pageYOffset};
}
// convert viewport coordinates to canvas position
function viewportToCanvasPos(vpc) {
  var rect = canvas.getBoundingClientRect();
  return {x: vpc.x - Math.round(rect.left),
          y: vpc.y - Math.round(rect.top)};
}

function displayRectInfo(rect) {
  console.log("\nRect left-top: ("
              + rect.left + ", " + rect.top + "), right-bottom: ("
              + rect.right + ", " + rect.bottom + ")");
}

function fRestart() {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  drawBoard(GRID_SIZE);
  board.reset();
}

// It's better to use document coordinates instead of window(viewport) coordinates.
function fClick(event) {
    var viewportPos = {x: event.clientX, y: event.clientY};

    // Find the nearest crossing point based on click, and put a stone there
    var centre = getBoardPos(viewportPos);
    if (centre && centre.isBlank()) {
      putStone(centre, FIRST_PLAYER);
      if (board.isGameOver(FIRST_PLAYER)) {
        alert("Game over: " + FIRST_PLAYER + " wins!");
      } else {
        // machine action
        var nextPosAttack = board.getBestPosition(SECOND_PLAYER);  // attack: side == player side
        var nextPosDefend = board.getBestPosition(FIRST_PLAYER);   // defend: side == opponent side
        // choose the better one
        var nextPos = _getBetterPos(nextPosAttack, nextPosDefend, SECOND_PLAYER);
        if (nextPos) {
          // TODO: wait until the last putStone audio event is done!!
          putStone(nextPos, SECOND_PLAYER);
          if (board.isGameOver(SECOND_PLAYER)) {
            alert("Game over: " + SECOND_PLAYER + " wins!");
          }
        }
      }
    }
    
    //  TODO: try a demo of machine vs machine using the strategy!
}

function _getBetterPos(posAttack, posDefend, side) {
  // defend is major
  if (posAttack.getPriority(side) <= posDefend.getPriority(_getOpponentColor(side))) {
    return posDefend;
  } else {
    return posAttack;
  }
}

function _getOpponentColor(color) {
  if (color === FIRST_PLAYER) {
    return SECOND_PLAYER;
  } else if (color === SECOND_PLAYER) {
    return FIRST_PLAYER;
  }
  return "unknown color";
}

// puts a stone on the board position ((0,0) => (size,size)) with color
function putStone(boardPos, color) {
  /*
  if (lastBoardPos) {
    clearInterval(hd);
    drawCircle(getCanvasPos(lastBoardPos), STONE_RADIUS, _getOpponentColor(color));
  }
  hd = setInterval(drawCircle, 300, getCanvasPos(boardPos), STONE_RADIUS, color);
  lastBoardPos = boardPos;
  */
  drawCircle(getCanvasPos(boardPos), STONE_RADIUS, color);
  playSound("./audio/put_stone.mp3");
  
  boardPos.setValue(color);
  var rec = board.getImpactedRec(boardPos);
  board.updatePriorities(rec.left, rec.top, rec.right, rec.bottom);
}

//  Draw board by grid size
function drawBoard(size) {
  if (size <= 1) {
    alert("Specified grid size MUST >= 2!");
    return;
  }
  
  var startx = GAP_SIZE;
  var starty = GAP_SIZE;

  for (var row = 0; row < size; ++row) {
    for (var col = 0; col < size; ++col) {
      drawLine(startx, starty + UNIT_SIZE*row, startx + UNIT_SIZE*(size-1), starty + UNIT_SIZE*row);
      drawLine(startx + UNIT_SIZE*col, starty, startx + UNIT_SIZE*col, starty + UNIT_SIZE*(size-1));
    }
  }
  for (var row = 0; row < size; ++row) {
    var patch = 0;
    if (row >= 10) {
      patch = GAP_SIZE/8;
    }
    drawText(row, GAP_SIZE/8*3-patch, GAP_SIZE/7*8+UNIT_SIZE*row);
  }
  for (var col = 0; col < size; ++col) {
    var patch = 0;
    if (col >= 10) {
      patch = GAP_SIZE/8;
    }
    drawText(col, GAP_SIZE/8*7+UNIT_SIZE*col-patch, GAP_SIZE/3*2);
  }
  
  // mark the center an key positions
  var radius  = STONE_RADIUS/3;
  var color   = "black";
  drawCircle(getCanvasPos(board.getPosition((GRID_SIZE-1)/2, (GRID_SIZE-1)/2)), radius, color);
  drawCircle(getCanvasPos(board.getPosition(WIN_SIZE-1, WIN_SIZE-1)), radius, color);
  drawCircle(getCanvasPos(board.getPosition(GRID_SIZE-WIN_SIZE, WIN_SIZE-1)), radius, color);
  drawCircle(getCanvasPos(board.getPosition(WIN_SIZE-1, GRID_SIZE-WIN_SIZE)), radius, color);
  drawCircle(getCanvasPos(board.getPosition(GRID_SIZE-WIN_SIZE, GRID_SIZE-WIN_SIZE)), radius, color);
}

function drawLine(startx, starty, endx, endy) {
  context.beginPath();
  context.moveTo(startx, starty);
  context.lineTo(endx, endy);
  context.lineWidth = LINE_WIDTH;
  context.stroke();
}

function drawCircle(centre, radius, color) {
  context.beginPath();
  context.arc(centre.x, centre.y, radius, degreesToRadians(360), 0, true);
  context.closePath();
  
  context.lineWidth = LINE_WIDTH;
  context.stroke();
  
  //if (flash) {
  //  context.fillStyle = "red";
  //} else {
    context.fillStyle = color;
  //}
  context.fill();
  //flash = !flash;
}

function drawText(text, x, y) {
  context.fillStyle = "sienna";
  context.font      = "bold 1em ChunkFive";
  context.fillText(text, x, y);
}

function degreesToRadians(degrees) {
    return (degrees * Math.PI)/180;
}