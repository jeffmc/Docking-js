class DockHandler {
    static makeHandler(mx,my,rootDock) {
        let dock = rootDock.activateDockAt(mx,my);
        if (dock.isHalf) dock = dock.parent;
        return new DockHandler(mx,my,dock);
    }
    constructor(mx, my, subject, rootDock = null) {
        this.rx = mx - subject.x; // relative x,y
        this.ry = my - subject.y;
        this.subject = subject; // dock this is acting on.
        this.rootDock = rootDock; // all docks
        
        // Behaviour types
        this.mover = false; 
    }

    handleMouseDown(mx, my) {
        // console.log(`mouseDown: ${mx}, ${my}`);
    }
    handleMouseUp(mx, my) {
        
    }
    handleClick(mx, my) {
        // console.log("click");
    }

    handleDragStart(mx, my) {
        this.mover = true;
        this.setDockPos(mx,my);
    }

    handleDragging(mx, my) {
        if (this.mover) this.setDockPos(mx,my);
    }

    handleDragEnd(mx, my) {
        if (this.mover) this.setDockPos(mx,my);
        this.mover = false;
    }

    setDockPos(mx,my) {
        this.subject.setPos(mx-this.rx,my-this.ry);
    }
}