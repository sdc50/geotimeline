$(window).scroll(function(e){
  var top = $(this).scrollTop();
  $('#timeline-img').css('left',-top*2 );
});

$('#intro').click(function(event){
	event.preventDefault();
	blueimp.Gallery(
	    document.getElementById('links_intro').getElementsByTagName('a'),
	    {
	        container: '#blueimp-gallery',
	        continuous: false,
	        carousel: false
	    }
	);
});

$('#how').click(function(event){
	event.preventDefault();
	blueimp.Gallery(
	    document.getElementById('links_how').getElementsByTagName('a'),
	    {
	        container: '#blueimp-gallery',
	        continuous: false,
	        carousel: false
	    }
	);
});

$('#view').click(function(event){
	event.preventDefault();
	blueimp.Gallery(
	    document.getElementById('links_view').getElementsByTagName('a'),
	    {
	        container: '#blueimp-gallery',
	        continuous: false,
	        carousel: false
	    }
	);
});