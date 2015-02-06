var request = require('request');
var pf = require('pathfinding');
var Grid = require('./grid');


var Path = function(retailerObject, items, userLocation) {
  var gridSize = 5;
  var retailer = retailerObject;

  // get x,y - x2, y2 from coords
  var x1 = Math.min.apply(this, retailer.floorPlan.map(function(item){ return item.x }));
  var y1 = Math.min.apply(this, retailer.floorPlan.map(function(item){ return item.x }));
  var x2 = Math.max.apply(this, retailer.floorPlan.map(function(item){ return item.x }));
  var y2 = Math.max.apply(this, retailer.floorPlan.map(function(item){ return item.x }));

  // create GRID
  this.matrix = new Grid(x2+gridSize, y2+gridSize, gridSize);
  // add walking floor area
  this.matrix.createArea(x1, y1, x2, y2);

  // add shelves as non-walking area
  var that = this;
  result.shelves.map(function(shelf){
    that.matrix.placeItem(shelf.x, shelf.y, shelf.width, shelf.height);
  });


  // find paths
  this.paths = [];

  var pfGrid = new pf.Grid(this.matrix.size('x'), this.matrix.size('y'), this.matrix.grid);

  for (var i = 0; i < items.length; i++) {
    var itemPath = [];
    for (var j = 0; j < items.length; j++) {
      if (i === j) {
        itemPath.push(0);
        continue;
      } else {
        var tempPFGrid = pfGrid.clone();
        var finder = new pf.AStarFinder({ allowDiagonal: true, dontCrossCorners: true });

        var path = finder.findPath(items[i][1], items[i][0], items[j][1], items[j][0], tempPFGrid );
        itemPath.push(path);
      }
    }
    this.paths.push(itemPath);
    itemPath = [];
  }

  // find distances
  this.distances = [];
  for (var i = 0; i < this.paths.length; i++) {
    var pathDistance = [];
    for (var j = 0; j < this.paths.length; j++) {
      if (i === j) {
        pathDistance.push(0);
        continue;
      } else {
        pathDistance.push(distance(this.paths[i][j])[0]);
      }
    }
    this.distances.push(pathDistance);
    pathDistance = [];
  }


  this.shortestPaths = [];

  for (var i = 0; i < this.distances.length; i++) {
    var shortest = shortestPath(this.distances);
    this.shortestPaths.push(shortest);
  }

  this.shortestCoords = [];

  for (var i = 0; i < shortest[0].length; i++) {

  }


};



// converts pixel coords to grid positions
var pixelsToGrid = function(items) {
  var gs = 5;
  return items.map(function(item){
    return [item[0] / gs, item[1] / gs];
  });
};

// coverts grid positions to pixel (mid point) positions
var gridToPixels = function(items) {
  var gs = 5;
  return items.map(function(item){
    var mid = gs >>> 1;
    return [item[0]*gs + mid, item[1]*gs + mid];
  });
};

Path.prototype.getShortestPath = function() {
  var result = [];
  for (var i = 1; i < this.shortestPaths[0].length; i++){
    var start = this.shortestPaths[0][i-1];
    var end = this.shortestPaths[0][i];

    result = result.concat(this.paths[start][end])
  }
  return result;
};


request('http://localhost:8080/api/retailers/test', function(error, response, body) {
  result = JSON.parse(body);
  var items = [[30,30], [285,85], [85, 195], [45, 45], [300, 205]];
  items = pixelsToGrid(items);

  var path = new Path(result, items);

  //console.log(path.paths[0][3]);
  //console.log(path.distances[0][3]);
  //console.log(path.paths[3][2]);
  //console.log(path.distances[3][2]);

  //path.matrix.setPosition(6,6,' ');
  //console.log(path.matrix.toString());

  //console.log(path.distances);

  //console.log(path.shortestPaths);

  console.log(path.getShortestPath());
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

  //var shortestDistanceMatrix = [];

  //for (var i = 0; i < distances.length; i++){
    var shortestDistance = [0];
    var currentDistance = 0;
    while (shortestDistance.length != distances.length) {
      shortestDistance.map(function (value) {
        distances[currentDistance][value] = Infinity;
      });

      var nextPosition = distances[currentDistance].indexOf(Math.min.apply(this, distances[currentDistance]));
      shortestDistance.push(nextPosition);
      currentDistance = nextPosition;
    }
    //shortestDistanceMatrix.push(shortestDistance);
  //}

  return shortestDistance;
};
