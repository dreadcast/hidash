;(function(root){
	/**
	 * Useful mixins for Lodash
	 * @Class Hidash
	 * @Module Lodash
	 * @static
	 */
	if(typeof require == 'function'){
		var _ = require('lodash');		
		
		if(typeof exports !== 'undefined' && typeof module !== 'undefined' && module.exports)
			module.exports = _;
	
	} else {
		var _ = root._;
	}
	
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
		 *	@param {Object} obj			Object or array to get penultimate item from
		 *	@return {Mixed}				Penultimate item from provided array
		 */
		penultimate: function(obj){
			return obj.length > 1 ? obj[obj.length - 2] : null;
		},
		
		/**
		 *	Joins items from an array with a different glue before last item
		 *	@method joinLast
		 *	@param {Array} obj			Array to join
		 *	@param {String} glue		Items delimiter
		 *	@param {String} stick		Delimiter before last item
		 *	@return {String}			Joined array
		 */
		joinLast: function(obj, glue, stick){
			var last = obj.pop();
			
			return obj.join(glue) + stick + last;
		},
		
		/**
		 *	Get property from object following provided path 
		 *	@method getFromPath
		 *	@param {Object} obj			Object to get property from
		 *	@param {String} path		Path to property (Dot-delimited)
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
		 *	@param {Object} obj			Destination object
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
		 *	@param {Object} obj			Object to remove property from
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
		
		deepmerge: _.merge,
		
		/**
		 *	Retrieve object's key paired to given property 
		 *	@method keyOf
		 *	@param {Object} obj			Object to get key from
		 *	@param {Mixed} value		Value corresponding to key
		 *	@return {String}			Key or null if no key was found
		 */
		keyOf: function(obj, value){
			for(var key in obj)
				if(Object.prototype.hasOwnProperty.call(obj, key) && obj[key] === value)
					return key;

			return null;
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
			
			return _.contains([null, 'null', undefined, '', false, 'false', 0, '0'], was);
		},
	
		eachParallel: function(arr, iterator, cb, bind){
			var stepsToGo = arr.length,
				cursor = function(){
					stepsToGo--;
					
					if(stepsToGo == 0)
						cb();
				};
			
			if(_.isIterable(arr))
				_.each(arr, function(item, key, index){
					iterator.call(bind || arr, item, key, index, cursor, arr);
				});
			
			else
				_.each(arr, function(item, index){
					iterator.call(bind || arr, item, index, cursor, arr);
				});
		},
		
		/**
		 *	Wait <code>next</code> n ms to call next iteration. Alias: eachInterval
		 *	@method eachDelayed
		 *	@param {Object} obj			Object or array.
		 *	@param {Function} iterator	Iterator, called <code>this.length</code> times.
		 *								Passed arguments are <code>item</code>, <code>index</code>, <code>cursor</code> and <code>Array</code> instance.
		 *	@param {Function} [cb]		Callback executed after last iteration.
		 *	@param {Function} [delay]	Delay between each iteration.
		 *	@param {Object} [bind]	 	Object bound to iterator, default to <code>this</code> instance.
		 *	@return {Array} this		Array instance
		 */
		eachDelayed: function(arr, iterator, cb, delay, bind){
			return _.eachAsync(arr, function(){
				setTimeout(function(){
					iterator.apply(this, arguments);
				}, delay);
			}, cb, bind);
		},
		
		eachInterval: _.eachDelayed,
		
		/**
		 *	Wait <code>next</code> cursor to be called before next iteration
		 *	@method eachAsync
		 *	@param {Object} obj			Object or array.
		 *	@param {Function} iterator	Iterator, called <code>this.length</code> times.
		 *								Passed arguments are <code>item</code>, <code>key</code> (if provided obj is an Object), <code>index</code>, <code>cursor</code> and <code>Array</code> instance.
		 *	@param {Function} [cb]		Callback executed after last iteration.
		 *	@param {Object} [bind]	 	Object bound to iterator, default to <code>this</code> instance.
		 *	@return {Array} this		Array instance
		 *	@example
		 *		_.eachAsync([1, 2, 3, 4], function(item, index, cursor, ar){
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
		 *		_.eachAsync([function(cursor){
		 *			new Request({
		 *				url: '/some/url/123',
		 *				onSuccess: cursor
		 *			}).get();
		 *		}, function(cursor){
		 *			new Request({
		 *				url: '/some/url/456',
		 *				onSuccess: cursor
		 *			}).get();
		 *		}], function(item, index, cursor, ar){
		 *			item(cursor);
		 *		});
		 */
		eachAsync: function(obj, iterator, cb, bind){
			if(_.size(obj) == 0)
				return cb.call(bind);
			
			if(_.isIterable(obj))
				var keys = _.keys(obj),
					values = _.values(obj);
										
			var i = 0,
				loop = function(){
					var cursor;
					
					if(i >= _.size(obj))
						cursor = function(){};
					
					else if(i == _.size(obj) - 1 && _.isFunction(cb))
						cursor = function(){
							cb.call(bind || this);
							loop.call(this);
						}.bind(this);
					
					else if(i < _.size(obj))
						cursor = loop.bind(this);
					
					if(i < _.size(obj)){
						if(_.isIterable(obj))
							iterator.call(bind || this, values[i], keys[i], i, cursor, this);	
						
						else			
							iterator.call(bind || this, this[i], i, cursor, this);	
					}
					
					i++;
				};
				
			loop.call(obj);
			
			return obj;
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
		},
		
		/**
		 *	Attempts to execute function, return false if fails
		 *	@method attempt
		 *	@param {Function} fn		Function to execute
		 *	@param {Mixed} arguments*	Arguments to pass to function
		 *	@return {Mixed} 			Function result or false
		 */
		attempt: function(fn){
			try {
				var args = _.from(arguments);
				args.shift();
				
				return fn.apply(this, args);
			} catch(e){
				return false;
			}
		}
	});
})(Function('return this')());