var UI = require('ui'),
	Vector2 = require('vector2'),
	TimeDeparture = require('timedeparture'),
	WeatherIndicator = require('weatherindicator');

module.exports = function() {
	
	// TODO: Add battery level, if possible with Pebble.JS
	// TODO: Add disconnected indicator
	// TODO: Add weather
	
	var window = new UI.Window(),
		weatherLabel = new UI.Text({
			text: 'A',
			font: 'weather-font-18jjj',
			position: new Vector2(0, 0),
			size: new Vector2(144, 20),
			textAlign: 'center'
		}),
		dateLabel = new UI.TimeText({
			text: '%a, %d %b %y',
			position: new Vector2(0, 55),
			size: new Vector2(144, 42),
			font: 'gothic-24-bold'
		}),
		timeLabel = new UI.TimeText({
			text: '%H:%M',
			textAlign: 'center',
			position: new Vector2(0, 85),
			size: new Vector2(144, 42),
			font: 'bitham-30-black'
		});
	
	window.add(weatherLabel);
	window.add(dateLabel);
	window.add(timeLabel);
	
	new TimeDeparture(window);
	new WeatherIndicator(window);
	
	return window;
	
};