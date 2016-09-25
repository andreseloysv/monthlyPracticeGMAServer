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
        roomList.push(new room(roomId, msg.roomname, [msg.playerid]));
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
            if (roomList[i].roomId == msg.roomname) {
                if (!roomList[i].isPlayerHere(msg.playerid))
                {
                    roomList[i].userList.push(msg.playerid);
                    socket.broadcast.to(msg.roomid).emit('newplayer', {playerid: msg.playerid});
                    socket.emit('joined', {roomid: msg.roomname, otherplayers: roomList[i].getOtherPlayers(msg.playerid)});
                }
            }
        }
    });

    socket.on('position', function (msg)
    {
        var roomListSize = roomList.length;
        for (var i = 0; i < roomListSize; i++) {
            if (roomList[i].roomId == msg.roomid) {
                //socket.emit('joined');
                socket.broadcast.to(msg.roomid).emit('position', msg);
                //io.emit('position', msg);
            }
        }
    });
});
io.attach(process.env.PORT || 5000);
//http.listen(process.env.PORT || 5000);
class room {
    constructor(roomId, roomName, userList) {
        this.roomId = roomId;
        this.roomName = roomName;
        this.userList = userList;
    }
    isPlayerHere(playerid) {
        var playerListSize = this.userList.length;
        for (var i = 0; i < playerListSize; i++) {
            if (this.userList[i] == playerid) {
                return true;
            }
        }
        return false;
    }
    getOtherPlayers(playerid) {
        var playerListSize = this.userList.length;
        var playerList=[];
        for (var i = 0; i < playerListSize; i++) {
            if (userList[i] != playerid) {
                playerList.push(this.userList[i]);
            }
        }
        return playerList;
    }
}