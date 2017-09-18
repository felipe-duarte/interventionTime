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
var zwLatLng = {lat: 46.554736, lng: 7.378989};
var zhLatLng = {lat: 47.395948, lng: 8.637851};
var geLatLng = {lat: 46.233611, lng: 6.096944};

var centerCoord = {lat: 46.823314, lng: 8.229163};
var zoomLevel = 8;
var mapType = "terrain";

var iconPath = "img/map-marker-2-24.png";

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

var swissLayerUrl = "http://ec2-54-203-139-105.us-west-2.compute.amazonaws.com/interventionTime/maps/swissLayer-kml.kml";

var changed = false;

//Initialize map - Call from GMaps script
function initMap() {
  map = new google.maps.Map(document.getElementById('map'),buildMapOpts());
  map.addListener('zoom_changed', function() {
    refreshMarkers();
    refreshBaseMarkers();
  });
  initMarkersCollection();
  loadKML();
  loadUIInit();
 }

// Init base markers and collections
function initMarkersCollection(){
  markersCollection = new Array(filesName.length);
  for(var i=0;i<filesName.length;i++){
    loadMarker(i);
    markersCollection[i] = [];
  }
}

// Load KML Swiss Layer
function loadKML(){
   var swissLayer = new google.maps.KmlLayer({
          url: swissLayerUrl,
          map: map,
          clickable: false,
          screenOverlays: false,
          suppressInfoWindows: true,
          zIndex: 0
        });
}

// Build Map Opts
function buildMapOpts(){
  return {
    zoom: zoomLevel,
    center: centerCoord,
    mapTypeControl: true,
    mapTypeControlOptions: {
      mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain']
    },
    mapTypeId: mapType
  };
}

// Create anon function to setup input controls
function loadUIInit(){
  $(function() {
      $("#floating-panel").draggable({
         scroll: false,
         containment: $("#map")
      });
      $("#floating-panel").addClass("ui-corner-all");
  });

  $(function() {
      $("#time-slider").slider({
          orientation: "horizontal",
          range: "min",
          min: 0,
          max: 60,
          step: 1,
          value: 15,
          slide: function(event, ui) {
            var value = ui.value;
            $("#time-box").val(value);
            changed=true;
          },
          start: function(event,ui){
            changed=false;
          },
          stop: function(event, ui){
            if(changed){
             refreshDataSets();
            }
          }
      });
    });

  $(function(){
    $("input[type=number]").addClass("ui-corner-all");
    $("input[type=number]").bind("change", changeInputNumber);
  });  
}

// Manipulate change event of input number
function changeInputNumber(){
  var attrID = $(this).attr("id");
  var val = Number($(this).val());
  var min = Number($(this).attr("min"));
  var max = Number($(this).attr("max"));
  if(validateInput(val,max,min)){
    if(attrID.indexOf("time")!==-1){
      $("#time-slider").slider("value",val);
      refreshDataSets();
    }else{
      var index = textFilter.indexOf(attrID);
      if(markersBase[index].getVisible()){
        refreshDataSetsAt(index);
      }
    }
  }else{
    $(this).val(15);
    $(this).change();
  }
}

// Validate input range
function validateInput(value,max,min){
  if(value<=max && value>=min){
    return true;
  }else{
    $("<div><p>Min "+ min +" - Max "+ max +" min</p></div>").dialog({
              classes: {
                "ui-dialog": "ui-state-error ui-corner-all",
                "ui-dialog-content": "ui-state-error"
              },
              title: "Alert",
              height: "auto",
              width: "auto",
              close: function (event, ui) { $(this).remove(); },
              modal: true,
              draggable: false,
              resizable: false
        });
    return false;
  }
}

// Build base markers
function loadMarker(index){
  var basename = title[index];
  var icon = iconPath;
  var marker = new google.maps.Marker({
    position: locations[index],
		map: map,
		title: basename,
    opacity: 0.8,
    icon: icon
  });
 	markersBase.push(marker);
}

// Refresh icon at zoom level
function refreshBaseMarkers(){
  var zoom = map.getZoom();
   for (var i = 0; i < markersBase.length; i++) {
      if(zoom>=8 && zoom<10){
        markersBase[i].setIcon("img/map-marker-2-24.png");
      }else if(zoom>=6 && zoom<8){
        markersBase[i].setIcon("img/map-marker-2-16.png");
      }else if(zoom<=5){
        markersBase[i].setIcon("img/map-marker-2-8.png");
      }else{
        markersBase[i].setIcon("img/map-marker-2-32.png");
      }
    }
}

// Refresh markers icons on zoom change
function refreshMarkers(){
  for (var i = 0; i < markersCollection.length; i++) {
    for (var j = 0; j < markersCollection[i].length; j++) {
      if(!isUndefined(markersCollection[i][j])){
        markersCollection[i][j].setIcon("img/"+getIcon(i));
      }
    }
  }
}

//Toogle base markers and respective markersCollection
function toogleBase(title){
 for (var i = 0; i < markersBase.length; i++) {
  	var marker = markersBase[i];
  	if(marker.getTitle()==title){
  		if (!marker.getVisible()) {
      		marker.setVisible(true);
          refreshDataSetsAt(i);
        } else {
  	    	marker.setVisible(false);
          clearMarkersCollectionAt(i);
    	}
	  }
  }
}

// Validate lat, lng, time
function isNumber(obj) { return !isNaN(parseFloat(obj)); } 

function isUndefined(obj) { return (typeof obj==="undefined"); }

// Remove markers from map before update collection
function clearMarkersCollectionAt(index){
  for (var j = 0; j < markersCollection[index].length; j++) {
    if(!isUndefined(markersCollection[index][j])){
      markersCollection[index][j].setMap(null);    
    }
  }
  markersCollection[index].length=0;
  markersCollection[index]=[];
}

// Refresh DataSets
function refreshDataSets(){
  var val = $("#time-slider").slider("option", "value");
  if(val>=0){
    for(var i=0;i<filesName.length;i++){
      if(markersBase[i].getVisible()){
        var filter = document.getElementById(textFilter[i]).value;
        var offset = Math.trunc(val-filter);
        if(offset>0 && offset<29){
        // console.log("Filter " + textFilter[i] + " : "+ filter);
          var mapName = "maps/"+offset+filesName[i];
          readData(mapName,i);   
        }else{
          clearMarkersCollectionAt(i);
        }
      }
    }
  }
}

//Refresh collection at index
function refreshDataSetsAt(index){
  var val = $("#time-slider").slider("option", "value");
  if(val>=0){
    var filter = document.getElementById(textFilter[index]).value;
    var offset = Math.trunc(val-filter);
    if(offset>0 && offset<29){
      var mapName = "maps/"+offset+filesName[index];
      readData(mapName,index);   
    }else{
      clearMarkersCollectionAt(index);
    }
  }
}

// Marker Icon based on index mod
function getIcon(index){ 
  var ind = index%13;
  var icon = "";
  var prefix = getPrefix();
  if(ind==0){
    icon=prefix+"mark.png";
  }else {
    icon=prefix+"mark"+ind+".png";
  }
  return icon;
}

// Prefix of marker based on zoom level (1,2,8,16 - Default 4px without prefix)
function getPrefix(){
  var prefix="";
  var zoom = map.getZoom();
  if(zoom>=11){
    prefix="16_";
  }else if(zoom<11 && zoom>9){
    prefix="8_";
  }else if(zoom<8 && zoom>=6){
    prefix="2_";
  }else if(zoom<6){
    prefix="1_";
  }
  return prefix;
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
      var icon = "img/"+getIcon(index);
      var marker = new google.maps.Marker({
        position: latLng,
        opacity: 0.5,
        clickable: false,
        map: map,
        icon: icon
      });
      markersCollection[index].push(marker);
    } 
  }
}

// Process file response
function processResponse(response,index){
  clearMarkersCollectionAt(index);
  var responseLines = response.split('\n');
  for(var i=0;i<responseLines.length;i++){
    processPoints(responseLines[i],index);         
  }
}

// Read data from server async
function readData(filePath,index){
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, true);
  xmlhttp.onreadystatechange = function (e) {
    if (xmlhttp.readyState === 4) {
      if (xmlhttp.status === 200) {
        var response = xmlhttp.responseText;
        processResponse(response,index);
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