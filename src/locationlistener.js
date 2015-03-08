var ajax = require('ajax');

var API_BASE_URL = 'https://api.foursquare.com/v2/',
	API_CLIENT_ID = 'L4MTYKULBETAEYVQIDBG04N45SR2SJL045QRLZRTHV1T10QR',
	API_CLIENT_SECRET = 'ARXRLC53H33LRT1LHC0U4JMOSYP0MZTRHIYQKVNXMKEOFJYL',
	API_VERSION = '20150306',
	LOCATION_UPDATE_DELAY = 1, // minutes
	SEARCH_RADIUS = 100;

var currentLocation = null,
	currentLocationTime = null;

module.exports = function(config) {
	
	return function() {
		var listener = this,
			currentPlace = null,
			events = {};

		this.EVENT_ENTER = 'enter';
		this.EVENT_LEAVE = 'leave';

		var detectLocationDelayed = function() {
			setTimeout(detectLocation, (LOCATION_UPDATE_DELAY * 60 * 1000));	
		};

		var detectLocation = function() {
			// Cache location for 30 seconds
			if (currentLocation !== null && (Date.now() - currentLocationTime) < 30000) {
				loadNearestPlace(currentLocation.latitude, currentLocation.longitude);
			} else {
				navigator.geolocation.getCurrentPosition(
					function(pos) {
						currentLocation = pos.coords;
						currentLocationTime = Date.now();

						loadNearestPlace(pos.coords.latitude, pos.coords.longitude);
					}, 
					function() {},
					{
						enableHighAccuracy: true, 
						maximumAge: 10000, 
						timeout: 10000
					}
				);
			}
		};

		var loadNearestPlace = function(lat, lng) {
			var categoryIds = (typeof config.categoryIds == 'object' ? config.categoryIds : []);
			var radius = (typeof config.radius == 'number' ? config.radius : SEARCH_RADIUS);
			
			console.log('loadNearestPlace', radius, categoryIds.join(', '));

			ajax(
				{
					url: API_BASE_URL + 'venues/search?ll=' + lat + ',' + lng + '&categoryId=' + categoryIds.join(',') + 
					'&limit=1&radius=' + radius + '&client_id=' + API_CLIENT_ID + '&client_secret=' + API_CLIENT_SECRET + 
						'&v=' + API_VERSION,
					type: 'json'
				},
				function(data, status, request) {
					var newPlace = null;
					
					if (typeof data.response == 'object' && typeof data.response.venues == 'object' && 
						typeof data.response.venues.length == 'number' && data.response.venues.length > 0) {					
						newPlace = data.response.venues[0];
					}

					// If we have no new place, but we did have a place, they've left
					if (newPlace === null && currentPlace !== null) {
						dispatchEvent(listener.EVENT_LEAVE);

					// Otherwise if it's a valid place, different to current, they've entered
					} else if (newPlace != currentPlace && newPlace !== null) {
						dispatchEvent(listener.EVENT_ENTER, newPlace);
					}
					
					currentPlace = newPlace;

					detectLocationDelayed();
				},
				function(error, status, request) {				
					detectLocationDelayed();
				}
			);
		};
		
		var dispatchEvent = function(event, data) {
			var listeners = events[event];

			if (typeof listeners == 'object' && typeof listeners.length == 'number') {
				for (var l in listeners) {
					listeners[l].call(this, data);
				}
			}
		};

		this.addEventListener = function(event, callback) {
			if (typeof events[event] == 'undefined') {
				events[event] = [];
			}

			events[event].push(callback);	
		};

		this.removeEventListener = function(event, callback) {
			if (typeof events[event] == 'object' && typeof events[event].indexOf == 'function') {
				var index = events[event].indexOf(callback);

				if (index > -1) {
					events[event].splice(index, 1);
				}
			}	
		};
		
		detectLocation();

		return this;
	};
	
};