import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "./use-toast";

interface UseSpeechOptions {
  continuous?: boolean;
  interimResults?: boolean;
}

export function useSpeech(options: UseSpeechOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [hasVoiceSupport, setHasVoiceSupport] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  // Check for browser support
  useEffect(() => {
    const speechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setHasVoiceSupport(!!speechRecognitionAPI);
  }, []);

  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please try a different browser.",
        variant: "destructive",
      });
      return null;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = options.interimResults ?? true;
    recognition.lang = "en-US";
    
    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const text = result[0].transcript;
      
      setTranscript(text);
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      if (event.error === "not-allowed") {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice input.",
          variant: "destructive",
        });
      }
      stopListening();
    };
    
    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      } else {
        setIsListening(false);
      }
    };
    
    return recognition;
  }, [options.continuous, options.interimResults, toast, isListening]);

  const startListening = useCallback(() => {
    if (!hasVoiceSupport) return;
    
    setIsListening(true);
    setTranscript("");
    
    try {
      if (!recognitionRef.current) {
        recognitionRef.current = initSpeechRecognition();
      }
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error("Failed to start speech recognition", error);
      setIsListening(false);
    }
  }, [hasVoiceSupport, initSpeechRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  // Speak text using text-to-speech
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Text-to-Speech Not Supported",
        description: "Your browser doesn't support text-to-speech.",
        variant: "destructive",
      });
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Try to find a voice that sounds natural
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes("Google") || voice.name.includes("Natural") || voice.name.includes("Female")
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }, [toast]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    speak,
    hasVoiceSupport
  };
}

// TypeScript declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
