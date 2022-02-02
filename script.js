// Stats setup - http://mrdoob.github.io/stats.js/
var stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

// Canvas Setup
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
ctx.lineWidth = 1;
ctx.translate(0.5, 0.5);

// Dock stack
let rootDock = Dockspace.root(0, 0, canvas.width, canvas.height);
let activeRootDock = null;
let activeLeafDock = null;

// Add example docks
let frs = [ 
  new Frame(10, 10, 160, 160, "Aye"), 
  new Frame(70, 25, 180, 120, "Bee"), 
  new Frame(100, 150, 200, 160, "Cow") 
];
for (fr of frs) { // example solos
  rootDock.addChild(Dockspace.solo(fr));
}
rootDock.addChild( // example split
  Dockspace.split(
    new Frame(120, 220, 240, 120, "Left"),
    new Frame(160, 350, 280, 140, "Right")
  )
);

// Mouse Data
let mx = 0;
let my = 0;

let frameCount = 0;

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
// activateDock(rootDocks[0]);

// Loop
function draw() {
  stats.begin();

  // Event handling
  handleEvents();

  // Determine hovered
  let hoverPath = rootDock.dockPathAt(mx,my);

  rootDock.deactivate();
  rootDock.activateAt(mx,my);

  // Draw background
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 700, 700); // TODO: Find canvas values systematically.

  // Draw slow-pulsing rect
  let v = frameCount % 255;
  ctx.fillStyle = `rgb(${v},${v},${v})`;
  ctx.fillRect(0,0,20,20);

  // Draw rootDocks (except for active)
  // for (let i = rootDocks.length - 1; i > 0; i--) {
  //   rootDocks[i].render(ctx);
  // }
  rootDock.render(ctx);

  // Draw active dock
  // rootDocks[0].render(ctx);

  // Draw droppoints (except for active)
  if (dockHandler) {
    // for (let i = rootDocks.length - 1; i > 0; i--) {
    rootDock.renderDroppoints(ctx);
    // }
  }

  // Paint mouse location
  ctx.strokeStyle = "#FFF";
  ctx.strokeRect(mx - 2, my - 2, 4, 4);

  frameCount++;
  stats.end();
  requestAnimationFrame(draw);
}

// Docking functions
function activateDockAt(xx, yy) {
  // find root dock
  let path = rootDock.dockPathAt(xx,yy);
  console.log(path);
  // activateDock(rDock, lDock);
  return path[path.legnth-1]; // Found or null
}

function activateDock(newDock) {
  for (dock of rootDocks) {
    // TODO: only deactivate last dock.
    dock.deactivate();
  }
  let idx = rootDocks.indexOf(newDock);
  if (idx < 0) {
    console.log("ERROR: COULDN'T FIND DOCK IN activateDock()");
  } else {
    rootDocks.splice(idx, 1);
    newDock.active = true;
    activeRootDock = newDock;
    rootDocks.unshift(newDock);
  }
}

// Event handling
function handleEvents() {
  if (mouseDown) {
    let dock = activateDockAt(mx, my);
    if (dock) {
      dockHandler = new DockHandler(mx, my, dock, rootDocks);
      dockHandler.handleMouseDown(mx, my);
    }

    mouseDown = false;
  }
  if (mouseUp) {
    if (dockHandler) dockHandler.handleMouseUp(mx, my);
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
});
canvas.addEventListener("mousedown", (e) => {
  if (e.button == 0) {
    mousePressed = true;
    mouseDown = true;
  }
});
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
