// import { io } from "socket.io-client";

// const socket = io("http://localhost:3000");

// export default socket;

import { io } from "socket.io-client";

const socket = io(
  "https://scribble-game-task.onrender.com/",
  {
    transports: ["websocket"]
  }
);

export default socket;
