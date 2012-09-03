exports.PORT = process.env.PORT || 3001; // use heroku's dynamic port or 3001 if localhost
exports.DEBUG = process.env.DEBUG; 
exports.ENVIRONMENT = 'production'; 
exports.CALLBACK_URL = 'http://localhost:3001'; 
exports.PUSH_TOPIC = '/topic/LogEntries';

exports.CLIENT_ID = process.env.CLIENT_ID;
exports.CLIENT_SECRET = process.env.CLIENT_SECRET;
exports.USERNAME = process.env.USERNAME;
exports.PASSWORD = process.env.PASSWORD; 