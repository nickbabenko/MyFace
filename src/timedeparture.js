var TrainStationListener = require('trainstationlistener'),
	ajax = require('ajax'),
	UI = require('ui'),
	Vector2 = require('vector2');

var trainStationListener = new TrainStationListener();

module.exports = function(window) {
	
	var indicatorIcon = null,
		stationNameLabel = null,
		serviceDepartureLabel = null;
	
	// Listen for arrival at a train station
	trainStationListener.addEventListener(trainStationListener.EVENT_ENTER, function(place) {
		// Check we have a valid station code in the name
		if (typeof place.name != 'string') {
			return;
		}
		var stationCode = place.name.match(/\(([A-Z]{3})\)/);
		
		if (typeof stationCode == 'object' && typeof stationCode.length == 'number' && stationCode.length == 2) {			
			loadNextDepartureForStation(stationCode[1]);
		}
	});
	trainStationListener.addEventListener(trainStationListener.EVENT_LEAVE, function() {
		if (indicatorIcon !== null) {
			indicatorIcon.remove();
		}
		if (stationNameLabel !== null) {
			stationNameLabel.remove();
		}
		if (serviceDepartureLabel !== null) {
			serviceDepartureLabel.remove();
		}
	});
	
	var loadNextDepartureForStation = function(stationCode) {
		// Start envelope
		var requestBody = '<soap:Envelope xmlns:c="http://schemas.xmlsoap.org/soap/encoding/" ' +
			'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
		
		// Start header
		requestBody += '<soap:Header>';
		requestBody += '<n2:AccessToken xmlns:n2="http://thalesgroup.com/RTTI/2013-11-28/Token/types">';
		requestBody += '<n2:TokenValue>9ee82098-a435-4e5c-aa05-23cc9aac516a</n2:TokenValue>';
		requestBody += '</n2:AccessToken>';
		requestBody += '</soap:Header>';
		// End header
		
		// Start body
		requestBody += '<soap:Body>';
		
		// Start request
		// Either between Eccles and Manchester Victoria
		var destinationStationCode = (stationCode == 'ECC' ? 'MCV' : 'ECC');
		
		requestBody += '<n1:GetDepartureBoardRequest xmlns:n1="http://thalesgroup.com/RTTI/2014-02-20/ldb/">';
		requestBody += '<n1:numRows>1</n1:numRows>';
		requestBody += '<n1:crs>' + stationCode + '</n1:crs>';
		requestBody += (destinationStationCode !== null ? '<n1:filterCrs>' + destinationStationCode + '</n1:filterCrs>' : '');
		requestBody += '</n1:GetDepartureBoardRequest>';
		// end request
		
		requestBody += '</soap:Body>';
		// End body
		
		requestBody += '</soap:Envelope>';
		// End envelope
				
		ajax(
			{
				url: 'https://lite.realtime.nationalrail.co.uk/OpenLDBWS/ldb6.asmx',
				type: 'text',
				headers: {
					'SOAPAction': 'http://thalesgroup.com/RTTI/2012-01-13/ldb/GetDepartureBoard',
					'Content-Length': requestBody.length,
					'Content-Type': 'text/xml; charset=utf-8'
				},
				method: 'post',
				data: requestBody
			},
			function(data, status, request) {				
				var destinationData = data.match(/<destination><location><locationName>(.*)<\/locationName><crs>([A-Z]{3})<\/crs>.*<\/location><\/destination>/);
				var scheduledDepartureTime = data.match(/<std>([0-9]{2}:[0-9]{2})<\/std>/);
				var estimatedArrivalTime = data.match(/<eta>(.*)<\/eta>/);
				
				if (scheduledDepartureTime !== null) {
					showDepartureIndicator(
						destinationData[1] || null, 
						scheduledDepartureTime[1] || null, 
						(estimatedArrivalTime !== null ? estimatedArrivalTime[1] : null)
					);
				} else {
					if (indicatorIcon !== null) {
						indicatorIcon.remove();
					}
					if (stationNameLabel !== null) {
						stationNameLabel.remove();
					}
					if (serviceDepartureLabel !== null) {
						serviceDepartureLabel.remove();
					}
				}
			},
			function(error, status, request) {}
		);
	};
	
	var showDepartureIndicator = function(stationName, scheduledDepartureTime, estimatedArrivalTime) {		
		if (indicatorIcon === null) {
			indicatorIcon = new UI.Image({
				position: new Vector2(5, 137),
				size: new Vector2(16, 20),
				image: 'images/train_icon_white.png'
			});
			window.add(indicatorIcon);
		}
		if (stationNameLabel === null) {
			stationNameLabel = new UI.Text({
				position: new Vector2(25, 130),
				size: new Vector2(75, 20),
				textAlign: 'left'
			});
			window.add(stationNameLabel);
		}
		if (serviceDepartureLabel === null) {
			serviceDepartureLabel = new UI.Text({
				position: new Vector2(100, 130),
				size: new Vector2(40, 20),
				textAlign: 'right'
			});
			window.add(serviceDepartureLabel);
		}
		
		stationNameLabel.text(stationName);
		serviceDepartureLabel.text(estimatedArrivalTime || scheduledDepartureTime);
	};
	
};