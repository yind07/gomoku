//  Game board
//  =======================================================

var board = (function() {
    var positions; // 2-dimension array that holds current board positions((0,0) => (size-1,size-1))
    
    function init(size) {
      positions = new Array(size);
      //  y: row
      //  x: column
      //  This 2-dimentional array is initialized by column (x position)
      for (var x = 0; x < size; ++x) {
        positions[x] = new Array(size);
        for (var y = 0; y < positions[x].length; ++y) {
          positions[x][y] = new Position(x, y);
        }
      }
      updatePriorities(0,0, size-1, size-1);
    }
    
    function reset() {
      for (var x = 0; x < positions.length; ++x) {
        for (var y = 0; y < positions[x].length; ++y) {
          positions[x][y].reset();
        }
      }
      updatePriorities(0,0, positions.length-1, positions[0].length-1);
    }
    
    //  update priorities for all blank positions in the rectangle area:
    //  left-top => right-bottom
    function updatePriorities(left, top, right, bottom) {
      if (left <= right && top <= bottom) {
        for (var x = left; x <= right; ++x) {
          for (var y = top; y <= bottom; ++y) {
            if (getPosition(x,y).isBlank()) {
              _updatePriority(x,y);
            }
          }
        }
      }
    }
    
    function getPosition(x,y) {
      return positions[x][y];
    }
    
    // side: black/white
    function isGameOver(side) {
      var startPos = _scanWinSizeX(side);
      if (startPos) {
        console.log("Horizontal link start from: (" + startPos.x + ", " + startPos.y + ")");
        return true;
      }
      startPos = _scanWinSizeY(side);
      if (startPos) {
        console.log("Vertical link start from: (" + startPos.x + ", " + startPos.y + ")");
        return true;
      }

      startPos = _scanWinSizeS(side);
      if (startPos) {
        console.log("Slash link start from: (" + startPos.x + ", " + startPos.y + ")");
        return true;
      }
      
      startPos = _scanWinSizeB(side);
      if (startPos) {
        console.log("Backslash link start from: (" + startPos.x + ", " + startPos.y + ")");
        return true;
      }
      
      return false;
    }
    
    //  scan board by x-axis direction to see if there is any WIN_SIZE link
    //  return the start stone's position if any, return null otherwise
    //  side: SECOND_PLAYER or FIRST_PLAYER
    function _scanWinSizeX(side) {
      var count;
      for (var y = 0; y < GRID_SIZE; ++y) {
        // only need scan to the last possible position in a row
        for (var x = 0; x < GRID_SIZE-(WIN_SIZE-1); ++x) {
          count = 0;
          for (var p = x; p < GRID_SIZE; ++p) {
            if (positions[p][y].getValue() === side) {
              count++;
              if (count == 1) {
                x = p;    // the start x
              } else if (count == WIN_SIZE) {  // found WIN_SIZE link
                return positions[x][y];
              }
            } else {
              count = 0;  // link break!
            }
          }
        }
      }
      return null;
    }
    
    function _scanWinSizeY(side) {
      var count;
      for (var x = 0; x < GRID_SIZE; ++x) {
        // only need scan to the last possible position in a column
        for (var y = 0; y < GRID_SIZE-(WIN_SIZE-1); ++y) {
          count = 0;
          for (var p = y; p < GRID_SIZE; ++p) {
            if (positions[x][p].getValue() === side) {
              count++;
              if (count == 1) {
                y = p;    // the start x
              } else if (count == WIN_SIZE) {  // found WIN_SIZE link
                return positions[x][y];
              }
            } else {
                count = 0;
            }
          } 
        }
      }
      return null;
    }
    
    //  scan board by slash direction(left-bottom => right-top) to see if there is any WIN_SIZE link
    //  return the start stone's position if any, return null otherwise
    //  side: SECOND_PLAYER or FIRST_PLAYER
    function _scanWinSizeS(side) {
      var x, y, count;
      var startX, startY;
      // scan the left-top half until y == GRID_SIZE-1
      // only need scan to the last possible position
      for (y = WIN_SIZE-1; y < GRID_SIZE; ++y) {
        x = 0;
        count = 0;
        for (var p = x, q = y; p < GRID_SIZE && q >= 0; ++p, --q) {
          if (positions[p][q].getValue() === side) {
            count++;
            if (count == 1) { // record the start position(x,y)
              startX = p; // we can reuse x BTW
              startY = q;
            } else if (count == WIN_SIZE) {  // found WIN_SIZE link
              return positions[startX][startY];
            }
          } else {
            count = 0;
          }
        }
      }
      
      // scan the right-bottom half until x == GRID_SIZE-1
      // only need scan to the last possible position
      for (x = 1; x < GRID_SIZE-(WIN_SIZE-1); ++x) {
        y = GRID_SIZE-1;
        count = 0;
        for (var p = x, q = y; p < GRID_SIZE && q >= 0; ++p, --q) {
          if (positions[p][q].getValue() === side) {
            count++;
            if (count == 1) { // record the start position(x,y)
              startX = p;
              startY = q; // we can reuse y BTW
            } else if (count == WIN_SIZE) {  // found WIN_SIZE link
              return positions[startX][startY];
            }
          } else {
            count = 0;
          }
        }
      }
      return null;
    }
    
    //  scan board by backslash direction(left-top => right-bottom) to see if there is any WIN_SIZE link
    //  return the start stone's position if any, return null otherwise
    //  side: SECOND_PLAYER or FIRST_PLAYER
    function _scanWinSizeB(side) {
      var x, y, count;
      var startX, startY;
      // scan the left-bottom half until y == GRID_SIZE-1
      // only need scan to the last possible position
      for (y = GRID_SIZE - WIN_SIZE; y >= 0; --y) {
        x = 0;
        count = 0;
        for (var p = x, q = y; p < GRID_SIZE && q < GRID_SIZE; ++p, ++q) {
          if (positions[p][q].getValue() === side) {
            count++;
            if (count == 1) { // record the start position(x,y)
              startX = p; // we can reuse x BTW
              startY = q;
            } else if (count == WIN_SIZE) {  // found WIN_SIZE link
              return positions[startX][startY];
            }
          } else {
            count = 0;
          }
        }
      }
      
      // scan the right-bottom half until x == GRID_SIZE-1
      // only need scan to the last possible position
      for (x = 1; x < GRID_SIZE-(WIN_SIZE-1); ++x) {
        y = 0;
        count = 0;
        for (var p = x, q = y; p < GRID_SIZE && q < GRID_SIZE; ++p, ++q) {
          if (positions[p][q].getValue() === side) {
            count++;
            if (count == 1) { // record the start position(x,y)
              startX = p;
              startY = q; // we can reuse y BTW
            } else if (count == WIN_SIZE) {  // found WIN_SIZE link
              return positions[startX][startY];
            }
          } else {
            count = 0;
          }
        }
      }
      return null;
    }
    
    
    // game strategy: return the best board position based on current positions
    // side: SECOND_PLAYER or FIRST_PLAYER
    function getBestPosition(side) {
      //  demo: randomly choose one from all available positions(positions[x][y] == null)
      //  it's 1-dimentional array, and each element hold one available position
      var blankPositions = new Array();
      for (var x = 0; x < positions.length; ++x) {
        for (var y = 0; y < positions[x].length; ++y) {
          // this one scan by column
          if (positions[x][y].isBlank()) {
            blankPositions.push(positions[x][y]);
          }
        }
      }
      
      function orderBySide(pos1, pos2) { return pos2.getPriority(side) - pos1.getPriority(side); }
      blankPositions.sort(orderBySide);
      
      var highestP = blankPositions[0].getPriority(side);
      var availablePositions = new Array();
      for (var i = 0; i < blankPositions.length; ++i) {
        if (blankPositions[i].getPriority(side) === highestP) {
          availablePositions.push(blankPositions[i]);
        } else {
          break;
        }
      }
      // debug: display available positions array!
      //_displayPositions(availablePositions);
      
      // randomly select one
      if (availablePositions.length > 0) {
        var index = Math.floor(Math.random() * availablePositions.length);
        return availablePositions[index];
      } else {
        alert("The game board is full, try another round please.");
        return null;
      }
    }
    
    function _displayPositions(arr) {
      console.log("board::_displayPositions(): Length = " + arr.length);
      for (var i = 0; i < arr.length; ++i) {
        arr[i].displayInfo();
      }
    }
    
    // update the priority of position(x,y) (for both sides)
    // precondition: pos(x,y) is blank!
    function _updatePriority(x, y) {
      var pos = getPosition(x, y);
      
      var priorLineW = _calLinePriorX(x, y, FIRST_PLAYER) + _calLinePriorY(x, y, FIRST_PLAYER)
                      + _calLinePriorS(x, y, FIRST_PLAYER) + _calLinePriorB(x, y, FIRST_PLAYER);
      var priorLineB = _calLinePriorX(x, y, SECOND_PLAYER) + _calLinePriorY(x, y, SECOND_PLAYER)
                      + _calLinePriorS(x, y, SECOND_PLAYER) + _calLinePriorB(x, y, SECOND_PLAYER);
      var priorDotW = _calDotPriorX(x, y, FIRST_PLAYER) + _calDotPriorY(x, y, FIRST_PLAYER)
                      + _calDotPriorS(x, y, FIRST_PLAYER) + _calDotPriorB(x, y, FIRST_PLAYER);
      var priorDotB = _calDotPriorX(x, y, SECOND_PLAYER) + _calDotPriorY(x, y, SECOND_PLAYER)
                      + _calDotPriorS(x, y, SECOND_PLAYER) + _calDotPriorB(x, y, SECOND_PLAYER);
      pos.setPriority(Math.max(priorLineW, priorDotW), FIRST_PLAYER);
      pos.setPriority(Math.max(priorLineB, priorDotB), SECOND_PLAYER);
    }
    
//=================================
    // calculate line priority in horizontal direction (x-axis)
    // side: white/black
    // priority order (high => low):
    //  4+1, 3+1, 2+1(maybe)
    function _calLinePriorX(x,y, side) {
      var patchSize = WIN_SIZE - 1;     // there are two patches: left and right
      var indexesX = [];
      for (var i = 0; i < patchSize; ++i) {
        indexesX[i] = x - patchSize + i;     // left positions
        indexesX[i+patchSize] = x + i + 1;   // right positions
      }
      var min_scan_size = 3;  // It seems that 3 is better than 2!
      var priority = 0;
      for (var scan_size = WIN_SIZE-1; scan_size >= min_scan_size; --scan_size) {
        var cnt = 0;  // the number of continuous side
        for (var i = WIN_SIZE-1-scan_size; i < WIN_SIZE-1+scan_size; ++i) {
          // out of scope: no priority increment
          if (indexesX[i] >= 0 && indexesX[i] < GRID_SIZE) {
            let pos = getPosition(indexesX[i], y);
            //  only consider positions than have side stones!
            if (pos.getValue() === side) {
              cnt++;
              if (cnt == scan_size) {
                //  a value > the best dot priority: (5+4+3+2)*8
                //  best dot priority: 2+3+...+WIN_SIZE = (2+WIN_SIZE)*(WIN_SIZE-1)/2
                //  totally 8 patches 
                //return (2+WIN_SIZE)*(WIN_SIZE-1)/2 * 8;
                priority = (3+scan_size)*scan_size*4; //(2+scan_size+1)*scan_size/2 * 8;
                if (scan_size == WIN_SIZE-1) {
                  return priority;  // return immediately!
                }
                
                // adjustment to distinguish blank or opponent side
                var left = i-scan_size;
                var right = i+1;
                var nBlock = 0;   // the number of the other side stones in two ends.
                if (left < 0 || indexesX[left] < 0 
                    || (!getPosition(indexesX[left], y).isBlank()
                        && getPosition(indexesX[left], y).getValue() != side)) {
                      priority -= 1;
                      nBlock++;
                }
                if (right >= indexesX.length || indexesX[right] >= GRID_SIZE
                    || (!getPosition(indexesX[right], y).isBlank()
                        && getPosition(indexesX[right], y).getValue() != side)) {
                      priority -= 1;
                      nBlock++;
                }
                if (nBlock == 2 && scan_size < WIN_SIZE-1) {
                  priority = 0; // both ends are blocked, and the max length inside < WIN_SIZE, no any priority in this direction!
                }
                return priority;
              }
            } else {
              cnt = 0;  // reset
            }
          }
        }
      }
      return priority;
    }
    
    function _calLinePriorY(x,y, side) {
      var patchSize = WIN_SIZE - 1;     // there are two patches: top and bottom
      var indexesY = [];
      for (var i = 0; i < patchSize; ++i) {
        indexesY[i] = y - patchSize + i;     // top positions
        indexesY[i+patchSize] = y + i + 1;   // bottom positions
      }
      
      var min_scan_size = 3;  // try 2 later
      var priority = 0;
      for (var scan_size = WIN_SIZE-1; scan_size >= min_scan_size; --scan_size) {
        var cnt = 0;  // the number of continuous side
        for (var i = WIN_SIZE-1-scan_size; i < WIN_SIZE-1+scan_size; ++i) {
          // out of scope: no priority increment
          if (indexesY[i] >= 0 && indexesY[i] < GRID_SIZE) {
            let pos = getPosition(x, indexesY[i]);
            //  only consider positions than have side stones!
            if (pos.getValue() === side) {
              cnt++;
              if (cnt == scan_size) {
                //  a value > the best dot priority: (5+4+3+2)*8
                //  best dot priority: 2+3+...+WIN_SIZE = (2+WIN_SIZE)*(WIN_SIZE-1)/2
                //  totally 8 patches
                //return (2+WIN_SIZE)*(WIN_SIZE-1)/2 * 8;
                priority = (3+scan_size)*scan_size*4; //(2+scan_size+1)*scan_size/2 * 8;
                if (scan_size == WIN_SIZE-1) {
                  return priority;  // return immediately!
                }
                
                // adjustment to distinguish blank or opponent side
                var top = i-scan_size;
                var bottom = i+1;
                var nBlock = 0;   // the number of the other side stones in two ends.
                if (top < 0 || indexesY[top] < 0 
                    || (!getPosition(x, indexesY[top]).isBlank()
                        && getPosition(x, indexesY[top]).getValue() != side)) {
                      priority -= 1;
                      nBlock++;
                }
                if (bottom >= indexesY.length || indexesY[bottom] >= GRID_SIZE
                    || (!getPosition(x, indexesY[bottom]).isBlank()
                        && getPosition(x, indexesY[bottom]).getValue() != side)) {
                      priority -= 1;
                      nBlock++;
                }
                if (nBlock == 2 && scan_size < WIN_SIZE-1) {
                  priority = 0; // both ends are blocked, and the max length inside < WIN_SIZE, no any priority in this direction!
                }
                return priority;
              }
            } else {
              cnt = 0;  // reset
            }
          }
        }
      }
      return priority;
    }
        
    function _calLinePriorS(x,y, side) {
      var patchSize = WIN_SIZE - 1;     // there are two patches: left-bottom and right-top
      var indexesX = [];
      var indexesY = [];
      for (var i = 0; i < patchSize; ++i) {
        indexesX[i] = x - patchSize + i;      //  left x-axis
        indexesY[i] = y + patchSize - i;      //  bottom y-axis
        indexesX[i+patchSize] = x + i + 1;    //  right x-axis
        indexesY[i+patchSize] = y - i - 1;    //  top y-axis
      }
      
      var min_scan_size = 3;  // try 2 later
      var priority = 0;
      for (var scan_size = WIN_SIZE-1; scan_size >= min_scan_size; --scan_size) {
        var cnt = 0;  // the number of continuous side
        for (var i = WIN_SIZE-1-scan_size; i < WIN_SIZE-1+scan_size; ++i) {
          // out of scope: no priority increment
          if (indexesX[i] >= 0 && indexesX[i] < GRID_SIZE
            && indexesY[i] >= 0 && indexesY[i] < GRID_SIZE) {
            let pos = getPosition(indexesX[i], indexesY[i]);
            //  only consider positions than have side stones!
            if (pos.getValue() === side) {
              cnt++;
              if (cnt == scan_size) {
                //  a value > the best dot priority: (5+4+3+2)*8
                //  best dot priority: 2+3+...+WIN_SIZE = (2+WIN_SIZE)*(WIN_SIZE-1)/2
                //  totally 8 patches
                //return (2+WIN_SIZE)*(WIN_SIZE-1)/2 * 8;
                priority = (3+scan_size)*scan_size*4; //(2+scan_size+1)*scan_size/2 * 8;
                if (scan_size == WIN_SIZE-1) {
                  return priority;  // return immediately!
                }
                
                // adjustment to distinguish blank or opponent side
                var left = i-scan_size;
                var right = i+1;
                var nBlock = 0;   // the number of the other side stones in two ends.
                if (left < 0 || indexesX[left] < 0 || indexesY[left] >= GRID_SIZE
                    || (!getPosition(indexesX[left], indexesY[left]).isBlank()
                        && getPosition(indexesX[left], indexesY[left]).getValue() != side)) {
                      priority -= 1;
                      nBlock++;
                }
                if (right >= indexesX.length || indexesX[right] >= GRID_SIZE || indexesY[right] < 0
                    || (!getPosition(indexesX[right], indexesY[right]).isBlank()
                        && getPosition(indexesX[right], indexesY[right]).getValue() != side)) {
                      priority -= 1;
                      nBlock++;
                }
                if (nBlock == 2 && scan_size < WIN_SIZE-1) {
                  priority = 0; // both ends are blocked, and the max length inside < WIN_SIZE, no any priority in this direction!
                }
                return priority;
              }
            } else {
              cnt = 0;  // reset
            }
          }
        }
      }
      return priority;
    }
    
    function _calLinePriorB(x,y, side) {
      var patchSize = WIN_SIZE - 1;     // there are two patches: left-top and right-bottom
      var indexesX = [];
      var indexesY = [];
      for (var i = 0; i < patchSize; ++i) {
        indexesX[i] = x - patchSize + i;      //  left x-axis
        indexesY[i] = y - patchSize + i;      //  top y-axis
        indexesX[i+patchSize] = x + i + 1;    //  right x-axis
        indexesY[i+patchSize] = y + i + 1;    //  bottom y-axis
      }
      
      var min_scan_size = 3;  // try 2 later
      var priority = 0;
      for (var scan_size = WIN_SIZE-1; scan_size >= min_scan_size; --scan_size) {
        var cnt = 0;  // the number of continuous side
        for (var i = WIN_SIZE-1-scan_size; i < WIN_SIZE-1+scan_size; ++i) {
          // out of scope: no priority increment
          if (indexesX[i] >= 0 && indexesX[i] < GRID_SIZE
            && indexesY[i] >= 0 && indexesY[i] < GRID_SIZE) {
            let pos = getPosition(indexesX[i], indexesY[i]);
            //  only consider positions than have side stones!
            if (pos.getValue() === side) {
              cnt++;
              if (cnt == scan_size) {
                //  a value > the best dot priority: (5+4+3+2)*8
                //  best dot priority: 2+3+...+WIN_SIZE = (2+WIN_SIZE)*(WIN_SIZE-1)/2
                //  totally 8 patches
                //return (2+WIN_SIZE)*(WIN_SIZE-1)/2 * 8;
                priority = (3+scan_size)*scan_size*4; //(2+scan_size+1)*scan_size/2 * 8;
                if (scan_size == WIN_SIZE-1) {
                  return priority;  // return immediately!
                }
                
                // adjustment to distinguish blank or opponent side
                var left = i-scan_size;
                var right = i+1;
                var nBlock = 0;   // the number of the other side stones in two ends.
                if (left < 0 || indexesX[left] < 0 || indexesY[left] < 0
                    || (!getPosition(indexesX[left], indexesY[left]).isBlank()
                        && getPosition(indexesX[left], indexesY[left]).getValue() != side)) {
                      priority -= 1;
                      nBlock++;
                }
                if (right >= indexesX.length || indexesX[right] >= GRID_SIZE || indexesY[right] >= GRID_SIZE
                    || (!getPosition(indexesX[right], indexesY[right]).isBlank()
                        && getPosition(indexesX[right], indexesY[right]).getValue() != side)) {
                      priority -= 1;
                      nBlock++;
                }
                if (nBlock == 2 && scan_size < WIN_SIZE-1) {
                  priority = 0; // both ends are blocked, and the max length inside < WIN_SIZE, no any priority in this direction!
                }
                return priority;
              }
            } else {
              cnt = 0;  // reset
            }
          }
        }
      }
      return priority;
    }
//=================================    
    // calculate dot priority in horizontal direction (x-axis)
    // side: white/black
    function _calDotPriorX(x,y, side) {
      var patchSize = WIN_SIZE - 1;     // there are two patches: left and right
      var indexesX = [];
      for (var i = 0; i < patchSize; ++i) {
        indexesX[i] = x - patchSize + i;     // left positions
        indexesX[i+patchSize] = x + i + 1;   // right positions
      }
      
      var priority = 0;
      for (var i=0; i<indexesX.length; ++i) {
        // out of scope: no priority increment
        if (indexesX[i] >= 0 && indexesX[i] < GRID_SIZE) {
          let pos = getPosition(indexesX[i], y);
          if (pos.isBlank()) {
            priority++;
          } else if (pos.getValue() === side) {
            priority += (WIN_SIZE - _distance(x, indexesX[i]));
          } else {
            //  test 1: simple
            priority -= (WIN_SIZE - _distance(x, indexesX[i]));
            /*
            //  test 2
            if (indexesX[i] == x-1) {
              priority = 0; // left neighbor: reset
            } else if (indexesX[i] == x+1) {
              break;        // right neighbor: no increment any more!
            } else {
                priority -= (WIN_SIZE - _distance(x, indexesX[i]));
            }
            */
          }
        }
      }
      return priority;
    }
    
    // calculate priority in vertical direction (y-axis)
    // side: white/black
    function _calDotPriorY(x,y, side) {
      var patchSize = WIN_SIZE - 1;     // there are two patches: top and bottom
      var indexesY = [];
      for (var i = 0; i < patchSize; ++i) {
        indexesY[i] = y - patchSize + i;     // top positions
        indexesY[i+patchSize] = y + i + 1;   // bottom positions
      }
      
      var priority = 0;
      for (var i=0; i<indexesY.length; ++i) {
        // out of scope: no priority increment
        if (indexesY[i] >= 0 && indexesY[i] < GRID_SIZE) {
          let pos = getPosition(x, indexesY[i]);
          if (pos.isBlank()) {
            priority++;
          } else if (pos.getValue() === side) {
            priority += (WIN_SIZE - _distance(y, indexesY[i]));
          } else {
            //  test 1
            priority -= (WIN_SIZE - _distance(y, indexesY[i]));
            /*
            //  test 2
            if (indexesY[i] == y-1) {
              priority = 0; // top neighbor: reset
            } else if (indexesY[i] == y+1) {
              break;        // bottom neighbor: no increment any more!
            } else {
              priority -= (WIN_SIZE - _distance(y, indexesY[i]));
            } */
          }
        }
      }
      return priority;
    }
    
    // calculate priority in slash direction ("/")
    // side: white/black
    function _calDotPriorS(x,y, side) {
      var patchSize = WIN_SIZE - 1;     // there are two patches: left-bottom and right-top
      var indexesX = [];
      var indexesY = [];
      for (var i = 0; i < patchSize; ++i) {
        indexesX[i] = x - patchSize + i;      //  left x-axis
        indexesY[i] = y + patchSize - i;      //  bottom y-axis
        indexesX[i+patchSize] = x + i + 1;    //  right x-axis
        indexesY[i+patchSize] = y - i - 1;    //  top y-axis
      }
      
      var priority = 0;
      for (var i=0; i<indexesX.length; ++i) {
        // out of scope: no priority increment
        if (indexesX[i] >= 0 && indexesX[i] < GRID_SIZE
            && indexesY[i] >= 0 && indexesY[i] < GRID_SIZE) {
          let pos = getPosition(indexesX[i], indexesY[i]);
          if (pos.isBlank()) {
            priority++;
          } else if (pos.getValue() === side) {
            // priority += (WIN_SIZE - _distance(y, indexesY[i])); should be same!
            priority += (WIN_SIZE - _distance(x, indexesX[i]));
          } else {
            //  test 1
            priority -= (WIN_SIZE - _distance(x, indexesX[i]));
            /*
            //  test 2
            if (indexesX[i] == x-1) {
              priority = 0; // left neighbor: reset
            } else if (indexesX[i] == x+1) {
              break;        // right neighbor: no increment any more!
            } else {
              priority -= (WIN_SIZE - _distance(x, indexesX[i]));
            }
            */
          }
        }
      }
      return priority;
    }

    // calculate priority in backslash direction ("\")
    // side: white/black
    function _calDotPriorB(x,y, side) {
      var patchSize = WIN_SIZE - 1;     // there are two patches: left-top and right-bottom
      var indexesX = [];
      var indexesY = [];
      for (var i = 0; i < patchSize; ++i) {
        indexesX[i] = x - patchSize + i;      //  left x-axis
        indexesY[i] = y - patchSize + i;      //  top y-axis
        indexesX[i+patchSize] = x + i + 1;    //  right x-axis
        indexesY[i+patchSize] = y + i + 1;    //  bottom y-axis
      }
      
      var priority = 0;
      for (var i=0; i<indexesX.length; ++i) {
        // out of scope: no priority increment
        if (indexesX[i] >= 0 && indexesX[i] < GRID_SIZE
            && indexesY[i] >= 0 && indexesY[i] < GRID_SIZE) {
          let pos = getPosition(indexesX[i], indexesY[i]);
          if (pos.isBlank()) {
            priority++;
          } else if (pos.getValue() === side) {
            // priority += (WIN_SIZE - _distance(y, indexesY[i])); should be same!
            priority += (WIN_SIZE - _distance(x, indexesX[i]));
          } else {
            //  test 1
            priority -= (WIN_SIZE - _distance(x, indexesX[i]));
            /*
            //  test 2
            if (indexesX[i] == x-1) {
              priority = 0; // left neighbor: reset
            } else if (indexesX[i] == x+1) {
              break;        // right neighbor: no increment any more!
            } else {
              priority -= (WIN_SIZE - _distance(x, indexesX[i]));
            }
            */
          }
        }
      }
      return priority;
    }

    
    function _distance(x1, x2) {
      if (x1 < x2) {
        return x2-x1-1;
      } else {
        return x1-x2-1;
      }
    }
    
    // for debug
    function display() {
      for (var x = 0; x < positions.length; ++x) {
        for (var y = 0; y < positions[x].length; ++y) {
          positions[x][y].displayInfo();
        }
      }
    }
    
    function getImpactedRec(pos) {
      var impactLen = WIN_SIZE-1;
      var left    = pos.x-impactLen;
      var right   = pos.x+impactLen;
      var top     = pos.y-impactLen;
      var bottom  = pos.y+impactLen;
      // normalize the coordinates
      if (left < 0) { left = 0; }
      if (top  < 0) { top  = 0; }
      if (right  >= GRID_SIZE) { right  = GRID_SIZE-1; }
      if (bottom >= GRID_SIZE) { bottom = GRID_SIZE-1; }
      //console.log("Impacted rect: [" + left + ", " + top + ", " + right + ", " + bottom + "]");
      return {left: left, top: top, right: right, bottom: bottom};
    }
    
    return {
      init:             init,
      reset:            reset,
      getPosition:      getPosition,
      isGameOver:       isGameOver,
      getBestPosition:  getBestPosition,
      updatePriorities: updatePriorities,
      getImpactedRec:   getImpactedRec,
      display:          display,
    };
})();