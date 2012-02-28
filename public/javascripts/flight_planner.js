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
     ,route_style:{}
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
          
        this.gotoLatLon(0,0,2);
        
        // add routes layer
        this.routesLayer = new OpenLayers.Layer.Vector('Your routes');
        this.map.addLayer(this.routesLayer);
        
        // add nav dat layers
        this.airportsLayer = new OpenLayers.Layer.Vector('Airports');
        this.navaidsLayer = new OpenLayers.Layer.Vector('Navaids');
        this.fixesLayer = new OpenLayers.Layer.Vector('Fixes');
        
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
        
        this.Routes.init();
    },
    gotoLatLon:function(lat,lon,zoom)
    {
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
    },
    onMapMove:function()
    {
      var zoom = this.map.getZoom();
      
      if(zoom>=this.options.zoom_display_apt_nav) {
        this.refreshAptNav();
      } else {
        this.clearAptNav(true);
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
        style = this.options.airport_default_style;
        
        airport = this.aptNav.airports[i];
        
        // simple air strip
        if(airport.type==1 && airport.runways.length==1 && airport.runways[0].type>2) style = this.options.airport_strip_style;
        
        // big airport with more than 2 runways
        if(airport.runways.length>2) style = this.options.airport_big_style;
        
        // seaport
        if(airport.type==16) style = this.options.airport_sea_style;
        
        // heliport
        if(airport.type==17) style = this.options.airport_heli_style;
        
        // make copy of style and add individual properties to it
        style = this.copyStyle(style);
        style.graphicTitle = airport.icao+' - '+airport.name
        
        // add geometry
        geometry = new OpenLayers.Geometry.Point(airport.lon,airport.lat);
        geometry.transform(this.mapProjection,this.map.getProjectionObject());
        
        // create the feature
        feature = new OpenLayers.Feature.Vector(
          geometry,
          {airport:airport,title:airport.icao+' - '+airport.name,description:this.getAirportDescription(airport)},
          style
        );
        features.push(feature);
      }
      
      this.airportsLayer.addFeatures(features);
      // TODO: add navaids and fixes to map
    },
    getAirportDescription:function(airport)
    {
      var out =  '<p>';
      var runway = null;
      var communication = null;
      
      out+='lat: '+airport.lat+', lon: '+airport.lon+'<br/>';
      
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
      
      out+='<a href="javascript:void(0);" onclick="FlightPlanner.Routes.addWaypoint(\'airport\',\''+airport.icao+'\');">add as waypoint</a>';
      
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
  },
  
  add:function()
  {
    this.routes.push(new Route());
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
  
  addWaypoint:function(type,id) {
    if(this.active_route==null) this.active_route = this.routes[0];
    this.active_route.addWaypoint(type,id);
  }
};

Route = function()
{
  this.waypoints = [];
  this.id = FlightPlanner.Routes.routes.length+1;
  this.name = 'route '+this.id;
  this.tab = $('<li><a href="javascript:void(0);" onclick="FlightPlanner.Routes.activate('+this.id+');">'+this.name+'</a><ul></ul></li>');
  $('#routes-menu > ul').append(this.tab);
  
  this.activate = function()
  {
    this.tab.addClass('active');
  },
  
  this.deactivate = function()
  {
    this.tab.removeClass('active');
  }
}

Waypoint = function()
{
  this.lat = null;
  this.lon = null;
  this.apt_nav = null;
}

