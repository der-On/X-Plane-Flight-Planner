var FlightPlanner = {
    options:{
      zoom_display_apt_nav: 6 // zoomlevel from wich on to display apt nav data
     ,base_url:'http://localhost:3000/'
    },
    aptNav:null,
    map:null,
    menu:null,
    init:function(map_id,menu_id)
    {
        this.map = new OpenLayers.Map(map_id,{
          units:'degrees'          
        });
        
        // register events
        this.map.events.register('zoomend',this,this.onMapZoom);
        this.map.events.register('moveend',this,this.onMapMove);
        
        // add base layers
        /*this.map.addLayer(new OpenLayers.Layer.WMS(
            "OpenLayers WMS",
            "http://vmap0.tiles.osgeo.org/wms/vmap0",
            {'layers':'basic'} )
        );*/
        
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
          
        // Google.v3 uses EPSG:900913 as projection, so we have to
        // transform our coordinates
        this.map.setCenter(new OpenLayers.LonLat(0, 0).transform(
            new OpenLayers.Projection("EPSG:4326"),
            this.map.getProjectionObject()
        ), 2);
          
        // add nav dat layers
        this.airportsLayer = new OpenLayers.Layer.Vector('Airports');
        this.navaidsLayer = new OpenLayers.Layer.Vector('Navaids');
        this.fixesLayer = new OpenLayers.Layer.Vector('Fixes');
        
        this.map.addLayer(this.airportsLayer);
        this.map.addLayer(this.navaidsLayer);
        this.map.addLayer(this.fixesLayer);
        
        // add layer switcher
        this.map.addControl(new OpenLayers.Control.LayerSwitcher());
        
        //this.map.zoomToMaxExtent();
        this.menu = $('#'+menu_id);
    },
    onMapZoom:function()
    {
      var zoom = this.map.getZoom();
      if(zoom>=this.options.zoom_display_apt_nav) {
        this.refreshAptNav();
      }
    },
    onMapMove:function()
    {
      var zoom = this.map.getZoom();
      if(zoom>=this.options.zoom_display_apt_nav) {
        this.refreshAptNav();
      }
    },
    refreshAptNav:function()
    {
      var _this = this;
      var bounds = this.map.getExtent();
      bounds.transform(this.map.getProjectionObject(),new OpenLayers.Projection("EPSG:4326"));
      bounds = bounds.toBBOX();
      console.log(bounds);
      jQuery.getJSON(this.options.base_url+'apt-nav-json',{bounds:bounds},
      function(data,textStatus){
        _this.onAptNavResponse(data);
      });
    },
    onAptNavResponse:function(data)
    {
      this.aptNav = data;
      // TODO: add airports, navaids and fixes to map
    }
};

