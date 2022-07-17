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

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

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

let users = [];
const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("login", function (userData) {
    addUser(userData._id, socket.id);
    io.emit("updateOnlineOrNot", users);
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

  socket.on("disconnect", () => {
    console.log("⚠️ Someone disconnected");
    removeUser(socket.id);
    io.emit("updateOnlineOrNot", users);
    // console.log(users);
  });
});
