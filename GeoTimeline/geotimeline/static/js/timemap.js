google.load("visualization", "1");
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

var data; 

$(function(){
  $('header').addClass('map-header').find('a').first().fadeOut('slow');
  $('footer').slideToggle();
  timeline = new links.Timeline($('#timeline-container')[0]);
  resize();
});

$(window).resize(resize);

function resize(e){
  var height = $(window).height();
  $('#map').height(height * .8);
  timeline.checkResize();
}




//*********************************************************************************************
//  Random Data Code
//*********************************************************************************************
// Set callback to run when API is loaded
    google.setOnLoadCallback(drawVisualization);

    // Called when the Visualization API is loaded.
    function drawVisualization() {
        // Create and populate a data table.
        data = new google.visualization.DataTable();
        data.addColumn('datetime', 'start');
        data.addColumn('datetime', 'end');
        data.addColumn('string', 'content');
        // data.addColumn('string', 'group');
        data.addColumn('string', 'className');

        // create some random data
        //var names = ["Algie", "Barney", "Chris"];
        var name = getRandomName();
        for (var n = 0, len = 1; n < len; n++) {
            var name = getRandomName();
            var now = new Date();
            var end = new Date(now.getTime() - 12 * 60 * 60 * 1000);
            for (var i = 0; i < 10; i++) {
                var start = new Date(end.getTime() + Math.round(Math.random() * 5) * 60 * 60 * 1000);
                var end = new Date(start.getTime() + Math.round(4 + Math.random() * 5) * 60 * 60 * 1000);

                var r = Math.round(Math.random() * 2);
                var availability = (r === 0 ? "WithBob" : (r === 1 ? "WithKids" : "Alone"));
                var className = availability.toLowerCase();
                var content = getRandomVacation();
                var group = name;
                data.addRow([start, end, content,  className]);
            }
        }

        // specify options
        var options = {
            width:  "100%",
            height: "100%",
            axisOnTop: true,
            eventMargin: 10,  // minimal margin between events
            eventMarginAxis: 0, // minimal margin beteen events and the axis
            editable: true,
            showNavigation: true,
            stackEvents: true,
            zoomMin: 54000000,
            zoomMax: 3153600000000
        };

        // Instantiate our timeline object.
        //timeline = new links.Timeline(document.getElementById('mytimeline'));

        // register event listeners
        google.visualization.events.addListener(timeline, 'edit', onEdit);

        // Draw our timeline with the created data and options
        timeline.draw(data, options);

        // Set a customized visible range
        var start = new Date(now.getTime() - 4 * 60 * 60 * 1000);
        var end = new Date(now.getTime() + 8 * 60 * 60 * 1000);
        timeline.setVisibleChartRangeAuto();
        
		bindHoverEvents();
		
    }
	
	function bindHoverEvents() {
		$('.timeline-event').each(function(){
			$(this).hover(
				  function(){
				  	$(this).addClass('event_hover');
				  }, function(){
				  	$(this).removeClass('event_hover');
				  });
		});
	}
		
    function getRandomName() {
        var names = ["Algie", "Barney", "Grant", "Mick", "Langdon"];

        var r = Math.round(Math.random() * (names.length - 1));
        return names[r];
    }
    
	function getRandomVacation() {
        var names = ["Hawaii", "Germany", "Washington, D.C.", "Dominican Republic", "London"];

        var r = Math.round(Math.random() * (names.length - 1));
        return names[r];
    }

    function getSelectedRow() {
        var row = undefined;
        var sel = timeline.getSelection();
        if (sel.length) {
            if (sel[0].row != undefined) {
                row = sel[0].row;
            }
        }
        return row;
    }

    function strip(html)
    {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent||tmp.innerText;
    }

    // Make a callback function for the select event
    var onEdit = function (event) {
        var row = getSelectedRow();
        var content = data.getValue(row, 2);
        var availability = strip(content);
        var newAvailability = prompt("Enter status\n\n" +
                "Choose from: Available, Unavailable, Maybe", availability);
        if (newAvailability != undefined) {
            var newContent = newAvailability;
            data.setValue(row, 2, newContent);
            data.setValue(row, 4, newAvailability.toLowerCase());
            timeline.draw(data);
        }
    };

    var onNew = function () {
        alert("Clicking this NEW button should open a popup window where " +
                "a new status event can be created.\n\n" +
                "Apperently this is not yet implemented...");
    };
