angular.module('tp.map',[])

.controller('MapCtrl', function($scope, $http, $stateParams, Map, Item){
  // Makes properties on scope/map/item accessible within html.
  angular.extend($scope, Map, Item);

  $scope.scale =  14.5;
  $scope.userLoc;
  $scope.items;
  $scope.selectedItem = '';
  $scope.floorPlan;

  //Initializes the map by fetching retailer information.
  if ($stateParams.retailer) {
    var retailer = $stateParams.retailer;
    Map.fetch($stateParams.retailer)
      .then(function(data){
        $scope.data = data;
        Item.fetchItems($stateParams.retailer)
          .then(function(items){
            $scope.items = items;
            $scope.render();
          })
      })
  }

  $scope.render = function(){
    Map.drawFloorPlan($scope.data.floorPlan, $scope.scale, $scope.svg);
    Map.drawShelves($scope.data.shelves, $scope.scale, $scope.svg);
  }
})

// Used to render and update the svg map.
.directive('tpMap', function($window){

  // Defines linker function to be referenced in the directives return object.
  var linker = function(scope, element, attrs) {
    // Appends the SVG.
    scope.svg  = 
      d3.select('.map-main').append('svg')
        .attr('id', 'user-map')
        .attr('width', 30 * scope.scale + 'px' ) // [Warning]: 30 is a hardcoded width for this particular map, this is has to be changed to accomodate different maps
        .attr('height', 20 * scope.scale + 'px') // [Warning]: 20 is a hardcoded height for this particular map, this is has to be changed to accomodate different maps
        .on('click', addUserToMap); // [Note]: Uses d3 to handle this event, not angular
    //===========================\\
    // var objectifyData = function(array){
    //   var data = [];
    //   for (var i  = 0; i < array.length; i++){
    //     data.push({"x": array[i][0], "y": array[i][1]})
    //   }

    //   return data;
    // };



    // var data = [[Number($('.user').attr('cx')), Number($('.user').attr('cy'))],
    //             [Number($('.user').attr('cx'))*1/10, Number($('.user').attr('cy'))*1/10],
    //             [Number($('.item').attr('cx')), Number($('.item').attr('cy'))]];
    var removePath = function(){
      d3.select("path").remove()
    };



    var drawPath = function(data){
      removePath();
      var lineFunction = d3.svg.line()
          .x(function(d) { return d[0] })
          .y(function(d) { return d[1] })
          .interpolate("linear");

      d3.select('svg').append("path")
                      .attr("d", lineFunction(data))
                      .attr("stroke", "blue")
                      .attr("stroke-width", 5)
                      .attr("fill", "none")
                      .transition()
                      // .duration(2000)
                      .attrTween('d', pathTween);

      function pathTween() {
        var interpolate = d3.scale.quantile()
                .domain([0,1])
                .range(d3.range(1, data.length + 1));
        return function(t) {
            return lineFunction(data.slice(0, interpolate(t)));
        };
      }
    }

    // var path = svg.append('path')
    //     .attr('class', 'line')
    //     .attr('d', line(data[0]))
    //     .transition()
    //     .duration(1000)
    //     .attrTween('d', pathTween);

    // function pathTween() {
    //     var interpolate = d3.scale.quantile()
    //             .domain([0,1])
    //             .range(d3.range(1, data.length + 1));
    //     return function(t) {
    //         return line(data.slice(0, interpolate(t)));
    //     };
    // }


    // d3.select('svg')
    //   .append('text')
    //   .attr('fill', 'white')
    //   .attr('y', 3 * scope.scale + 'px')
    //   .attr('x', 42 * scope.scale + 'px')
    //   .style('cursor', 'hand')
    //   .text('Calculate Route')
    //   .on('click', function() {
    //       d3.select('svg > #route')
    //       // .transition()
    //       // .duration(5000)
    //       .attrTween('d', drawPath(data))
    // });





    //\\===========================//\\

    // Defines the drag behavior.
    var drag = d3.behavior.drag()
      .on("drag", dragMove);

    // Used in dragMove, below.
    function updateUserLoc(userLoc){
      scope.userLoc = userLoc;

      // var data = [[Number($('.user').attr('cx')), Number($('.user').attr('cy'))],
      //         [300,400],
      //         [199,233],
      //         [266,99],
      //         [211,333],
      //         [222,555],
      //         [Number($('.item').attr('cx')), Number($('.item').attr('cy'))]];

      if (Math.abs(userLoc.x - data[1][0]) < 30 && Math.abs(userLoc.y - data[1][1]) < 30){
        data.splice(1,1);
      }
      data[0] = [Number($('.user').attr('cx')), Number($('.user').attr('cy'))]
      drawPath(data);
    };

    // Callback to be invoked on the 'drag' event.
    function dragMove(d) {
      var x = d3.event.x;
      var y = d3.event.y;


      d3.select(this).attr('cx',x).attr('cy', y);

      updateUserLoc({x:x, y:y});

      // var data = [{"x": x + 20, "y": y + 20}, {"x":20, "y":40}]

      // var line = d3.svg.line()
      //     .x(function(d) { return d[0]; })
      //     .y(function(d) { return d[1]; });

      // d3.select("svg").append("path")
      //   .attr("class", "line")
      //   .attr("d", line(data));

      // lineFunction(data);
    };


    // data = [];
    // var data = [[Number($('.user').attr('cx')), Number($('.user').attr('cy'))],
    //         [300,400],
    //         [199,233],
    //         [266,99],
    //         [211,333],
    //         [222,555],
    //         [Number($('.item').attr('cx')), Number($('.item').attr('cy'))]];

    // Adds user circle to the map. This is blue in the demo.
    function addUserToMap(event, scope, element){
      // Ignores the click event if it was suppressed.
      if (d3.event.defaultPrevented) return;
      
      // Ejects if there is already a user.
      if (d3.selectAll('.user')[0].length > 0) return;

      // Extracts the click location.
      var point = d3.mouse(this), 
      p = {x: point[0], y: point[1] };

      // Grabs SVG element from the parent element.
      var svg = d3.select('svg');
      
      // Appends a new point.
      svg.append('circle')
        .data([{x: p.x, y: p.y}])
        .attr('r', 10)
        .attr('cx', function(d){return d.x})
        .attr('cy', function(d){return d.y})
        .attr('class', 'user')
        .attr('fill','rgb(0, 119, 255)')
        .call(drag);

      data = [[Number($('.user').attr('cx')), Number($('.user').attr('cy'))],
              [500,300],
              [490,290],
              [480,280],
              [470,270],
              [460,260],
              [450,250],
              [440,240],
              [430,230],
              [420,220],
              [410,210],
              [400,200],
              [280,180],
              [260,160],
              [240,140],
              [220,120],
              [299,133],
              [266,99],
              [211,333],
              [222,555],
              [Number($('.item').attr('cx')), Number($('.item').attr('cy'))]];


      updateUserLoc(p);
    };
  };

  return {
    restrict: 'AE',
    link: linker,
    templateUrl: '../app/map/map.html',
    scope: false,
    replace: true
  };

});
