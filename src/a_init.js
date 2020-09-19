;(function(global, factory){
  if(typeof exports === 'object' && typeof module !== 'undefined')
  	module.exports = factory(global);
  else global.Timeplate = factory(global);
}(typeof window !== "undefined" ? window : this, (function(window){
'use strict'; // Module start

var Combiner = {};