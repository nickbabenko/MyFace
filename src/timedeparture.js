var TrainStationListener = require('trainstationlistener'),
	parseXml = require('xmlparser'),
	ajax = require('ajax'),
	UI = require('ui'),
	Vector2 = require('vector2');

var trainStationListener = new TrainStationListener();

module.exports = function(window) {
	
	var stationNameLabel = null,
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
		requestBody += '<n1:GetDepartureBoardRequest xmlns:n1="http://thalesgroup.com/RTTI/2014-02-20/ldb/">';
		requestBody += '<n1:numRows>1</n1:numRows>';
		requestBody += '<n1:crs>' + stationCode + '</n1:crs>';
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
				console.log('response', data);
				var response = parseXml(data);
				
				console.log(typeof response);
				
				if (typeof response['soap:Envelope'] == 'object' && 
					typeof response['soap:Envelope']['soap:Body'] == 'object' &&
					typeof response['soap:Envelope']['soap:Body'].GetDepartureBoardResponse == 'object' &&
					typeof response['soap:Envelope']['soap:Body'].GetDepartureBoardResponse.GetStationBoardResult == 'object') {
					response = response['soap:Envelope']['soap:Body'].GetDepartureBoardResponse.GetStationBoardResult;
					
					if (typeof response.trainServices == 'object' && typeof response.trainServices.length == 'number') {
						showDepartureIndicator(response.locationName , response.trainServices[0]);
					}
				}
			},
			function(error, status, request) {
			}
		);
	};
	
	var showDepartureIndicator = function(stationName, service) {
		console.log('showDepartureIndicator', stationName, service.std);
		
		if (stationNameLabel !== null) {
			stationNameLabel = new UI.Text({
				position: new Vector2(0, 100),
				size: new Vector2(72, 20)
			});
			window.add(stationNameLabel);
		}
		if (serviceDepartureLabel !== null) {
			serviceDepartureLabel = new UI.Text({
				position: new Vector2(72, 100),
				size: new Vector2(72, 20)
			});
			window.add(serviceDepartureLabel);
		}
		
		stationNameLabel.text(stationName);
		serviceDepartureLabel.text(service.std);
	};
	
};