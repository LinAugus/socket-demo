var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(9000);

function handler(req, res) {
    fs.readFile(__dirname + '/fn/index.html', function(err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
    });
}

console.log(app);

app.conn = [];

io.on('connection', function (socket) {
    console.log('connect success');

    app.conn.push(socket.id);

    // io.emit('this', { will: 'be received by everyone'});

    // 广播
    socket.on('bor', function() {
        io.emit('broadcast', '这是系统消息'); // emit an event to all connected sockets
    });
    socket.broadcast.emit('user connected');
    // 触发news
    console.log('新用户连接:', socket["id"]);

    // 监听已读事件
    socket.on('readed', function (data) {
        console.log('收到前端的信息：', data);
    });

    socket.on('join', function() {
        socket.join('haha');
        socket.broadcast.to('haha').emit('message', '你已加入haha房间');
    })

    socket.on('toleave', function(){
        socket.leave('haha');
        console.log('haha房间里的socket:', io.sockets.clients('haha'));
    })

    socket.on('view', function() {
        let clients;
        clients = io.sockets.clients();
        console.log(Object.keys(clients));
        console.log(socket);
        socket.emit('message', app.conn);
        // let so = clients.sockets;
        // console.log(so)

    })

    // 监听失联事件
    socket.on('disconnect', function () {

        app.conn.forEach((val, idx) => {
            if (val == socket.id) {
                app.conn.splice(idx, 1);
            }
        })
        console.log(`socketid: ${socket.id} 已断开连接`);
        io.emit(`user disconnected`, `${socket.id}`);
    });
});
