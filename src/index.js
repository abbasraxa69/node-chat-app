const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const path = require("path");
const Filter = require("bad-words");
const { getMessage, generateLocationMessage } = require("./utils/message");
const {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;
const publicPathDirectory = path.join(__dirname, "../public");

app.use(express.static(publicPathDirectory));

let message = "";

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("join", ({ username, room }, cb) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return cb(error);
    }
    socket.join(user.room);
    socket.emit("message", getMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        getMessage("Admin", `${user.username} joined the chat!`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    cb();
  });
  socket.on("sendMessage", (message, cb) => {
    const user = getUser(socket.id);

    const fiter = new Filter();
    if (fiter.isProfane(message)) {
      return cb("Profanity is not allowed!");
    }
    io.to(user.room).emit("message", getMessage(user.username, message));
    cb();
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        getMessage("Admin", `${user.username} just left the chat!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
  socket.on("sendLocation", (location, cb) => {
    const user = getUser(socket.id);
    locationMessage = `https://google.com/maps?q=${location.longitude},${location.latitude}`;
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(user.username, locationMessage)
    );
    cb();
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
