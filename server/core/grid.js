

// ------------------------------------------------
// Grid object
// ------------------------------------------------
// Takes a W x H area and devides it into gridSize
// grids.
// Grid can be passed to pathfinding algo's to solve shortest
// path problems


var CreateGrid = function(width, height, gridSize, value) {
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