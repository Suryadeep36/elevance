"use client";

import { useState } from "react";
import {
  Paperclip,
  Send,
  PlusCircle,
  MessageSquare,
  Trash2,
  Edit2,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
// import { BackgroundLines } from "@/app/component/ui/BackgroundLines";
import ReactMarkdown from "react-markdown";

interface Message {
  text: string;
  sender: "user" | "bot";
  file?: File | null;
}

type Chats = {
  [chatId: string]: Message[];
};

type ChatTitles = {
  [chatId: string]: string;
};

const Chatbot = () => {
  const [activeChat, setActiveChat] = useState<string>("default");

  const [allChats, setAllChats] = useState<Chats>({
    default: [{ text: "Hello! How can I help you today?", sender: "bot" }],
  });

  const [loader, setLoader] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [chatTitles, setChatTitles] = useState<ChatTitles>({
    default: `chat_${Date.now()}`,
  });
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newChatTitle, setNewChatTitle] = useState<string>("");

  const messages = allChats[activeChat] || [];

  async function apicall(userInput: string): Promise<string> {
    const response = await axios.post("http://localhost:8000/query", {
      query: userInput,
    });
    return response.data.answer;
  }

  const createNewChat = () => {
    const chatId = `chat_${Date.now()}`;
    setAllChats((prev) => ({
      ...prev,
      [chatId]: [{ text: "Hello! How can I help you today?", sender: "bot" }],
    }));
    setChatTitles((prev) => ({
      ...prev,
      [chatId]: chatId,
    }));
    setActiveChat(chatId);
  };

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newChats = { ...allChats };
    delete newChats[chatId];
    setAllChats(newChats);

    const newChatTitles = { ...chatTitles };
    delete newChatTitles[chatId];
    setChatTitles(newChatTitles);

    if (chatId === activeChat) {
      const remainingChats = Object.keys(newChats);
      if (remainingChats.length > 0) {
        setActiveChat(remainingChats[0]);
      } else {
        createNewChat();
      }
    }
  };

  const startRenameChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chatId);
    setNewChatTitle(chatTitles[chatId] || formatChatTitle(chatId, allChats[chatId]));
  };

  const saveRenameChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingChatId && newChatTitle.trim()) {
      setChatTitles((prev) => ({
        ...prev,
        [editingChatId]: newChatTitle.trim(),
      }));
      setEditingChatId(null);
      setNewChatTitle("");
    }
  };

  const cancelRenameChat = () => {
    setEditingChatId(null);
    setNewChatTitle("");
  };

  const sendMessage = async () => {
    if (!input.trim() && !file) return;

    const newMessages: Message[] = [...messages, { text: input, sender: "user", file }];

    setAllChats((prev) => ({
      ...prev,
      [activeChat]: newMessages,
    }));

    if (!chatTitles[activeChat] || chatTitles[activeChat] === "New Conversation") {
      const firstUserMessage = input.trim();
      if (firstUserMessage) {
        const autoTitle =
          firstUserMessage.length > 20
            ? `${firstUserMessage.slice(0, 20)}...`
            : firstUserMessage;

        setChatTitles((prev) => ({
          ...prev,
          [activeChat]: autoTitle,
        }));
      }
    }

    setInput("");
    setFile(null);

    const data = await apicall(input);

    setAllChats((prev) => ({
      ...prev,
      [activeChat]: [...newMessages, { text: data, sender: "bot" }],
    }));
  };

  const formatChatTitle = (chatId: string, messages: Message[]): string => {
    if (chatTitles[chatId]) return chatTitles[chatId];
    if (chatId === "default") return "New Conversation";

    const firstUserMessage = messages.find((msg) => msg.sender === "user");
    if (firstUserMessage) {
      const title = firstUserMessage.text.slice(0, 20);
      return title.length < firstUserMessage.text.length ? `${title}...` : title;
    }

    return "New Conversation";
  };

  return (
    <div className="bg-zinc-950 h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* <BackgroundLines className="bg-zinc-950 absolute inset-0" /> */}

      <div className="z-20 w-full max-w-6xl h-[80vh] flex relative mt-16">
        {/* Sidebar */}
        <motion.div
          className="bg-zinc-900 border-r border-zinc-800 h-full overflow-hidden"
          initial={{ width: sidebarOpen ? "250px" : "0px" }}
          animate={{ width: sidebarOpen ? "250px" : "0px" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="p-4 flex flex-col h-full">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={createNewChat}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-3 mb-4 w-full"
            >
              <PlusCircle size={18} />
              <span>New Chat</span>
            </motion.button>

            {/* Chat history */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {Object.entries(allChats).map(([chatId, chatMessages]) => (
                <motion.div
                  key={chatId}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => editingChatId !== chatId && setActiveChat(chatId)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${activeChat === chatId ? "bg-zinc-700" : "bg-zinc-800 hover:bg-zinc-700"
                    }`}
                >
                  {editingChatId === chatId ? (
                    <form onSubmit={saveRenameChat} className="flex-1 flex items-center">
                      <input
                        type="text"
                        value={newChatTitle}
                        onChange={(e) => setNewChatTitle(e.target.value)}
                        className="flex-1 bg-zinc-600 text-white text-sm p-1 rounded outline-none"
                        autoFocus
                        onBlur={cancelRenameChat}
                        onKeyDown={(e) => e.key === "Escape" && cancelRenameChat()}
                      />
                      <button type="submit" className="ml-2 text-green-500">
                        <Send size={14} />
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <MessageSquare size={16} className="text-gray-400 shrink-0" />
                        <span className="text-white text-sm truncate">
                          {formatChatTitle(chatId, chatMessages)}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.8 }}
                          onClick={(e) => startRenameChat(chatId, e)}
                          className="text-gray-400 hover:text-blue-500"
                        >
                          <Edit2 size={14} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.8 }}
                          onClick={(e) => deleteChat(chatId, e)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main chat area */}
        <motion.div
          className="flex-1 border-zinc-800 border-2 rounded-lg shadow-lg flex flex-col overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white p-1"
            >
              {/* Sidebar Icon */}
              {sidebarOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
            <h1 className="text-xl font-bold text-white">
              {formatChatTitle(activeChat, messages)}
            </h1>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto space-y-3 p-4 scrollbar-thin scrollbar-thumb-gray-600">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[80%] break-words text-white shadow-md ${msg.sender === "user"
                      ? "bg-gradient-to-r from-purple-600 to-blue-500"
                      : "bg-gradient-to-r from-zinc-700 to-zinc-800"
                    }`}
                >
                  {/* {msg.text} */}
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                  {msg.file && (
                    <div className="mt-2 p-2 bg-zinc-800 rounded text-xs flex items-center gap-1">
                      <Paperclip size={12} />
                      {msg.file.name}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input and send button */}
          <motion.div
            className="p-4 border-t border-zinc-800"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-2 bg-zinc-800 rounded-lg p-1 pl-3">
              <label className="cursor-pointer text-gray-400 hover:text-white">
                <Paperclip size={20} />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e : any) => setFile(e.target.files[0])}
                />
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 bg-transparent text-white outline-none"
                onKeyUp={(e) => e.key === "Enter" && sendMessage()}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={sendMessage}
                className="bg-gradient-to-r from-purple-600 to-blue-500 text-white p-2 rounded-lg"
              >
                <Send size={20} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Chatbot;