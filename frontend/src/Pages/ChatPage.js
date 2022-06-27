import { Box } from "@chakra-ui/layout";
import Chatbox from "../components/miscellaneous/ChatBox";
import MyChats from "../components/miscellaneous/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const ChatPage = () => {
  const { user } = ChatState();

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        h="91.5vh"
        p="10px"
      >
        {user && <MyChats />}
        {user && <Chatbox />}
      </Box>
    </div>
  );
};

export default ChatPage;
