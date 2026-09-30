import React, { useState } from 'react';
import api from '../utils/api';
import { Send, Bot, User } from 'lucide-react';

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello, I am SI Ignite AI. How can I assist you with project intelligence today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "I'm currently unable to process requests. Please ensure my API connection is active." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-3">
        <div className="bg-blue-600 text-white p-2 rounded-lg">
          <Bot size={20} />
        </div>
        <div>
          <h2 className="font-bold text-slate-800">SI Ignite AI</h2>
          <p className="text-xs text-slate-500">Evidence-Based Infrastructure Intelligence</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-700 text-white' : 'bg-blue-600 text-white'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-xl shadow-sm text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 rounded-tl-none text-sm animate-pulse">
                Analyzing data...
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-white">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about high risk projects, trends, or external risks..."
            className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="absolute right-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {["Which projects are at highest risk?", "Which sectors have the highest risk?"].map(q => (
            <button 
              key={q} 
              type="button"
              onClick={() => setInput(q)}
              className="whitespace-nowrap text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-200 border border-slate-200"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
