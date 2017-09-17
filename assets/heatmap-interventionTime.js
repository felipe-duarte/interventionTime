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

var heatmap;


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
 
  var heatmapOpt = {
    dissipating: true,
    opacity: 0.5,
    radius: 5,
    map: map
  };
  heatmap = new google.maps.visualization.HeatmapLayer(heatmapOpt);
 
  map.addListener('zoom_changed', function() {
    var zoom = map.getZoom();
   // console.log("Zoom Level : " + zoomLevel);
    if(zoom>=9){
      heatmap.set('radius',20);
    }else if(zoom<=8 && zoom>6){
      heatmap.set('radius',5);
    }else{
      heatmap.set('radius',1);
    }
  });
  
  loadUIInit();
  loadKML();
}

// Load Swiss KML File layer
function loadKML(){
  var swissLayer = new google.maps.KmlLayer({
          url: 'http://ec2-54-203-139-105.us-west-2.compute.amazonaws.com/interventionTime/maps/swissLayer-kml.kml',
          map: map,
          clickable: false,
          screenOverlays: false,
          suppressInfoWindows: true,
          zIndex: 0
        });
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
        if(ui.value>0){
          refreshDataSets(ui.value);          
        }
      }
    });
  });

  $(function(){
    $("input[type=number]").bind('change', function(){
      var val = $(this).val();
      if(val<=30 && val>=0){
        var id = $(this).attr("id");
        var index = textFilter.indexOf(id);
        if(markersBase[index].getVisible()){
          var timeWindow = $("#time-slider").slider("option", "value");
          if(timeWindow>=0){
            refreshDataSets(timeWindow);
          }
        }
      }else{
        $(this).val(15);
        $("<div><p>Min 0 - Max 30 min</p></div>").dialog({
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
      }
    });
    $("input[type=number]").addClass("ui-corner-all");
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
  if(val>0){
    refreshDataSets(val);
  }
}

function isNumber(obj) { return !isNaN(parseFloat(obj)); } 


function clearMarkersCollection(){
 // console.log("Before clear marker collection - Size : " + markersCollection[index].length);
  for (var i = 0; i < markersCollection.length; i++) {
    markersCollection[i]=null;
  }
  markersCollection.length=0;
  markersCollection=[];
  heatmap.setData(markersCollection);
//  console.log("After clear marker collection - Size : " + markersCollection[index].length);
}

// Refresh DataSets - Slider event
function refreshDataSets(timeWindow){
  clearMarkersCollection();
  if(timeWindow>=0){
    for(var i=0;i<filesName.length;i++){
      var mapName = 'maps/'+ filesName[i];
      if(markersBase[i].getVisible()){
        readData(mapName,timeWindow);
      }
    }
  }
}

// Process each line of file
function processPoints(line,timeWindow){
  var point = line.split(',');
  if(point.length==3){
    var lat = point[0];
    var lng = point[1];
    var val = point[2];
    if(isNumber(lat) && isNumber(lng) && isNumber(val)){
      if(val<=timeWindow){
        var latLng = new google.maps.LatLng(lat,lng);
        //var weight = Math.exp(val);
        var weight = val*60;
        var weightedLocation = {location: latLng, weight: weight};
        markersCollection.push(weightedLocation);        
      }
    } 
  }
}

// Read data from server async
function readData(filePath,timeWindow){
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, true);
      //console.log("MapName : " + filePath);
  xmlhttp.onreadystatechange = function (e) {
    if (xmlhttp.readyState === 4) {
      if (xmlhttp.status === 200) {
        var response = xmlhttp.responseText;
        var responseLines = response.split('\n');
        for(var i=0;i<responseLines.length;i++){
          processPoints(responseLines[i],timeWindow);         
        }
        heatmap.setData(markersCollection);
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

