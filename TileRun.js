// Written by Alex Manno

const CANVAS_WIDTH = 490
const CANVAS_HEIGHT = 490

const NUM_TILES_WIDE = 10
const NUM_TILES_HIGH = 10

document.onkeydown = checkKey;
var direction;
var currentPos = [0, 0];
var prevPos;

var board = new Array(NUM_TILES_WIDE);
for (var i = 0; i < NUM_TILES_WIDE; i++) {
    board[i] = new Array(NUM_TILES_HIGH);
}

function checkKey(e) {
    e = e || window.event;
    if (e.keyCode == "37") direction = "left";
    if (e.keyCode == "38") direction = "up";
    if (e.keyCode == "39") direction = "right";
    if (e.keyCode == "40") direction = "down";
    if (direction != "") move(direction);
    direction = "";
}

function move(direction) {
    var newPos;
    if (direction == "left") newPos = [currentPos[0] - 1, currentPos[1]];
    if (direction == "up") newPos = [currentPos[0], currentPos[1] - 1];
    if (direction == "right") newPos = [currentPos[0] + 1, currentPos[1]];
    if (direction == "down") newPos = [currentPos[0], currentPos[1] + 1];
    if (JSON.stringify(newPos) == JSON.stringify(prevPos[prevPos.length - 1])) {
        drawTile(currentPos[0], currentPos[1], "blue");
        drawTile(prevPos[prevPos.length - 1][0], prevPos[prevPos.length - 1][1], "yellow");
        prevPos.pop();
    } else if (isMovable(newPos[0], newPos[1])) {
        drawTile(currentPos[0], currentPos[1], "green");
        drawTile(newPos[0], newPos[1], "yellow");
    }

    if (isVictory()) setup();
}

/* given a starting set of x/y coordinates and a path length, draws a path
    of the given length starting at the given set of coordinates */
function drawPath(startX, startY, length) {
    var path = []; // path to be drawn
    var x = startX;
    var y = startY;
    var nextStep;
    for (var i = 0; i < length; i++) {
        nextStep = path[path.push(findNextStep(x, y)) - 1];
        if (nextStep == undefined) break; // if path can't continue, end path here
        drawTile(x, y, "blue"); // draw current tile blue
        x = nextStep[0]; // set up x coordinate for next step
        y = nextStep[1]; // set up y coordinate for next step
    }
    drawTile(startX, startY, "yellow"); // initiate starting position
    prevPos = []; // clear out previous position
}

/* given a set of coordinates, find a random next step in the path to draw */
function findNextStep(x, y) {
    choices = [];
    if (isValid(x - 1, y)) choices.push([x - 1, y]);
    if (isValid(x + 1, y)) choices.push([x + 1, y]);
    if (isValid(x, y - 1)) choices.push([x, y - 1]);
    if (isValid(x, y + 1)) choices.push([x, y + 1]);
    return choices[Math.floor(Math.random() * choices.length)];
}

/* given a set of coordinates, returns true if a path can be drawn and false if it can't -
    for a path to be drawn, it must be in the board and be gray */
function isValid(x, y) {
    return x >= 0 && y >= 0 && x < board.length && y < board[x].length && board[x][y] == "gray";
}

function isMovable(x, y) {
    return x >= 0 && y >= 0 && x < board.length && y < board[x].length && board[x][y] != "gray" && (board[x][y] != "green" || prevPos[prevPos.length - 1] == [x, y]);
}

function setup() {
    for (var i = 0; i < NUM_TILES_WIDE; i++) {
        for (var j = 0; j < NUM_TILES_HIGH; j++) {
            drawTile(i, j, "gray");
        }
    }
    drawPath(currentPos[0], currentPos[1], 15);
}

/* returns true if path has been cleared, returns false if path hasn't been cleared */
function isVictory() {
    for (var i = 0; i < NUM_TILES_WIDE; i++) {
        for (var j = 0; j < NUM_TILES_HIGH; j++) {
            if (board[i][j] == "blue") return false;
        }
    }
    return true;
}

/* given a set of x/y coordinates and a color, draws the tile at those coordinates the given color */
function drawTile(x, y, color) {
    board[x][y] = color;
    if (color == "yellow") currentPos = [x, y];
    if (color == "green") prevPos.push([x, y]);
    var context = document.getElementById("canvas").getContext("2d");
    context.fillStyle = color;
    context.fillRect(x * (CANVAS_WIDTH / NUM_TILES_WIDE), y * (CANVAS_HEIGHT / NUM_TILES_HIGH), CANVAS_WIDTH / NUM_TILES_WIDE - 1, CANVAS_HEIGHT / NUM_TILES_HIGH - 1);
}