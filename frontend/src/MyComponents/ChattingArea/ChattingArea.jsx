import { Box, Button, FormControl, Input, Text } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../ContextApi/Context";
import axios from "axios";
import io from "socket.io-client";

const EndPoint = "http://192.168.144.107:8000";
var socket, selectedChatCompare;

function ChattingArea() {
  const [newMessage, setNewMessage] = useState("");
  const [allMessage, setAllMessage] = useState([]);
  const { selectedChat } = useContext(MyContext);

  const [setsocketConnected, setSetsocketConnected] = useState(false);

  const loggedUserId = JSON.parse(localStorage.getItem("userInfo"))._id;
  const loggedUserName = JSON.parse(localStorage.getItem("userInfo")).name;
  const loggedUser = JSON.parse(localStorage.getItem("userInfo"));

  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      //   console.log(e);
      try {
        const { data } = await axios.post(
          "http://192.168.144.107:8000/chat/send",
          {
            chatId: selectedChat._id,
            content: newMessage,
          },
          {
            withCredentials: true,
          }
        );
        setNewMessage("");
        socket.emit("new message", data);
        setAllMessage([...allMessage, data]);

        console.log(allMessage);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    socket = io("http://192.168.144.107:8000");
    socket.emit("setup", loggedUser);
    socket.on("connection", () => setsocketConnected(true));
  }, []);

  const fetchMessage = async () => {
    if (!selectedChat) {
      return;
    }

    try {
      const { data } = await axios.get(
        `http://192.168.144.107:8000/chat/fetch/${selectedChat._id}`,
        {
          withCredentials: true,
        }
      );
      console.log(data);
      setAllMessage(data.message);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchMessage();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);
  // useEff
  useEffect(() => {
    fetchMessage();

    // selectedChatCompare = selectedChat;
  }, [allMessage]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      // console.log(newMessageRecieved);
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved._id
      ) {
      } else {
        setAllMessage([...allMessage, newMessageRecieved]);
      }
    });
  });

  const inputHandler = (e) => {
    setNewMessage(e.target.value);
    // console.log(e.target.value);
  };
  return (
    <>
      {/* chat render here */}
      <Box
        // m={2}
        // border={"2px solid pink"}
        flex={"1"}
        maxHeight={"85vh"}
        p={3}
        display={"flex"}
        flexDir={"column"}
        overflow={"auto"}
        css={{
          "&::-webkit-scrollbar": {
            width: "6px",
            backgroundColor: "#2f3136",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#202225",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#17181b",
          },
        }}
      >
        {allMessage.map((e) => (
          <span>
            <Text
              my={1}
              color={"black"}
              bg={e.sender._id == loggedUserId ? "#ff912a" : "#00ffe0"}
              display={"inline-block"}
              float={e.sender._id == loggedUserId ? "right" : ""}
              padding={1}
              //border radius:
              borderBottomRightRadius={
                e.sender._id == loggedUserId ? "0px" : "10px"
              }
              borderBottomLeftRadius={
                e.sender._id == loggedUserId ? "10px" : "0px"
              }
              borderTopLeftRadius={"10px"}
              borderTopRightRadius={"10px"}
            >
              {e.content}
            </Text>
          </span>
        ))}
      </Box>

      {/* Input field code */}
      <Box
        // border={"1px solid aqua"}
        flex={"0.07"}
        // flex={"1"}
        // p={1}
        pt={1}
        bg={"black"}
        position={"relative"}
        bottom={"0"}
        height={"10px"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <FormControl
          display={"flex"}
          flexDirection={"row"}
          px={2}
          onKeyDown={sendMessage}
          isRequired
          mt={"0.5"}
          //   border={"2px solid red"}
        >
          <Input
            placeholder={`Message @${loggedUserName}`}
            onChange={(e) => inputHandler(e)}
            value={newMessage}
            bg={"#212121"}
            height={10}
          />
          {/* <Button ml={1}>Send</Button> */}
        </FormControl>
      </Box>
    </>
  );
}

export default ChattingArea;
