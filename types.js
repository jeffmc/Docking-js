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
    
    this.resetState(true);
  }
  resetState(resetParent = false) { // Kills all state and children reference, maintains ancestors and screen position/size, all arrays set to null
    if (resetParent) {
      this.parent = null; // reference to parent dockspace, null if window root.
    }
    updateParentalRelationship();
    this.active = false; // UI active
    this.hovered = false; // mouse hovered
    this.immovable = false; // movable by handlers
    this.doRenderElements = false;  // render border, title.
    this.doDrawTitle = false; // render title
    this.hasDroppoints = false; // self-explanatory
    this.droppoints = null; // droppoints for this dockspace
    this.children = null; // root docks have child docks (floating)

    // Dock modes
    this.isRoot = false;
    this.solo = false;
    this.split = false;
    this.tabbed = false;

    // Frames
    this.frame = null; // on solo docks, they possess a Frame object.
    this.frames = null; // tabbed docks possess a Frame array.
  }
  updateParentalRelationship() {
    this.floating = false;
    this.isHalf = false;
    if (this.parent != null) {
      if (this.parent.isRoot) {
        this.floating = true;
      } else if (this.parent.split) {
        this.isHalf = true;
      }
    }
  }

  grabTransform() {
    let tr;
    tr.x = this.x;
    tr.y = this.y;
    tr.width = this.width;
    tr.height = this.height;
    return tr;
  }

  placeTransform(tr) {
    this.x = tr.x;
    this.y = tr.y;
    this.width = tr.width;
    this.height = tr.height;
  }

  // Root dockspace, contains floating docks of any kind.
  static root(x,y,w,h) {
    let obj = new Dockspace(0,0,0,0, null);
    obj.doRenderElements = false;
    obj.doDrawTitle = false;
    obj.isRoot = true;
    obj.immovable = true;
    obj.children = [];

    obj.setSize(w,h);
    obj.setPos(x,y);

    obj.makeDroppoints();
    return obj;
  }

  // Solo dockspace, contains single frame
  static solo(fr, p = null) {
    if (!fr instanceof Frame) alert("ERROR: fr arg not Frame instance!");
    let obj = new Dockspace(0,0,0,0, p);
    obj.solo = true;
    obj.frame = fr;
    obj.parent = p;

    obj.floating = false;
    obj.isHalf = false;

    if (obj.parent) {
      if (obj.parent.isRoot) {
        obj.floating = true;
      } else if (obj.parent.split) {
        obj.isHalf = true;
      } else if (obj.parent.solo) {
        alert("NESTED SOLO DOCKS FOR NO REASON!");
      } else if (obj.parent.tabbed) {
        alert("CHILD DOCK OF TABBED DOCK!");
      }
    } else {
      obj.isolated = true;
    }

    obj.setInnerSize(fr.width, fr.height);
    obj.setPos(fr.x, fr.y);

    obj.makeDroppoints();
    return obj;
  }

  // Split dock, contains two subdocks of any kind. (horizontal or vertical mode)
  static split(a, b, vert = false) {
    if (!a instanceof Dockspace) alert("ERROR: arg a not Frame instance!");
    if (!b instanceof Dockspace) alert("ERROR: arg b not Frame instance!");
    let obj = new Dockspace(a.x, a.y, a.width, a.height);
    obj.vertical = vert;
    obj.split = true;
    obj.doDrawTitle = false;
    obj.doRenderElements = false;
    
    // Convert children from independent to half.
    a.isHalf = true;
    b.isHalf = true;
    a.parent = obj;
    b.parent = obj;

    obj.a = a; // left/top
    obj.b = b; // right/bottom

    obj.splitter = 0;

    if (obj.vertical) {
      obj.splitter = a.height;
      obj.setInnerSize(
        a.width >= b.width ? a.width : b.width,
        a.height + b.height,
      );
    } else {
      obj.splitter = a.width;
      obj.setInnerSize(
        a.width + b.width,
        a.height >= b.height ? a.height : b.height
      );
    }

    return obj;
  }
  updateSplitWindows() {
    let pdg = (this.doRenderElements?DOCK_PADDING * 2:0); // Dock padding size
    let ttl = (this.doDrawTitle?DOCK_TITLE_HEIGHT:0); // DOck title height
    if (this.vertical) {
      let xx = this.x + pdg,
        yy = this.y + pdg + ttl; // inner position
      let ww = this.width - pdg,
        hh = this.height - pdg - ttl; // inner dimensions

      let ah = this.splitter;
      let bh = hh - this.splitter;
      this.a.setSize(ww,ah);
      this.b.setSize(ww,bh);

      this.a.setPos(xx,yy);
      this.b.setPos(xx,yy+ah);
    } else {
      let xx = this.x + pdg,
        yy = this.y + pdg + ttl; // inner position
      let ww = this.width - pdg,
        hh = this.height - pdg - ttl; // inner dimensions

      let aw = this.splitter;
      let bw = ww - this.splitter;
      this.a.setSize(aw,hh);
      this.b.setSize(bw,hh);

      this.a.setPos(xx,yy);
      this.b.setPos(xx+aw,yy);
    }
  }
  setSplitter(s) { // TODO: Add splitter movement AND SplitterDragHandler
    this.splitter = s;
    this.updateSplitWindows();
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
      for (let i=this.children.length-1;i>=0;i--) 
        this.children[i].render(gfx);
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

    if (this.doDrawTitle) {
      gfx.fillStyle = "#fff";
      gfx.fillText(this.solo?this.frame.title:"EX_TITLE",this.x+DOCK_PADDING,this.y+DOCK_TITLE_HEIGHT-DOCK_PADDING); // TODO: Fix y-positioning with font
    }

  }
  makeDroppoints() {
    this.hasDroppoints = true;
    this.droppoints.push(new Droppoint(this,"CENTER"));
    this.droppoints.push(new Droppoint(this,"LEFT"));
    this.droppoints.push(new Droppoint(this,"RIGHT"));
    this.droppoints.push(new Droppoint(this,"TOP"));
    this.droppoints.push(new Droppoint(this,"BOTTOM"));
    this.alignDroppoints();
  }
  alignDroppoints() {
    let dx = this.x + this.width / 2, dy = this.y + this.height / 2; // drop x, drop y
    // Center
    this.droppoints[0].setPosSize(
      dx - DROPPOINT_RADIUS,
      dy - DROPPOINT_RADIUS,
      DROPPOINT_RADIUS * 2,
      DROPPOINT_RADIUS * 2,
    ); 
    // Left
    this.droppoints[1].setPosSize(
      dx - DROPPOINT_RADIUS - DROPPOINT_MARGIN - DROPPOINT_THICKNESS,
      dy - DROPPOINT_RADIUS,
      DROPPOINT_THICKNESS,
      DROPPOINT_RADIUS * 2, 
    ); 
    // Right
    this.droppoints[2].setPosSize(
      dx + DROPPOINT_RADIUS + DROPPOINT_MARGIN,
      dy - DROPPOINT_RADIUS,
      DROPPOINT_THICKNESS,
      DROPPOINT_RADIUS * 2,
    ); 
    // Top
    this.droppoints[3].setPosSize(
      dx - DROPPOINT_RADIUS,
      dy - DROPPOINT_RADIUS - DROPPOINT_MARGIN - DROPPOINT_THICKNESS,
      DROPPOINT_RADIUS * 2,
      DROPPOINT_THICKNESS,
    );
    // Bottom
    this.droppoints[4].setPosSize(
      dx - DROPPOINT_RADIUS,
      dy + DROPPOINT_RADIUS + DROPPOINT_MARGIN,
      DROPPOINT_RADIUS * 2,
      DROPPOINT_THICKNESS,
    );
  }

  // Returns an array of Droppoint objects, including Dock called on and all descendants.
  getAllDroppoints(col = []) { // Add a droppoint class
    if (this.isRoot) {
      for (const child of this.children) {
        col.unshift(...(child.getAllDroppoints()));
      }
      if (this.hasDroppoints) col.push(...this.droppoints);
      return col;
    }
    if (this.split) {
      col.unshift(...(this.a.getAllDroppoints()));
      col.unshift(...(this.b.getAllDroppoints()));
    }
    if (this.tabbed) {
      alert("RENDER DROPPOINTS FOR TABBED!");
    }
    if (this.hasDroppoints) {
      col.unshift(...this.droppoints);
    }
    return col;
  }
  // Returns true if dock is a DIRECT descendent within tree.
  dockIsChild(dock) {
    if (this.isRoot) {
      for (const child of this.children)
        if (child == dock) return true;
      return false;
    }
    if (this.solo) return false;
    if (this.split) return this.a == dock || this.b == dock;
    if (this.tabbed) return false;
  }
  // Deactivate root and activate leaf (subsequently activating path)
  static activateDockPath(path) {
    path[0].deactivate();
    path[path.length-1].activateLeaf();
  }
  // Call on the leaf to activate, all ancestors until and including root.
  activateLeaf() { 
    if (this.parent != null) {
      this.parent.intl_activateParent(this);
    } else {
      if (!this.isRoot) alert("non-root null parent dock found in tree!");
    }
  }
  // Internal activation method, called from activateLeaf(), and calls activateLeaf on itself
  intl_activateParent(cdock) {
    if (this.isRoot) {
      for (let i=0;i<this.children.length;i++) {
        let child = this.children[i];
        if (child == cdock) {
          cdock.intl_activate();
          this.children.unshift(this.children.splice(i,1)[0]); // don't break loop because still need to deactivate all other docks
        } else {
          child.deactivate();
        }
      }
    }
    if (this.split) {
      if (this.a == cdock) {
        cdock.intl_activate();
        this.b.deactivate();
      } else if (this.b == cdock) {
        cdock.intl_activate();
        this.a.deactivate();
      }
    }
    if (this.tabbed) {
      alert("Activating frames in a tabbed dock?"); // TODO: Change this.
    }
    if (this.solo) alert("Cannot activate child dock in a solo dock");
    this.activateLeaf();
  }
  // Internal activation, calls respective behaviour after activation.
  intl_activate() {
    this.active = true;
    if (this.solo) this.frame.intl_activate();
  }
  // Deactivates this dock and ALL descendents.
  deactivate() {
    this.active = false;
    if (this.isRoot) {
      for (const child of this.children) {
        child.deactivate();
      }
    }
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
    return rectContains(this.x,this.y,this.width,this.height,xx,yy);
  }
  setPos(x, y) {
    this.x = x;
    this.y = y;
    if (this.solo) this.frame.setPos(x + DOCK_PADDING, y + DOCK_PADDING + (this.doDrawTitle?DOCK_TITLE_HEIGHT:0));
    if (this.split) {
      this.updateSplitWindows();
    }
    if (this.tabbed) alert("Implement Dockspace.setPos() for tabbed");
    if (this.hasDroppoints) this.alignDroppoints();
  }
  setSize(ww,hh) {
    this.width = ww;
    this.height = hh;
    if (this.hasDroppoints) this.alignDroppoints();
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
    let pdg = (this.doRenderElements?DOCK_PADDING * 2:0);
    this.setSize(ww + pdg, hh + (this.doDrawTitle?DOCK_TITLE_HEIGHT:0) + pdg);
  }
  addChild(subdock) {
    if (!subdock instanceof Dockspace) alert("SUBDOCK NOT AN INSTANCE OF DOCKSPACE!");
    if (!this.isRoot) alert("TRIED TO use add() ON NON-ROOT DOCKSPACE!");
    if (subdock.parent != null && subdock.parent != this) alert("SUBDOCK ALREADY HAS PARENT!");
    subdock.parent = this;
    this.children.push(subdock);
  }
  addSolo(frame) {
    this.addChild(Dockspace.solo(frame,this));
  }
  addSplit(dockA,dockB,mode = false) {
    this.addChild(Dockspace.split(dockA,dockB,mode))
  }
  removeChild(subdock) {
    // if (!subdock instanceof Dockspace) alert("SUBDOCK NOT AN INSTANCE OF DOCKSPACE!");
    // if (!this.isRoot) alert("TRIED TO use add() ON NON-ROOT DOCKSPACE!");
    // if (subdock.parent != null && subdock.parent != this) alert("SUBDOCK ALREADY HAS PARENT!");
    // subdock.parent = this;
    // this.children.push(subdock);
  }
  dockPathAt(xx,yy) {
    let path = [];
    this.intl_dockPathAt(xx,yy,path);
    return path;
  }
  intl_dockPathAt(xx,yy,cpath) {
    if (this.contains(xx,yy)) {
      cpath.push(this);
      if (this.isRoot) {
        for (const child of this.children) { // iterate through children front-to-back til found a hovered, whilst calling their dockPathAt().
          if (child.intl_dockPathAt(xx,yy,cpath)) break;
        }
      }
      if (this.split) {
        if (!this.a.intl_dockPathAt(xx,yy,cpath)) // Check if A is hovered
          this.b.intl_dockPathAt(xx,yy,cpath); // If A not hovered, check if B is hovered.
      }
      if (this.tabbed) {
        alert("IMplement intl_dockPathAt for tabbed");
      }
      return true;
    } else {
      return false;
    }
  }
  activateDockAt(xx, yy) {
    // find root dock
    let path = this.dockPathAt(xx,yy);
    Dockspace.activateDockPath(path);
    return path[path.length - 1]; // Found or null
  }
  dropDockHere(payload) {
    payload.parent.removeChild();
  }
}

class Droppoint {
  constructor(parent,angle,x=0,y=0,w=DROPPOINT_RADIUS,h=DROPPOINT_RADIUS) {
    this.parent = parent;
    this.angle = angle;
    this.hovered = false;
    this.setPosSize(x,y,w,h);
  }
  setPosSize(x,y,w,h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }
  render(gfx, dockHandler) {
    gfx.fillStyle = this.hovered ? "#22aa22" : "#aa2222";
    gfx.fillRect(this.x,this.y,this.width,this.height);
  }
  contains(xx,yy) {
    return rectContains(this.x,this.y,this.width,this.height,xx,yy);
  }
}

class Frame {
  constructor(x = 10, y = 10, w = 50, h = 50, title = "Untitled") {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.dock = null;
    this.active = false;
    this.title = title;
  }
  render(gfx) {
    gfx.fillStyle = this.active ? "#aaaaaa" : "#555555";
    gfx.fillRect(this.x, this.y, this.width, this.height);

    gfx.strokeStyle = this.active ? "#dddddd" : "#888888";
    gfx.strokeRect(this.x, this.y, this.width, this.height);
  }
  contains(xx, yy) {
    return rectContains(this.x,this.y,this.width,this.height,xx,yy);
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

// Implement DropCluster type, containing center, l,r,u,p droppoints for Docks, and z-indexed rendering array.

function rectContains(x,y,w,h,xx,yy) {
  return (
    xx >= x &&
    yy >= y &&
    xx <= x + w &&
    yy <= y + h
  );
}