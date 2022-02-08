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

let dockHandler = null; // Make drag handlers (for later UI components), dockHandler just applies to Dock dragging.

// Loop
function draw() {
  stats.begin();

  // LOGIC

  // Event handling
  handleEvents();

  // Determine hovered
  let hoverPath = rootDock.dockPathAt(mx,my);

  // RENDERING

  // Background fill
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 700, 700); // TODO: Find canvas values systematically.

  // Draw dock tree
  rootDock.render(ctx);

  // Render dropoints atop
  drawDroppoints(ctx);


  // Debug code 
  // Paint mouse location as rect
  ctx.strokeStyle = "#FFF";
  ctx.strokeRect(mx - 2, my - 2, 4, 4);

  frameCount++;
  stats.end();
  requestAnimationFrame(draw);
}

// Draw droppoints (except for active)
function drawDroppoints(gfx) {
  if (dockHandler) {
    for (const dp of dockHandler.validDroppoints) {
      dp.render(gfx, dockHandler);
    }
  }
}


// Event handling
function handleEvents() {
  if (mouseDown) {
    dockHandler = DockHandler.makeHandler(mx, my, rootDock);
    if (dockHandler) dockHandler.handleMouseDown(mx, my);

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
