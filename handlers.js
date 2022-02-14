const DEBUG_PADDING = 5;
const DEBUG_ENABLED = false; 

class DockHandler {
  static makeHandler(mx, my, rootDock) {
    let dock = rootDock.activateDockAt(mx, my);
    if (dock.isHalf) dock = dock.parent; // Change subject to parent dock if half of a split

    if (dock.immovable) return null;
    let obj = new DockHandler(mx, my, dock, rootDock);
    let droppoints = rootDock.getAllDroppoints(); // TODO: Obtain and filter droppoints by parent subject at creation of dockHandler
    let subjectDrops = obj.subject.getAllDroppoints();
    obj.validDroppoints.push(...droppoints.filter((dp) => !subjectDrops.includes(dp)));
    return obj;
  }
  constructor(mx, my, subject, rootDock = null) {
    this.rx = mx - subject.x; // relative x,y
    this.ry = my - subject.y;
    this.subject = subject; // dock this is acting on.
    this.rootDock = rootDock; // all docks
    this.validDroppoints = [];
    this.hoveredDroppoint = null;

    // Behaviour types
    this.mover = false;
  }

  handleMouseDown(mx, my) {
    // console.log(`mouseDown: ${mx}, ${my}`);
  }
  handleMouseUp(mx, my) {}
  handleClick(mx, my) {
    // console.log("click");
  }

  handleDragStart(mx, my) {
    this.mover = true;
    this.setDockPos(mx, my);
  }

  handleDragging(mx, my) {
    if (this.mover) this.setDockPos(mx, my);
  }

  handleDragEnd(mx, my) {
    if (this.mover) this.setDockPos(mx, my);
    this.mover = false;
    if (this.hoveredDroppoint != null) {
      this.hoveredDroppoint.parent.dropDockHere(this.subject);
    }
  }
  render(gfx) {
    if (DEBUG_ENABLED) {
      gfx.strokeStyle = "#aa2";
      gfx.strokeRect(this.subject.x-DEBUG_PADDING, this.subject.y-DEBUG_PADDING, this.subject.width + DEBUG_PADDING*2, this.subject.height + DEBUG_PADDING*2);
    }
    let vd = dockHandler.validDroppoints;
    for (let i = vd.length-1; i >= 0; i--) {
      vd[i].render(gfx, dockHandler);
    }
  }
  findHovered(mx,my) {
    this.hoveredDroppoint = null;
    let found = false;
    for (const dp of dockHandler.validDroppoints) {
      dp.hovered = false;
      if (dp.contains(mx,my) && !found) {
        dp.hovered = true;
        this.hoveredDroppoint = dp;
        found = true;
      }
    }
  }

  setDockPos(mx, my) {
    this.subject.setPos(mx - this.rx, my - this.ry);
  }
}
