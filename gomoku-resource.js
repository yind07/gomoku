//  renju-resource.js:
//    This file defines constants and global variables across the game.
//  =========================================================================
const GRID_SIZE = 15;               // grid size of the game board(odd number and >=15)
const UNIT_SIZE = 44;
const GAP_SIZE = UNIT_SIZE;       // the gap between canvas and board
const STONE_RADIUS = UNIT_SIZE/4;
const LINE_WIDTH = 2;
const WIN_SIZE = 5;
const FIRST_PLAYER = "black";
const SECOND_PLAYER = "white";

// Some global shared variables
var canvas, context;
var hd, flash, lastBoardPos; // for last stone flashing