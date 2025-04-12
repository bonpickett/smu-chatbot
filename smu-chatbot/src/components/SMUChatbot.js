import React, { useState, useRef, useEffect } from 'react';
import VectorDatabase from './VectorDatabase';

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
  const vectorDb = useRef(new VectorDatabase());

  // Initialize vector database on component mount
  useEffect(() => {
    vectorDb.current.initialize();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get relevant information from vector database
  const getRelevantInfo = async (query) => {
    try {
      const results = await vectorDb.current.search(query);
      return results;
    } catch (error) {
      console.error("Error searching vector database:", error);
      return [];
    }
  };

  // Process query and format response with vector database results
  const processQueryWithVectorDb = async (userMessage) => {
    const lowerCaseMsg = userMessage.toLowerCase();
    let baseResponse = {};
    
    // Get relevant information from vector database
    const relevantInfo = await getRelevantInfo(userMessage);
    
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
    } else if (lowerCaseMsg.includes('academic') && messages.some(m => m.text?.includes('organization'))) {
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
    
    // Enhance response with vector database results if available
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

  const handleSend = async () => {
    if (input.trim() === '') return;
    
    // Add user message
    setMessages([...messages, { text: input, sender: 'user' }]);
    setInput('');
    setLoading(true);
    
    try {
      // Use vector database to enhance response
      const response = await processQueryWithVectorDb(input);
      
      setMessages(prev => [...prev, { 
        text: response.text, 
        sender: 'bot',
        options: response.options
      }]);
    } catch (error) {
      console.error("Error processing query:", error);
      setMessages(prev => [...prev, { 
        text: "I'm having trouble accessing my knowledge base right now. Can you try asking something else?", 
        sender: 'bot',
        options: ["Student Organizations", "Leadership Programs", "Campus Events"]
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = async (option) => {
    // Add user selection as a message
    setMessages([...messages, { text: option, sender: 'user' }]);
    setLoading(true);
    
    try {
      // Use vector database to enhance response
      const response = await processQueryWithVectorDb(option);
      
      setMessages(prev => [...prev, { 
        text: response.text, 
        sender: 'bot',
        options: response.options
      }]);
    } catch (error) {
      console.error("Error processing option:", error);
      setMessages(prev => [...prev, { 
        text: "I'm having trouble accessing my knowledge base right now. Can you try selecting something else?", 
        sender: 'bot',
        options: ["Student Organizations", "Leadership Programs", "Campus Events"]
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-smu-blue text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div 
            className="h-12 w-12 mr-3 rounded-full bg-white p-1 flex items-center justify-center"
          >
            {/* Replace with actual Peruna image when available */}
            <span className="text-smu-blue font-bold">P</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">SMU Student Involvement</h1>
            <p className="text-sm">Find your place at SMU</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <a href="https://www.smu.edu/StudentAffairs" target="_blank" rel="noreferrer" className="text-white hover:text-red-300">
            Student Affairs
          </a>
          <a href="https://www.smu.edu/360" target="_blank" rel="noreferrer" className="text-white hover:text-red-300">
            SMU360
          </a>
        </div>
      </header>

      {/* Chat container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3/4 rounded-lg p-3 ${
              message.sender === 'user' 
              ? 'bg-smu-blue text-white'
              : 'bg-white border border-gray-300'
            }`}>
              {message.sender === 'bot' && (
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 bg-smu-red rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs font-bold">SMU</span>
                  </div>
                  <span className="font-bold">Peruna Bot</span>
                </div>
              )}
              <p className="whitespace-pre-line">{message.text}</p>
              
              {/* Quick reply options */}
              {message.sender === 'bot' && message.options && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.options.map((option, i) => (
                    <button 
                      key={i}
                      onClick={() => handleOptionClick(option)}
                      className="bg-gray-200 hover:bg-gray-300 text-sm rounded-full px-3 py-1"
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
          <div className="flex justify-start">
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="h-3 w-3 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="h-3 w-3 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div className="h-3 w-3 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-300 p-4 bg-white">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about involvement opportunities..."
            className="flex-1 border border-gray-300 rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-smu-blue"
          />
          <button
            onClick={handleSend}
            className="bg-smu-red hover:bg-red-800 text-white rounded-r-lg p-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        {/* Footer */}
        <div className="mt-3 text-center text-xs text-gray-500">
          <p>© Southern Methodist University • Dallas TX 75205</p>
          <p className="mt-1">For assistance, contact the Student Involvement Office</p>
        </div>
      </div>
    </div>
  );
};

export default SMUChatbot;