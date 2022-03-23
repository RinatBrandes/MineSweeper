"use strict";
//ToDo:
//set the size of the td
//

var gBoard;
var gLevel;
var gGame = {
  isOn: false,
  shownCount: 0,
  markedCounte: 0,
  secsPassed: 0,
};
var gLevel = {
  size: 4,
  mines: 2,
};
var gFirstClick = false;
var gGameCounter = 0;
var gGameInterval = 0;
var gHearts = 3;
var gHints = 3;

const MINE_IMG = "💥";
const FLAG_IMG = "🚩";
const EMPTY = "";
const LEFT_BUTTON = 0;
const RIGHT_BUTTON = 2;

function initGame() {
  gBoard = buildBoard();
  //    console.log('gBoard', gBoard);
  gBoard = setMineNegsCount(gBoard);
  //    console.log('gBoard', gBoard);
  renderBoard(gBoard);
}

function buildBoard() {
  var board = createMat(gLevel.size);
  // board = randomMine(board,gLevel.mines);
  return board;
}

function cellClicked(cellI, cellJ, clickType) {
  
  if (!gGame.isOn) {
    if (gGame.markedCounte > 0) setEndGame();
    else setStartGame();
  }

  if (clickType.button === RIGHT_BUTTON) handelRightClick(cellI, cellJ);
  if (clickType.button === LEFT_BUTTON)
    handelLeftClick(cellI, cellJ, clickType);
}

function setFirstClick(cellI, cellJ, clickType) {
    
  console.log("", clickType.button);
  var currCellClicked = gBoard[cellI][cellJ];
  var emptyLocation = {};
  //if its the first click we check if we are standing on mine or number
  if (!gGame.isOn) {
    if (
      (clickType.button === LEFT_BUTTON && currCellClicked.isMine) ||
      currCellClicked.minesAroundCount > 0
    ) {
      gGame.isOn = true;
      emptyLocation = firstClick(gBoard, cellI, cellJ);
      openEmptyLocation(emptyLocation);
    } else {
      gGame.isOn = true;
      renderAround(cellI, cellJ, EMPTY);
    }
  }
}

function handelLeftClick(cellI, cellJ, clickType) {
  if (!gGame.isOn) {
    setFirstClick(cellI, cellJ, clickType);
  } else {
    var currCell = gBoard[cellI][cellJ];
    if (currCell.isMine) {
      if (gHearts > 0) {
        //still can open main
        gHearts--;
        var elHearts = document.querySelector(".hearts span");
        elHearts.innerText = gHearts;

        renderAround(cellI, cellJ, MINE_IMG);
    
      } else {
        setStopGame();
        renderCell({ i: cellI, j: cellJ }, MINE_IMG);
      }
    } else if (currCell.minesAroundCount > 0) {
      renderAround(cellI, cellJ, getCellHtml(currCell.minesAroundCount));
    
    } else if (currCell.minesAroundCount === 0) {
      renderAround(cellI, cellJ, EMPTY);
      
    }
  }
}

function renderAround(cellI, cellJ, value) {
  renderCell({ i: cellI, j: cellJ }, value);
  handelClassName({ i: cellI, j: cellJ });
  handelNeighbors({ i: cellI, j: cellJ });
}

function setStopGame() {
  gGame.isOn = false;
  clearInterval(gGameInterval);
}

function handelRightClick(cellI, cellJ) {
  if (!gGame.isOn) gGame.isOn = true;
  if (gBoard[cellI][cellJ].isMarked) {
    gBoard[cellI][cellJ].isMarked = false;
    gGame.markedCounte--;
    renderCell({ i: cellI, j: cellJ }, EMPTY);
  } else {
    gBoard[cellI][cellJ].isMarked = true;
    gGame.markedCounte++;
    renderCell({ i: cellI, j: cellJ }, FLAG_IMG);
  }
}

function openEmptyLocation(location) {
  console.log("location", location);
  handelClassName(location);

  //mark the new location
  gBoard[location.i][location.j].isShown = true;
  gGame.shownCount++;
  handelNeighbors(location);
}

function handelClassName(location) {
  var className = getClassName(location);
  var elCell = document.querySelector(`.${className}`);
  elCell.classList.remove("hide");
}

function handelNeighbors(location) {
  
  var neighbors = [];
  neighbors = searchNeighbors(gBoard, location.i, location.j);
  console.log("neighbors", neighbors);
  if (neighbors) {
    openNeighbors(neighbors);
  } else {
    var currCell = gBoard[location.i][location.j];
    if (currCell.minesAroundCount > 0) {
      renderCell(
        { i: location.i, j: location.j },
        getCellHtml(currCell.minesAroundCount)
      );
    } else {
      renderCell(location, EMPTY);
    }
  }
}

function openNeighbors(neighbors) {
  for (var i = 0; i < neighbors.length; i++) {
    var neighboeCellI = neighbors[i].i;
    var neighboeCellJ = neighbors[i].j;
    var neighbor = gBoard[neighboeCellI][neighboeCellJ];

    neighbor.isShown = true;
    if (neighbor.minesAroundCount === 0) {
        
      renderCell({ i: neighboeCellI, j: neighboeCellJ }, EMPTY);
      handelClassName({ i: neighboeCellI, j: neighboeCellJ });
    } else {
      renderCell(
        { i: neighboeCellI, j: neighboeCellJ },
        getCellHtml(neighbor.minesAroundCount)
      );
      handelClassName({ i: neighboeCellI, j: neighboeCellJ });
    }
  }
}

function getCellHtml(num) {
  var color = setNumberColor(num);
  console.log("color", color);
  return `<span style="color:${color}">${num}</span>`;
}

function firstClick(board, cellI, cellJ) {
  //if first click search for new empty cell
  var cell = board[cellI][cellJ];
  var emptyLocations = [];

  if (cell.isMine || cell.minesAroundCount) {
    emptyLocations = getEmptyLocations(board);
    console.log("emptyLocations", emptyLocations);
    var emptyLocation = getRandomEmptyLocation(emptyLocations);
    return emptyLocation;
  }
}

function setStartGame() {
  gGame.shownCount++;
  var elHearts = document.querySelector(".hearts span");
  elHearts.innerText = gHearts;
  var elHints = document.querySelector(".hints span");
  elHints.innerText = gHints;

  gGameInterval = setInterval(startGameCounter, 1000);
}

function startGameCounter() {
  gGame.secsPassed++;
  //   console.log("gGame.secsPassed", gGame.secsPassed);
  var elGameCounter = document.querySelector(".game-counter span");
  //   console.log("elGameCounter", elGameCounter);
  elGameCounter.innerText = gGame.secsPassed.toString().padStart(3, "0");
}

function handelCell(cell) {
  cell.isShown = true;
}

function endGame() {
  clearInterval(gGameInterval);
}
