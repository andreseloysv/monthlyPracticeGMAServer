var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')({
  transports: ['websocket'],
});
  
  
   //app.get('/', function(req, res){
   //  res.sendFile(__dirname + '/index.html');
   //	res.send(process.env.PORT);
   //});
 
   io.on('connection', function(socket){
     socket.on('chat message', function(msg){
       io.emit('chat message', msg);
     });
   });

   http.listen(process.env.PORT || 5000);

