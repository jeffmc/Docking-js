//
const DOCK_PADDING = 5;

class Dockspace {
	constructor(xx,yy,w,h) {
		this.x = xx-DOCK_PADDING;
		this.y = yy-DOCK_PADDING;
		this.width = w+DOCK_PADDING*2;
		this.height = h+DOCK_PADDING*2;
		this.active = false;
		
		this.solo   = false;
		this.split = false;
		this.tabbed = false;
	}
	// solo frame
	static solo(fr) {
		if (!fr instanceof Frame) alert("ERROR: fr arg not Frame instance!");
		let obj = new Dockspace(fr.x, fr.y, fr.width, fr.height);
		obj.frame = fr;
		obj.solo = true;
		return obj;
	}

	// split frames
	static split(a,b,vert) {
		if (!a instanceof Frame) alert("ERROR: arg a not Frame instance!");
		if (!b instanceof Frame) alert("ERROR: arg b not Frame instance!");
		let obj = new Dockspace(a.x,a.y,a.width,a.height);
		if (vert) {
			obj.vertical = true;
		} else {
			obj.vertical = false;
		}
		obj.split = true;
		obj.a = a; // left/top
		obj.b = b; // right/bottom

		obj.splitter = 0; // TODO: Add splitter movement

		if (vert) {
			alert("Vertical splitting needs to be implemented!");
		} else {
			b.x = a.x + a.width;
			b.y = a.y;
			b.height = a.height;
		}

		return obj;

	}

	// tabbed frames
	static tabbed(...frs) {
		for (fr in frs) {
			if (fr instanceof Frame) alert("ERROR: fr element not Frame instance!")
		}
		if (frs.length < 1) {
			alert("WARNING: Frame array length of 0!");
		} else if (frs.length < 2) {
			return solo(frs[0]);
		} else {
			let f = frs[0];
			let obj = new Dockspace(0,0,0,0);
			obj.frames = frs;
			obj.tabbed = true;
			return obj;
		}
	}
	render(gfx) {
		this.renderElements(gfx);
		if (this.solo) {
			this.frame.render(gfx);
			return;
		}
		if (this.tabbed) {
			return;
		}
		if (this.split) {
			return;
		}
	}
	renderElements(gfx) {
		gfx.fillStyle = this.active?"#2222aa":"#000055";
		gfx.fillRect(this.x,this.y,this.width,this.height);

		gfx.strokeStyle = this.active?"#4444dd":"#111188";
		gfx.strokeRect(this.x,this.y,this.width,this.height);
	}
	contains(xx,yy) {
		return (xx>=this.x)&&(yy>=this.y)&&
			(xx<=this.x+this.width)&&(yy<=this.y+this.height);
	}
	setPos(xx,yy) {
		this.x = xx;
		this.y = yy;
		if (this.single) this.frame.setPos(xx + DOCK_PADDING, yy + DOCK_PADDING);
		if (this.split) alert("Implement Dockspace.setPos() for split"); // TODO: Implement
		if (this.tabbed) alert("Implement Dockspace.setPos() for tabbed");
	}
	setSize(ww,hh) {
		this.width = ww;
		this.height = hh;
		if (this.solo) this.frame.setSize(ww - DOCK_PADDING * 2, hh - DOCK_PADDING * 2);
		if (this.split) alert("Implement Dockspace.setSize() for split"); // TODO: Implement
		if (this.tabbed) alert("Implement Dockspace.setSize() for tabbed");
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
		gfx.fillStyle = this.active?"#aaaaaa":"#555555";
		gfx.fillRect(this.x,this.y,this.width,this.height);

		gfx.strokeStyle = this.active?"#dddddd":"#888888";
		gfx.strokeRect(this.x,this.y,this.width,this.height);
	}
	contains(xx,yy) {
		return (xx>=this.x)&&(yy>=this.y)&&
			(xx<=this.x+this.width)&&(yy<=this.y+this.height);
	}
	setPos(xx,yy) {
		this.x = xx;
		this.y = yy;
	}
	setSize(ww,hh) {
		this.width = ww;
		this.height = hh;
	}
}