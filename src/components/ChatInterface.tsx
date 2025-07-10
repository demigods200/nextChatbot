'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatContext {
  userInfo: {
    [key: string]: string;
  };
  conversationHistory: Message[];
}

// Initialize context from localStorage or create new
const initializeChatContext = (): ChatContext => {
  if (typeof window === 'undefined') return { userInfo: {}, conversationHistory: [] };
  
  const savedContext = localStorage.getItem('chatContext');
  return savedContext 
    ? JSON.parse(savedContext)
    : { userInfo: {}, conversationHistory: [] };
};

// Save context to localStorage
const saveChatContext = (context: ChatContext) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('chatContext', JSON.stringify(context));
  }
};

const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);

  if (diffInSeconds < 5) {
    return 'Just now';
  } else if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatContext, setChatContext] = useState<ChatContext>(initializeChatContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load saved messages on mount
  useEffect(() => {
    const context = initializeChatContext();
    setMessages(context.conversationHistory);
  }, []);

  // Save messages to context whenever they change
  useEffect(() => {
    const newContext = {
      ...chatContext,
      conversationHistory: messages
    };
    setChatContext(newContext);
    saveChatContext(newContext);
  }, [messages]);

  // Update timestamps every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(prev => [...prev]); // Force re-render to update timestamps
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px'; // Max height of 150px
    }
  }, [input]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user' as const,
      content: input.trim(),
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input.trim(),
          context: chatContext
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      // Update context with any new information extracted by the AI
      if (data.updatedContext) {
        setChatContext(prevContext => ({
          ...prevContext,
          userInfo: {
            ...prevContext.userInfo,
            ...data.updatedContext
          }
        }));
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg font-semibold">Welcome to Tipsiti Assistant!</p>
            <p className="text-sm mt-2">Ask me about:</p>
            <div className="mt-4 space-y-2 text-[#0078D4]">
              <p>🏠 Places to visit</p>
              <p>🛍️ Products to buy</p>
              <p>👥 People to connect with</p>
              <p>🌆 Cities to explore</p>
            </div>
            <p className="text-sm mt-4">How can I help you discover something amazing today?</p>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="max-w-[85%]">
              <div
                className={`rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-[#0078D4] text-white'
                    : 'bg-white shadow-sm border border-gray-200 text-gray-800'
                }`}
              >
                {message.content}
              </div>
              <div
                className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                } text-gray-500`}
              >
                {formatTimeAgo(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="bg-white shadow-sm border border-gray-200 rounded-2xl px-4 py-2">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-[#0078D4] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#0078D4] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-[#0078D4] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
              <div className="text-xs mt-1 text-left text-gray-500">
                Just now
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
        <div className="relative flex border border-gray-200 rounded-xl focus-within:border-[#0078D4] focus-within:ring-1 focus-within:ring-[#0078D4] transition-colors overflow-hidden">
          <div className="flex-grow pr-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your travell..."
              className="w-full px-4 py-3 resize-none min-h-[50px] max-h-[200px] focus:outline-none text-sm placeholder:text-sm border-none bg-transparent"
            />
          </div>
          <div className="w-[2px] my-2 bg-gray-200"></div>
          <div className="px-3 flex items-center">
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-[#0078D4] text-white p-2.5 rounded-lg hover:bg-[#106EBE] hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface; 