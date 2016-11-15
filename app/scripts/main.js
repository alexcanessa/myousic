import MyoApi from './_myo-api';

const daisy = new MyoApi({
	appName: 'com.alexcanessa.myousic',
	triggerEvent: 'snap',
	canvas: '.js-infinite-line'
});

daisy.init(() => {
	const levels = [
		{
			value: [0, 25],
			class: 'battery-level__bar--low'
		},
		{
			value: [26, 75],
			class: 'battery-level__bar--medium'
		},
		{
			value: [76, 100],
			class: 'battery-level__bar--high'
		}
	];

	function getBatteryColor(batteryLevel) {
		return levels
			.filter(level => {
				return batteryLevel >= level.value[0] && batteryLevel <= level.value[1];
			})
			.map(level => level.class)[0];
	}
	daisy.armband.on('battery_level', level => {
		document.querySelector('.js-battery-level').style.width = level + '%';
		document.querySelector('.js-battery-level').classList.add(getBatteryColor(level));
	});

	daisy.armband.requestBatteryLevel();
});