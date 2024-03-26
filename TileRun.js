// Written by Alex Manno

const CANVAS_WIDTH = 490;
const CANVAS_HEIGHT = 490;

const NUM_TILES_WIDE = 10;
const NUM_TILES_HIGH = 10;

const PATH_LENGTH = 65;

const EMPTY_TILE = "gray";
const UNTRAVERSED_PATH_TILE = "blue";
const TRAVERSED_PATH_TILE = "green";
const PLAYER_TILE = "yellow";

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
    if (JSON.stringify(newPos) == JSON.stringify(prevPos[prevPos.length - 1])) { // backtracking along path
        updateTile(currentPos[0], currentPos[1], UNTRAVERSED_PATH_TILE);
        updateTile(prevPos[prevPos.length - 1][0], prevPos[prevPos.length - 1][1], PLAYER_TILE);
        prevPos.pop();
    } else if (isMovable(newPos[0], newPos[1])) { // all other movement
        updateTile(currentPos[0], currentPos[1], TRAVERSED_PATH_TILE);
        updateTile(newPos[0], newPos[1], PLAYER_TILE);
    }

    if (isVictory()) setup();
    drawGame();
}

/* given a starting set of x/y coordinates and a path length, creates a path
    of the given length starting at the given set of coordinates */
function createPath(startX, startY, length) {
    var path; // path to be drawn
    var nextStep;
    var x;
    var y;
    var numAttempts = 1;
    for (var i = 0; i < length; i++) {
        if (i == 0) {
            path = [];
            nextStep = [startX, startY];
        }
        x = nextStep[0]; // set up x coordinate for next step
        y = nextStep[1]; // set up y coordinate for next step
        path.push(findNextStep(x, y));
        nextStep = path[path.length - 1];
        updateTile(x, y, UNTRAVERSED_PATH_TILE); // draw current tile blue
        if (nextStep == undefined) { // if path can't continue but is less than specified length, restart path
            clearBoard();
            numAttempts++;
            i = -1;
        }
    }
    debugPathLength(path);
    debugPathAttempts(numAttempts);
    updateTile(startX, startY, PLAYER_TILE); // initiate starting position
    prevPos = []; // clear out previous position
    drawGame();
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
    return x >= 0 && y >= 0 && x < board.length && y < board[x].length && board[x][y] == EMPTY_TILE;
}

function isMovable(x, y) {
    return x >= 0 && y >= 0 && x < board.length && y < board[x].length && board[x][y] != EMPTY_TILE && (board[x][y] != TRAVERSED_PATH_TILE || prevPos[prevPos.length - 1] == [x, y]);
}

function clearBoard() {
    for (var i = 0; i < NUM_TILES_WIDE; i++) {
        for (var j = 0; j < NUM_TILES_HIGH; j++) {
            updateTile(i, j, EMPTY_TILE);
        }
    }
}

function setup() {
    clearBoard();
    createPath(currentPos[0], currentPos[1], PATH_LENGTH);
}

/* returns true if path has been cleared, returns false if path hasn't been cleared */
function isVictory() {
    for (var i = 0; i < NUM_TILES_WIDE; i++) {
        for (var j = 0; j < NUM_TILES_HIGH; j++) {
            if (board[i][j] == UNTRAVERSED_PATH_TILE) return false;
        }
    }
    return true;
}

function updateTile(x, y, color) {
    board[x][y] = color;
    if (color == PLAYER_TILE) currentPos = [x, y];
    if (color == TRAVERSED_PATH_TILE) prevPos.push([x, y]);
}

/* given a set of x/y coordinates and a color, draws the tile at those coordinates the given color */
function drawTile(x, y, color) {
    var context = document.getElementById("canvas").getContext("2d");
    context.fillStyle = color;
    context.fillRect(x * (CANVAS_WIDTH / NUM_TILES_WIDE), y * (CANVAS_HEIGHT / NUM_TILES_HIGH), CANVAS_WIDTH / NUM_TILES_WIDE - 1, CANVAS_HEIGHT / NUM_TILES_HIGH - 1);
}

function drawGame() {
    for (var i = 0; i < NUM_TILES_WIDE; i++) {
        for (var j = 0; j < NUM_TILES_HIGH; j++) {
            drawTile(i, j, board[i][j])
        }
    }
}

function debugGame() {
    var body = document.querySelector("body");
    var debugAreaPathLength = document.createElement("div");
    debugAreaPathLength.setAttribute("id", "debug-area-path-length");
    body.append(debugAreaPathLength);
    var debugAreaPathAttempts = document.createElement("div");
    debugAreaPathAttempts.setAttribute("id", "debug-area-path-attempts");
    body.append(debugAreaPathAttempts);
    //body.append("<div id='debug-area'></div>");
}

function debugPathLength(path) {
    var debugArea = document.querySelector("#debug-area-path-length");
    var debugMessage = "Current path length: " + path.length;
    debugArea.textContent = debugMessage;
    console.log(debugMessage);
}

function debugPathAttempts(numAttempts) {
    var debugArea = document.querySelector("#debug-area-path-attempts");
    var debugMessage = "Number of attempts to achieve this path length: " + numAttempts;
    debugArea.textContent = debugMessage;
    console.log(debugMessage);
}

debugGame();