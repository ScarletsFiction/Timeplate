// Ordered Timeplate that run in series
class SeriesPlate extends EventPine{
	constructor(duration, timeline){
		super();

		// For internal use only
		var that = this;
		this._in = {
			timeline: [],
			currentTime: 0,
			index: 0,
			current: null,
			reverse: false,
			_onemit(msg){
				that.emit(msg);
			},
			_onfinish(){
				that.emit('finish');
			}
		};

		if(duration && duration.constructor === Number)
			this.duration = duration;
		if(duration && duration.constructor === Array || timeline)
			this.timeline = timeline;
	}

	get currentTime(){
		if(this._in.current === null)
			return this._in.currentTime;
		return this._in.current.currentTime;
	}

	set currentTime(val){
		var time = 0;
		const {timeline} = this._in;

		for (var i = 0; i < timeline.length; i++) {
			time += timeline[i].duration;
			if(time > val){
				time -= timeline[i].duration;
				break;
			}
		}

		timeline[i-1].currentTime = val - time;
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
	}

	get loop(){return this._in.loop}
	set loop(val){
		this._in.loop = val;
		this._in.current.loop = val;
	}

	play(){
		this._refresh();
		this._in.current.play();
	}

	pause(){this._in.current.pause()}
	stop(){this._in.current.stop()}
	restart(){this._in.current.restart()}
}

// Save it to proto, if other developer need it
Timeplate.proto.SeriesPlate = SeriesPlate;

// Shortcut
Timeplate.series = function(element, keyframes, options){
    return new Timeplate.proto.SeriesPlate(element, keyframes, options);
}