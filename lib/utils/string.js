if (typeof String.prototype.explode === 'undefined') {
  String.prototype.explode = function (delimiter, limit) {
    if (limit === undefined) return this.split(delimiter);
    var pos = null;
    var after = null;
    var before = this + '';
    var s = this + '';
    var parts = [];

    for (var i = 0; i < limit; i++) {
      pos = s.indexOf(delimiter);

      if (pos==-1) {
        parts.push(s);
        return parts;
      } else {
        before = s.substr(0,pos);
        after = s.substr(pos + delimiter.length)
        s = after;

        if (i === limit - 1) {
          parts.push(before + delimiter + after);
        } else {
          parts.push(before);
        }
      }
    }

    return parts;
  };
}

if (typeof String.prototype.trim === 'undefined') {
  String.prototype.trim = function() {
    return this
      .replace(/^\s\s*/, '')
      .replace(/\s\s*$/, '');
  };
}
