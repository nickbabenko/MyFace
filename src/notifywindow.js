var UI = require('ui'),
	Vector2 = require('vector2');

module.exports = function() {

	var window = new UI.Window(),
		background = new UI.Rect({
			backgroundColor: 'white',
			position: new Vector2(0, 0),
			size: new Vector2(144, 168)
		}),
		label = new UI.Text({
			text: 'DIESEL',
			textAlign: 'center',
			position: new Vector2(0, 61),
			size: new Vector2(144, 168),
			font: 'bitham-42-bold',
			color: 'black'
		});
	
	window.add(background);
	window.add(label);
	
	return window;
	
};