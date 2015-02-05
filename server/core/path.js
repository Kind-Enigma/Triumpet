



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

