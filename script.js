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

// Add example solo docks
rootDock.addSolo(new Frame(10, 10,  160, 160, "Aye"));
rootDock.addSolo(new Frame(10, 180, 180, 120, "Bee"));
rootDock.addSolo(new Frame(10, 310, 200, 160, "Cow"));

// example horizontal split
rootDock.addSplit(Dockspace.solo(new Frame(240, 10, 240, 120, "Left")), Dockspace.solo(new Frame(240, 10, 200, 140, "Right")));
rootDock.addChild( // example vertical split
  Dockspace.split(
    Dockspace.solo(new Frame(240, 200, 400, 200, "Top")),
    Dockspace.solo(new Frame(240, 200, 280, 120, "Bottom")),
    true
  )
);

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

let dockHandler = null; // Make drag handlers (for later UI components), dockHandler just applies to Dock dragging.

// Loop
function draw() {
  stats.begin();

  // LOGIC

  // Event handling
  handleEvents();

  // Determine hovered dock
  let hoverPath = rootDock.dockPathAt(mx,my);

  // Find hovered droppoint
  if (dockHandler) {
    dockHandler.findHovered(mx,my);
  }

  // RENDERING

  // Background fill
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, 700, 700); // TODO: Find canvas values systematically.

  // Draw dock tree
  rootDock.render(ctx);

  // Render dropoints atop
  if (dockHandler) dockHandler.render(ctx);

  // Debug code 
  // Paint mouse location as rect
  ctx.strokeStyle = "#FFF";
  ctx.strokeRect(mx - 2, my - 2, 4, 4);

  stats.end();
  requestAnimationFrame(draw);
}

// Event handling
function handleEvents() {
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
}

// Mouse Polling
canvas.addEventListener("mousemove", (e) => {
  mx = e.offsetX;
  my = e.offsetY;
  if (mousePressed&&!dragging) {
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
      dragging = false;
    } else {
      clicked = true;
    }
  }
});

// Start loop
requestAnimationFrame(draw);
