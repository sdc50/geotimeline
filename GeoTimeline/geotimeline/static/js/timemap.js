
 google.maps.event.addDomListener(window, 'load', initialize);

function initialize() {
  var mapDiv = $('#map')[0];
  var map = new google.maps.Map(mapDiv, {
    center: new google.maps.LatLng(37.4419, -122.1419),
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  console.log(mapDiv);
}


$(function(){
  var timeline = new links.Timeline($('#timeline')[0]);
});
