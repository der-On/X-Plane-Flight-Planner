var FSEconomy = {
  aircrafts:null,
  taskbar:null,
  selectAircraftDialog:function(route_dialog_id)
  {
    var _this = this;
    var d_id = 'fse-aircraft';
    
    // cancel if dialog is already open
    if($('#'+d_id).length>0) return false;
    
    var dial = $('<div class="fse-aircraft" id="'+d_id+'" title="Select FSEconomy aircraft"></div>');
    $('body').append(dial);
    
    var body = '<p>Loading aircrafts please wait ...</p>';
    dial.append(body);
    
    dial.dialog({
      height:'auto',
      width:'auto',
      resizable:false,
      close:function(){dial.remove();},
      buttons:[
        {
          text: 'Select',
          click: function(){
            var id = parseInt(dial.find('#'+d_id+'-select').val());
            var aircraft = _this.getAircraftById(id);
            $('#'+route_dialog_id+'-aircraft').val(aircraft.name);
            $('#'+route_dialog_id+'-cruise_speed').val(aircraft.cruise_speed);
            $('#'+route_dialog_id+'-fuel_consumption').val(aircraft.fuel_consumption);

            dial.dialog('destroy');
            dial.remove();
          }
        }
      ]
    });
    
    this.loadAircrafts(function(aircrafts){
      dial.empty();
      dial.append('<label for="'+d_id+'-select">Select aircraft</label><br/>');
      dial.append('<select id="'+d_id+'-select"></select><br/><br/>');
      
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
  },
  
  // TODO: provide a task-bar for this kind of dialog? so we can have multiple open at once
  listJobsDialog:function(icao)
  {
    var _this = this;
    var d_id = 'fse-jobs-'+icao;
    
    // disaply already created dialog
    console.log($('#'+d_id));
    if($('#'+d_id).length>0) {
      var dial = $('#'+d_id);
      dial.dialog('open');
      return false;
    }
    
    var dial = $('<div class="fse-jobs" id="'+d_id+'" title="Assignments for '+icao+'"></div>');
    $('body').append(dial);
    
    var body = '<p>Loading assignments please wait ...</p>';
    dial.append(body);
    
    dial.data('hard-close',true);
    
    dial.dialog({
      height:400,
      width:600,
      minWidth:600,
      close:function(){if(dial.data('hard-close')) dial.remove();},
      buttons:[
        {
          text:'minimize',
          click:function(){
            dial.data('hard-close',false);
            dial.dialog('close');
            dial.data('hard-close',true);
            _this.addDialogToTaskbar(dial);
          }
        }
      ]
    });
    
    this.loadJobsFrom(icao,function(jobsFrom){
      dial.delay(1000).queue(function(){
        _this.loadJobsTo(icao,function(jobsTo){
          dial.empty();
          var job = null;
          var out_from = '<h3>Assignments from '+icao+'</h3>';
          out_from+=_this.renderJobsTable(jobsFrom);

          var out_to = '<h3>Assignments to '+icao+'</h3>';
          out_to+=_this.renderJobsTable(jobsTo);

          dial.append(out_from+out_to);
          dial.append('<p>Sort multiple columns simultaneously by holding down the shift key and clicking a second, third or even fourth column header!</p>');

          dial.find('table').tablesorter();
        });
        $(this).dequeue();
      });
    });
  },
  
  renderJobsTable:function(jobs)
  {
    out = '<table class="fse-jobs-table tablesorter"><thead>'
      +'<th>Pay</th>'
      +'<th>From</th>'
      +'<th>Dest</th>'
      +'<th>NM</th>'
      +'<th>Bearing</th>'
      +'<th>Cargo</th>'
      +'<th>Expires</th>'
      +'</thead><tbody>';
    
    var job;
    for(var i=0;i<jobs.length;i++) {
      job = jobs[i];
      out+='<tr>'
              +'<td>$'+job.pay+'</td>'
              +'<td><a href="javascript:void(0);" onclick="FlightPlanner.gotoLatLon('+job.from_lat+','+job.from_lon+');">'+job.location+'</a></td>'
              +'<td><a href="javascript:void(0);" onclick="FlightPlanner.gotoLatLon('+job.to_lat+','+job.to_lon+');">'+job.to+'</a></td>'
              +'<td>'+job.distance+'</td>'
              +'<td>'+job.bearing+'</td>';

      if(job.unitType=="passangers") {
        out+='<td>'+job.amount+' '+job.commodity+'</td>'
      } else {
        out+='<td>'+job.commodity+' '+job.amount+' '+job.unitType+'</td>';
      }
      out+='<td>'+job.expires+'</td>';
      out+='</tr>';
    }
    
    out+='</tbody></table>';
    return out;
  },
  
  loadJobsFrom:function(icao,callback)
  {
    var _this = this;

    jQuery.get(FlightPlanner.options.base_url+'fse-jobs-from/'+icao,function(data,textStatus){
      var jobs = _this.parseJobs(data);
      callback(jobs);
    });
  },
  
  loadJobsTo:function(icao,callback)
  {
    var _this = this;

    jQuery.get(FlightPlanner.options.base_url+'fse-jobs-to/'+icao,function(data,textStatus){
      var jobs = _this.parseJobs(data);
      callback(jobs);
    });
  },
  
  parseJobs:function(xml)
  {
    var jobs = [];
    var job = null;
    $($(xml).find('response')[0]).find('job').each(function(i,el){
      job = {};
      job.id = parseInt($(el).find('id').text());
      job.location = $(el).find('location').text();
      job.from = $(el).find('from').text();
      job.to = $(el).find('to').text();
      job.amount = parseInt($(el).find('amount').text());
      job.unit_type = $(el).find('unitType').text();
      job.commodity = $(el).find('commodity').text();
      job.pay = parseFloat($(el).find('pay').text());
      job.expires = $(el).find('expires').text();
      job.from_lat = parseFloat($(el).find('from_lat').text());
      job.from_lon = parseFloat($(el).find('from_lon').text());
      job.to_lat = parseFloat($(el).find('to_lat').text());
      job.to_lon = parseFloat($(el).find('to_lon').text());
      job.distance = parseFloat($(el).find('distance').text());
      job.bearing = parseFloat($(el).find('bearing').text());
      jobs.push(job);
    });
    return jobs;
  },
  
  addDialogToTaskbar:function(dial)
  {
    if(this.taskbar==null) {
      this.taskbar = $('<ul class="fse-taskbar"></ul>');
      $('body').append(this.taskbar);
    }
    var task = $('<li class="task" data-dialog-id="'+dial.attr('id')+'"><a href="javascript:void(0);" onclick="FSEconomy.openDialog(\''+dial.attr('id')+'\');" title="click to open">'+dial.dialog('widget').find('.ui-dialog-title').text()+'</a></li>');
    this.taskbar.append(task);
  },
  removeDialogFromTaskbar:function(dial)
  {
    if(this.taskbar) {
      this.taskbar.find('.task[data-dialog-id='+dial.attr('id')+']').remove();
    }
  },
  openDialog:function(id)
  {
    var dial = $('#'+id);
    if(dial) {
      this.removeDialogFromTaskbar(dial);
      dial.dialog('open');
    }
  }
};