const DOCK_PADDING = 2;
const DOCK_TITLE_HEIGHT = 14;

const DROPPOINT_RADIUS = 20;
const DROPPOINT_THICKNESS = 15;
const DROPPOINT_MARGIN = 10;

class Dockspace { // A node in a dock tree.
  constructor(xx, yy, w, h) { // r should only be true when making root dockspace.
    this.x = xx - DOCK_PADDING;
    this.y = yy - DOCK_PADDING;
    this.width = w + DOCK_PADDING * 2;
    this.height = h + DOCK_PADDING * 2;
    
    this.parent = null; // null if root dock.

    this.active = false;
    this.hovered = false;

    this.doRenderElements = true;
	  this.doDrawTitle = true;

    this.solo = false;
    this.isHalf = false; // child of a split

    this.split = false;
    
    this.tabbed = false;
  }

  // Root dockspace, contains floating docks of any kind.
  static root(x,y,w,h) {
    let obj = new Dockspace(0,0,0,0, null);
    obj.doRenderElements = false;
    obj.doDrawTitle = false;
    obj.isRoot = true;
    obj.children = [];

    obj.setSize(w,h);
    obj.setPos(x,y);
    return obj;
  }

  // Solo dockspace, contains single frame
  static solo(fr, ih = false, p = null) {
    if (!fr instanceof Frame) alert("ERROR: fr arg not Frame instance!");
    let obj = new Dockspace(0,0,0,0, p);
    obj.frame = fr;
    obj.solo = true;
    
    obj.isHalf = ih;
    obj.parent = p;

    obj.setInnerSize(fr.width, fr.height);
    obj.setPos(fr.x, fr.y);
    return obj;
  }

  // Split dock, contains two subdocks of any kind. (horizontal or vertical mode)
  static split(a, b, vert) {
    if (!a instanceof Frame) alert("ERROR: arg a not Frame instance!");
    if (!b instanceof Frame) alert("ERROR: arg b not Frame instance!");
    let obj = new Dockspace(a.x, a.y, a.width, a.height);
    if (vert) {
      obj.vertical = true;
    } else {
      obj.vertical = false;
    }
    obj.split = true;
    obj.doDrawTitle = false;
    obj.doRenderElements = false;
    obj.a = Dockspace.solo(a, true, obj); // left/top
    obj.b = Dockspace.solo(b, true, obj); // right/bottom

    obj.splitter = 0; // TODO: Add splitter movement

    if (obj.vertical) {
      alert("Vertical splitting needs to be implemented!");
    } else {
      obj.setInnerSize(
        a.width + b.width,
        a.height >= b.height ? a.height : b.height
      );
      obj.splitter = a.width;
    }

    return obj;
  }

  // Tabbed dock, contains n>0 subdocks of any kind. TODO: Decide whether tabbed docks can contain tabbed docks.
  static tabbed(...frs) {
    for (fr in frs) {
      if (fr instanceof Frame) alert("ERROR: fr element not Frame instance!");
    }
    if (frs.length < 1) {
      alert("WARNING: Frame array length of 0!");
    } else if (frs.length < 2) {
      return solo(frs[0]);
    } else {
      let f = frs[0];
      let obj = new Dockspace(f.x, f.y, f.width, f.height);
      obj.frames = frs;
      obj.tabbed = true;
      return obj;
    }
  }
  render(gfx) {
    if (this.doRenderElements) this.renderElements(gfx);
    if (this.isRoot) {
      // gfx.fillStyle = "#aa2222";
      // gfx.fillRect(this.x,this.y,this.width,this.height);
      for (const child of this.children) 
        child.render(gfx);
      return;
    }
    if (this.solo) {
      this.frame.render(gfx);
      return;
    }
    if (this.split) {
      this.a.render(gfx);
      this.b.render(gfx);
      return;
    }
    if (this.tabbed) {
      return;
    }
  }
  renderElements(gfx) {
    gfx.fillStyle = this.active
      ? "#2222aa"
      : this.hovered
      ? "#22aa22"
      : "#000055";
    gfx.fillRect(this.x, this.y, this.width, this.height);

    gfx.strokeStyle = this.active ? "#4444dd" : "#111188";
    gfx.strokeRect(this.x, this.y, this.width, this.height);
  }
  renderDroppoints(gfx) { // Add a droppoint class
    if (this.solo) this.frame.renderDroppoint(gfx);
    if (this.split) {
      this.a.renderDroppoints(gfx);
      this.b.renderDroppoints(gfx);
    }
    if (this.tabbed) {
      // TODO: Do this better, don't render all frames droppoints.
      for (fr in this.frames) {
        fr.renderDroppoint(gfx);
      }
    }
  }
  findLeafDockAt(xx,yy) {
    if (this.contains(xx,yy)) {
      if (this.solo) return this;
      if (this.split) {
        if (this.a.contains(xx,yy)) {
          return this.a.findLeafDockAt(xx,yy);
        } else if (this.b.contains(xx,yy)) {
          return this.b.findLeafDockAt(xx,yy);
        }
      }
      if (this.tabbed) {
        alert("Add findLeafDockAt() for tabbed docks!"); // TODO: findLeafDockAt() for tabbed.
        return this;
      }
    }
  }

  activateAt(xx,yy) {
    if (this.contains(xx,yy)) {
      this.intl_activate();
      if (this.split) {
        if (this.a.contains(xx,yy)) {
          this.a.activateAt(xx,yy);
        } else if (this.b.contains(xx,yy)) {
          this.b.activateAt(xx,yy);
        }
      }
      if (this.tabbed) {
        alert("Add this funcitonality for tabbed dock activation!"); // TODO: Activation code for tabbed docks.
      }
    }
  }
  intl_activate() {
    this.active = true;
    if (this.solo) this.frame.intl_activate();
  }
  deactivate() {
    this.active = false;
    if (this.solo) this.frame.deactivate();
    if (this.split) {
      this.a.deactivate();
      this.b.deactivate();
    }
    if (this.tabbed) {
      for (fr of this.frames) {
        fr.deactivate();
      }
    }
  }

  contains(xx, yy) {
    return (
      xx >= this.x &&
      yy >= this.y &&
      xx <= this.x + this.width &&
      yy <= this.y + this.height
    );
  }
  setPos(x, y) {
    this.x = x;
    this.y = y;
    if (this.solo) this.frame.setPos(x + DOCK_PADDING, y + DOCK_PADDING + (this.doDrawTitle?DOCK_TITLE_HEIGHT:0));
    if (this.split) {
      this.updateSplitWindows();
    }
    if (this.tabbed) alert("Implement Dockspace.setPos() for tabbed");
  }
  setSize(ww,hh) {
    this.width = ww;
    this.height = hh;
    if (this.solo) {
      this.frame.setSize(ww - DOCK_PADDING * 2, hh - DOCK_PADDING * 2 - (this.doDrawTitle?DOCK_TITLE_HEIGHT:0));
      return;
    }
    if (this.split) {
      this.updateSplitWindows();
      return;
    }
    if (this.tabbed) {
      alert("Implement Dockspace.setSize() for tabbed");
      return;
    }
  }
  setInnerSize(ww, hh) {
    this.setSize(ww + DOCK_PADDING * 2,
      hh + (this.doDrawTitle?DOCK_TITLE_HEIGHT:0) + DOCK_PADDING * 2);
  }
  updateSplitWindows() {
    if (this.vert) {
      alert("Vertical split Dockspace.setPos() needs to be implemented!");
    } else {
      let xx = this.x + DOCK_PADDING,
        yy = this.y + DOCK_PADDING + (this.doDrawTitle?DOCK_TITLE_HEIGHT:0); // inner position
      let ww = this.width - DOCK_PADDING * 2,
        hh = this.height - DOCK_PADDING * 2 - (this.doDrawTitle?DOCK_TITLE_HEIGHT:0); // inner dimensions

      let hw = ww / 2; // half width
      this.a.setSize(hw,hh);
      this.b.setSize(hw,hh);

      this.a.setPos(xx,yy);
      this.b.setPos(xx+hw,yy);
    }
  }
  addChild(subdock) {
    if (!subdock instanceof Dockspace) alert("SUBDOCK NOT AN INSTANCE OF DOCKSPACE!");
    if (!this.isRoot) alert("TRIED TO use add() ON NON-ROOT DOCKSPACE!");
    this.children.push(subdock);
  }
  hoverAt(xx,yy) {
    let path = [];
    this.intl_hoverAt(xx,yy,path);
    return path;
  }
  intl_hoverAt(xx,yy,cpath) {
    if (this.contains(xx,yy)) {
      cpath.push(this);
      if (this.isRoot) {
        for (const child of this.children) { // iterate through children front-to-back til found a hovered, whilst calling their hoverAt().
          if (child.intl_hoverAt(xx,yy,cpath)) break;
        }
      }
      if (this.split) {
        if (!this.a.intl_hoverAt(xx,yy,cpath)) // Check if A is hovered
          this.b.intl_hoverAt(xx,yy,cpath); // If A not hovered, check if B is hovered.
      }
      if (this.tabbed) {
        alert("IMplement intl_hoverAt for tabbed");
      }
      return true;
    } else {
      return false;
    }
  }
}

class Frame {
  constructor(x = 10, y = 10, w = 50, h = 50) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.dock = null;
    this.active = false;
  }
  render(gfx) {
    gfx.fillStyle = this.active ? "#aaaaaa" : "#555555";
    gfx.fillRect(this.x, this.y, this.width, this.height);

    gfx.strokeStyle = this.active ? "#dddddd" : "#888888";
    gfx.strokeRect(this.x, this.y, this.width, this.height);
  }
  renderDroppoint(gfx) {
    let dx = this.x + this.width / 2,
      dy = this.y + this.height / 2; // drop x, drop y
    gfx.fillStyle = "#aa2222";
    gfx.fillRect(
      dx - DROPPOINT_RADIUS,
      dy - DROPPOINT_RADIUS,
      DROPPOINT_RADIUS * 2,
      DROPPOINT_RADIUS * 2
    ); // center
    gfx.fillRect(
      dx - DROPPOINT_RADIUS - DROPPOINT_MARGIN - DROPPOINT_THICKNESS,
      dy - DROPPOINT_RADIUS,
      DROPPOINT_THICKNESS,
      DROPPOINT_RADIUS * 2
    ); // left
    gfx.fillRect(
      dx + DROPPOINT_RADIUS + DROPPOINT_MARGIN,
      dy - DROPPOINT_RADIUS,
      DROPPOINT_THICKNESS,
      DROPPOINT_RADIUS * 2
    ); // right
    gfx.fillRect(
      dx - DROPPOINT_RADIUS,
      dy - DROPPOINT_RADIUS - DROPPOINT_MARGIN - DROPPOINT_THICKNESS,
      DROPPOINT_RADIUS * 2,
      DROPPOINT_THICKNESS
    ); // top
    gfx.fillRect(
      dx - DROPPOINT_RADIUS,
      dy + DROPPOINT_RADIUS + DROPPOINT_MARGIN,
      DROPPOINT_RADIUS * 2,
      DROPPOINT_THICKNESS
    ); // bottom
  }
  contains(xx, yy) {
    return (
      xx >= this.x &&
      yy >= this.y &&
      xx <= this.x + this.width &&
      yy <= this.y + this.height
    );
  }
  setPos(xx, yy) {
    this.x = xx;
    this.y = yy;
  }
  setSize(ww, hh) {
    this.width = ww;
    this.height = hh;
  }
  intl_activate() {
    this.active = true;
  }
  deactivate() {
    this.active = false;
  }
}
