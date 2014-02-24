//compression or expansion of map
$('#btn_map').click(function(){
var pick = document.getElementById('btn_map').innerHTML;
if(pick=='Minimize'){
	console.log('minus');
	document.getElementById('btn_map').innerHTML = 'Maximize';
	$('#mapview').hide('fast');
}
else{
	//console.log('plus');
	document.getElementById('btn_map').innerHTML = 'Minimize';
	$('#mapview').show('fast');
	}
});

//compression or expansion of blog
$('#btn_blog').click(function(){
var pick = document.getElementById('btn_blog').innerHTML;
if(pick=='Minimize'){
	console.log('minus');
	document.getElementById('btn_blog').innerHTML = 'Maximize';
	$('#blogview').hide('fast');
}
else{
	console.log('plus');
	document.getElementById('btn_blog').innerHTML = 'Minimize';
	$('#blogview').show('fast');
	}
});

$('#btn_time').click(function(){
var pick = document.getElementById('btn_time').innerHTML;
if(pick=='Minimize'){
	console.log('minus');
	document.getElementById('btn_time').innerHTML = 'Maximize';
	$('#timeline').hide('fast');
}
else{
	console.log('plus');
	document.getElementById('btn_time').innerHTML = 'Minimize';
	$('#timeline').show('fast');
	}
});

$('#btn_friends').click(function(){
var pick = document.getElementById('btn_friends').innerHTML;
if(pick=='Minimize'){
	console.log('minus');
	document.getElementById('btn_friends').innerHTML = 'Maximize';
	$('#friends').hide('fast');
}
else{
	console.log('plus');
	document.getElementById('btn_friends').innerHTML = 'Minimize';
	$('#friends').show('fast');
	}
});
/*
//this makes the views draggable
var dragSrcEl = null;
function handleDragStart(e){
	//this.style.opacity = '0.4'; //this / e.target is the source node.
	dragSrcEl = this;
	e.dataTransfer.effectAllwoed = 'move';
	e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e){
	if(e.preventDefault){
		e.preventDefault();//Necessary. Allows us to drop.
	}
	e.dataTransfer.dropEffect = 'move'; //See the section on the DataTransfer object.
	return false;
}

function handleDragEnter(e){
	//this / e.target is the current hover target.
	this.classList.add('over');
}

function handleDragLeave(e){
	this.classList.remove('over'); //this / e.target is previous target element.
}

function handleDrop(e){
	//this / e.target is current target element
	if(e.stopPropogation){
		e.stopPropogation(); //stops the browser from redirecting.
	}
	//Don't do anything if dropping the same spot we're dragging.
	if(dragSrcEl != this){
		//Set the source div's HTML to the HTML of the column we dropped on.
		dragSrcEl.innerHTML = this.innerHTML;
		this.innerHTML = e.dataTransfer.getData('text/html');
	}
	// See the section on the DataTransfer object.
	return false;
}

function handleDragEnd(e){
	//this / e.target is the source node.
	[].forEach.call(dragDivs, function(dragDiv){
		dragDiv.classList.remove('over');
	});
}

var dragDivs = document.querySelectorAll('#dragDivs .dragMe');
[].forEach.call(dragDivs, function(dragDiv){
	dragDiv.addEventListener('dragstart',handleDragStart, false);
	dragDiv.addEventListener('dragenter', handleDragEnter, false);
	dragDiv.addEventListener('dragover', handleDragOver, false);
	dragDiv.addEventListener('dragleave', handleDragLeave, false);
	dragDiv.addEventListener('drop', handleDrop, false);
	dragDiv.addEventListener('dragend', handleDragEnd, false);
});
*/
//add map to #mapview
/*
function initializeMap(){
	var mapDiv = document.getElementById('mapview');
	var map = new google.maps.Map(mapDiv, {
		center: new google.maps.LatLnt(37.4419, -122.1419),
		zoom: 13,
		mapTypeId: googl.maps.MapTypeId.ROADMAP
	});
}
*/
