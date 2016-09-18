var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
  
  
   app.get('/', function(req, res){
   //  res.sendFile(__dirname + '/index.html');
   	res.send(process.env.PORT);
   });
 
   io.on('connection', function(socket){
     socket.on('chat message', function(msg){
       io.emit('chat message', msg);
     });
   });
  io.on('connection', function(socket){
	socket.on('beep', function(){
		  socket.emit('boop');
	  });
  });
   http.listen(process.env.PORT || 5000);

