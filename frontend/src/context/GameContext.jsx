import { createContext, useState } from "react";

export const GameContext = createContext();

export const GameProvider = ({ children }) => {

  const [playerName, setPlayerName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [timer, setTimer] = useState(60);
  const [word, setWord] = useState("");

  return (
    <GameContext.Provider
      value={{
        playerName,
        setPlayerName,
        roomId,
        setRoomId,
        players,
        setPlayers,
        messages,
        setMessages,
        timer,
        setTimer,
        word,
        setWord
      }}
    >
      {children}
    </GameContext.Provider>
  );
};