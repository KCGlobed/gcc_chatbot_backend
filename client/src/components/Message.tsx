import React, { useEffect, useState } from 'react';
import { Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageProps {
    role: 'assistant' | 'user';
    content: string;
    options?: string[];
    onOptionClick?: (option: string) => void;
    onContentUpdate?: () => void;
}

export const Message: React.FC<MessageProps> = ({ role, content, options, onOptionClick, onContentUpdate }) => {
    const isBot = role === 'assistant';
    const [displayedContent, setDisplayedContent] = useState(isBot ? '' : content);

    const onContentUpdateRef = React.useRef(onContentUpdate);
    useEffect(() => {
        onContentUpdateRef.current = onContentUpdate;
    }, [onContentUpdate]);

    // Typing effect for bot
    useEffect(() => {
        if (!isBot) {
            setDisplayedContent(content);
            return;
        }

        // Reset if content changes
        setDisplayedContent('');

        let index = 0;
        const speed = 10; // Faster typing

        const timer = setInterval(() => {
            if (index < content.length) {
                setDisplayedContent(() => content.substring(0, index + 1));
                index++;
                onContentUpdateRef.current?.();
            } else {
                clearInterval(timer);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [content, isBot]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full mb-4 ${isBot ? 'justify-start' : 'justify-end'}`}
        >
            <div className={`flex max-w-[95%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isBot ? 'bg-kcg-blue text-white shadow-md' : 'bg-gray-200'}`}>
                    {isBot ? <Bot size={14} /> : <User size={14} />}
                </div>

                <div className={`mx-1 p-2 rounded-lg shadow-sm text-sm ${isBot
                    ? 'bg-white border border-gray-100 text-slate-700 rounded-tl-none'
                    : 'bg-kcg-blue text-white rounded-tr-none'
                    }`}>
                    <div className={`leading-relaxed text-[12px] font-sans ${isBot ? 'prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0' : 'whitespace-pre-wrap'}`}>
                        {isBot ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {displayedContent}
                            </ReactMarkdown>
                        ) : (
                            content
                        )}
                    </div>

                    {isBot && options && options.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-3 flex flex-wrap gap-2"
                        >
                            {options?.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onOptionClick?.(opt)}
                                    className="px-2 py-1 text-xs font-medium text-kcg-blue bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full transition-colors"
                                >
                                    {opt}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
