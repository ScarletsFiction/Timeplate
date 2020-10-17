<a href='https://patreon.com/stefansarya'><img src='https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.herokuapp.com%2Fstefansarya%2Fpledges&style=for-the-badge' height='20'></a>
[![Software License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)
[![](https://data.jsdelivr.com/v1/package/npm/timeplate/badge)](https://www.jsdelivr.com/package/npm/timeplate)
[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=A%20modern%20animation%20timeline%20built%20for%20performance%20and%20simplify%20some%20complex%20usage%20for%20animator%20needs.&url=https://github.com/ScarletsFiction/Timeplate&via=github&hashtags=timeplate,animation,library,browser,html5)

# Timeplate
A modern animation timeline built for performance and simplify some complex usage for animator needs.

Dependent on EventPine as Event Manager.<br>
Currently supported on Chrome >= v84 and Firefox >= v63

```html
<script src="https://cdn.jsdelivr.net/npm/eventpine@1.0.3"></script>
<script src="https://cdn.jsdelivr.net/npm/timeplate@0.0.2"></script>
```

To avoid error on older browser please put this on your HTML header's script.
```js
if(KeyframeEffect.prototype.setKeyframes === void 0){
  KeyframeEffect.prototype.setKeyframes = function(){}
  KeyframeEffect.prototype.getKeyframes = function(){return [{}]}
}
```

### Example
Some feature still being improved and undocumented yet.<br>
Being used by StefansArya for some project.<br>
If you're interested with this library please reach me on GitHub to update the documentation.<br>

#### Timeline for selected elements
Any animateable CSS can used for keyframe, including filter (blur, hueRotate, etc).

```js
var plate = Timeplate.for(/* El Selector */ '.Apple', /* Keyframes */[
  {offset:0  , translateX: '50px', scaleY: 1, easing: 'ease-in'},
  {offset:0.1, translateX: '120px'},
  {offset:0.5, translateX: '100px', emit: "I'm triggered"},
  {offset:1  , translateX: '75px', scaleY: 0.5},
], {duration: 1000});

// plate.duration = 1000;

plate.on("I'm triggered", function(){
  console.log("Henlo", plate.currentTime);
});

// plate.currentTime = 100; -> 100ms = offset 0.1
// Will immediately play from 100ms if above was set

plate.play();
```

#### Parallel Timeline
Animate every timeline parallely.

```js
var plate = Timeplate.parallel(/* Default duration for one timeline */ 1000);
plate.timeline = [
  Timeplate.for(/* El Selector */ '.Apple', /* Keyframes */[
    {offset:0  , translateX: '50px', scaleY: 1, easing: 'ease-in'},
    {offset:0.1, translateX: '120px'},
    {offset:0.5, translateX: '100px', emit: "I'm triggered"},
    {offset:1  , translateX: '75px', scaleY: 0.5},
  ]),
  Timeplate.for('.Orange', [
    {offset: 0.5, translateX: '75px', scaleY: 0.5, easing: 'ease-in'},
    {offset: 1  , translateX: '50px', scaleY: 1},
  ]),
];

plate.on("I'm triggered", function(){
	console.log("Henlo", plate.currentTime);
});

// plate.currentTime = 100; -> 100ms = offset 0.1
// Will immediately play from 100ms if above was set

plate.play();
```

#### Series Timeline
Animate ordered timeline from first index and continue to another timeline.

```js
var plate = Timeplate.series(/* Default duration for a timeline if not set */ 1000);
plate.timeline = [
  Timeplate.series(/* El Selector */ '.Apple', /* Keyframes */[
    {offset:0  , translateX: '50px', scaleY: 1, easing: 'ease-in'},
    {offset:0.1, translateX: '120px'},
    {offset:0.5, translateX: '100px', emit: "I'm triggered"},
    {offset:1  , translateX: '75px', scaleY: 0.5},
  ]),
  Timeplate.for('.Orange', [
    {offset: 0.5, translateX: '75px', scaleY: 0.5, easing: 'ease-in'},
    {offset: 1  , translateX: '50px', scaleY: 1},
  ]),
];

plate.on("I'm triggered", function(){
  console.log("Henlo", plate.currentTime);
});

// plate.currentTime = 100; -> 100ms = offset 0.1
// Will immediately play from 100ms if above was set

plate.play();
```

#### Combined Timeline
Play your ordered timeline inside of a timeline easily.

```js
/*
             Series 1 Timeplate

                [Parallel 1]
 [Series 2] --> [Parallel 2] --> [Series 3]
                [Parallel 3]
 */

var Series1 = Timeplate.series(1000);
Series1.timeline = [
  // Series 2
  Timeplate.series(1000, [
    Timeplate.for(...), // Dummy element animation maybe..
  ]),

  // Parallel 1,2,3
  Timeplate.parallel(1000, [
    Timeplate.for(...), // Playing together
    Timeplate.for('.element', [ // Playing together
      {offset: 0.5, emit:"middle animation"}
    ]),
    Timeplate.for(...), // Playing together
  ]),

  // Series 3 (Will be played after Series 2)
  Timeplate.series(1000, [
    Timeplate.for(...),
    Timeplate.for(...),
  ]),
];

Series1.on('middle animation', function(){
  // May be inaccurate
  //                      Series 1 + Paralel * 0.5
  Series1.currentTime === 1000     + 500;
});

Series1.play();
```

### License
Timeplate is under MIT License

But don't forget to put a link to the repository, or share it maybe.