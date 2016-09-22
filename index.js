var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')({
    transports: ['websocket'],
});


//app.get('/', function(req, res){
//  res.sendFile(__dirname + '/index.html');
//	res.send(process.env.PORT);
//});

io.on('connection', function (socket)
{
    //socket.emit('newplayer');
    //socket.broadcast.emit('newplayer');
    socket.emit('connected');
    //socket.to('others').emit('newplayer');
//    socket.on('beep', function ()
//    {
//        socket.emit('boopeeeee');
//    });
    socket.on('createroom', function (msg)
    {
        socket.emit('roomid', {hola:"hola"});
        socket.emit('roomid', {roomid:new Date().getTime()});
    });
    
    socket.on('position', function (msg)
    {
        io.emit('position', msg);
    });
});
io.attach(process.env.PORT || 5000);
//http.listen(process.env.PORT || 5000);