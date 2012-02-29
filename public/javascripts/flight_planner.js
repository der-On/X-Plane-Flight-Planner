function numberRounded(number,decimals)
{
  var d = decimals*100;
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

var FlightPlanner = {
    options:{
      zoom_display_apt_nav: 7 // zoomlevel from wich on to display apt nav data
     ,zoom_search:11 // zoomlevel to use when going to a search result
     ,base_url:'http://localhost:3000/'
     ,airport_default_style:{fill:false, stroke:false, graphic:true, externalGraphic:'/images/airport_default.png', graphicWidth:24, graphicHeight:24, graphicOpacity:1, cursor:'pointer'}
     ,airport_big_style:{fill:false, stroke:false, graphic:true, externalGraphic:'/images/airport_big.png', graphicWidth:24, graphicHeight:24, graphicOpacity:1, cursor:'pointer'}
     ,airport_strip_style:{fill:false, stroke:false, graphic:true, externalGraphic:'/images/airport_strip.png', graphicWidth:24, graphicHeight:24, graphicOpacity:1, cursor:'pointer'}
     ,airport_sea_style:{fill:false, stroke:false, graphic:true, externalGraphic:'/images/airport_sea.png', graphicWidth:24, graphicHeight:24, graphicOpacity:1, cursor:'pointer'}
     ,airport_heli_style:{fill:false, stroke:false, graphic:true, externalGraphic:'/images/airport_heli.png', graphicWidth:24, graphicHeight:24, graphicOpacity:1, cursor:'pointer'}
     ,route_style:{fill:true, fillColor:'#DDBB66', fillOpacity:0.75, pointRadius:16, stroke:true, strokeColor:'#DDAA00', strokeOpacity:0.75, strokeWidth:3, strokeLinecap:'round', strokeDashstyle:'solid'}
    },
    aptNav:null,
    map:null,
    selectControl:null,
    
    init:function(map_id,menu_id)
    {
        this.map = new OpenLayers.Map(map_id,{
          units:'degrees'          
        });
        
        this.mapProjection = new OpenLayers.Projection("EPSG:4326");
        
        // add base layers
        this.map.addLayer(new OpenLayers.Layer.OSM(
            "OpenStreetMap Mapnik"
        ));
        
        this.map.addLayer(new OpenLayers.Layer.Google(
          'Google Street',
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
        
        this.map.addLayer(this.routesLayer);
        this.map.addLayer(this.fixesLayer);
        this.map.addLayer(this.navaidsLayer);
        this.map.addLayer(this.airportsLayer);        
        
        // add select control
        this.selectControl = new OpenLayers.Control.SelectFeature([this.airportsLayer,this.navaidsLayer,this.fixesLayer]);
        this.map.addControl(this.selectControl);
        this.selectControl.activate();
        
        // add layer switcher
        this.map.addControl(new OpenLayers.Control.LayerSwitcher());
        
         // register events
        this.map.events.register('zoomend',this,this.onMapZoom);
        this.map.events.register('moveend',this,this.onMapMove);
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
        
        // init Routes
        this.Routes.init();
        
        // restore last map position
        this.loadPosition();
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
      } else {
        this.clearAptNav(true);
      }
      this.savePosition();
    },
    savePosition:function()
    {
      var center = this.map.getCenter();
      $.cookie('x-plane_flight_planner_lat',center.lat);
      $.cookie('x-plane_flight_planner_lon',center.lon);
      $.cookie('x-plane_flight_planner_zoom',this.map.getZoom());
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
      // airport
      if(feature.attributes['airport']) {
        var id = feature.attributes.airport.icao;
        
        for(var i = 0;i<this.aptNav.airports.length;i++) {
          if(id==this.aptNav.airports[i].icao) return false;
        }
      }
      return true;
    },
    clearAptNav:function(force)
    {
      if(force=='undefined') force = false;
      
      if(!force) {

        var destroy = [];
        for(var i=0;i<this.airportsLayer.features.length;i++) {
          if(this.canDestroyFeature(this.airportsLayer.features[i])) {
            FlightPlanner.selectControl.unselect(this.airportsLayer.features[i]);
            destroy.push(this.airportsLayer.features[i]);
          }
        }
        this.airportsLayer.destroyFeatures(destroy);

        this.navaidsLayer.destroyFeatures();
        this.fixesLayer.destroyFeatures();
      } else {
        this.airportsLayer.destroyFeatures();
        this.navaidsLayer.destroyFeatures();
        this.fixesLayer.destroyFeatures();
      }
    },
    getAirportStyle:function(airport)
    {
      var style = this.options.airport_default_style;
      // simple air strip
      if(airport.type==1 && airport.runways.length==1 && airport.runways[0].type>2) style = this.options.airport_strip_style;

      // big airport with more than 2 runways
      if(airport.runways.length>2) style = this.options.airport_big_style;

      // seaport
      if(airport.type==16) style = this.options.airport_sea_style;

      // heliport
      if(airport.type==17) style = this.options.airport_heli_style;
      
      return style;
    },
    onAptNavResponse:function(data)
    {      
      this.aptNav = data;
      this.clearAptNav();
      
      // add airports
      var features = [];
      var feature = null;
      var geometry = null;
      var airport = null;
      var style = null;
      
      for(var i=0;i<this.aptNav.airports.length;i++) {        
        airport = this.aptNav.airports[i];
        
        style = this.getAirportStyle(airport);
                
        // make copy of style and add individual properties to it
        style = this.copyStyle(style);
        style.graphicTitle = airport.icao+' - '+airport.name
        
        // add geometry
        geometry = new OpenLayers.Geometry.Point(airport.lon,airport.lat);
        geometry.transform(this.mapProjection,this.map.getProjectionObject());
        
        // create the feature
        feature = new OpenLayers.Feature.Vector(
          geometry,
          {airport:airport,title:'<img src="'+style.externalGraphic+'" width="24" height="24">'+airport.icao+' - '+airport.name,description:this.getAirportDescription(airport)},
          style
        );
        features.push(feature);
      }
      
      this.airportsLayer.addFeatures(features);
      // TODO: add navaids and fixes to map
    },
    getAirportDescription:function(airport)
    {
      var runway = null;
      var communication = null;
      var out =  '<p>';
      out+='<a href="javascript:void(0);" onclick="FlightPlanner.Routes.addWaypoint(\'airport\',\''+airport.icao+'\','+airport.lat+','+airport.lon+');">add as waypoint</a><br/>';
      
      out+='lat: '+numberRounded(airport.lat,4)+', lon: '+numberRounded(airport.lon,4)+'<br/>';
      
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
          out+=communication.name+': '+(communication.frequency/100)+' MHz <br/>';
        }
      }
      
      out+='</p>';
      return out;
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
        new OpenLayers.Size(100,100),
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
    search:function(s,container) {
      if(s.length>0) {
        var _this = this;
        container.addClass('loading');
        jQuery.getJSON(this.options.base_url+'airports-search-json/'+s,
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
        out+='<li><a href="javascript:void(0);" onclick="FlightPlanner.gotoAirport(\''+airports[i].icao+'\','+airports[i].lat+','+airports[i].lon+');">'+airports[i].icao+' - '+airports[i].name+'</a></li>';
      }
      container.append(out);
    },
    gotoAirport:function(icao,lat,lon)
    {
      this.gotoLatLon(lat,lon,this.options.zoom_search);
    }
};


FlightPlanner.Routes = {
  active_route:null,
  routes: [],
  
  init:function()
  {
    this.add();
    this.activate(1);
  },
  
  add:function()
  {
    this.routes.push(new Route());
    this.activate(this.routes.length);
  },
  
  activate:function(id)
  {
    if(id>0 && id<=this.routes.length) {
      this.active_route = this.routes[id-1];
      this.active_route.activate();
      for(var i=0;i<this.routes.length;i++) {
        if(this.routes[i]!=this.active_route) this.routes[i].deactivate();
      }
    }
  },
  
  addWaypoint:function(type,apt_nav_id,lat,lon) {
    if(this.active_route==null) this.active_route = this.routes[0];
    this.active_route.addWaypoint(type,apt_nav_id,lat,lon);
  },
  
  removeWaypoint:function(route_id,waypoint_id)
  {
    arrayGetBy(this.routes,'id',route_id).removeWaypoint(waypoint_id);
  }
};

Route = function()
{
  this.color = FlightPlanner.options.route_style.strokeColor;
  
  this.waypoints = [];
  this.id = arrayGreatest(FlightPlanner.Routes.routes,'id',0)+1;
  this.name = 'route '+this.id;
  this.container = $('<ul class="waypoints" id="route-'+this.id+'" data-id="'+this.id+'"></ul>');
  this.select_option = $('<option value="'+this.id+'">'+this.name+'</option>');
  $('#routes-select').append(this.select_option);
  $('#routes-waypoints').append(this.container);
  
  this.createFeatures = function()
  {
    // create the openlayers features
    this.line_feature = new OpenLayers.Feature.Vector(
      new OpenLayers.Geometry.LineString(),
      {route:this},
      FlightPlanner.options.route_style
    );
    this.points_feature = new OpenLayers.Feature.Vector(
      new OpenLayers.Geometry.MultiPoint(),
      {route:this},
      FlightPlanner.options.route_style
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
      items:'> li',
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
    
    ui.item.parent().find('li').each(function(i,el){
      id = parseInt($(el).attr('data-id'));
      waypoint = arrayGetBy(_this.waypoints,'id',id);
      if(waypoint) _waypoints.push(waypoint);
    });
    this.waypoints = _waypoints;
    
    this.updateFeatures();
  };
  
  this.activate = function()
  {
    this.container.addClass('active');
    $('#routes-select').val(this.id);
    this.select_option[0].selected = true;
  };
  
  this.deactivate = function()
  {
    this.container.removeClass('active');
    this.select_option[0].selected = false;
  };
  
  this.addWaypoint = function(type,apt_nav_id,lat,lon)
  {
    var waypoint = new Waypoint(apt_nav_id,this);
    waypoint.type = type;
    waypoint.lat = lat;
    waypoint.lon = lon;
    this.waypoints.push(waypoint);
    waypoint.init();
    this.makeSortable();
    
    this.updateFeatures();
  };
  
  this.removeWaypoint = function(id)
  {
    var waypoint = arrayGetBy(this.waypoints,'id',id);
    waypoint.remove();
    this.waypoints.splice(arrayIndexOf(this.waypoints,waypoint),1);
    
    this.updateFeatures();
  };
  
  // for curved lines that use projection see: http://gis.ibbeck.de/ginfo/apps/OLExamples/OL26/examples/gc_example.html  
  this.updateFeatures = function()
  {
    var waypoint = null;
    var point = null;
    
    if(this.line_feature && this.points_feature) FlightPlanner.routesLayer.destroyFeatures([this.line_feature,this.points_feature]);
    this.createFeatures();
    
    for(var i=0;i<this.waypoints.length;i++) {
      waypoint = this.waypoints[i];
      point = new OpenLayers.Geometry.Point(waypoint.lon,waypoint.lat);
      
      // point needs to be transfomred into map projection
      point.transform(FlightPlanner.mapProjection,FlightPlanner.map.getProjectionObject());
      this.line_feature.geometry.addPoint(point);
      this.points_feature.geometry.addPoint(point);
    }
    FlightPlanner.routesLayer.redraw();
  }
}

Waypoint = function(apt_nav_id,route)
{
  this.route = route;
  this.type = null;
  this.id = arrayGreatest(this.route.waypoints,'id',0)+1;
  this.apt_nav_id = apt_nav_id;
  this.lat = null;
  this.lon = null;
  this.apt_nav = null;
  this.container = $('<li class="waypoint" id="route-'+this.route.id+'-waypoint-'+this.id+'" data-id="'+this.id+'"></li>');
  this.route.container.append(this.container);
  
  this.init = function()
  {
    this.container.addClass(this.type);
    this.loadAptNav();
  };  
  
  this.loadAptNav = function()
  {
    var _this = this;
    
    this.container.addClass('loading');
    
    if(this.type=='airport') {
      jQuery.getJSON(FlightPlanner.options.base_url+'airport-json/'+this.apt_nav_id,
        function(data,textStatus){
          _this.onAptNavResponse(data);
        });
    }
  };
  
  this.onAptNavResponse = function(data)
  {
    this.container.removeClass('loading');
    this.aptNav = data;
    this.setBody();
  };
  
  this.setBody = function()
  {
    var style;
    var body = '';
    this.container.empty();
    
    var name = null;
    if(this.aptNav['airport']) {
      name = '<a class="waypoint-icon" href="javascript:void(0);" onclick="FlightPlanner.gotoLatLon('+this.lat+','+this.lon+');"><img src="'+FlightPlanner.getAirportStyle(this.aptNav.airport).externalGraphic+'" width="24" height="24"></a>'+this.aptNav.airport.icao+' - '+this.aptNav.airport.name;
    }
    
    body+='<h4>'+name+'</h4>';
    body+='lat: '+numberRounded(this.lat,4)+', lon: '+numberRounded(this.lon,4)+'<br/>';
    body+='<a href="javascript:void(0);" onclick="FlightPlanner.Routes.removeWaypoint('+this.route.id+','+this.id+');">x remove</a>';
    
    this.container.append(body);
  };
  
  this.remove = function()
  {
    this.container.remove();
  }
}

