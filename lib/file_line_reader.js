// Module: FileLineReader
// Constructor: FileLineReader(filename, bufferSize = 8192)
// Methods: hasNextLine() -> boolean
//          nextLine() -> String
//
//
var Readlines = require('n-readlines');

exports.FileLineReader = function(filename, bufferSize) {
    bufferSize = bufferSize || 8192;
    var reader = new Readlines(filename, {
      readChunk: bufferSize
    });
    var nextLine = reader.next();

    //public:
    this.hasNextLine = function() {
        return nextLine !== false;
    };

    //public:
    this.nextLine = function() {
        var line = nextLine;
        nextLine = reader.next();
        return line.toString();
    };

    return this;
};
