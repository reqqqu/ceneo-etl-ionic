/**
 * Created by rk on 2016-12-21.
 */

var express = require('express');
var request = require('request');
var app = express();
var server = require('http').createServer(app);

server.listen(process.env.PORT || 3000);

app.use(express.static('static'))
  .use('/proxy', function(req, res) {
    var target = req.url.replace('/?url=','');
    req.pipe(request(target)).pipe(res);
  });

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
