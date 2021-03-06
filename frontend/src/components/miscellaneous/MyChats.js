import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import { Badge, Box, Button, Stack, Text } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import ChatLoding from "./ChatLoding";
import { getSender } from "../config/ChatLogics";
import GroupChatModal from "../miscellaneous/GroupChatModal";
import io from "socket.io-client";
const ENTPOINT = "https://mern-chat-webapp.herokuapp.com/";
var socket, selectedChatCompare;

export const MyChats = ({ fetchAgain }) => {
  const { user, SelectedChat, setSelectedChat, chats, setChats } = ChatState();
  const [loggedUser, setLoggedUser] = useState();
  const initialState = [];
  const [isOnline, setisOnline] = useState(initialState);
  const [data, setdata] = useState([]);
  const [socketConnected, setsocketConnected] = useState(false);
  const toast = useToast();

  useEffect(() => {
    socket = io(ENTPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setsocketConnected(true));
  }, []);

  useEffect(() => {
    socket.emit("login", user);
    socket.on("updateOnlineOrNot", (users) => {
      // setisOnline.push(`${users[property]}`);
      // console.log("uu" + `${users[property]}`);
      // setisOnline(users);

      setdata(users);
      //console.log(setisOnline);
      //console.log(SelectedChat._id);
    });
  }, [SelectedChat]);

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      //console.log(data);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);
  return (
    <Box
      display={{ base: SelectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        MyChats
        <GroupChatModal>
          <Button
            d="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>

      <Box
        d="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={SelectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={SelectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                  {chat.isGroupChat ? (
                    <></>
                  ) : (
                    <>
                      {data.some((u) =>
                        user._id === chat.users[0]._id
                          ? u.userId === chat.users[1]._id
                          : u.userId === chat.users[0]._id
                      ) ? (
                        <Badge
                          colorScheme="green"
                          marginLeft={2}
                          fontSize={10}
                          variant="subtle"
                          marginBottom={1}
                        >
                          Online
                        </Badge>
                      ) : (
                        <Badge
                          colorScheme="red"
                          marginLeft={2}
                          fontSize={10}
                          variant="subtle"
                          marginBottom={1}
                        >
                          Offline
                        </Badge>
                      )}
                    </>
                  )}
                </Text>

                {chat.latestMessage && (
                  <Text fontSize="xs">
                    <b>{chat.latestMessage.sender.name} : </b>
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoding />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
