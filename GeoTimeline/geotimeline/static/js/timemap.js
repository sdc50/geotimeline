//google.load("visualization", "1");
//google.maps.event.addDomListener(window, 'load', initializeMap);
//google.setOnLoadCallback(initializeTimeline);

var map, timeline, pageHeight, pageWidth;

$(function(){
  $('header').addClass('map-header').find('a').first().fadeOut('slow');
  $('footer').slideUp();
  

  initializeMap();
  pageHeight = $(window).height();
  $('#map').height(pageHeight);
  initializeTimeline();
  setTimeout(windowResize,1000);

  $('#colorpicker').farbtastic('#color');
  
  getEvents();
  
  addListeners();

});

function addListeners(){
  
  $(window).resize(windowResize);
  
  $('.timeline-axis').mousedown(function(){
    $(document).mousemove(function(e){
      var BUFFER = 100;
      var timelineHeight = pageHeight - e.pageY;
      timelineHeight = timelineHeight < BUFFER ? BUFFER : timelineHeight > pageHeight - BUFFER ? pageHeight - BUFFER : timelineHeight;
      resizeTimeline(timelineHeight);
    });
    $(document).mouseup(function(e){
            $(document).off('mousemove');
    });
  });
  
  // setting for zoom to extents button
  $('#zoom-extents').click(function(){
    centerMap();
    timeline.setVisibleChartRangeAuto();
  });
    
  // adding a new event
  $("#new-event-click").click(function(){
      $('#map').height(pageHeight);
      $('#timeline-container').slideUp();
      drawingManager.setOptions({drawingControl:true});
      drawingManager.setDrawingMode(null);
      clearEventForm();
      $(".new-submit").off('click', editEventSubmit);
      $(".new-submit").off('click', newEventSubmit);
      $(".new-submit").click(newEventSubmit);
  });
  
  // Remove event from map and array if new event is cancelled
  $(".new-close").click(function(){
      drawingManager.setOptions({drawingControl:false});
      drawingManager.setDrawingMode(null);
      $('#timeline-container').slideDown(windowResize);
      $('#new-modal-title:contains("New Event Details")').each(function(){
        deletedOverlay = userOverlays.pop();
        deletedOverlay.setMap(null);
      });
      $('#new-modal-title:contains("Edit Event Details")').each(function(){location.reload()})
  });
  
  // Show or hide the color picker and collection label
  $("#collectionInput").change(function(){
  
    var collectionInput = $('#collectionInput')[0];
  
    if (collectionInput.value=="new"){
        $("#new-collection").slideDown(); 
      }
      else{
        $("#new-collection").slideUp();
      }
  });
  
  // turn on drawing editor when the edit event button is pressed
  $('.edit-event').click(function(){
    var eventIndex = $('#eventIndex').val();
    var overlay = userOverlays[eventIndex];
    $('#view-modal').modal('hide');
    $('#usr-group').toggle();
    $('#edit-post').toggle();
    $('#timeline-container').slideUp();
    $('#map').height(pageHeight);
    overlay.makeEditable();
    populateEditModal(overlay);
    $(".new-submit").off('click', editEventSubmit);
    $(".new-submit").off('click', newEventSubmit);
    $(".new-submit").click(editEventSubmit);
  });
  
  // bring up the edit modal when the shape is finished being edited
  $('#edit-post').click(function(){
    var eventIndex = $('#eventIndex').val();
    var overlay = userOverlays[eventIndex];
    $('#usr-group').toggle();
    $('#edit-post').toggle();
    overlay.makeUneditable();
    $('#new-modal').modal('show');
  });
  
  // Delete events when the button is pressed
  $('.delete-event').click(function(){
    var eventIndex = $('#eventIndex').val();
    var overlay = userOverlays[eventIndex];
    $('#view-modal').modal('hide');
    deleteEvent(overlay);
  });

}

var drawingManager;
function initializeMap() {
  
  var mapDiv = $('#map')[0];
  map = new google.maps.Map(mapDiv, {
    center: new google.maps.LatLng(39.8282, -98.5795),
    zoom: 4,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: true,
    mapTypeControlOptions:{
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      position: google.maps.ControlPosition.TOP_RIGHT
    },
    panControl: true,
    panControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER
    },
    zoomControl: true,
    zoomControlOptions: {
        style: google.maps.ZoomControlStyle.LARGE,
        position: google.maps.ControlPosition.RIGHT_CENTER
    },
    scaleControl: true,
    scaleControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER
    },
    streetViewControl: true,
    streetViewControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER
    }
  });
  
  drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.MARKER,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.MARKER,
        google.maps.drawing.OverlayType.POLYGON,
        google.maps.drawing.OverlayType.POLYLINE
      ]
    },
  });
 
  drawingManager.setMap(map);
  
  drawingManager.setOptions({drawingControl:false});
  drawingManager.setDrawingMode(null);
  
  // bring up modal after a new event is drawn
  google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
  drawingManager.setOptions({drawingControl:false});
    drawingManager.setDrawingMode(null);
    $('#new-modal').modal('show');

    var overlay = event.overlay;
    overlay.shapeType = event.type;
    userOverlays.push(overlay);
  });

  drawingManager.setMap(map);
  drawingManager.setOptions({drawingControl:false});  //hides drawing controls
  drawingManager.setDrawingMode(null); //sets control to pan mode
  
  // start: added for search bar
  var searchMarkers = [];
  var input = (document.getElementById('search-input'));
  map.controls[google.maps.ControlPosition.RIGHT_TOP].setAt(0,input);
  var searchBox = new google.maps.places.SearchBox(input);
  google.maps.event.addListener(searchBox, 'places_changed', function(){
    var places = searchBox.getPlaces();
    for (var i = 0, searchMarker; searchMarker = searchMarkers[i]; i++){
      searchMarker.setMap(null);
    }
    searchMarkers = [];
    var searchBounds = new google.maps.LatLngBounds();
    for (var i = 0, place; place = places[i]; i++){
      var image = {
        url: place.icon,
        size: new google.maps.Size(71,71),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(17,34),
        scaledSize: new google.maps.Size(25,25)
      };
      var searchMarker = new google.maps.Marker({
        map: map,
        icon: image,
        title: place.name,
        position: place.geometry.location
      });
      searchMarkers.push(searchMarker);
      searchBounds.extend(place.geometry.location);
    }
    map.fitBounds(searchBounds);
  });
  //end: added for search bar
}

function centerMap(){
  var bounds = new google.maps.LatLngBounds();
  var coord;
  // if there aren't any overlays
  if (userOverlays.length == 0){
    map.setZoom(4);
  }
  else{
    for(var i=0;i<userOverlays.length;i++){
      // Get bounds of a point
      object = userOverlays[i];
      if (object.shapeType == "marker"){
        var coord = object.position;
        bounds.extend(coord);
      }
      // Get bounds of a line
      else if (object.shapeType=="polyline"){
        path = object.getPath();
        arrayOfPath = path.j;
        for(var k=0;k<arrayOfPath.length;k++){
          coord=arrayOfPath[k];
          bounds.extend(coord);
        }
      }
      // Get bounds of polygons
      else{
        path = object.getPaths();
        arrayOfPaths = path.j[0].j;
        for(var z=0;z<arrayOfPaths.length;z++){
          coord=arrayOfPaths[z];
          bounds.extend(coord);
        }
      }
    }
    // fit the map to all of the bounds of the shapes
    map.fitBounds(bounds);
  }
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
      cluster: false
    };
 
    // Draw our timeline with the created data and options
    timeline.draw('', options);
}



//use global variable to represent event overlays just drawn
var userCollections = [];
var userOverlays = [];
function addEventsToMap(events){
  var startIndex = userOverlays.length;
  for (var e=0; e<events.length; e++){
    var evente;
    var iId = events[e].id;
    var sColl = events[e].collection.name;
    var sColor = events[e].collection.color;
    var iCollectionId = events[e].collection.id;
    var sUser = events[e].user;
    var sShape = events[e].shape;
    var tStart = new Date(events[e].start);
    var tEnd = null;
    if(events[e].end){
      tEnd = new Date(events[e].end);
    }
    var tcontent = events[e].name;
    var iOverlayIndex = startIndex + e;
    var tclassName = "row" + iOverlayIndex;
    var tbody = events[e].content;
    var sTitle = events[e].name;
    var aCodedGeom = events[e].geometry;
    var aDecodGeom = google.maps.geometry.encoding.decodePath(aCodedGeom);
    switch(sShape){
      case 'marker':
      //make marker
      var pinColor = sColor.substring(1);
      var pinImage =  new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
          null,
          null,
          null,
          new google.maps.Size(21,34));
      var largePinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
          null,
          null,
          null,
          new google.maps.Size(42,68));
      evente = new google.maps.Marker({
        pinImage: pinImage,
        largePinImage: largePinImage,
        shapeType: sShape,
        editOn: false,
        id: iId,
        index: iOverlayIndex,
        collectionId:  iCollectionId,
        strokeColor: sColor,
        fillColor: sColor,
        icon: pinImage, //this is new for the marker color
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
          this.setIcon(this.largePinImage);
          //this.setAnimation(google.maps.Animation.BOUNCE);
          this.timelineDiv.css({"opacity":"1"});
          },
        highlightOff: function(){
          this.setIcon(this.pinImage);
          //this.setAnimation(null);
          this.timelineDiv.css({"opacity":"0.75"});
        },
        makeEditable: function(){
          this.setIcon('http://icons.iconarchive.com/icons/everaldo/kids-icons/32/package-utilities-icon.png');
              this.setDraggable(true);
              this.editOn = true;
        },
        makeUneditable: function(){
          this.setIcon(this.pinImage);
              this.setDraggable(false);
              this.editOn = false;
            },
        });
        google.maps.event.addListener(evente, 'click', function(){
          var index = this.index;
          $('#eventId').val(index);
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
        shapeType: sShape,
        editOn: false,
        id: iId,
        index: iOverlayIndex,
        collectionId:  iCollectionId,
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
          makeUneditable: function(){
            this.setEditable(false);
          },
      });
      google.maps.event.addListener(evente, 'click', function(){
          var index = this.index;
          $('#eventId').val(index);
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
        shapeType: sShape,
        editOn: false,
        id: iId,
        index: iOverlayIndex,
        collectionId:  iCollectionId,
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
        makeUneditable: function(){
          this.setEditable(false);
        },
        });
        google.maps.event.addListener(evente, 'click', function(){
          var index = this.index;
          $('#eventId').val(index);
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
    // Add event to the map and timeline
    userOverlays[iOverlayIndex].setMap(map);
    addEventToTimeline(userOverlays[iOverlayIndex]);
  }

}
//end addEventsToMap()

function setMarkerImages(marker){
      var pinColor = marker.fillColor.substring(1);
      var pinImage =  new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
          null,
          null,
          null,
          new google.maps.Size(21,34));
      var largePinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
          null,
          null,
          null,
          new google.maps.Size(42,68));
          
     marker.pinImage = pinImage;
     marker.largePinImage = largePinImage;
     marker.icon = pinImage;
     //marker.setMap(null);
     marker.setMap(map);
}

google.maps.MVCObject.prototype.onClick = function(){
  showEventPost(this);
  
  // Set timeline to zoom to the event
  timeline.setVisibleChartRange(this.start, this.end);
  timeline.zoom(-0.5);
  
  var bounds = new google.maps.LatLngBounds();
  // Get bounds of a point
  if (this.shapeType == "marker"){
    var coord = this.position;
    bounds.extend(coord);
  }
  // Get bounds of a line
  else if (this.shapeType=="polyline"){
    path = this.getPath();
    arrayOfPath = path.j;
    for(var i=0;i<arrayOfPath.length;i++){
      coord=arrayOfPath[i];
      bounds.extend(coord);
    }
  }
  // Get bounds of polygons
  else{
    path = this.getPaths();
    arrayOfPaths = path.j[0].j;
    for(var i=0;i<arrayOfPaths.length;i++){
      coord=arrayOfPaths[i];
      bounds.extend(coord);
    }
  }
  // zoom to the bounds of the event
  map.fitBounds(bounds);
  if (this.shapeType == "marker"){
    map.setZoom(15);
  }
};

// function for showing the event information modal
function showEventPost(userEvent){
  var color = userEvent.color;
  $('#view-modal-title').text(userEvent.collection + ': ' + userEvent.content);
  var dateString = formatDate(userEvent.start);//.toDateString();
  if(userEvent.end){
    dateString += ' - ' + formatDate(userEvent.end);
  }
  else{
    dateString += ' ' + formatTime(userEvent.start);//.toTimeString();
  }
  
  body_content = "<p>" + dateString + "</p>"
               + "<p>" + userEvent.body + "</p>"
               + '<input id="eventIndex" type="hidden" value="' + userEvent.index + '"/>';
               
  $('#view-modal-body').html(body_content);
  $('#view-modal').modal('show');
}

var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function formatDate(date){
  var d = date.getDay();
  var weekDay = DAYS[d];
  var day = d + 1;
  var month = MONTHS[date.getMonth()];
  var year = date.getFullYear();

  return weekDay + ', ' + month + ' ' + day + ', ' + year;
}

function formatTime(date){
  var h = date.getHours();
  var abr = h < 12 ? 'AM' : 'PM';
  var hour = h < 12 ? h : h - 12;
  var min = date.getMinutes();
  
  return hour + ':' + min + ' ' + abr;
}

function formatDateTime(date){
  if(date)
  {
    function twoDigits(num){
      return num < 10 ? '0' + num : num;
    }
    var day = twoDigits(date.getDate());
    var month = twoDigits(date.getMonth() + 1);
    var year = date.getFullYear();
    var hour = twoDigits(date.getHours());
    var min = twoDigits(date.getMinutes());
    
    
    return year + '/' + month + '/' + day + ' ' + hour + ':' + min;
  }
  
  return '';
}

// clear the form for new events
function clearEventForm(){
  clearErrorMessages();
  $('#new-modal-title span').text("New Event Details")  
  $('#collectionInput').val('null');
  $('#newCollection').val('');
  $('#eventName').val('');
  $('#startDate').val('');
  $('#endDate').val('');
  $('#eventDescription').val('');
  $('#new-collection').hide();
}

// populate the edit modal with the existing information
function populateEditModal(userEvent){
  clearEventForm();
  $('#new-modal-title span').text("Edit Event Details")
  $('#collectionInput').val(userEvent.collectionId);
  $('#eventName').val(userEvent.content);
  $('#startDate').val(formatDateTime(userEvent.start));
  $('#endDate').val(formatDateTime(userEvent.end));
  $('#eventDescription').val(userEvent.body);
  $('#index').val(userEvent.index);
}

function clearErrorMessages(){
  $('.inputErrorMessage').text('');
  $('.requiredInputMsg').text('');
}

function eventSubmit(overlay){
  //call validation function which returns an error message string.
  //if it is blank then the form is submitted.
  //If it is not blank then the string is shown in an alert and the form is not submitted.
  var errorMsg = validateAllNewEvent();
  if(errorMsg == ''){
    drawingManager.setOptions({drawingControl:false});
    drawingManager.setDrawingMode(null);
    $('#timeline-container').slideDown();
    $('#new-modal').modal('hide');
    var collection;
    var collectionInput = $('#collectionInput')[0];
    var name = $('#eventName').val();
    overlay.content = name;
    if (collectionInput.value=="new"){
      collectionName = $('#newCollection').val();
      collectionColor = $('#color').val();
      collection = {name: collectionName, color: collectionColor};  
      userCollections.push(collection);
    }
    else{
      collection = userCollections[collectionInput.selectedIndex - 2];
    }
    var start = new Date($('#startDate').val());
    overlay.start = start;
    start = start.toJSON();
    var end = $('#endDate').val();
    if(end)
    {
      end = new Date(end);
      overlay.end = end;
      end = end.toJSON();
    }
    else{
      overlay.end = null;
    }
      
    var content = $('#eventDescription').val();
    overlay.body = content;
    overlay.setOptions({fillColor:collection.color, strokeColor:collection.color});
    var shape = overlay.shapeType;
    var geometry;
    if(shape == "marker"){
      var newPos = overlay.getPosition();
      var posArr = [];
      var newLatLng = new google.maps.LatLng(newPos.k,newPos.A);
      posArr.push(newLatLng);
      geometry = google.maps.geometry.encoding.encodePath(posArr);
      
      setMarkerImages(overlay);
    }
    else{
      geometry = google.maps.geometry.encoding.encodePath(overlay.getPath());
    }
    
    var newEvent = {'name':name, 
                    'content':content, 
                    'collection':collection, 
                    'shape':shape, 
                    'geometry':geometry, 
                    'start':start, 
                    'end':end};
  
    return newEvent;
    
   }else{
    $('.inputErrorMessage').html(errorMsg);
  }
}

// function to save new event when it is submitted
function newEventSubmit(){
    var overlay = userOverlays.pop();
    var newEvent = eventSubmit(overlay);
    if(newEvent){
      overlay.setMap(null);              
      addEventsToMap([newEvent]);
      windowResize();
      newEvent.index = userOverlays.length -1;
      saveEvent(newEvent);
    }
    else{
      userOverlays.push(overlay);
    }
}

//function for saving edits to an event
function editEventSubmit(){
  var index = $('#index').val();
  var overlay = userOverlays[index];
  var newEvent = eventSubmit(overlay);
  if(newEvent){
    timeline.changeItem(index, {"content":newEvent.name, "className":"row" + index, "start":overlay.start, "end":overlay.end});
    newEvent.index = index;
    newEvent.id = overlay.id;            
    windowResize();
    timelineManager(); 
    saveEvent(newEvent);
  }

}

function addEventToTimeline(data){    
    // Draw our timeline with the created data
    timeline.addItem(data);
    timeline.redraw();
     
    // Set visibility on load
    timeline.setVisibleChartRangeAuto();
    
    timelineManager();    
}

// change event opacity when timeline event is hovered over and open event info when clicked
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
          var color = overlay.strokeColor;
          $(this).css({"background-color": color, "opacity": "0.75", "cursor":"pointer"});
        }
      }
    });
    $(this).hover($.proxy(function(){this.highlightOn()}, overlay), 
      $.proxy(function(){this.highlightOff()}, overlay)
       )
    .click($.proxy(function(){this.onClick()}, overlay));
  });
}

function windowResize(){
  pageHeight = $(window).height();
  pageWidth = $(window).width();
  if(!drawingManager.drawingControl){
    resizeTimeline(pageHeight * .2);
  }
  else{
    resizeTimeline(0);
  }  
}

function resizeTimeline(timelineHeight){
  var mapHeight = pageHeight - timelineHeight;
  $('#timeline-container').height(timelineHeight);
  timeline.checkResize();
  $('#map').height(mapHeight);
  $('#map').width(pageWidth);
}

function saveEvent(newEvent){
  $.ajax({
    type: "POST",
    url: saveEventUrl,
    data: newEvent,
    //contentType: 'application/json; charset=utf-8'
  })
    .done(function( savedEvent ) {
      var collection = newEvent.collection;
      if(!collection.id){
        collection.id = savedEvent.collection.id;
        var optionString = '<option value="' + collection.id + '">'+ collection.name +'</option>';
        $('#collectionInput').append(optionString);
      }
      
      var overlay = userOverlays[newEvent.index];
      overlay.id = savedEvent.id;
      overlay.collectionId = collection.id;
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
  });
}

function getEvents(){
  $.ajax({
    url: getEventsUrl,
    cache: false
  })
    .done(function( json ) {
      userCollections = json.collections;
      createCollectionSelectList();

      addEventsToMap(json.events);
      centerMap();
    })
    
    .fail(function( textStatus ) {
      console.log( "Request failed: " + textStatus.toString() );
    });
}

// delete events from the map and timeline
function deleteEvent(overlay){
  url = deleteEventUrl + 'deleteEvent/' + overlay.id;
  overlay.setMap(null);

  userOverlays.splice(overlay.index,1);

  for(var index = 0, len = userOverlays.length; index < len; index ++){
    userOverlays[index].index = index;
  }
  
  timeline.deleteItem(overlay.index);
  
  $.ajax({
    url: url,
    cache: false
  })
    .done(function( json ) {
      centerMap();
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

// populate the collection list for the dropdown menu
function createCollectionSelectList(){
  for(var l=0; l<userCollections.length; l++){
    var listElement = userCollections[l];
    var optionString = '<option value="' + listElement.id + '">'+ listElement.name +'</option>';
    $('#collectionInput').append(optionString);
  }
}

///////////////////////////////////////////////////////////////////
//this is for the jquery ui datepicker
$('#startDate').datetimepicker();
$('#endDate').datetimepicker();
var st = $('#startDate');
var dStart;
var en = $('#endDate');
var dEnd;

st.on('blur',function(){
  dStart = new Date(st.val());
  dEnd = new Date(en.val());
  if(!en.val()){
    dEnd = new Date(dStart.getTime() + (60*30*1000));
    $('#endDate').val(formatDateTime(dEnd));
  }
  dateTimeValidation(en);
});

en.on('blur',function(evt){
  dStart = new Date(st.val());
  dEnd = new Date(en.val());
  dateTimeValidation(en);
});
//function to check if the start is at least 30 min before the end
function dateTimeValidation(target){
  if((dEnd-dStart < (60*30*1000)) && dStart && dEnd){
    target.parent().addClass('has-error');
      target.parent().find('.requiredInputMsg').text('The end date/time must be at least 30 minutes after the start date/time.');
  }
  else if(dEnd && !dStart){
    target.parent().addClass('has-error');
      target.parent().find('.requiredInputMsg').text('You must choose a beginning date to have an end date.');
  }
  else{
    target.parent().removeClass('has-error');
    target.parent().find('.requiredInputMsg').text('');
  }
}
/*This is for validation while filling out the form.
 * It captures on a blur event for the requiredInput class and changes
 * the text in the associated span tag with the requiredInputMsg class.
 */
$('.requiredInput').on('blur',function(evt){
  var target = $(evt.target);
  if (target.val() == ''){
    target.parent().find('.requiredInputMsg').text('This is a required field!');
    target.parent().addClass('has-error');
  }else{
    target.parent().find('.requiredInputMsg').text('');
    target.parent().removeClass('has-error');
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
    msg = msg + '<li>The event name field is blank.</li>';
  }
  if(!$('#newCollection').val() && ($('#collectionInput').val() == "new")){
    msg = msg + '<li>The new collection name field is blank.</li>';
  }
  if(!$('#color').val()){
    msg = msg + '<li>The new collection color field is blank.</li>';
  }
  if(!$('#startDate').val()){
    msg = msg + '<li>The start date/time field is blank.</li>';
  }
  if(dEnd != '' && (dEnd-dStart < (60*30*1000)) && dStart && dEnd){
    msg = msg + '<li>The end date/time is less than 30 minutes after the start date/time.</li>';
  }
  else if(dEnd && !dStart){
    msg = msg + '<li>You have entered a beginning date without an end date.</li>';
  }
  if(!$('#eventDescription').val()){
    msg = msg + '<li>The event description field is blank.</li>';
  }
  if(msg == ''){
    return msg;
  }
  else{
    msg = 'The following input errors have occured:<ul>' + msg;
    msg = msg + '</ul>Please make the necessary corrections and try submitting again. Thank You.';
    return msg;
  }
}
//end validation for new events form
///////////////////////////////////////////
