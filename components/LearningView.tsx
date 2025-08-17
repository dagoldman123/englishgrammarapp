
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage, Exercise, UserProgress } from '../types';
import Spinner from './Spinner';
import VoiceInputButton from './VoiceInputButton';
import ProgressTracker from './ProgressTracker';
import { SendIcon } from './icons';

interface LearningViewProps {
    messages: ChatMessage[];
    exercise: Exercise | null;
    onSubmit: (answer: string, timeTaken: number) => void;
    isLoading: boolean;
    progress: UserProgress;
}

const LearningView: React.FC<LearningViewProps> = ({ messages, exercise, onSubmit, isLoading, progress }) => {
    const [userAnswer, setUserAnswer] = useState('');
    const [startTime, setStartTime] = useState<number>(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, exercise, isLoading]);

    useEffect(() => {
        if (exercise) {
            setStartTime(Date.now());
        }
    }, [exercise]);

    const handleSubmit = () => {
        if (userAnswer.trim()) {
            const endTime = Date.now();
            const timeTaken = (endTime - startTime) / 1000;
            onSubmit(userAnswer.trim(), timeTaken);
            setUserAnswer('');
        }
    };

    const handleOptionClick = (option: string) => {
        const endTime = Date.now();
        const timeTaken = (endTime - startTime) / 1000;
        onSubmit(option, timeTaken);
    };
    
    const parseMessage = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-bold text-sky-400">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <div className="h-[70vh] flex flex-col">
            <ProgressTracker progress={progress} />
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                       {msg.sender === 'agent' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex-shrink-0"></div>}
                        <div
                            className={`max-w-md p-3 rounded-2xl ${
                                msg.sender === 'user'
                                    ? 'bg-sky-700 rounded-br-none'
                                    : 'bg-slate-700 rounded-bl-none'
                            }`}
                        >
                            <p className="text-white whitespace-pre-wrap">{parseMessage(msg.text)}</p>
                        </div>
                    </div>
                ))}
                 {exercise && (
                    <div className="p-4 bg-slate-700/50 rounded-lg animate-fade-in border border-slate-600">
                        <p className="font-semibold text-lg mb-4">{exercise.question}</p>
                        {exercise.type === 'multiple-choice' && exercise.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {exercise.options.map((option, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handleOptionClick(option)}
                                        className="p-3 bg-slate-600 hover:bg-sky-800 rounded-lg transition-colors text-left"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {isLoading && (
                    <div className="flex justify-start items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex-shrink-0"></div>
                        <div className="p-3 bg-slate-700 rounded-2xl rounded-bl-none">
                           <Spinner />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
           
            {exercise && exercise.type === 'fill-in-the-blank' && !isLoading && (
                 <div className="mt-auto flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-700">
                    <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="Type your answer..."
                        className="flex-grow bg-transparent focus:outline-none p-2"
                        disabled={isLoading}
                    />
                    <VoiceInputButton onTranscript={setUserAnswer} disabled={isLoading} />
                    <button onClick={handleSubmit} disabled={isLoading || !userAnswer.trim()} className="p-2 bg-sky-600 rounded-full text-white disabled:bg-slate-600 transition-colors">
                        <SendIcon />
                    </button>
                </div>
            )}
        </div>
    );
};

export default LearningView;
