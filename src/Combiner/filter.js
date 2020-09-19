// Private Scope
;(function(){'use strict';

var filterOrder = ['blur', 'dropShadow', 'brightness', 'contrast', 'hueRotate', 'grayscale', 'invert', 'saturate', 'sepia'];
function convertFilter(source, to){
	// We will use loop here (different from the "transform" version)
	for (var i = 0; i < filterOrder.length; i++) {
		var which = filterOrder[i];

		if(source[which] === void 0)
			continue;

		to.hasFilter = true; // Flag as having a filter property
		if(which !== 'dropShadow')
			to[which] = [source[which]]; // ToDo: improve and don't allocate array

		// Only drop shadow that have multiple value on single property
		else to[which] = source[which].split(' ');
	}
}

function filterToString(obj){
	var str = '';

	for (var i = 0; i < filterOrder.length; i++) {
		var k = filterOrder[i];
		var val = obj[k];
		if(val === void 0)
			continue;

		if(k === 'hueRotate') k = 'hue-rotate';

		if(val.length === 1)
			str += `${k}(${val[0].val + val[0].unit}) `;

		// Drop shadow
		// ToDo: support for drop-shadow RGBA or HSV for color value
		else str += `drop-shadow(${val[0].val + val[0].unit} ${val[1].val + val[1].unit} ${val[2].val + val[2].unit} ${val[3]}) `;
	}

	return str;
}

// Fix for fixing browser's filter limitation
function scanSingleFilter(_frame, which, _old, _tobeNormalized){
	var frame = _frame[which];
	var old = _old[which];
	var offset = _frame.offset;
	var tobeNormalized = _tobeNormalized[which];

	if(frame !== void 0){
		for (var i = 0; i < frame.length; i++) {
			var ref = frame[i];
			if(ref === void 0 || ref.constructor === Object)
				continue;

			if(ref.constructor !== String){
				frame[i] = {val: Number(ref), unit:'', offset};
				continue
			}

			var temp = ref.match(/([\-0-9.]+)([a-z%]+|$)/);
			if(temp !== null)
				frame[i] = {val: Number(temp[1]), unit: temp[2], offset};

			// drop-shadow
			else frame[i] = ref;
		}

		// ToDo: tidy up
		if(tobeNormalized !== void 0){
			var x,y,z; // value
			var xUnit,yUnit,zUnit; // unit
			var xOld,yOld,zOld; // old data

			xOld = old[0];
			if(xOld !== void 0 && frame[0] !== void 0){
				xUnit = frame[0].unit || xOld.val;
				x = (frame[0].val - xOld.val)/(frame[0].offset - xOld.offset);
			}

			yOld = old[1];
			if(yOld !== void 0 && frame[1] !== void 0){
				yUnit = frame[1].unit || yOld.val;
				y = (frame[1].val - yOld.val)/(frame[1].offset - yOld.offset);
			}

			zOld = old[2];
			if(zOld !== void 0 && frame[2] !== void 0){
				zUnit = frame[2].unit || zOld.val;
				z = (frame[2].val - zOld.val)/(frame[2].offset - zOld.offset);
			}

			for (var i = 0; i < tobeNormalized.length; i++) {
				var ref = tobeNormalized[i];
				var current = ref[which];

				if(current === void 0)
					current = ref[which] = [];

				if(x !== void 0){
					var o = ref.offset - xOld.offset;
					if(current[0] === void 0)
						current[0] = {val:x*o+xOld.val, unit:xUnit, offset};
					else
						current[0].val = x*o+xOld.val;
				}

				if(y !== void 0){
					var o = ref.offset - yOld.offset;
					if(current[1] === void 0)
						current[1] = {val:y*o+yOld.val, unit:yUnit, offset};
					else
						current[1].val = y*o+yOld.val;
				}

				if(z !== void 0){
					var o = ref.offset - zOld.offset;
					if(current[2] === void 0)
						current[2] = {val:z*o+zOld.val, unit:zUnit, offset};
					else
						current[2].val = z*o+zOld.val;
				}

				// Drop shadow color
				// ToDo: support for drop-shadow RGBA or HSV for color value
				if(old.length !== 1)
					current[3] = old[3];
			}

			// ToDo, in blackprint this was OK, but on test this was incorrect
			tobeNormalized.length = 0;
		}

		var temp = _old[which];
		if(temp === void 0)
			temp = _old[which] = [];

		for (var i = 0; i < frame.length; i++) {
			if(frame[i] !== void 0)
				temp[i] = frame[i];
		}
	}

	if(old !== void 0){
		if(tobeNormalized === void 0)
			tobeNormalized = _tobeNormalized[which] = [];

		tobeNormalized.push(_frame);
	}
}

function scanFilter(frames, isBackdropFilter){
	var old = {};
	var tobeNormalized = {};

	for (var i = 0; i < frames.length; i++) {
		var frame = frames[i].filter;
		if(frame === void 0)
			frame = frames[i].filter = {};

		frame.offset = frames[i].computedOffset;

		for (var a = 0; a < filterOrder.length; a++)
			scanSingleFilter(frame, filterOrder[a], old, tobeNormalized);
	}

	// Apply all filter from final frame
	that:for(var k in old){
		for (var i = frames.length - 1; i >= 0; i--) {
			var frame = frames[i].filter;
			if(frame[k] === void 0)
				frame[k] = old[k];
			else{
				delete old[k];
				continue that;
			}
		}
	}

	for (var i = 0; i < frames.length; i++){
		var frame = frames[i];
		if(isBackdropFilter){
			frame.backdropFilter = filterToString(frame.filter);
			delete frame.filter;
		}
		else
			frame.filter = filterToString(frame.filter);
	}
}

Combiner.filter = {
	convert: convertFilter,
	scan: scanFilter
};

// End of private scope
})();