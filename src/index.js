const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const http = require("http");
const Filter = require("bad-words");
const { generateMessage } = require("./utils/messages");
const { getUser, getRoomUsers, removeUser, addUser } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicPath = path.join(__dirname, "../public");

app.use(express.static(publicPath));
//on user connection ie when user joins the chat
io.on("connection", (socket) => {
  console.log("websocket new connection");

  //when a user wants to join a chat
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("message", generateMessage("welcome!", "Admin"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage(`${user.username} has joined`));

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
    callback();
  });

  //message from client to server
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", generateMessage(message, user.username));
    callback("delivered");
  });

  //sharing location with other users
  socket.on("share-location", (location, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "location",
      generateMessage(
        `https://google.com/maps?q=${location.latitude},${location.longitude}`,
        user.username
      )
    );
    callback();
  });

  //on user disconnect ie when a user leaves the chat
  socket.on("disconnect", () => {
    const removedUser = removeUser(socket.id);
    if (removedUser) {
      io.to(removedUser.room).emit(
        "message",
        `${removedUser.username} has left`
      );
      io.to(removedUser.room).emit("roomData", {
        room: removedUser.room,
        users: getRoomUsers(removedUser.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log("app now running on port " + port);
});
