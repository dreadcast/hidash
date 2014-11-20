(function(){
	var _ = require('lodash'),
		mergeRecursive = function(obj1, obj2){
			for(var p in obj2){
				try {
					if(_.isArray(obj1[p]) && _.isArray(obj2[p]))
						obj1[p] = _.union(obj1[p], obj2[p]);
					
					// Property in destination object set; update its value.
					else if(obj2[p].constructor == Object)
						obj1[p] = mergeRecursive(obj1[p], obj2[p]);
					
					else
						obj1[p] = obj2[p];		
				} catch(e){
					// Property in destination object not set; create it and set its value.
					obj1[p] = obj2[p];
				}
			}
			
			return obj1;
		},
				
		contains = _.contains,
				
		filter = _.filter;
	
	var root = this;
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = _;
		}
		exports._ = _;
	} else {
		root._ = _;
	}
	
	_.mixin({
		/**
		 *	Array
		 */
		from: function(arg){
			if(!_.isArray(arg) && !_.isArguments(arg))
				arg = [arg];
			
			return _.toArray(arg);
		},
		
		penultimate: function(obj){
			return obj.length > 1 ? obj[obj.length - 2] : null;
		},
		
		joinLast: function(obj, glue, stick){
			var last = obj.pop();
			
			return obj.join(glue) + stick + last;
		},
		
		/**
		 *	Object
		 */
		getFromPath: function(obj, path){
			if (typeof path == 'string')
				path = path.split('.');
				
			for(var i = 0, l = path.length; i < l; i++){
				if (hasOwnProperty.call(obj, path[i]))
					obj = obj[path[i]];
				
				else
					return null;
			}
			
			return obj;
		},
	
		setFromPath: function(obj, path, value){
			var parts = path.split('.'),
				cl = obj;
			
			for(var i = 0, l = parts.length; i < l; i++){
				// So when the value does not exist (and is an own property) or is not an object
				if(i < (l - 1) && !obj.hasOwnProperty(parts[i]))
					obj[parts[i]] = {};
		
				if(i == l - 1)
					obj[parts[i]] = value;
				
				else
					obj = obj[parts[i]];
			}
			
			return cl;
		},
		
		eraseFromPath: function(obj, path){
			var parts = path.split('.'),
				cl = obj;
			
			for(var i = 0, l = parts.length; i < l; i++){
				if (!obj.hasOwnProperty(parts[i])){
					break;
				
				} else if (i < l - 1){
					obj = obj[parts[i]];
					
				} else if(i == l - 1){
					delete obj[parts[i]];
					break;
				}
			}
			
			return cl;
		},
		
		keyOf: function(obj, value){
			var filtered = _(obj).filter(function(value2, key2){
				return value2 == value;
			});
			
			if(_.size(filtered) > 0)
				return _.keys(filtered)[0];
			
			return null;
		},
		
		contains: function(obj, was, strict){
			if(_.isArray(obj))
				return contains(obj, was);
			
			for(var prop in obj)
				if(_[strict ? 'isEqual' : 'isLaxEqual'](obj[prop], was))
					return true;
			
			return false;
		},
		
		merge: function(){
			var obj1 = arguments[0];
			
			for(var q = 1; q < arguments.length; q++)
				mergeRecursive(obj1, arguments[q]);
							
			return obj1;
		},
		
		filter: function(obj, iterator, bind){
			if(_.isArray(obj))
				return filter(obj, iterator, bind);
			
			var tmp = {};
			
			_(obj).each(function(item, key){
				if(iterator(item, key))
					tmp[key] = item;
			}, bind || obj);
			
			return tmp;
		},
		
		/**
		 *	Utils
		 */
		isLaxEqual: function(a, b){
			if(_.isArray(a))
				a = _.uniq(a.sort());
				
			if(_.isArray(b))
				b = _.uniq(b.sort());
			
			return _.isEqual(a, b);
		},
		
		isIterable: function(was){
			return _.isObject(was) && !_.isFunction(was) && !_.isArray(was);
		},
		
		isJson: function(was){
			return _.isString(was) && _.isObject(JSON.parse(was));
		},
		
		isClass: function(obj){
			return obj.name == 'Class';
		},
		
		isInstance: function(obj){
			return obj.constructor.name == 'Class';			
		},
		
		isShit: function(was){
			if(_.isArray(was) && _compact(was).length == 0)
				return true;
			
			return _([null, 'null', undefined, '', false, 'false', 0, '0']).contains(was);
		},
	
		eachParallel: function(arr, iterator, cb, bind){
			var stepsToGo = arr.length,
				done = function(){
					stepsToGo--;
					
					if(stepsToGo == 0)
						cb();
				};
			
			_(arr).each(function(item, index){
				iterator.call(bind || arr, item, index, done, arr);
			});
		},
		
		eachAsync: function(arr, iterator, cb, bind){
			if(arr.length == 0)
				return arr;
			
			var i = 0,
				loop = function(){
					var cursor;
					
					if(i >= this.length)
						cursor = function(){};
					
					else if(i == this.length - 1 && typeOf(cb) == 'function')
						cursor = function(){
							cb.call(bind || this);
							loop.call(this);
						}.bind(this);
					
					else if(i < this.length)
						cursor = loop.bind(this);
					
					if(i < this.length)
						iterator.call(bind || this, this[i], i, cursor, this);				
					
					i++;
				};
				
			loop.call(arr);
			
			return arr;
		}
	});
})();