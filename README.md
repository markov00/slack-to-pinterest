#Slack to Pinterest Command

Pin URLs to specific board from Slack.

----

##About

This simple node application handle the posting of an URL to a specific Pinterest public Board. It will check the URL, fetch metadata
and create a pin on the specified board.

You have two main endpoint:

 /pinpin to create pin on a board

 /pinlist to show all available boards name


##Configuration

Create two slack commands following the "getting started" guide [here](https://api.slack.com/slash-commands). I use /pinpin and /pinlist.

Point the commands to your server endpoints like: http://your-server-name:port/pinpin

Configure ``config.json`` with the correct tokens: pinterest access token, commands secure token

##License MIT


