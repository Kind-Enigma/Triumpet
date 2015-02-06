angular.module('tp.factories',[])
//Please see Client Docuentation for more information: 
//https://github.com/JollyPhantom/Triumpet/blob/master/client/CLIENT_README.MD
.factory('Map', function($http){
	var map = {};

	//Update data on retailers
	map.update = function(username,data){
		return $http({
			method: 'PUT',
			url:'/api/retailers/'+username,
			data: data
		});
	};

	//Fetch one retailer from database and return as a promise.
  //Used to get specific retailer information in Retailer Map Editor and User Map.
  map.fetch = function(username){
    return $http({
      method: 'GET',
      url: '/api/retailers/'+username
    })
    .then(function(retailer){
      return retailer.data;
    });
  };

  //Converts floor plan to strings to be used with d3.
  map.getFloorPlanString = function(floorPlan, scale){
    var coors = floorPlan;
    var result = '';
    for(var i = 0; i < coors.length; i++){
      var x = coors[i].x*scale;
      var y = coors[i].y*scale;
      result = result+x+','+y+' ';
    }
    return result;
  };

  //Draw floor plan on svg specified as one of the inputs.
  map.drawFloorPlan = function(floorPlan, scale, svg){
  	svg.selectAll('polygon').remove();
    var fp = svg.selectAll('polygon').data([0]);
    fp.enter().append('polygon');
    fp.attr('points', map.getFloorPlanString(floorPlan, scale))
      .attr('fill','white')
      .attr('stroke','blue');
  };

  //Draw shelves on svg specified as one of the inputs.
  map.drawShelves = function(shelves, scale, svg){
  	svg.selectAll('rect').remove();
    var sh = svg.selectAll('rect').data(shelves);
    sh.enter().append('rect');
    sh.attr('x', function(d){return d.x*scale})
	    .attr('y', function(d){return d.y*scale})
	    .attr('width', function(d){return d.width*scale})
	    .attr('height', function(d){return d.height*scale})
      .attr('fill','grey')
      .attr('stroke','black');
  };

	return map;
})

.factory('Item',function($http){
	var item = {};
  item.storage = [];
  item.coordinatesStorage = [];

	//Updates items on retailers.
	item.update = function(username,data){
		data.forEach(function(item){
			$http({
				method: 'PUT',
      	url: '/api/items/'+username+'/'+item.name,
      	data: item
			})
			.catch(function(){
				$http({
					method: 'POST',
	      	url: '/api/items/'+username,
	      	data: item
				})
			});
		});
	};

	//Fetches all items from a retailer.
	item.fetchItems = function(username){
		return $http({
      method: 'GET',
      url: '/api/items/'+username
    })
    .then(function(item){
      return item.data;
    });
	};

	//Strips out information unrelated to rendering.
  //Input: items
  //Output: coordinates to render. See drawItems function on line 117.
	item.flattenItemsCoor = function(items){
		var result = [];
		items.forEach(function(item){
			item.coordinates.forEach(function(coor){
				result.push({
					x:coor.x,
					y:coor.y,
					name:item.name,
					category:item.category
				});
			});
		});
		return result;
	}

	// Draws items on svg specified as one of the inputs.
  item.drawItems = function(items, scale, svg, clear){


    var coordinatesArray = [scale * items[0].coordinates[0].x, scale * items[0].coordinates[0].y];
    item.coordinatesStorage.push(coordinatesArray);
    item.storage.push(items);
    // console.log(item.coordinatesStorage)



    clear = (clear === undefined) ? true : false;
    if ( clear ) {
    	svg.selectAll('circle').remove();
    }
    var itm = svg.selectAll('.item').data(item.flattenItemsCoor(items));
    itm.enter().append('circle');
    itm.attr('cx',function(d){return d.x*scale})
    	 .attr('cy',function(d){return d.y*scale})
    	 .attr('r',function(){return 0.5*scale})
    	 .attr('fill','red')
       .attr('class', 'item')

    svg.append('circle')
       .data(item.flattenItemsCoor(items))
       .attr('r', function(){return 0.5*scale})
       .attr('cx', function(d){return d.x*scale})
       .attr('cy', function(d){return d.y*scale})
       .attr('class', 'selectedItem')
       .attr('fill','red')
       var h = 10;
	  // for(var i = 0; i < item.storage.length; i++){
	  // 	h+=5;
	  // 	console.log(item.storage[i]);
	  //   var itemText = item.storage[i][0].name;
	  //     d3.select('svg')
	  //       .append('text')
	  //       .attr('fill', 'white')
	  //       .attr('cx', 3 * scale)
	  //       .attr('cy', 42 * scale + h)
	  //       .style('cursor', 'hand')
	  //       .text(itemText);
	  // }
  };

	return item;
})

.factory('Auth',function($http, $location, $window){
	var auth = {};

	auth.signin = function(login){
		return $http({
			method: 'POST',
			url: '/api/users/signin',
			data: login
		})
		.then(function(resp){
			return resp.data.token;
		});
	};

	auth.signinRetailer = function(login){
		return $http({
			method: 'POST',
			url: '/api/retailers/signin',
			data: login
		})
		.then(function(resp){
			return resp.data.token;
		});
	};

	auth.signup = function(user){
		return $http({
			method: 'POST',
			url: '/api/users/signup',
			data: user
		})
		.then(function(resp){
			return resp.data.token;
		});
	};

	auth.signupRetailer = function(retailer){
		return $http({
			method: 'POST',
			url: '/api/retailers/signup',
			data: retailer
		})
		.then(function(resp){
			return resp.data.token;
		});
	};

	auth.isAuth = function(){
		return !!$window.localStorage.getItem('com.triumpet.token') && !!$window.localStorage.getItem('com.triumpet.username');
	};

	auth.isRetailerAuth = function(){
		return !!$window.localStorage.getItem('retailer.triumpet.token') && !!$window.localStorage.getItem('retailer.triumpet.username');
	};

	auth.signout = function(){
		$window.localStorage.removeItem('com.triumpet.token');
		$window.localStorage.removeItem('com.triumpet.username');
		$window.localStorage.removeItem('retailer.triumpet.token');
		$window.localStorage.removeItem('retailer.triumpet.username');
	};

	return auth;
})
