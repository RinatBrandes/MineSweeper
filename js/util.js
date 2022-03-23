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
                isMarked: false
            }
            if(i ===  2 && j === 1 || i === 3 && j===3) cell.isMine = true;               

            row.push(cell);
            } 
            mat.push(row);
        }
    
    // console.log('mat',mat );  
    return mat;
}


function setMineNegsCount(mat){
console.log('mat', mat);
    for(var i = 0; i < mat.length;i++){
        for(var j = 0;j < mat[0].length;j++){
            if(mat[i][j].isMine === true) countNeighbors(mat,i,j);
        }
    }
   
    return mat;
}



function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}





function countNeighbors(mat, cellI, cellJ){
    
    for(var i = cellI - 1;i <= cellI + 1;i++){
        if(i < 0 || i >=mat.length) continue;
        for(var j = cellJ - 1;j <=cellJ + 1;j++){
            if(i === cellI && j === cellJ) continue;
            if(j < 0 || j >=mat[i].length) continue;
            //debugger
            if(!mat[i][j].isMine) mat[i][j].minesAroundCount += 1;
        }
    }
    // console.log('mat', mat);
    return mat;

}

function searchNeighbors(board, cellI,cellJ){
    var neighbors = [];
    for(var i = cellI - 1;i <= cellI + 1;i++){
        if(i < 0 || i >=board.length) continue;
        for(var j = cellJ - 1;j <=cellJ + 1;j++){
            if(i === cellI && j === cellJ) continue;
            if(j < 0 || j >=board[i].length) continue;
            //debugger
            if(!board[i][j].isMine) {
                neighbors.push({i:i,j:j});
            } else {
                //even if there is 1 mine we are not openning the neighbors
                neighbors = [];
                break;
            }    
        }
    }
    // console.log('board', board);
    return neighbors;
}

function renderCell(location, value) {
    // Select the elCell and set the value
    console.log('location', location);
    console.log('cell', `.cell-${location.i}-${location.j}`);
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    console.log('elCell',elCell );
    elCell.innerHTML = value;
  }

function renderBoard(board){
    var strHTML = '';
   
console.log('board', board);
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })
                cellClass += ' hide';
			// cellClass += (currCell.type === FLOOR) ? ' floor' : ' wall'
            var color = setNumberColor(currCell.minesAroundCount);
            // strHTML += `\t<td class="cell ${cellClass} "  onclick="cellCliked(${i},${j},${this}) " >\n`;
            // strHTML += '\t<td class="cell ' + cellClass + '"  onclick="cellClicked(' + i + ',' + j + ',event)" onContextMenu="cellClicked(' + i + ',' + j + ',event)">\n';
			strHTML += '\t<td class="cell ' + cellClass + '"  onclick="cellClicked(' + i + ',' + j + ',event)" onContextMenu="cellClicked(' + i + ',' + j + ',event)">\n';
            // if(currCell.isMine) strHTML += MINE_IMG;
            // if(currCell.minesAroundCount === 0) EMPTY;
            // if(currCell.minesAroundCount > 0){
            //     strHTML += (`<span style="color:${color}">${currCell.minesAroundCount}</span>`) ;
            // }
			
			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';

	}
    // console.log('strHTML', strHTML);
	var elBoard = document.querySelector('.board');  
	elBoard.innerHTML = strHTML;
}


function setNumberColor(num){
    var color = '';
    switch (num) {
        case 1:
            color = '#FF0000';
            break;
        case 2:
            color = '#0000FF';
            break;
        case 3:
            color = '#008000';
            break;
        case 4:
            color = '#00FFFF';
            break;    
        case 5:
            color = '#800080';
            break;    
        case 6:
            color = '##7fff00';
            break;    
        case 7:
            color = '##7fff00';
            break;    
        case 8:
            color = '##7fff00';
            break;    
        case 9:
            color = '##7fff00';
            break;                
    }    
    return color;
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
    var randomIndex = getRandomInt(0, emptyLocations.length)
    var emptyLocation = emptyLocations[randomIndex];
    return emptyLocation;
}



function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
