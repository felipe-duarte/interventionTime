"use strict"

var map;

var tiLatLng = {lat: 46.163056, lng: 8.881944};
var beLatLng = {lat: 46.910556, lng: 7.506111};
var bsLatLng = {lat: 47.605968, lng: 7.523312};
var lsLatLng = {lat: 46.547222, lng: 6.618056};
var grLatLng = {lat: 46.912778, lng: 9.551111};
var sgLatLng = {lat: 47.405618, lng: 9.290044};
var urLatLng = {lat: 46.834167, lng: 8.638324};
var enLatLng = {lat: 46.530556, lng: 9.878333};
var boLatLng = {lat: 46.670000, lng: 7.876111};
var moLatLng = {lat: 47.078056, lng: 9.066111};
var zwLatLng = {lat: 46.555278, lng: 7.379722};
var zhLatLng = {lat: 47.395948, lng: 8.637851};
var geLatLng = {lat: 46.233611, lng: 6.096944};

var centerCoord = {lat: 46.823314, lng: 8.528663};
var zoomLevel = 8;
var mapType = "terrain";

var title=['TI','BE','BS','LS','GR','SG','UR','EN','BO','MO','ZH','ZW','GE'];

var locations=[
    tiLatLng,
    beLatLng,
    bsLatLng,
    lsLatLng,
    grLatLng,
    sgLatLng,
    urLatLng,
    enLatLng,
    boLatLng,
    moLatLng,
    zhLatLng,
    zwLatLng,
    geLatLng];

var filesName=[
  'mapTi.txt',
  'mapBe.txt',
  'mapBs.txt',
  'mapLs.txt',
  'mapGr.txt',
  'mapSg.txt',
  'mapUr.txt',
  'mapEn.txt',
  'mapBo.txt',
  'mapMo.txt',
  'mapZh.txt',
  'mapZw.txt',
  'mapGe.txt'];

var textFilter=[
  'tiFilter',
  'beFilter',
  'bsFilter',
  'lsFilter',
  'grFilter',
  'sgFilter',
  'urFilter',
  'enFilter',
  'boFilter',
  'moFilter',
  'zhFilter',
  'zwFilter',
  'geFilter'
];

var markersBase=[];

var markersCollection=[];

//Initialize map
function initMap() {
  var mapOpt = {
    zoom: zoomLevel,
    center: centerCoord,
    mapTypeControl: true,
    mapTypeControlOptions: {
            mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain']
          },
    mapTypeId: mapType
  };
  map = new google.maps.Map(document.getElementById('map'),mapOpt);
  for(var i=0;i<filesName.length;i++){
    loadMarker(i);
  }
  
  map.addListener('zoom_changed', function() {
    var zoom = map.getZoom();
   // console.log("Zoom Level : " + zoom);
    if(zoom>=10){
      increaseMarkers();
    }else{
      decreaseMarkers();
    }
  });
  loadUIInit();
 }

function increaseMarkers(){
  var val = $("#time-slider").slider("option", "value");
  refreshDataSets(val);
}

function decreaseMarkers(){
  var val = $("#time-slider").slider("option", "value");
  refreshDataSets(val);
}

function loadUIInit(){
  $(function() {
      $( "#floating-panel" ).draggable();
    });

  $(function() {
      $("#time-slider").slider({
          orientation: "horizontal",
          min: 0,
          max: 30,
          step: 1,
          value: 0,
          slide: function(event, ui) {
            $("#time-label").html("Time: " + ui.value + " min");
            refreshDataSets(ui.value);
          }
      });
    });

  $(function(){
    $("input[type=number]").bind('change', function(){
      var id = $(this).attr("id");
      var val = $(this).val();
//      console.log("AttrID : " + id);
//      console.log("Index of :" + markersBase[textFilter.indexOf(id)]);
      if(val<=30){
        if(markersBase[textFilter.indexOf(id)].getVisible()){
          var val = $("#time-slider").slider("option", "value");
          refreshDataSets(val);
        }
      }else{
        alert("Max filter 30 min");
        $(this).val(30);
      }
    });
  });
}

// Build base markers
function loadMarker(index){
  var basename = title[index];
  var icon = 'img/map-marker-2-24.png';
  var marker = new google.maps.Marker({
    position: locations[index],
		map: map,
		title: basename,
    icon: icon
	 });
  marker.setVisible(false);
	markersBase.push(marker);
}

//Toogle base markers and respective markersCollection
function toogleBase(title){
 for (var i = 0; i < markersBase.length; i++) {
  	var marker = markersBase[i];
  	if(marker.getTitle()==title){
  		if (!marker.getVisible()) {
      		marker.setVisible(true);
        } else {
  	    	marker.setVisible(false);
    	}
	  }
  }
  var val = $("#time-slider").slider("option", "value");
  //console.log("Value Slider UI : " + val);
  refreshDataSets(val);
}

function isNumber(obj) { return !isNaN(parseFloat(obj)); } 

function clearMarkersCollection(){
 // console.log("Before clear marker collection - Size : " + markersCollection[index].length);
  for (var i = 0; i < markersCollection.length; i++) {
    markersCollection[i].setMap(null);
    markersCollection[i]=null;
  }
  markersCollection.length=0;
  markersCollection=[];
//  console.log("After clear marker collection - Size : " + markersCollection[index].length);
}

// Refresh DataSets - Slider event
function refreshDataSets(timeWindow){
  clearMarkersCollection();
  for(var i=0;i<filesName.length;i++){
    var filter = document.getElementById(textFilter[i]).value;
    var offset = timeWindow-filter;
    if(offset>=0 && offset<=20 && markersBase[i].getVisible()){
     // console.log("Filter " + textFilter[i] + " : "+ filter);
      var mapName = 'maps/'+offset+filesName[i];
      readData(mapName,i);   
    }
  }
}

function getIcon(val){ 
  var ind=val%13;
  var icon='mark';
  if(ind==0){
    icon+='.png';
  }else {
    icon+=ind+'.png';
  }
  return icon;
}

// Process each line of file
function processPoints(line,index){
  var point = line.split(',');
  if(point.length==3){
    var lat = point[0];
    var lng = point[1];
    var val = point[2];
   if(isNumber(lat) && isNumber(lng) && isNumber(val)){
      var latLng = new google.maps.LatLng(lat,lng);
      var icon = 'img/';
      var zoom = map.getZoom();
      if(zoom>=11){
        icon+="16_"+ getIcon(index);
      }else if(zoom<11 && zoom>=10){
        icon+="8_"+getIcon(index);
      }else{
        icon+=getIcon(index);
      }
      var marker = new google.maps.Marker({
        position: latLng,
        opacity: 0.6,
        map: map,
        icon: icon
      });
      markersCollection.push(marker);
    } 
  }
}

// Read data from server async
function readData(filePath,index){
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.open("GET", filePath, true);
      //console.log("MapName : " + filePath);
      xmlhttp.onload = function (e) {
        if (xmlhttp.readyState === 4) {
          if (xmlhttp.status === 200) {
            var response = xmlhttp.responseText;
            var responseLines = response.split('\n');
            for(var i=0;i<responseLines.length;i++){
             processPoints(responseLines[i],index);         
            }
          } else {
            console.error(xmlhttp.statusText);
          }
        }
      };
      xmlhttp.onerror = function (e) {
        console.error(xmlhttp.statusText);
      };
      xmlhttp.send(null);
}

//Random function to generate points around a center coordinate
function randomGeo(center, radius) {
  var y0 = center.lat;
  var x0 = center.lng;
  var rd = radius / 111300;
  var u = Math.random();
  var v = Math.random();
  var w = rd * Math.sqrt(u);
  var t = 2 * Math.PI * v;
  var x = w * Math.cos(t);
  var y = w * Math.sin(t);
  var xp = x / Math.cos(y0);
  return {
      'lat': y + y0,
      'lng': xp + x0
  };
}

// Heatmap data: 500 Points
function getPoints(center) {
  var lotsOfMarkers = [];
  for( var i = 1; i <= 500; i++) {
   var random = new google.maps.LatLng(randomGeo(center,8000));
   lotsOfMarkers.push(random);
  }
  return lotsOfMarkers;
}