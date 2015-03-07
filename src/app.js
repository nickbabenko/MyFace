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
	listener = new PetrolStationListener(),
	notifyWindow = null,
	vibrateTimer = null;

listener.addEventListener(listener.EVENT_ENTER, function() {	
	notifyWindow = new NotifyWindow();
	notifyWindow.show();
	
	if (vibrateTimer !== null) {
		clearInterval(vibrateTimer);
	}
	
	vibrateTimer = setInterval(function() {
		Vibe.vibrate('short');
	}, 3000);
});

listener.addEventListener(listener.EVENT_LEAVE, function() {	
	notifyWindow.hide();
	notifyWindow = null;
	
	clearInterval(vibrateTimer);
	vibrateTimer = null;
});

timeWindow.show();