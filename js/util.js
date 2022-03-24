"use strict";

function randomMine(board, mineQty) {
  for (var i = 0; i < mineQty; i++) {
    var cellI = getRandomInt(0, gLevel.size - 1);
    var cellJ = getRandomInt(0, gLevel.size - 1);

    if (board[cellI][cellJ].isMine === false) {
      board[cellI][cellJ].isMine = true;
    } else {
      while (board[cellI][cellJ].isMine) {
        cellI = getRandomInt(0, gLevel.size - 1);
        cellJ = getRandomInt(0, gLevel.size - 1);
      }
      board[cellI][cellJ].isMine = true;
    }
  }
  return board;
}

function createMat(matSize) {
  var mat = [];
  var cell = {};
  for (var i = 0; i < matSize; i++) {
    var row = [];
    for (var j = 0; j < matSize; j++) {
      cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      };
      //for debug
      // if ((i === 2 && j === 1) || (i === 3 && j === 3)) cell.isMine = true;
      row.push(cell);
    }
    mat.push(row);
  }
  return mat;
}

function setMineNegsCount(mat) {
  for (var i = 0; i < mat.length; i++) {
    for (var j = 0; j < mat[0].length; j++) {
      if (mat[i][j].isMine === true) countNeighbors(mat, i, j);
    }
  }
  return mat;
}

function getClassName(location) {
  var cellClass = "cell-" + location.i + "-" + location.j;
  return cellClass;
}

function countNeighbors(mat, cellI, cellJ) {
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= mat.length) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ) continue;
      if (j < 0 || j >= mat[i].length) continue;

      if (!mat[i][j].isMine) mat[i][j].minesAroundCount += 1;
    }
  }
  return mat;
}

function searchNeighbors(board, cellI, cellJ) {
  var neighbors = [];
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ && !gHints.isOn) continue;
      if (j < 0 || j >= board[i].length) continue;

      if (!gHints.isOn) {
        if (!board[i][j].isMine) {
          if (!board[i][j].isMarked) {
            neighbors.push({ i: i, j: j });
          }
        } else {
          //even if there is 1 mine we are not openning the neighbors
          neighbors = [];
          return neighbors;
        }
      } else {
        neighbors.push({ i: i, j: j });
      }
    }
  }
  return neighbors;
}

function renderCell(location, value) {
  var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

function renderBoard(board) {
  var strHTML = "";

  console.log("board", board);
  for (var i = 0; i < board.length; i++) {
    strHTML += "<tr>\n";
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];
      var cellClass = getClassName({ i: i, j: j });
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
        ',event)">\n';

      if (currCell.minesAroundCount === 0) EMPTY;

      strHTML += "\t</td>\n";
    }
    strHTML += "</tr>\n";
  }
  var elBoard = document.querySelector(".board");
  elBoard.innerHTML = strHTML;
}

function getEmptyLocations(board) {
  var emptyLocations = [];
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      var cell = board[i][j];
      if (cell.minesAroundCount === 0 && cell.isMine === false) {
        emptyLocations.push({ i: i, j: j });
      }
    }
  }
  return emptyLocations;
}

function getRandomEmptyLocation(emptyLocations) {
  var randomIndex = getRandomInt(0, emptyLocations.length);
  var emptyLocation = emptyLocations[randomIndex];
  return emptyLocation;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function handelLevel(el) {
  resetAll();
  if (el.value === "beginner") {
    gLevel.size = 4;
    gLevel.mines = 2;
  } else if (el.value === "medium") {
    gLevel.size = 8;
    gLevel.mines = 12;
  } else {
    gLevel.size = 12;
    gLevel.mines = 30;
  }

  initGame();
}

function resetAll() {
  clearInterval(gGameInterval);
  gGameInterval = null;
  gGame.isOn = false;
  gGame.markedCounte = 0;
  gGame.secsPassed = 0;
  gGame.shownCount = 0;
  gGameCounter = 0;
  gHearts = 3;
  gHints.qty = 3;
  gHints.isOn = false;
  gHintsTimeout = 0;
  gSafeClick = 3;

  var size = 'width="40px" height="40px"';
  var elbtnHeart = document.querySelector(".hearts .oneHr");
  elbtnHeart.innerHTML = `<img src="assets/LifeOn.svg" ` + size + `/>`;
  elbtnHeart = document.querySelector(".hearts .twoHr");
  elbtnHeart.innerHTML = `<img src="assets/LifeOn.svg" ` + size + `/>`;
  elbtnHeart = document.querySelector(".hearts .threeHr");
  elbtnHeart.innerHTML = `<img src="assets/LifeOn.svg" ` + size + `/>`;

  var elBtnHint = document.querySelector(".hints .oneHi");
  elBtnHint.innerHTML = `<img src="assets/HintOn.svg" ` + size + `/>`;
  elBtnHint = document.querySelector(".hints .twoHi");
  elBtnHint.innerHTML = `<img src="assets/HintOn.svg" ` + size + `/>`;
  elBtnHint = document.querySelector(".hints .threeHi");
  elBtnHint.innerHTML = `<img src="assets/HintOn.svg" ` + size + `/>`;

  var elGameCounter = document.querySelector(".game-counter span");
  elGameCounter.innerText = gGame.secsPassed.toString().padStart(3, "0");
  //smily
  var elBtnStart = document.querySelector(".toggle-game span");
  elBtnStart.innerHTML = `<img src="assets/happy.svg" width="50px" height="50px"/>`;
  //mines left
  var elMinesLeft = document.querySelector(".mines-left span");
  elMinesLeft.innerText = gLevel.mines;

  var elEndMsg = document.querySelector(".usr-msg");
  elEndMsg.innerText = "";

  createBestScore();
}

function showHintsNeighbors(board, cellI, cellJ) {
  gHintNeighbors = [];
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= board[i].length) continue;
      gHintNeighbors.push({ i: i, j: j });
    }
  }

  if (gBoard[cellI][cellJ].isMine) {
    renderAround(cellI, cellJ, MINE_IMG);
  } else if (gBoard[cellI][cellJ].minesAroundCount === 0) {
    renderAround(cellI, cellJ, EMPTY);
  } else
    renderAround(
      cellI,
      cellJ,
      getCellHtml(board[cellI][cellJ].minesAroundCount)
    );
  gHintsTimeout = setTimeout(undoHintsNeighbors, 3000);
}

function undoHintsNeighbors() {
  for (var i = 0; i < gHintNeighbors.length; i++) {
    var currI = gHintNeighbors[i].i;
    var currJ = gHintNeighbors[i].j;
    gBoard[currI][currJ].isShown = false;
    addClassName({ i: currI, j: currJ });
    renderCell({ i: currI, j: currJ }, EMPTY);
  }
  //if the user press the first time on hint this is the first click
  if (!gGame.isOn) gGame.isOn = true;
  clearTimeout(gHintsTimeout);
}

function expandAllMine() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      if (gBoard[i][j].isMine) {
        renderCell({ i: i, j: j }, MINE_IMG);
        removeClassName({ i: i, j: j });
      }
    }
  }
}

function createBestScore() {
  localStorage.setItem("beginner", Infinity);
  localStorage.setItem("medium", Infinity);
  localStorage.setItem("expert", Infinity);
}

function updateBestScore() {
  var elLblBestScore;
  if (
    gLevel.size === 4 &&
    localStorage.getItem("beginner") > gGame.secsPassed
  ) {
    localStorage.setItem("beginner", gGame.secsPassed);
    elLblBestScore = document.querySelector(".beginner-lbl span");
    elLblBestScore.innerText = gGame.secsPassed;
  }
  if (gLevel.size === 8 && localStorage.getItem("medium") > gGame.secsPassed) {
    localStorage.setItem("medium", gGame.secsPassed);
    elLblBestScore = document.querySelector(".medium-lbl span");
    elLblBestScore.innerText = gGame.secsPassed;
  }
  if (gLevel.size === 12 && localStorage.getItem("expert") > gGame.secsPassed) {
    localStorage.setItem("expert", gGame.secsPassed);
    elLblBestScore = document.querySelector(".expert-lbl span");
    elLblBestScore.innerText = gGame.secsPassed;
  }
}

function handelSafeClick() {
  var safeClicks = [];
  if (!gGame.isOn) return;
  if (gSafeClick > 0) {
    gSafeClick--;
    for (var i = 0; i < gBoard.length; i++) {
      for (var j = 0; j < gBoard[i].length; j++) {
        if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
          safeClicks.push({ i: i, j: j });
        }
      }
    }

    console.log("safeClicks", safeClicks);
    var selectedCell = getRandomInt(0, safeClicks.length - 1);
    console.log("selectedCell", selectedCell);
    var cellI = safeClicks[selectedCell].i;
    var cellJ = safeClicks[selectedCell].j;
    var currCell = gBoard[cellI][cellJ];
    gBoard[cellI][cellJ].isShown = true;
    if (currCell.minesAroundCount === 0) {
      renderCell({ i: cellI, j: cellJ }, EMPTY);
      console.log("cellI", cellI, "- cellJ", cellJ);
      removeClassName({ i: cellI, j: cellJ });
    } else {
      renderCell(
        { i: cellI, j: cellJ },
        `<img src="assets/${currCell.minesAroundCount}.svg" width="40%" height="40%"/>`
      );
      console.log("cellI", cellI, "- cellJ", cellJ);
      removeClassName({ i: cellI, j: cellJ });
    }
    gLocation = { i: cellI, j: cellJ };
    setTimeout(addClassName, 3000);
    gBoard[cellI][cellJ].isShown = false;
    renderCell({ i: cellI, j: cellJ }, EMPTY);
  } else {
    var elMsg = document.querySelector(".usr-msg");
    elMsg.innerText = "You are out of safe click";
  }
}
