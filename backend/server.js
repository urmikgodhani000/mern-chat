const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRouters = require("./routers/userRouters");
const chatRouters = require("./routers/chatRouters");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const app = express();

dotenv.config();
connectDB();
app.use(express.json());

app.use("/api/user", userRouters);
app.use("/api/chat", chatRouters);

app.use(notFound);
app.use(errorHandler);

const PORT = 5000 || process.env.PORT;
app.listen(PORT, console.log(`Server Start!! ${PORT}`));
