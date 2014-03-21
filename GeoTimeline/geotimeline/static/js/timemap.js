//google.load("visualization", "1");
//google.maps.event.addDomListener(window, 'load', initializeMap);
//google.setOnLoadCallback(initializeTimeline);

var map, timeline;

$(function(){
  $('header').addClass('map-header').find('a').first().fadeOut('slow');
  $('footer').slideToggle();

  initializeMap();
  initializeTimeline();
  resize();
  
  getEvents();

  // validate();
  
  $(window).resize(resize);
});


function initializeMap() {
  var mapDiv = $('#map')[0];
  map = new google.maps.Map(mapDiv, {
    //center: new google.maps.LatLng(37.4419, -122.1419),
    center: new google.maps.LatLng(-34.397, 150.644),
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: true,
    mapTypeControlOptions:{
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      position: google.maps.ControlPosition.TOP_RIGHT
    },
    panControl: true,
    panControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP
    },
    zoomControl: true,
    zoomControlOptions: {
        style: google.maps.ZoomControlStyle.LARGE,
        position: google.maps.ControlPosition.RIGHT_TOP
    },
    scaleControl: true,
    scaleControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP
    },
    streetViewControl: true,
    streetViewControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP
    }
  });
  
  drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.MARKER,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.MARKER,
        //google.maps.drawing.OverlayType.CIRCLE,
        google.maps.drawing.OverlayType.POLYGON,
        google.maps.drawing.OverlayType.POLYLINE,
        //google.maps.drawing.OverlayType.RECTANGLE
      ]
    },
    // markerOptions: {
      // // icon: 'flagPoint.jpg',
    // },
    // circleOptions: {
      // fillColor: '#ffff00',
      // fillOpacity: 0.5,
      // strokeWeight: 2,
      // clickable: false,
      // editable: true,
      // zIndex: 1
    // },
    // polygonOptions: {
		// //path:myTrip,
  		// strokeColor:"#0000FF",
  		// strokeOpacity:0.8,
  		// strokeWeight:2,
  		// fillColor:"#0000FF",
  		// fillOpacity:0.4
    // }
  });
 
  drawingManager.setMap(map);
  drawingManager.setOptions({drawingControl:false});  //hides drawing controls
  drawingManager.setDrawingMode(null); //sets control to pan mode
  
}

function initializeTimeline(){
    // Instantiate our timeline object.
    timeline = new links.Timeline($('#timeline-container')[0]);
    
    // specify options
    var options = {
      width:  "100%",
      height: "100%",
      axisOnTop: true,
      eventMargin: 10,  // minimal margin between events
      eventMarginAxis: 0, // minimal margin beteen events and the axis
      editable: false,
      showNavigation: true,
      stackEvents: true,
      zoomMin: 54000000,
      zoomMax: 3153600000000,
      cluster: true
    };
 
    // Draw our timeline with the created data and options
    timeline.draw('', options);
}

//use global variable to represent event overlays just drawn
var userCollections;
var userOverlays = [];
function addEventsToMap(events){
	var startIndex = userOverlays.length
	for (var e=0; e<events.length; e++){
		var evente;
		var sColl = events[e].collection.name;
		var sColor = events[e].collection.color;
		var sUser = events[e].user;
		var sShape = events[e].shape;
		var tStart = new Date(events[e].start);
		var tEnd = new Date(events[e].end);
		var tcontent = events[e].name;
		var tclassName = "row" + (startIndex + e);
		console.log(tclassName);
		var tbody = events[e].content;
		var sTitle = events[e].name;
		var aCodedGeom = events[e].geometry;
		console.log(google.maps.geometry);
		var aDecodGeom = google.maps.geometry.encoding.decodePath(aCodedGeom);
		switch(sShape){
			case 'marker':
			//make marker
			evente = new google.maps.Marker({
				//map:map,
				strokeColor: sColor,
				fillColor: sColor,
				position: aDecodGeom[0],
				title: sTitle,
				collection: sColl,
				user: sUser,
				start: tStart,
				end: tEnd,
				content: tcontent,
				body: tbody,
				className: tclassName,
				highlightOn: function(){
						this.setAnimation(google.maps.Animation.BOUNCE);
						this.timelineDiv.css({"opacity":"1"});
					},
				highlightOff: function(){
					this.setAnimation(null);
					this.timelineDiv.css({"opacity":"0.75"});
				},
				});
				google.maps.event.addListener(evente, 'click', function(){
					this.onClick();
				});
				google.maps.event.addListener(evente, 'mouseover', function(){
					this.highlightOn();
				});
				google.maps.event.addListener(evente, 'mouseout', function(){
					this.highlightOff();
				});
			userOverlays.push(evente);
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
				content: tcontent,
				body: tbody,
				className: tclassName,
				highlightOn: function(){
					this.setValues({fillOpacity:1.0});
					this.timelineDiv.css({"opacity":"1"});
				},
				highlightOff: function(){
					this.setValues({fillOpacity:0.5});
					this.timelineDiv.css({"opacity":"0.75"});
				}
			});
			google.maps.event.addListener(evente, 'click', function(){
					this.onClick();
				});
			google.maps.event.addListener(evente, 'mouseover', function(){
				this.highlightOn();
			});
			google.maps.event.addListener(evente, 'mouseout', function(){
				this.highlightOff();
			});
			userOverlays.push(evente);
			break;
			case 'polyline':
			//make polyline
			evente = new google.maps.Polyline({
				//map:map,
				path: aDecodGeom,
				geodesic: true,
				strokeColor: sColor,
				strokeOpacity: 1.0,
				strokeWeight: 5.0,
				title: sTitle,
				collection: sColl,
				user: sUser,
				start: tStart,
				end: tEnd,
				content: tcontent,
				body: tbody,
				className: tclassName,
				highlightOn: function(){
						this.setValues({strokeWeight:8.0});
						this.timelineDiv.css({"opacity":"1"});
					},
					highlightOff: function(){
						this.setValues({strokeWeight:5.0});
						this.timelineDiv.css({"opacity":"0.75"});
					},
				});
				google.maps.event.addListener(evente, 'click', function(){
					this.onClick();
				});
				google.maps.event.addListener(evente, 'mouseover', function(){
					this.highlightOn();
				});
				google.maps.event.addListener(evente, 'mouseout', function(){
					this.highlightOff();
			});
			userOverlays.push(evente);
			break;
		}	userOverlays[userOverlays.length-1].setMap(map);
	}
	console.log('adding to map');
	//now add all of the events in the evente array to the map
	// for (var o=0; o<userOverlays.length; o++){
		// userOverlays[o].setMap(map);
	// }
}
//end addEventsToMap()

google.maps.MVCObject.prototype.onClick = function(){
	body_content = "<p>Event Collection: " + this.collection + "</p> <p>Dates: " + this.start + " - " + this.end + "</p> <p>Description: " + this.body + "</p>";
	$('#view-modal-title').text(this.content);
	$('#view-modal-body').html(body_content);
	$('#view-modal').modal('show');
}

function addEventsToTimeline(events){    
    // Draw our timeline with the created data
    timeline.setData(events);
    timeline.redraw();
     
    // Set visibility on load
    timeline.setVisibleChartRangeAuto();
    
    timelineManager();  
    
}

function timelineManager () {
	var overlay;
	$('.timeline-event').each(function(){
		$(this).filter(function(){
			var classes = this.className.split(" ");
			for (var i=0, len = classes.length; i<len; i++){
				if (/row\d+/.test(classes[i])){
					var id = classes[i].split("row")[1];
					overlay = userOverlays[id];
					overlay.timelineDiv = $(this);
					console.log(overlay);
					var color = overlay.strokeColor;
					$(this).css({"background-color": color, "opacity": "0.75"})
				}
			}
		});
		$(this).hover($.proxy(function(){this.highlightOn()}, overlay), 
			$.proxy(function(){this.highlightOff()}, overlay)
        )
		.click($.proxy(function(){this.onClick()}, overlay))
		
	});
}

function resize(e){
  var height = $(window).height();
  var width = $(window).width();
  $('#map').height(height * .8);
  $('#map').width(width);
  $('#map-form').width(width + 500);
  $('#content').width(width);
  timeline.checkResize();
}

function validate(){
  
  //get name from name field
  //get all fields
  
  //validate code 
  var base = new Date()
  var start = new Date(base.getTime() + Math.round(4 + Math.random() * 5) * 60 * 60 * 1000);
  var end = new Date(start.getTime() + Math.round(4 + Math.random() * 5) * 60 * 60 * 1000);
  
  data = {name: 'test',
          content: 'text', 
          shape: 'point', 
          geometry: 'encodedString', 
          start: start.toJSON(),
          end: end.toJSON(),
          collectionId: 1,
          collection: null,//'My Test Vacation3',
          color: null//'#aabbcc' 
          }; //get event data from form
      saveEvent(data);
  //else
      //send invalid input message
}

function saveEvent(data){
  $.ajax({
    type: "POST",
    url: saveEventUrl,
    data: data
  })
    .done(function( msg ) {
      console.log( "Data Saved: " + msg.msg );
  });
}

function getEvents(){
  
  $.ajax({
    url: getEventsUrl,
    cache: false
  })
    .done(function( json ) {
      userCollections = json.collections;
      //TODO - make css classes for collections
      userEvents = mockOverlayData; //json.events;
      console.log(userEvents);
      //addEventsToTimeline(userEvents);
      addEventsToMap(userEvents);
      addEventsToTimeline(userOverlays);
    })
    .fail(function( textStatus ) {
      console.log( "Request failed: " + textStatus.toString() );
    });
}


//this is a mock data set for the map overlays
var mockOverlayData = [{
	name: 'marker1',
	content: 'content content',
	collection: {name:'first collection', color: '#008000'},//green
	user: 'user1',
	shape: 'marker',
	geometry: 'd_ehE}`}l[',
	start: '2014-03-18 14:59:23',
	end: '2014-05-18 15:00:00'
},
{
	name: 'marker2',
	content: 'content content',
	collection: {name:'second collection', color: '#003D80'},
	user: 'user1',
	shape: 'marker',
	geometry: '`i`jEac|~[',
	start: '2014-01-18 15:47:12',
	end: '2014-03-18 15:50:12'
},
{
	name: 'marker3',
	content: 'content content',
	collection: {name:'third collection', color: '#DF1D03'},
	user: 'user1',
	shape: 'marker',
	geometry: 'zf~lEgmqm[',
	start: '2014-01-18 15:51:59',
	end: '2014-03-18 16:00:00'
},
//polygons
{
	name: 'polygon1',
	content: 'content content',
	collection: {name:'first collection', color: '#008000'},//green
	user: 'user1',
	shape: 'polygon',
	geometry: 'vvyfEmmsr[vjgBq{aCq_oAspd@',
	start: '2014-02-18 14:59:23',
	end: '2014-04-18 15:00:00'
},
{
	name: 'polygon2',
	content: 'content content',
	collection: {name:'second collection', color: '#003D80'},
	user: 'user1',
	shape: 'polygon',
	geometry: 'hxjoE_cck[qpR{`sCbt`AtfQh[zsoB',
	start: '2014-03-18 15:47:12',
	end: '2014-04-18 15:50:12'
},
{
	name: 'polygon3',
	content: 'content content',
	collection: {name:'third collection', color: '#DF1D03'},
	user: 'user1',
	shape: 'polygon',
	geometry: 'rewmEiwmv[{vY}~eBje^ikS|fe@tfQf{G||x@',
	start: '2014-04-18 15:51:59',
	end: '2014-05-18 16:00:00'
},
//polylines
{
	name: 'polyline1',
	content: 'content content',
	collection: {name:'first collection', color: '#008000'},//green
	user: 'user1',
	shape: 'polyline',
	geometry: '|s{oEysgr[sieB}}[vqkAig`@of_BgimA_}Gi|i@',
	start: '2014-05-18 14:59:23',
	end: '2014-06-18 15:00:00'
},
{
	name: 'polyline2',
	content: 'content content',
	collection: {name:'second collection', color: '#003D80'},
	user: 'user1',
	shape: 'polyline',
	geometry: 'zelkEenk{[vioAsia@okwA}xeArwb@irV',
	start: '2014-05-18 15:47:12',
	end: '2014-06-18 15:50:12'
},
{
	name: 'polyline3',
	content: 'content content',
	collection: {name:'third collection', color: '#DF1D03'},
	user: 'user1',
	shape: 'polyline',
	geometry: '`choEaou}[dijAtcjGmlCzv_C',
	start: '2014-05-18 15:51:59',
	end: '2014-05-30 16:00:00'
},
];
//end mock dataset for the overlays
