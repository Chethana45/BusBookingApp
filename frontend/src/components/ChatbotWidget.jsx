import React, { useState, useRef, useEffect } from 'react';

const initialMessages = [
  {
    id: 1,
    sender: 'bot',
    text: 'Hi! I am BusBuddy. I can help you find buses, check bookings, and answer travel-related questions. How can I assist you today?',
  },
];

const getDummyResponse = (message) => {
  const normalized = message.toLowerCase();

  if (normalized.includes('book')) {
    return 'To book a bus, search your route and choose a bus. I can guide you through seat selection next.';
  }
  if (normalized.includes('help') || normalized.includes('how')) {
    return 'You can search buses by entering your departure and destination cities. Then select a bus and proceed to payment.';
  }
  if (normalized.includes('history') || normalized.includes('booking')) {
    return 'Your booking history is available on the Booking History page. I can help you view completed and cancelled trips.';
  }
  if (normalized.includes('cancel')) {
    return 'If you need to cancel a booking, open your Booking History and choose the booking you want to cancel.';
  }
  if (normalized.includes('seat')) {
    return 'Seat selection is available after choosing a bus. You can pick your preferred seats from the bus layout.';
  }

  return 'Thanks for your message! I am a demo assistant and can help you explore the booking experience. Try asking about booking a bus, seat selection, or your booking history.';
};

const ChatbotWidget = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleToggle = () => {
    setIsOpen((current) => !current);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: getDummyResponse(trimmed),
      };
      setMessages((current) => [...current, botMessage]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className={`chatbot-widget ${isOpen ? 'open' : ''}`}>
      {/* <div className="chatbot-action-button" onClick={handleToggle}>
        <span>{isOpen ? '×' : '💬'}</span>
        <span className="chatbot-action-label">Help</span>
      </div> */}
      <button 
      className={`chatbot-button ${isOpen ? 'open' : ''}`} 
      onClick={handleToggle}
      >
        {isOpen ? '×' : '💬'}
        </button>


      {/*{isOpen && (*/}
        <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
          <div className="chatbot-header">
            <div>
              <h4>BusBuddy</h4>
              <p>Travel assistant</p>
            </div>
            <button className="chatbot-close" onClick={handleToggle} aria-label="Close chat">
              ×
            </button>
          </div>

          <div className="chatbot-messages" ref={messagesRef}>
            {messages.map((message) => (
              <div key={message.id} className={`chat-message ${message.sender}`}>
                <div className="chat-bubble">{message.text}</div>
              </div>
            ))}
            {/*{isTyping && (
              <div className="chat-message bot">
                <div className="message-bubble typing">BusBuddy is typing...</div>
              </div>
            )}*/}
            {isTyping && (
              <div className="chat-message bot">
                <div className="chat-bubble typing-indicator">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                 </div>      
              </div>
            )}

          </div>

          {/*<form className="chatbot-input-area" onSubmit={handleSubmit}>
            <input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Ask BusBuddy..."
              aria-label="Type a message"
            />
            <button type="submit">Send</button>
          </form>*/}
          <form className="chatbot-input-area" onSubmit={handleSubmit}>
              <input
                className="chatbot-input"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Ask BusBuddy..."
                aria-label="Type a message"
              />
              <button type="submit" className="chatbot-send">➤</button>
          </form>

        </div>
      {/*})}*/}
    </div>
  );
};

export default ChatbotWidget;
