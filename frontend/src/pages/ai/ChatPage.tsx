import React, { useState, useEffect, useRef } from 'react';
import * as aiService from '../../services/aiService';
import type { ChatMessage } from '../../types/ai';

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // v2.0 SOC Prompt Suggestions
  const suggestions = [
    'What is my biggest risk?',
    'How would ransomware attack me?',
    'What should I patch first?',
    'Generate a board presentation.',
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setError('');
    const userMsg: ChatMessage = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiService.sendChatMessage(text);
      setMessages(response.history);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err?.response?.data?.error || 'Failed to get response from SOC Analyst. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      await aiService.resetChatHistory();
      setMessages([]);
    } catch (err: any) {
      console.error('Failed to reset chat:', err);
      setError('Failed to clear chat memory.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputValue);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-6 text-left animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f8fafc] mb-1">SOC AI Chat</h1>
          <p className="text-sm text-[#94a3b8]">Ask real-time questions, investigate CVEs, or compile board slides with context-aware AI memory.</p>
        </div>
        <button
          onClick={handleReset}
          disabled={isLoading || messages.length === 0}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition-all cursor-pointer flex items-center space-x-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Reset Memory</span>
        </button>
      </div>

      {/* Main Chat Layout */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#131c2e] border border-[#1e293b] rounded-2xl shadow-xl overflow-hidden">
        {/* Messages Screen */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-[#1e293b] scrollbar-track-transparent">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-lg shadow-[#6366f1]/20 animate-pulse">
                <svg className="h-8 w-8 text-[#f8fafc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-[#f8fafc]">SOC Assistant Copilot</h3>
                <p className="text-sm text-[#cbd5e1] max-w-md">I have digested your assets, services, and vulnerability posture details. Ask me anything to assist in threat analysis.</p>
              </div>

              {/* Suggestions Grid */}
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 max-w-lg w-full pt-4">
                {suggestions.map((text, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(text)}
                    className="p-3 text-xs text-[#cbd5e1] hover:text-[#f8fafc] bg-[#0b0f19] hover:bg-[#1e293b] border border-[#1e293b] hover:border-[#6366f1] rounded-xl transition-all text-left cursor-pointer"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-md leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-[#f8fafc]'
                      : 'bg-[#0b0f19] border border-[#1e293b] text-[#cbd5e1]'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#0b0f19] border border-[#1e293b] rounded-2xl px-4 py-3 flex items-center space-x-2">
                <div className="h-2 w-2 bg-[#94a3b8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 bg-[#94a3b8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="h-2 w-2 bg-[#94a3b8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">
              {error}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-[#1e293b] bg-[#131c2e] flex items-center space-x-3 shrink-0">
          <input
            type="text"
            placeholder="Ask a question about your security risks..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-[#0b0f19] border border-[#1e293b] hover:border-[#334155] focus:border-[#6366f1] rounded-xl px-4 py-3 text-sm text-[#f8fafc] outline-none transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="p-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-[#f8fafc] hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer shadow-lg shadow-[#6366f1]/10 shrink-0"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
