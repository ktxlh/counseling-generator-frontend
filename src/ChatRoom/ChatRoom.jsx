import React, { useState, useEffect, useRef } from "react";
import ScrollToBottom from 'react-scroll-to-bottom';
import io from "socket.io-client";
import "./ChatRoom.css";
import Modal from "react-modal";
import {
  AlertDialog,
  AlertDialogLabel,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogContent,
} from "@reach/alert-dialog";

Modal.setAppElement("#root");

const ChatRoom = (props) => {
  // const { is_listener } = props.match.params;
  const listenerType = new URLSearchParams(props.location.search).get("type")
  const is_listener = (listenerType === "listener1" || listenerType === "listener2")// ? true ? listenerType === "client" : false : ""
  const show_predictions = listenerType === "listener2"
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [suggestionMessage, setSuggestionMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestion, setSuggestion] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [showDialog, setShowDialog] = React.useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setShowDialog(false);
  const cancelRef = React.useRef();
  const data = {
    "Grounding": "Facilitate or acknowledge.",
    "Open Question": "Pose a question that leaves a latitude for response.",
    "Closed Question": "Pose a question that implies a short answer, such as yes/no.",
    "Introduction/Greeting" : "Greet or exchange introductions with the client.",
    "Affirm" : "Say something positive or complimentary, possibly as reinforcement.",
    "Persuade" : "Ask for permission to change client's opinions, attitudes, or behavior.",
    "Reflection" : "Capture and return to the client something the client has said.",
    "Support" : "Be sympathetic towards the client's circumstances",
  }
  const textbox = document.getElementById("chat__input-textbox");
  
  // const suggestions = ["nice message", "click this", "howdy"]
  let socketRef = useRef()
  const messageRef = useRef()

  useEffect(() => {
    socketRef.current = io.connect('http://54.160.93.120',{path:'/api/socket.io', transports: ['polling']});
    socketRef.current.on("error", args => {
      alert("Received error from backend: " + args);
    });
  
    socketRef.current.on("new_message", args => {
      setMessages([...messages, { "is_listener": args["is_listener"], "utterance": args["utterance"] }]);
      setSuggestions(args["suggestions"]);  
      setPredictions(args["predictions"]);
      console.log("event emitted")
    });
  
    socketRef.current.on("dump_logs_success", () => {
      console.log("Dumped logs successfully");
    });

    return () => {
      messageRef.current.scrollIntoView({behavior: "smooth"})
      socketRef.current.disconnect();
    };
  }, [messages])

  // const handleNewMessageChange = (event) => {
  //   setNewMessage(event.target.value);
  // };

  // const handleSendMessage = () => {
  //   sendMessage(newMessage);
  //   setNewMessage("");
  // };

  const onChangeMessage = e => {
    setMessage(e.target.value);
  };

  // const open = (text) => {
  //   setShowDialog(true);
  //   setSuggestionMessage(data[text]);
  //   setSuggestion(text);
  // };

  const onSendMessage = (e) => {
    e.preventDefault()
    if (message !== "") {
      socketRef.current.emit("add_message", is_listener, message);
      setMessage("");
    } else {
      alert("Please add a message.");
    }
    textbox.focus();
  };

  const onSelectPred = x => {
    console.log(x, "messge")
    console.log(predictions.findIndex(i => i === x), "index")
    setMessage(x);
    socketRef.current.emit("log_click", is_listener, predictions.findIndex(i => i === x)); //["itte", "yye"]
    textbox.focus();
  };

  const onSelectSuggestion = x => {
    setSuggestion(x);
    setSuggestionMessage(data[x]);
    // toggleModal();
  };

  const onDumpLogs = () => {
    socketRef.current.emit("dump_logs");
  };

  const onClearSession = () => {
    socketRef.current.emit("clear_session");
  };

  // useEffect(() => {
  //   messageRef?.current.scrollIntoView({behavior: "smooth"})
  // }, [messages])

  const toggleModal = () => {
    setIsOpen(!isOpen);
    console.log(true);
  }

  return (
    <>
      <div className="chat">
        <header className="chat__header">
          <div className="chat__header-container">
            <div className="chat__header-item">
              <div className="chat__item-group">
              <div className="user-img-chat">{is_listener ? "M" : "L"}</div>
                {!is_listener ? "Listener" : "Member"}
              </div>
            </div>
            {!is_listener && <div className="chat__header-item">
              <div className="chat__item-group">
                <button onClick={() => onClearSession()} className="chat__button">Clear Session</button>
                <button onClick={() => onDumpLogs()} className="chat__button">Dump Logs</button>
              </div>
            </div>}

          </div>
        </header>
        <section className={`chat__body${!is_listener || suggestions.length == 0 ? "-empty" : ""}`}>
          <div className="chat__body-container" >
            <ScrollToBottom className="chat__messages-list">
              {messages?.length > 0 &&
                messages.map((message, i) => (
                  <li
                    key={i}
                    ref={messageRef}
                    className="chat__message-item"
                  > <div className="chat__message-container">
                    {message.is_listener !== is_listener ? <div className="user-img-chat">{message.is_listener ? "L" : "M"}</div> : <span></span>}
                    <div className={`
                    chat__message-message
                    ${
                      message.is_listener === is_listener ? "my-message" : "received-message"
                      }`
                    }>{message.utterance}</div>
                  </div>
                  </li>
                ))}
            </ScrollToBottom>
          </div>
        </section>
        <section className="chat__strategies">
          {show_predictions && is_listener && suggestions.length > 0 && <div className="chat__strategies-container">
            <div className="chat__strategies-group">
              {suggestions.map(i => (<button className={`chat__strategies-button f${suggestions.length}`} key = {i}>
                <span className="chat__strategies-code">{i}</span>
                <span className="chat__strategies-description">{data[i]}</span>
                </button>))}
              {/* {showDialog && (
                // <AlertDialog className = "alert-buttons" leastDestructiveRef={cancelRef}>

                //   <AlertDialogLabel className = "alert-dialog">{suggestion}: {suggestionMessage}</AlertDialogLabel>
                //   <button ref={cancelRef} onClick={close} className="alert_button">
                //       Click to continue
                //   </button>
                // </AlertDialog>
                <Modal
                  style={{opacity:1}}
                  isOpen={true}
                  onRequestClose={toggleModal}
                  contentLabel="Suggestion Description"
                >
                  <div>{suggestion}: {suggestionMessage}</div>
                </Modal>
              )} */}
            </div>
          </div>}
        </section>
        <section className="chat__suggestion">
          {show_predictions && is_listener && predictions.length > 0 && <div className="chat__suggestion-container">
            <div className="chat__suggestion-group">
              {predictions.map(i => (<button onClick={() => onSelectPred(i)} className={`chat__suggestion-button f${predictions.length}`} key = {i}>{i}</button>))}
            </div>
          </div>}
        </section>
        <section className="chat__input">
          <div className="chat__input-wrapper">
            <form onSubmit={onSendMessage}>
              <input id="chat__input-textbox" 
                value={message}
                onChange={onChangeMessage}
                placeholder="Type your message here..."
                autocomplete="off" />
              <button className="submit__icon">
                <img src="/send_button.png" alt="send button" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </>
    // <div className="chat-room-container">
    //   <h1 className="room-name">Room: {roomId}</h1>
    //   <h1 className="chat-ID">User ID: {userID}</h1>
    //   <div className="messages-container">
    //     <ol className="messages-list">
    // {messages.map((message, i) => (
    //   <li
    //     key={i}
    //     className={`message-item ${
    //       message.ownedByCurrentUser ? "my-message" : "received-message"
    //     }`}
    //   >
    //     {message.body}
    //   </li>
    // ))}
    //     </ol>
    //   </div>
    //   <textarea
    // value={newMessage}
    // onChange={handleNewMessageChange}
    // placeholder="Write message..."
    //     className="new-message-input-field"
    //   />
    //   <button onClick={handleSendMessage} className="send-message-button">
    //     Send
    //   </button>
    // </div>
  );
};

export default ChatRoom;
