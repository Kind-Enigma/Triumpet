

// ------------------------------------------------
// Grid object
// ------------------------------------------------
// Takes a W x H area and divides it into gridSize
// grids.
// Grid can be passed to pathfinding algo's to solve shortest
// path problems.
// Defaults to value 1 == unwalkable in pathfinding


var Grid = function(width, height, gridSize, value) {
  this.grid = [];
  this.gridSize = gridSize;

  value = value || 1;

  for (var y = 0; y < Math.floor(height / gridSize); y++) {
    this.grid.push([]);
    for (var x = 0; x < Math.floor(width / gridSize); x++) {
      this.grid[y].push(value);
    }
  }

};

// -------------------------------
// createArea
// -------------------------------
// Creates an area defined by (x, y, toX, toY)
// as absolute co-ordinates and sets value. Defaults
// to 0 which will create areas that can be walked

Grid.prototype.createArea = function(x1, y1, x2, y2, value) {
  value = value || 0;

  for (var j = Math.floor(y1 / this.gridSize); j < Math.floor(y2 / this.gridSize); j++) {
    for (var i = Math.floor(x1 / this.gridSize); i < Math.floor(x2 / this.gridSize); i++) {
      this.grid[i][j] = value;
    }
  }
};