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
  Trophy,
  Info,
  Crown
} from "lucide-react";

function Chat({ roomId, isDrawer }) {

  const [message, setMessage] =
    useState("");

  const [typingUser, setTypingUser] =
    useState("");

  const {
    messages,
    setMessages,
    playerName
  } = useContext(GameContext);

  const messagesEndRef =
    useRef(null);

  // =========================
  // AUTO SCROLL
  // =========================
  const scrollToBottom = () => {

    messagesEndRef.current
      ?.scrollIntoView({
        behavior: "smooth"
      });

  };

  useEffect(() => {

    scrollToBottom();

  }, [messages]);

  // =========================
  // SOCKET LISTENERS
  // =========================
  useEffect(() => {

    // REMOVE OLD LISTENERS
    socket.off("receiveMessage");

    socket.off("correctGuess");

    socket.off("correctGuessSelf");

    socket.off("playerGuessed");

    socket.off("systemMessage");

    socket.off("typing");

    socket.off("clearChat");

    // =========================
    // NORMAL CHAT
    // =========================
    socket.on(
      "receiveMessage",
      (data) => {

        setMessages((prev) => {

          const lastMessage =
            prev[prev.length - 1];

          // PREVENT DUPLICATE
          if (
            lastMessage?.type ===
              "message" &&
            lastMessage?.message ===
              data.message &&
            lastMessage?.playerName ===
              data.playerName
          ) {

            return prev;

          }

          return [
            ...prev,
            {
              ...data,
              type: "message"
            }
          ];

        });

      }
    );

    // =========================
    // CORRECT GUESS
    // =========================
    socket.on(
      "correctGuess",
      (data) => {

        // IGNORE FOR SAME PLAYER
        if (
          data.player ===
          playerName
        ) {

          return;

        }

        setMessages((prev) => {

          const lastMessage =
            prev[prev.length - 1];

          // PREVENT DUPLICATE
          if (
            lastMessage?.type ===
              "correct" &&
            lastMessage?.text ===
              `${data.player} guessed the word!`
          ) {

            return prev;

          }

          return [
            ...prev,
            {
              type: "correct",
              text:
                `${data.player} guessed the word!`
            }
          ];

        });

      }
    );

    // =========================
    // SELF CORRECT
    // =========================
    socket.on(
      "correctGuessSelf",
      (data) => {

        setMessages((prev) => {

          const lastMessage =
            prev[prev.length - 1];

          // PREVENT DUPLICATE
          if (
            lastMessage?.type ===
              "self-correct" &&
            lastMessage?.text ===
              data.text
          ) {

            return prev;

          }

          return [
            ...prev,
            {
              type:
                "self-correct",
              text: data.text
            }
          ];

        });

      }
    );

    // =========================
    // DRAWER INFO
    // =========================
    socket.on(
      "playerGuessed",
      (data) => {

        setMessages((prev) => {

          const lastMessage =
            prev[prev.length - 1];

          // PREVENT DUPLICATE
          if (
            lastMessage?.type ===
              "drawer-info" &&
            lastMessage?.text ===
              data.text
          ) {

            return prev;

          }

          return [
            ...prev,
            {
              type:
                "drawer-info",
              text: data.text
            }
          ];

        });

      }
    );

    // =========================
    // SYSTEM MESSAGE
    // =========================
    socket.on(
      "systemMessage",
      (data) => {

        setMessages((prev) => [

          ...prev,

          {
            type: "system",
            text: data.text
          }

        ]);

      }
    );

    // =========================
    // TYPING
    // =========================
    socket.on(
      "typing",
      (name) => {

        setTypingUser(name);

        setTimeout(() => {

          setTypingUser("");

        }, 1000);

      }
    );

    // =========================
    // CLEAR CHAT
    // =========================
    socket.on(
      "clearChat",
      () => {

        setMessages([]);

      }
    );

    return () => {

      socket.off(
        "receiveMessage"
      );

      socket.off(
        "correctGuess"
      );

      socket.off(
        "correctGuessSelf"
      );

      socket.off(
        "playerGuessed"
      );

      socket.off(
        "systemMessage"
      );

      socket.off("typing");

      socket.off(
        "clearChat"
      );

    };

  }, [
    playerName,
    setMessages
  ]);

  // =========================
  // SEND MESSAGE
  // =========================
  const sendMessage = () => {

    if (!message.trim())
      return;

    // DRAWER CANNOT GUESS
    if (isDrawer) return;

    socket.emit(
      "sendMessage",
      {
        roomId,
        message,
        playerName
      }
    );

    setMessage("");

  };

  // =========================
  // ENTER PRESS
  // =========================
  const handleKeyDown = (
    e
  ) => {

    if (e.key === "Enter") {

      sendMessage();

    }

  };

  // =========================
  // TYPING
  // =========================
  const handleTyping = (
    e
  ) => {

    setMessage(
      e.target.value
    );

    socket.emit(
      "typing",
      {
        roomId,
        playerName
      }
    );

  };

  return (

    <div className="flex flex-col h-full bg-base-200 rounded-3xl p-4 shadow-2xl border border-base-300">

      {/* HEADER */}
      <div className="flex items-center gap-3 border-b border-base-300 pb-4 mb-4">

        <div className="p-3 rounded-2xl bg-primary text-primary-content shadow-lg">

          <MessageCircle
            size={22}
          />

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

      {/* TYPING */}
      {typingUser &&
        typingUser !==
          playerName && (

          <div className="text-sm opacity-70 mb-3 italic">

            {typingUser} is
            typing...

          </div>

        )}

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">

        {messages.length ===
          0 && (

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

        {messages.map(
          (msg, index) => {

            // =========================
            // SYSTEM MESSAGE
            // =========================
            if (
              msg.type ===
              "system"
            ) {

              return (

                <div
                  key={`${msg.type}-${index}-${msg.text}`}
                  className="flex justify-center"
                >

                  <div className="bg-base-300 px-4 py-2 rounded-full text-sm flex items-center gap-2">

                    <Info
                      size={
                        16
                      }
                    />

                    {
                      msg.text
                    }

                  </div>

                </div>

              );

            }

            // =========================
            // CORRECT GUESS
            // =========================
            if (
              msg.type ===
              "correct"
            ) {

              return (

                <div
                  key={`${msg.type}-${index}-${msg.text}`}
                  className="flex justify-center"
                >

                  <div className="bg-success text-success-content px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm font-bold animate-pulse">

                    <Trophy
                      size={
                        16
                      }
                    />

                    {
                      msg.text
                    }

                  </div>

                </div>

              );

            }

            // =========================
            // SELF CORRECT
            // =========================
            if (
              msg.type ===
              "self-correct"
            ) {

              return (

                <div
                  key={`${msg.type}-${index}-${msg.text}`}
                  className="flex justify-center"
                >

                  <div className="bg-success text-success-content px-5 py-3 rounded-2xl shadow-lg font-bold flex items-center gap-2">

                    <Trophy
                      size={
                        18
                      }
                    />

                    {
                      msg.text
                    }

                  </div>

                </div>

              );

            }

            // =========================
            // DRAWER INFO
            // =========================
            if (
              msg.type ===
              "drawer-info"
            ) {

              return (

                <div
                  key={`${msg.type}-${index}-${msg.text}`}
                  className="flex justify-center"
                >

                  <div className="bg-warning text-warning-content px-5 py-3 rounded-2xl shadow-lg font-bold flex items-center gap-2">

                    <Crown
                      size={
                        18
                      }
                    />

                    {
                      msg.text
                    }

                  </div>

                </div>

              );

            }

            // =========================
            // NORMAL MESSAGE
            // =========================
            const isMine =
              msg.playerName ===
              playerName;

            return (

              <div
                key={`${msg.type}-${index}-${msg.message}`}
                className={`chat ${
                  isMine
                    ? "chat-end"
                    : "chat-start"
                }`}
              >

                <div className="chat-header mb-1 text-xs opacity-70 font-semibold">

                  {
                    msg.playerName
                  }

                </div>

                <div
                  className={`chat-bubble break-words max-w-[80%] shadow-lg ${
                    isMine
                      ? "chat-bubble-primary"
                      : "chat-bubble-secondary"
                  }`}
                >

                  {
                    msg.message
                  }

                </div>

              </div>

            );

          }
        )}

        <div
          ref={
            messagesEndRef
          }
        />

      </div>

      {/* INPUT */}
      <div className="pt-4 mt-4 border-t border-base-300">

        {isDrawer ? (

          <div className="bg-warning text-warning-content rounded-2xl p-4 text-center font-bold shadow-lg">

            You are drawing
            right now 🎨

          </div>

        ) : (

          <div className="flex items-center gap-3">

            <input
              type="text"
              placeholder="Type your guess..."
              className="input input-bordered w-full rounded-2xl focus:input-primary"
              value={message}
              onChange={
                handleTyping
              }
              onKeyDown={
                handleKeyDown
              }
              maxLength={50}
            />

            <button
              onClick={
                sendMessage
              }
              className="btn btn-primary rounded-2xl px-5 shadow-lg"
            >

              <Send
                size={18}
              />

            </button>

          </div>

        )}

      </div>

    </div>

  );

}

export default Chat;