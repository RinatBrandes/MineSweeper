"use strict";
//ToDo:
//set the right order for the function
//see if there is ant duplicate function
//remove the "
//change the size of the bord accourding to the mat size
//footer - there is problem with left
//the safe button is not finish, he is not showing the number and there isnt number for the user
//something happend to the hint
var gBoard;
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
var gGameCounter = 0;
var gGameInterval = 0;
var gHearts = 3;
var gHints = {
  qty: 3,
  isOn: false,
};
var gHintsTimeout;
var gHintNeighbors;
var gSafeClick = 3;
var gLocation;

const MINE_IMG =
  '<img src="/assets/mine.svg"  alt="mine img" width="50%" height="50%">';
const FLAG_IMG =
  '<img src="/assets/safeFlag.svg"  alt="mine img" width="50%" height="50%">';
const EMPTY = "";
const LEFT_BUTTON = 0;
const RIGHT_BUTTON = 2;

function initGame() {
  resetAll();
  gBoard = buildBoard();
  gBoard = setMineNegsCount(gBoard);
  renderBoard(gBoard);
}

function buildBoard() {
  var board = createMat(gLevel.size);
  board = randomMine(board, gLevel.mines);
  return board;
}

function cellClicked(cellI, cellJ, clickType) {
  //if in the begining they press the hint the nest clicked is not the first any more
  if (!gGame.isOn && gGame.shownCount === 0 && gHints.qty === 3) {
    if (gHints.isOn) {
      
      expendCell(cellI, cellJ, clickType.button);
      gHints.isOn = false;
    } else {
      setFirstClick(cellI, cellJ, clickType.button);
      setStartGame();
    }
  } else {
    if (clickType.button === RIGHT_BUTTON) handelRightClick(cellI, cellJ);
    if (clickType.button === RIGHT_BUTTON && !gBoard[cellI][cellJ].isShown && !gBoard[cellI][cellJ].isMine)
      handelRightClick(cellI, cellJ);
    handelLeftClick(cellI, cellJ, clickType.button);
    checkEndGame();
  }
}

function setFirstClick(cellI, cellJ, clickType) {
  var currCellClicked = gBoard[cellI][cellJ];
  var emptyLocation = {};
  //if its the first click we check if we are standing on mine or number
  if (!gGame.isOn) {
    if (clickType === LEFT_BUTTON && currCellClicked.isMine) {
      emptyLocation = firstClick(gBoard, cellI, cellJ);
      openEmptyLocation(emptyLocation);
    } else if (
      clickType === LEFT_BUTTON &&
      currCellClicked.minesAroundCount > 0
    ) {
      renderAround(cellI, cellJ, getCellHtml(currCellClicked.minesAroundCount));
    } else if (clickType === RIGHT_BUTTON) {
      handelRightClick(cellI, cellJ);
    } else {
      renderAround(cellI, cellJ, EMPTY);
    }
  }
  gGame.isOn = true;
}

function handelLeftClick(cellI, cellJ, clickType) {
  if (!gBoard[cellI][cellJ].isShown) {
    if (gHints.isOn && clickType === LEFT_BUTTON) {
      debugger
      expendCell(cellI, cellJ, clickType);

      gHints.isOn = false;
    } else {
      var currCell = gBoard[cellI][cellJ];
      if (currCell.isMine && !gHints.isOn) {
        if (gHearts > 0) {
          //still can open main
          handelHearts();
          handelMineLeft(1);

          //i dont know if when i press first mine i need only to open him or around
          // renderCell({ i: cellI, j: cellJ }, MINE_IMG);
          // removeClassName({ i: cellI, j: cellJ });
          renderAround(cellI, cellJ, MINE_IMG);
          if (gHearts === 0) {
            minesEndGame({ i: cellI, j: cellJ }, MINE_IMG);
          }
        } else {
          minesEndGame({ i: cellI, j: cellJ }, MINE_IMG);
        }
      } else if (currCell.minesAroundCount > 0) {
        renderAround(cellI, cellJ, getCellHtml(currCell.minesAroundCount));
      } else if (currCell.minesAroundCount === 0) {
        renderAround(cellI, cellJ, EMPTY);
      }
    }
  }
}

function expendCell(cellI, cellJ) {
  
  showHintsNeighbors(gBoard, cellI, cellJ);
}

function handelMineLeft(num) {
  var elMinesLeft = document.querySelector(".mines-left span");
  elMinesLeft.innerText = gLevel.mines - num;
}

function handelHearts() {
  gHearts--;

  if (gHearts === 2) {
    var selector = ".oneHr";
  } else if (gHearts === 1) {
    selector = ".twoHr";
  } else {
    selector = ".threeHr";
  }
  console.log("selector", selector);
  var elBtnImg = document.querySelector(selector);
  console.log("elBtnImg", elBtnImg);
  elBtnImg.innerHTML = `<span><img src="assets/life.svg" width="40px" height="40px"/>`;
}

function handelHints() {
  if (gHints.qty === 3) {
    var selector = ".oneHi";
  } else if (gHints.qty === 2) {
    selector = ".twoHi";
  } else if (gHints.qty === 1) {
    selector = ".threeHi";
  } else {
    var elMsg = document.querySelector(".usr-msg");
    elMsg.innerText = "You are out of hints";
    return;
  }
  gHints.qty--;
  gHints.isOn = true;
  console.log("gHints.isOn", gHints.isOn);

  var elBtnImg = document.querySelector(selector);
  elBtnImg.innerHTML = `<span><img src="assets/hint.svg" width="40px" height="40px"/>`;
}

function minesEndGame(location, value) {
  var endGameMsg = "You lose the game";
  var elGameBtn = document.querySelector(".toggle-game span");
  var sad = `<span><img src="assets/sad.svg" width="50px" height="50px"/></span>`;
  elGameBtn.innerHTML = sad;
  setEndGame(endGameMsg);
  renderCell({ i: location.i, j: location.j }, value);
  expandAllMine();
}

function renderAround(cellI, cellJ, value) {
  gBoard[cellI][cellJ].isShown = true;
  if (!gHints.isOn) gGame.shownCount++;

  renderCell({ i: cellI, j: cellJ }, value);
  removeClassName({ i: cellI, j: cellJ });

  if (
    !gBoard[cellI][cellJ].isMine ||
    (gBoard[cellI][cellJ].isMine && gHints.isOn)
  )
    handelNeighbors({ i: cellI, j: cellJ });
}

function checkEndGame() {
  var cellQtyNeeded = Math.pow(gLevel.size, 2);
  var flagsQty = 0;
  var tmpHeartsCount = 3 - gHearts;
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      //if mine and flag on it or if (mine and shown and used qty of hearts
      if (
        (gBoard[i][j].isMine && gBoard[i][j].isMarked) ||
        gBoard[i][j].isShown ||
        (gBoard[i][j].isMine && gBoard[i][j].isShown && tmpHeartsCount > 0)
      ) {
        flagsQty += 1;
        tmpHeartsCount--;
      }
    }
  }

  if (cellQtyNeeded === flagsQty) {
    console.log("End game");
    updateBestScore();
    var endGameMsg = "You win the game";
    setEndGame(endGameMsg);
  }
}

function setEndGame(msg) {
  gGame.isOn = false;
  var elEndMsg = document.querySelector(".usr-msg");
  console.log("elEndMsg", elEndMsg);
  elEndMsg.innerText = msg;
  clearInterval(gGameInterval);
}

function handelRightClick(cellI, cellJ) {
  
  if (!gGame.isOn) gGame.isOn = true;
  if (gBoard[cellI][cellJ].isMarked) {
    gBoard[cellI][cellJ].isMarked = false;
    renderCell({ i: cellI, j: cellJ }, EMPTY);
    handelMineLeft(1);
  } else {
    gBoard[cellI][cellJ].isMarked = true;
    gGame.markedCounte++;
    console.log('cellI',cellI );
    console.log('cellJ', cellJ);
    var elCell = document.querySelector(`.cell-${cellI}-${cellJ}`);
    console.log('elCell',elCell );
    console.log('FLAG_IMG', FLAG_IMG);
    elCell.innerHTML = FLAG_IMG;
    // renderCell({ i: cellI, j: cellJ }, FLAG_IMG);
    console.log('handle right click - else');
    handelMineLeft(gGame.markedCounte);
  }
}

function openEmptyLocation(location) {
  removeClassName(location);

  //mark the new location
  gBoard[location.i][location.j].isShown = true;
  if (!gHints.isOn) gGame.shownCount++;
  handelNeighbors(location);
}

function removeClassName(location) {
  var className = getClassName(location);
  var elCell = document.querySelector(`.${className}`);
  elCell.classList.remove("hide");
}

function addClassName(location = gLocation) {
  var className = getClassName(location);
  var elCell = document.querySelector(`.${className}`);
  elCell.classList.add("hide");
}

function handelNeighbors(location) {
  var neighbors = [];
  neighbors = searchNeighbors(gBoard, location.i, location.j);

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

    if (!gHints.isOn) neighbor.isShown = true;
    if (!gHints.isOn) gGame.shownCount++;

    if (neighbor.isMine && gHints.isOn) {
      renderCell({ i: neighboeCellI, j: neighboeCellJ }, MINE_IMG);
      removeClassName({ i: neighboeCellI, j: neighboeCellJ });
    } else if (neighbor.minesAroundCount === 0) {
      renderCell({ i: neighboeCellI, j: neighboeCellJ }, EMPTY);
      removeClassName({ i: neighboeCellI, j: neighboeCellJ });
    } else {
      renderCell(
        { i: neighboeCellI, j: neighboeCellJ },
        `<img src="assets/${neighbor.minesAroundCount}.svg" width="40%" height="40%"/>`
      );
      removeClassName({ i: neighboeCellI, j: neighboeCellJ });
    }
  }
}

function getCellHtml(num) {
  return `<img src="assets/${num}.svg" width="40%" height="40%"/>`;
}

function firstClick(board, cellI, cellJ) {
  //if first click search for new empty cell
  var cell = board[cellI][cellJ];
  var emptyLocations = [];

  if (cell.isMine) {
    emptyLocations = getEmptyLocations(board);
    var emptyLocation = getRandomEmptyLocation(emptyLocations);
    return emptyLocation;
  }
}

function setStartGame() {
  handelMineLeft(0);
  gGameInterval = setInterval(startGameCounter, 1000);
}

function startGameCounter() {
  gGame.secsPassed++;
  var elGameCounter = document.querySelector(".game-counter span");
  elGameCounter.innerText = gGame.secsPassed.toString().padStart(3, "0");
}
