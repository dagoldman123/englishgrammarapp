
import React, { useState } from 'react';
import Spinner from './Spinner';

interface WelcomeScreenProps {
    topics: string[];
    onStart: (topic: string) => void;
    isLoading: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ topics, onStart, isLoading }) => {
    const [selectedTopic, setSelectedTopic] = useState<string>(topics[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onStart(selectedTopic);
    };

    return (
        <div className="text-center p-4 animate-fade-in">
            <h2 className="text-3xl font-bold mb-2 font-rubik" dir="rtl">
                ברוכים הבאים ל-LingoLeap AI
            </h2>
            <p className="text-slate-400 mb-8 font-rubik" dir="rtl">
                המורה הפרטי שלכם לאנגלית. בואו נתחיל!
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col items-center" dir="rtl">
                <label htmlFor="topic-select" className="text-lg mb-3 font-rubik">
                    במה תרצו להתמקד היום?
                </label>
                <select
                    id="topic-select"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-white text-md rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full max-w-sm p-3 mb-8"
                    disabled={isLoading}
                >
                    {topics.map((topic) => (
                        <option key={topic} value={topic}>
                            {topic}
                        </option>
                    ))}
                </select>

                <button
                    type="submit"
                    className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 w-full max-w-sm flex items-center justify-center"
                    disabled={isLoading}
                >
                    {isLoading ? <Spinner /> : <span className="font-rubik">התחילו ללמוד</span>}
                </button>
            </form>
        </div>
    );
};

export default WelcomeScreen;
