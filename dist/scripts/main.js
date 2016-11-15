(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @class Canvas
 * 
 * Manage the canvas
 */
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Canvas = (function () {
	function Canvas(element) {
		_classCallCheck(this, Canvas);

		this.element = element;
		this.points = [];
	}

	/**
  * Initialise the module
  */

	Canvas.prototype.init = function init() {
		this.element.width = window.innerWidth / 2;
		this.element.height = window.innerHeight;

		this.ctx = this.element.getContext('2d');
	};

	/**
  * Draw a line with a given data on the istance element
  * 
  * @param  {Number} data
  */

	Canvas.prototype.drawLine = function drawLine(data) {
		var _this = this;

		this.ctx.beginPath();

		this.ctx.clearRect(0, 0, this.element.width, this.element.height);

		this.points.push(data.y);

		this.points.forEach(function (point, i) {
			return _this.ctx.lineTo(i + 10, point);
		});

		this.points = this.points.slice(this.element.width * -1);

		this.ctx.lineWidth = data.size;
		this.ctx.strokeStyle = this.generateColor();
		this.ctx.stroke();
		this.ctx.closePath();
	};

	/**
  * Generate a random colour
  * 
  * @return {String} The hex of the colour
  */

	Canvas.prototype.generateColor = function generateColor() {
		return '#' + Math.floor(Math.random() * 16777215).toString(16);
	};

	return Canvas;
})();

exports['default'] = Canvas;
module.exports = exports['default'];

},{}],2:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _myo = require('myo');

var _myo2 = _interopRequireDefault(_myo);

var _myoSnap = require('./_myo-snap');

var _myoSnap2 = _interopRequireDefault(_myoSnap);

var _canvas = require('./_canvas');

var _canvas2 = _interopRequireDefault(_canvas);

var defaults = {
	appName: '',
	canvas: '.js-myo-canvas',
	triggerEvent: 'fist'
};

/**
 * @class MyoApi
 *
 * Wraps the myojs APIs and its methods
 */

var MyoApi = (function () {
	function MyoApi() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, MyoApi);

		this.options = Object.assign({}, defaults, options);

		if (!this.options.appName) {
			throw new Error('You need to provide an app name');
		}

		var myoSnap = new _myoSnap2['default'](_myo2['default']);

		_myo2['default'].connect(this.options.appName);

		var canvas = new _canvas2['default'](document.querySelector(this.options.canvas));
		canvas.init();

		this.canvas = canvas;
		this.isActive = false;
	}

	/**
  * Initialise the module
  */

	MyoApi.prototype.init = function init() {
		var that = this;

		_myo2['default'].on('connected', function () {
			that.armband = this;
			that.bind();
		});
	};

	/**
  * Bind the events on the armband
  */

	MyoApi.prototype.bind = function bind() {
		this.armband.on(this.options.triggerEvent, this.snapHandler.bind(this));
	};

	/**
  * Handle the snap event
  */

	MyoApi.prototype.snapHandler = function snapHandler() {
		if (this.isActive) {
			this.armband.on('orientation', this.drawLine.bind(this));
		} else {
			this.armband.off('orientation');
		}

		this.isActive = !this.isActive;
	};

	/**
  * Draw a line on the instance canvas
  * 
  * @param  {String} data
  */

	MyoApi.prototype.drawLine = function drawLine(data) {
		this.canvas.drawLine({
			y: this.percentify(data.y),
			size: this.getSize(data.x)
		});
	};

	/**
  * Create a percentage from the data given by the armband
  * 
  * @param  {Obect} data
  * 
  * @return {Number}
  */

	MyoApi.prototype.percentify = function percentify(data) {
		return +((data + 1) * window.innerHeight / 2).toFixed(0);
	};

	/**
  * Create size based on a given data
  *
  * @param {Object} data
  *
  * @return {Number}
  */

	MyoApi.prototype.getSize = function getSize(data) {
		var size = (data + 0.9) * 2;
		return [size, size, size].reduce(function (a, b) {
			return a * b;
		});
	};

	return MyoApi;
})();

exports['default'] = MyoApi;
module.exports = exports['default'];

},{"./_canvas":1,"./_myo-snap":3,"myo":5}],3:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var MyoSnap = (function () {
	function MyoSnap(Myo) {
		_classCallCheck(this, MyoSnap);

		Myo.plugins = {};

		this.flex(Myo);
		this.snap(Myo);
	}

	MyoSnap.prototype.flex = function flex(Myo) {
		Myo.plugins.flex = {
			threshold: 0.4, //What flex strength we considered to be 'flexed'
			timeout: 150, //Milliseconds after flexing that we send the event
			emgResolution: 10 //How many EMG datasets we use to smooth the data
		};

		Myo.on('connected', function () {
			this.streamEMG(true);
		});

		//Emits a useful number between 0 and 1 that represents how flexed the arm is
		var emgHistory = Array.apply(null, Array(Myo.plugins.flex.emgResolution)).map(function () {
			return [0, 0, 0, 0, 0, 0, 0, 0];
		});
		Myo.on('emg', function (pods) {
			emgHistory = emgHistory.slice(1);
			emgHistory.push(pods);

			//Find the max values for each pod over the recorded history
			var maxPodValues = emgHistory.reduce(function (r, data) {
				return data.map(function (podData, index) {
					podData = Math.abs(podData);
					return podData > r[index] ? podData : r[index];
				});
			}, [0, 0, 0, 0, 0, 0, 0, 0]);

			//Find the average and then convert to between 0 and 1
			var podAvg = maxPodValues.reduce(function (r, d) {
				return r + d;
			}, 0) / (8 * 128);

			this.trigger('flex_strength', podAvg);
		});

		//Sets a boolean and emits events when the arm becomes flexed. Uses a timeout to smooth the data a bit
		var flexTimer;
		Myo.on('flex_strength', function (val) {
			var myo = this;
			if (val > Myo.plugins.flex.threshold && !myo.isArmFlexed) {
				myo.isArmFlexed = true;
				myo.trigger('arm_flex');
				clearTimeout(flexTimer);
				flexTimer = null;
			} else if (val < Myo.plugins.flex.threshold && myo.isArmFlexed && !flexTimer) {
				flexTimer = setTimeout(function () {
					myo.isArmFlexed = false;
					myo.trigger('arm_unflex');
					flexTimer = null;
				}, Myo.plugins.flex.timeout);
			}
		});
	};

	MyoSnap.prototype.snap = function snap() {
		if (!Myo.plugins.flex) throw 'snap.myo.js requires flex.myo.js';

		Myo.plugins.snap = {
			max: 2.8,
			min: 0.122070312,
			blip_threshold: -0.1098632808
		};

		var fillArray = function fillArray(size, item) {
			return Array.apply(null, Array(size)).map(function () {
				return item;
			});
		};

		var snapHistory = fillArray(20, { x: 0, y: 0, z: 0 });
		Myo.on('accelerometer', function (data) {
			var blips = { x: 0, y: 0, z: 0 };
			var max = { x: data.x, y: data.y, z: data.z };
			var min = { x: data.x, y: data.y, z: data.z };

			// update snapHistory
			snapHistory.push(data);
			snapHistory = snapHistory.slice(1);

			//Analyze the last bit of accelerometer history for blips on each axis
			for (var i = 1; i < snapHistory.length - 1; i++) {
				var prev = snapHistory[i + 1];
				var current = snapHistory[i];
				var next = snapHistory[i - 1];

				['x', 'y', 'z'].forEach(function (axis) {
					if ((current[axis] - prev[axis]) * (next[axis] - current[axis]) < Myo.plugins.snap.blip_threshold) {
						blips[axis]++;
					}
					if (current[axis] > max[axis]) max[axis] = current[axis];
					if (current[axis] < min[axis]) min[axis] = current[axis];
				});
			}

			//Snapping creates certain 'blips' with reverberations on each axis. Checking them here.
			var hasBlip = blips.x > 0 && blips.y > 2 || blips.x + blips.y + blips.z > 4;

			//All peaks must be with the thresholds
			var withinThresholds = ['x', 'y', 'z'].reduce(function (r, axis) {
				var peakDiff = max[axis] - min[axis];
				return r && peakDiff >= Myo.plugins.snap.min && peakDiff <= Myo.plugins.snap.max;
			}, true);

			if (hasBlip && withinThresholds && this.isArmFlexed) {
				this.trigger('snap');
				snapHistory = fillArray(20, { x: 0, y: 0, z: 0 });
			}
		});
	};

	return MyoSnap;
})();

exports['default'] = MyoSnap;
module.exports = exports['default'];

},{}],4:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _myoApi = require('./_myo-api');

var _myoApi2 = _interopRequireDefault(_myoApi);

var daisy = new _myoApi2['default']({
	appName: 'com.alexcanessa.myousic',
	triggerEvent: 'snap',
	canvas: '.js-infinite-line'
});

daisy.init();

},{"./_myo-api":2}],5:[function(require,module,exports){
(function(){
	var Socket, myoList = {};
	if(typeof window === 'undefined'){
		Socket = require('ws');
	}else {
		if(!("WebSocket" in window)) console.error('Myo.js : Sockets not supported :(');
		Socket = WebSocket;
	}

	Myo = {
		defaults : {
			api_version : 3,
			socket_url  : "ws://127.0.0.1:10138/myo/",
			app_id      : 'com.myojs.default'
		},
		lockingPolicy : 'standard',
		events : [],
		myos : [],

		onError : function(){
			throw 'Myo.js had an error with the socket. Myo Connect might not be running. If it is, double check the API version.';
		},

		setLockingPolicy: function(policy) {
			Myo.socket.send(JSON.stringify(['command',{
				"command": "set_locking_policy",
				"type": policy
			}]));
			Myo.lockingPolicy = policy;
			return Myo;
		},
		trigger : function(eventName){
			var args = Array.prototype.slice.apply(arguments).slice(1);
			emitter.trigger.call(Myo, Myo.events, eventName, args);
			return Myo;
		},
		on : function(eventName, fn){
			return emitter.on(Myo.events, eventName, fn);
		},
		off : function(eventName){
			Myo.events = emitter.off(Myo.events, eventName);
			return Myo;
		},

		connect : function(appId){
			if(appId){
				Myo.defaults.app_id = appId;
			}
			Myo.socket = new Socket(Myo.defaults.socket_url + Myo.defaults.api_version + '?appid=' + Myo.defaults.app_id);
			Myo.socket.onmessage = Myo.handleMessage;
			Myo.socket.onopen = Myo.trigger.bind(Myo, 'ready');
			Myo.socket.onclose = Myo.trigger.bind(Myo, 'socket_closed');
			Myo.socket.onerror = Myo.onError;
		},
		disconnect : function(){
			Myo.socket.close();
		},

		handleMessage : function(msg){
			var data = JSON.parse(msg.data)[1];
			if(!data.type || typeof(data.myo) === 'undefined') return;
			if(data.type == 'paired'){
				Myo.myos.push(Myo.create({
					macAddress      : data.mac_address,
					name            : data.name,
					connectIndex    : data.myo
				}));
			}

			Myo.myos.map(function(myo){
				if(myo.connectIndex === data.myo){
					var isStatusEvent = true;
					if(eventTable[data.type]){
						isStatusEvent = eventTable[data.type](myo, data);
					}
					if(!eventTable[data.type] || isStatusEvent){
						myo.trigger(data.type, data, data.timestamp);
						myo.trigger('status', data, data.timestamp);
					}
				}
			})
		},

		create : function(props){
			var myoProps = utils.merge({
				macAddress      : undefined,
				name            : undefined,
				connectIndex    : undefined,
				locked          : true,
				connected       : false,
				synced          : false,
				batteryLevel    : 0,
				lastIMU         : undefined,
				arm             : undefined,
				direction       : undefined,
				warmupState     : undefined,
				orientationOffset : {x : 0,y : 0,z : 0,w : 1},
				events : [],
			}, props || {});
			return utils.merge(Object.create(Myo.methods), myoProps);
		},

		methods : {
			trigger : function(eventName){
				var args = Array.prototype.slice.apply(arguments).slice(1);
				emitter.trigger.call(this, Myo.events, eventName, args);
				emitter.trigger.call(this, this.events, eventName, args);
				return this;
			},
			_trigger : function(eventName){
				var args = Array.prototype.slice.apply(arguments).slice(1);
				emitter.trigger.call(this, this.events, eventName, args);
				return this;
			},
			on : function(eventName, fn){
				return emitter.on(this.events, eventName, fn);
			},
			off : function(eventName){
				this.events = emitter.off(this.events, eventName);
				return this;
			},
			lock : function(){
				Myo.socket.send(JSON.stringify(["command", {
					"command": "lock",
					"myo": this.connectIndex
				}]));
				return this;
			},
			unlock : function(hold){
				Myo.socket.send(JSON.stringify(["command", {
					"command": "unlock",
					"myo": this.connectIndex,
					"type": (hold ? "hold" : "timed")
				}]));
				return this;
			},
			zeroOrientation : function(){
				this.orientationOffset = utils.quatInverse(this.lastQuant);
				this.trigger('zero_orientation');
				return this;
			},
			vibrate : function(intensity){
				intensity = intensity || 'medium';
				Myo.socket.send(JSON.stringify(['command',{
					"command": "vibrate",
					"myo": this.connectIndex,
					"type": intensity
				}]));
				return this;
			},
			requestBluetoothStrength : function(){
				Myo.socket.send(JSON.stringify(['command',{
					"command": "request_rssi",
					"myo": this.connectIndex
				}]));
				return this;
			},
			requestBatteryLevel : function(){
				Myo.socket.send(JSON.stringify(['command',{
					"command": "request_battery_level",
					"myo": this.connectIndex
				}]));
				return this;
			},
			streamEMG : function(enabled){
				Myo.socket.send(JSON.stringify(['command',{
					"command": "set_stream_emg",
					"myo": this.connectIndex,
					"type" : (enabled ? 'enabled' : 'disabled')
				}]));
				return this;
			}
		}
	};

	var eventTable = {
		//Stream Events
		'pose' : function(myo, data){
			if(myo.lastPose){
				myo.trigger(myo.lastPose + '_off');
				myo.trigger('pose_off', myo.lastPose);
			}
			if(data.pose == 'rest'){
				myo.trigger('rest');
				myo.lastPose = null;
				if(Myo.lockingPolicy === 'standard') myo.unlock();
			}else{
				myo.trigger(data.pose);
				myo.trigger('pose', data.pose);
				myo.lastPose = data.pose;
				if(Myo.lockingPolicy === 'standard') myo.unlock(true);
			}
		},
		'orientation' : function(myo, data){
			myo.lastQuant = data.orientation;
			var ori = utils.quatRotate(myo.orientationOffset, data.orientation);
			var imu_data = {
				orientation : ori,
				accelerometer : {
					x : data.accelerometer[0],
					y : data.accelerometer[1],
					z : data.accelerometer[2]
				},
				gyroscope : {
					x : data.gyroscope[0],
					y : data.gyroscope[1],
					z : data.gyroscope[2]
				}
			};
			if(!myo.lastIMU) myo.lastIMU = imu_data;
			myo.trigger('orientation',   imu_data.orientation, data.timestamp);
			myo.trigger('accelerometer', imu_data.accelerometer, data.timestamp);
			myo.trigger('gyroscope',     imu_data.gyroscope, data.timestamp);
			myo.trigger('imu',           imu_data, data.timestamp);
			myo.lastIMU = imu_data;
		},
		'emg' : function(myo, data){
			myo.trigger(data.type, data.emg, data.timestamp);
		},


		//Status Events
		'arm_synced' : function(myo, data){
			myo.arm = data.arm;
			myo.direction = data.x_direction;
			myo.warmupState = data.warmup_state;
			myo.synced = true;
			return true;
		},
		'arm_unsynced' : function(myo, data){
			myo.arm = undefined;
			myo.direction = undefined;
			myo.warmupState = undefined;
			myo.synced = false;
			return true;
		},
		'connected' : function(myo, data){
			myo.connectVersion = data.version.join('.');
			myo.connected = true;
			return true;
		},
		'disconnected' : function(myo, data){
			myo.connected = false;
			return true;
		},
		'locked' : function(myo, data){
			myo.locked = true;
			return true;
		},
		'unlocked' : function(myo, data){
			myo.locked = false;
			return true;
		},
		'warmup_completed' : function(myo, data){
			myo.warmupState = 'warm';
			return true;
		},

		'rssi' : function(myo, data){
			data.bluetooth_strength =  utils.getStrengthFromRssi(data.rssi);
			myo.trigger('bluetooth_strength', data.bluetooth_strength, data.timestamp);
			myo.trigger('rssi', data.rssi, data.timestamp);
			myo.trigger('status', data, data.timestamp);
		},
		'battery_level' : function(myo, data){
			myo.batteryLevel = data.battery_level;
			myo.trigger('battery_level', data.battery_level, data.timestamp);
			myo.trigger('status', data, data.timestamp);
		},
	};


	var emitter = {
		eventCounter : 0,
		trigger : function(events, eventName, args){
			var self = this;
			events.map(function(event){
				if(event.name == eventName) event.fn.apply(self, args);
				if(event.name == '*'){
					var args_temp = args.slice(0);
					args_temp.unshift(eventName);
					event.fn.apply(self, args_temp);
				}
			});
			return this;
		},
		on : function(events, name, fn){
			var id = new Date().getTime() + "" + emitter.eventCounter++;
			events.push({
				id   : id,
				name : name,
				fn   : fn
			});
			return id;
		},
		off : function(events, name){
			events = events.reduce(function(result, event){
				if(event.name == name || event.id == name || !name) {
					return result;
				}
				result.push(event);
				return result;
			}, []);
			return events;
		},
	};

	var utils = {
		merge : function(obj1,obj2){
			for(var attrname in obj2) { obj1[attrname] = obj2[attrname]; }
			return obj1;
		},
		quatInverse : function(q) {
			var len = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
			return {
				w: q.w/len,
				x: -q.x/len,
				y: -q.y/len,
				z: -q.z/len
			};
		},
		quatRotate : function(q, r) {
			return {
				w: q.w * r.w - q.x * r.x - q.y * r.y - q.z * r.z,
				x: q.w * r.x + q.x * r.w + q.y * r.z - q.z * r.y,
				y: q.w * r.y - q.x * r.z + q.y * r.w + q.z * r.x,
				z: q.w * r.z + q.x * r.y - q.y * r.x + q.z * r.w
			};
		},
		getStrengthFromRssi : function(rssi){
			var min = -95;
			var max = -40;
			rssi = (rssi < min) ? min : rssi;
			rssi = (rssi > max) ? max : rssi;
			return Math.round(((rssi-min)*100)/(max-min) * 100)/100;
		},
	};

	if(typeof module !== 'undefined') module.exports = Myo;
})();





},{"ws":6}],6:[function(require,module,exports){

/**
 * Module dependencies.
 */

var global = (function() { return this; })();

/**
 * WebSocket constructor.
 */

var WebSocket = global.WebSocket || global.MozWebSocket;

/**
 * Module exports.
 */

module.exports = WebSocket ? ws : null;

/**
 * WebSocket constructor.
 *
 * The third `opts` options object gets ignored in web browsers, since it's
 * non-standard, and throws a TypeError if passed to the constructor.
 * See: https://github.com/einaros/ws/issues/227
 *
 * @param {String} uri
 * @param {Array} protocols (optional)
 * @param {Object) opts (optional)
 * @api public
 */

function ws(uri, protocols, opts) {
  var instance;
  if (protocols) {
    instance = new WebSocket(uri, protocols);
  } else {
    instance = new WebSocket(uri);
  }
  return instance;
}

if (WebSocket) ws.prototype = WebSocket.prototype;

},{}]},{},[1,2,3,4]);
