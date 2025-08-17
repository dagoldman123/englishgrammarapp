
import React, { useState } from 'react';
import type { QuizQuestion } from '../types';
import Spinner from './Spinner';

interface QuizViewProps {
    questions: QuizQuestion[];
    onComplete: (answers: string[]) => void;
    isLoading: boolean;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, onComplete, isLoading }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const handleNext = () => {
        if (selectedOption) {
            const newAnswers = [...answers, selectedOption];
            setAnswers(newAnswers);
            setSelectedOption(null);

            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
                onComplete(newAnswers);
            }
        }
    };

    if (isLoading && questions.length === 0) {
        return <div className="flex justify-center items-center h-48"><Spinner /></div>;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="p-4 animate-fade-in">
            <div className="mb-6">
                <div className="flex justify-between mb-1">
                    <span className="text-base font-medium text-sky-400">Diagnostic Quiz</span>
                    <span className="text-sm font-medium text-sky-400">{currentQuestionIndex + 1} / {questions.length}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div className="bg-sky-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <h3 className="text-xl font-semibold mb-6 text-slate-200">{currentQuestion.question}</h3>

            <div className="space-y-4">
                {Object.entries(currentQuestion.options).map(([key, value]) => (
                    <button
                        key={key}
                        onClick={() => setSelectedOption(key)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                            selectedOption === key 
                                ? 'bg-sky-900 border-sky-500 ring-2 ring-sky-500' 
                                : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                        }`}
                    >
                        <span className="font-bold mr-3">{key.toUpperCase()}.</span>
                        {value}
                    </button>
                ))}
            </div>

            <div className="mt-8 text-right">
                <button
                    onClick={handleNext}
                    disabled={!selectedOption || isLoading}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300"
                >
                    {isLoading ? <Spinner /> : (currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish Quiz')}
                </button>
            </div>
        </div>
    );
};

export default QuizView;
