import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import { GameProvider } from "./context/GameContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GameProvider>
    <App />
  </GameProvider>
);
