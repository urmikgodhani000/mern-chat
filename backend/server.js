const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRouters = require("./routers/userRouters");
const chatRouters = require("./routers/chatRouters");
const messageRouters = require("./routers/messageRouters");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { Server, Socket } = require("socket.io");
const app = express();

dotenv.config();
connectDB();
app.use(express.json());

app.use("/api/user", userRouters);
app.use("/api/chat", chatRouters);
app.use("/api/message", messageRouters);

app.use(notFound);
app.use(errorHandler);

const PORT = 5000 || process.env.PORT;
const server = app.listen(PORT, console.log(`Server Start!! ${PORT}`));

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("Room " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecive) => {
    var chat = newMessageRecive.chat;

    if (!chat.users) {
      return console.log("chat.users not defined");
    }

    chat.users.forEach((user) => {
      if (user._id == newMessageRecive._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecive);
    });
  });
});
