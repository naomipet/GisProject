var osm = new ol.layer.Tile({
	title: 'OpenStreetMap',
	type: 'base',
	visible: false,
	source: new ol.source.OSM()
});
var bingAerial = new ol.layer.Tile({
	title: 'Bing Maps Aerial',
	type: 'base',
	visible: false,
	source: new ol.source.BingMaps({
		key: 'Aq2TaQALrOToTVyUtNI_7BDTNhczjngFk6P_pi_x7o33KOunmSbka4WW0auh8aLE',
		imagerySet: 'Aerial'
	})
});
var PositronGL = new ol.layer.Tile({
	title: 'Positron GL',
	type: 'base',
	visible: true,
	source: new ol.source.TileJSON({
        url: 'https://maps.tilehosting.com/styles/positron.json?key=tLrAd3Z6A37Q2bupYp6T',
        crossOrigin: 'anonymous'
    })
});


var GlobeLand30 = new ol.layer.Image({
	title: 'GlobeLand30',
	opacity: 0.4,
	source: new ol.source.ImageWMS({
		url: 'http://localhost:8082/geoserver/GisProject/wms',
		params: {'LAYERS': 'GisProject:GlobeLand30_MI'}
	})
});


var vectorSource = new ol.source.Vector({
	loader: function(extent, resolution, projection) {
		var url = 'http://localhost:8082/geoserver/GisProject/ows?service=WFS&' +
		'version=2.0.0&request=GetFeature&typeName=GisProject:Collected_Points&' +
		'outputFormat=text/javascript&srsname=EPSG:3857&'+
		'format_options=callback:loadFeatures';
		$.ajax({url: url, dataType: 'jsonp'});
	}

});


var geojsonFormat = new ol.format.GeoJSON();
function loadFeatures(response) {
	vectorSource.addFeatures(geojsonFormat.readFeatures(response));
}

      // map the income level codes to a colour value, grouping them
      var classToImageList = {
      	'Cultivated land': './Temi/CultivatedLand.png',
      	'Forest': './Temi/Forests.png', 
      	'Grassland': './Temi/Grasslands.png', 
      	'Shrubland': './Temi/ShrubLands.png',
      	'Wetland': './Temi/Wetland.png',
      	'Water body': './Temi/WaterBodies.png', 
      	'Tundra': './Temi/Tundra.png', 
      	'Artificial surface': './Temi/ArtificialSurface.png', 
      	'Bare land': './Temi/BarrenLands.png', 
      	'Permanent snow and ice': './Temi/PermanentSnowandIce.png' 
      };

// a default style is good practice!
var defaultStyle = new ol.style.Style({
	image: new ol.style.Circle({
		radius: 7,
		fill: new ol.style.Fill({color: 'black'}),
		stroke: new ol.style.Stroke({
			color: [255,0,0], width: 2
		})
	})
});
      // a javascript object literal can be used to cache
      // previously created styles. Its very important for
      // performance to cache styles.
      var styleCache = {};
      function styleFunction(feature, resolution) {
        // get the incomeLevel from the feature properties
        var classification = feature.get('class');
        // if there is no level or its one we don't recognize,
        // return the default style (in an array!)
        if (!classification || !classToImageList[classification]) {
        	return [defaultStyle];
        }
        // check the cache and create a new style for the income
        // level if its not been created before.
        if (!styleCache[classification]) {
        	styleCache[classification] = new ol.style.Style({
        		image: new ol.style.Icon(/** @type {module:ol/style/Icon~Options} */ ({
        			anchor: [0.5, 0.5],
        			size: [52, 52],
        			opacity: 1,
        			scale: 0.45,
        			src: classToImageList[classification]
        		}))
        	});
        }

        // at this point, the style for the current level is in the cache
        // so return it (as an array!)
        return [styleCache[classification]];
    }

    var clusterSource = new ol.source.Cluster({
    	distance: 0,
    	source: vectorSource
    });

    var styleCache = {};
    var clusters = new ol.layer.Vector({
    	title: 'Collected Points',
    	source: clusterSource,
    	style: function(feature) {
    		size = feature.get('features').length;
    		if(size == 1)
    		{
    			var point = feature.get('features');
    			style = styleFunction(point[0]);
    			return style;
    		}
    		var style = styleCache[size];
    		if (!style) {
    			style = new ol.style.Style({
    				image: new ol.style.Circle({
    					radius: 10,
    					stroke: new ol.style.Stroke({
    						color: '#fff'
    					}),
    					fill: new ol.style.Fill({
    						color: '#3399CC'
    					})
    				}),
    				text: new ol.style.Text({
    					text: size.toString(),
    					fill: new ol.style.Fill({
    						color: '#fff'
    					})
    				})
    			});
    			styleCache[size] = style;
    		}
    		return style;
    	}
    });

    collectedPoints = new ol.layer.Vector({
    	title:'Ecuador railways',
    	source: vectorSource
    });

    var elementPopup1 = document.getElementById('popup1');
    var elementPopup2 = document.getElementById('popup2');

    var map = new ol.Map({
    	target: document.getElementById('map'),
    	layers: [
    	new ol.layer.Group({
    		title: 'Basemaps',
    		layers: [osm, bingAerial, PositronGL]
    	}),
    	new ol.layer.Group({
    		title: 'Overlay Layers',
    		layers: [GlobeLand30, clusters]
    	})
    	],
    	view: new ol.View({
    		center: ol.proj.fromLonLat([9.16, 45.46]),
    		zoom: 11.7
    	}),
    	controls: ol.control.defaults().extend([
    		new ol.control.ScaleLine(),
    		new ol.control.FullScreen(),
    		new ol.control.OverviewMap(),
    		new ol.control.MousePosition({
    			coordinateFormat: ol.coordinate.createStringXY(4),
    			projection: 'EPSG:4326'
    		})
    		])
    });



    var layerSwitcher = new ol.control.LayerSwitcher({});
    map.addControl(layerSwitcher); 

    var popup1 = new ol.Overlay({
    	element: elementPopup1
    });
    var popup2 = new ol.Overlay({
    	element: elementPopup2
    });
    map.addOverlay(popup1);
    map.addOverlay(popup2);
    map.on('click', function(event) {
    	var pixel = event.pixel;
    	var coord = map.getCoordinateFromPixel(pixel);
    	var title;
    	var content;
    	var isContent = 0;
    	var feature = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
    		return feature;
    	});
	if (feature != null) { //popup of points
		var originalFeatures = feature.get('features');
		if(originalFeatures.length > 1){

			var extent = new ol.extent.createEmpty();
			originalFeatures.forEach(function(f, index, array){
				ol.extent.extend(extent, f.getGeometry().getExtent());
			});
			map.getView().fit(extent, {size:map.getSize(), maxZoom:14});
			return;
		}
		popup2.setPosition(undefined);
		$(elementPopup1).attr('title', "point");
		$(elementPopup1).attr('data-content','<b>class: </b>'+originalFeatures[0].get('class')+
			'</br><b>certainty: </b>'+ originalFeatures[0].get('certainty')+'</br><b>comment: </b>'+ originalFeatures[0].get('comment')+
			'<img id="myImage" style="width:100px"src="http://cdn.akc.org/content/article-body-image/funny-basset_hound_yawning.jpg">');

		popup1.setPosition(coord);
		$(elementPopup1).popover({'placement': 'top', 'html': true});
		$(elementPopup1).popover('show');
	}
	else{ //popup of wms layer
		var viewResolution = (map.getView().getResolution());
		var url = GlobeLand30.getSource().getGetFeatureInfoUrl(
			coord, viewResolution, 'EPSG:3857',
			{'INFO_FORMAT': 'text/javascript',
			'propertyName': 'PALETTE_INDEX'});
		if (url) {
			var parser = new ol.format.GeoJSON();
			$.ajax({
				url: url,
				dataType: 'jsonp',
				jsonpCallback: 'parseResponse'
			}).then(function(response) {
				var result = parser.readFeatures(response);
				if (result.length) {
					var info = [];
					for (var i = 0, ii = result.length; i < ii; ++i) {
						var temp = result[i].get('PALETTE_INDEX');
						var res;
						res = 'undefined'
						if(temp == 10)
							res = 'Cultivated land';
						if(temp == 20)
							res = 'Forest';
						if(temp == 30)
							res = 'Grassland';
						if(temp == 40)
							res = 'Shrubland';
						if(temp == 50)
							res = 'Wetland';
						if(temp == 60)
							res = 'Water body';
						if(temp == 70)
							res = 'Tundra';
						if(temp == 80)
							res = 'Artificial surface';
						if(temp == 90)
							res = 'Bare land';
						if(temp == 100)
							res = 'Permanent snow and ice';
						info.push(res);
					}
					popup1.setPosition(undefined);
					$(elementPopup2).attr('title', 'classification');
					$(elementPopup2).attr('data-content', '<h2>'+info[0]+'</h2>');
					popup2.setPosition(coord);
					$(elementPopup2).popover({'placement': 'top', 'html': true});
					$(elementPopup2).popover('show');
				}
				else {
					popup1.setPosition(undefined);
					popup2.setPosition(undefined);
				}
			}	
			)}
		}

	});

    map.on('pointermove', function(e) {
    	if (e.dragging) {
    		$(elementPopup1).popover('destroy');
    		$(elementPopup2).popover('destroy');
    		return;
    	}
    	var pixel = map.getEventPixel(e.originalEvent);
    	var hit = map.hasFeatureAtPixel(pixel);
    	map.getTarget().style.cursor = hit ? 'pointer' : '';
    });

    map.getView().on('change:resolution', function(evt){
    	var view = evt.target;

    	var source = clusters.getSource();
    	if (source instanceof ol.source.Cluster) {
    		var distance = source.getDistance();
    		if (view.getZoom() >= 11.7 && distance > 0) {
    			source.setDistance(0);
    		}
    		else if (view.getZoom() < 11.7 && distance == 0) {
    			source.setDistance(20);
    		}
    	}
    }, map);
