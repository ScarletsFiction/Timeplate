class Timeplate extends EventPine{
	constructor(duration, timeline){
		super();

		// For internal use only
		var that = this;
		this._in = {
			timeline: [],
			currentTime: 0,
			reverse: false,
			_onemit:function(msg){
				that.emit(msg);
			},
			_onfinish:function(){
				that.emit('finish');
			}
		};

		if(duration && duration.constructor === Number)
			this.duration = duration;
		if(timeline)
			this.timeline = timeline;
	}

	get currentTime(){
		if(this._in.timeline.length === 0)
			return this._in.currentTime;
		return this._in.timeline[0].currentTime;
	}

	set currentTime(val){
		if(this._in.timeline.length === 0){
			this._in.currentTime = val;
			return;
		}

		var timeline = this._in.timeline;
		for (var i = 0; i < timeline.length; i++)
			timeline[i].currentTime = val;
	}

	get reverse(){return this._in.reverse}
	set reverse(val){
		this._in.reverse = val;
		this._refresh();
	}

	_refresh(){
		var timeline = this._in.timeline;
		if(timeline.length === 0) return;

		var currentTime = timeline[0].currentTime;
		var duration = this._in.duration;

		for (var i = 0; i < timeline.length; i++){
			var temp = timeline[i];
			temp.currentTime = currentTime;
			temp.duration = duration;
			temp.reverse = this._in.reverse;
			temp.fillOffset = false;
			temp.onemit = this._in._onemit;
		}

		temp.onfinish = this._in._onfinish;
	}

	get duration(){return this._in.duration}
	set duration(val){
		this._in.duration = val;
		this._refresh();
	}

	get timeline(){return this._in.timeline}
	set timeline(val){
		if(this._in.timeline.length !== 0)
			this._in.currentTime = this._in.timeline[0].currentTime;

		this._in.timeline = val;
		val[0].currentTime = this._in.currentTime;

		this._refresh();
	}

	_proxy(name){
		this.emit(name);

		var timeline = this.timeline;
		for(var i=0; i<timeline.length; i++)
			timeline[i][name]();
	}

	_proxySet(name, val){
		this.emit(name);

		var timeline = this.timeline;
		for(var i=0; i<timeline.length; i++)
			timeline[i][name] = val;
	}

	get loop(){return this._in.loop}
	set loop(val){
		this._in.loop = val;
		this._proxySet('loop', val);
	}

	play(){
		this._refresh();
		this._proxy('play');
	}

	pause(){this._proxy('pause')}
	stop(){this._proxy('stop')}
	restart(){this._proxy('restart')}
}

Timeplate.proto = {};