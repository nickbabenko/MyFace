var UI = require('ui'),
	Vector2 = require('vector2'),
	ajax = require('ajax');

module.exports = function(window) {
	
	var iconImage = new UI.Image({
		position: new Vector2(0, 0),
		size: new Vector2(58, 58)
	});
	
	window.add(iconImage);
	
	var refreshWeather = function(latitude, longitude) {
		ajax(
			{
				url: 'http://api.openweathermap.org/data/2.5/current?lat=' + latitude + '&lon=' + longitude,
				type: 'json'
			},
			function(data) {
				if (typeof data.weather == 'object' && typeof data.weather.length == 'number' && 
					data.weather.length > 0 && typeof data.weather[0].main == 'string') {
					updateIcon(data.weather[0].main);
				}
			},
			function(error) {}
		);
	};
	
	var detectLocation = function() {
		navigator.geolocation.getCurrentPosition(
			function(pos) {
				refreshWeather(pos.coords.latitude, pos.coords.longitude);
			}, 
			function() {},
			{
				enableHighAccuracy: true, 
				maximumAge: 10000, 
				timeout: 10000
			}
		);
	};
	
	var updateIcon = function(iconIndicator) {
		iconImage.image('images/' + iconIndicator + '.png');
	};
	
	detectLocation();
	
};