sfdc-papertrail-logger
=======================

Node application using [faye](hhttp://faye.jcoglan.com/) that catches streamed records from salesforce and logs them via [Papertrail](http://www.papertrailapp.com).

### Node Module Dependencies

These will be automatically installed when you use the *npm* installation method below.

1. [express](http://expressjs.com/) - framework
2. [nforce](https://github.com/kevinohara80/nforce) - REST wrapper for force.com
3. [jade](http://jade-lang.com/) - the view engine (not really needed)
4. [faye](http://faye.jcoglan.com/) - a publish-subscribe messaging system based on the Bayeux protocol.

### Installing the Logger assets in Salesforce.com

Install the Log__c custom object and Logger.cls class from the saleforce directory into your org.

### Setup Remote Access in Salesforce.com

Setup a new Remote Access to get your OAuth tokens. If you are unfamiliar with settng this up, see 4:45 of my [Salesforce.com Primer for New Developers](http://www.youtube.com/watch?v=fq2ju2ML9GM). For your callback, simply use: http://localhost:3001/oauth/_callback

### Create a PushTopic in Salesforce.com

Create a new PushTopic from the Developer Console in your org with the following. This will setup the endpoint for faye to listen to:

PushTopic pt = new PushTopic();  
pt.apiversion = 24.0;  
pt.name = 'LogEntries';
pt.description = 'All new logger records';  
pt.query = select id, name, level__c, short_message__c, class__c from log__c;  
insert pt;  
System.debug('Created new PushTopic: '+ pt.Id);

You can also set up PushTopics using the [Workbench](https://workbench.developerforce.com).

### Running the Application Locally

From the command line type in:
<pre>git clone https://github.com/jeffdonthemic/sfdc-papertrail-logger.git</pre>

This will clone this repo locally so you simply have to make your config changes and be up and running. Now replace your OAuth tokens and credentials in the config.js file.

<pre>cd sfdc-papertrail-logger
npm install # install all of the packages from the package.json file
node app.js # start the server</pre>

Point your browser to [http://localhost:3001](http://localhost:3001) and watch the magic!

### Deploy to Heroku

<pre>heroku create sfdc-papertrail-logger

heroku config:add CLIENT_ID=YOUR-SALESFORCE-CLIENT-ID
heroku config:add CLIENT_SECRET=YOUR-SALESFORCE-SECRET
heroku config:add USERNAME=YOUR-SALESFORCE-USERNAME
heroku config:add PASSWORD=YOUR-SALESFORCE-PASSWORD-AND-TOKEN
heroku config:add DEBUG=true

git push heroku master</pre>

Add the Papertrail add-on from the app in Heroku or with:

<pre>heroku addons:add papertrail:choklad</pre>

Open Papertrail from the app on Heroku in the upper right "Add-ons" menu.

