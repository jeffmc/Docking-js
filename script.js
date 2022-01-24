// Stats setup - http://mrdoob.github.io/stats.js/
var stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

// Canvas Setup
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext('2d');
ctx.lineWidth = 1;
ctx.translate(0.5, 0.5);

// Frame stack
let frs = [
  new Frame(10, 10, 160, 160),
  new Frame(70, 25, 180, 120),
  new Frame(100, 150, 200, 160),
];

// Dock stack
let docks = [];
let activeDock = null;
for (fr of frs) {
  docks.push(fr.dock);
}

// Merge last two
{
  let a = docks.pop().frame, b = docks.pop().frame;
  docks.push(Dockspace.split(a,b));
}

// Mouse Data
let mx = 0;
let my = 0;

// multi-frame
let mousePressed = false;
let dragging = false;

// single-frame
let mouseDown = false;
let mouseUp = false;
let clicked = false;
let dragStart = false;
let dragEnd = false;

let dockHandler = null; 

// Init
activateDock(docks[0]);

// Loop
function draw() {
  stats.begin();

  // Event handling
  handleEvents();

  // Determine hovered
  let nothingHovered = true;
  for (let i=0;i<docks.length;i++) {
    docks[i].hovered = false;
    if (nothingHovered&&docks[i].contains(mx,my)) {
      nothingHovered = false;
      docks[i].hovered = true;
    }
  }

  // Draw background
  ctx.fillStyle = "#000";
  ctx.fillRect(0,0,700,700); // TODO: Find canvas values systematically.

  // Draw docks (except for active)
  for (let i = docks.length - 1; i > 0; i--) {
    docks[i].render(ctx);
  }

  // Draw active dock
  docks[0].render(ctx);

  // Draw droppoints (except for active)
  if (dockHandler) {
    for (let i = docks.length - 1; i > 0; i--) {
      docks[i].renderDroppoints(ctx);
    }
  }
  
  // Paint mouse location
  ctx.strokeStyle = "#FFF";
  ctx.strokeRect(mx-2,my-2,4,4);

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
  activateDock(dock);
  return dock; // Found or null
}

function activateDock(newDock) {
  for (dock of docks) { // TODO: only deactivate last dock.
    dock.active = false;
  }
  let idx = docks.indexOf(newDock);
  if (idx < 0) {
    console.log("ERROR: COULDN'T FIND DOCK IN activateDock()");
  } else {
    docks.splice(idx, 1);
    newDock.active = true;
    activeDock = newDock;
    docks.unshift(newDock);
  }
}

// Event handling
function handleEvents() {
  if (mouseDown) {
    let dock = activateDockAt(mx,my);
    if (dock) {
      dockHandler = new DockHandler(mx,my,dock,docks);
      dockHandler.handleMouseDown(mx, my);
    }

    mouseDown = false;
  }
  if (mouseUp) {
    if (dockHandler) dockHandler.handleMouseUp(mx,my);
    dockHandler = null;

    mouseUp = false;
  }
  if (dockHandler) {
    if (clicked) {
      dockHandler.handleClick(mx, my);
      clicked = false;
    }
    if (dragStart) {
      dockHandler.handleDragStart(mx, my);
      dragStart = false;
    }
    if (dragging) dockHandler.handleDragging(mx, my);
    if (dragEnd) {
      dockHandler.handleDragEnd(mx, my);
      dragEnd = false;
    }
  }
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
    mouseUp = true;
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