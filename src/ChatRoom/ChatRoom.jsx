import React, { useState, useEffect, useRef } from "react";
import ScrollToBottom from 'react-scroll-to-bottom';
import io from "socket.io-client";
import "./ChatRoom.css";
import Modal from "react-modal";
import Collapse from 'react-collapse';

Modal.setAppElement("#root");

const ChatRoom = (props) => {
  // const { is_listener } = props.match.params;
  const listenerType = new URLSearchParams(props.location.search).get("type")
  const is_listener = (listenerType === "listener1" || listenerType === "listener2")// ? true ? listenerType === "client" : false : ""
  const show_predictions = listenerType === "listener2"
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [showDialog, setShowDialog] = React.useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [toggleText, setToggleText] = useState("↓ Hide example ↓");
  const [isTypingText, setIsTypingText] = useState("");
  const close = () => setShowDialog(false);
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
  const isTypingMark = document.getElementById("chat__is-typing");
  
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

    socketRef.current.on("is_typing", args => {
      if (is_listener !== args["is_listener"]) {
        setIsTypingText(args["is_typing"] ? "Member is typing..." : "");
      }
    });

    return () => {
      messageRef.current.scrollIntoView({behavior: "smooth"})
      socketRef.current.disconnect();
    };
  }, [messages])

  const onChangeMessage = e => {
    if ((message === "") !== (e.target.value === "")) {
      socketRef.current.emit("is_typing", e.target.value !== "", is_listener);
    }
    setMessage(e.target.value);
  };

  const onSendMessage = (e) => {
    e.preventDefault()
    socketRef.current.emit("is_typing", false, is_listener);
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
    socketRef.current.emit("is_typing", true, is_listener);
    socketRef.current.emit("log_click", predictions.findIndex(i => i === x)); //["itte", "yye"]
    textbox.focus();
  };

  const onDumpLogs = () => {
    socketRef.current.emit("dump_logs");
  };

  const onClearSession = () => {
    socketRef.current.emit("clear_session");
  };

  const onClickShowButton = () => {
    setToggleText(isOpen ? "↑ Show example ↑" : "↓ Hide example ↓");
    socketRef.current.emit("log_click", isOpen ? -1 : -2); //["itte", "yye"]
    setIsOpen(!isOpen);
  };

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
                    {message.is_listener !== is_listener ? <div className="user-img-chat">{message.is_listener ? i + 1 : "M"}</div> : <span></span>}
                    <div className={`
                    chat__message-message
                    ${
                      message.is_listener === is_listener ? "my-message" : "received-message"
                      }`
                    }>{message.utterance}</div>
                  </div>
                  </li>
                ))}
                <div className="chat__message-container">
                    <div id="chat__is-typing">{isTypingText}</div>
                  </div>
            </ScrollToBottom>
          </div>
        </section>
        <section>
          {show_predictions && is_listener && suggestions.length > 0 && <button className="chat__show-button" onClick={onClickShowButton}>{toggleText}</button>}
        </section>
        <section className="chat__strategies">
          {show_predictions && is_listener && suggestions.length > 0 && <Collapse isOpened={isOpen}><div className="chat__strategies-container">
            <div className="chat__strategies-group">
              {suggestions.map(i => (<button className={`chat__strategies-button f${suggestions.length}`} key = {i}>
                <span className="chat__strategies-code">{i}</span>
                <span className="chat__strategies-description">{data[i]}</span>
                </button>))}
            </div>
          </div></Collapse>}
        </section>
        <section className="chat__suggestion">
          {show_predictions && is_listener && predictions.length > 0 && <Collapse isOpened={isOpen}><div className="chat__suggestion-container">
            <div className="chat__suggestion-group">
              {predictions.map(i => (<button onClick={() => onSelectPred(i)} className={`chat__suggestion-button f${predictions.length}`} key = {i}>{i}</button>))}
            </div>
          </div></Collapse>}
        </section>
        <section className="chat__input">
          <div className="chat__input-wrapper">
            <form onSubmit={onSendMessage}>
              <input id="chat__input-textbox" 
                value={message}
                onChange={onChangeMessage}
                placeholder="Type your message here..."
                autocomplete="off" 
                autofocus />
              <button className="submit__icon">
                <img src="/send_button.png" alt="send button" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
};

export default ChatRoom;
