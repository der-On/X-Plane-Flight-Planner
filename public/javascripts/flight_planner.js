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

function zeroFill( number, width )
{
  width -= number.toString().length;
  if ( width > 0 )
  {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number;
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
     ,route_colors:['#DDBB66','#ffa544','#91b756','#3161a4','#9b8ab6','#ae927a','#c74634','#ad5c15','#4f6f3e','#fdef5a','#4b6574','#3f3f3f']
    },
    aptNav:null,
    map:null,
    selectControl:null,
    
    init:function(map_id,menu_id)
    {
        this.map = new OpenLayers.Map(map_id,{
          units:'m'          
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
      
      out+='lat: '+airport.lat.toFixed(4)+', lon: '+airport.lon.toFixed(4)+'<br/>';
      
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
    $.cookie('x-plane_flight_planner_routes',JSON.stringify(_routes));
  },
  
  load:function()
  {
    var _routes = $.cookie('x-plane_flight_planner_routes');
    var route = null;
    var waypoint = null;
    if(_routes!==null) {
      _routes = eval(_routes);
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
    
    // color
    body+='<label for="'+d_id+'-color">Color:</label><span class="route-color" style="background:'+this.color+'"></span><select id="'+d_id+'-color">';
    var color;
    for(var i=0;i<FlightPlanner.options.route_colors.length;i++) {
      color = FlightPlanner.options.route_colors[i];
      body+='<option value="'+color+'" style="background:'+color+'"></option>';
    }
    body+='</select><br/>';
    
    // aircraft  
    body+='<label for="'+d_id+'-aircraft">Aircraft:</label><input id="'+d_id+'-aircraft" type="text" value="'+this.aircraft+'"><br/>';
    
    // cruise_speed
    body+='<label for="'+d_id+'-cruise_speed">Cruise Speed:</label><input id="'+d_id+'-cruise_speed" type="number" value="'+this.cruise_speed+'"> kts<br/>';
    
    // fuel consumption
    body+='<label for="'+d_id+'-fuel_consumption">Fuel consumption:</label><input id="'+d_id+'-fuel_consumption" type="number" value="'+this.fuel_consumption+'"> gallons/hour<br/>';
    
    // payload
    body+='<label for="'+d_id+'-payload">Payload<br/>(+ Pax & Crew):</label><input id="'+d_id+'-payload" type="number" value="'+this.payload+'"> kg<br/>';
    
    // save
    body+='<button class="save-route" id="'+d_id+'-save">Save</button>';
    
    // remove
    body+='<a href="javascript:void(0);" class="remove-route" id="'+d_id+'-remove">x remove</a>';
    
    
    body+='</p>';
    dial.append(body);
    
    dial.find('#'+d_id+'-color').change(function(){
      dial.find('.route-color').css('background',$(this).val());
    });
    
    dial.find('#'+d_id+'-save').click(function(){
      var name = dial.find('#'+d_id+'-name').val();
      var color = dial.find('#'+d_id+'-color').val();
      var aircraft = dial.find('#'+d_id+'-aircraft').val();
      var cruise_speed = parseInt(dial.find('#'+d_id+'-cruise_speed').val());
      var fuel_consumption = parseInt(dial.find('#'+d_id+'-fuel_consumption').val());
      var payload = parseInt(dial.find('#'+d_id+'-payload').val());
      if(name!='') _this.name = name;
      _this.color = color;
      _this.aircraft = aircraft;
      _this.cruise_speed = cruise_speed;
      _this.fuel_consumption = fuel_consumption;
      _this.payload = payload;
      
      _this.onEditSave();
      
      dial.dialog('destroy');
      dial.remove();
    });
    
    dial.find('#'+d_id+'-remove').click(function(){
      if(confirm('Do you really want to remove this route?')) {
        dial.dialog('destroy');
        dial.remove();
        FlightPlanner.Routes.remove(_this.id);
      }
    });
    
    dial.dialog({close:function(){dial.remove();}});
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
  }
  
  this.container = $('<li class="waypoint" id="route-'+this.route.id+'-waypoint-'+this.id+'" data-id="'+this.id+'"></li>');
  this.route.totals.before(this.container);
  
  this.init = function()
  {
    this.container.addClass(this.type);
    this.loadAptNav();
  };  
  
  this.calculate = function()
  {
    this.distance = 0;
    this.heading = 0;
    this.duration = 0;
    this.fuel = 0;
    
    if(this.aptNav) {
      if(this.next) {
        this.distance = this.point.distanceTo(this.next.point)/1852; // distance in nm
        if(this.route.cruise_speed>0) this.duration = this.distance/this.route.cruise_speed; // duration in hours
        this.fuel = this.duration*this.route.fuel_consumption; // fuel in gallons | TODO: implement payload
        // for heading calculations see: http://de.wikipedia.org/wiki/Deklination_%28Geographie%29        
      }
    }
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
    if(this.aptNav) {
      if(this.aptNav['airport']) {
        name = '<a class="waypoint-icon" href="javascript:void(0);" onclick="FlightPlanner.gotoLatLon('+this.lat+','+this.lon+');"><img src="'+FlightPlanner.getAirportStyle(this.aptNav.airport).externalGraphic+'" width="24" height="24"></a>'+this.aptNav.airport.icao+' - '+this.aptNav.airport.name;
      }
    }
    
    body+='<h4>'+name+'</h4>';
    body+='lat: '+this.lat.toFixed(4)+', lon: '+this.lon.toFixed(4)+'<br/>';
    
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
      lon:this.lon
    };
  }
}

