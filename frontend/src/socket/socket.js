// import { io } from "socket.io-client";

// const socket = io("http://localhost:3000");
//https://scribble-game-task.onrender.com/
// export default socket;

import { io } from "socket.io-client";

const socket = io(
  "http://localhost:3000",
  {
    autoConnect: true,

    reconnection: false,
  }
);

export default socket;
