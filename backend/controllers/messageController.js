const asyncHandler = require("express-async-handler");
const Chat = require("../Models/chatModel");
const Message = require("../Models/messageModel");
const User = require("../Models/userModel");

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalide data pass");
    return res.sendStatus(400);
  }

  var newMsg = { sender: req.user._id, content: content, chat: chatId };
  try {
    var msg = await Message.create(newMsg);
    msg = await msg.populate("sender", "name pic");
    msg = await msg.populate("chat");
    msg = await User.populate(msg, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: msg,
    });

    res.json(msg);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const allMessage = asyncHandler(async (req, res) => {
  try {
    const msg = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic")
      .populate("chat");

    console.log(msg);
    res.json(msg);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { sendMessage, allMessage };
