//
const DOCK_PADDING = 5;

class Dockspace {
	constructor(win) {
		this.x = win.x-DOCK_PADDING;
		this.y = win.y-DOCK_PADDING;
		this.width = win.width+DOCK_PADDING*2;
		this.height = win.height+DOCK_PADDING*2;
		this.active = false;
		// solo window
		this.window = win;
		this.solo = true;

		// tabbed windows
		this.tabs = [];
		this.tabbed = false;

		// split windows
		this.lt = null;
		this.rb = null;
		this.split = false;
		this.vertical = false;
	}
	render(gfx) {
		this.renderElements(gfx);
		if (this.solo) {
			this.window.render(gfx);
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
		this.window.setPos(xx + DOCK_PADDING, yy + DOCK_PADDING);
	}
}

class Window {
	constructor(x = 0, y = 0, w = 50, h = 50) {
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.dock = new Dockspace(this); // define dockspace using this window's dimensions.
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
}