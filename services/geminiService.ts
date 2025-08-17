
import { GoogleGenAI, Type } from "@google/genai";
import type { QuizQuestion, Exercise } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const quizSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING },
            options: {
                type: Type.OBJECT,
                properties: {
                    a: { type: Type.STRING },
                    b: { type: Type.STRING },
                    c: { type: Type.STRING },
                    d: { type: Type.STRING },
                },
                required: ['a', 'b', 'c', 'd']
            },
            answer: { type: Type.STRING, description: "The letter of the correct option (e.g., 'a')" }
        },
        required: ['question', 'options', 'answer']
    }
};

export const generateDiagnosticQuiz = async (topic: string): Promise<QuizQuestion[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an English grammar expert creating a diagnostic quiz for an adult Israeli learner. The user wants to focus on ${topic}. Generate exactly 3 multiple-choice questions with 4 options each (a, b, c, d) to assess their level (beginner, intermediate, advanced). Provide the correct answer letter for each. The response must be in JSON format.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
            },
        });
        
        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as QuizQuestion[];

    } catch (error) {
        console.error("Error generating diagnostic quiz:", error);
        throw new Error("Failed to communicate with the AI to generate a quiz.");
    }
};

const evaluationSchema = {
    type: Type.OBJECT,
    properties: {
        level: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] },
        suggestion: { type: Type.STRING, description: "A specific sub-topic to start with." }
    },
    required: ['level', 'suggestion']
};

export const evaluateQuizAndSuggestStartingPoint = async (
    topic: string,
    quiz: QuizQuestion[],
    answers: string[]
): Promise<{ level: 'Beginner' | 'Intermediate' | 'Advanced'; suggestion: string }> => {
    try {
        const quizData = quiz.map((q, i) => ({
            question: q.question,
            userAnswer: answers[i],
            correctAnswer: q.answer,
        }));

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `An adult English learner in Israel took a diagnostic quiz on ${topic}. Here are the questions, their answers, and the correct answers: ${JSON.stringify(quizData)}. Based on their performance, assess their level (Beginner, Intermediate, or Advanced) and suggest a specific, personalized starting sub-topic within ${topic} to begin their learning journey. Your response should be professional, encouraging, and in English. The response must be in JSON format.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: evaluationSchema,
            },
        });
        
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error evaluating quiz:", error);
        throw new Error("Failed to communicate with the AI to evaluate the quiz.");
    }
};

const exerciseSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['multiple-choice', 'fill-in-the-blank'] },
        question: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        answer: { type: Type.STRING }
    },
    required: ['type', 'question', 'answer']
};

export const generateExercise = async (
    mainTopic: string,
    subTopic: string,
    level: string,
    difficulty: 'easy' | 'medium' | 'hard'
): Promise<Exercise> => {
     try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an AI English tutor. The user is an ${level} adult learner focusing on the main topic of "${mainTopic}". Their current sub-topic is "${subTopic}". Generate one interactive grammar exercise of ${difficulty} difficulty. The exercise type should be either 'multiple-choice' (with 4 options) or 'fill-in-the-blank' (where the user types the answer). For fill-in-the-blank, use "___" to indicate the blank. Provide the question, options (if multiple-choice), and the correct answer. The response must be in JSON format.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: exerciseSchema,
            },
        });
        
        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as Exercise;

    } catch (error) {
        console.error("Error generating exercise:", error);
        throw new Error("Failed to communicate with the AI to generate an exercise.");
    }
};

const feedbackSchema = {
    type: Type.OBJECT,
    properties: {
        feedback: { type: Type.STRING, description: "Concise, constructive feedback." },
        nextStepSuggestion: { type: Type.STRING, description: "Suggestion for the next step." }
    },
    required: ['feedback', 'nextStepSuggestion']
};

export const provideFeedbackOnAnswer = async (
    subTopic: string,
    question: string,
    userAnswer: string,
    correctAnswer: string,
    timeTaken: number
): Promise<{ feedback: string; nextStepSuggestion: string }> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `An English learner answered an exercise about ${subTopic}.
        - Question: "${question}"
        - Their answer: "${userAnswer}"
        - Correct answer: "${correctAnswer}"
        - Time taken: ${timeTaken.toFixed(1)} seconds.
        Evaluate their answer. Provide concise, constructive feedback explaining why the answer is right or wrong. Then, based on their correctness and speed (under 10s is fast, 10-20s is medium, over 20s is slow), suggest the next step: either a more challenging exercise, a similar one for review, an easier one, or a brief grammar explanation. Your tone should be encouraging. The response must be in JSON format.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: feedbackSchema,
            },
        });
        
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error providing feedback:", error);
        throw new Error("Failed to communicate with the AI to get feedback.");
    }
};
