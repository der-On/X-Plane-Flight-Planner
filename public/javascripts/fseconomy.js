var FSEconomy = {
  aircrafts:null,  
  selectAircraftDialog:function(route_dialog_id)
  {
    var _this = this;
    var d_id = 'fse-aircraft';
    
    // cancel if dialog is already open
    if($('#'+d_id).length>0) return false;
    
    var dial = $('<div class="fse-aircraft" id="'+d_id+'" title="Select aircraft"></div>');
    $('body').append(dial);
    
    var body = '<p>Loading aircrafts please wait ...</p>';
    dial.append(body);
    
    dial.dialog({close:function(){dial.remove();}});
    
    this.loadAircrafts(function(aircrafts){
      dial.empty();
      dial.append('<label for="'+d_id+'-select">Select aircraft</label><br/>');
      dial.append('<select id="'+d_id+'-select"></select><br/><br/>');
      dial.append('<a id="'+d_id+'-select-button" class="button" href="javascript:void(0);">select</a>');
      
      dial.find('#'+d_id+'-select-button').click(function(){
        var id = parseInt(dial.find('#'+d_id+'-select').val());
        var aircraft = _this.getAircraftById(id);
        $('#'+route_dialog_id+'-aircraft').val(aircraft.name);
        $('#'+route_dialog_id+'-cruise_speed').val(aircraft.cruise_speed);
        $('#'+route_dialog_id+'-fuel_consumption').val(aircraft.fuel_consumption);

        dial.dialog('destroy');
        dial.remove();
      });
      
      var out = '';
      var aircraft = null;
      for(var i=0;i<aircrafts.length;i++) {
        out+='<option value="'+aircrafts[i].id+'">'+aircrafts[i].name+'</option>';
      }
      dial.find('#'+d_id+'-select').append(out);
    });
  },
  
  loadAircrafts:function(callback)
  {
    var _this = this;
    if(this.aircrafts==null) {
      jQuery.get(FlightPlanner.options.base_url+'fse-aircrafts',function(data,textStatus){
        _this.aircrafts = _this.parseAircrafts(data);
        callback(_this.aircrafts);
      });
    } else {
      callback(this.aircrafts);
    }
  },
  
  parseAircrafts:function(xml)
  {
    var aircrafts = [];
    var aircraft = null;
    $($(xml).find('response')[0]).find('Aircraft').each(function(i,el){
      aircraft = {};
      aircraft.id = i;
      aircraft.name = $(el).find('MakeModel').text();
      aircraft.cruise_speed = parseInt($(el).find('CruiseSpeed').text());
      aircraft.fuel_consumption = parseInt($(el).find('GPH').text());
      aircrafts.push(aircraft);
    });
    return aircrafts;
  },
  
  getAircraftById:function(id)
  {
    if(this.aircrafts && this.aircrafts.length>=id+1) {
      return this.aircrafts[id];
    }
  }
};