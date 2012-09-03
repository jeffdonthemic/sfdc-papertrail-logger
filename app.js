
/**
 * Module dependencies.
 */
var config = require('./config.js');
var express = require('express')
  , faye    = require('faye')
  , nforce = require('nforce')
  , util = require('util')
  , routes = require('./routes');

var app = module.exports = express.createServer();

// Bayeux server - mounted at /cometd
var fayeServer = new faye.NodeAdapter({mount: '/cometd', timeout: 60 });
fayeServer.attach(app);

var sfdc = nforce.createConnection({
  clientId: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
  redirectUri: config.CALLBACK_URL + '/oauth/_callback',
  apiVersion: 'v24.0',  // optional, defaults to v24.0
  environment: config.ENVIRONMENT  // optional, sandbox or production, production default
});

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public')); 
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);

app.listen(config.PORT, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

// authenticates and returns OAuth -- used by faye
function getOAuthToken(callback) {

  if(config.DEBUG) console.log("Authenticating to get salesforce.com access token...");
  
  sfdc.authenticate({ username: config.USERNAME, password: config.PASSWORD }, function(err, resp){
    if(err) {
      console.log('Error authenticating to org: ' + err.message);
    } else {
      if(config.DEBUG) console.log('OAauth dance response: ' + util.inspect(resp));
      callback(resp);
    }
  });

}

// get the access token from salesforce.com to start the entire polling process
getOAuthToken(function(oauth) { 

  // cometd endpoint
  var salesforce_endpoint = oauth.instance_url +'/cometd/24.0';
  if(config.DEBUG) console.log("Creating a client for "+ salesforce_endpoint);

  // add the client listening to salesforce.com
  var client = new faye.Client(salesforce_endpoint);

  // set header with OAuth token
  client.setHeader('Authorization', 'OAuth '+ oauth.access_token);

  // monitor connection down and reset the header
  client.bind('transport:down', function(client) {
    // get an OAuth token again
    getOAuthToken(function(oauth) {
      // set header again
      upstreamClient.setHeader('Authorization', 'OAuth '+ oauth.access_token);
    });
  });

  // subscribe to salesforce.com push topic
  if(config.DEBUG) console.log('Subscribing to '+ config.PUSH_TOPIC);
  var upstreamSub = client.subscribe(config.PUSH_TOPIC, function(message) {
    // console.log("Received message: " + JSON.stringify(message)); 
    console.log('[' + message['sobject']['Level__c'] + '] ' + message['sobject']['Class__c'] 
      + ' - ' + message['sobject']['Short_Message__c'] + ' (' + message['sobject']['Name'] + ')');
  });
  
});
