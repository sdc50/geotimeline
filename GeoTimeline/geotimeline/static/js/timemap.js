//google.load("visualization", "1");
//google.maps.event.addDomListener(window, 'load', initializeMap);
//google.setOnLoadCallback(initializeTimeline);

var map, timeline, pageHeight, pageWidth;

$(function(){
  $('header').addClass('map-header').find('a').first().fadeOut('slow');
  $('footer').slideToggle();

  initializeMap();
  initializeTimeline();
  windowResize();
  $('#colorpicker').farbtastic('#color');
  
  getEvents();

  // validate();

  addListeners();
  
  
});

function addListeners(){
  
  $(window).resize(windowResize);
  
  $('.timeline-axis').mousedown(function(){
    $(document).mousemove(function(e){
      resizeTimeline(e.pageY);
    });
    $(document).mouseup(function(e){
            $(document).off('mousemove');
    });
  });
  
  // adding a new event
  $("#new-event-click").click(function(){
    drawingManager.setOptions({drawingControl:true});
      drawingManager.setDrawingMode(null);
      $('#timeline-container').slideToggle();
      $('#map').height($(window).height());
  });
  
  // Remove event from map and array if new event is cancelled
  $(".new-close").click(function(){
    drawingManager.setOptions({drawingControl:false});
      drawingManager.setDrawingMode(null);
      $('#timeline-container').slideToggle();
      deletedOverlay = userOverlays.pop();
      deletedOverlay.setMap(null);
      windowResize();
      
  });
  
  // Show or hide the color picker and collection label
  $("#collectionInput").change(function(){
  
    var collectionInput = $('#collectionInput')[0];
  
    if (collectionInput.value=="null"){
        $("#new-collection").slideToggle(); 
  
      }
      else{
        $("#new-collection").hide();
      }
  });
  
  $(".new-submit").click(function(){
    //call validation function which returns an error message string.
    //if it is blank then the form is submitted.
    //If it is not blank then the string is shown in an alert and the form is not submitted.
    var errorMsg = validateAllNewEvent();
    if(errorMsg == ''){
      drawingManager.setOptions({drawingControl:false});
        drawingManager.setDrawingMode(null);
      $('#timeline-container').slideToggle();
      $('#new-modal').modal('hide');
      var collection;
      var collectionInput = $('#collectionInput')[0];
      var name = $('#eventName').val();
      if (collectionInput.value=="null"){
        collectionName = $('#newCollection').val();
        collectionColor = $('#color').val();
        collection = {name: collectionName, color: collectionColor};  
        //saveCollection(collection);
        userCollections.push(collection);
      }
      else{
        collection = userCollections[collectionInput.selectedIndex - 1];
      }
      var start = new Date($('#startDate').val()).toJSON();
      var end = new Date($('#endDate').val()).toJSON();
      var content = $('#eventDescription').val();
      //var overlayIndex = userOverlays.length - 1;
      console.log(collection);
      var overlay = userOverlays.pop();//[overlayIndex];
      overlay.setMap(null);
      overlay.setOptions({fillColor:collection.color, strokeColor:collection.color});
      
      var newEvent = {'name':name, 
                      'content':content, 
                      'collection':collection, 
                      'user':"" ,
                      'shape':overlay.shape, 
                      'geometry':overlay.geometry, 
                      'start':start, 
                      'end':end};
                      
      userEvents.push(newEvent);
      addEventsToMap([newEvent]);
      windowResize();
      saveEvent(newEvent);
      console.log (newEvent);
    }else{
      alert(errorMsg);
    }
  });
  
  $('.edit-event').click(function(){
    var eventId = $('#eventId').val();
    var overlay = userOverlays[eventId];
    $('#view-modal').modal('hide');
    overlay.makeEditable();
    //$('#edit-modal').modal('show');
  });
}

var drawingManager
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
  });
 
  drawingManager.setMap(map);
  
  drawingManager.setOptions({drawingControl:false});
  drawingManager.setDrawingMode(null);
  
  google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
	drawingManager.setOptions({drawingControl:false});
    drawingManager.setDrawingMode(null);
    $('#new-modal').modal('show');

    var overlay = event.overlay;
    overlay.shape = event.type;
    if(overlay.shape == "marker"){
    	var newPos = overlay.getPosition();
     	var posArr = [];
     	var newLatLng = new google.maps.LatLng(newPos.k,newPos.A);
     	posArr.push(newLatLng);
     	overlay.geometry = google.maps.geometry.encoding.encodePath(posArr);
    }
    else{
    	overlay.geometry = google.maps.geometry.encoding.encodePath(overlay.getPath());
    }
    
    userOverlays.push(overlay);
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
      zoomMin: 54000000, // one hour
      // zoomMin: 2592000000, // 1 day
      zoomMax: 3153600000000, // 100 years
      cluster: true
    };
 
    // Draw our timeline with the created data and options
    timeline.draw('', options);
}

//use global variable to represent event overlays just drawn
var userCollections = [];
var userOverlays = [];
var userEvents = [];
function addEventsToMap(events){
	var startIndex = userOverlays.length
	for (var e=0; e<events.length; e++){
	  var iId = events[e].id;
		var overlayIndex = startIndex + e;
		var evente;
		var sColl = events[e].collection.name;
		var sColor = events[e].collection.color;
		var sUser = events[e].user;
		var sShape = events[e].shape;
		var tStart = new Date(events[e].start);
		var tEnd = new Date(events[e].end);
		var tcontent = events[e].name;
		var iOverlayIndex = overlayIndex;

		var tclassName = "row" + overlayIndex;

		var tbody = events[e].content;
		var sTitle = events[e].name;
		var aCodedGeom = events[e].geometry;
		console.log(google.maps.geometry);
		var aDecodGeom = google.maps.geometry.encoding.decodePath(aCodedGeom);
		switch(sShape){
			case 'marker':
			//make variables for the pin color
			var pinColor = sColor.substring(1);
			console.log(pinColor);
			var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
				//new google.maps.Point(0,0),
				//new google.maps.Point(10,34),
				null,
				null,
				null,
				new google.maps.Size(21,34));
			var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
				new google.maps.Size(40,37),
				new google.maps.Point(0,0),
				new google.maps.Point(12,35));
			//end pin color variables
			//make marker
			//pinImage = { path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, scale:10}
			evente = new google.maps.Marker({
				//map:map,
				editOn: false,
				id: iId,
				index: iOverlayIndex,
				strokeColor: sColor,
				fillColor: sColor,
				icon: pinImage, //this is new for the marker color
				//shadow: pinShadow, //this is new for the marker shadow
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
					var color = this.fillColor;
					color = color.substring(1);
					var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + color,
					//new google.maps.Point(0,0),
					//new google.maps.Point(10,34),
					null,
					null,
					null,
					new google.maps.Size(42,68));
					this.setIcon(pinImage);
					//this.setAnimation(google.maps.Animation.BOUNCE);
					this.timelineDiv.css({"opacity":"1"});
					},
				highlightOff: function(){
					var color = this.fillColor;
					color = color.substring(1);
					var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + color,
					//new google.maps.Point(0,0),
					//new google.maps.Point(10,34),
					null,
					null,
					null,
					new google.maps.Size(21,34));
					this.setIcon(pinImage);
					//this.setAnimation(null);
					this.timelineDiv.css({"opacity":"0.75"});
				},
				makeEditable: function(){
				  this.setIcon('http://icons.iconarchive.com/icons/everaldo/kids-icons/32/package-utilities-icon.png');
		          this.setDraggable(true);
		          this.editOn = true;
		        },
				});
				google.maps.event.addListener(evente, 'click', function(){
					this.onClick();
				});
				google.maps.event.addListener(evente, 'mouseover', function(){
					if(this.editOn == false){
						this.highlightOn();
					}
				});
				google.maps.event.addListener(evente, 'mouseout', function(){
					if(this.editOn == false){
						this.highlightOff();
					}
				});
			userOverlays.push(evente);
			break;
			case 'polygon':
			//make polygon
			evente = new google.maps.Polygon({
				//map:map,
				editOn: false,
				id: iId,
				index: iOverlayIndex,
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
				},
			 makeEditable: function(){
          this.setEditable(true);
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
			case 'polyline':
			//make polyline
			evente = new google.maps.Polyline({
				//map:map,
				editOn: false,
				id: iId,
				index: iOverlayIndex,
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
			  makeEditable: function(){
			    this.setEditable(true);
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
		}	
		
		userOverlays[overlayIndex].setMap(map);
		addEventToTimeline(userOverlays[overlayIndex]);
	}
	//now add all of the events in the evente array to the map
	// for (var o=0; o<userOverlays.length; o++){
		// userOverlays[o].setMap(map);
	// }
}
//end addEventsToMap()

google.maps.MVCObject.prototype.onClick = function(){
	showEventPost(this);
};

function showEventPost(userEvent){
  var color = userEvent.color;
  $('#view-modal-title').text(userEvent.collection + ': ' + userEvent.content);
  
  body_content = "<p>Dates: " + userEvent.start + " - " + userEvent.end + "</p>"
               + "<p>Description: " + userEvent.body + "</p>"
               + '<input id="eventId" type="hidden" value="' + userEvent.index + '"/>';
               
  $('#view-modal-body').html(body_content);
  $('#view-modal').modal('show');
}

function addEventToTimeline(data){    
    // Draw our timeline with the created data
    timeline.addItem(data);
    timeline.redraw();
     
    // Set visibility on load
    timeline.setVisibleChartRangeAuto();
    
    timelineManager();    
}

function timelineManager () {
	var overlay;
	$('.timeline-event, .timeline-event-box').each(function(){
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
		.click(function(){
			var coord = overlay.position;
			// var place = new google.maps.LatLng(lat , lon);
			var place = coord;
			var bounds = new google.maps.LatLngBounds();
			bounds.extend(place);
			map.fitBounds(bounds);
			});
	
		
	});
}

function windowResize(){
  pageHeight = $(window).height();
  pageWidth = $(window).width();
  resizeTimeline(pageHeight * .8);
}

function resizeTimeline(y){
  var timelineHeight = pageHeight - y;
  var BUFFER = 100;
  timelineHeight = timelineHeight < BUFFER ? BUFFER : timelineHeight > pageHeight - BUFFER ? pageHeight - BUFFER : timelineHeight;
  $('#timeline-container').height(timelineHeight);
  $('#map').height(pageHeight - timelineHeight);
  $('#map').width(pageWidth);
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
    data: data,
    //contentType: 'application/json; charset=utf-8'
  })
    .done(function( msg ) {
      console.log( "Data Saved: " + msg.msg );
  });
}

function saveCollection(collection){
  $.ajax({
    type: "POST",
    url: saveCollectionUrl,
    data: collection,
    //contentType: 'application/json; charset=utf-8'
  })
    .done(function( msg ) {
      collection.id =  msg.id
      var optionString = '<option value="' + collection.id + '">'+ collection.name +'</option>';
      $('#collectionInput').append(optionString);
      
  });
}

function getEvents(){
  
  $.ajax({
    url: getEventsUrl,
    cache: false
  })
    .done(function( json ) {
      userCollections = json.collections;
      createDatalist();

      userEvents = json.events;

      addEventsToMap(userEvents);
    })
    .fail(function( textStatus ) {
      console.log( "Request failed: " + textStatus.toString() );
    });
}

  


function showSubmission(){
	var x = $('#collectionInput').val();
	var z = $('#collections');
	var val = $(z).find('option[value="' + x + '"]');
	var endval = val.attr('id');
	//x is the name
	//endval is the id
	alert("x: " + x + " z: " + z + " val: " + val + " endval: " + endval);
}



function createDatalist(){
	for(var l=0; l<userCollections.length; l++){
		var listElement = userCollections[l];
		var optionString = '<option value="' + listElement.id + '">'+ listElement.name +'</option>';
		$('#collectionInput').append(optionString);
	}
	
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
	start: '2014-03-18 16:00:00',
	end: '2014-03-20 16:00:00'
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
///////////////////////////////////////////////////////////////////
//this is for the jquery ui datepicker
$('#startDate').datetimepicker();
$('#endDate').datetimepicker();
var st = $('#startDate');
var dStart;
st.on('blur',function(){
	dStart = new Date(st.val());
	console.log(dStart);
	dateTimeValidation(st);
});
var en = $('#endDate');
var dEnd;
en.on('blur',function(){
	dEnd = new Date(en.val());
	console.log(dEnd);
	dateTimeValidation(en);
});
//function to check if the start is at least 30 min before the end
function dateTimeValidation(target){
	if((dEnd-dStart < (60*30*1000)) && dStart && dEnd){
		alert("The end date/time must be at least 30 minutes after the start date/time.");
		target.focus();
	}
	else if(dEnd && !dStart){
		alert("You must choose a beginning date to have an end date.");
		st.focus();
	}
}
//////////////////////////////////////////////
//this is the validation stuff for the 
//new events form
//required
// $('.requiredInput')
//select item not required but check something?
//$('#collectionInput')
//only required if collectionInput is null
/*this event listener is for the following ids:
 * eventName
 * newCollection
 * color
 * startDate
 * eventDescription
 */
$('.requiredInput').on('blur',function(evt){
	if(!$(evt.target).val()){
	  $(evt.target).parent().addClass('has-error');
		//alert('This is a required field.');
		//$(evt.target).focus();
	}
});
/*this function checks everything and returns a message string.
 * If the message string is blank then it is all good.
 * If it is not blank then the form is not submitted.
 *
 * This function is called within the submit button's click event on line 529.
 */
function validateAllNewEvent(){
	var msg = '';
	
	if(!$('#eventName').val()){
		msg = msg + 'The event name field is blank.\n';
	}
	if(!$('#newCollection').val() && ($('#collectionInput').val() == "null")){
		msg = msg + 'The new collection name field is blank.\n';
	}
	if(!$('#color').val()){
		msg = msg + 'The new collection color field is blank.\n';
	}
	if(!$('#startDate').val()){
		msg = msg + 'The start date/time field is blank.\n';
	}
	if((dEnd-dStart < (60*30*1000)) && dStart && dEnd){
		msg = msg + 'The end date/time is less than 30 minutes after the start date/time.\n';
	}
	else if(dEnd && !dStart){
		msg = msg + 'You have entered a beginning date without an end date.';
	}
	if(!$('#eventDescription').val()){
		msg = msg + 'The event description field is blank.\n';
	}
	if(msg == ''){
		return msg;
	}
	else{
		msg = 'The following input errors have occured:\n' + msg;
		msg = msg + 'Please make the necessary corrections and try submitting again.\n\nThank You.';
		return msg;
	}
}
//$('#endDate') //not required but if filled it must be at least 30 min after startDate
//$('.btn btn-default new-submit')
//$('#new-event') //this is the form id
//end validation for new events form
///////////////////////////////////////////
