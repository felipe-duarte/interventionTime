          var map;

          var tiLatLng = {lat: 46.163056, lng: 8.881944};
          var beLatLng = {lat: 46.910556, lng: 7.506111};
          var bsLatLng = {lat: 47.605556, lng: 8.521944};
          var lsLatLng = {lat: 46.547222, lng: 6.618056};
          var grLatLng = {lat: 46.912778, lng: 9.551111};
          var sgLatLng = {lat: 47.409722, lng: 9.295556};
          var urLatLng = {lat: 46.834167, lng: 8.638889};
          var enLatLng = {lat: 46.530556, lng: 9.878333};
          var boLatLng = {lat: 46.670000, lng: 7.876111};
          var moLatLng = {lat: 47.078056, lng: 9.066111};
          var zwLatLng = {lat: 46.555278, lng: 7.379722};
          var zhLatLng = {lat: 47.396111, lng: 8.637500};
          var geLatLng = {lat: 46.233611, lng: 6.096944};


          var title=['TI','BE','BS','LS','GR','SG','UR','EN','BO','MO','ZH','ZW','GE'];

          var locations=[tiLatLng,beLatLng,bsLatLng,lsLatLng,grLatLng,sgLatLng,urLatLng,enLatLng,boLatLng,moLatLng,zhLatLng,zwLatLng,geLatLng];

          var markers=[];

          var heatmaps=[];


          function initMap() {
            map = new google.maps.Map(document.getElementById('map'), {
              zoom: 8,
              center: {lat: 46.76, lng: 7.42},
              mapTypeId: 'terrain'
            });

            for(var i=0;i<13;i++){        	
    	        heatmaps[i] = new google.maps.visualization.HeatmapLayer({
       	    	  data: getPoints(locations[i]),
        	      map: map
            	});
            }

            loadMarker();
          }


          // Build base markers
          function loadMarker(){
          	for(var i=0; i<13; i++){
    			   marker = new google.maps.Marker({
              position: locations[i],
          		map: map,
          		title: title[i],
          		label: title[i]
          	 });
          		markers[i]=marker;
          	}
          }

          //Toogle base markers and respective heatmap
          function toogleBase(title){
           for (var i = 0; i < markers.length; i++) {
            	var marker = markers[i];
            	var heatmap = heatmaps[i];
           		if(marker.getTitle()==title){
            		if (!marker.getVisible()) {
                		marker.setVisible(true);
                		heatmap.setMap(map);
    	        	} else {
            	    	marker.setVisible(false);
            	    	heatmap.setMap(null);
        	    	}
        		}
        	}
          }

          // Heatmap data: 500 Points
          function getPoints(position) {
            var lotsOfMarkers = [];
              for( var i = 1; i <= 500; i++) {
      			   var random = new google.maps.LatLng(randomGeo(position,8000));
        		   lotsOfMarkers.push(random);
        	    }
    	     return lotsOfMarkers;
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