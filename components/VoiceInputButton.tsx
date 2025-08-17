import React, { useState, useEffect, useRef } from 'react';
import { MicIcon, MicOffIcon } from './icons';

// --- START: Type definitions for Web Speech API ---
// These interfaces are added to resolve TypeScript errors because the Web Speech API 
// is not part of the standard TypeScript DOM library typings.
interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
}
  
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    lang: string;
    interimResults: boolean;
    start(): void;
    stop(): void;
}
  
interface SpeechRecognitionStatic {
    new (): SpeechRecognition;
}

// An extended Window interface that includes the speech recognition properties.
interface WindowWithSpeech extends Window {
    SpeechRecognition?: SpeechRecognitionStatic;
    webkitSpeechRecognition?: SpeechRecognitionStatic;
}
// --- END: Type definitions for Web Speech API ---

interface VoiceInputButtonProps {
    onTranscript: (transcript: string) => void;
    disabled?: boolean;
}

// Check for SpeechRecognition API
const SpeechRecognition = (window as WindowWithSpeech).SpeechRecognition || (window as WindowWithSpeech).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
}

const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onTranscript, disabled }) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(recognition);

    useEffect(() => {
        const rec = recognitionRef.current;
        if (!rec) return;

        const handleResult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            onTranscript(transcript);
            setIsListening(false);
        };

        const handleError = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };
        
        const handleEnd = () => {
             setIsListening(false);
        };

        rec.addEventListener('result', handleResult);
        rec.addEventListener('error', handleError);
        rec.addEventListener('end', handleEnd);

        return () => {
            rec.removeEventListener('result', handleResult);
            rec.removeEventListener('error', handleError);
            rec.removeEventListener('end', handleEnd);
            rec.stop();
        };
    }, [onTranscript]);

    const toggleListening = () => {
        if (!recognition) return;

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    if (!recognition) {
        return null; // Don't render the button if the browser doesn't support the API
    }

    return (
        <button
            type="button"
            onClick={toggleListening}
            disabled={disabled}
            className={`p-2 rounded-full transition-colors ${
                isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
            } disabled:bg-slate-700 disabled:text-slate-500`}
        >
            {isListening ? <MicOffIcon /> : <MicIcon />}
        </button>
    );
};

export default VoiceInputButton;
