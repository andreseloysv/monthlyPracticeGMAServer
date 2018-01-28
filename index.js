"use strict";

//Test postgres conection:
function getLocations(socket){
    var conString = "postgres://wqqmkpkvddqxrf:d65bdb63cb9f3de3796198b42a27ae7ccf1b0e65864832f08b9cc23c7b51d0aa@ec2-46-137-97-169.eu-west-1.compute.amazonaws.com:5432/da4514sv0048rq";
    var pg = require('pg');
    pg.defaults.ssl = true;
    pg.connect(conString, function(err, client) {
      if (err) throw err;
      client.query('SELECT * FROM location').then(res => socket.emit('locations', {locations: res.rows}))
    });
}

function tryLoggin(userName,password){
    var conString = "postgres://wqqmkpkvddqxrf:d65bdb63cb9f3de3796198b42a27ae7ccf1b0e65864832f08b9cc23c7b51d0aa@ec2-46-137-97-169.eu-west-1.compute.amazonaws.com:5432/da4514sv0048rq";
    var pg = require('pg');
    var results = [];
    pg.defaults.ssl = true;
    pg.connect(conString, function(err, client) {
      if (err) throw err;
        const query = client.query("SELECT * FROM public.user WHERE login='"+userName+"' and password='"+password+"'", (err, res) => {
        if(res.rows.length === 1){
            return true;
          }else{
            return false;
          }
        });
    });
}

function isValidString(str) { return /^\w+$/.test(str); }

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
        var playerList = [];
        for (var i = 0; i < playerListSize; i++) {
            if (this.userList[i] != playerid) {
                playerList.push(this.userList[i]);
            }
        }
        return playerList;
    }
    removeplayer(playerid) {
        var playerListSize = this.userList.length;
        for (var i = 0; i < playerListSize; i++) {
            if (this.userList[i] == playerid) {
                this.userList.splice(i, 1);
            }
        }
    }
}

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
        socket.join(roomId);
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
        var roomListSize = roomList.length;
        for (var i = 0; i < roomListSize; i++) {
            if (roomList[i].roomId == msg.roomname) {
                if (!roomList[i].isPlayerHere(msg.playerid))
                {
                    roomList[i].userList.push(msg.playerid);
                    socket.join(roomList[i].roomId);
                    socket.broadcast.to(roomList[i].roomId).emit('newplayer', {playerid: msg.playerid});
                    socket.emit('joined', {roomid: msg.roomname, otherplayers: roomList[i].getOtherPlayers(msg.playerid)});
                }
            }
        }
    });

    socket.on('position', function (msg)
    {
        var roomListSize = roomList.length;
//        for (var i = 0; i < roomListSize; i++) {
//            if (roomList[i].roomId == msg.roomid) {
        //socket.emit('joined');
        //socket.broadcast.to(msg.roomid).emit('position', msg);
        io.sockets.in(msg.roomid).emit('position', msg);
        //io.emit('position', msg);
//            }
//        }
    });
    socket.on('disconnect', function () {
        if (roomList.length > 0) {
            roomList[0].removeplayer(playerId);
        }
    });

    socket.on('getLocations', function (msg)
    {
        getLocations(socket)
    });

    socket.on('login', function (msg)
    {

        if(isValidString(msg.login)&&isValidString(msg.password)){
            if(tryLoggin(msg.login,msg.password)){
                socket.emit(logged,{result:'succesful'});
            }
            else{
                socket.emit(logged,{result:'validation error'});
            }
        }else{
            socket.emit(logged,{result:'validation error'});
        }

        /*
        if(msg.login === "andreslaley" && msg.password === "1234"){
            
        }else{
            socket.emit('logged');
        }
  */      
    });

});
io.attach(process.env.PORT || 5000);
//http.listen(process.env.PORT || 5000);



