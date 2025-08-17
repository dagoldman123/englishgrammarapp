
import React, { useState, useCallback, useEffect } from 'react';
import type { AppState, QuizQuestion, UserProgress, ChatMessage, Exercise } from './types';
import { generateDiagnosticQuiz, evaluateQuizAndSuggestStartingPoint, generateExercise, provideFeedbackOnAnswer } from './services/geminiService';
import WelcomeScreen from './components/WelcomeScreen';
import QuizView from './components/QuizView';
import LearningView from './components/LearningView';
import { GRAMMAR_TOPICS } from './constants';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('welcome');
    const [userGoal, setUserGoal] = useState<string>('');
    const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
    const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
    const [userProgress, setUserProgress] = useState<UserProgress>({
        level: 'Beginner',
        correctAnswers: 0,
        totalQuestions: 0,
        averageTime: 0,
        topicProgress: {}
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentSubTopic, setCurrentSubTopic] = useState<string>('');

    const handleStart = useCallback(async (topic: string) => {
        setIsLoading(true);
        setError(null);
        setUserGoal(topic);
        try {
            const generatedQuiz = await generateDiagnosticQuiz(topic);
            setQuiz(generatedQuiz);
            setMessages([{ sender: 'system', text: `Let's start with a quick quiz on ${topic} to understand your level.` }]);
            setAppState('quiz');
        } catch (e) {
            setError('Failed to generate the quiz. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleQuizComplete = useCallback(async (answers: string[]) => {
        setIsLoading(true);
        setError(null);
        try {
            const { level, suggestion } = await evaluateQuizAndSuggestStartingPoint(userGoal, quiz, answers);
            setUserProgress(prev => ({ ...prev, level }));
            setCurrentSubTopic(suggestion);
            
            const agentMessage = `Great job on the quiz! It looks like you're at an ${level} level for ${userGoal}. Based on that, I suggest we start with: **${suggestion}**. Ready to begin?`;
            
            setMessages(prev => [...prev, 
              { sender: 'user', text: "I've finished the quiz." },
              { sender: 'agent', text: agentMessage, suggestion: suggestion }
            ]);
            setAppState('learning');
        } catch (e) {
            setError('Failed to evaluate your quiz. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [userGoal, quiz]);

    const fetchNextExercise = useCallback(async (subTopic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
        setIsLoading(true);
        setError(null);
        try {
            const exercise = await generateExercise(userGoal, subTopic, userProgress.level, difficulty);
            setCurrentExercise(exercise);
            setMessages(prev => [...prev, { sender: 'agent', text: `Here's an exercise on **${subTopic}**.` }]);
        } catch (e) {
            setError('Failed to fetch the next exercise. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [userGoal, userProgress.level]);
    
    useEffect(() => {
        // Automatically start the first exercise when sub-topic is set after quiz
        if (appState === 'learning' && currentSubTopic && !currentExercise && messages.some(m => !!m.suggestion)) {
             fetchNextExercise(currentSubTopic);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appState, currentSubTopic, currentExercise, messages]);


    const handleAnswerSubmit = useCallback(async (answer: string, timeTaken: number) => {
        if (!currentExercise) return;
        setIsLoading(true);
        setError(null);
        setMessages(prev => [...prev, { sender: 'user', text: answer }]);

        try {
            const { feedback, nextStepSuggestion } = await provideFeedbackOnAnswer(
                currentSubTopic,
                currentExercise.question,
                answer,
                currentExercise.answer,
                timeTaken
            );

            const isCorrect = feedback.toLowerCase().includes('correct') || feedback.toLowerCase().includes('right');
            
            setUserProgress(prev => {
                const totalQuestions = prev.totalQuestions + 1;
                const correctAnswers = isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers;
                const totalTime = (prev.averageTime * prev.totalQuestions) + timeTaken;
                return {
                    ...prev,
                    totalQuestions,
                    correctAnswers,
                    averageTime: totalTime / totalQuestions,
                };
            });

            setMessages(prev => [...prev, { sender: 'agent', text: `${feedback}\n\n${nextStepSuggestion}` }]);
            setCurrentExercise(null); // Clear current exercise
            
            // This is a simplified logic. A real app might parse the suggestion more intelligently.
            setTimeout(() => fetchNextExercise(currentSubTopic), 2000); // Fetch next exercise after a short delay

        } catch (e) {
            setError('Failed to get feedback. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [currentExercise, currentSubTopic, fetchNextExercise]);
    
    const renderContent = () => {
        if (error) {
            return <div className="text-center text-red-400 p-8">{error}</div>;
        }

        switch (appState) {
            case 'welcome':
                return <WelcomeScreen topics={GRAMMAR_TOPICS} onStart={handleStart} isLoading={isLoading} />;
            case 'quiz':
                return <QuizView questions={quiz} onComplete={handleQuizComplete} isLoading={isLoading} />;
            case 'learning':
                return <LearningView 
                          messages={messages} 
                          exercise={currentExercise} 
                          onSubmit={handleAnswerSubmit} 
                          isLoading={isLoading} 
                          progress={userProgress}
                        />;
            default:
                return <div>Something went wrong.</div>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center justify-center p-4 font-inter">
            <div className="w-full max-w-2xl bg-slate-800 rounded-2xl shadow-2xl shadow-slate-950/50 border border-slate-700 overflow-hidden">
                <header className="p-4 border-b border-slate-700 bg-slate-800/50">
                    <h1 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 font-rubik">
                        LingoLeap AI Tutor
                    </h1>
                </header>
                <main className="p-2 sm:p-4 md:p-6 min-h-[70vh]">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;
