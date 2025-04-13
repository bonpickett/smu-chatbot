import React, { useState, useRef, useEffect } from 'react';
import './SMUChatbot.css';
import { smuData } from './smuData';
import PineconeService from '../services/PineconeService';

const SMUChatbot = () => {
  // Existing state variables
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
  
  // Add Pinecone service
  const pineconeService = useRef(new PineconeService());

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

// Process user query with Pinecone
const processQueryWithPinecone = async (userMessage) => {
  const lowerCaseMsg = userMessage.toLowerCase();
  let baseResponse = {};
  
  // Get relevant information from Pinecone
  const relevantOrgs = await pineconeService.current.search(userMessage);
  
  // Default response based on query type
  if (lowerCaseMsg.includes('organization') || lowerCaseMsg.includes('club')) {
    baseResponse = {
      text: "SMU has over 200 student organizations! Here are some that might interest you:",
      options: ["Show more organizations", "Filter by category", "How to join"]
    };
  } else if (lowerCaseMsg.includes('greek') || lowerCaseMsg.includes('fraternity') || lowerCaseMsg.includes('sorority')) {
    baseResponse = {
      text: "SMU has a vibrant Greek life with several fraternities and sororities. Here are some relevant organizations:",
      options: ["Fraternities", "Sororities", "Rush information"]
    };
  } else {
    baseResponse = {
      text: "I found some SMU organizations that might interest you:",
      options: ["Tell me more", "Show different options", "How to get involved"]
    };
  }
  
  // Enhance response with organization information from Pinecone
  if (relevantOrgs.length > 0) {
    // Format organization information
    let orgInfo = '';
    
    relevantOrgs.forEach((org, index) => {
      orgInfo += `\n\n${index + 1}. ${org.title}\n`;
      orgInfo += `${org.text.substring(0, 150)}${org.text.length > 150 ? '...' : ''}`;
    });
    
    baseResponse.text += orgInfo;
    
    // Add organization-specific options
    const additionalOptions = relevantOrgs.slice(0, 2).map(org => 
      `More about: ${org.title.substring(0, 25)}${org.title.length > 25 ? '...' : ''}`
    );
    
    baseResponse.options = [...additionalOptions, ...baseResponse.options.slice(0, 1)];
  }
  
  return baseResponse;
};

// Handle sending a message
const handleSend = async () => {
  if (input.trim() === '') return;
  
  // Add user message
  setMessages([...messages, { text: input, sender: 'user' }]);
  setInput('');
  setLoading(true);
  
  try {
    // Get response using Pinecone
    const response = await processQueryWithPinecone(input);
    
    setMessages(prev => [...prev, { 
      text: response.text, 
      sender: 'bot',
      options: response.options
    }]);
  } catch (error) {
    console.error('Error getting bot response:', error);
    // Fallback response
    setMessages(prev => [...prev, { 
      text: "I'm having trouble accessing my knowledge base right now. Can you try asking something else?", 
      sender: 'bot',
      options: ["Student Organizations", "Leadership Programs", "Campus Events"]
    }]);
  } finally {
    setLoading(false);
  }
};

  // Handle clicking an option
const handleOptionClick = async (option) => {
   // Add user selection as a message
   setMessages([...messages, { text: option, sender: 'user' }]);
   setLoading(true);
  
   try {
    // Handle "More about:" options
    if (option.startsWith('More about:')) {
      const orgTitle = option.replace('More about:', '').trim();
      
      // Search for this specific organization
      const specificQuery = `"${orgTitle}"`;
      const orgDetails = await pineconeService.current.search(specificQuery, 1);
      
      if (orgDetails.length > 0) {
        const org = orgDetails[0];
        
        // Format detailed organization information
        const detailedText = `
${org.title}

${org.text}

${org.groupType ? `Type: ${org.groupType}` : ''}
${org.duration ? `Duration: ${org.duration}` : ''}
${org.recruitmentPeriod ? `Recruitment: ${org.recruitmentPeriod}` : ''}
${org.contactName ? `Contact: ${org.contactName}` : ''}
${org.contactEmail ? `Email: ${org.contactEmail}` : ''}
        `.trim();
        
        setMessages(prev => [...prev, { 
          text: detailedText, 
          sender: 'bot',
          options: ["Show similar organizations", "How to join", "Back to all organizations"]
        }]);
      } else {
        // Fall back to regular query if organization not found
        const response = await processQueryWithPinecone(option);
        setMessages(prev => [...prev, { 
          text: response.text, 
          sender: 'bot',
          options: response.options
        }]);
      }
    } else if (option.includes('orgs') || option.includes('clubs') || 
             option.includes('Greek life') || option.includes('life')) {
      // Extract category name
      let category = '';
      if (option.includes('Academic')) category = 'academic';
      else if (option.includes('Cultural')) category = 'cultural';
      else if (option.includes('Service')) category = 'service';
      else if (option.includes('Greek')) category = 'greek';
      else if (option.includes('Sports')) category = 'sports';
      
      if (category) {
        const response = await getOrganizationsByCategory(category);
        setMessages(prev => [...prev, { 
          text: response.text, 
          sender: 'bot',
          options: response.options
        }]);
      } else {
        // Fall back to regular processing
        const response = await processQueryWithPinecone(option);
        setMessages(prev => [...prev, { 
          text: response.text, 
          sender: 'bot',
          options: response.options
        }]);
      }
    }
    // Handle other options
    else {
      const response = await processQueryWithPinecone(option);
      setMessages(prev => [...prev, { 
        text: response.text, 
        sender: 'bot',
        options: response.options
      }]);
    }
  } catch (error) {
    console.error('Error processing option:', error);
    // Fallback response
    setMessages(prev => [...prev, { 
      text: "I'm having trouble retrieving that information right now. Can you try something else?", 
      sender: 'bot',
      options: ["Student Organizations", "Leadership Programs", "Campus Events"]
    }]);
  } finally {
    setLoading(false);
  }
};

// Add this function to handle category filtering
const getOrganizationsByCategory = async (category) => {
  try {
    // Create a category-specific query
    const categoryQuery = `${category} organizations at SMU`;
    const orgs = await pineconeService.current.search(categoryQuery, 5);
    
    if (orgs.length > 0) {
      let responseText = `Here are some ${category} organizations at SMU:\n\n`;
      
      orgs.forEach((org, index) => {
        responseText += `${index + 1}. ${org.title}\n`;
        responseText += `${org.text.substring(0, 150)}${org.text.length > 150 ? '...' : ''}\n\n`;
      });
      
      const options = orgs.slice(0, 3).map(org => `More about: ${org.title.substring(0, 25)}...`);
      options.push("See other categories", "Back to main menu");
      
      return {
        text: responseText,
        options: options
      };
    } else {
      return {
        text: `I couldn't find any ${category} organizations. Would you like to see other categories?`,
        options: ["Academic orgs", "Cultural orgs", "Service orgs", "Greek life", "Sports clubs"]
      };
    }
  } catch (error) {
    console.error('Error getting organizations by category:', error);
    return {
      text: "I'm having trouble retrieving organization information. Let's try something else.",
      options: ["Student Organizations", "Leadership Programs", "Campus Events"]
    };
  }
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