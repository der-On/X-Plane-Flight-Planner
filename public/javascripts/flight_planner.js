var FlightPlanner = {
    map:null,
    menu:null,
    init:function(map_id,menu_id)
    {
        this.map = new OpenLayers.Map(map_id);
        this.map.addLayer(new OpenLayers.Layer.WMS(
            "OpenLayers WMS",
            "http://vmap0.tiles.osgeo.org/wms/vmap0",
            {'layers':'basic'} )
        );
        this.map.zoomToMaxExtent();
        this.menu = $('#'+menu_id);
    }
};

