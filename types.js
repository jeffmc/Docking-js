const DOCK_PADDING = 2;
const DOCK_TITLE_HEIGHT = 14;

const DROPPOINT_RADIUS = 20;
const DROPPOINT_THICKNESS = 15;
const DROPPOINT_MARGIN = 10;

class Dockspace {
  constructor(xx, yy, w, h) {
    this.x = xx - DOCK_PADDING;
    this.y = yy - DOCK_PADDING;
    this.width = w + DOCK_PADDING * 2;
    this.height = h + DOCK_PADDING * 2;
    this.active = false;
    this.hovered = false;
    this.doRenderElements = true;
	this.doDrawTitle = true;

    this.solo = false;
    this.split = false;
    this.tabbed = false;
  }
  // solo frame
  static solo(fr) {
    if (!fr instanceof Frame) alert("ERROR: fr arg not Frame instance!");
    let obj = new Dockspace(0,0,0,0);
    obj.frame = fr;
    obj.solo = true;
	obj.setInnerSize(fr.width, fr.height);
	obj.setPos(fr.x, fr.y);
    return obj;
  }

  // split frames
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
    obj.a = a; // left/top
    obj.b = b; // right/bottom

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

  // tabbed frames
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
      this.a.renderDroppoint(gfx);
      this.b.renderDroppoint(gfx);
    }
    if (this.tabbed) {
      // TODO: Do this better, don't render all frames droppoints.
      for (fr in this.frames) {
        fr.renderDroppoint(gfx);
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
  setInnerSize(ww, hh) {
    this.width = ww + DOCK_PADDING * 2;
    this.height = hh + (this.doDrawTitle?DOCK_TITLE_HEIGHT:0) + DOCK_PADDING * 2;
    if (this.solo) this.frame.setSize(ww, hh);
    if (this.split) {
      this.updateSplitWindows();
    }
    if (this.tabbed) alert("Implement Dockspace.setSize() for tabbed");
  }
  updateSplitWindows() {
    if (this.vert) {
      alert("Vertical split Dockspace.setPos() needs to be implemented!");
    } else {
      let xx = this.x + DOCK_PADDING,
        yy = this.y + DOCK_PADDING + (this.doDrawTitle?DOCK_TITLE_HEIGHT:0); // inner position
      let ww = this.width - DOCK_PADDING * 2,
        hh = this.height - DOCK_PADDING * 2 - (this.doDrawTitle?DOCK_TITLE_HEIGHT:0); // inner dimensions

      this.a.height = hh;
      this.b.height = hh;
      let hw = ww / 2; // half width
      this.a.width = hw;
      this.b.width = hw;

      this.a.x = xx;
      this.b.x = xx + hw;

      this.a.y = yy;
      this.b.y = yy;
    }
  }
}

class Frame {
  constructor(x = 10, y = 10, w = 50, h = 50) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.dock = Dockspace.solo(this); // define dockspace using this frame's dimensions.
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
}
