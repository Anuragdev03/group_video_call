const express = require('express')
const cors = require("cors")
const app = express()
const fs = require("fs");
const options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
};


const server = require("http").createServer(app);
const socket = require("socket.io")


app.use(cors());

const io = socket(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

const port = 8000;

const users = {
    // roomId: [{ id: "", name: ""}]
};
const socketToRoom = {};

io.on("connection", (socket) => {
    socket.on("join-room", (room, userName) => {
        if(users[room]) {
            users[room].push({id:socket.id, name: userName})
        } else {
            users[room] = [{id: socket.id, name: userName}]
        }
        socketToRoom[socket.id] = room;

        const userInThisRoom = users[room].filter(obj => obj.id !== socket.id);

        socket.emit("all users", userInThisRoom);
    })

    socket.on("sending signal", ({ signal, callerId, userToSignal }) => {
        io.to(userToSignal).emit("user joined", { signal, callerId })
    })

    socket.on("incomming signal", ({ callerId, signal }) => {
        io.to(callerId).emit("returned signal", { signal, id:socket.id })
    })

    socket.on("error", (err) => {
        console.error("Socket Error:", err);
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
        }
    });
    console.log(socketToRoom)
    console.log(users, "============users")

})

app.get('/', (req, res) => {
    res.send('Hello World!')
})


server.listen(port)
