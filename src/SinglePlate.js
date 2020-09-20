// The other option is browser default
var defaultOption = {fill: 'both', fillOffset: true};
var dummyKeyframe = [{offset:0, dummy:0}, {offset:1, dummy:0}];
var blankKeyframe = new KeyframeEffect(null, null);
var animCache = new WeakMap(); // el => {props:anim data}

// To generate single timeline for many elements
class SinglePlate extends EventPine{
	keyframes = [];
	_in = {};

	constructor(el, keyframes, options){
		super();
		if(el.length === void 0)
			el = [el];

		this.target = el;

		if(options === void 0)
			options = defaultOption;

		if(options.fillOffset === void 0)
			options.fillOffset = defaultOption.fillOffset;

		this._in.speed = 1;

		this.keyframes = keyframes;
		Object.assign(this._in, options);

		var that = this;
		this._in._onfinish = function(){
			that.emit('finish');
			that._in.onfinish && that._in.onfinish();
			that.onfinish && that.onfinish();

			if(that._in.loop)
				that.restart();
		}

		this._in._onemit = function(){
			that.emit(this.emitEv);
			that.onemit && that.onemit(this.emitEv);
		}

		this.updateKeyframe();
	}

	_proxyCall(which){
		var target = this.target;
		for (var i = 0; i < target.length; i++){
			var data = animCache.get(target[i]);
			if(data === void 0){
				this.resetElementData();
				data = animCache.get(target[i]);
			}

			for(var k in data){
				var temp = data[k];
				if(temp.constructor !== Array)
					temp[which]();
				else{
					for (var a = 0; a < temp.length; a++) {
						temp[a][which]();
					}
				}
			}
		}
	}

	_proxySet(which, val){
		var target = this.target;
		for (var i = 0; i < target.length; i++){
			var data = animCache.get(target[i]);
			if(data === void 0){
				this.resetElementData();
				data = animCache.get(target[i]);
			}

			for(var k in data){
				var temp = data[k];
				if(which !== 'duration'){
					if(temp.constructor !== Array)
						temp[which] = val;
					else{
						for (var a = 0; a < temp.length; a++) {
							temp[a][which] = val;
						}
					}
				}
				else{
					if(temp.constructor !== Array)
						temp.effect.updateTiming({duration:val, fill:this._in.fill, easing:this._in.easing, delay:this._in.delay, endDelay:this._in.endDelay, direction:this._in.direction});
					else{
						for (var a = 0; a < temp.length; a++) {
							var offset = temp[a].offset;
							if(this.reverse || this._in.reverse)
								offset = 1 - offset;

							var time = this._in.duration*offset;
							if(time < 2) time = 2;

							temp[a].effect.updateTiming({delay:time-2, duration: 1});
						}
					}
				}
			}
		}
	}

	play(){
		this.resetElementData();
		if(!this.reverse)
			this._proxyCall('play');
		else this._proxyCall('reverse');
	}

	pause(){
		this._proxyCall('pause');
	}

	stop(){
		this._proxyCall('pause');
		this._proxySet('currentTime', 0);
	}

	restart(){
		this._proxySet('currentTime', 0);
		this.play();
	}

	resetElementData(force){
		var target = this.target;
		var emitBuilded = false;
		for (var i = 0; i < target.length; i++) {
			if(!force && target[i]._Timeplate === this)
				continue;

			target[i]._Timeplate = this;

			var data = animCache.get(target[i]);
			if(data === void 0){
				data = {};
				animCache.set(target[i], data);
			}

			var keyframes = this._in.keyframes;
			var ref;
			for(var k in keyframes){
				if(k === 'emit'){
					if(!emitBuilded){
						emitBuilded = true;
						this._buildEmit(target[i], data, keyframes.emit);
					}
					continue;
				}

				ref = data[k];
				if(ref === void 0)
					ref = data[k] = new Animation(new KeyframeEffect(target[i], null));

				ref.effect.setKeyframes(keyframes[k]);
			}

			if(ref === void 0)
				continue;

			if(this._in.duration)
				ref.effect.updateTiming({duration: this._in.duration, fill:this._in.fill, easing:this._in.easing, delay:this._in.delay, endDelay:this._in.endDelay, direction:this._in.direction});

			if(i === 0)
				ref.onfinish = this._in._onfinish;
			else if(k !== 'emit')
				ref.onfinish = void 0;
		}
	}

	_buildEmit(target, data, keyframes){
		if(data.emit === void 0)
			data.emit = new Array(keyframes.length);

		data.emit.length = keyframes.length;

		var ref = data.emit;
		for (var i = 0; i < ref.length; i++) {
			var temp = ref[i];
			if(temp === void 0){
				temp = ref[i] = new Animation(new KeyframeEffect(target, null));
				temp.onfinish = this._in._onemit;
			}

			temp.offset = keyframes[i].offset;
			temp.emitEv = keyframes[i].val;

			temp.effect.setKeyframes(dummyKeyframe);

			if(this._in.duration !== void 0){
				var offset = temp[a].offset;
				if(this.reverse || this._in.reverse)
					offset = 1 - offset;

				var time = this._in.duration*offset;
				if(time < 2) time = 2;

				temp.effect.updateTiming({delay:time-2, duration: 1});
			}
		}
	}

	updateKeyframe(keyframes){
		if(keyframes === void 0)
			keyframes = this.keyframes;

		// Copy before altering value (set the default easing)
		if(this._in.easing !== void 0)
			blankKeyframe.updateTiming({easing:this._in.easing});

		blankKeyframe.setKeyframes(keyframes);
		var copy = blankKeyframe.getKeyframes();

		var emit = [];

		var hasTransform = false;
		var hasFilter = false;
		for (var i = 0; i < copy.length; i++) {
			var frame = copy[i];

			var transform = {};
			Combiner.transform.convert(keyframes[i], transform);

			if(transform.hasTransform){
				transform.offset = frame.computedOffset;
				frame.transform = transform;
				hasTransform = true;
			}

			var filter = {};
			Combiner.filter.convert(keyframes[i], filter);
			if(filter.hasFilter){
				filter.offset = frame.computedOffset;
				frame.filter = filter;
				hasFilter = true;
			}

			if(keyframes[i].emit !== void 0)
				emit.push({offset:frame.computedOffset, val:keyframes[i].emit});
		}

		hasTransform && Combiner.transform.scan(copy, this._in.transformOrder);
		hasFilter && Combiner.filter.scan(copy, this._in.backdropFilter);

		if(this._in.fillOffset){
			var first = copy[0];
			if(first.offset > 0){
				var ref = Object.create(first);
				ref.offset = 0;
				copy.unshift(ref);
			}

			var last = copy[copy.length-1];
			if(first !== last && last.offset < 1){
				var ref = Object.create(last);
				ref.offset = 1;
				copy.push(ref);
			}
		}

		// Fix because composite add haven't been
		// Supported by current modern browser
		var baked = this._in.keyframes = {};
		var lastIndex = copy.length-1;
		for (var i = 0; i < copy.length; i++) {
			var temp = copy[i];
			for(var k in temp){
				if(k === 'composite' || k === 'computedOffset'
				   || k === 'easing' || k === 'offset')
					continue;

				var ref = baked[k];
				if(ref === void 0)
					ref = baked[k] = {};

				if(ref[k] === void 0)
					ref[k] = [];
				ref[k].push(temp[k]);

				if(ref.offset === void 0)
					ref.offset = [];
				ref.offset.push(temp.offset);

				if(i !== lastIndex){
					if(ref.easing === void 0)
						ref.easing = [];
					ref.easing.push(temp.easing);
				}
			}
		}

		if(emit.length !== 0)
			baked.emit = emit;

		this.resetElementData();
	}

	get target(){return this._in.target}
	set target(el){
		if(el.constructor === String)
			el = document.querySelectorAll(el);

		this._in.target = el;
	}

	get fillOffset(){return this._in.fillOffset}
	set fillOffset(val){
		if(this._in.fillOffset === val)
			return;

		this._in.fillOffset = val;
		this.updateKeyframe();
	}

	get duration(){return this._in.duration}
	set duration(val){
		this._in.duration = val;
		this._proxySet('duration', val);
	}

	get loop(){return this._in.loop}
	set loop(val){
		this._in.loop = val;
	}

	get currentTime(){
		var target = this.target;
		for (var i = 0; i < target.length; i++){
			var data = animCache.get(target[i]);
			if(data === void 0)
				return 0;

			for(var k in data)
				return data[k].currentTime;
		}
	}
	set currentTime(val){
		this._proxySet('currentTime', val);
	}

	get speed(){return this._in.speed}
	set speed(val){
		this._in.playbackRate = val;
		this._proxySet('playbackRate', val);
	}
}

// Save it to proto, if other developer need it
Timeplate.proto.SinglePlate = SinglePlate;

// Shortcut
Timeplate.for = function(element, keyframes, options){
    return new Timeplate.proto.SinglePlate(element, keyframes, options);
}