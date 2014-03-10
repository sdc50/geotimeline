//compression or expansion of map
$('#btn_map').click(function(){
var pick = document.getElementById('btn_map').innerHTML;
if(pick=='MAP -'){
	console.log('minus');
	document.getElementById('btn_map').innerHTML = 'MAP +';
	$('#mapview').hide('fast');
}
else{
	console.log('plus');
	document.getElementById('btn_map').innerHTML = 'MAP -';
	$('#mapview').show('fast');
	}
});
//compression or expansion of blog
$('#btn_blog').click(function(){
var pick = document.getElementById('btn_blog').innerHTML;
if(pick=='BLOG -'){
	console.log('minus');
	document.getElementById('btn_blog').innerHTML = 'BLOG +';
	$('#blogview').hide('fast');
}
else{
	console.log('plus');
	document.getElementById('btn_blog').innerHTML = 'BLOG -';
	$('#blogview').show('fast');
	}
});

$('#btn_time').click(function(){
var pick = document.getElementById('btn_time').innerHTML;
if(pick=='TIMELINE -'){
	console.log('minus');
	document.getElementById('btn_time').innerHTML = 'TIMELINE +';
	$('#timeline').hide('fast');
}
else{
	console.log('plus');
	document.getElementById('btn_time').innerHTML = 'TIMELINE -';
	$('#timeline').show('fast');
	}
});

$('#btn_friends').click(function(){
var pick = document.getElementById('btn_friends').innerHTML;
if(pick=='FRIENDS -'){
	console.log('minus');
	document.getElementById('btn_friends').innerHTML = 'FRIENDS +';
	$('#friends').hide('fast');
}
else{
	console.log('plus');
	document.getElementById('btn_friends').innerHTML = 'FRIENDS -';
	$('#friends').show('fast');
	}
});