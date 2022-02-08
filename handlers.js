class DockHandler {
  static makeHandler(mx, my, rootDock) {
    let dock = rootDock.activateDockAt(mx, my);
    if (dock.isHalf) dock = dock.parent; // Change subject to parent dock if half of a split

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
  }

  setDockPos(mx, my) {
    this.subject.setPos(mx - this.rx, my - this.ry);
  }
}
