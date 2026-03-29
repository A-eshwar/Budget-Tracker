import React, { useState, useRef, useEffect } from 'react';
import aiService from '../services/aiService';
import { Send, Bot, User, Sparkles, MessageSquare, ChevronRight, PieChart, TrendingUp, HelpCircle } from 'lucide-react';

const AIAssistant = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your SmartBudget AI Assistant. I've analyzed your recent financial data. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await aiService.chat(userMsg);
            setMessages(prev => [...prev, res.data]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestions = [
        "How is my spending this month?",
        "Where can I save more money?",
        "Explain my financial health score",
        "Predict my expenses for next month"
    ];

    const applySuggestion = (suggestion) => {
        setInput(suggestion);
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-center bg-slate-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">AI Assistant</h1>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Financial Expert Mode</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">Context Aware</span>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 rounded-3xl bg-slate-900/20 border border-white/5 shadow-inner custom-scrollbar">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                                msg.role === 'user' ? 'bg-sky-500 shadow-sky-500/20' : 'bg-slate-800 border border-white/10'
                            }`}>
                                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-emerald-400" />}
                            </div>
                            <div className={`p-4 rounded-2xl shadow-sm ${
                                msg.role === 'user' 
                                    ? 'bg-sky-600 text-white rounded-tr-none' 
                                    : 'bg-slate-800/80 backdrop-blur-md text-slate-200 border border-white/5 rounded-tl-none leading-relaxed'
                            }`}>
                                <p className="text-sm font-medium">{msg.content}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="flex gap-4 max-w-[80%]">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5 rounded-tl-none">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="space-y-4">
                <div className="flex flex-wrap gap-2 px-2">
                    {suggestions.map((s, i) => (
                        <button 
                            key={i} 
                            onClick={() => applySuggestion(s)}
                            className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-slate-800/50 text-slate-400 border border-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 transition-all cursor-pointer"
                        >
                            {s}
                        </button>
                    ))}
                </div>
                
                <form onSubmit={handleSend} className="relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask your financial assistant..."
                        className="w-full bg-slate-900/60 border border-white/10 rounded-2xl py-5 pl-6 pr-16 text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-xl transition-all group-hover:border-white/20"
                    />
                    <button 
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIAssistant;
