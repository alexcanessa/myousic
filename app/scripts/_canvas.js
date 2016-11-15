/**
 * @class Canvas
 * 
 * Manage the canvas
 */
export default class Canvas {
	constructor(element) {
		this.element = element;
		this.points = [];
	}

	/**
	 * Initialise the module
	 */
	init() {
		this.element.width = window.innerWidth / 2;
		this.element.height = window.innerHeight;

		this.ctx = this.element.getContext('2d');		
	}

	/**
	 * Draw a line with a given data on the istance element
	 * 
	 * @param  {Number} data
	 */
	drawLine(data) {
		this.ctx.beginPath();

		this.ctx.clearRect(0, 0, this.element.width, this.element.height);

		this.points.push(data.y);

		this.points.forEach((point, i) => this.ctx.lineTo(i + 10, point))
		
		this.points = this.points.slice(this.element.width * -1);

		this.ctx.lineWidth = data.size;
		this.ctx.strokeStyle = this.generateColor();
   		this.ctx.stroke();
		this.ctx.closePath();
	}

	/**
	 * Generate a random colour
	 * 
	 * @return {String} The hex of the colour
	 */
	generateColor() {
		return '#'+Math.floor(Math.random()*16777215).toString(16);
	}
}
