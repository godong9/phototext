/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var app = express();
var server = app.listen(3000);
var io = require('socket.io').listen(server);

// all environments
//app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//소켓 연결되었을 때
io.sockets.on('connection', function (socket) {
  console.log("Connect Client!");
  socket.broadcast.emit('addClient', "AddClient");
  socket.on('text', function (data) {
    console.log("text:",data);
    routes.makeData(data);
    socket.emit('refresh', "Refresh");
  });
});

app.get('/', routes.index);
//문자열 변경되었을 때
app.get('/ajax/text', function(req, res) {
    var data = {};
    data.word = req.query.word;
    data.size = data.word.length;
    data.picNum = data.size * 30;
    console.log("GET AJAX/TEXT");
    routes.makeData(data, function() {
        console.log("MAKEDATA");
        io.sockets.emit('refresh', data);
        res.send("Refresh");
    });
});
app.get('/ajax/images', routes.getImages);

app.get('/images', routes.getPage);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
