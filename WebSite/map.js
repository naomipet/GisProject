/**************************layers**************************/
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
/***wms layer***/
var GlobeLand30 = new ol.layer.Image({
	title: 'GlobeLand30',
	opacity: 0.4,
	source: new ol.source.ImageWMS({
		url: 'http://localhost:8082/geoserver/GisProject/wms',
		params: {'LAYERS': 'GisProject:GlobeLand30_MI'}
	})
});

var Group1Border = new ol.layer.Image({
    title: 'Group1 Border',
    source: new ol.source.ImageWMS({
        url: 'http://localhost:8082/geoserver/GisProject/wms',
        params: {'LAYERS': 'GisProject:Borders_Group1'}
    })
});

/***wfs layer (points)***/
var vectorSource = new ol.source.Vector({
	loader: function(extent, resolution, projection) {
		var url = 'http://localhost:8082/geoserver/GisProject/ows?service=WFS&' +
		'version=2.0.0&request=GetFeature&typeName=GisProject:collected_point&' +
		'outputFormat=text/javascript&srsname=EPSG:3857&'+
		'format_options=callback:loadFeatures';
		$.ajax({url: url, dataType: 'jsonp'});
	}

});

/**************************collected points load**************************/
var geojsonFormat = new ol.format.GeoJSON();
function loadFeatures(response) {
	vectorSource.addFeatures(geojsonFormat.readFeatures(response));
}
//use cluster to grout at zoom out
var clusterSource = new ol.source.Cluster({
        distance: 15, //the distance btw clusters
        source: vectorSource
    });

var CollectedPoints = new ol.layer.Vector({
    title: 'Collected Points',
    source: clusterSource,
    style: function(feature) { //icon of feature/cluster
        var originalFeatures = feature.get('features');
        size = originalFeatures.length;
        if(size == 1) //single feature, show class image
        {
            style = pointStyleFunction(originalFeatures[0]);
            return style;
        }
        //else, cluster. check which class accurs most frequently in cluster, to choose which
        //color to use
        var typeOcurrance = Array(0,0,0,0,0,0,0,0,0,0);
        for (var i = 0, ii = size; i < ii; ++i){
            var pointClass = originalFeatures[i].get('class');
            var classInt = classToIntList[pointClass]-1;
            typeOcurrance[classInt]++;
        }
        var maxCount = Math.max(...typeOcurrance);
        var type = typeOcurrance.indexOf(maxCount)+1;
        var color = classIntToColor[type];
        //set cluster style
        style = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 10,
                stroke: new ol.style.Stroke({
                    color: '#fff'
                }),
                fill: new ol.style.Fill({
                    color: color
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
        return style;
    }
});

// cache previously created styles, to improve performance
var styleCache = {};
function pointStyleFunction(feature, resolution) {
    // get the class from the feature properties
    var classification = feature.get('class');
    // check the cache and create a new style 
    // if its not been created before.
    if (!styleCache[classification]) {
     styleCache[classification] = new ol.style.Style({
        image: new ol.style.Icon(({
       anchor: [0.5, 0.5],
       size: [35, 35],
       opacity: 1,
       scale: 0.45,
       src: classToImageList[classification]
   }))
  });
 }
    // at this point, the style for the current level is in the cache
    // so return it
    return [styleCache[classification]];
}

// map class to image
var classToImageList = {
   'Cultivated land': './Temi1/CultivatedLand.png',
   'Forest': './Temi1/Forests.png', 
   'Grassland': './Temi1/Grasslands.png', 
   'Shrubland': './Temi1/ShrubLands.png',
   'Wetland': './Temi1/Wetland.png',
   'Water body': './Temi1/WaterBodies.png', 
   'Tundra': './Temi1/Tundra.png', 
   'Artificial surface': './Temi1/ArtificialSurface.png', 
   'Bare land': './Temi1/BarrenLands.png', 
   'Permanent snow and ice': './Temi1/PermanentSnowandIce.png' 
};

//the following to list convert class to int, and int to color. 
//original GL30 order is not used to avoid uncommon cluster color in case all features apreat once
//ex: cluster with Artificial surface and Water body, show Artificial surface
var classToIntList = {
    'Cultivated land': 2,
    'Forest': 4, 
    'Grassland': 3, 
    'Shrubland': 8,
    'Wetland': 5,
    'Water body': 6, 
    'Tundra': 7, 
    'Artificial surface': 1, 
    'Bare land': 9, 
    'Permanent snow and ice': 10 
};

var classIntToColor = {
    2: '#f9f3c1',
    4: '#147749', 
    3: '#a9d05f', 
    8: '#3eb370',
    5: '#7ecef4',
    6: '#00449a', 
    7: '#646432', 
    1: '#932f14', 
    9: '#cacaca', 
    10: '#d3edfb' 
};

/**************************map**************************/
var map = new ol.Map({
    target: document.getElementById('map'),
    layers: [
    new ol.layer.Group({
      title: 'Basemaps',
      layers: [osm, bingAerial, PositronGL]
  }),
    new ol.layer.Group({
      title: 'Overlay Layers',
      layers: [GlobeLand30, Group1Border, CollectedPoints]
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
     }),

      ])
});
//layer switcher
var layerSwitcher = new ol.control.LayerSwitcher({});
map.addControl(layerSwitcher); 

//zoom to home extent button
var defaultExtent = map.getView().calculateExtent(map.getSize());
var defaultRes = map.getView().getResolution();
var defaultzoom = map.getView().getZoom();
zoonToExtentControl = new ol.control.ZoomToExtent({
    extent: defaultExtent
});
map.addControl(zoonToExtentControl);

/**************************popups management**************************/
var elementPopup1 = document.getElementById('popup1');
var elementPopup2 = document.getElementById('popup2');

var popup1 = new ol.Overlay({
    element: elementPopup1
});
var popup2 = new ol.Overlay({
    element: elementPopup2
});
function closePopups() {
    popup1.setPosition(undefined);
    popup2.setPosition(undefined);
}
map.addOverlay(popup1);
map.addOverlay(popup2);
var displayedImage;

map.on('click', function(event) {
    var pixel = event.pixel;
    var coord = map.getCoordinateFromPixel(pixel);
    var title;
    var content;
    var isContent = 0;
    var viewResolution = (map.getView().getResolution());
    var feature = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
      return feature;
  });
	if (feature != null) { //popup of points
		var originalFeatures = feature.get('features');
        var extent = new ol.extent.createEmpty();
        originalFeatures.forEach(function(f, index, array){
            ol.extent.extend(extent, f.getGeometry().getExtent());
        });
        if(originalFeatures.length > 1){
           map.getView().fit(extent, {size:map.getSize(), maxZoom:14});
           return;
       }
     //change position so feature is in center, to avoid popup outside of frame
     var coord1 = map.getCoordinateFromPixel(pixel);
     ol.coordinate.add(coord1, [0, -9000*viewResolution/defaultRes]); //chane a bit the coord so popup will have more space (long comments)
     map.getView().animate({ 
      center: coord1,
      duration: 500
  });
     popup2.setPosition(undefined); //close other popups
     $(elementPopup1).attr('title', "<b>Collected Point</b>");
     $(elementPopup1).attr('data-content','<b>class: </b>'+originalFeatures[0].get('class')+
       '</br><b>certainty: </b>'+ originalFeatures[0].get('certainty')+'</br><b>comment: </b><font size="2">'+ originalFeatures[0].get('comment')+'</font></br>'+
       '<img id="myImage1" src='+originalFeatures[0].get('link_n')+'>' + 
       '<img id="myImage2" src='+originalFeatures[0].get('link_e')+'>'+
       '<img id="myImage3" src='+originalFeatures[0].get('link_s')+'>'+
       '<img id="myImage4" src='+originalFeatures[0].get('link_w')+'>'+
       '<button id="popupButton">north</button>');

     popup1.setPosition(coord);
     $(elementPopup1).popover({'placement': 'bottom', 'html': true});
     $(elementPopup1).popover('show');
     //set only first image to show
     document.getElementById('myImage1').style.display = '';
     document.getElementById('myImage2').style.display = 'none';
     document.getElementById('myImage3').style.display = 'none';
     document.getElementById('myImage4').style.display = 'none';
     $('#popupButton').on('click', buttonHandlerFunc); //add function to button to switch images
     displayedImage = 1;
 }
else{ //popup of wms layer (gl30)
    var viewResolution = (map.getView().getResolution());
    var url = GlobeLand30.getSource().getGetFeatureInfoUrl(
     coord, viewResolution, 'EPSG:3857',
     {'INFO_FORMAT': 'text/javascript',
     'propertyName': 'PALETTE_INDEX'});
    if (url) { //parse responce
        var parser = new ol.format.GeoJSON();
        $.ajax({
            url: url,
            dataType: 'jsonp',
            jsonpCallback: 'parseResponse'
        }).then(function(response) {
            var result = parser.readFeatures(response);
            if (result.length) {
                var info = []; 
                var temp = result[0].get('PALETTE_INDEX');
                var res;
                //get class from color index
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
               map.getView().animate({ //center view to pressed point
                center: coord,
                duration: 500
            });
               popup1.setPosition(undefined); //close other popups
               $(elementPopup2).attr('background-color', 'black');
               $(elementPopup2).attr('title', '<b>Globe Land 30 Class</sb>');
               $(elementPopup2).attr('data-content', '<font size="4">'+info[0]+'<font size="2">');
               popup2.setPosition(coord);
               //change popup tamplate to have button
               $(elementPopup2).popover({'placement': 'top'
                , 'html': true,
                template: '<div class="popover" style="height: 80px; width: 190px;"><div class="arrow"></div><div class="popover-title"></div><div class="popover-content"><p></p></div></div>'});
               $(elementPopup2).popover('show');
           }
           else {
               closePopups();
           }
       }	
       )}
    }

});

function buttonHandlerFunc() {
    if(displayedImage == 1){
        document.getElementById('myImage1').style.display = 'none';
        document.getElementById('myImage2').style.display = '';
        document.getElementById('popupButton').innerHTML = 'east';
        displayedImage = 2;
        return;
    }
    if(displayedImage == 2){
        document.getElementById('myImage2').style.display = 'none';
        document.getElementById('myImage3').style.display = '';
        document.getElementById('popupButton').innerHTML = 'south';
        displayedImage = 3;
        return;
    }
    if(displayedImage == 3){
        document.getElementById('myImage3').style.display = 'none';
        document.getElementById('myImage4').style.display = '';
        document.getElementById('popupButton').innerHTML = 'west';
        displayedImage = 4;
        return;
    }
    if(displayedImage == 4){
        document.getElementById('myImage4').style.display = 'none';
        document.getElementById('myImage1').style.display = '';
        document.getElementById('popupButton').innerHTML = 'north';
        displayedImage = 1;
        return;
    }
} 

/**************************other interaction events**************************/

//close popups on drag event
map.on('pointermove', function(e) {
   if (e.dragging) {
      closePopups();
      return;
  }
    //pointer style on features
    var pixel = map.getEventPixel(e.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel);
    map.getTarget().style.cursor = hit ? 'pointer' : '';
});


//from some zoom, dont cluster (to avoid close points always in cluster)
map.getView().on('change:resolution', function(evt){
 closePopups();
 var view = evt.target;

 var source = CollectedPoints.getSource();
 if (source instanceof ol.source.Cluster) {
  var distance = source.getDistance();
  if (view.getZoom() >= 12.5 && distance > 0) {
     source.setDistance(0);
 }
 else if (view.getZoom() < 12.5 && distance == 0) {
     source.setDistance(15);
 }
}
}, map);

//close popups on esc key
var keydown = function(evt){
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode === 27){ //esc key
        //dispatch event
        closePopups();
    }
};
document.addEventListener('keydown', keydown, false);