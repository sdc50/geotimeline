var mockOverlayData = [{
	title: 'marker1',
	collection: 'first collection',
	color: '#008000',//green
	user: 'user1',
	shape: 'marker',
	geometry: 'd_ehE}`}l[',
	start: '2014-03-18 14:59:23',
	end: '2014-03-18 15:00:00'
},
{
	title: 'marker2',
	collection: 'second collection',
	color: '#003D80',
	user: 'user1',
	shape: 'marker',
	geometry: '`i`jEac|~[',
	start: '2014-03-18 15:47:12',
	end: '2014-03-18 15:50:12'
},
{
	title: 'marker3',
	collection: 'third collection',
	color: '#DF1D03',
	user: 'user1',
	shape: 'marker',
	geometry: 'zf~lEgmqm[',
	start: '2014-03-18 15:51:59',
	end: '2014-03-18 16:00:00'
},
//polygons
{
title: 'polygon1',
	collection: 'first collection',
	color: '#008000',//green
	user: 'user1',
	shape: 'polygon',
	geometry: 'vvyfEmmsr[vjgBq{aCq_oAspd@',
	start: '2014-04-18 14:59:23',
	end: '2014-04-18 15:00:00'
},
{
	title: 'polygon2',
	collection: 'second collection',
	color: '#003D80',
	user: 'user1',
	shape: 'polygon',
	geometry: 'hxjoE_cck[qpR{`sCbt`AtfQh[zsoB',
	start: '2014-04-18 15:47:12',
	end: '2014-04-18 15:50:12'
},
{
	title: 'polygon3',
	collection: 'third collection',
	color: '#DF1D03',
	user: 'user1',
	shape: 'polygon',
	geometry: 'rewmEiwmv[{vY}~eBje^ikS|fe@tfQf{G||x@',
	start: '2014-04-18 15:51:59',
	end: '2014-04-18 16:00:00'
},
//polylines
{
title: 'polyline1',
	collection: 'first collection',
	color: '#008000',//green
	user: 'user1',
	shape: 'polyline',
	geometry: '|s{oEysgr[sieB}}[vqkAig`@of_BgimA_}Gi|i@',
	start: '2014-05-18 14:59:23',
	end: '2014-05-18 15:00:00'
},
{
	title: 'polyline2',
	collection: 'second collection',
	color: '#003D80',
	user: 'user1',
	shape: 'polyline',
	geometry: 'zelkEenk{[vioAsia@okwA}xeArwb@irV',
	start: '2014-05-18 15:47:12',
	end: '2014-05-18 15:50:12'
},
{
	title: 'polyline3',
	collection: 'third collection',
	color: '#DF1D03',
	user: 'user1',
	shape: 'polyline',
	geometry: '`choEaou}[dijAtcjGmlCzv_C',
	start: '2014-05-18 15:51:59',
	end: '2014-05-18 16:00:00'
},
];

/*write function which accepts a collection array of this type and creates all of the map overlays
 * name
 * color
 * user
 * events
 * 
 * where events is an array of event objects of this type:
 * name
 * shape
 * geometry
 * start
 * end
 */
//this is going to contain all the overlay events added from the database
var userEvents = [];
function addEventsToMap(events){
	for (var e=0; e<events.length; e++){
		var evente;
		var sColl = events[e].collection;
		var sColor = events[e].color;
		var sUser = events[e].user;
		var sShape = events[e].shape;
		var tStart = events[e].start;
		var tEnd = events[e].end;
		var sTitle = events[e].title;
		var aCodedGeom = events[e].geometry;
		var aDecodGeom = google.maps.geometry.encoding.decodePath(aCodedGeom);
		switch(sShape){
			case 'marker':
			//make marker
			evente = new google.maps.Marker({
				//map:map,
				color: sColor,
				position: aDecodGeom[0],
				title: sTitle,
				collection: sColl,
				user: sUser,
				start: tStart,
				end: tEnd,
			});
			userEvents.push(evente);
			break;
			case 'polygon':
			//make polygon
			evente = new google.maps.Polygon({
				//map:map,
				paths: aDecodGeom,
				geodesic: true,
				strokeColor: sColor,
				fillColor: sColor,
				strokeOpacity: 1.0,
				fillOpacity: 0.5,
				strokeWeight: 2.0,
				title: sTitle,
				collection: sColl,
				user: sUser,
				start: tStart,
				end: tEnd,
			});
			userEvents.push(evente);
			break;
			case 'polyline':
			//make polyline
			evente = new google.maps.Polyline({
				//map:map,
				path: aDecodGeom,
				geodesic: true,
				strokeColor: sColor,
				strokeOpacity: 1.0,
				strokeWeight: 2.0,
				title: sTitle,
				collection: sColl,
				user: sUser,
				start: tStart,
				end: tEnd,
			});
			userEvents.push(evente);
			break;
		}
	}
	//now add all of the events in the evente array to the map
	for (var o=0; o<userEvents.length; o++){
		userEvents[o].setMap(map);
	}
}