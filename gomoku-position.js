//  Board position
//  =======================================================

function Position(x, y) {
  this.x = x;
  this.y = y;
  this.priority = [];
  this.reset();
}

Position.prototype.displayInfo = function() {
  console.log("(" + this.x + ", " + this.y
              + "), value: " + this.getValue()
              + ", pW: " + this.getPriority("white")
              + ", pB: " + this.getPriority("black"));
}

Position.prototype.reset = function() {
  this.setValue(null);  // blank position
  this.setPriority(-1, FIRST_PLAYER);
  this.setPriority(-1, SECOND_PLAYER);
}

Position.prototype.setValue = function(val) {
  this.value = val;
  if (val !== null) {
    this.setPriority(0, FIRST_PLAYER);
    this.setPriority(0, SECOND_PLAYER);
    console.log("Put \"" + val + "\" stone at (" + this.x + ", " + this.y + ")");
  }
}
Position.prototype.getValue = function() {
  return this.value;
}

Position.prototype.setPriority = function(val, side) {
  this.priority[side] = val;
}
Position.prototype.getPriority = function(side) {
  return this.priority[side];
}

Position.prototype.isBlank = function() {
  return this.getValue() === null;
}
/*
Position.prototype.isFirstPlayer = function() {
  return this.getValue() === FIRST_PLAYER;
}

Position.prototype.isSecondPlayer = function() {
  return this.getValue() === SECOND_PLAYER;
} */