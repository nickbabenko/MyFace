var ajax = require('ajax');

var API_BASE_URL = 'https://api.foursquare.com/v2/',
	API_CLIENT_ID = 'L4MTYKULBETAEYVQIDBG04N45SR2SJL045QRLZRTHV1T10QR',
	API_CLIENT_SECRET = 'ARXRLC53H33LRT1LHC0U4JMOSYP0MZTRHIYQKVNXMKEOFJYL',
	API_VERSION = '20150306',
	LOCATION_UPDATE_DELAY = 1, // minutes
	SEARCH_RADIUS = 50;

var petrolStationCategoryIds = [
	'4bf58dd8d48988d113951735'	
];

module.exports = function() {
	
	var listener = this,
		currentPlaceId = null,
		events = {};
	
	this.EVENT_ENTER = 'enter';
	this.EVENT_LEAVE = 'leave';
			
	var loadNearestPlace = function(lat, lng) {		
		ajax(
			{
				url: API_BASE_URL + 'venues/search?ll=' + lat + ',' + lng + '&categoryId=' + petrolStationCategoryIds[0] + 
				'&limit=1&radius=' + SEARCH_RADIUS + '&client_id=' + API_CLIENT_ID + '&client_secret=' + API_CLIENT_SECRET + 
					'&v=' + API_VERSION,
				type: 'json'
			},
			function(data, status, request) {
				var newPlaceId = null;
								
				if (typeof data.response == 'object' && typeof data.response.venues == 'object' && 
					typeof data.response.venues.length == 'number' && data.response.venues.length > 0) {					
					newPlaceId = data.response.venues[0].id;
				}
								
				// If we have no new place, but we did have a place, they've left
				if (newPlaceId === null && currentPlaceId !== null) {
					dispatchEvent(listener.EVENT_LEAVE);
					
				// Otherwise if it's a valid place, different to current, they've entered
				} else if (newPlaceId != currentPlaceId && newPlaceId !== null) {
					dispatchEvent(listener.EVENT_ENTER);
				}
				
				currentPlaceId = newPlaceId;
									
				detectLocationDelayed();
			},
			function(error, status, request) {				
				detectLocationDelayed();
			}
		);
	};
	
	var detectLocationDelayed = function() {
		setTimeout(detectLocation, (LOCATION_UPDATE_DELAY * 60 * 1000));	
	};

	var detectLocation = function() {
		navigator.geolocation.getCurrentPosition(
			function(pos) {
				loadNearestPlace(pos.coords.latitude, pos.coords.longitude);
			}, 
			function() {},
			{
				enableHighAccuracy: true, 
				maximumAge: 10000, 
				timeout: 10000
			}
		);
	};
	
	var dispatchEvent = function(event) {
		var listeners = events[event];
		
		if (typeof listeners == 'object' && typeof listeners.length == 'number') {
			for (var l in listeners) {
				listeners[l].call(this);
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