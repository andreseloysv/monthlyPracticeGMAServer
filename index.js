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
var playerList = [];
io.on('connection', function (socket)
{
    //socket.emit('newplayer');
    //socket.broadcast.emit('newplayer');
    var playerId = String(new Date().getTime());
    playerList.push(playerId);
    socket.emit('connected', {playerid: playerId});
    //socket.to('others').emit('newplayer');
//    socket.on('beep', function ()
//    {
//        socket.emit('boopeeeee');
//    });
    socket.on('createroom', function (msg)
    {
        var roomId = String(new Date().getTime());
        roomList.push(roomId);
        room.push(new room(roomId, msg.roomName, [msg.playerid]));
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
        socket.emit('roomlist', {roomlist: roomList});
    });
    socket.on('joinroom', function (msg)
    {
//        var roomId = String(new Date().getTime());
//        roomList.push(roomId);
//        socket.emit('roomid', {roomid: roomId});
        var roomListSize = roomList.length;
        for (var i = 0; i < roomListSize; i++) {
            console.log(msg);
            if (roomList[i].roomId == msg.roomname) {
                socket.emit('joined');
                
            }
        }

    });

    socket.on('position', function (msg)
    {
        io.emit('position', msg);
    });
});
io.attach(process.env.PORT || 5000);
//http.listen(process.env.PORT || 5000);
class room {
    userList = [];
    constructor(roomId, roomName, userList) {
        this.roomId = roomId;
        this.roomName = roomName;
        this.userList = userList;
    }
}