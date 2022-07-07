import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  toast,
  Image,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import { getSender, getSenderFull } from "./config/ChatLogics";
import Profile from "./miscellaneous/Profile";
import UpdateGroupChat from "./miscellaneous/UpdateGroupChat";
//import ScrollbleChat from "./ScrollbleChat";
import "./styles.css";
import { Tooltip } from '@chakra-ui/react'

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { user, SelectedChat, setSelectedChat } = ChatState();
  const [message, setMessage] = useState([]);
  const [loading, setloading] = useState(false);
  const [newMessage, setnewMessage] = useState();
  const toast = useToast();

  const fatchMessage = async () => {
    if (!SelectedChat) {
      return;
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      setloading(true);
      const { data } = await axios.get(
        `/api/message/${SelectedChat._id}`,
        config
      );

      console.log(message);
      setMessage(data);
      setloading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    fatchMessage();
    // const chatMessages = document.querySelector(".msg");
    // chatMessages.scrollTop = chatMessages.scrollHeight;
  }, [SelectedChat]);

  const sendMessage = async (event) => {
    if (event.key == "Enter" && newMessage) {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.post(
          "api/message",
          {
            content: newMessage,
            chatId: SelectedChat._id,
          },
          config
        );

        console.log(data);
        setnewMessage("");
        setMessage([...message, data]);
        const chatMessages = document.querySelector(".messages");
        chatMessages.scrollTop = chatMessages.scrollHeight;
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to Load the Search Results",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
      }
    }
  };

  const typingHandler = (e) => {
    setnewMessage(e.target.value);
  };

  return (
    <>
      {SelectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!SelectedChat.isGroupChat ? (
              <>
                {getSender(user, SelectedChat.users)}
                <Profile user={getSenderFull(user, SelectedChat.users)} />
              </>
            ) : (
              <>
                {SelectedChat.chatName.toUpperCase()}
                <UpdateGroupChat
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fatchMessage={fatchMessage}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="chatContainer">
                <div className="messages" id="temp">
                  {message.map((val, key) => {
                    return (
                      <div
                        className="messageContainer"
                        id={val.sender.name === user.name ? "You" : "Other"}
                      >
                        <div className="messageIndividual">
                          {val.sender.name === user.name ? '' : 
                          <Tooltip label={val.sender.name}>
                            <Image
                            borderRadius="full"
                            boxSize="20px"
                            textAlign="center"
                            src={val.sender.pic}
                            alt={val.sender.name}
                            className='profileImage'
                            />
                        </Tooltip>
                      
                      }
                       
                      <p>{val.content}</p>
                          
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message.."
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
