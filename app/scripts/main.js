import MyoApi from './_myo-api';

let daisy = new MyoApi({
	appName: 'com.alexcanessa.myousic',
	triggerEvent: 'snap',
	canvas: '.js-infinite-line'
});

daisy.init();