"use strict";
const pg = require('pg');
const conString = "postgres://wqqmkpkvddqxrf:d65bdb63cb9f3de3796198b42a27ae7ccf1b0e65864832f08b9cc23c7b51d0aa@ec2-46-137-97-169.eu-west-1.compute.amazonaws.com:5432/da4514sv0048rq";
pg.defaults.ssl = true;
//Test postgres conection:
function getLocations(socket){
    pg.connect(conString, function(err, client) {
      if (err) throw err;
      client.query('SELECT * FROM location').then(res => socket.emit('locations', {locations: res.rows}))
      
    });
}

function tryLoggin(socket,userName,password){
    var results = [];
    pg.connect(conString, function(err, client,done) {
      if (err) throw err;
        const query = client.query("SELECT * FROM public.user WHERE login='"+userName+"' and password='"+password+"'", (err, res) => {
            console.log(res.rows.length);
            if(res.rows.length === 1){
                responseLogin(socket,true);
            }else{
                responseLogin(socket,false);
            }
            done()
        });
    });
}
function tryRegisterPlayer(socket,login,password,name,email,phone){
    pg.connect(conString, function(err, client,done) {
      if (err) throw err;
        const query = client.query("INSERT INTO public.user (login, password, name, email, phone) VALUES ('"+login+"', '"+password+"', '"+name+"', '"+email+"', '"+phone+"')" , (err, res) => {
            responseRegisterPlayer(socket,true);
            done()
        });
    });
}

function savePlayer(socket,login,name,password,level,maxLifePoinst,attack,defence,experience,locationx,locationy){
    pg.connect(conString, function(err, client,done) {
      if (err) throw err;
        const query = client.query("UPDATE public.user SET name='"+name+"', password='"+password+"', level='"+level+"', maxlifepoinst='"+maxLifePoinst+"', attack='"+attack+"', defence='"+defence+"', experience='"+experience+"', locationx='"+locationx+"', locationy='"+locationy+"' WHERE login='"+login+"'", (err, res) => {
            reponsePlayerUpdate(socket,true,query);
            done()
        });
    });
}
function loadPlayerData(socket,login){
    pg.connect(conString, function(err, client,done) {
      if (err) throw err;
        const query = client.query("Select * from public.user WHERE login='"+login+"'", (err, res) => {
            console.log(res.rows.length);
            if(res.rows.length === 1){
                loadedPlayerData(socket,true,query,res.rows);
            }else{
                loadedPlayerData(socket,false,query,null);
            }
            done()
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
        io.sockets.in(msg.roomid).emit('position', msg);
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
            tryLoggin(socket,msg.login,msg.password);
        }else{
            socket.emit('logged',{result:'validation error - please just letters or numbers'});
        }
    });
    
    socket.on('registerPlayer', function (msg)
    {
        if(isValidString(msg.login)&&isValidString(msg.password)&&isValidString(msg.email)&&isValidString(msg.phone)&&isValidString(msg.name)){
            tryRegisterPlayer(socket,msg.login,msg.password,msg.name,msg.email,msg.phone);
        }else{
            socket.emit('registredPlayer',{result:'validation error - please just letters or numbers'});
        }
    });

    socket.on('savePlayer', function (msg)
    {
        if(isValidString(msg.login)&&isValidString(msg.name)&&isValidString(msg.level)&&isValidString(msg.maxLifePoinst)&&isValidString(msg.attack)&&isValidString(msg.defence)&&isValidString(msg.experience)&&isValidString(msg.locationx)&&isValidString(msg.locationy)){
            savePlayer(socket,msg.login,msg.name,msg.level,msg.maxLifePoinst,msg.attack,msg.defence,msg.experience,msg.locationx,msg.locationy)
        }else{
            socket.emit('savedPlayer',{result:'validation error - please just letters or numbers'});
        }
    });
    socket.on('loadPlayerData', function (msg)
    {
        if(isValidString(msg.login)){
            loadPlayerData(socket,msg.login)
        }else{
            socket.emit('recivePlayerData',{result:'validation error - please just letters or numbers'});
        }
    });

});
io.attach(process.env.PORT || 5000);
//http.listen(process.env.PORT || 5000);

function responseLogin(socket,result){
    if(result){
        socket.emit('logged', {result:'succesful'});
    }
    else{
        socket.emit('logged', {result:'Error: wrong nickname or password'});
    }
}
function responseRegisterPlayer(socket,result){
    if(result){
        socket.emit('registredPlayer', {result:'succesful'});
    }
    else{
        socket.emit('registredPlayer', {result:'Error: wrong info by player register'});
    }
}
function reponsePlayerUpdate(socket,result,query){
    if(result){
        socket.emit('savedPlayer', {result:'succesful',query:query});
    }
    else{
        socket.emit('savedPlayer', {result:'Error: wrong argumenten'});
    }
    
}
function loadedPlayerData(socket,result,query,data){
    if(result){
        socket.emit('recivePlayerData', {result:'succesful',data:data});
    }
    else{
        socket.emit('recivePlayerData', {result:'Error: wrong argumenten'});
    }       
}


