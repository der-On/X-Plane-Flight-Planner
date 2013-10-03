// Estro (Make javascript useful)
//
// Takes prototyping to a new level.
//
// > Author: Nijikokun <nijikokun@gmail.com><br />
// > Copyright: 2011-2012 (c) Nijikokun<br />
// > Licensing: AOL License <http://aol.nexua.org><br />
(function () {
    // Initialize Estro Object
    // This will be our holder for all of the Prototype functions.
    var Estro = {
        version: "2.4"
    };
    
    // Quick Prototype access, for looping or in-code access.
    var Proto = {
        Array: Array.prototype,
        Object: Object.prototype,
        String: String.prototype,
        Number: Number.prototype
    };
    
    // Our custom class controller.
    var Types = {};
    
    // Exceptions
    var Exceptions = {
        InvalidArgument: function(message) {
            this.name = "InvalidArgument";
            this.message = message;
        }
    };
    
    // Array based functions
    // ----------------------
    Estro.Array = {
        // Runs callback func against each index. Advanced version of Array.forEach
        each: function(func, context) {
            if(!this || this == null || this.isEmpty()) 
                throw new Exceptions.InvalidArgument('Array given was empty or null');
            
            for(var i in this)
                if(this.hasOwnProperty(i))
                    if(func.call(context, this[i], i, this) === {})
                        return;
        },
        
        // Returns an array of elements called against the callback function.
        map: function(func, context) {
            var results = [];
            
            if(!this || this == null || this.isEmpty()) 
                return results;
                
            if(!func) return this;
            this.each(function(val, index, list) {
                results[results.length] = func.call(context, val, index, list);
            });
            
            return results;
        },
        
        // Returns boolean based on the fact that if each element equals func or not.
        every: function(func, context) {
            var length = this.length, index = 0;
            
            if(!this || this == null || this.isEmpty()) 
                throw new Exceptions.InvalidArgument('Array given was empty or null');
            
            if(!func)
                throw new Exceptions.InvalidArgument('Callback function for `some` was empty!');
            
            while(index < length) {
                if(index in this && !this[index].match(func, context, [index, this]))
                    return false;
                
                index++;
            }
            
            return true;
        },
        
        // Returns boolean based on premise that one element equals func
        some: function(func, context) {
            var length = this.length, index = 0;
            
            if(!this || this == null || this.isEmpty()) 
                throw new Exceptions.InvalidArgument('Array given was empty or null');
            
            if(!func)
                throw new Exceptions.InvalidArgument('Callback function for `some` was empty!');
            
            while(index < length) {
                if(index in this && this[index].match(func, context, [index, this]))
                    return true;
                
                index++;
            }
            
            return false;
        },
        
        // Returns any elements in the array that matches callback
        filter: function(func, context) {
            var length = this.length, index = 0, result = [];
            
            if(!this || this == null || this.isEmpty()) 
                return results;
                
            if(!func) return this;
            while(index < length) {
                if(index in this && this[index].match(func, context, [index, this]))
                    result.push(this[index]);
                    
                index++;
            }
            
            return result;
        },
        
        reduce: function(func, start, context) {
            var initial = start !== void 0;
            
            if(!this || this == null || this.isEmpty()) 
                throw new Exceptions.InvalidArgument('Array given was empty or invalid');
                
            this.each(function(val, indice, list) {
                start = initial ? func.call(context, start, val, indice, list) : value;
                initial = true
            });
            
            return start;
        },
        
        reduceRight: function(func, start, context) {
            if(!this || this == null || this.isEmpty()) 
                throw new Exceptions.InvalidArgument('Array given was empty or invalid');
                
            var reversed = (this.isArray() ? this.slice() : obj.toArray()).reverse();
            return reversed.reduce(iterator, memo, context);
        }
        
    };
    
    // Essential Object Requirements
    Estro.Object = {
        hop: function (item) {
            return this.hasOwnProperty(item);
        },
        
        each: function(func, context) {
            if(!this || this == null || this.isEmpty()) 
                throw new Exceptions.InvalidArgument('Object given was empty or invalid');
            
            for(var i in this)
                if(this.hasOwnProperty(i))
                    if(func.call(context, this[i], i, this) === {})
                        return;
        },
        
        isEmpty: function () {
            if(this.isArray() || this.isString())
                return this.length === 0;
                
            for(var i in this)
                if(this.hop(i))
                    return false;
                    
            return true;
        },
        
        isElement: function () {
            return !!(this && this.nodeType == 1);
        },
        
        isObject: function () {
            return this == Object(this);
        },
        
        isBoolean: function () {
            return this === true || this === false || Object.prototype.toString.call(this) == '[object Boolean]';
        },
        
        isNaN: function () {
            return this !== this;
        },
        
        isNull: function () {
            return this === null;
        },
        
        isUndefined: function () {
            return this === void 0;
        },
        
        match: function (match, context, params) {
            if(this === match)
                return true;
            else if(object.isRegExp(match))
                return regexp(match).test(this);
            else if(object.isFunction(match))
                return match.apply(context, [this].concat(params));
            else
                return object.equal(match, this);
        },
        
        typeOf: function (of) {
            return Object.prototype.toString.call(this);
        },
        
        cacheResults: function (result) {
            if(!this.isFunction())
                return;
                
            var cache = {};
            
            result || (result = function(v) { return v; });
            
            return function() {
                var key = result.apply(this, arguments);
                return hasOwnProperty.call(cache, key) ? cache[key] : (cache[key] = this.apply(this, arguments));
            };
        },
        
        toArray: function () {
            if(!this || this.isEmpty())
                return [];
                
            if(this.isString() || this.isDate() || this.isFunction() || this.isNumber() || this.isRegExp())
                return [ this ];
                
            if(this.toArray && this.toArray != Estro.Object.toArray)
                return this.toArray();
            
            if(this.isArray)
                return slice.call(this);
                
            if(this.isArguments)
                return slice.call(this);

            return this.map(function(v) { return v; });
        }
    };
    
    // Loop through similiar styled checks quickly
    (function(obj, t){
        var types = 'Array Arguments Date Function Number Object RegExp String'.split(' ');
        
        for(var type in types) {
            if(types.hasOwnProperty(type)) {
                t[types[type]] = "[object " + types[type] + "]";
                
                if(!obj['is' + types[type]])
                    obj['is' + types[type]] = (function(type) { 
                        return function () { 
                            return Object.prototype.toString.call(this) == t[type];
                        } 
                    })(types[type]);
            }
        }
    }(Estro.Object, Types));
    
    // Number based functions
    // ----------------------
    Estro.Number = {
        abs: function () {
            return Math.abs(this);
        },
        
        // Round a number to precision decimal places (default 0).
        round: function (precision) {
            precision = Math.pow(10, precision || 0);
            return Math.round(this * precision) / precision;
        },
        
        ceil: function () {
            return Math.ceil(this);
        },
        
        floor: function () {
            return Math.floor(this);
        },
        
        modulo: function (n) {
            return this % n;
        },

        pad: function (place, sign, base) {
            base || (base = 10);
            var str = this.toInt() === 0 ? '' : (this + '').replace(/^-/, '');
            str = str.padLeft('0', place - str.replace(/\.\d+$/, '').length);
            
            if(sign || this < 0) 
                str = (this < 0 ? '-' : '+') + str;
            
            return str;
        },
        
        // Map a number from a range of values to another range. 
        // Numbers are not clamped.
        map: function (fmin, fmax, tmin, tmax) {
            return tmin + (tmax - tmin) * ((this - fmin) / (fmax - fmin));
        },
        
        // Clamp a number in the range of min and max
        limit: function (min, max) {
            return Math.min(max, Math.max(min, this));
        },
        
        // Checks to see if the number is a multiple of 2
        isEven: function () {
            return this.isMultipleOf(2);
        },
        
        // Checks to see if the number is not a multiple of 2
        isOdd: function () {
            return !this.isMultipleOf(2);
        },
        
        // Returns true if the number is a multiple of n
        isMultipleOf: function (n) {
            return (this.mod(n) === 0);
        },
        
        // Discard decimal places of a number. 
        // For negative numbers, the behavior is different than Number.floor().
        toNumber: function () {
            return (this | 0);
        },
        
        // Convert degrees to radians
        //
        //     (45).toRad(); // => 0.7853981633974483
        //
        toRadians: function () {
            return (this / 180) * Math.PI;
        },
        
        // Convert radians to degrees
        //
        //     (0.7853981633974483).toDeg(); // => 45
        //
        toDegrees: function () {
            return (this * 180) / Math.PI;
        },

        format: function (place, th, dc) {
            var str, split, method, after, r = /(\d+)(\d{3})/;
            
            th || (th = ',');
            dc || (dc = '.');
            
            if(String(th).match(/\d/))
                throw new Exceptions.InvalidArgument('Thousands seperator cannot contain digits.');
                
            str = place.isNumber() ? this.round(place).toFixed(Math.max(place, 0)) : this + '';
            split = str.split('.');
            str = split[0]; after = split[1];
            
            while(str.match(r))
                str = str.replace(r, '$1' + th + '$2');
            
            if(after.length > 0)
                str += dc + after.padRight('0', place - after.length);
            
            return str;
        },
        
        // Returns an ordinalized (English) string
        // 1st, 2nd, etc...
        ordinalize: function () {
            if(this >= 11 && this <= 13)
                return this + 'th';
            
            switch(this.mod(10)) {
                case 1:  return this + 'st'; break;
                case 2:  return this + 'nd'; break;
                case 3:  return this + 'rd'; break;
                default: return this + 'th'; break;
            }
        },
        
        charCode: function () {
            return String.fromCharCode(this);
        },
        
        // Aliases
        ord: function () { return this.ordinalize(); },
        chr: function () { return this.charCode(); },
        mod: function (n) { return this.modulo(n); },
        clamp: function (m,x) { return this.limit(m,x); },
        toInt: function () { return this.toNumber(); },
        toRad: function () { return this.toRadians(); },
        toDeg: function () { return this.toDegrees(); }
    };
    
    // String based functions
    // ----------------------
    Estro.String = {
        // Checks whether or not the `string` is `empty`
        isEmpty: function () {
            return (!this || 0 === this.length);
        },
        
        // Check whether the string is `blank` (Null, Undefined, Empty)
        isBlank: function() {
            return (!this || /^\s*$/.test(this));
        },
        
        // Compares the given `string` to the original lexicographically
        compareTo: function (s) {
            var o = this,
                x = o.length,
                z = s.length,
                n = (x < z ? x : z);
            
            for (var i = 0; i < n; i++) {
                var a = o.charCodeAt(i), b = s.charCodeAt(i);
                
                if (a != b) 
                    return (a - b);
            }
            
            return (x - z);
        },
        
        // Tests if this string starts with the specified prefix.
        startsWith: function (str) {
            return !this.indexOf(str);
        },
        
        // Tests if this string ends with the specified suffix.
        endsWith: function (str) {
            return this.indexOf(str, this.length - str.length) !== -1;
        },
        
        // Verifies if this string contains the given needle.
        contains: function (n) {
            return this.indexOf(n) != -1;
        },
        
        // Compares both strings to each other.
        equals: function (str) {
            return (this == str);
        },
        
        // Compares both strings without case sensitivity.
        equalsIgnoreCase: function (str) {
            var o = this;
            return (o == str) ? true : ((!str.isEmpty()) && (str.length == o.length) && o.toLowerCase() == str.toLowerCase());
        },
        
        // Removes leading and trailing whitespace.
        trim: function () {
            return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        },
        
        // Removes the leading whitespace
        trimLeft: function () {
            return this.trimLeft ? this.trimLeft() : this.replace(/^\s+/, '');
        },

        // Removes the trailing whitespace
        trimRight: function () {
            return this.trimRight ? this.trimRight() : this.replace(/\s+$/, '');
        },
        
        // Removes all Alphanumeric characters from the given string
        trimNonAlpha: function () {
            return this.replace(/[^A-Za-z ]+/g, '');
        },
        
        // Removes all Non-Alphanumeric characters from the given string
        trimNonAlphaNumeric: function () {
            return this.replace(/[^A-Za-z0-9 ]+/g, '');
        },
        
        // Removes all characters that aren't numbers from the given string.
        trimNonNumeric: function () {
            return this.replace(/[^0-9-.]/g, '');
        },
        
        // Removes all numbers from the given string
        trimNumeric: function () {
            return this.replace(/[0-9]/g, '');
        },
        
        // Appends the current string `n` times to itself.
        repeat: function (n) {
            return new Array(n ? n + 1 : 2).join(this);
        },
        
        // Reverse the order of characters in a string.
        // 
        //     'hello'.reverse() becomes olleh
        //
        reverse: function () {
            return this.split('').reverse().join('');
        },

        // Insert a `string` at the `index` given.
        insert: function (s, i) {
            return this.slice(0, i) + s + this.slice(i);
        },
        
        // Removes a certain amount of characters between the 
        // `start` and `end` of the string given.
        remove: function (s, e) {
            return this.slice(0, s) + this.slice(e);
        },
        
        // Removes a certain amount of characters from the start of
        // the current string.
        //
        // Argument `a` is optional. Default is `1`
        pop: function (a) {
            return this.slice(a ? a>0 ? a : a*1 : 1, this.length);
        },
        
        // Removes a certain amount of characters from the end of
        // the current string.
        //
        // Argument `a` is optional. Default is `1`
        chop: function (a) {
            return this.slice(0, a ? a<0 ? a : a*-1 : -1);
        },
        
        // Capitalizes the first word of the current string.
        capitalize: function () {
            return this.charAt(0).toUpperCase() + this.slice(1);
        },
        
        // Un-Capitalizes the first word of the current string.
        uncapitalize: function () {
            return this.charAt(0).toLowerCase() + this.slice(1);
        },
        
        // Capitalizes each word in the current string.
        capitalizeWords: function () {
            return this.replace(/\w+/g, function (w) {
                return w.capitalize();
            });
        },

        // Un-Capitalizes each word.
        uncapitalizeWords: function () {
            return this.replace(/\w+/g, function (w) {
                return w.uncapitalize();
            });
        },

        // Verifies if the character at indice `i` is upper-case.
        isUpperCaseAt: function (i) {
            return this.charAt(i).toUpperCase() === this.charAt(i);
        },

        // Verifies if the character at indice `i` is lower-case.
        isLowerCaseAt: function (i) {
            return this.charAt(i).toLowerCase() === this.charAt(i);
        },
        
        // Swaps out the casing of the current string.
        //
        //    upper -> lower
        //    lower -> upper
        //
        // etc...
        swapCase: function () {
            return this.replace(/([a-z]+)|([A-Z]+)/g, function (m, l, u) {
                return l ? m.toUpperCase() : m.toLowerCase();
            });
        },
        
        // Converts a string of words to camelCase.
        camelize: function() {
            return this.replace(/\W+(.)/g, function (m, l) {
                return l.toUpperCase();
            });
        },
        
        // Hyphenates the current string of words.
        //
        //     un capitalize -> un-capitalize
        //
        dasherize: function () {
            return this.replace(/\W+/g, '-').replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase();
        },
        
        // Converts spaces to underscores.
        //
        //     system out -> system_out
        //
        underscore: function () {
            return this.replace(/\W+/g, '_').replace(/([a-z\d])([A-Z])/g, '$1_$2').toLowerCase();
        },

        pad: function (padding, left, right) {
            padding = padding.isString() ? padding : String(padding);
            
            if(!left.isNumber()) left = 1;
            if(!right.isNumber()) right = 1;
            return padding.repeat(left) + this + padding.repeat(right);
        },
        
        padLeft: function (padding, amount) {
            return this.pad(padding, amount, 0);
        },
        
        padRight: function (padding, amount) {
            return this.pad(padding, 0, amount);
        },
        
        // Small templating / printf capabilities.
        //
        //     'Hello %{who}!'.bind({who: "World"})
        //      Outputs: Hello World!
        //
        bind: function (d) {
            var m, o = this;
            
            while (m = /%\{\s*([^\}\s]+)\s*\}/.exec(o))
                o = o.replace(m[0], d[m[1]] || '??');
            
            return o;
        },
        
        // Extracts a Regular Expression from the current 
        // String. Somewhat like `matches` from Java.
        //
        //      'Hello'.extract(/e/, 1)
        extract: function (rgx, n) {
            n = (n === undefined) ? 0 : n;
            
            if (!rgx.global)
                return this.match(rgx)[n] || '';
            
            var m, e = [];
            
            while ((m = rgx.exec(this))) 
                e[e.length] = m[n] || '';
            
            return e;
        },
        
        // Converts the current string into it's numeric value.
        //
        // Returns as an array.
        toInt: function () {
            for(var b=[],a=0;a<this.length;a++)
                b[a] = this.charCodeAt(a);
                
            return b
        },
        
        // Converts the current string to a hashcode.
        //
        // Java function.
        toHash: function() {
            var h = 0, l = this.length;
            for (var i = 0; i < l; i++)
                h = 31 * h + this.charCodeAt(i);
            return h; 
        }
    };
    
    // Setup Exceptions
    /*for (var e in Exceptions) {
        if (Exceptions.hasOwnProperty(e)) {
            // Instance in the window for try catch if wanted.
            if(window && !window[e])
                window[e] = Exceptions[e];
            
            // Instance with Error.prototype
            if(window[e] == Exceptions[e])
                window[e].prototype = Error.prototype;
            
            // Same for the original.
            Exceptions[e].prototype = Error.prototype;
        }
    }*/
    
    // Intuitive, I know.
    for (var e in Estro)
        if(Estro.hasOwnProperty(e) && Proto[e])
            for(var i in Estro[e])
                if(Estro[e].hasOwnProperty(i) && !Proto[e][i])
                    Proto[e][i] = Estro[e][i];
})();