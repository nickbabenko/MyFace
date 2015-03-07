var UI = require('ui'),
	Vector2 = require('vector2');

module.exports = function() {
	
	// TODO: Add battery level
	// TODO: Add disconnected indicator
	// TODO: Add weather
	// TODO: Add next train time - assuming we can parse XML
	
	var window = new UI.Window(),
		dateLabel = new UI.TimeText({
			text: '%x',
			position: new Vector2(0, 55),
			size: new Vector2(144, 42),
			font: 'gothic-24'
		}),
		timeLabel = new UI.TimeText({
			text: '%H:%M',
			textAlign: 'center',
			position: new Vector2(0, 85),
			size: new Vector2(144, 42),
			font: 'gothic-28-bold'
		});
	
	window.add(dateLabel);
	window.add(timeLabel);
	
	return window;
	
};