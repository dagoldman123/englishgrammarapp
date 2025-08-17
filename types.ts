
export type AppState = 'welcome' | 'quiz' | 'learning';

export interface QuizQuestion {
    question: string;
    options: {
        a: string;
        b: string;
        c: string;
        d: string;
    };
    answer: string;
}

export interface Exercise {
    type: 'multiple-choice' | 'fill-in-the-blank';
    question: string;
    options?: string[];
    answer: string;
}

export interface UserProgress {
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    correctAnswers: number;
    totalQuestions: number;
    averageTime: number; // in seconds
    topicProgress: {
        [topic: string]: {
            correct: number;
            total: number;
        };
    };
}

export interface ChatMessage {
    sender: 'user' | 'agent' | 'system';
    text: string;
    suggestion?: string;
}
