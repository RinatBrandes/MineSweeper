"use strict";

var gBoard;
var gLevel;
var gGame = {
  isOn: false,
  shownCount: 0,
  markedCounter: 0,
  secsPassed: 0,
};
var gFirstClick = false;
var gGameCounter = 0;
var gGameInterval = 0;
var gHearts = 3;

const MAT_Size = 4;
const MINES_QTY = 2;
const MINE_IMG = '💥';
const FLAG_IMG = '🚩';
const EMPTY = '';
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
  var board = createMat(MAT_Size);
  return board;
}

function cellClicked(cellI, cellJ, clickType) {
 debugger
 console.log('', clickType.button);
  var currCellClicked = gBoard[cellI][cellJ];
  var emptyLocation = {};
  //if its the first click we check if we are standing on mine or number
  if (!gFirstClick ) {
      setStartGame();
      gFirstClick = true;
      if(clickType.button === LEFT_BUTTON && currCellClicked.isMine ||  currCellClicked.minesAroundCount > 0){
          emptyLocation = firstClick(gBoard, cellI, cellJ);      
          openEmptyLocation(emptyLocation);
        }
  }
    if(clickType.button === RIGHT_BUTTON) handelRightClick(cellI, cellJ);    
    if(clickType.button === LEFT_BUTTON) handelLeftClick(cellI, cellJ);    

}


function handelLeftClick(cellI, cellJ){
    var currCell = gBoard[cellI][cellJ];
    if(currCell.isMine){
        if(gHearts > 0){
            //still can open main
            gHearts--;
            renderCell({i:cellI,j:cellJ},MINE_IMG)
            handelClassName({i:cellI,j:cellJ})
            handelNeighbors({i:cellI,j: cellJ})
        } else {
            setStopGame();
            renderCell({i:cellI,j:cellJ},MINE_IMG)
        }
    }

}

function setStopGame(){
    gGame.isOn = false;    
    clearInterval(gGameInterval);    
}

function handelRightClick(cellI, cellJ){
    if(gBoard[cellI][cellJ].isMarked){
        gBoard[cellI][cellJ].isMarked = false;
        gGame.markedCounter--;
        renderCell({i:cellI,j:cellJ},EMPTY)
    } else {
        gBoard[cellI][cellJ].isMarked = true;
        gGame.markedCounter++;
        renderCell({i:cellI,j:cellJ},FLAG_IMG);
    }
}


function openEmptyLocation(location){
    console.log('location', location);
    handelClassName(location);
   
    //mark the new location
    gBoard[location.i][location.j].isShown = true;
    gGame.shownCount++
    handelNeighbors(location);
    
}


function handelClassName(emptyLocation){
    var className = getClassName(emptyLocation);
    var elCell = document.querySelector(`.${className}`);    
    elCell.classList.remove('hide');
}

function handelNeighbors(emptyLocation){
    var neighbors = [];
    neighbors = searchNeighbors(gBoard,emptyLocation.i,emptyLocation.j);
    console.log('neighbors', neighbors);
    if(neighbors) openNeighbors(neighbors);
    else renderCell(emptyLocation,EMPTY);
}



function openNeighbors(neighbors){
    
    for(var i =0;i < neighbors.length;i++){
        var neighboeCellI =neighbors[i].i;
        var neighboeCellJ =neighbors[i].j;
        var neighbor = gBoard[neighboeCellI][neighboeCellJ];

        neighbor.isShown = true;
        if(neighbor.minesAroundCount === 0) {                
            renderCell({i:neighboeCellI,j:neighboeCellJ},EMPTY);
        } else {
            renderCell({i:neighboeCellI,j:neighboeCellJ},getCellHtml(neighbor.minesAroundCount));
        }
    }    
}

function getCellHtml(num){
    var color = setNumberColor(num)
    console.log('color', color);
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
  gGame.isOn = true;
  gGame.shownCount++;
  gGameInterval = setInterval(startGameCounter, 1000);
}

function startGameCounter() {
  gGame.secsPassed++;
//   console.log("gGame.secsPassed", gGame.secsPassed);
  var elGameCounter = document.querySelector(".game-counter span");
//   console.log("elGameCounter", elGameCounter);
  elGameCounter.innerText = gGame.secsPassed.toString().padStart(3, '0');
}

function handelCell(cell) {
  cell.isShown = true;
}

function endGame(){
    clearInterval(gGameInterval);
}