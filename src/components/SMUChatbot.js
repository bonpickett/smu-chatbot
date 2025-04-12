import React, { useState, useRef, useEffect } from 'react';
import './SMUChatbot.css';
import { smuData } from './smuData';

const SMUChatbot = () => {
  const [messages, setMessages] = useState([
    {
      text: "Hi Mustang! I'm Peruna Bot. I can help you find involvement and leadership opportunities at SMU. What are you interested in?",
      sender: 'bot',
      options: [
        "Student Organizations",
        "Leadership Programs",
        "Campus Events",
        "Volunteer Opportunities",
        "Greek Life"
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Find relevant information from data
  const findRelevantInfo = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    return smuData.filter(item => {
      // Check if query contains category
      if (item.category.toLowerCase().includes(lowerCaseQuery)) return true;
      
      // Check if query contains any tags
      if (item.tags.some(tag => lowerCaseQuery.includes(tag.toLowerCase()))) return true;
      
      // Check if item text contains query words (simple keyword search)
      const queryWords = lowerCaseQuery.split(' ')
        .filter(word => word.length > 3); // Only use meaningful words
      
      return queryWords.some(word => 
        item.text.toLowerCase().includes(word)
      );
    }).slice(0, 3); // Return top 3 matches
  };

  // Get response based on user input
  const getBotResponse = (userMessage) => {
    const lowerCaseMsg = userMessage.toLowerCase();
    let baseResponse = {};
    
    // Get relevant information from data
    const relevantInfo = findRelevantInfo(userMessage);
    
    if (lowerCaseMsg.includes('organization') || lowerCaseMsg.includes('club')) {
      baseResponse = {
        text: "SMU has over 200 student organizations! You can explore them all on SMU Connect. What type of organization interests you?",
        options: ["Academic", "Cultural", "Service", "Religious", "Special Interest"]
      };
    } else if (lowerCaseMsg.includes('leadership')) {
      baseResponse = {
        text: "Great! SMU offers many leadership development opportunities including the Crain Leadership Summit, Emerging Leaders, and the Caswell Leadership Program.",
        options: ["Tell me more about Crain", "What is Emerging Leaders?", "Caswell Leadership details", "Other leadership options"]
      };
    } else if (lowerCaseMsg.includes('event')) {
      baseResponse = {
        text: "Check out upcoming campus events on the SMU360 portal or the Student Affairs calendar. There's always something happening on campus!",
        options: ["This week's events", "Major annual events", "How to submit an event"]
      };
    } else if (lowerCaseMsg.includes('volunteer') || lowerCaseMsg.includes('service')) {
      baseResponse = {
        text: "The Office of Community Engagement has great volunteer opportunities! You can also check out service-focused student organizations like Mustang Heroes.",
        options: ["Weekly service projects", "Alternative Breaks", "Community Partners"]
      };
    } else if (lowerCaseMsg.includes('greek') || lowerCaseMsg.includes('fraternity') || lowerCaseMsg.includes('sorority')) {
      baseResponse = {
        text: "SMU has a vibrant Greek life with multiple councils including IFC, Panhellenic, NPHC, and MGC. Recruitment typically happens at the beginning of each semester.",
        options: ["Fraternity recruitment", "Sorority recruitment", "Multicultural Greek options"]
      };
    } else if (lowerCaseMsg.includes('academic')) {
      baseResponse = {
        text: "SMU has academic organizations across all disciplines! Many are affiliated with specific majors or colleges. Which school are you in?",
        options: ["Cox School of Business", "Dedman College", "Meadows School of the Arts", "Lyle School of Engineering", "Simmons School of Education"]
      };
    } else {
      baseResponse = {
        text: "I'm here to help you find involvement opportunities at SMU! Would you like to know about student organizations, leadership programs, events, or something else?",
        options: ["Student Organizations", "Leadership Programs", "Campus Events", "Volunteer Opportunities", "Greek Life"]
      };
    }
    
    // Enhance response with relevant information if available
    if (relevantInfo.length > 0) {
      // Add the most relevant information to the response
      baseResponse.text = baseResponse.text + "\n\n" + relevantInfo[0].text;
      
      // Add additional options based on relevant info
      if (relevantInfo.length > 1) {
        const additionalOptions = relevantInfo.slice(1).map(info => {
          const firstSentence = info.text.split('.')[0] + '.';
          return firstSentence.substring(0, 50) + (firstSentence.length > 50 ? '...' : '');
        });
        
        baseResponse.options = [...baseResponse.options.slice(0, 3), ...additionalOptions];
      }
    }
    
    return baseResponse;
  };

  const handleSend = () => {
    if (input.trim() === '') return;
    
    // Add user message
    setMessages([...messages, { text: input, sender: 'user' }]);
    setInput('');
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const response = getBotResponse(input);
      setMessages(prev => [...prev, { 
        text: response.text, 
        sender: 'bot',
        options: response.options
      }]);
      setLoading(false);
    }, 600);
  };

  const handleOptionClick = (option) => {
    // Add user selection as a message
    setMessages([...messages, { text: option, sender: 'user' }]);
    setLoading(true);
    
    // Simulate API delay  
    setTimeout(() => {
      const response = getBotResponse(option);
      setMessages(prev => [...prev, { 
        text: response.text, 
        sender: 'bot',
        options: response.options
      }]);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="chatbot-container">
      {/* Header */}
      <header className="chatbot-header">
        <div className="header-left">
          <div className="logo-container">
            <span className="logo-text">P</span>
          </div>
          <div>
            <h1 className="header-title">SMU Student Involvement</h1>
            <p className="header-subtitle">Find your place at SMU</p>
          </div>
        </div>
        <div className="header-links">
          <a href="https://www.smu.edu/StudentAffairs" target="_blank" rel="noreferrer">
            Student Affairs
          </a>
          <a href="https://www.smu.edu/360" target="_blank" rel="noreferrer">
            SMU360
          </a>
        </div>
      </header>

      {/* Chat messages */}
      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <div className="message-bubble">
              {message.sender === 'bot' && (
                <div className="bot-header">
                  <div className="bot-avatar">
                    <span>SMU</span>
                  </div>
                  <span className="bot-name">Peruna Bot</span>
                </div>
              )}
              <p className="message-text">{message.text}</p>
              
              {/* Quick reply options */}
              {message.sender === 'bot' && message.options && (
                <div className="options-container">
                  {message.options.map((option, i) => (
                    <button 
                      key={i}
                      onClick={() => handleOptionClick(option)}
                      className="option-button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message bot">
            <div className="message-bubble typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="input-container">
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about involvement opportunities..."
            className="chat-input"
          />
          <button
            onClick={handleSend}
            className="send-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        
        {/* Footer */}
        <div className="footer">
          <p>© Southern Methodist University • Dallas TX 75205</p>
          <p>For assistance, contact the Student Involvement Office</p>
        </div>
      </div>
    </div>
  );
};

export default SMUChatbot;