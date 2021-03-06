angular.module('tp.editor',[])

//Controller for retailer map editor. Mostly calls corresponding functions in Map and Item factories.
.controller('EditorCtrl', function($scope, $stateParams, $http, Map, Item, Auth){
  angular.extend($scope,Map,Item);
  $scope.data = {};//placeholder object, empty until Map.fetch is called.
  $scope.items = [];
  $scope.scale = 15;

  $scope.updateAll = function(){
    Map.update($scope.data.username, $scope.data);
  };

  $scope.signout = function(){
    Auth.signout();
  }

  $scope.updateAllItems = function(){
    Item.update($scope.data.username, $scope.items);
  };

  $scope.delete = function(index, attr){
    $scope.data[attr].splice(index,1);
  };

  $scope.render = function(){
    Map.drawFloorPlan($scope.data.floorPlan, $scope.scale, $scope.svg);
    Map.drawShelves($scope.data.shelves, $scope.scale, $scope.svg);
    Item.drawItems($scope.items, $scope.scale, $scope.svg);    
  }
  
  if($stateParams.retailer){ 
    //Fetches all data for a single retailer, replacing $scope.data with the retailer's data (floorPlan, items, etc).
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
})

//Editor
//Parent directive for map editor view.
.directive('tpEditor',function($window){
  return {
    restrict: 'EA',
    scope: false,
    replace: true,
    templateUrl:'../app/editor/editor.html',
    link: function(scope, el, attr){
      var width = $window.innerWidth;
      var height = $window.innerHeight;
      scope.svg = d3.select('#map-main').append('svg')
        .attr('id','map-svg');

    }
  }
})

//Floor Plan
//Adds coordinates to the floorPlan array and re-renders. 
.directive('tpFloorPlan',function($window, Map){
  return {
    restrict: 'EA',
    scope: false,
    templateUrl:'../app/editor/floorplan.html',
    link: function(scope, el, attr){
      var width = $window.innerWidth;
      var height = $window.innerHeight;
      scope.svg.on('click',function(){
          var x = d3.mouse(this)[0]/scope.scale;
          var y = d3.mouse(this)[1]/scope.scale;
          scope.data.floorPlan.push({
            x:x,
            y:y
          });
          scope.$apply();
          scope.render();
        })
    }
  }
})

//Shelves
//Inserts a new shelf, and renders it.
.directive('tpShelves',function($window, Map){
  return {
    restrict: 'EA',
    scope: false,
    templateUrl:'../app/editor/shelves.html',
    link: function(scope, el, attr){
      var width = $window.innerWidth;
      var height = $window.innerHeight;
      scope.svg.on('click',function(){
          var x = d3.mouse(this)[0]/scope.scale;
          var y = d3.mouse(this)[1]/scope.scale;
          scope.data.shelves.push({
            x:x,
            y:y,
            width:2,
            height:6
          });
          scope.$apply();
          scope.render();
        });
    }
  }
})

//Items
//Inserts a new item, and renders it.
.directive('tpItems',function($window, Item){
  return {
    restrict: 'EA',
    scope: false,
    templateUrl:'../app/editor/items.html',
    link: function(scope, el, attr){
      var width = $window.innerWidth;
      var height = $window.innerHeight;
      scope.svg.on('click',function(){
          var x = d3.mouse(this)[0]/scope.scale;
          var y = d3.mouse(this)[1]/scope.scale;
          scope.items.push({
            name: null,
            category:null,
            coordinates:[{
              x:x,
              y:y
            }]
          });
          scope.$apply();
          scope.render();
        });
    }
  }
});
