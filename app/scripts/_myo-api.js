import Myo from 'myo';
import MyoSnap from './_myo-snap';
import Canvas from './_canvas';

const defaults = {
	appName: '',
	canvas: '.js-myo-canvas',
	triggerEvent: 'fist'
};

/**
 * @class MyoApi
 *
 * Wraps the myojs APIs and its methods
 */
export default class MyoApi {
	constructor(options = {}) {
		this.options = Object.assign({}, defaults, options);

		if (!this.options.appName) {
			throw new Error('You need to provide an app name');
		}

		const myoSnap = new MyoSnap(Myo);
		
		myoSnap.init();

		Myo.connect(this.options.appName);

		const canvas = new Canvas(document.querySelector(this.options.canvas));
		canvas.init();

		this.canvas = canvas;
		this.isActive = false;
	}

	/**
	 * Initialise the module
	 */
	init() {
		const that = this;

		Myo.on('connected', function() {
			that.armband = this;
			that.bind();
		});
	}

	/**
	 * Bind the events on the armband
	 */
	bind() {
		this.armband.on(this.options.triggerEvent, this.snapHandler.bind(this));
	}

	/**
	 * Handle the snap event
	 */
	snapHandler() {
		if(!this.isActive) {
			this.armband.on('orientation', this.drawLine.bind(this));
		} else {
			this.armband.off('orientation')
		}

		this.isActive = !this.isActive;
	}

	/**
	 * Draw a line on the instance canvas
	 * 
	 * @param  {String} data
	 */
	drawLine(data) {		
		this.canvas.drawLine({
			y: this.percentify(data.y),
			size: this.getSize(data.x)
		});
	}

	/**
	 * Create a percentage from the data given by the armband
	 * 
	 * @param  {Obect} data
	 * 
	 * @return {Number}
	 */
	percentify(data) {
		return +((data + 1) * window.innerHeight / 2).toFixed(0);
	}

	/**
	 * Create size based on a given data
	 *
	 * @param {Object} data
	 *
	 * @return {Number}
	 */
	getSize(data) {
		const size = (data + 0.9) * 2;
		return [size, size, size]
					.reduce((a, b) => a * b);
	}
}