export default class MyoSnap {
	constructor(Myo) {
		Myo.plugins = {};

		this.myo = Myo;
	}

	init() {
		this.flex(this.myo);
		this.snap(this.myo);
	}

	flex(Myo) {
		Myo.plugins.flex = {
			threshold     : 0.4, //What flex strength we considered to be 'flexed'
			timeout       : 150, //Milliseconds after flexing that we send the event
			emgResolution : 10   //How many EMG datasets we use to smooth the data
		};

		Myo.on('connected', function(){
			this.streamEMG(true);
		});

		//Emits a useful number between 0 and 1 that represents how flexed the arm is
		var emgHistory = Array.apply(null, Array(Myo.plugins.flex.emgResolution)).map(function(){return [0,0,0,0,0,0,0,0]});
		Myo.on('emg', function(pods){
			emgHistory = emgHistory.slice(1);
			emgHistory.push(pods);

			//Find the max values for each pod over the recorded history
			var maxPodValues = emgHistory.reduce(function(r, data){
				return data.map(function(podData, index){
					podData = Math.abs(podData);
					return (podData > r[index]) ? podData : r[index]
				});
			},[0,0,0,0,0,0,0,0]);

			//Find the average and then convert to between 0 and 1
			var podAvg = maxPodValues.reduce(function(r,d){
				return r + d;
			}, 0)/(8 * 128);

			this.trigger('flex_strength', podAvg);
		});

		//Sets a boolean and emits events when the arm becomes flexed. Uses a timeout to smooth the data a bit
		var flexTimer;
		Myo.on('flex_strength', function(val){
			var myo = this;
			if(val > Myo.plugins.flex.threshold && !myo.isArmFlexed){
				myo.isArmFlexed = true;
				myo.trigger('arm_flex');
				clearTimeout(flexTimer);
				flexTimer = null;
			}else if(val < Myo.plugins.flex.threshold && myo.isArmFlexed && !flexTimer){
				flexTimer = setTimeout(function(){
					myo.isArmFlexed = false;
					myo.trigger('arm_unflex');
					flexTimer = null;
				}, Myo.plugins.flex.timeout);
			}
		});
	}
	
	snap() {
		if(!Myo.plugins.flex) throw 'snap.myo.js requires flex.myo.js';

		Myo.plugins.snap = {
			max : 2.8,
			min : 0.122070312,
			blip_threshold : -0.1098632808,
		};

		var fillArray = function(size, item){
			return Array.apply(null, Array(size)).map(function(){return item});
		}

		var snapHistory = fillArray(20, {x:0,y:0,z:0});
		Myo.on('accelerometer', function(data){
			var blips = {x:0,y:0,z:0};
			var max = {x:data.x,y:data.y,z:data.z};
			var min = {x:data.x,y:data.y,z:data.z};

			// update snapHistory
			snapHistory.push(data);
			snapHistory = snapHistory.slice(1);


			//Analyze the last bit of accelerometer history for blips on each axis
			for(var i = 1; i < snapHistory.length -1; i++){
				var prev = snapHistory[i+1];
				var current = snapHistory[i];
				var next = snapHistory[i-1];

				['x', 'y', 'z'].forEach(function(axis){
					if((current[axis] - prev[axis]) * (next[axis] - current[axis]) < Myo.plugins.snap.blip_threshold){
						blips[axis]++;
					}
					if(current[axis] > max[axis]) max[axis] = current[axis];
					if(current[axis] < min[axis]) min[axis] = current[axis];
				});
			}

			//Snapping creates certain 'blips' with reverberations on each axis. Checking them here.
			var hasBlip = (blips.x > 0 && blips.y > 2) || (blips.x+blips.y+blips.z > 4);

			//All peaks must be with the thresholds
			var withinThresholds = ['x', 'y', 'z'].reduce(function(r, axis){
				var peakDiff = max[axis] - min[axis];
				return r && peakDiff >= Myo.plugins.snap.min && peakDiff <= Myo.plugins.snap.max;
			}, true);

			if(hasBlip && withinThresholds && this.isArmFlexed){
				this.trigger('snap');
				snapHistory = fillArray(20, {x:0,y:0,z:0});
			}
		});
	}
}