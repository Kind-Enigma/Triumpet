//Controller for /api/items
var Item     = require('./model.js');
var Retailer = require('../retailers/model.js');
var Q        = require('q');
var jwt      = require('jwt-simple');

var controller = {};

//Mongoose methods, promisified. 
var findOneRetailer  = Q.nbind(Retailer.findOne, Retailer);
var createItem       = Q.nbind(Item.create, Item);
var findItem         = Q.nbind(Item.find, Item);
var findOneItem      = Q.nbind(Item.findOne, Item);

//CREATE method to create a new item.
//controller.create = function(req,res,next){
//  var username = req.params.retailer;
//  findOneRetailer({username:username})
//    .then(function(retailer){
//      if(!retailer){
//        next(new Error('Retailer doesn\'t exist'));
//      } else {
//        findOneItem({retailer_id: retailer._id, name: req.body.name})
//          .then(function(item){
//            if(!item){
//              req.body.retailer_id = retailer._id;
//              res.send(item);
//              return createItem(req.body);
//            } else {
//              next (new Error('Item already exit'))
//            }
//          })
//          .fail(function(error){
//            next(error);
//          })
//      }
//    });
//};


controller.create = function(req, res, next) {
  var username = req.params.retailer;

  Retailer.findOne({ username: username}, function(error, retailer){
    if (error) {
      res.status(500);
      res.end('Server error retrieving retailer');
    } else {
      Item.findOne({ retailer_id: retailer._id, name: req.body.name }, function(error, item){
        if (error) {
          res.status(500);
          res.end('Error ...');
        } else {
          if (item) {
            res.status(403);
            res.end('Item already exists');
          } else {
            req.body.retailer_id = retailer._id;
            console.log(req.body);
            var newItem = new Item(req.body);
            newItem.save(function(error, itemSaved){
              if (error) {
                res.status(500);
                console.log(error);
                res.end("Error");
              } else {
                res.status(200);
                res.json(itemSaved);
              }
            });
          }
        }
      });
    }
  });
};

//READ method to fetch all items belonging to a specific retailer.
//controller.read = function(req,res,next){
//  var username = req.params.retailer;
//  findOneRetailer({username:username})
//    .then(function(retailer){
//      if(!retailer){
//        next(new Error('Retailer doesn\'t exist'));
//      } else {
//        findItem({retailer_id: retailer._id})
//          .then(function(item){
//            res.send(item);
//          });
//      }
//    });
//}

controller.read = function(req, res, next) {
  var username = req.params.retailer;


  Retailer.findOne({ username: username }, function(error, retailer){
    if (error) {
      res.status(500);
      res.end("Error getting retailer")
    } else {
      Item.find({ retailer_id: retailer._id }, function(error, items){
        if (error) {
          res.status(500);
          res.end("Error getting items");
        } else {
          res.json(items);
        }
      });
    }
  });
};


//UPDATE method to update one item from one retailer.
//controller.update = function(req,res,next){
//  var username = req.params.retailer;
//  var itemName = req.params.item;
//  findOneRetailer({username:username})
//    .then(function(retailer){
//      if(!retailer){
//        next(new Error('Retailer doesn\'t exist'));
//      } else {
//        findOneItem({retailer_id: retailer._id, _id: req.body._id})
//          .then(function(item){
//            if(!item){
//              next (new Error('Item doesn\'t exit'))
//            } else {
//              for(var key in req.body){
//                item[key] = req.body[key];
//              }
//              item.save();
//              res.sendStatus(300);
//            }
//          });
//      }
//    });
//}

controller.update = function(req, res, next) {

  res.end("Updating ...");
};

//DELETE method to remove one item from a retailer.
//controller.delete = function(req,res,next){
//  var username = req.params.retailer;
//  var itemName = req.params.item;
//  findOneRetailer({username:username})
//    .then(function(retailer){
//      if(!retailer){
//        next(new Error('Retailer doesn\'t exist'));
//      } else {
//        findOneItem({retailer_id: retailer._id, name: itemName})
//          .then(function(item){
//            if(!item){
//              next (new Error('Item doesn\'t exit'))
//            } else {
//              item.remove();
//              res.sendStatus(300);
//            }
//          });
//      }
//    });
//}

controller.delete = function(req, res, next) {
  var item = req.params.item;
  var username = req.params.retailer;

  Retailer.findOne({username:username}, function(error, retailer){
    if (error) {
      res.status(500);
      res.end(error);
    } else {
      Item.remove({ name: item, retailer_id: retailer._id }, function(error){
        if (error) {
          res.status(500);
          res.send(error);
        } else {
          res.end('Your shite is deleted!');
        }
      });
    }
  });

};

module.exports = controller;
