/**
 * Created by rk on 2016-12-21.
 */

var express = require('express');
var app = express();
var server = require('http').createServer(app);

server.listen(process.env.PORT || 3000);

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
