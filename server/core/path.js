var request = require('request');

var Grid = require('./grid');


var retailer;

request('http://localhost:8080/api/retailers/test', function(error, response, body){
  console.log(JSON.parse(body).shelves);
  retailer = JSON.parse(body);

  var gridSize = 5;
  var x1 = Math.min.apply(this, retailer.floorPlan.map(function(item){ return item.x }));
  var y1 = Math.min.apply(this, retailer.floorPlan.map(function(item){ return item.x }));
  var x2 = Math.max.apply(this, retailer.floorPlan.map(function(item){ return item.x }));
  var y2 = Math.max.apply(this, retailer.floorPlan.map(function(item){ return item.x }));

  var grid = new Grid(x2+gridSize, y2+gridSize, gridSize);

  grid.createArea(x1, y1, x2, y2);

  retailer.shelves.map(function(shelf){
    grid.placeItem(shelf.x, shelf.y, shelf.width, shelf.height);
  });

  console.log(grid.toString());

});



var distance = function(path) {

  return path.reduce(function(previous, item){
    if (previous[1].length === 0) {
      previous[1] = item;
    } else {
      var x = item[0]-previous[1][0];
      var y = item[1]-previous[1][1];
      var distance = Math.sqrt((x*x)+(y*y));
      previous[0] += distance;
      previous[1] = item;
    }
    return previous;
  },[0,[]]);

};



// ------------------------------------------
// shortestPath(array of distances)
// ------------------------------------------
// Passed an array of distance values, returns
// array with point order [0,2,4,1,3] - start at 0
// move thru 2 to 4 to 1 end at 3
// - Distance is array of values from item @ position to reference
// item ... e.g. [0,230,130,200,60] = Item 0 is 230 from 1 and 60 from 4

var shortestPath = function(distances) {

  var shortestDistanceMatrix = [];

  for (var i = 0; i < distance.length; i++){
    var shortestDistance = [i];
    var currentDistance = i;
    while (shortestDistance.length != distance.length) {
      shortestDistance.map(function (value) {
        distances[currentDistance][value] = Infinity;
      });

      var nextPosition = distances[currentDistance].indexOf(Math.min.apply(this, distances[currentDistance]));
      shortestDistance.push(nextPosition);
      currentDistance = nextPosition;
    }
    shortestDistanceMatrix.push(shortestDistance);
  }
};
