"use client";

import { useState, KeyboardEvent, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

// Message interface for chat messages
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Main ChatBot component
export default function ChatBot() {
  // State for chat messages
  const [messages, setMessages] = useState<Message[]>([]);
  // State for the input box
  const [input, setInput] = useState('');
  // State for loading indicator
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Function to handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // Function to remove a selected file
  const removeFile = (index: number) => {
    setFiles(files => files.filter((_, i) => i !== index));
  };

  // Function to send a message to the API and update chat
  const sendMessage = async () => {
    if (!input.trim() && files.length === 0 || loading) return;

    // Add user message to chat
    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Prepare form data for file upload
      const formData = new FormData();
      formData.append('messages', JSON.stringify(newMessages));
      files.forEach((file, idx) => {
        formData.append('files', file);
      });

      // Send messages and files to backend API
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setFiles([]); // Clear files after sending
      
      // Add assistant response to chat
      if (data.response) {
        setMessages([...newMessages, { 
          role: 'assistant', 
          content: data.response 
        }]);
      } else if (data.error) {
        setMessages([...newMessages, {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again or contact support.'
        }]);
      }
    } catch (error) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'Sorry, a network error occurred. Please try again later.'
      }]);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key in input box
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Render chat UI
  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      {/* Chat message history */}
      <div className="h-96 overflow-y-auto border border-blue-100 rounded-lg p-4 mb-4 bg-white">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${
            message.role === 'user' ? 'text-right' : 'text-left'
          }`}>
            {/* Message bubble styling */}
            <div className={`inline-block p-2 rounded-lg ${
              message.role === 'user' 
                ? 'bg-[#1da1f2] text-white' 
                : 'bg-blue-50 text-blue-900'
            }`}>
              {message.role === 'assistant' ? (
                <div className="prose prose-invert">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}
        {/* Loading indicator */}
        {loading && (
          <div className="text-left">
            <div className="inline-block p-2 rounded-lg bg-blue-100 text-blue-700 animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>
      
      {/* Input box and send button */}
      <div className="flex gap-2 items-center">
        {/* File upload button */}
        <div className="relative flex items-center">
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-[#1da1f2]"
            onClick={() => fileInputRef.current?.click()}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            aria-label="Attach Files"
          >
            {/* Paperclip SVG icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#1da1f2" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 13.5V7.75a4.75 4.75 0 10-9.5 0v8.5a3.25 3.25 0 006.5 0V8.5a1.75 1.75 0 10-3.5 0v7" />
            </svg>
          </button>
          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg z-10 whitespace-nowrap">
              Attach Files
            </div>
          )}
          {/* Hidden file input */}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.csv,.xls,.xlsx,.jpeg,.jpg,.png,.txt,.json,.md,.gif,.bmp,.tiff,.svg"
          />
        </div>
        {/* Show selected files */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center bg-blue-50 text-blue-900 px-2 py-1 rounded text-xs">
                {file.name}
                <button
                  type="button"
                  className="ml-1 text-blue-500 hover:text-red-500"
                  onClick={() => removeFile(idx)}
                  aria-label="Remove file"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-blue-200 rounded-lg bg-white text-blue-900 focus:border-[#1da1f2] focus:ring-[#1da1f2]"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 bg-[#1da1f2] text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
} 