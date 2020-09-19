// Ordered Timeplate that run in series
class SeriesPlate{

}

// Save it to proto, if other developer need it
Timeplate.proto.SeriesPlate = SeriesPlate;

// Shortcut
Timeplate.order = function(element, keyframes, options){
    return new Timeplate.proto.SeriesPlate(element, keyframes, options);
}