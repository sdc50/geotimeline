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
    center: new google.maps.LatLng(37.4419, -122.1419),
    zoom: 13,
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
      zoomMax: 3153600000000
    };
 
    // Draw our timeline with the created data and options
    timeline.draw('', options);
}

//use global variable to represent event overlays just drawn
var userOverlays = [];
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
				highlightOn: function(){
						this.setAnimation(google.maps.Animation.BOUNCE);
					},
					highlightOff: function(){
						this.setAnimation(null);
					},
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
				highlightOn: function(){
					this.setValues({fillOpacity:1.0});
				},
				highlightOff: function(){
					this.setValues({fillOpacity:0.5});
				},
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
				highlightOn: function(){
						this.setValues({strokeWeight:8.0});
					},
					highlightOff: function(){
						this.setValues({strokeWeight:5.0});
					},
				});
				google.maps.event.addListener(evente, 'mouseover', function(){
					this.highlightOn();
				});
				google.maps.event.addListener(evente, 'mouseout', function(){
					this.highlightOff();
			});
			userOverlays.push(evente);
			break;
		}
	}
	
	//now add all of the events in the evente array to the map
	for (var o=0; o<userOverlays.length; o++){
		userOverlays[o].setMap(map);
	}
}
//end addEventsToMap()

//this is a mock data set for the map overlays
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
//end mock dataset for the overlays


function addEventsToTimeline(events){
  
    data = userEvents.map(function(item){
      return {'start': new Date(item.start),
              'end': new Date(item.end),
              'content': item.name,
              //'group': item.user,
              'className': "row" + item.id,  //TODO - assign classes to collections
              'id':item.id} 
    });
    
    // Draw our timeline with the created data
    timeline.setData(data);
    timeline.redraw();
     
    // Set visibility on load
    timeline.setVisibleChartRangeAuto();
    
    addColorStyle();  
      
    // bindHoverEvents();
}

function addColorStyle () {
	var overlay;
	$('.timeline-event').each(function(){
		$(this).filter(function(){
			var classes = this.className.split(" ");
			for (var i=0, len = classes.length; i<len; i++){
				if (/row\d+/.test(classes[i])){
					// $(this).css({"background-color": classes[i], "border-color": classes[i], "opacity": "0.5"})
					var id = classes[i].split("row")[1];
					console.log(id);
					overlay = userEvents[id-1]
					var color = overlay.collection.color;
					$(this).css({"background-color": color, "opacity": "0.75"})
					//TODO change the userEvents to just use the id that is passed from the object and remove the "-1"
					console.log(color);
				}
			}
		})
		.hover(function(){
        	overlay.highlightOn();
        }, function(){
        	overlay.hightlightOff();
        });
	});
}

// function bindHoverEvents() {
  // $('.timeline-event').each(function(){
    // $(this).hover(
        // function(){
        	// $(this).css({"opacity":"1"});
        	// console.log(this);
        	// // $(this).addClass('event_hover');
        // }, function(){
        	// $(this).css({"opacity":"0.5"});
        	// // $(this).removeClass('event_hover');
        // });
  // });
// }

function resize(e){
  var height = $(window).height();
  $('#map').height(height * .8);
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
      userEvents = json.events;
      console.log(userEvents);
      addEventsToTimeline(userEvents);
      addEventsToMap(userEvents);
    })
    .fail(function( textStatus ) {
      console.log( "Request failed: " + textStatus.toString() );
    });
}
