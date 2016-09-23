var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')({
    transports: ['websocket'],
});


//app.get('/', function(req, res){
//  res.sendFile(__dirname + '/index.html');
//	res.send(process.env.PORT);
//});
var roomList = [];
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
        var roomId = String(new Date().getTime());
        roomList.push(roomId);
        socket.emit('roomid', {roomid: roomId});
    });

    socket.on('addme', function (msg)
    {
        var newPlayerId = String(new Date().getTime());
        socket.emit('playeradded', {playerid: newPlayerId});
        socket.broadcast.emit('newplayer', {playerid: newPlayerId});
        //socket.emit('roomlist', JSON.stringify(roomList));
    });
    socket.on('getrooms', function (msg)
    {
//        socket.emit('roomlist', JSON.stringify(roomList));
socket.emit('roomlist', {roomlist:JSON.stringify(roomList)});
    });

    socket.on('position', function (msg)
    {
        io.emit('position', msg);
    });
});
io.attach(process.env.PORT || 5000);
//http.listen(process.env.PORT || 5000);