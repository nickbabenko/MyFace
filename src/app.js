/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var TimeWindow = require('timewindow'),
	NotifyWindow = require('notifywindow'),
	PetrolStationListener = require('petrolstationlistener'),
	Vibe = require('ui/vibe');

var timeWindow = new TimeWindow(),
	petrolStationListener = new PetrolStationListener(),
	notifyWindow = null,
	vibrateTimer = null;

petrolStationListener.addEventListener(petrolStationListener.EVENT_ENTER, function() {	
	notifyWindow = new NotifyWindow();
	notifyWindow.show();
	
	if (vibrateTimer !== null) {
		clearInterval(vibrateTimer);
	}
	
	vibrateTimer = setInterval(function() {
		Vibe.vibrate('short');
	}, 3000);
});
petrolStationListener.addEventListener(petrolStationListener.EVENT_LEAVE, function() {	
	notifyWindow.hide();
	notifyWindow = null;
	
	clearInterval(vibrateTimer);
	vibrateTimer = null;
});

timeWindow.show();