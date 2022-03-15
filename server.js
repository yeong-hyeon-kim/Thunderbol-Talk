// express 모듈
var app = require('express')();
// http server 모듈
var server = require('http').createServer(app);
// socket.io 모듈
var io = require('socket.io')(server)
// request-ip 모듈
var requestIp = require('request-ip');

var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

// 페이지 라우팅 localhost:3500으로 서버에 접속하면 클라이언트로 index.html을 전송한다
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
    console.log('Client IP : ' + requestIp.getClientIp(req));
});

server.listen(3500, function () {
    console.log('Socket IO server listening on port 3500');
});

// connection event handler
// connection이 수립되면 event handler function의 인자로 socket인 들어온다
io.on('connection', function (socket) {
    // 클라이언트로부터의 메시지가 수신되면
    socket.on('chat', function (data) {
        console.log('Message from %s: %s', socket.name, data.msg);

        var msg = {
            from: {
                name: socket.name,
                userid: socket.userid
            },
            msg: data.msg,
            datetime: moment().format('HH시 mm분 ss초')
        };

        // 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
        socket.broadcast.emit('chat', msg);

        // 메시지를 전송한 클라이언트에게만 메시지를 전송한다
        // socket.emit('s2c chat', msg);

        // 접속된 모든 클라이언트에게 메시지를 전송한다
        // io.emit('s2c chat', msg);

        // 특정 클라이언트에게만 메시지를 전송한다
        // io.to(id).emit('s2c chat', data);
    });

    // force client disconnect from server
    socket.on('forceDisconnect', function () {
        socket.disconnect();
    })

    socket.on('disconnect', function () {
        console.log('user disconnected: ' + socket.name);
    });
});