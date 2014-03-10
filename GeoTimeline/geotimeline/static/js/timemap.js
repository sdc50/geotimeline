
 google.maps.event.addDomListener(window, 'load', initialize);

function initialize() {
  var mapDiv = $('#map')[0];
  var map = new google.maps.Map(mapDiv, {
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


var timeline;

var btn =  ' <div class="btn-group" id="usr-group">'
         + '  <button type="button" class="btn btn-danger dropdown-toggle btn-lg" data-toggle="dropdown">'
         + '     Action <span class="caret"></span>'
         + '   </button>'
         + '   <ul class="dropdown-menu" role="menu">'
         + '     <li><a href="#">Action</a></li>'
         + '     <li><a href="#">Another action</a></li>'
         + '     <li><a href="#">Something else here</a></li>'
         + '     <li class="divider"></li>'
         + '     <li><a href="#">Separated link</a></li>'
         + '   </ul>'
         + ' </div>';

$(function(){
  $('header').addClass('map-header').find('a').first().toggle();
  $('footer').slideToggle();
  timeline = new links.Timeline($('#timeline')[0]);
  resize();
});

$(window).resize(resize);

function resize(e){
  var height = $(window).height();
  $('#timeline').height(height * .2);
  $('#map').height(height * .8);
  timeline.setSize('100%', height * .2 + 'px');
}
