'use strict';

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

//handel cell
function getNeighbors(board, cellI, cellJ) {
  var neighbors = [];
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ && !gHints.isOn) continue;
      if (j < 0 || j >= board[i].length) continue;

      if (!gHints.isOn) {
        if (!board[i][j].isMine) {
          if (!board[i][j].isMarked && !board[i][j].isShown) {
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

function renderAround(cellI, cellJ, value) {
  gBoard[cellI][cellJ].isShown = true;

  if (!gHints.isOn && !gSafeClick.isOn && !undoIsOn) gGame.shownCount++;
  renderCell({ i: cellI, j: cellJ }, value);
  if (undoIsOn) addClassName({ i: cellI, j: cellJ });
  else removeClassName({ i: cellI, j: cellJ });
  //if not mine or its mine and we in hint mode we hendel neighbors
  if (
    undoIsOn === false &&
    ((!gBoard[cellI][cellJ].isMine && !gSafeClick.isOn) ||
      (gBoard[cellI][cellJ].isMine && gHints.isOn))
  )
    handelNeighbors({ i: cellI, j: cellJ });
}

function renderCell(location, value) {
  var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

function removeClassName(location) {
  var className = getClassName(location);
  var elCell = document.querySelector(`.${className}`);
  elCell.classList.remove('hide');
}

function addClassName(location = gLocation) {
  var className = getClassName(location);
  var elCell = document.querySelector(`.${className}`);
  elCell.classList.add('hide');
}

function handelNeighbors(location) {
  var neighbors = [];
  neighbors = getNeighbors(gBoard, location.i, location.j);

  if (neighbors.length > 0) {
    openNeighbors(neighbors);
    updateUndos(
      true,
      location.i,
      location.j,
      'isShown',
      gBoard[location.i][location.j].minesAroundCount
    );
    gUndoId = gUndos[gUndos.length - 1].groupedId + 1;
  } else {
    var currCell = gBoard[location.i][location.j];
    if (currCell.minesAroundCount > 0) {
      renderCell(
        { i: location.i, j: location.j },
        getCellHtml(currCell.minesAroundCount)
      );
      updateUndos(
        false,
        location.i,
        location.j,
        'isShown',
        currCell.minesAroundCount
      );
    } else {
      renderCell(location, EMPTY);
      updateUndos(false, location.i, location.j, 'isShown', 0);
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
      updateUndos(true, neighboeCellI, neighboeCellJ, 'isShown', 0);
    } else {
      var num = neighbor.minesAroundCount;
      renderCell(
        { i: neighboeCellI, j: neighboeCellJ },
        `<img src="assets/${num}.svg" class="game-item-${gLevel.size}"/>`
      );
      removeClassName({ i: neighboeCellI, j: neighboeCellJ });
      updateUndos(true, neighboeCellI, neighboeCellJ, 'isShown', num);
    }
  }
}

//start game
function setStartGame() {
  if (!gGame.isOn) gGame.isOn = true;
  var msg = "";
  setUserMsg(msg);
  gGameInterval = setInterval(startGameCounter, 1000);
}

function startGameCounter() {
  gGame.secsPassed++;
  var elGameCounter = document.querySelector('.game-score span');
  elGameCounter.innerText = gGame.secsPassed.toString().padStart(3, '0');
}

//Hints
//if the game didnt start i'm not allowing safe mode
function expendHintsCells(cellI, cellJ) {
  showNeighborsHints(gBoard, cellI, cellJ);
}

function showNeighborsHints(board, cellI, cellJ) {
  gHintNeighbors = [];
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= board[i].length) continue;
      if (!board[i][j].isShown) gHintNeighbors.push({ i: i, j: j });
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
  gHintsTimeout = setTimeout(undoNeighborsHints, 2000);
}

function undoNeighborsHints() {
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

//Empty location
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

function openEmptyLocation(location) {
  removeClassName(location);

  //mark the new location
  gBoard[location.i][location.j].isShown = true;
  if (!gHints.isOn) gGame.shownCount++;
  handelNeighbors(location);
}

//mine
function getRandomMine(board, mineQty) {
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

function getMineNegsCount(mat) {
  for (var i = 0; i < mat.length; i++) {
    for (var j = 0; j < mat[0].length; j++) {
      if (mat[i][j].isMine === true) getCountNeighbors(mat, i, j);
    }
  }
  return mat;
}

function getCountNeighbors(mat, cellI, cellJ) {
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

function getClassName(location) {
  var cellClass = 'cell-' + location.i + '-' + location.j;
  return cellClass;
}

function setMineLeft() {
  var elMinesLeft = document.querySelector('.mines-left span');
  elMinesLeft.innerText = gLevel.mines - gMines;
}

//if the use lose
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

//level
function setLevel(el) {
  resetAll();

  if (el.value === 'beginner') {
    gLevel.size = 4;
    gLevel.mines = 2;
  } else if (el.value === 'medium') {
    gLevel.size = 8;
    gLevel.mines = 12;
  } else {
    gLevel.size = 12;
    gLevel.mines = 30;
  }

  initGame();
}

//safe mode
//if the game didnt start i'm not allowing safe mode
function setSafeClick() {
  var safeClicks = [];
  if (!gGame.isOn){
    var msg = 'The game didn\'t start';
    setUserMsg(msg);
    return;
  }
  msg = "";
  setUserMsg(msg);
  

  if (gSafeClick.qty > 0) {
    gSafeClick.isOn = true;
    gSafeClick.qty--;
    for (var i = 0; i < gBoard.length; i++) {
      for (var j = 0; j < gBoard[i].length; j++) {
        //if cell is not mine and not shown
        if (
          !gBoard[i][j].isMine &&
          !gBoard[i][j].isShown &&
          !gBoard[i][j].isMarked
        ) {
          safeClicks.push({ i: i, j: j });
        }
      }
    }
    if (safeClicks.length === 0) {
      var msg = 'There are no places of safe click';
      setUserMsg(msg);
    } else {
      var selectedCell = getRandomInt(0, safeClicks.length - 1);
      var cellI = safeClicks[selectedCell].i;
      var cellJ = safeClicks[selectedCell].j;
      var currCell = gBoard[cellI][cellJ];
      currCell.isShown = true;
      if (currCell.minesAroundCount === 0) {
        renderAround(cellI, cellJ, EMPTY);
      } else {
        var num = currCell.minesAroundCount;
        renderAround(cellI, cellJ, getCellHtml(num));
      }
      gLocation = { i: cellI, j: cellJ };
      gSafeClickTimeOut = setTimeout(undoSafeClick, 2000);
    }
  } else {
    var msg = 'You are out of safe click';
    setUserMsg(msg);
  }
}

function setUserMsg(msg) {
  var elMsg = document.querySelector('.usr-msg');
  elMsg.innerText = msg;
}

function undoSafeClick(location = gLocation) {
  addClassName({ i: location.i, j: location.j });
  renderCell({ i: location.i, j: location.j }, EMPTY);
  clearTimeout(gSafeClickTimeOut);
  gBoard[location.i][location.j].isShown = false;
  gSafeClick.isOn = false;
}

//end game
function checkEndGame() {
  
  var cellQtyNeeded = Math.pow(gLevel.size, 2);
  var mineCounter = countMine();
  if (cellQtyNeeded  === gGame.shownCount + mineCounter) {
    updateBestScore();
    var endGameMsg = 'You win the game';
    setEndGame(endGameMsg);
  }
}

function countMine(){
  var counter = 0;
  for(var i = 0;i<gBoard.length;i++){
    for(var j=0;j<gBoard[0].length;j++){
      if(gBoard[i][j].isMine && gBoard[i][j].isShown) counter++;
      if(gBoard[i][j].isMine && gBoard[i][j].isMarked) counter++;
    }
  }
  return counter;
}


function minesEndGame(location, value) {
  var endGameMsg = 'You lose the game';
  var elGameBtn = document.querySelector('.toggle-game span');
  var sad = `<span><img src="assets/sad.svg" class="btn" width="50px" height="50px"/></span>`;
  elGameBtn.innerHTML = sad;
  setEndGame(endGameMsg);
  renderCell({ i: location.i, j: location.j }, value);
  expandAllMine();
}

function setEndGame(msg) {
  gGame.isOn = false;
  setUserMsg(msg);
  clearInterval(gGameInterval);
}

//best score
function createBestScore() {
  localStorage.setItem('beginner', Infinity);
  localStorage.setItem('medium', Infinity);
  localStorage.setItem('expert', Infinity);
}

function updateBestScore() {
  var elLblBestScore;
  if (
    gLevel.size === 4 &&
    localStorage.getItem('beginner') > gGame.secsPassed
  ) {
    localStorage.setItem('beginner', gGame.secsPassed);
    elLblBestScore = document.querySelector('.beginner-lbl span');
    elLblBestScore.innerText = gGame.secsPassed;
  } else if (
    gLevel.size === 8 &&
    localStorage.getItem('medium') > gGame.secsPassed
  ) {
    localStorage.setItem('medium', gGame.secsPassed);
    elLblBestScore = document.querySelector('.medium-lbl span');
    elLblBestScore.innerText = gGame.secsPassed;
  } else if (
    gLevel.size === 12 &&
    localStorage.getItem('expert') > gGame.secsPassed
  ) {
    localStorage.setItem('expert', gGame.secsPassed);
    elLblBestScore = document.querySelector('.expert-lbl span');
    elLblBestScore.innerText = gGame.secsPassed;
  }
}

function getCellHtml(num) {
  return `<img src="assets/${num}.svg" class="game-item-${gLevel.size}"/>`;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function resetAll() {
  clearInterval(gGameInterval);
  gGameInterval = null;
  gGame.isOn = false;
  gGame.markedCounte = 0;
  gGame.secsPassed = 0;
  gGame.shownCount = 0;
  gHearts = 3;
  gHints.qty = 3;
  gHints.isOn = false;
  gHintsTimeout = 0;
  gSafeClick.qty = 3;
  gSafeClickTimeOut = 0;
  gMines = 0;
  gUndoId = 1;
  gUndos = [];
  var size = 'width="40px" height="40px"';
  var elbtnHeart = document.querySelector("#hearts .oneHr");
  elbtnHeart.innerHTML = `<img src="assets/lifeOn.svg" ` + size + `/>`;
  elbtnHeart = document.querySelector("#hearts .twoHr");
  elbtnHeart.innerHTML = `<img src="assets/lifeOn.svg" ` + size + `/>`;
  elbtnHeart = document.querySelector("#hearts .threeHr");
  elbtnHeart.innerHTML = `<img src="assets/lifeOn.svg" ` + size + `/>`;

  var elBtnHint = document.querySelector("#hints .oneHi");
  elBtnHint.innerHTML = `<img src="assets/hintOn.svg" ` + size + `/>`;
  elBtnHint = document.querySelector("#hints .twoHi");
  elBtnHint.innerHTML = `<img src="assets/hintOn.svg" ` + size + `/>`;
  elBtnHint = document.querySelector("#hints .threeHi");
  elBtnHint.innerHTML = `<img src="assets/hintOn.svg" ` + size + `/>`;

  var elGameCounter = document.querySelector(".game-score span");
  elGameCounter.innerText = gGame.secsPassed.toString().padStart(3, "0");
  //smily
  var elBtnStart = document.querySelector(".toggle-game span");
  elBtnStart.innerHTML = `<img src="assets/happy.svg" width="50px" height="50px" class="btn"/>`;
  //mines left
  var elMinesLeft = document.querySelector(".mines-left span");
  elMinesLeft.innerText = gLevel.mines;

  var elEndMsg = document.querySelector(".usr-msg");
  elEndMsg.innerText = "";

  createBestScore();
}
