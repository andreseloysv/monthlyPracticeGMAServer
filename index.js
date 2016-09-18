var express = require('express'),
app = express(),
server = require('http').createServer(app),
io = require('socket.io').listen(server),
io.set('transports', ['xhr-polling']);
io.set('polling duration', 10);
 
server.listen(process.env.PORT || 3000);
 
  app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
  });

  io.on('connection', function(socket){
    socket.on('chat message', function(msg){
      io.emit('chat message', msg);
    });
  });
  
 http.listen(3000, function(){
   console.log('listening on *:3000');
  });
