//For more information, please see supplemental server documentation at: 
//https://github.com/JollyPhantom/Triumpet/blob/master/server/API_README.md

var ejs            = require('ejs');
var bodyParser     = require('body-parser');
//Custom controllers for routes
var retailers      = require('../retailers/controller.js');
var items          = require('../items/controller.js');
var users          = require('../users/controller.js');

module.exports = function(app, express) {
  //Mounting middleware to app
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.engine('html',ejs.renderFile);
  app.set('view engine', 'html');

  //Serve static assets
  app.use(express.static(__dirname + '/../../client'));

  //Route to project landing page
  app.get('/project',function(req,res){
    res.redirect('/project');
  })

  // Retailers API
  app.post('/api/retailers/signup',retailers.create);
  app.post('/api/retailers/signin',retailers.signin);
  app.get('/api/retailers',retailers.read);
  app.get('/api/retailers/:username',retailers.readOne);
  app.put('/api/retailers/:username',retailers.update);
  app.delete('/api/retailers/:username',retailers.delete);

  // Items API
  app.get('/api/test', function(request, response){
    response.end("Test fired!");
  });
  app.post('/api/items/:retailer', items.create);
  app.get('/api/items/:retailer', items.read);
  app.put('/api/items/:retailer/:item', items.update);
  app.delete('/api/items/:retailer/:item',items.delete);

  // Users API
  app.post('/api/users/signup',users.create);
  app.post('/api/users/signin',users.signin);
  app.put('/api/users/:username',users.update);
  app.delete('/api/users/:username',users.delete);

};
