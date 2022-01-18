class DockHandler {
    constructor(mx, my, dock, docks) {
        this.rx = mx - dock.x; // relative x,y
        this.ry = my - dock.y;
        this.dock = dock; // dock this is acting on.
        this.docks = docks; // all docks
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
        this.dock.setPos(mx-this.rx,my-this.ry);
    }
}