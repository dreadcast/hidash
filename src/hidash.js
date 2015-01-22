;(function(root){
	if(typeof require == 'function'){
		try{
			var _ = require(require('path').resolve('./bower_components/lodash/dist/lodash.js'));		
		} catch(e){
			var _ = require('lodash');		
		}
		
		if(typeof exports !== 'undefined'){
			if(typeof module !== 'undefined' && module.exports)
				exports = module.exports = _;
				
			root._ = _;
		} 
	} else {
		var _ = root._;
	}
	
	var mergeRecursive = function(obj1, obj2){
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
		
		// Cache some _ methods that will be supercharged		
		contains = _.contains,
				
		filter = _.filter;
	
	_.mixin({
		/**
		 *	Creates an array containing passed argument or return argument if it is already an array.
		 *	@method from
		 *	@return {Array}				Created or existing array
		 */
		from: function(arg){
			if(!_.isArray(arg) && !_.isArguments(arg))
				arg = [arg];
			
			return _.toArray(arg);
		},
		
		/**
		 *	Returns penultimate item from an array or null if array contains less than 2 items
		 *	@method penultimate
		 *	@return {Mixed}				Penultimate item from provided array
		 */
		penultimate: function(obj){
			return obj.length > 1 ? obj[obj.length - 2] : null;
		},
		
		/**
		 *	Joins items from an array with a different glue before last item
		 *	@method joinLast
		 *	@param {String} glue		Items delimiter
		 *	@param {String} stick		Delimiter vefore last item
		 *	@return {String}			Joined array
		 */
		joinLast: function(obj, glue, stick){
			var last = obj.pop();
			
			return obj.join(glue) + stick + last;
		},
		
		/**
		 *	Get property from object following provided path 
		 *	@method getFromPath
		 *	@param {String} path		Path to property
		 *	@return {Mixed}				Property
		 */
		getFromPath: function(obj, path){
			path = path.split('.');
				
			for(var i = 0, l = path.length; i < l; i++){
				if (hasOwnProperty.call(obj, path[i]))
					obj = obj[path[i]];
				
				else
					return null;
			}
			
			return obj;
		},
	
		/**
		 *	Set property of object following provided path 
		 *	@method setFromPath
		 *	@param {String} path		Path to property
		 *	@param {Mixed} value		Property value
		 *	@return {Object}			Object
		 */
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
		
		/**
		 *	Removes property of object following provided path 
		 *	@method eraseFromPath
		 *	@param {String} path		Path to property
		 *	@return {Object}			Object
		 */
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
		
		deepmerge: function(){
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
				cursor = function(){
					stepsToGo--;
					
					if(stepsToGo == 0)
						cb();
				};
			
			if(_(arr).isIterable())
				_(arr).each(function(item, key, index){
					iterator.call(bind || arr, item, key, index, cursor, arr);
				});
			
			else
				_(arr).each(function(item, index){
					iterator.call(bind || arr, item, index, cursor, arr);
				});
		},
		
		/**
		 *	Wait <code>next</code> cursor to be called before next iteration
		 *	@method eachAsync
		 *	@param {Function} iterator	Iterator, called <code>this.length</code> times.
		 *								Passed arguments are <code>item</code>, <code>index</code>, <code>cursor</code> and <code>Array</code> instance.
		 *	@param {Function} [cb]		Callback executed after last iteration.
		 *	@param {Object} [bind]	 	Object bound to iterator, default to <code>this</code> instance.
		 *	@return {Array} this		Array instance
		 *	@example
		 *		[1, 2, 3, 4].eachAsync(function(item, index, cursor, ar){
		 *			new Request({
		 *				url: '/rest/' + index,
		 *				onSuccess: function(){
		 *					console.info('item #' + index + ' posted');
		 *					cursor();
		 *				}
		 *			}).post();
		 *		}, function(){ console.info('complete'); })
		 *
		 *		// Works with an array of functions...
		 *		[function(cursor){
		 *			new Request({
		 *				url: '/some/url/123',
		 *				onSuccess: cursor
		 *			}).get();
		 *		}, function(cursor){
		 *			new Request({
		 *				url: '/some/url/456',
		 *				onSuccess: cursor
		 *			}).get();
		 *		}].eachAsync(function(item, index, cursor, ar){
		 *			item(cursor);
		 *		});
		 */
		eachAsync: function(arr, iterator, cb, bind){
			if(_(arr).size() == 0)
				return cb.call(bind);
			
			if(_.isIterable(arr))
				var keys = _.keys(arr),
					values = _.values(arr);
										
			var i = 0,
				loop = function(){
					var cursor;
					
					if(i >= _(arr).size())
						cursor = function(){};
					
					else if(i == _(arr).size() - 1 && _.isFunction(cb))
						cursor = function(){
							cb.call(bind || this);
							loop.call(this);
						}.bind(this);
					
					else if(i < _(arr).size())
						cursor = loop.bind(this);
					
					if(i < _(arr).size()){
						if(_.isIterable(arr))
							iterator.call(bind || this, values[i], keys[i], i, cursor, this);	
						
						else			
							iterator.call(bind || this, this[i], i, cursor, this);	
					}
					
					i++;
				};
				
			loop.call(arr);
			
			return arr;
		},
		
		/**
		 *	Find value closest to given number in an array of numbers 
		 *	@method closest
		 *	@return {Number}			Closest value
		 */
		closest: function(obj, number){		
			if((current = obj.length) < 2)
				return l - 1;
				
			for(var current, previous = Math.abs(obj[--current] - number); current--;)
				if(previous < (previous = Math.abs(obj[current] - number)))
					break;
					
			return obj[current + 1];
		
			var closest = -1,
				prev = Math.abs(obj[0] - number);
			
			for (var i = 1; i < obj.length; i++){
				var diff = Math.abs(obj[i] - number);
				
				if (diff <= prev){
					prev = diff;
					closest = obj[i];
				}
			}
			
			return closest;
		},
		
		/**
		 *	Replace item at index i with given item
		 *	@method replaceAt
		 *	@return {Array}				Array instance
		 */
		replaceAt: function(arr, item, i){
			arr.splice(i, 1, item);
			
			return arr;
		},
		
		/**
		 *	Insert item at index i
		 *	@method insertAt
		 *	@return {Array}				Array instance
		 */
		insertAt: function(arr, item, i){
			arr.splice(i, 0, item);
			
			return arr;
		}
	});
})(Function('return this')());