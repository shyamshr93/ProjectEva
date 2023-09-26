// io needs to use HTTP, express will still be the middleware for routes
const express = require('express');
const { config } = require('process');
const { isRegExp } = require('util');
const app = express(); //creates the express app
const server = require('http').Server(app)//app is an http server
const io = require('socket.io')(server);


app.use(express.static('public'))

app.use(express.urlencoded({ extended: true }))

app.set('views', './views')

app.set('view engine', 'ejs')

const rooms = {}

var user = 0;
app.get('/about', (req, res) => {
    res.render('about')
});
app.get('/', (req, res) => {
    res.render('index', { rooms: rooms })
});
app.post('/room', (req, res) => {
    res.redirect(req.body.room)
})
app.get("/:room", (req, res) => {
    res.render('room', { roomName: req.params.room })
})

var clientsList = [];

io.on('connection', (socket) => {

    // callback function after connection is made to the client

     socket.on('roomJoinedFirst', async (roomname, user_name) => {
        socket.join(roomname);
        socket.nickname = user_name;


        var clientInfo = new Object();
        clientInfo.customName = user_name;
        clientInfo.clientId = socket.id;
        clientInfo.roomName = roomname;
        clientsList.push(clientInfo);

        const ids = await io.in(roomname).allSockets();

        io.sockets.in(roomname).emit('totalusers', ids.size);
        io.sockets.in(roomname).emit('usersList', clientsList.filter(x => x.roomName == roomname));
       
    })

    socket.on('roomJoined', (data, userId) => {

        user = user + 1;

        strUser = 'User ' + (user);

        socket.join(data)

        socket.broadcast.to(data).emit('name', {
            message: strUser
        });

        socket.to(data).broadcast.emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.to(data).broadcast.emit('user-disconnected', userId)
        })
    })
    // recieves a chat event, then sends the data to other sockets
    socket.on('chat', (data) => {
        socket.broadcast.to(data.room).emit('chat', data)
        console.log(data.room);
    });

    socket.on('reconnectUser', async (roomname, userName) => {
        socket.join(roomname);
        const ids = await io.in(roomname).allSockets();

        io.sockets.in(roomname).emit('totalusers', ids.size);
        io.sockets.in(roomname).emit('usersList', clientsList.filter(x => x.roomName == roomname));
        io.to(socket.id).emit("reconnectUser", "Reconnect Successfully");
    });

    socket.on('bruhstream', (stream, roomname) =>{
        
        io.sockets.in(roomname).emit('bruhstreamwapis', stream);
        console.log(stream);
        console.log("lol moment");
    })

    socket.on('userTyping', (roomname, data) => {
        socket.broadcast.to(roomname).emit('userTyping', { userName: data })
    });

    socket.on('doneTyping', (roomname) => {
        socket.broadcast.to(roomname).emit('doneTyping')
    });

    socket.on('getTotalUsers', async (roomname) => {
        const ids = await io.in(roomname).allSockets();
        io.sockets.in(roomname).emit('totalusers', ids.size);
    })

    //Youtube Sockets Event

    socket.on('sYoutubeURL', (roomname, yt_url) => {
        socket.broadcast.to(roomname).emit('cYoutubeURL', yt_url)
    })

    socket.on('sWebURL', (roomname, web_url) => {
        socket.broadcast.to(roomname).emit('cWebURL', web_url)
    })

    socket.on('sYt_State', (roomname, yt_data) => {
        socket.broadcast.to(roomname).emit('cYt_State', yt_data)
    })



    socket.on('disconnecting', function () {
        var i = 0;
        var self = this;

        var rooms = self.rooms;
        rooms.forEach(function (room) {

            self.to(room).emit('userLeft', {
                message: socket.id
            });
            try {

                if (clientsList[i].clientId == socket.id) 
                {
                    clientsList.splice(i, 1);
                }
                i++;

            } catch (error) {

            }
            try {
                self.to(room).emit('usersList', clientsList.filter(x => x.roomName == room));
                
            } catch (error) {
                
            }
        });
        //console.log(clientsList);

    });

    socket.on('error', reason => {
        console.log('error from server : ' + reason);
    })

})


const port = process.env.PORT || 8887;
server.listen(port, () => console.log('started'))
// http server listening on port