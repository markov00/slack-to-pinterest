var express = require('express');
var bodyParser = require('body-parser');
var PDK = require('node-pinterest');
var MetaInspector = require('node-metainspector');
var validUrl = require('valid-url');

var config = require('./config.json');


var pinterest = PDK.init(config.PINTEREST_TOKEN);
var app = express();
var PORT = config.PORT;

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());


app.post('/pinpin', function (req, res) {

  if (req.body && req.body.token != config.PINPIN_TOKEN) {
    return res.send('WHO ARE YOU????');
  }

  if (!req.body.text) {
    return res.send('Please use the command like /pinpin [URL] to [board]');
  }
  var data = req.body.text.split(' to ');
  var username = req.body.user_name;

  if (data.length != 2) {
    return res.send('Please use the command like /pinpin [URL] to [board]');
  }
  var boardName = data[1];
  var URL = data[0];

  if (!validUrl.isUri(URL)) {
    return res.send('Please use a valid URL');
  }


  console.log(username + 'is pinning to ', boardName, URL);


  var client = new MetaInspector(URL, {});

  //fetching URL
  client.on('fetch', function () {

    //fetching boards
    pinterest.api('me/boards').then(function (json) {


      var validBoard = null;
      for (var i = 0; i < json.data.length; i++) {
        var board = json.data[i];

        if (board.name === boardName) {
          validBoard = board;
          break;
        }
      }

      if (validBoard) {

        //create PIN
        pinterest.api('pins', {
          method: 'POST',
          body: {
            board: validBoard.id, // grab the first board from the previous response
            note: client.title,
            link: URL,
            image_url: client.image
          }
        }).then(function (json) {

          //send in_channel response
          return res.json({
            response_type: 'in_channel',
            text: ':pushpin: pinned to `' + boardName + '`',
            'mrkdwn': true,
            attachments: [
              {
                text: client.ogDescription || client.twitterDescription || client.description,
                title: client.ogTitle || client.twitterDescription || client.title,
                title_link: URL,
                image_url: client.image
              }
            ]
          });

        });
      } else {
        return res.send('Please use a valid board, use /pinlist to get the board list');
      }

    });

    client.on('error', function (err) {
      return res.send('Can\'t fetch URL:' + URL);
    });
  });
  client.fetch();
});


app.post('/pinlist', function (req, res) {

  if (req.body && req.body.token != config.PINLIST_TOKEN) {
    return res.send('WHO ARE YOU????');
  }
  pinterest.api('me/boards').then(function (json) {

    var text = ['available boards:'];
    for (var i = 0; i < json.data.length; i++) {
      text.push('`' + json.data[i].name + '`');
    }

    res.send({
      'text': text,
      'username': 'Pinterest BOT',
      'mrkdwn': true
    });

  });

});

app.listen(PORT, function () {
  console.log('pinterest-to-slack app listening on port:' + PORT);
});