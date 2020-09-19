// Private Scope
;(function(){'use strict';

function assignTransform(obj, which, pos, val){
	obj.hasTransform = true; // Flag as having a transform property

	if(obj[which] === void 0)
		obj = obj[which] = [];
	else obj = obj[which];

	if(pos === null){
		if(val.constructor === Array){
			obj[0] = val[0];
			obj[1] = val[1] || val[0];

			if(val.length === 3)
				obj[2] = val[2];
		}
		else if(val.constructor === Object){
			if(val.x !== void 0)
				obj[0] = val.x;
			if(val.y !== void 0)
				obj[1] = val.y;
			if(val.z !== void 0)
				obj[2] = val.z;
		}
		else{
			obj[0] = val;
			obj[1] = val;

			if(obj.length === 3)
				obj[2] = val;
		}
	}
	else obj[pos] = val;
}

function convertTransform(source, to){
	// Better performance than using a loop right?

	// Translate
	if(source.translate3d !== void 0)
		assignTransform(to, 'translate', null, source.translate3d);
	if(source.translate !== void 0)
		assignTransform(to, 'translate', null, source.translate);
	if(source.translateX !== void 0)
		assignTransform(to, 'translate', 0, source.translateX);
	if(source.translateY !== void 0)
		assignTransform(to, 'translate', 1, source.translateY);
	if(source.translateZ !== void 0)
		assignTransform(to, 'translate', 2, source.translateZ);

	// Scale
	if(source.scale3d !== void 0)
		assignTransform(to, 'scale', null, source.scale3d);
	if(source.scale !== void 0)
		assignTransform(to, 'scale', null, source.scale);
	if(source.scaleX !== void 0)
		assignTransform(to, 'scale', 0, source.scaleX);
	if(source.scaleY !== void 0)
		assignTransform(to, 'scale', 1, source.scaleY);
	if(source.scaleZ !== void 0)
		assignTransform(to, 'scale', 2, source.scaleZ);

	// Rotate
	if(source.rotate3d !== void 0)
		assignTransform(to, 'rotate', null, source.rotate3d);
	if(source.rotate !== void 0)
		assignTransform(to, 'rotate', null, source.rotate);
	if(source.rotateX !== void 0)
		assignTransform(to, 'rotate', 0, source.rotateX);
	if(source.rotateY !== void 0)
		assignTransform(to, 'rotate', 1, source.rotateY);
	if(source.rotateZ !== void 0)
		assignTransform(to, 'rotate', 2, source.rotateZ);

	// Skew
	if(source.skew !== void 0)
		assignTransform(to, 'skew', null, source.skew);
	if(source.skewX !== void 0)
		assignTransform(to, 'skew', 0, source.skewX);
	if(source.skewY !== void 0)
		assignTransform(to, 'skew', 1, source.skewY);
}

var transOrder = ['translate', 'scale', 'rotate', 'skew'];
function transformToString(obj, transformOrder){
	if(transformOrder === void 0)
		transformOrder = transOrder;

	var str = '';
	for (var i = 0; i < transformOrder.length; i++) {
		var k = transformOrder[i];
		var val = obj[k];
		if(val === void 0)
			continue;

		if(val[0] !== void 0)
			str += `${k}X(${val[0].val + val[0].unit}) `;
		if(val[1] !== void 0)
			str += `${k}Y(${val[1].val + val[1].unit}) `;
		if(val[2] !== void 0)
			str += `${k}Z(${val[2].val + val[2].unit}) `;
	}

	return str;
}

// Fix for fixing browser's transform limitation
// CSS also have `filter` too instead `transform`
function scanSingleTransform(_frame, which, _old, _tobeNormalized){
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
			frame[i] = {val: Number(temp[1]), unit: temp[2], offset};
		}

		// ToDo: tidy up
		if(tobeNormalized !== void 0){
			var x,y,z; // value
			var xUnit,yUnit,zUnit; // unit
			var xOld,yOld,zOld; // old data

			xOld = old[0];
			if(xOld !== void 0 && frame[0] !== void 0){
				xUnit = frame[0].unit || xOld.unit;
				x = (frame[0].val - xOld.val)/(frame[0].offset - xOld.offset);
			}

			yOld = old[1];
			if(yOld !== void 0 && frame[1] !== void 0){
				yUnit = frame[1].unit || yOld.unit;
				y = (frame[1].val - yOld.val)/(frame[1].offset - yOld.offset);
			}

			zOld = old[2];
			if(zOld !== void 0 && frame[2] !== void 0){
				zUnit = frame[2].unit || zOld.unit;
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
			}

			// ToDo, in blackprint this was OK, but on test this was incorrect
			tobeNormalized.length = 0;
		}

		var older = _old[which];
		if(older === void 0)
			older = _old[which] = [];

		for (var i = 0; i < frame.length; i++) {
			if(frame[i] !== void 0)
				older[i] = frame[i];
		}
	}

	if(old !== void 0){
		if(tobeNormalized === void 0)
			tobeNormalized = _tobeNormalized[which] = [];

		tobeNormalized.push(_frame);
	}
}

function scanTransform(frames, transformOrder){
	var old = {};
	var tobeNormalized = {};
	for (var i = 0; i < frames.length; i++) {
		var frame = frames[i].transform;
		if(frame === void 0)
			frame = frames[i].transform = {};

		frame.offset = frames[i].computedOffset;
		scanSingleTransform(frame, 'translate', old, tobeNormalized);
		scanSingleTransform(frame, 'scale', old, tobeNormalized);
		scanSingleTransform(frame, 'rotate', old, tobeNormalized);
		scanSingleTransform(frame, 'skew', old, tobeNormalized);
	}

	// Apply all filter from final frame
	that:for(var k in old){
		for (var i = frames.length - 1; i >= 0; i--) {
			var frame = frames[i].transform;
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
		frame.transform = transformToString(frame.transform, transformOrder);
	}
}

Combiner.transform = {
	convert: convertTransform,
	scan: scanTransform
};

// End of private scope
})();