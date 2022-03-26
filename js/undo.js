'use strict';

function setUndo() {
  if (!gUndos.length > 0) {
    var msg = 'You can\'t undo the undone';
    setUserMsg(msg);
    return;
  }
  if (!gGame.isOn) {
    msg = 'The game is over';
    setUserMsg(msg);
    return;
  }
  msg = '';
  setUserMsg(msg);
  undoIsOn = true;
  var i = gUndos.length - 1;
  var groupId = 0;
  var currAction = gUndos[i];
  var cellI = currAction.i;
  var cellJ = currAction.j;
  var renderValue = '';
  var currCell = gBoard[cellI][cellJ];
  var undo = gUndos[i];
  var elBtnImg;

  if (undo.isGrouped) {
    groupId = currAction.groupedId;
    while (undo.groupedId === groupId && gUndos.length > 0) {
      //-------if its group and number
      if (currAction.action === 'isShown') {
        renderAround(cellI, cellJ, EMPTY);
        gBoard[cellI][cellJ].isShown = false;
        gGame.shownCount--;
        gUndos.pop();
        if (i > 0) {
          i = gUndos.length - 1;
          currAction = gUndos[i];
          cellI = currAction.i;
          cellJ = currAction.j;
          undo = gUndos[i];
        }
      }
    }
    undoIsOn = false;
    return;
    //----if mine------
  } else if (
    currAction.action === 'isShown' &&
    (currAction.value === true || currAction.value === false)
  ) {
    if (currCell.isMine === true && currCell.isShown) {
      renderValue = EMPTY;
      gMines--;
      addClassName({ i: cellI, j: cellJ });
      setMineLeft(-1);
      currCell.isShown = false;
      renderCell({ i: cellI, j: cellJ }, renderValue);
      gUndos.pop();

      if (gHearts === 2) {
        elBtnImg = document.querySelector('.oneHr');
        elBtnImg.innerHTML = `<img src="assets/lifeOn.svg" width="40px" height="40px"/>`;
      } else if (gHearts === 1) {
        elBtnImg = document.querySelector('.twoHr');
        elBtnImg.innerHTML = `<img src="assets/lifeOn.svg" width="40px" height="40px"/>`;
      }
      gHearts++;
    }
    //-------if number-----
  } else if (currAction.action === 'isShown' && currAction.value > -1) {
    gGame.shownCount--;
    renderAround(cellI, cellJ, EMPTY);
    gBoard[cellI][cellJ].isShown = false;
    gUndos.pop();
    //------- if flag--------
  } else if (currAction.action === 'isMarked') {
    gBoard[cellI][cellJ].isMarked = currAction.value;
    if (currAction.value === true) {
      renderValue = FLAG_IMG;
      gGame.markedCounte++;
    } else {
      renderValue = EMPTY;
      gGame.markedCounte--;
    }
    renderCell({ i: cellI, j: cellJ }, renderValue);
    gUndos.pop();
    //there wasnt any instruction, so i just move back the counter
  } else if (currAction.action === 'useHint') gHints.qty++;

  undoIsOn = false;
}

function updateUndos(isGrouped, cellI, cellJ, action, value) {
  var gUndo = {
    isGrouped: isGrouped,
    groupedId: gUndoId,
    i: cellI,
    j: cellJ,
    action: action,
    value: value,
  };

  if (!isGrouped) gUndoId++;
  gUndos.push(gUndo);
}
