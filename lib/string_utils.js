String.prototype.explode = function(delimiter,limit)
{
  if(limit==undefined) return this.split(delimiter);
  var pos = null;
  var after = null;
  var before = this+'';
  var s = this+'';
  var parts = [];
  for(var i = 0;i<limit;i++) {
    pos = s.indexOf(delimiter);
    if(pos==-1) {
      parts.push(s);
      return parts;
    } else {
      before = s.substr(0,pos);
      after = s.substr(pos+delimiter.length)
      s = after;
      
      if(i==limit-1) {
        parts.push(before+delimiter+after);
      } else {
        parts.push(before);
      }
    }
  }
  return parts;
}

String.prototype.trim = function()
{
  return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

String.prototype.urlized = function(spacefill)
{
  if(spacefill) {} else spacefill = '-';
  var str = this+'';
  // convert umlauts
  str = str.replace([/Ä/, /Ö/, /Ü/, /ä/, /ö/, /ü/], ['Ae', 'Oe', 'Ue', 'ae', 'oe', 'ue']);

  // convert to ascii only
  //str = iconv('UTF-8', 'ASCII//TRANSLIT', $str);

  // remove non alphanumeric characters
  str = str.replace(/[^a-zA-Z0-9\/_|+ -]/, '');

  // trim and convert to lowercase
  str = str.trim().toLowerCase();

  // convert spaces and such
  str = str.replace(/[\/_|+ -]+/, spacefill);
  return str;
}