import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Card, Typography, Spin, Avatar, Tooltip } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, CloseOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { sendChatMessage, clearChatHistory } from '../redux/slices/aiSlice';

const { Text } = Typography;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();
  const { chatHistory, loading } = useSelector((state) => state.ai);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    dispatch(sendChatMessage(message));
    setMessage('');
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      dispatch(clearChatHistory());
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Tooltip title="Chat with AI Assistant">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<RobotOutlined />}
            onClick={toggleChat}
            className="shadow-lg hover:shadow-xl transition-all duration-300"
            style={{ 
              background: 'linear-gradient(45deg, #1890ff, #52c41a)',
              border: 'none',
              width: '60px',
              height: '60px'
            }}
          />
        </Tooltip>
      ) : (
        <Card
          className="shadow-xl rounded-lg w-96"
          style={{ maxHeight: '600px' }}
          title={
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <RobotOutlined className="text-xl mr-2" />
                <span>AI Assistant</span>
              </div>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={toggleChat}
                className="hover:bg-gray-100 rounded-full"
              />
            </div>
          }
          bodyStyle={{ padding: 0 }}
        >
          <div 
            className="p-4 overflow-y-auto"
            style={{ 
              height: '400px',
              background: 'linear-gradient(to bottom, #f0f2f5, #ffffff)'
            }}
          >
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex mb-4 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start max-w-[80%] ${
                    msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <Avatar
                    icon={msg.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    className={`${
                      msg.type === 'user'
                        ? 'bg-blue-500 ml-2'
                        : 'bg-green-500 mr-2'
                    }`}
                  />
                  <div
                    className={`rounded-lg p-3 ${
                      msg.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white shadow-sm'
                    }`}
                  >
                    <Text
                      className={`${
                        msg.type === 'user' ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {msg.content}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="flex items-start">
                  <Avatar icon={<RobotOutlined />} className="bg-green-500 mr-2" />
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <Spin size="small" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex items-center">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 mr-2"
                onPressEnter={handleSubmit}
                disabled={loading}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSubmit}
                loading={loading}
                className="flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(45deg, #1890ff, #52c41a)',
                  border: 'none'
                }}
              />
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default Chatbot; 