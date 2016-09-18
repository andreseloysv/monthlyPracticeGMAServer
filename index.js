var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

io.set('transports', ['xhr-polling']);
io.set('polling duration', 10);

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
