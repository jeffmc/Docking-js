// Stats setup - http://mrdoob.github.io/stats.js/
var stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

// Canvas Setup
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext('2d');
ctx.lineWidth = 1;
ctx.translate(0.5, 0.5);

// Window stack
let wins = [
  new Window(10, 10, 80, 80),
  new Window(70, 25, 90, 60),
  new Window(100, 150, 100, 80),
];

// Dock stack
let docks = [];
let activeDock = null;
for (win of wins) {
  docks.push(win.dock);
}

// Mouse Data
let mx = 0;
let my = 0;

// multi-frame
let mousePressed = false;
let dragging = false;

// single-frame
let clicked = false;
let dragStart = false;
let dragEnd = false;
let mouseDown = false;

// Init
activateDock(wins[1].dock);

// Loop
function draw() {
  stats.begin();

  handleEvents();

  for (let i = docks.length - 1; i >= 0; i--) {
    docks[i].render(ctx);
  }

  stats.end();
  requestAnimationFrame(draw);
}

// Docking functions
function findDockAt(xx, yy) {
  for (let i = 0; i < docks.length; i++) {
    if (docks[i].contains(xx, yy))
      return docks[i];
  }
  return null;
}

function activateDockAt(xx, yy) {
  let dock = findDockAt(xx, yy);
  if (dock != null) {
    activateDock(dock);
  }
}

function activateDock(newDock) {
  for (dock of docks) { // TODO: only deactivate last dock.
    dock.active = false;
  }
  let idx = docks.indexOf(newDock);
  if (idx < 0) console.log("ERROR: COULDN'T FIND DOCK IN activateDock()");
  docks.splice(idx, 1);
  newDock.active = true;
  activeDock = newDock;
  docks.unshift(newDock);
}

// Event handling
function handleEvents() {
  if (mouseDown) {
    handleMouseDown();
    mouseDown = false;
  }
  if (clicked) {
    handleClick();
    clicked = false;
  }
  if (dragStart) {
    handleDragStart();
    dragStart = false;
  }
  if (dragging) handleDragging();
  if (dragEnd) {
    handleDragEnd();
    dragEnd = false;
  }
}

function handleClick() {
  // console.log("click");
}

function handleDragStart() {
  // console.log("dragStart");
}

function handleDragging() {
  // console.log("dragging");
}

function handleDragEnd() {
  // console.log("dragEnd");
}

function handleMouseDown() {
  // console.log(`mouseDown: ${mx}, ${my}`);
  activateDockAt(mx, my);
}

// Mouse Polling
canvas.addEventListener("mousemove", (e) => {
  mx = e.offsetX;
  my = e.offsetY;
  if (mousePressed) {
    if (!dragging) dragStart = true;
    dragging = true;
  }
})
canvas.addEventListener("mousedown", (e) => {
  if (e.button == 0) {
    mousePressed = true;
    mouseDown = true;
  }
})
canvas.addEventListener("mouseup", (e) => {
  if (e.button == 0) {
    mousePressed = false;
    if (dragging) {
      dragEnd = true;
    } else {
      clicked = true;
    }
    dragging = false;
  }
});

// Start loop
requestAnimationFrame(draw);