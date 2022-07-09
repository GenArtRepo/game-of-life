/*
** Game of Life
* Cristian Rojas Cardenas, April 2022
* Algorithm based on the P5 implementation.
* See the example here: 
* https://p5js.org/examples/simulate-game-of-life.html
* 
* The algorithm operates on a board set by a grid of cells.
* Each cell can be in one of two possible states: alive or dead.
* The state of the cells is updated in discrete time steps.
* The update rules are:
*   -	Loneliness: If the cell has less than 2 neighbours it dies.
*   -	Overpopulation: if the cell has more than 3 neighbours it dies.
*   -	Reproduction: if the cell has exactly 3 neighbours it becomes a live cell.
*   -	Stasis: if the cell has 2 or 3 neighbours it lives on to the next generation.
* In this example, we start by defining the grid in the setup function.
* Then, the initial state of the cells is defined by the random function or user 
* modification of the map.
* The generate function updates the grid through the rules every timestep (frame). 
*/


let columns;
let rows;
let board;
let next;
let play;
let borders;
let settings;
let width;
let height;


// Settings, values used in the algorithm execution
settings = { 
    Play: function(){ play=true; },
    Pause: function(){ play=false; },
    Reset: function(){ play=false; fillBoard(randomly=false); },
    Random: function(){ play=false; fillBoard(randomly=true); },
    w: 10, // Width of each square in the grid
};

function gui(){
    // Adding the GUI menu
    var gui = new dat.GUI();
    gui.width = 100;
    gui.add(settings,'Play');
    gui.add(settings,'Pause');
    gui.add(settings,'Reset');
    gui.add(settings,'Random');
    gui.add(settings,'w', 3, 50).onChange(function(){
        setBoard();
    });
};



function setup() {
    gui();
    // Creating the canvas 
    canvas = createCanvas(720, 400);  
    width = canvas.width;
    height = canvas.height;

    frameRate(10);

    // Creating the board matrix
    setBoard();
}

// Returns the cell selected through the mouse coordinates
function getCell(){
    var cord = {
    x: floor((mouseX - borders.l)/settings.w),
    y: floor((mouseY - borders.u)/settings.w)
    };
    return cord;
}

function setBoard(){
    // Setting border values
    borders = {
        u: settings.w,
        l: settings.w,
        r: 100 + 100 % settings.w,
        d: settings.w,
    };
    
    // Recalculate width and height using the border
    width_ = width - borders.l - borders.r;
    height_ = height - borders.u - borders.d;
        
    // Calculate columns and rows
    columns = math.floor(width_ / settings.w);
    rows = math.floor(height_ / settings.w);
    board = new Array(columns);
    for (let i = 0; i < columns; i++) {
        board[i] = new Array(rows);
    }
    // Going to use multiple 2D arrays and swap them
    next = new Array(columns);
    for (i = 0; i < columns; i++) {
        next[i] = new Array(rows);
    }
    init();
};



// Fill board given the randomly arg.
function fillBoard(randomly=false){
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
        // Lining the edges with 0s
        if (i == 0 || j == 0 || i == columns-1 || j == rows-1) board[i][j] = 0;
        else{
            // Filling the rest randomly
            if(randomly) board[i][j] = floor(random(2));
            else board[i][j] = 0;
        } 
        next[i][j] = 0;
    }
  }
}

function init() {
    fillBoard(true);
}

function draw() {
    background(255);
    if(play) generate();
    for ( let i = 0; i < columns; i++) {
        for ( let j = 0; j < rows; j++) {
            if ((board[i][j] == 1)) fill("#006DAE");
            else fill(255);
            stroke(0);
            strokeWeight(0.1);
            rect(i * settings.w + borders.l, j * settings.w + borders.u, settings.w-1, settings.w-1);
        }
    }
}

// At clicking the grid the state of the cell selected is changed
function mousePressed() {
    if ( mouseX>borders.l & mouseY>borders.u & mouseX<(width-borders.r) & mouseY<(height-borders.d)){
        cord = getCell();
        x = cord.x
        y = cord.y
        if(board[x][y] == 1) board[x][y] = 0;
        else board[x][y] = 1;
    }
}

function calculate_borders(xi, yj){
    if(xi >= columns) xi -= columns - 1;
    if(yj >= rows) yj -= rows - 1;
    if(xi < 0) xi += columns;
    if(yj < 0) yj += rows;

    return {xi, yj};
}

// The process of creating the new generation
function generate() {
    // Loop through every spot in our 2D array and check spots neighbors
    for (let x = 0; x < columns; x++) {
        for (let y = 0; y < rows; y++) {
            // Add up all the states in a 3x3 surrounding grid
            let neighbors = 0;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    let{ xi, yj } = calculate_borders(x+i, y+j);
                    neighbors += board[xi][yj];
                }
            }
            neighbors -= board[x][y];
            
            // Rules of Life
            // 1. Loneliness
            if((board[x][y] == 1) && (neighbors <  2)) next[x][y] = 0;  
            // 2. Overpopulation
            else if ((board[x][y] == 1) && (neighbors >  3)) next[x][y] = 0;   
            // 3. Reproduction
            else if ((board[x][y] == 0) && (neighbors == 3)) next[x][y] = 1;  
            // 4. Stasis
            else next[x][y] = board[x][y]; 
            }
    }

    // Swaping the states to the next generation
    let temp = board;
    board = next;
    next = temp;
}