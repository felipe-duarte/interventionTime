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
var birLatLng = {lat: 47.444688619234, lng: 8.233284951349};
var lauLatLng = {lat: 46.585272013292, lng: 7.913599257773};
var zerLatLng = {lat: 46.029098280690, lng: 7.752719434780};
var rarLatLng = {lat: 46.302098523295, lng: 7.833583697179};
var sioLatLng = {lat: 46.219070024226, lng: 7.326990622541};
var colLatLng = {lat: 46.268360835202, lng: 6.959630639527};
var leyLatLng = {lat: 46.341427438021, lng: 7.024282111378};
var greLatLng = {lat: 47.181863501241, lng: 7.416249196411};
var payLatLng = {lat: 46.844198896603, lng: 6.921326374768};
var davLatLng = {lat: 46.756129990482, lng: 9.787867218069};

var centerCoord = {lat: 46.823314, lng: 8.229163};
var zoomLevel = 8;
var mapType = "terrain";

var iconPath = "img/map-marker-2-24.png";

var title=['TI','BE','BS','LS','GR','SG','UR','EN','BO','MO','ZH','ZW','GE','BIR','LAU','ZER','RAR','SIO','COL','LEY','GRE','PAY','DAV'];

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
    geLatLng,
    birLatLng,
    lauLatLng,
    zerLatLng,
    rarLatLng,
    sioLatLng,
    colLatLng,
    leyLatLng,
    greLatLng,
    payLatLng,
    davLatLng
];

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
  'mapGe.txt',
  'mapBir.txt',
  'mapLau.txt',
  'mapZer.txt',
  'mapRar.txt',
  'mapSio.txt',
  'mapCol.txt',
  'mapLey.txt',
  'mapGre.txt',
  'mapPay.txt',
  'mapDav.txt'
];

var markersBase = [];

var markersCollection = [];

var heatmap = [];

var polygons = [];

var changed = false;

var flagRead = [];

//Initialize map
function initMap() {
  
  map = new google.maps.Map(document.getElementById("map"),buildMapOpts());

  for(var i=0;i<filesName.length;i++){
    loadMarker(i);
    markersCollection[i] = [];
    flagRead[i] = false;
    heatmap[i] = new google.maps.visualization.HeatmapLayer(buildHeatmapOpts(markersCollection[i]));
  }

  map.addListener("zoom_changed", updateRadius);
  
  loadUI();
  loadKML();
}

// Update heatmap radius
function updateRadius(){
   var zoom = map.getZoom();
   var radius = 1;
   if(zoom>=9){
     radius=10;
   }else if(zoom<=8 && zoom>6){
     radius=5;
   }else{
     radius=1;
   }
   for (var i = 0; i < heatmap.length; i++) {
    heatmap[i].set("radius",radius);
  }
}

// MapOpts
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

// HeatmapOpts
function buildHeatmapOpts(data){
  return {
    data: data,
    dissipating: true,
    opacity: 0.4,
    radius: 3,
    map: map
  };
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
  //parseKML();
 
}

function parseKML(){
  var myParser = new geoXML3.parser({
    map: null, 
    suppressInfoWindows : true, 
    afterParse: pushPolygons, 
    polygonOptions: { clickable: false}
  });
  myParser.parse('http://ec2-54-203-139-105.us-west-2.compute.amazonaws.com/interventionTime/maps/swissLayer-kml.kml');
}

function pushPolygons(doc) {
    // Geodata handling goes here, using JSON properties of the doc object
    var xml = doc[0];
    for (var i = 0; i < xml.gpolygons.length; i++) {
      var paths = xml.gpolygons[i].latLngs;
      var bounds = paths.b[0].length;
     // var keys = Object.keys(paths);
     // for (var j = 0; j < keys.length; j++) {
     //   console.log(" prop : " + keys[j]);
     // }
     //console.log("Polygon ["+i+"] length : " + bounds);
      polygons.push(new google.maps.Polygon({map: null, paths: paths}));
    }
}

// Setup UI Components
function loadUI(){
  // Build floating panel
  $(function() {
    $( "#floating-panel" ).draggable({
         scroll: false,
         containment: $("#map")
      });
  });
  // Build slider
  $(function() {
    $("#time-slider").slider({
      orientation: "horizontal",
      min: 0,
      max: 30,
      step: 1,
      value: 0,
      range: "min",
      slide: function(event, ui) {
        $("#time-label").html("Time: " + ui.value + " min");
        changed=true;
      },
      start: function(event,ui){
        changed=false;
      },
      stop: function(event,ui){
        if(changed){
         refreshDataSets(); 
         changed=false;         
        }
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
    icon: icon,
    visible: false
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
        refreshDataSets();
      } else {
        marker.setVisible(false);
        clearMarkersCollectionAt(i);
      }
    }
  }
}

function isNumber(obj) { return !isNaN(parseFloat(obj)); } 

// Clear markers collection at index
function clearMarkersCollectionAt(index){
 heatmap[index].setData([]);
}

// Refresh DataSets - Slider event
function refreshDataSets(){
    for(var i=0;i<filesName.length;i++){
      if(markersBase[i].getVisible()){
        if(!flagRead[i]){
          var mapName = 'maps/'+ filesName[i];
          readData(mapName,i); 
          flagRead[i]=true;         
        }else{
          refreshDataSetsAt(i);
        }
      }
    }
}

// Refresh datasets at index
function refreshDataSetsAt(index){
  var offset = Number($("#time-slider").slider("option", "value"));
  var markers = [];
  for (var i = 0; i < markersCollection[index].length; i++) {
    if(Number(markersCollection[index][i].weight) <= offset){
  //      console.log("Added point : " + markersCollection[index][i].weight);
      markers.push(markersCollection[index][i]);
    }
  }
  heatmap[index].setData(markers); 
}


// Process each line of file
function processPoints(line,index){
  var point = line.split(",");
  var strRet = "";
  if(point.length==3){
    var lat = point[0];
    var lng = point[1];
    var val = point[2];
    if(isNumber(lat) && isNumber(lng) && isNumber(val)){
        var latLng = new google.maps.LatLng(lat,lng);
       // for (var i = 0; i < polygons.length; i++) {
     //     if(google.maps.geometry.poly.containsLocation(latLng, polygons[i])){
            //var weight = Math.exp(val);
      //  var weight = val;
           // console.log("Added location");
        var weightedLocation = {location: latLng, weight: val};
        markersCollection[index].push(weightedLocation);
   //         strRet = (lat+","+lng+","+val+"\n");
  //          break;
       //   }
       // }
      
    } 
  }
//  return strRet;
}

// Process file response
function processResponseAjax(response,index){
  //clearMarkersCollectionAt(index);
  var responseLines = response.split("\n");
  var t0 = performance.now();
  
 // var strFile="";
  for(var i=0;i<responseLines.length;i++){
    processPoints(responseLines[i],index); 
  }
  //console.log(strFile);
  //heatmap[index].setData(markersCollection[index]);
  refreshDataSetsAt(index);
  var t1 = performance.now();
  console.log("Time elapsed to process response of " + responseLines.length + " was " + (t1-t0) + " milliseconds");
}

// Read data from server async
function readData(filePath, index, offset){
  var xhrJq = jQuery.ajax({
    url:filePath
  });

  xhrJq.done(function(data){
    processResponseAjax(data,index);
  });

  xhrJq.fail(function( jqXHR, textStatus ) {
    flagRead[index]=false;
    console.error( "Request failed: " + textStatus );
  });
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