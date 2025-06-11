import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaCompress, FaExpand } from 'react-icons/fa';
import axios from 'axios';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5003/chat', {
        message: input
      });
      
      const botMessage = { text: response.data.response, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { text: 'Sorry, I encountered an error. Please try again.', sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 w-96 bg-[#181818] border border-[#292929] rounded-lg shadow-xl flex flex-col text-pink-500">
        <div className="bg-[#232323] text-white p-4 rounded-lg flex items-center justify-between border-b border-[#292929]">
          <div className="flex items-center">
            <FaRobot className="mr-2 text-pink-500" />
            <h3 className="font-semibold">AI Assistant</h3>
          </div>
          <button
            onClick={toggleMinimize}
            className="text-pink-400 hover:text-pink-300 transition-colors"
          >
            <FaExpand />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-[#181818] border border-[#292929] rounded-lg shadow-xl flex flex-col text-pink-500">
      <div className="bg-[#232323] text-white p-4 rounded-t-lg flex items-center justify-between border-b border-[#292929]">
        <div className="flex items-center">
          <FaRobot className="mr-2 text-pink-500" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <button
          onClick={toggleMinimize}
          className="text-pink-400 hover:text-pink-300 transition-colors"
        >
          <FaCompress />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#181818]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-pink-500 text-white'
                  : 'bg-[#232323] text-pink-200'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#232323] text-pink-200 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-[#292929] bg-[#181818]">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-[#232323] text-pink-200 border-[#292929]"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-pink-500 text-white p-2 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
          >
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot; 