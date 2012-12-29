var EARTH_RADIUS = 3958.75;
var PI = 3.1415926535897932384626433832795;
var DEG2RAD =  0.01745329252;
var RAD2DEG = 57.29577951308;

function numberRounded(number,decimals)
{
  var d = decimals*10;
  return Math.round(number*d)/d;
}

function arrayGetBy(arr,by,value,strict)
{
  if(strict=="undefined") strict = false;
  
  for(var i=0;i<arr.length;i++) {
    if(strict && arr[i][by]===value) {
      return arr[i];
    } else if(!strict && arr[i][by]==value) return arr[i];
  }
  return null;
}

function arrayIndexOf(arr,value,strict)
{
  if(strict=="undefined") strict = true;
  
  for(var i=0;i<arr.length;i++) {
    if(strict && arr[i]===value) {
      return i;
    } else if(!strict && arr[i]==value) return i;
  }
  return -1;
}

function arrayGreatest(arr,prop,def)
{
  var c = null;
  for(var i=0;i<arr.length;i++)
  {
      if(arr[i][prop]!='undefined' && arr[i][prop]!==null) {
        if(c===null || arr[i][prop]>c) c = arr[i][prop];
      } 
  }
  
  if(c===null) c = def;
  
  return c;
}
function inArray(value,arr,strict)
{
  if(strict=="undefined") strict = false;
  for(var i=0;i<arr.length;i++) {
    if(strict && value===arr[i]) return true;
    if(!strict && value==arr[i]) return true;
  }
  return false;
}

function zeroFill( number, width )
{
  width -= number.toString().length;
  if ( width > 0 )
  {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number;
}

function getURLParams(url)
{
  var params = {};
  var parts = url.split('?',2);
  var sub_parts;
  if(parts.length>1) {
    parts = parts[1].split('&');
    for(var i=0;i<parts.length;i++) {
      sub_parts = parts[i].split('=',2);
      if(sub_parts.length==2) {
        params[decodeURIComponent(sub_parts[0])] = decodeURIComponent(sub_parts[1]);
      }
    }
  }
  return params;
}

var FlightPlanner = {
    options:{
      cookie_expires: 365 // days until the cookies expires
     ,aircraft_interval: 500 // miliseconds between updates of aircraft position 
     ,zoom_display_apt_nav: 7 // zoomlevel from wich on to display apt nav data
     ,zoom_search:11 // zoomlevel to use when going to a search result
     ,base_url:''
     ,airport_default_style:{fill:false, stroke:false, graphic:true, externalGraphic:'/images/airport_default.png', graphicWidth:24, graphicHeight:24, graphicOpacity:1, cursor:'pointer'}
     ,airport_big_style:{fill:false, stroke:false, graphic:true, externalGraphic:'/images/airport_big.png', graphicWidth:24, graphicHeight:24, graphicOpacity:1, cursor:'pointer'}
     ,airport_strip_style:{fill:false, stroke:false, graphic:true, externalGraphic:'/images/airport_strip.png', graphicWidth:24, graphicHeight:24, graphicOpacity:1, cursor:'pointer'}
     ,airport_sea_style:{fill:false, stroke:false, graphic:true, externalGraphic:'/images/airport_sea.png', graphicWidth:24, graphicHeight:24, graphicOpacity:1, cursor:'pointer'}
     ,airport_heli_style:{fill:false, stroke:false, graphic:true, externalGraphic:'/images/airport_heli.png', graphicWidth:24, graphicHeight:24, graphicOpacity:1, cursor:'pointer'}
     ,navaid_default_style:{fill:false, stroke:false, graphic:true, externalGraphic:'/images/navaid_dme.png', graphicWidth:24, graphicHeight:24, graphicOpacity:1, cursor:'pointer'}
     ,navaid_ndb_style:{fill:false, stroke:false, graphic:true, externalGraphic:'/images/navaid_ndb.png', graphicWidth:24, graphicHeight:24, graphicOpacity:1, cursor:'pointer'}
     ,navaid_dme_style:{fill:false, stroke:false, graphic:true, externalGraphic:'/images/navaid_dme.png', graphicWidth:24, graphicHeight:24, graphicOpacity:1, cursor:'pointer'}
     ,navaid_vor_style:{fill:false, stroke:false, graphic:true, externalGraphic:'/images/navaid_vor.png', graphicWidth:24, graphicHeight:24, graphicOpacity:1, cursor:'pointer'}
     ,fix_default_style:{fill:false, stroke:false, graphic:true, externalGraphic:'/images/fix.png', graphicWidth:24, graphicHeight:24, graphicOpacity:1, cursor:'pointer'}
     ,gps_default_style:{fill:false, stroke:false, graphic:true, externalGraphic:'/images/gps.png', graphicWidth:24, graphicHeight:24, graphicOpacity:1, cursor:'pointer'}
     ,aircraft_default_style:{fill:false, stroke:false, graphic:true, externalGraphic:'/images/aircraft.png', graphicWidth:24, graphicHeight:24, graphicOpacity:1, graphicXOffset:-12, graphicYOffset:-12}
     ,route_style:{fill:true, fillColor:'#DDBB66', fillOpacity:0.75, pointRadius:12, stroke:true, strokeColor:'#DDAA00', strokeOpacity:0.75, strokeWidth:3, strokeLinecap:'round', strokeDashstyle:'solid'}
     ,route_colors:['#DDBB66','#ffa544','#91b756','#3161a4','#9b8ab6','#ae927a','#c74634','#ad5c15','#4f6f3e','#fdef5a','#4b6574','#3f3f3f']
     ,airway_default_style:{fill:false, stroke:true, strokeColor:'#3161a4', strokeOpacity:0.75, strokeWidth:2, strokeLinecap:'round', strokeDashstyle:'dash', graphic:true, externalGraphic:'/images/airway_low.png', graphicWidth:24, graphicHeight:24, graphicOpacity:1, graphicXOffset:-12, graphicYOffset:-12}
     ,airway_high_style:{fill:false, stroke:true, strokeColor:'#4f6f3e', strokeOpacity:0.75, strokeWidth:2, strokeLinecap:'round', strokeDashstyle:'dash', graphic:true, externalGraphic:'/images/airway_high.png', graphicWidth:24, graphicHeight:24, graphicOpacity:1, graphicXOffset:-12, graphicYOffset:-12}
     ,airway_label_style:{labelAlign:'cc', fontColor:'#000', labelOutlineWidth:3, labelOutlineColor:'#FFFFFF', fontWeight:'bold'}
    },
    aptNav:null,
    map:null,
    selectControl:null,
    onAptNavRefreshed:null,
    urlParams:{},
    
    init:function(map_id,menu_id)
    {
      var _this = this;

      this.urlParams = getURLParams(window.location.href);
      
      this.map = new OpenLayers.Map(map_id,{
        projection:new OpenLayers.Projection("EPSG:900913"),
        controls:[
          new OpenLayers.Control.Navigation({
            defaultDblClick:function(e){
              _this.onDoubleClick(e);
              OpenLayers.Event.stop(e);
              return false;
            }
          }),
          new OpenLayers.Control.PanZoom(),
          new OpenLayers.Control.ArgParser(),
          new OpenLayers.Control.Attribution()
        ]
      });

      this.mapProjection = new OpenLayers.Projection("EPSG:4326");

      // add base layers
      this.map.addLayer(new OpenLayers.Layer.OSM(
          "OpenStreetMap Mapnik"
      ));

      this.map.addLayer(new OpenLayers.Layer.Google(
        'Google Streets',
        {'type':google.maps.MapTypeId.ROADMAP, numZoomLevels: 20}
      ));

      this.map.addLayer(new OpenLayers.Layer.Google(
        'Google Terrain',
        {'type':google.maps.MapTypeId.TERRAIN, numZoomLevels: 20}
      ));

      this.map.addLayer(new OpenLayers.Layer.Google(
        'Google Satellite',
        {'type':google.maps.MapTypeId.SATELLITE, numZoomLevels: 20}
      ));

      this.map.addLayer(new OpenLayers.Layer.Google(
        'Google Hybrid',
        {'type':google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
      ));

      // add routes and nav dat layers
      this.routesLayer = new OpenLayers.Layer.Vector('My routes');
      this.airportsLayer = new OpenLayers.Layer.Vector('Airports');
      this.navaidsLayer = new OpenLayers.Layer.Vector('Navaids');
      this.fixesLayer = new OpenLayers.Layer.Vector('Fixes');
      this.airwaysLowLayer = new OpenLayers.Layer.Vector('Airways low');
      this.airwaysHighLayer = new OpenLayers.Layer.Vector('Airways high');
      this.aircraftLayer = new OpenLayers.Layer.Vector('My aircraft');
      
      this.map.addLayer(this.aircraftLayer);
      this.map.addLayer(this.routesLayer);
      this.map.addLayer(this.airwaysLowLayer);
      this.map.addLayer(this.airwaysHighLayer);
      this.map.addLayer(this.fixesLayer);
      this.map.addLayer(this.navaidsLayer);
      this.map.addLayer(this.airportsLayer);

      // add select control
      this.selectControl = new OpenLayers.Control.SelectFeature([this.airportsLayer,this.navaidsLayer,this.fixesLayer]);
      this.map.addControl(this.selectControl);
      this.selectControl.activate();

      // add layer switcher
      this.map.addControl(new OpenLayers.Control.LayerSwitcher());

      // restore visible layers
      this.loadLayers();       

        // register events
      this.map.events.register('zoomend',this,this.onMapZoom);
      this.map.events.register('moveend',this,this.onMapMove);
      this.map.events.register('changebaselayer',this,this.onBaseLayerChange);
      this.map.events.register('changelayer',this,this.onLayerChange);

      this.airportsLayer.events.on({
        'featureselected': FlightPlanner.onFeatureSelect,
        'featureunselected': FlightPlanner.onFeatureUnselect
      });
      this.navaidsLayer.events.on({
        'featureselected': FlightPlanner.onFeatureSelect,
        'featureunselected': FlightPlanner.onFeatureUnselect
      });
      this.fixesLayer.events.on({
        'featureselected': FlightPlanner.onFeatureSelect,
        'featureunselected': FlightPlanner.onFeatureUnselect
      });
      /*this.airwaysLowLayer.events.on({
        'featureselected': FlightPlanner.onFeatureSelect,
        'featureunselected': FlightPlanner.onFeatureUnselect
      });
      this.airwaysHighLayer.events.on({
        'featureselected': FlightPlanner.onFeatureSelect,
        'featureunselected': FlightPlanner.onFeatureUnselect
      });*/

      // restore last base layer
      this.loadBaseLayer();

      // restore last map position
      this.loadPosition();

      // init Routes
      this.Routes.init();
      
      // init realtime aircraft
      this.Aircraft.init();
    },
    gotoLatLon:function(lat,lon,zoom)
    {
      if(zoom=="undefined") zoom = this.map.zoom;
      
      // Google.v3 uses EPSG:900913 as projection, so we have to
      // transform our coordinates
      this.map.setCenter(new OpenLayers.LonLat(lon, lat).transform(
            this.mapProjection,
            this.map.getProjectionObject()
        ), zoom);
    },
    gotoFeature:function(lat,lon,layer,apt_nav_id,zoom)
    {
      var _this = this;
      var feature;
      
      if(zoom=="undefined") zoom = this.map.getZoom();
      
      this.onAptNavRefreshed = function(){
        feature = _this.getFeatureByAptNavId(layer,apt_nav_id);
        if(feature !== null) {
          _this.onFeatureSelect({feature:feature});
        }
        _this.onAptNavRefreshed = null;
      };
      this.gotoLatLon(lat,lon,zoom);
    },
    onMapZoom:function()
    {
      var zoom = this.map.getZoom();
      
      if(zoom>=this.options.zoom_display_apt_nav) {
        this.refreshAptNav();
      } else {
        this.clearAptNav(true);
      }
      this.savePosition();
    },
    onMapMove:function()
    {
      var zoom = this.map.getZoom();
      
      if(zoom>=this.options.zoom_display_apt_nav) {
        this.refreshAptNav();
        
        // Dirty fix: OL translates svg layers after dragging the map for some reason, so we remove the translation
        /*this.airportsLayer.renderer.root.setAttributeNS(null, "transform", "");
        this.navaidsLayer.renderer.root.setAttributeNS(null, "transform", "");
        this.fixesLayer.renderer.root.setAttributeNS(null, "transform", "");*/
      } else {
        this.clearAptNav(true);
      }
      this.savePosition();
    },
    onBaseLayerChange:function()
    {
      var index = arrayIndexOf(this.map.layers,this.map.baseLayer);
      // store base layer in cookie
      $.cookie('x-plane_flight_planner_base_layer',index,{expires:this.options.cookie_expires});
    },
    onLayerChange:function()
    {
      var visible = [];
      for(var i=0;i<this.map.layers.length;i++) {
        if(!this.map.layers[i].isBaseLayer && this.map.layers[i].visibility) visible.push(i);
      }
      // store visible layers in cookie
      $.cookie('x-plane_flight_planner_visible_layers',JSON.stringify(visible),{expires:this.options.cookie_expires});
    },
    onDoubleClick:function(e)
    {
      var lon_lat = this.map.getLonLatFromViewPortPx( e.xy );
      lon_lat.transform(this.map.getProjectionObject(),this.mapProjection);
      this.Routes.addWaypoint('gps',null,lon_lat.lat,lon_lat.lon);
    },
    savePosition:function()
    {
      var center = this.map.getCenter();
      $.cookie('x-plane_flight_planner_lat',center.lat,{expires:this.options.cookie_expires});
      $.cookie('x-plane_flight_planner_lon',center.lon,{expires:this.options.cookie_expires});
      $.cookie('x-plane_flight_planner_zoom',this.map.getZoom(),{expires:this.options.cookie_expires});
    },
    loadPosition:function()
    {
      var lat = parseFloat($.cookie('x-plane_flight_planner_lat'));
      var lon = parseFloat($.cookie('x-plane_flight_planner_lon'));
      var zoom = parseInt($.cookie('x-plane_flight_planner_zoom'));
      
      if(lat===null) lat = 0;
      if(lon===null) lon = 0;
      if(zoom===null) zoom = 2;
      
      this.map.setCenter(new OpenLayers.LonLat(lon,lat),zoom,false,false);
    },
    loadBaseLayer:function()
    {
      var index = $.cookie('x-plane_flight_planner_base_layer');
      if(index!==null) {
        index = parseInt(index);
        this.map.setBaseLayer(this.map.layers[index]);
      } else this.map.setBaseLayer(this.map.layers[0]);
    },
    loadLayers:function()
    {
      var visible = $.cookie('x-plane_flight_planner_visible_layers');
      if(visible!==null) {
        visible = eval(visible);
        for(var i=0;i<this.map.layers.length;i++) {
          if(!this.map.layers[i].isBaseLayer && !inArray(i,visible)) {
            this.map.layers[i].setVisibility(false);
          }
        }
      }
    },
    refreshAptNav:function()
    {
      var _this = this;
      var bounds = this.map.getExtent();
      bounds.transform(this.map.getProjectionObject(),this.mapProjection);
      bounds = bounds.toBBOX();
      
      jQuery.getJSON(this.options.base_url+'apt-nav-json',{bounds:bounds},
      function(data,textStatus){
        _this.onAptNavResponse(data);
      });
    },
    canDestroyFeature:function(feature)
    {
      var id = null;
      var i = null;
      
      // airport
      if(feature.attributes['airport']) {
        id = feature.attributes.airport.icao;
        
        for(i = 0;i<this.aptNav.airports.length;i++) {
          if(id==this.aptNav.airports[i].icao) return false;
        }
      }
      
      // navaids
      if(feature.attributes['navaid']) {
        id = feature.attributes.navaid.id;
        
        for(i = 0;i<this.aptNav.navaids.length;i++) {
          if(id==this.aptNav.navaids[i].id) return false;
        }
      }
      
      // fixes
      if(feature.attributes['fix']) {
        id = feature.attributes.fix.id;
        
        for(i = 0;i<this.aptNav.fixes.length;i++) {
          if(id==this.aptNav.fixes[i].id) return false;
        }
      }
      
      // airways
      if(feature.attributes['airway']) {
        id = feature.attributes.airway.id;
        
        for(i = 0;i<this.aptNav.airways.length;i++) {
          if(id==this.aptNav.airways[i].id) return false;
        }
      }
      
      return true;
    },
    clearAptNav:function(force)
    {
      if(force=='undefined') force = false;
      
      if(!force) {
        // airports
        var destroy = [];
        for(var i=0;i<this.airportsLayer.features.length;i++) {
          if(this.canDestroyFeature(this.airportsLayer.features[i])) {
            FlightPlanner.selectControl.unselect(this.airportsLayer.features[i]);
            destroy.push(this.airportsLayer.features[i]);
          }
        }
        this.airportsLayer.destroyFeatures(destroy);
        
        // navaids
        destroy = [];
        for(var i=0;i<this.navaidsLayer.features.length;i++) {
          if(this.canDestroyFeature(this.navaidsLayer.features[i])) {
            FlightPlanner.selectControl.unselect(this.navaidsLayer.features[i]);
            destroy.push(this.navaidsLayer.features[i]);
          }
        }
        this.navaidsLayer.destroyFeatures(destroy);
        
        // fixes
        destroy = [];
        for(var i=0;i<this.fixesLayer.features.length;i++) {
          if(this.canDestroyFeature(this.fixesLayer.features[i])) {
            FlightPlanner.selectControl.unselect(this.fixesLayer.features[i]);
            destroy.push(this.fixesLayer.features[i]);
          }
        }
        this.fixesLayer.destroyFeatures(destroy);
        
        // airways low
        destroy = [];
        for(var i=0;i<this.airwaysLowLayer.features.length;i++) {
          if(this.canDestroyFeature(this.airwaysLowLayer.features[i])) {
            //FlightPlanner.selectControl.unselect(this.airwaysLowLayer.features[i]);
            destroy.push(this.airwaysLowLayer.features[i]);
          }
        }
        this.airwaysLowLayer.destroyFeatures(destroy);
        
        // airways high
        destroy = [];
        for(var i=0;i<this.airwaysHighLayer.features.length;i++) {
          if(this.canDestroyFeature(this.airwaysHighLayer.features[i])) {
            //FlightPlanner.selectControl.unselect(this.airwaysHighLayer.features[i]);
            destroy.push(this.airwaysHighLayer.features[i]);
          }
        }
        this.airwaysHighLayer.destroyFeatures(destroy);
        
      } else {
        this.airportsLayer.destroyFeatures();
        this.navaidsLayer.destroyFeatures();
        this.fixesLayer.destroyFeatures();
        this.airwaysLowLayer.destroyFeatures();
        this.airwaysHighLayer.destroyFeatures();
      }
    },
    onAptNavResponse:function(data)
    {      
      this.aptNav = data;
      this.clearAptNav();
      
      this.Airports.onAptNavResponse();      
      this.Navaids.onAptNavResponse();
      this.Fixes.onAptNavResponse();
      this.Airways.onAptNavResponse();
      
      if(this.onAptNavRefreshed && typeof this.onAptNavRefreshed == 'function') this.onAptNavRefreshed();
    },
    copyStyle:function(style)
    {
      var copy = {};
      for(var prop in style) {
        copy[prop] = style[prop];
      }
      return copy;
    },
    onPopupClose:function(e)
    {
      FlightPlanner.selectControl.unselect(this.feature);
    },
    onFeatureSelect:function(e)
    {
      while(FlightPlanner.map.popups.length) {
        FlightPlanner.map.removePopup(FlightPlanner.map.popups[0]);
      }
      
      var feature = e.feature;
      var popup = new OpenLayers.Popup.FramedCloud(
        'featurePopup',
        feature.geometry.getBounds().getCenterLonLat(),
        new OpenLayers.Size(300,100),
        '<h2>'+feature.attributes.title+'</h2>' +
        feature.attributes.description,
        null, true, FlightPlanner.onPopupClose
      );
      feature.popup = popup;
      popup.feature = feature;
      FlightPlanner.map.addPopup(popup);
    },
    onFeatureUnselect:function(e)
    {
      var feature = e.feature;
      if(feature.popup) {
        feature.popup.feature = null;
        while(FlightPlanner.map.popups.length) {
          FlightPlanner.map.removePopup(FlightPlanner.map.popups[0]);
        }
        feature.popup.destroy();
        feature.popup = null;
      }
    },
    getFeatureByAptNavId:function(layer,id)
    {
      var feature;
      var apt_nav_id;
      if(layer) {
        for(var i = 0;i<layer.features.length;i++) {
          feature = layer.features[i];
          switch(layer) {
            case this.airportsLayer:
              apt_nav_id = feature.attributes.airport.icao;
              break;
            case this.navaidsLayer:
              apt_nav_id = feature.attributes.navaid.id;
              break;
            case this.fixesLayer:
              apt_nav_id = feature.attributes.fix.id;
              break;
            default:
              apt_nav_id = null;
          }
          
          if(apt_nav_id!==null && apt_nav_id==id) return feature;
        }
      }
      return null;
    }
};

FlightPlanner.Aircraft = {
  interval_id:null,
  feature:null,
  url:'http://localhost:3001',
  init:function()
  {
    if(FlightPlanner.urlParams['py'] && FlightPlanner.urlParams['py']!='') this.url = FlightPlanner.urlParams['py'];
    
    this.feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(0,0),
      null,
      FlightPlanner.options.aircraft_default_style
    );
    FlightPlanner.aircraftLayer.addFeatures(this.feature);
    
    this.interval_id = window.setInterval('FlightPlanner.Aircraft.onInterval()',FlightPlanner.options.aircraft_interval);
  },
  onInterval:function()
  {
    var _this = this;
    jQuery.ajax(this.url,{
      cache:false,
      crossDomain:true,
      dataType:'jsonp',
      jsonpCallback:'FlightPlanner.Aircraft.jsonpCallback'
    });
  },
  jsonpCallback:function(data){
    this.feature.geometry.x = data.lon;
    this.feature.geometry.y = data.lat;
    this.feature.geometry.transform(FlightPlanner.mapProjection,FlightPlanner.map.getProjectionObject());
    this.feature.style.rotation = data.heading;
    FlightPlanner.aircraftLayer.redraw();
  }
}

FlightPlanner.Airports = {
  canCreateFeature:function(airport)
  {
    for(var i = 0;i<FlightPlanner.airportsLayer.features.length;i++) {
      if(airport.icao==FlightPlanner.airportsLayer.features[i].attributes.airport.icao) return false;
    }
    return true;
  },
  onAptNavResponse:function()
  {
    // add airports
    var features = [];
    var feature = null;
    var geometry = null;
    var airport = null;
    var style = null;
    
    /*for(var i=0;i<FlightPlanner.airportsLayer.features.length;i++) {
      feature = FlightPlanner.airportsLayer.features[i];
      if(feature.attributes.airport.icao=='EDDP') console.log(feature);
    }*/
    
    for(var i=0;i<FlightPlanner.aptNav.airports.length;i++) {
      airport = FlightPlanner.aptNav.airports[i];
      
      if(this.canCreateFeature(airport)) {
        style = this.getStyle(airport);

        // make copy of style and add individual properties to it
        style = FlightPlanner.copyStyle(style);
        style.graphicTitle = airport.icao+' - '+airport.name

        // add geometry
        geometry = new OpenLayers.Geometry.Point(airport.lon,airport.lat);
        geometry.transform(FlightPlanner.mapProjection,FlightPlanner.map.getProjectionObject());

        // create the feature
        feature = new OpenLayers.Feature.Vector(
          geometry,
          {airport:airport,title:'<img src="'+style.externalGraphic+'" width="24" height="24">'+airport.icao+' - '+airport.name,description:this.getDescription(airport)},
          style
        );
        features.push(feature);
      }
    }

    FlightPlanner.airportsLayer.addFeatures(features);
  },  
  getDescription:function(airport)
  {
    var runway = null;
    var communication = null;
    var out =  '<p>';
    out+='<a href="javascript:void(0);" onclick="FlightPlanner.Routes.addWaypoint(\'airport\',\''+airport.icao+'\','+airport.lat+','+airport.lon+');">add as waypoint</a><br/>';
    
    if(FSEconomy) {
      out+='<a href="javascript:void(0);" onclick="FSEconomy.listJobsDialog(\''+airport.icao+'\');">list FSEconomy assignments</a><br/>';
    }
    
    out+='lat: '+airport.lat.toFixed(4)+', lon: '+airport.lon.toFixed(4)+'<br/>';
    out+='elevation: '+airport.elevation+' ft<br/>';
    
    for(var i =0;i<airport.runways.length;i++) {
      runway = airport.runways[i];
      out+='Runway '+runway.number_start+' - '+runway.number_end+': width '+runway.width+'m';

      // surface type for land runways
      if(airport.type==100) {
        out+=', ';

        switch(runway.surface_type) {
          case 1:out+='Asphalt';break;
          case 2:out+='Concrete';break;
          case 3:out+='Turf or grass';break;
          case 4:out+='Dirt';break;
          case 5:out+='Gravel';break;
          case 6:out+='Dry lakebed';break;
          case 7:out+='Water';break;
          case 8:out+='Snow/Ice';break
          case 9:out+='';break;
        }
      }
      out+='<br>';
    }

    // communications
    if(airport.communications.length) {
      out+='<br/><strong>Coms:</strong><br/>';

      for(i = 0;i<airport.communications.length;i++) {
        communication = airport.communications[i];
        out+=communication.name+': '+(communication.frequency/100).toFixed(2)+' MHz <br/>';
      }
    }

    out+='</p>';
    return out;
  },
  getStyle:function(airport)
  {
    var style = FlightPlanner.options.airport_default_style;
    // simple air strip
    if(airport.type==1 && airport.runways.length==1 && airport.runways[0].type>2) style = FlightPlanner.options.airport_strip_style;

    // big airport with more than 2 runways TODO: airport size should be defined by runway lengths
    if(airport.runways.length>2) style = FlightPlanner.options.airport_big_style;

    // seaport
    if(airport.type==16) style = FlightPlanner.options.airport_sea_style;

    // heliport
    if(airport.type==17) style = FlightPlanner.options.airport_heli_style;

    return style;
  },
  search:function(s,container) {
    if(s.length>0) {
      var _this = this;
      container.addClass('loading');
      jQuery.getJSON(FlightPlanner.options.base_url+'airports-search-json/'+s,
      function(data,textStatus){
        _this.onSearchResponse(data.airports,container);
      });
    }
  },
  onSearchResponse:function(airports,container)
  {
    container.removeClass('loading');
    container.empty();
    var out = '';
    for(var i=0;i<airports.length;i++) {
      out+='<li><a href="javascript:void(0);" onclick="FlightPlanner.Airports.gotoAirport(\''+airports[i].icao+'\','+airports[i].lat+','+airports[i].lon+');">'+airports[i].icao+' - '+airports[i].name+'</a></li>';
    }
    container.append(out);
  },
  gotoAirport:function(icao,lat,lon)
  {
    FlightPlanner.gotoFeature(lat,lon,FlightPlanner.airportsLayer,icao,FlightPlanner.options.zoom_search);
  }
};

FlightPlanner.Navaids = {
  canCreateFeature:function(navaid)
  {
    for(var i = 0;i<FlightPlanner.navaidsLayer.features.length;i++) {
      // exclude marker beacons
      if(navaid.type>=7 && navaid.type<=9) {
        return false;
      } else if(navaid.id==FlightPlanner.navaidsLayer.features[i].attributes.navaid.id) return false;
    }
    return true;
  },
  onAptNavResponse:function()
  {
    // add navaids
    var features = [];
    var feature = null;
    var geometry = null;
    var navaid = null;
    var style = null;

    for(var i=0;i<FlightPlanner.aptNav.navaids.length;i++) {        
      navaid = FlightPlanner.aptNav.navaids[i];
      
      if(this.canCreateFeature(navaid)) {
        style = this.getStyle(navaid);

        // make copy of style and add individual properties to it
        style = FlightPlanner.copyStyle(style);
        style.graphicTitle = navaid.identifier+' - '+navaid.name

        // add geometry
        geometry = new OpenLayers.Geometry.Point(navaid.lon,navaid.lat);
        geometry.transform(FlightPlanner.mapProjection,FlightPlanner.map.getProjectionObject());

        // create the feature
        feature = new OpenLayers.Feature.Vector(
          geometry,
          {navaid:navaid,title:'<img src="'+style.externalGraphic+'" width="24" height="24">'+navaid.identifier+' - '+navaid.name,description:this.getDescription(navaid)},
          style
        );
        features.push(feature);
      }
    }

    FlightPlanner.navaidsLayer.addFeatures(features);
  },  
  getDescription:function(navaid)
  {
    var out =  '<p>';
    out+='<a href="javascript:void(0);" onclick="FlightPlanner.Routes.addWaypoint(\'navaid\','+navaid.id+','+navaid.lat+','+navaid.lon+');">add as waypoint</a><br/>';

    out+='lat: '+navaid.lat.toFixed(4)+', lon: '+navaid.lon.toFixed(4)+'<br/>';
    out+='elevation: '+navaid.elevation+' ft<br/>';
    
    // navaid type
    switch(navaid.type) {
      case 2:out+='NDB';break;
      case 3:out+='VOR';break;
      case 4:out+='LOC';break;
      case 5:out+='LOC';break;
      case 6:out+='Glideslope';break;
      case 7:out+='OM';break;
      case 8:out+='MM';break;
      case 9:out+='IM';break
      case 12:out+='DME';break;
      case 13:out+='DME';break;
    }
    
    out+='<br>';
    
    out+=(navaid.frequency/100).toFixed(2)+' MHz <br/>';
    out+='range: '+navaid.range+' nm<br/>';
    if(navaid.bias) out+='bias: '+navaid.bias+' nm<br/>';
    if(navaid.variation) out+='slaved variation: '+navaid.variation+' <br/>';
    if(navaid.bearing) out+='true bearing: '+navaid.bearing.toFixed(3)+'° <br/>';
    if(navaid.icao) out+='airport: '+navaid.icao+'<br/>';
    if(navaid.runway_number) out+='runway: '+navaid.runway_number+'<br/>';
    
    out+='</p>';
    return out;
  },
  getStyle:function(navaid)
  {
    var style = FlightPlanner.options.navaid_default_style;
    
    // NDB
    if(navaid.type==2) style = FlightPlanner.options.navaid_ndb_style;

    // VOR
    if(navaid.type==3) style = FlightPlanner.options.navaid_vor_style;
    
    // DME
    if(navaid.type==12 || navaid.type==13) style = FlightPlanner.options.navaid_dme_style;
   
    return style;
  }
};

FlightPlanner.Fixes = {
  canCreateFeature:function(fix)
  {
    for(var i = 0;i<FlightPlanner.fixesLayer.features.length;i++) {
      if(fix.id==FlightPlanner.fixesLayer.features[i].attributes.fix.id) return false;
    }
    return true;
  },
  onAptNavResponse:function()
  {
    // add fixes
    var features = [];
    var feature = null;
    var geometry = null;
    var fix = null;
    var style = null;

    for(var i=0;i<FlightPlanner.aptNav.fixes.length;i++) {        
      fix = FlightPlanner.aptNav.fixes[i];
      
      if(this.canCreateFeature(fix)) {
        style = this.getStyle(fix);

        // make copy of style and add individual properties to it
        style = FlightPlanner.copyStyle(style);
        style.graphicTitle = fix.name

        // add geometry
        geometry = new OpenLayers.Geometry.Point(fix.lon,fix.lat);
        geometry.transform(FlightPlanner.mapProjection,FlightPlanner.map.getProjectionObject());

        // create the feature
        feature = new OpenLayers.Feature.Vector(
          geometry,
          {fix:fix,title:'<img src="'+style.externalGraphic+'" width="24" height="24">'+fix.name,description:this.getDescription(fix)},
          style
        );
        features.push(feature);
      }
    }

    FlightPlanner.fixesLayer.addFeatures(features);
  },  
  getDescription:function(fix)
  {
    var out =  '<p>';
    out+='<a href="javascript:void(0);" onclick="FlightPlanner.Routes.addWaypoint(\'fix\','+fix.id+','+fix.lat+','+fix.lon+');">add as waypoint</a><br/>';

    out+='lat: '+fix.lat.toFixed(4)+', lon: '+fix.lon.toFixed(4);
    
    out+='</p>';
    return out;
  },
  getStyle:function(fix)
  {
    var style = FlightPlanner.options.fix_default_style;   
    return style;
  }
};

FlightPlanner.Airways = {
  canCreateFeature:function(airway)
  {
    for(var i = 0;i<FlightPlanner.airwaysLowLayer.features.length;i++) {
      if(airway.id==FlightPlanner.airwaysLowLayer.features[i].attributes.airway.id) return false;
    }
    for(var i = 0;i<FlightPlanner.airwaysHighLayer.features.length;i++) {
      if(airway.id==FlightPlanner.airwaysHighLayer.features[i].attributes.airway.id) return false;
    }
    return true;
  },
  onAptNavResponse:function()
  {
    // add airways
    var features_low = [];
    var features_high = [];
    var feature = null;
    var from_geometry = null;
    var to_geometry = null;
    var center_geometry = null;
    var airway = null;
    var style = null;

    for(var i=0;i<FlightPlanner.aptNav.airways.length;i++) {        
      airway = FlightPlanner.aptNav.airways[i];
      
      if(this.canCreateFeature(airway)) {
        style = this.getStyle(airway);

        // make copy of style and add individual properties to it
        style = FlightPlanner.copyStyle(style);
        style.graphicTitle = airway.name;
        
        // create the from point feature
        from_geometry = new OpenLayers.Geometry.Point(airway.from_lon,airway.from_lat);
        from_geometry.transform(FlightPlanner.mapProjection,FlightPlanner.map.getProjectionObject());
        
        feature = new OpenLayers.Feature.Vector(
          from_geometry,
          {airway:airway,title:airway.name,description:this.getDescription(airway)},
          style
        );
        switch(airway.type) {
          case 1: features_low.push(feature); break;
          case 2: features_high.push(feature); break;
          default: features_low.push(feature);
        }
        
        // create the to point feature
        to_geometry = new OpenLayers.Geometry.Point(airway.to_lon,airway.to_lat);
        to_geometry.transform(FlightPlanner.mapProjection,FlightPlanner.map.getProjectionObject());
        
        feature = new OpenLayers.Feature.Vector(
          to_geometry,
          {airway:airway,title:airway.name,description:this.getDescription(airway)},
          style
        );
        switch(airway.type) {
          case 1: features_low.push(feature); break;
          case 2: features_high.push(feature); break;
          default: features_low.push(feature);
        }
        
        // create the line feature
        style = this.getStyle(airway);
        style = FlightPlanner.copyStyle(style);
        
        feature = new OpenLayers.Feature.Vector(
          new OpenLayers.Geometry.LineString([from_geometry,to_geometry]),
          {airway:airway,title:airway.name,description:this.getDescription(airway)},
          style
        );        
        switch(airway.type) {
          case 1: features_low.push(feature); break;
          case 2: features_high.push(feature); break;
          default: features_low.push(feature);
        }
        
        // create the airway label feature
        center_geometry = new OpenLayers.Geometry.Point((airway.from_lon+airway.to_lon)/2,(airway.from_lat+airway.to_lat)/2);
        center_geometry.transform(FlightPlanner.mapProjection,FlightPlanner.map.getProjectionObject());
        
        // OpenLayers 2.12 will have an label outline style, until then add the same label with some offset below
        if(OpenLayers.VERSION_NUMBER != 'Release 2.12') {
          style = FlightPlanner.options.airway_label_style;
          style = FlightPlanner.copyStyle(style);
          style.label = airway.name + ' FL' + airway.elevation_base + '/FL' + airway.elevation_top;
          style.fontColor = style.labelOutlineColor;
          style.labelXOffset = 1;
          style.labelYOffset = -1;
          
          feature = new OpenLayers.Feature.Vector(
            center_geometry,
            {airway:airway,title:airway.name,description:this.getDescription(airway)},
            style
          );
          switch(airway.type) {
            case 1: features_low.push(feature); break;
            case 2: features_high.push(feature); break;
            default: features_low.push(feature);
          }
        }
        
        style = FlightPlanner.options.airway_label_style;
        style = FlightPlanner.copyStyle(style);
        style.label = airway.name + ' FL' + airway.elevation_base + '/FL' + airway.elevation_top;
        
        feature = new OpenLayers.Feature.Vector(
          center_geometry,
          {airway:airway,title:airway.name,description:this.getDescription(airway)},
          style
        );
        switch(airway.type) {
          case 1: features_low.push(feature); break;
          case 2: features_high.push(feature); break;
          default: features_low.push(feature);
        }
      }
    }
    
    FlightPlanner.airwaysLowLayer.addFeatures(features_low);
    FlightPlanner.airwaysHighLayer.addFeatures(features_high);
  },  
  getDescription:function(airway)
  {
    var out =  '<p>';

    out+='from: '+airway.from_name+', to: '+airway.to_name;
    
    out+='</p>';
    return out;
  },
  getStyle:function(airway)
  {
    var style = FlightPlanner.options.airway_default_style;
    if(airway.type==2) style = FlightPlanner.options.airway_high_style;
    return style;
  }
};

FlightPlanner.Routes = {
  active_route:null,
  routes: [],
  
  init:function()
  {
    if(!this.load()) {
      this.add();
    }
  },
  
  add:function()
  {
    var route = new Route();
    route.init();
    this.routes.push(route);
    this.activate(route.id);
    this.save();
  },
  
  remove:function(id)
  {
    var route = arrayGetBy(this.routes,'id',id);
    if(route) {
      route.remove();
      this.routes.splice(arrayIndexOf(this.routes,route),1);
      
      if(this.routes.length>0) {
        this.activate(this.routes[0].id);
      } else {
        this.add();
        this.activate(this.routes[0].id);
      }
      
      this.save();
    }    
  },
  
  activate:function(id)
  {
    this.active_route = arrayGetBy(this.routes,'id',id);
    this.active_route.activate();
    for(var i=0;i<this.routes.length;i++) {
      if(this.routes[i]!=this.active_route) this.routes[i].deactivate();
    }
  },
  
  addWaypoint:function(type,apt_nav_id,lat,lon) {
    this.active_route.addWaypoint(type,apt_nav_id,lat,lon);
    this.save();
  },
  
  removeWaypoint:function(route_id,waypoint_id)
  {
    arrayGetBy(this.routes,'id',route_id).removeWaypoint(waypoint_id);
    this.save();
  },
  
  edit:function()
  {
    this.active_route.edit();
  },
  
  save:function()
  {
    var _routes = [];
    for(var i=0;i<this.routes.length;i++) {
      _routes.push(this.routes[i].getDataObject());
    }
    $.cookie('x-plane_flight_planner_routes',JSON.stringify(_routes),{expires:FlightPlanner.options.cookie_expires});
  },
  
  load:function()
  {
    var _routes = $.cookie('x-plane_flight_planner_routes');
    var route = null;
    var waypoint = null;
    if(_routes!==null) {
      _routes = JSON.parse(_routes);
      if(_routes.length>0) {
        for(var i=0;i<_routes.length;i++) {
          route = new Route(_routes[i]);
          route.init();
          this.routes.push(route);
          this.activate(route.id);
          route.loadWaypoints(_routes[i].waypoints);
        }
        return true;
      }
    }
    return false;
  }
};

Route = function(data)
{
  this.color = FlightPlanner.options.route_style.strokeColor;
  this.waypoints = [];
  this.id = arrayGreatest(FlightPlanner.Routes.routes,'id',0)+1;
  this.name = 'route '+this.id;
  this.visible = true;
  this.aircraft = '';
  this.cruise_speed = 0;
  this.fuel_consumption = 0;
  this.payload = 0;
  this.distance = 0;
  this.duration = 0;
  this.fuel = 0;
  
  if(data) {
    if(data.id) this.id = data.id;
    if(data.color) this.color = data.color;
    if(data.name) this.name = data.name;
    if(data.visible) this.visible = data.visible;
    if(data.aircaft) this.aircraft = data.aircaft;
    if(data.cruise_speed) this.cruise_speed = data.cruise_speed;
    if(data.fuel_consumption) this.fuel_consumption = data.fuel_consumption;
    if(data.payload) this.payload = data.payload;
  };
  
  this.loadWaypoints = function(data) {
    if(data) {
      var waypoint = null;
      for(var i=0;i<data.length;i++) {
        data[i].route = this;
        waypoint = new Waypoint(data[i]);
        waypoint.init();
        this.waypoints.push(waypoint);
      }
      
      this.makeSortable();    
      this.updateWaypoints();
    }
  };
  
  this.init = function()
  {
    this.container = $('<ul class="waypoints" id="route-'+this.id+'" data-id="'+this.id+'"></ul>');
    this.totals = $('<li class="totals"></li>');
    this.container.append(this.totals);
    this.select_option = $('<option value="'+this.id+'">'+this.name+'</option>');
    $('#routes-select').append(this.select_option);
    $('#routes-waypoints').append(this.container);
    this.setTotals();
  }
  
  this.edit = function()
  {
    var _this = this;
    var d_id = 'route-'+this.id+'-edit';
    
    // cancel if dialog is already open
    if($('#'+d_id).length>0) return false;
    
    var dial = $('<div class="route-edit" id="'+d_id+'" title="Edit '+this.name+'"></div>');
    $('body').append(dial);
    
    var body = '<p>';
    
    // name input
    body+='<label for="'+d_id+'-name">Name:</label><input id="'+d_id+'-name" type="text" value="'+this.name+'"><br/>';

    // visibility
    body+='<label for="'+d_id+'"-visible">Visible:</label><input id="'+d_id+'-visible" type="checkbox" value="1"'+(this.visible?'checked':'')+'><br/>';

    // color
    body+='<label for="'+d_id+'-color">Color:</label><span class="route-color" style="background:'+this.color+'"></span><select id="'+d_id+'-color">';
    var color;
    for(var i=0;i<FlightPlanner.options.route_colors.length;i++) {
      color = FlightPlanner.options.route_colors[i];
      body+='<option value="'+color+'" style="background:'+color+'"></option>';
    }
    body+='</select><br/>';
    
    // FSEconomy aircraft
    if(FSEconomy) {
      body+='<a href="javascript:void(0);" onclick="FSEconomy.selectAircraftDialog(\''+d_id+'\');">select FSEconomy aircraft</a><br/>';
    }
    
    // aircraft  
    body+='<label for="'+d_id+'-aircraft">Aircraft:</label><input id="'+d_id+'-aircraft" type="text" value="'+this.aircraft+'"><br/>';
    
    // cruise_speed
    body+='<label for="'+d_id+'-cruise_speed">Cruise Speed:</label><input id="'+d_id+'-cruise_speed" type="number" value="'+this.cruise_speed+'"> kts<br/>';
    
    // fuel consumption
    body+='<label for="'+d_id+'-fuel_consumption">Fuel consumption:</label><input id="'+d_id+'-fuel_consumption" type="number" value="'+this.fuel_consumption+'"> gallons/hour<br/>';
    
    // payload
    body+='<label for="'+d_id+'-payload">Payload<br/>(+ Pax & Crew):</label><input id="'+d_id+'-payload" type="number" value="'+this.payload+'"> kg<br/>';
    
    // export link
    body+='<br><a href="'+FlightPlanner.options.base_url+'json-fms/'+encodeURIComponent(JSON.stringify(this.getDataObject()))+'" target="fms">Export to .fms</a>';
    
    body+='</p>';
    
    dial.append(body);
    
    dial.find('#'+d_id+'-color').change(function(){
      dial.find('.route-color').css('background',$(this).val());
    });
    
    dial.dialog({
      height:'auto',
      width:'auto',
      close:function(){dial.remove();},
      buttons:[
        {
          text:'Remove',
          click:function(){
            if(confirm('Do you really want to remove this route?')) {
              dial.dialog('destroy');
              dial.remove();
              FlightPlanner.Routes.remove(_this.id);
            }
          }
        },
        {
          text:'Save',
          click:function(){
            var name = dial.find('#'+d_id+'-name').val();
            var visible = dial.find('#'+d_id+'-visible').get(0).checked;
            var color = dial.find('#'+d_id+'-color').val();
            var aircraft = dial.find('#'+d_id+'-aircraft').val();
            var cruise_speed = parseInt(dial.find('#'+d_id+'-cruise_speed').val());
            var fuel_consumption = parseInt(dial.find('#'+d_id+'-fuel_consumption').val());
            var payload = parseInt(dial.find('#'+d_id+'-payload').val());
            if(name!='') _this.name = name;
            _this.visible = visible;
            _this.color = color;
            _this.aircraft = aircraft;
            _this.cruise_speed = cruise_speed;
            _this.fuel_consumption = fuel_consumption;
            _this.payload = payload;

            _this.onEditSave();

            dial.dialog('destroy');
            dial.remove();
          }
        }
      ]
    });
  };
  
  this.onEditSave = function()
  {
    this.select_option.text(this.name);
    $('#route-color').css('background',this.color);
    this.updateWaypoints();
  };
  
  this.createFeatures = function()
  {
    var style = FlightPlanner.copyStyle(FlightPlanner.options.route_style);
    style.strokeColor = this.color;
    style.fillColor = this.color;

    if (!this.visible) {
      style.display = 'none';
    }

    // create the openlayers features
    this.line_feature = new OpenLayers.Feature.Vector(
      new OpenLayers.Geometry.LineString(),
      {route:this},
      style
    );
    this.points_feature = new OpenLayers.Feature.Vector(
      new OpenLayers.Geometry.MultiPoint(),
      {route:this},
      style
    );
    FlightPlanner.routesLayer.addFeatures([this.line_feature,this.points_feature]);
  };
  
  this.makeSortable = function()
  {
    var _this = this;
    this.container.sortable({
      axis:'y',
      cursor:'move',
      delay:0,
      distance:10,
      helper:'clone',
      opacity:0.5,
      tolerance:'pointer',
      items:'> li.waypoint',
      forceHelperSize:true,
      containment:'parent',
      update:function(event,ui){
        _this.onSort(event,ui);
      }
    });
  };
  
  this.onSort = function(event,ui)
  {
    var _waypoints = [];
    var waypoint = null;
    var id = null;
    var _this = this;
    
    ui.item.parent().find('li.waypoint').each(function(i,el){
      id = parseInt($(el).attr('data-id'));
      if(id!==null || id!="undefined") {
        waypoint = arrayGetBy(_this.waypoints,'id',id);
        if(waypoint) _waypoints.push(waypoint);
      }
    });
    this.waypoints = _waypoints;
    
    this.updateWaypoints();
    
    FlightPlanner.Routes.save();
  };
  
  this.activate = function()
  {
    this.container.addClass('active');
    $('#routes-select').val(this.id);
    $('#route-color').css('background',this.color);
    this.select_option[0].selected = true;
  };
  
  this.deactivate = function()
  {
    this.container.removeClass('active');
    this.select_option[0].selected = false;
  };
  
  this.remove = function()
  {
    if(this.line_feature && this.points_feature) FlightPlanner.routesLayer.destroyFeatures([this.line_feature,this.points_feature]);
    this.select_option.remove();
    this.container.remove();
  };
  
  this.addWaypoint = function(type,apt_nav_id,lat,lon)
  {
    var waypoint = new Waypoint({
      apt_nav_id:apt_nav_id,
      route:this,
      type:type,
      lat:lat,
      lon:lon
    });
    waypoint.init();
    this.waypoints.push(waypoint);
    this.makeSortable();
    
    this.updateWaypoints();
  };
  
  this.removeWaypoint = function(id)
  {
    var waypoint = arrayGetBy(this.waypoints,'id',id);
    waypoint.remove();
    this.waypoints.splice(arrayIndexOf(this.waypoints,waypoint),1);
    
    this.updateWaypoints();
  };
  
  // for curved lines that use projection see: http://gis.ibbeck.de/ginfo/apps/OLExamples/OL26/examples/gc_example.html  
  this.updateWaypoints = function()
  {
    var waypoint = null;
    var point = null;
    
    this.distance = 0;
    this.fuel = 0;
    this.duration = 0;
    
    if(this.line_feature && this.points_feature) FlightPlanner.routesLayer.destroyFeatures([this.line_feature,this.points_feature]);
    this.createFeatures();
    
    for(var i=0;i<this.waypoints.length;i++) {
      waypoint = this.waypoints[i];
      
      point = new OpenLayers.Geometry.Point(waypoint.lon,waypoint.lat);
      
      // point needs to be transfomred into map projection
      point.transform(FlightPlanner.mapProjection,FlightPlanner.map.getProjectionObject());
      this.line_feature.geometry.addPoint(point);
      this.points_feature.geometry.addPoint(point);

      waypoint.point = point;
      waypoint.next = null;
      
      if(i<this.waypoints.length) {
        waypoint.next = this.waypoints[i+1];
      }
    }
    FlightPlanner.routesLayer.redraw();
    this.calculate();
    this.setTotals();
  };
  
  this.calculate = function()
  {
    var waypoint = null;
    this.distance = 0;
    this.fuel = 0;
    this.duration = 0;
    
    for(var i=0;i<this.waypoints.length;i++) {
      waypoint = this.waypoints[i];
      waypoint.calculate();
      waypoint.setBody();
      this.distance+=waypoint.distance;
      this.duration+=waypoint.duration;
      this.fuel+=waypoint.fuel;
    }
  };
  
  this.setTotals = function()
  {
    this.totals.empty();
    var body = '';
    body+='<h4>Totals</h4>';
    
    // distance
    body+='Distance: '+this.distance.toFixed(2)+' nm<br/>';
    
    // duration
    body+='Duration: ';
    if(this.duration>0) {
      var hours = Math.floor(this.duration);
      var mins = Math.round((this.duration-hours)*60);
      body+=zeroFill(hours,2)+':'+zeroFill(mins,2);
    } else body+=' n.a.';
    body+='<br/>';
    
    // fuel
    body+='Fuel: '+this.fuel.toFixed(2)+' gallons';
    
    this.totals.append(body);
  };
  
  this.getDataObject = function()
  {
    var r = {
      id:this.id,
      name:this.name,
      color:this.color,
      waypoints:[],
      aircraft:this.aircraft,
      cruise_speed:this.cruise_speed,
      fuel_consumption:this.fuel_consumption,
      payload:this.payload
    }
    
    for(var i=0;i<this.waypoints.length;i++) {
      r.waypoints.push(this.waypoints[i].getDataObject());
    }
    
    return r;    
  }
}

Waypoint = function(data)
{
  this.route = null;
  this.type = null;
  this.id = null;
  this.apt_nav_id = null;
  this.lat = null;
  this.lon = null;
  this.elevation = 0;
  this.apt_nav = null;
  this.point = null;
  this.next = null;
  this.distance = 0;
  this.heading = 0;
  this.duration = 0;
  this.fuel = 0;
  
  if(data) {
    if(data.route) {
      this.route = data.route;
      this.id = arrayGreatest(this.route.waypoints,'id',0)+1;
    }
    if(data.apt_nav_id) this.apt_nav_id = data.apt_nav_id;
    if(data.type) this.type = data.type;
    if(data.id) this.id = data.id;
    if(data.lat) this.lat = data.lat;
    if(data.lon) this.lon = data.lon;
    if(data.elevation) this.elevation = data.elevation;
  }
  
  this.container = $('<li class="waypoint" id="route-'+this.route.id+'-waypoint-'+this.id+'" data-id="'+this.id+'"></li>');
  this.route.totals.before(this.container);
  
  this.init = function()
  {
    this.container.addClass(this.type);
    if(this.type=='gps') {
      this.setBody();      
    } else this.loadAptNav();
  };  
  
  this.calculate = function()
  {
    this.distance = 0;
    this.heading = 0;
    this.duration = 0;
    this.fuel = 0;
    
    if(this.next) {
      var line = new OpenLayers.Geometry.LineString([this.point,this.next.point]);
      this.distance = line.getGeodesicLength(FlightPlanner.map.getProjectionObject())/1852; // distance in nm
      if(this.route.cruise_speed>0) this.duration = this.distance/this.route.cruise_speed; // duration in hours
      this.fuel = this.duration*this.route.fuel_consumption; // fuel in gallons | TODO: implement payload
      this.heading = this.getHeading(this.point,this.next.point);
    }
  };
  
  // for heading calculations see: http://de.wikipedia.org/wiki/Deklination_%28Geographie%29
  // and: http://trac.osgeo.org/openlayers/wiki/GreatCircleAlgorithms
  this.getHeading = function(p_a,p_b)
  {
    var p1 = new OpenLayers.Geometry.Point(p_a.x,p_a.y);
    var p2 = new OpenLayers.Geometry.Point(p_b.x,p_b.y);
    p1.transform(FlightPlanner.map.getProjectionObject(),FlightPlanner.mapProjection);
    p2.transform(FlightPlanner.map.getProjectionObject(),FlightPlanner.mapProjection);
    var x1 = p1.x;
    var y1 = p1.y;
    var x2 = p2.x;
    var y2 = p2.y;
    var bearing;
    var variation;
    
    //Convert to radians
    x1 = x1 * DEG2RAD;
    y1 = y1 * DEG2RAD;
    x2 = x2 * DEG2RAD;
    y2 = y2 * DEG2RAD;

    var a = Math.cos(y2) * Math.sin(x2 - x1);
    var b = Math.cos(y1) * Math.sin(y2) - Math.sin(y1) * Math.cos(y2) * Math.cos(x2 - x1);
    var adjust = 0

    if((a == 0) && (b == 0)) {
        bearing = 0;
    } else if( b == 0) {
        if( a < 0)  
            bearing = 3 * PI / 2;
        else
            bearing = PI / 2;
    } else if( b < 0) 
        adjust = PI;
    else {
        if( a < 0) 
            adjust = 2 * PI;
        else
            adjust = 0;
    }
    bearing = (Math.atan(a/b) + adjust) * RAD2DEG;
    return bearing;
  };
  
  this.loadAptNav = function()
  {
    var _this = this;
    
    this.container.addClass('loading');
    
    var url = null;
    if(this.type=='airport') url = 'airport-json/';
    if(this.type=='navaid') url = 'navaid-json/';
    if(this.type=='fix') url = 'fix-json/';
    
    jQuery.getJSON(FlightPlanner.options.base_url+url+this.apt_nav_id,
      function(data,textStatus){
        _this.onAptNavResponse(data);
    });
  };
  
  this.onAptNavResponse = function(data)
  {
    this.container.removeClass('loading');
    this.aptNav = data;
    
    if(this.aptNav['airport']) this.elevation = this.aptNav.airport.elevation;
    if(this.aptNav['navaid']) this.elevation = this.aptNav.navaid.elevation;
    
    this.setBody();
  };
  
  this.setBody = function()
  {
    var style;
    var body = '';
    this.container.empty();
    
    var name = null;
    if(this.aptNav) {
      if(this.aptNav['airport']) {
        name = '<a class="waypoint-icon" href="javascript:void(0);" onclick="FlightPlanner.gotoFeature('+this.lat+','+this.lon+',FlightPlanner.airportsLayer,\''+this.apt_nav_id+'\');"><img src="'+FlightPlanner.Airports.getStyle(this.aptNav.airport).externalGraphic+'" width="24" height="24"></a>'+this.aptNav.airport.icao+' - '+this.aptNav.airport.name;
      }
      if(this.aptNav['navaid']) {
        name = '<a class="waypoint-icon" href="javascript:void(0);" onclick="FlightPlanner.gotoFeature('+this.lat+','+this.lon+',FlightPlanner.navaidsLayer,'+this.apt_nav_id+');"><img src="'+FlightPlanner.Navaids.getStyle(this.aptNav.navaid).externalGraphic+'" width="24" height="24"></a>'+this.aptNav.navaid.identifier+' - '+this.aptNav.navaid.name;
      }
      
      if(this.aptNav['fix']) {
        name = '<a class="waypoint-icon" href="javascript:void(0);" onclick="FlightPlanner.gotoFeature('+this.lat+','+this.lon+',FlightPlanner.fixesLayer,'+this.apt_nav_id+');"><img src="'+FlightPlanner.Fixes.getStyle(this.aptNav.fix).externalGraphic+'" width="24" height="24"></a>'+this.aptNav.fix.name;
      }
    } else if(this.type=='gps') {
      name = '<a class="waypoint-icon" href="javascript:void(0);" onclick="FlightPlanner.gotoLatLon('+this.lat+','+this.lon+');"><img src="'+FlightPlanner.options.gps_default_style.externalGraphic+'" width="24" height="24"></a>GPS point';
    }
    
    body+='<h4>'+name+'</h4>';
    body+='lat: '+this.lat.toFixed(4)+', lon: '+this.lon.toFixed(4)+'<br/>';
    
    body+= 'fly at: <input type="text" id="'+this.id+'-elevation" value="'+this.elevation+'" size="6" onkeyup="arrayGetBy(FlightPlanner.Routes.active_route.waypoints,\'id\','+this.id+').setElevation(parseInt(this.value));"/> ft<br/>';
    
    if(this.next) {
      body+='<a class="details-toggle" href="javascript:void(0);" onclick="$(this).next().slideToggle();">Details</a><div class="details">';
      // distance
      body+='Distance: '+this.distance.toFixed(2)+' nm<br/>';
      
      // duration
      body+='Duration: ';
      if(this.duration>0) {
          var hours = Math.floor(this.duration);
          var mins = Math.round((this.duration-hours)*60);
          body+=zeroFill(hours,2)+':'+zeroFill(mins,2);
      } else body+='n.a';
      body+='<br/>';

      // fuel
      body+='Fuel: '+this.fuel.toFixed(2)+' gallons<br/>';

      // heading
      body+='Heading: '+Math.round(this.heading)+'°<br/>';
      
      body+='</div>';
    }
    
    // remove button
    body+='<a class="remove" href="javascript:void(0);" onclick="FlightPlanner.Routes.removeWaypoint('+this.route.id+','+this.id+');">x remove</a>';
    
    this.container.append(body);
  };
  
  this.remove = function()
  {
    this.container.remove();
  };
  
  this.getDataObject = function()
  {
    return {
      id:this.id,
      name:this.name,
      apt_nav_id:this.apt_nav_id,
      type:this.type,
      lat:this.lat,
      lon:this.lon,
      elevation:this.elevation
    };
  };
  
  this.setElevation = function(elevation)
  {
    this.elevation = elevation;
    $('#'+this.id+'-elevation').val(this.elevation);
  }
}

