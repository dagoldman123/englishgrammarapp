
import React from 'react';
import type { UserProgress } from '../types';

interface ProgressTrackerProps {
    progress: UserProgress;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ progress }) => {
    const accuracy = progress.totalQuestions > 0 ? (progress.correctAnswers / progress.totalQuestions) * 100 : 0;

    return (
        <div className="bg-slate-700/50 p-3 rounded-lg mb-4 border border-slate-700">
            <div className="flex justify-between items-center text-sm text-slate-300">
                <div className="flex flex-col items-center">
                    <span className="font-bold text-base text-white">{progress.level}</span>
                    <span className="text-xs text-slate-400">Level</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-base text-white">{progress.correctAnswers} / {progress.totalQuestions}</span>
                     <span className="text-xs text-slate-400">Score</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-base text-white">{accuracy.toFixed(0)}%</span>
                     <span className="text-xs text-slate-400">Accuracy</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-base text-white">{progress.averageTime.toFixed(1)}s</span>
                     <span className="text-xs text-slate-400">Avg Time</span>
                </div>
            </div>
        </div>
    );
};

export default ProgressTracker;
