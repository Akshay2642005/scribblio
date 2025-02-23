import { useState, useEffect, useRef } from "react";

interface ChatProps {
  socket: any;
  roomId: string;
}

export const Chat: React.FC<ChatProps> = ({ socket, roomId }) => {
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to the latest message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Listen for incoming messages in the correct room
    const handleIncomingMessage = (data: { user: string; text: string; roomId: string }) => {
      if (data.roomId === roomId) {
        setMessages((prev) => [...prev, { user: data.user, text: data.text }]);
      }
    };

    socket.on("chat", handleIncomingMessage);

    return () => {
      socket.off("chat", handleIncomingMessage);
    };
  }, [socket, roomId]);

  const sendMessage = () => {
    if (message.trim() && username.trim()) {
      const chatMessage = { user: username, text: message, roomId };
      socket.emit("chat", chatMessage);
      setMessages((prev) => [...prev, { user: "You", text: message }]);
      setMessage("");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 w-80 h-96 flex flex-col">
      <h2 className="text-lg font-bold mb-2">Chat Room</h2>

      {/* Username Input */}
      {!username && (
        <div className="mb-2">
          <input
            type="text"
            placeholder="Enter your name"
            className="border p-2 w-full rounded"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto border p-2 rounded mb-2">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-1 ${msg.user === "You" ? "text-blue-600" : "text-gray-800"}`}>
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="border p-2 flex-1 rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="bg-blue-500 text-white px-3 py-2 rounded" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};
