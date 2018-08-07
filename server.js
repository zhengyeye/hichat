//服务器及页面响应部分
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server), //引入socket.io模块并绑定到服务器
    users = [];//保存所有在线用户的昵称

app.use('/', express.static(__dirname + '/www'));
server.listen(3001);

//socket部分
io.on('connection', function(socket) {
    //接收并处理客户端发送的login事件
    
    //用户登录事件
    socket.on('login', function(nickname) {
       if(users.indexOf(nickname)>-1){
            socket.emit('nickExisted');
       }else{
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            //向所有连接到服务器的客户端发送给当前登录用户的昵称
            io.sockets.emit('system',nickname,users.length, 'login');
       }
    })

    //用户退出事件
    socket.on('disconnect', function() {
      //将断开连接的用户从users中删除
      users.splice(socket.userIndex,1);
      //通知除过自己以外的所有人
      socket.broadcast.emit('system',socket.nickname,users.length,'logout');
    })

    //接收新消息
    socket.on('postMsg', function(msg) {
    //将消息发送到除自己外的所有用户
    //向客户端发送newMsg事件
    socket.broadcast.emit('newMsg', socket.nickname, msg);
    });

    //接收用户发来的图片
    socket.on('img', function(imgData) {
        //通过一个newImg事件分发到除自己外的每个用户
        socket.broadcast.emit('newImg', socket.nickname, imgData);
    });
});