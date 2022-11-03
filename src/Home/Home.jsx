import React from "react";
import { Link, useHistory } from "react-router-dom";

import "./Home.css";

{/*let endPoint = "http://54.160.93.120/api";
let socket = io.connect(`${endPoint}`);
*/}
var io = require("socket.io-client");

console.log("HI, Here 1");

var socket = io.connect('http://54.160.93.120',{ path :'/api/socket.io', transports: ['polling']});

socket.on('connect_error', function(){console.log("failed")});
socket.on('connection',() => {console.log(socket);});
socket.send("Connected");
console.log("HI, Here 2",socket, socket.connected);

socket.on("error", args => {
  alert("Received error from backend: " + args);
});
var history;
socket.on("login_response", args => {
  console.log("login response")
  if (!args["valid"]) {
    console.log("Logged in failed");
    alert("Invalid login. Check your input.");
  }
  else {
    // setListener(args["is_listener"]);
    console.log("Logged in successfully");
    let room = args["is_listener"]
    let type = args["show_suggestions"]
    if (room && type) {
      history.push(`/room?type=${"listener2"}`);
    } else if (room) {
      history.push(`/room?type=${"listener1"}`);
    } else {
      history.push(`/room?type=${"client"}`);
    }
  }
});

const Home = () => {
  history = useHistory()
  const [chat_id, setChatId] = React.useState("");
  const [user_id, setUserId] = React.useState("");
  const listenerCode = "listener";
  const clientCode = "client";
  //const validIds = ["listener7", "client8"]

  const handleChatIDChange = (event) => {
    setChatId(event.target.value);
  };

  const handleUserIDChange = (event) => {
    setUserId(event.target.value);
  }

  const onLogIn = () => {
    socket.emit("log_user", chat_id, user_id);
  };

  const handleSubmit = e => {
    e.preventDefault();
    onLogIn();
    // if(!roomName) return alert("Chat ID cannot be empty")
    // if(!validIds.includes(userID)) return alert("Invalid User ID,")
    // console.log(chat_id);
    // console.log(is_listener);
  }

  // const [role, setRole] = React.useState('listener');

  // const handleRoleChange = (event) => {
  //   setRole(event.target.value);
  // }

//   const Dropdown = ({ label, value, options, onChange }) => {
//   return (
//     <label>
//       {label}
//       <select value={value} onChange={onChange}>
//         {options.map((option) => (
//           <option value={option.value}>{option.label}</option>
//         ))}
//       </select>
//     </label>
//   );
// };

  return (
    <>
      <div className="home">
        <div className="home__container">
        <h1 className="home__title">Chat Demo</h1>
          <div className="home__form">
            <form onSubmit={handleSubmit}>
              <div className="home__form-input">
                <input onChange={handleChatIDChange} type="text" placeholder="Chat ID" />
              </div>
              <div className="home__form-input">
                <input onChange={handleUserIDChange} type="text" placeholder="User ID" />
              </div>
              <input type="submit" value="Join the chat" />
            </form>
          </div>
        </div>
      </div>
    </>
    // <div className="home-container">
    //   <div className="form">
    //     <h1 className="title">7 Cups Demo</h1>
    //   </div>
    //   <input
    //     type="text"
    //     placeholder="Chat ID"
    //     value={roomName}
    //     onChange={handleRoomNameChange}
    //     className="text-input-field"
    //   />
    //   <input
    //     type="text"
    //     placeholder="User ID"
    //     value={userID}
    //     onChange={handleUserIDChange}
    //     className="text-input-field"
    //   />
      // <Link to={`/${roomName, userID}`} className="enter-room-button">
      //   Join Chat
      // </Link>
    //   {/* <Dropdown
    //     options={[
    //       { label: 'Listener', value: 'listener' },
    //       { label: 'Client', value: 'client' },
    //     ]}
    //     value={role}
    //     onChange={handleRoleChange}
    //     className="role-dropdown"
    //   /> */}
    // </div>
  );
};

export default Home;
