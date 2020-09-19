var internal = {
	// From https://cubic-bezier.com
	"ease": [0.25, 0.1, 0.25, 1],
	"linear": [0, 0, 1, 1],
	"easeIn": [0.42, 0, 1, 1],
	"easeOut": [0, 0, 0.58, 1],
	"easeInOut": [0.42, 0, 0.58, 1],

	// From https://easings.net
	'easeInSine' : [0.12, 0, 0.39, 0],
	'easeOutSine' : [0.61, 1, 0.88, 1],
	'easeInOutSine' : [0.37, 0, 0.63, 1],
	'easeInQuad' : [0.11, 0, 0.5, 0],
	'easeOutQuad' : [0.5, 1, 0.89, 1],
	'easeInOutQuad' : [0.45, 0, 0.55, 1],
	'easeInCubic' : [0.32, 0, 0.67, 0],
	'easeOutCubic' : [0.33, 1, 0.68, 1],
	'easeInOutCubic' : [0.65, 0, 0.35, 1],
	'easeInQuart' : [0.5, 0, 0.75, 0],
	'easeOutQuart' : [0.25, 1, 0.5, 1],
	'easeInOutQuart' : [0.76, 0, 0.24, 1],
	'easeInQuint' : [0.64, 0, 0.78, 0],
	'easeOutQuint' : [0.22, 1, 0.36, 1],
	'easeInOutQuint' : [0.83, 0, 0.17, 1],
	'easeInExpo' : [0.7, 0, 0.84, 0],
	'easeOutExpo' : [0.16, 1, 0.3, 1],
	'easeInOutExpo' : [0.87, 0, 0.13, 1],
	'easeInCirc' : [0.55, 0, 1, 0.45],
	'easeOutCirc' : [0, 0.55, 0.45, 1],
	'easeInOutCirc' : [0.85, 0, 0.15, 1],
	'easeInBack' : [0.36, 0, 0.66, -0.56],
	'easeOutBack' : [0.34, 1.56, 0.64, 1],
	'easeInOutBack' : [0.68, -0.6, 0.32, 1.6],

	// ToDo: Add support Bounce and Elastic easing
};

// C = [x1, y1, x2, y2];
// result = from + bezier * (target - from);
function bezier(Crv, t){ // t = 0 ~ 1
	if(Crv.bezierY === void 0)
		Crv.bezierY = bezierY;

	return Crv.bezierY(t);
}

function bezierY(t){
	// Saving my experiment data here for my future sample data reference
	// on where formula used on this function coming from
	//
	//       b
	// |p   /|
	// | .~' |
	// |/   q|
	// a
	//
	// points = [a, b]; -> curve begin (a) and curve end (b)
	// points = [{x: 20, y: 350}, {x: 320, y: 50}]; -> sample point (bottom left is zero)
	//
	// points = [p, q]; -> 2 point bezier curve control
	// points = [{x: 20, y: 50}, {x: 320, y: 350}];
	// points = [{x: 0, y: 1}, {x: 1, y: 0}]; -> Assume it with sample point as max/min
	// Crv = [0,1,1,0] -> I just need the y axes, so it just index 1 and 3
	//
	// B(t) = ..some formula still being hidden..
	//      = ..u may not find this anywhere in years < 2020.. lol
	//      = ..mybe I'll write article later, but currently I jst want to program..
	//      = c1*t + c1*t + c3*t*t - 2*c1*t*t
	//      = 2*c1*t + c3*t*t - 2*c1*t*t
	//      = (2*c1 + (c3 - 2*c1)*t)*t

	// If you copy this code or learn from my experiment above
	// Put a link to this repository on your source code :3
	return (2*this[1] + (this[3] - 2*this[1])*t)*t;
}