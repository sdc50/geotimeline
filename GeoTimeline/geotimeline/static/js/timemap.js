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

  //validate();
  
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

function addEventsToMap(events){

}



function addEventsToTimeline(events){
  
    data = userEvents.map(function(item){
      return {'start': new Date(item.start),
              'end': new Date(item.end),
              'content': item.name,
              //'group': item.user,
              'className': item.collection.color,  //TODO - assign classes to collections
              'id':item.id} 
    });
    
    // Draw our timeline with the created data
    timeline.setData(data);
    timeline.redraw();
     
    // Set visibility on load
    timeline.setVisibleChartRangeAuto();
    
    addColorStyle();  
      
    bindHoverEvents();
}

function addColorStyle () {
	$('.timeline-event').each(function(){
		$(this).filter(function(){
			var classes = this.className.split(" ");
			for (var i=0, len = classes.length; i<len; i++){
				if (/^#/.test(classes[i])){
					$(this).css({"background-color": classes[i], "border-color": classes[i], "opacity": "0.5"})
				}
			}
		})
	})
}

function bindHoverEvents() {
  $('.timeline-event').each(function(){
    $(this).hover(
        function(){
        	$(this).css({"opacity":"1"});
        	// $(this).addClass('event_hover');
        }, function(){
        	$(this).css({"opacity":"0.5"});
        	// $(this).removeClass('event_hover');
        	addColorStyle();
        });
  });
}

function resize(e){
  var height = $(window).height();
  $('#map').height(height * .8);
  timeline.checkResize();
}

function validate(){
  
  //get name from name field
  //get all fields
  
  //validate code 
  
  var start = new Date();
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