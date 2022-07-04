import { Box } from "@chakra-ui/react";
import React from "react";
import { ChatState } from "../../Context/ChatProvider";
import SingleChat from "../SingleChat";

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  const { SelectedChat } = ChatState();
  return (
    <Box
      display={{ base: SelectedChat ? "flex" : "none", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default ChatBox;
