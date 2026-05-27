import {
  useState,
  useContext,
  useEffect,
  useRef
} from "react";

import socket from "../socket/socket";

import { GameContext } from "../context/GameContext";

import {
  Send,
  MessageCircle,
  Trophy
} from "lucide-react";

function Chat({ roomId }) {

  const [message, setMessage] = useState("");

  const {
    messages,
    setMessages,
    playerName
  } = useContext(GameContext);

  const messagesEndRef = useRef(null);

  // AUTO SCROLL
  const scrollToBottom = () => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  };

  useEffect(() => {

    scrollToBottom();

  }, [messages]);

  useEffect(() => {

    // NORMAL CHAT
    socket.on("receiveMessage", (data) => {

      setMessages((prev) => [
        ...prev,
        {
          ...data,
          type: "message"
        }
      ]);

    });

    // CORRECT GUESS
    socket.on("correctGuess", (data) => {

      setMessages((prev) => [
        ...prev,
        {
          type: "correct",
          text: `${data.player} guessed correctly!`
        }
      ]);

    });

    return () => {

      socket.off("receiveMessage");

      socket.off("correctGuess");

    };

  }, []);

  // SEND MESSAGE
  const sendMessage = () => {

    if (!message.trim()) return;

    socket.emit("sendMessage", {
      roomId,
      message,
      playerName
    });

    setMessage("");

  };

  // ENTER PRESS
  const handleKeyDown = (e) => {

    if (e.key === "Enter") {

      sendMessage();

    }

  };

  return (
    <div className="flex flex-col h-full">

      {/* HEADER */}
      <div className="flex items-center gap-3 border-b border-base-300 pb-4 mb-4">

        <div className="p-3 rounded-2xl bg-primary text-primary-content shadow-lg">

          <MessageCircle size={22} />

        </div>

        <div>

          <h2 className="text-2xl font-black">
            Live Chat
          </h2>

          <p className="text-sm opacity-70">
            Guess the drawing in realtime
          </p>

        </div>

      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">

        {messages.length === 0 && (

          <div className="h-full flex items-center justify-center text-center opacity-60">

            <div>

              <MessageCircle
                size={50}
                className="mx-auto mb-3"
              />

              <p className="font-semibold">
                No messages yet
              </p>

              <p className="text-sm">
                Start guessing now!
              </p>

            </div>

          </div>

        )}

        {messages.map((msg, index) => {

          // CORRECT GUESS MESSAGE
          if (msg.type === "correct") {

            return (

              <div
                key={index}
                className="flex justify-center"
              >

                <div className="bg-success text-success-content px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm font-bold animate-pulse">

                  <Trophy size={16} />

                  {msg.text}

                </div>

              </div>

            );

          }

          // NORMAL MESSAGE
          const isMine =
            msg.playerName === playerName;

          return (

            <div
              key={index}
              className={`chat ${
                isMine
                  ? "chat-end"
                  : "chat-start"
              }`}
            >

              <div className="chat-header mb-1 text-xs opacity-70 font-semibold">

                {msg.playerName}

              </div>

              <div
                className={`chat-bubble break-words max-w-[80%] shadow-lg ${
                  isMine
                    ? "chat-bubble-primary"
                    : "chat-bubble-secondary"
                }`}
              >

                {msg.message}

              </div>

            </div>

          );

        })}

        <div ref={messagesEndRef} />

      </div>

      {/* INPUT AREA */}
      <div className="pt-4 mt-4 border-t border-base-300">

        <div className="flex items-center gap-3">

          <input
            type="text"
            placeholder="Type your guess..."
            className="input input-bordered w-full rounded-2xl focus:input-primary"
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            onKeyDown={handleKeyDown}
          />

          <button
            onClick={sendMessage}
            className="btn btn-primary rounded-2xl px-5"
          >

            <Send size={18} />

          </button>

        </div>

      </div>

    </div>
  );
}

export default Chat;