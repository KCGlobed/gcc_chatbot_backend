import React, { useState, useRef, useEffect } from 'react';
import { Send, X, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { Message } from './Message';
import { v4 as uuidv4 } from 'uuid';

interface ChatWindowProps {
    onClose: () => void;
}

interface ChatMessage {
    role: 'assistant' | 'user';
    content: string;
    options?: string[];
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const hasInitialized = useRef(false);

    // Initialize session
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        let storedSession = localStorage.getItem('kcg_chat_session');
        if (!storedSession) {
            storedSession = uuidv4();
            localStorage.setItem('kcg_chat_session', storedSession);
        }
        setSessionId(storedSession);

        // Initial greeting trigger if empty
        if (messages.length === 0) {
            sendMessage("", storedSession);
        }
    }, []);

    // Auto scroll
    const scrollToBottom = React.useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Auto focus input when loading finishes
    useEffect(() => {
        if (!isLoading) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isLoading]);

    const sendMessage = async (text: string, currentSessionId = sessionId) => {
        if (!currentSessionId || isLoading) return;

        // If text is empty, it might be initial trigger, don't show user bubble
        if (text.trim()) {
            setMessages(prev => [...prev, { role: 'user', content: text }]);
            setInput('');
        }

        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:3000/api/chat', {
                sessionId: currentSessionId,
                message: text
            });

            const data = response.data;
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.message,
                options: data.options
            }]);
        } catch (error) {
            console.error("Chat error", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the server. Please check your connection." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionClick = (option: string) => {
        if (!isLoading) {
            sendMessage(option);
        }
    };

    const handleReset = () => {
        if (isLoading) return;
        const newSession = uuidv4();
        localStorage.setItem('kcg_chat_session', newSession);
        setSessionId(newSession);
        setMessages([]);
        sendMessage("", newSession);
    };

    return (
        <div className="fixed bottom-24 right-6 w-[380px] h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden font-sans z-50 animate-fade-in-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-kcg-blue to-slate-900 p-4 flex items-center justify-between text-white shrink-0 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                    <div>
                        <h3 className="font-serif font-bold text-lg tracking-wide text-kcg-gold">KC GlobEd</h3>
                        <p className="text-xs text-blue-200">AI Assistant • Online</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleReset} className="p-1.5 hover:bg-white/10 rounded-full transition-colors" title="Start New Chat">
                        <RefreshCw size={16} />
                    </button>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-2 py-4 bg-gray-50/80 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                    <Message
                        key={idx}
                        role={msg.role}
                        content={msg.content}
                        options={msg.options}
                        onOptionClick={handleOptionClick}
                        onContentUpdate={scrollToBottom}
                    />
                ))}
                {isLoading && (
                    <div className="flex justify-start mb-4">
                        <div className="bg-white border border-gray-100 p-3 rounded-lg rounded-tl-none shadow-sm flex gap-1 items-center h-10">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
                <form
                    onSubmit={(e) => { e.preventDefault(); if (!isLoading) sendMessage(input); }}
                    className="flex gap-2 relative"
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isLoading ? "Please wait..." : "Type your question..."}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-kcg-blue/20 focus:border-kcg-blue transition-all placeholder:text-gray-400"

                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-3 bg-kcg-blue text-white rounded-full hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center"
                    >
                        <Send size={18} />
                    </button>
                </form>
                <div className="text-center mt-2 flex items-center justify-center gap-1 opacity-60">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Powered by KC GlobEd AI</span>
                </div>
            </div>
        </div>
    );
};
