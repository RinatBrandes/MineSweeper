'use strict';

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
var gGameInterval = 0;
var gHearts = 3;
var gHints = {
  qty: 3,
  isOn: false,
};
var gHintsTimeout;
var gHintNeighbors;
var gSafeClick = {
  qty: 3,
  isOn: false,
};
var gSafeClickTimeOut;
var gLocation;
var gMines = 0;
var gUndos = [];
var undoIsOn = false;
var gUndoId = 1;

const MINE_IMG = '<img src="assets/mine.svg" width="50%" height="50%">';
const FLAG_IMG = `<img src="assets/safeFlag.svg" width="50%" height="50%"/>`;
const EMPTY = "";
const LEFT_BUTTON = 0;
const RIGHT_BUTTON = 2;

function initGame() {
  resetAll();
  gBoard = buildBoard();
  gBoard = getMineNegsCount(gBoard);
  renderBoard(gBoard);
}

function buildBoard() {
  var board = createMat(gLevel.size);
  board = getRandomMine(board, gLevel.mines);
  return board;
}

function renderBoard(board) {
  var strHTML = "";
  //Fordebug
  console.log("board", board);

  var tdSize = "";
  for (var i = 0; i < board.length; i++) {
    strHTML += "<tr>\n";
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];
      tdSize = ` td-${gLevel.size}`;
      var cellClass = getClassName({ i: i, j: j }) + tdSize;
      cellClass += " hide";
      strHTML +=
        '\t<td class="cell ' +
        cellClass +
        '"  onclick="cellClicked(' +
        i +
        "," +
        j +
        ',event)" onContextMenu="cellClicked(' +
        i +
        "," +
        j +
        ',event)"' +
        tdSize +
        ">\n<span>";

      if (currCell.minesAroundCount === 0) EMPTY;

      strHTML += "</span>\t</td>\n";
    }
    strHTML += "</tr>\n";
  }
  var elBoard = document.querySelector(".board");
  elBoard.innerHTML = strHTML;
}

function cellClicked(cellI, cellJ, clickType) {
  var buttonType = clickType.button;
  //if in the begining they press the hint the next clicked is not the first any more
  //if the didn't start and there are no open cell and
  if (!gGame.isOn && gGame.shownCount === 0 && gHints.qty === 3) {
    if (gHints.isOn) {
      expendHintsCells(cellI, cellJ, buttonType);
      gHints.isOn = false;
    } else {
      setFirstClick(cellI, cellJ, buttonType);
      setStartGame();
    }
  } else {
    //If its not first click on handel right or left click
    //if right and the currCell is not shown and its not mine
    if (buttonType === RIGHT_BUTTON && !gBoard[cellI][cellJ].isShown) {
      setRightClick(cellI, cellJ);
    } else {
      setLeftClick(cellI, cellJ, buttonType);
    }

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
      //if the current cell is number
      renderAround(cellI, cellJ, getCellHtml(currCellClicked.minesAroundCount));
    } else if (clickType === RIGHT_BUTTON) {
      //if right click
      setRightClick(cellI, cellJ);
    } else {
      //the first click is ok and we are rendering around
      renderAround(cellI, cellJ, EMPTY);
    }
  }
  gGame.isOn = true;
}

function firstClick(board, cellI, cellJ) {
  //if first click search for new empty cell
  var cell = board[cellI][cellJ];
  var emptyLocations = [];

  emptyLocations = getEmptyLocations(board);
  var emptyLocation = getRandomEmptyLocation(emptyLocations);
  return emptyLocation;
}

function setRightClick(cellI, cellJ) {
  if(!gGame.isOn) return;
  if (gBoard[cellI][cellJ].isMarked) {
    gBoard[cellI][cellJ].isMarked = false;
    renderCell({ i: cellI, j: cellJ }, EMPTY);
    gGame.markedCounte--;
    updateUndos(false, cellI, cellJ, "isMarked", true);
  } else {
    gBoard[cellI][cellJ].isMarked = true;
    gGame.markedCounte++;
    renderCell({ i: cellI, j: cellJ }, FLAG_IMG);
    updateUndos(false, cellI, cellJ, "isMarked", false);
  }
}

function setLeftClick(cellI, cellJ, buttonType) {
  if(!gGame.isOn) return;
  if (!gBoard[cellI][cellJ].isShown) {
    //if we are in hints mode //and left click
    if (gHints.isOn) {
      expendHintsCells(cellI, cellJ, buttonType);
      gHints.isOn = false;
    } else {
      var currCell = gBoard[cellI][cellJ];
      //If the is mine and we are not in hints mode
      if (currCell.isMine && !gHints.isOn) {
        //we check if there any hearts left
        if (gHearts > 0) {
          //still can open main
          currCell.isShown = true;
          gMines++;
          setMineLeft();
          setHearts();

          //i dont know if when i press first mine i need only to open him or around
          // renderAround(cellI, cellJ, MINE_IMG);
          renderCell({ i: cellI, j: cellJ }, MINE_IMG);
          removeClassName({ i: cellI, j: cellJ });
          updateUndos(false, cellI, cellJ, "isShown", false);
          if (gHearts === 0) minesEndGame({ i: cellI, j: cellJ }, MINE_IMG);
        } else {
          minesEndGame({ i: cellI, j: cellJ }, MINE_IMG);
        }
        //if the cell in number
      } else if (currCell.minesAroundCount > 0) {
        renderAround(cellI, cellJ, getCellHtml(currCell.minesAroundCount));

        //if the cell is empty
      } else if (currCell.minesAroundCount === 0) {
        renderAround(cellI, cellJ, EMPTY);
      }
    }
  }
}

function setHearts() {
  if (gHearts === 3) {
    var selector = ".oneHr";
  } else if (gHearts === 2) {
    selector = ".twoHr";
  } else {
    selector = ".threeHr";
  }
  gHearts--;

  var elBtnImg = document.querySelector(selector);
  elBtnImg.innerHTML = `<img src="assets/life.svg" width="40px" height="40px"/>`;
}

function setHints() {
  if (!gGame.isOn){
    var msg = 'The game didn\'t start';
    setUserMsg(msg);
    return;
  }
  var selector;
  if (gHints.qty === 3) {
    selector = ".oneHi";
  } else if (gHints.qty === 2) {
    selector = ".twoHi";
  } else if (gHints.qty === 1) {
    selector = ".threeHi";
  } else {
    var msg = "You are out of hints";
    setUserMsg(msg);
    return;
  }
  gHints.qty--;
  gHints.isOn = true;
  updateUndos(false, 0, 0, "useHint", 1);
  var elBtnImg = document.querySelector(selector);
  elBtnImg.innerHTML = `<img src="assets/hint.svg" width="40px" height="40px"/>`;
}
