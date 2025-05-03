import { useState, useRef, useEffect } from "react";
import { Paperclip, Layers, Image, Mic, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSpeech } from "@/hooks/use-speech";
import { useCompanionContext } from "@/context/CompanionContext";

interface InputAreaProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  onGenerateImage: () => void;
}

export default function InputArea({ onSendMessage, isLoading, onGenerateImage }: InputAreaProps) {
  const [message, setMessage] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { activeModel } = useCompanionContext();
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    hasVoiceSupport 
  } = useSpeech();

  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (textareaRef.current) {
      // Auto-resize the textarea
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSendMessage = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceMode = () => {
    if (!hasVoiceSupport) return;

    const newMode = !isVoiceMode;
    setIsVoiceMode(newMode);
    
    if (newMode) {
      startListening();
    } else {
      stopListening();
    }
  };

  const handleVoiceCaptureClick = () => {
    if (isListening) {
      stopListening();
      handleSendMessage();
    } else {
      startListening();
    }
  };

  return (
    <div className="border-t bg-white p-4">
      <div className="relative">
        {/* Voice Mode Interface */}
        {isVoiceMode ? (
          <div className="flex flex-col items-center justify-center p-4 space-y-4">
            <Button
              variant={isListening ? "destructive" : "default"}
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isListening ? "animate-pulse" : ""
              }`}
              onClick={handleVoiceCaptureClick}
            >
              <Mic className="h-8 w-8 text-white" />
            </Button>
            <p className="text-center text-gray-600">
              {isListening ? "Listening... Tap to send" : "Tap to start speaking"}
            </p>
            {transcript && (
              <div className="w-full p-3 bg-gray-100 rounded-bubble mt-2">
                <p className="text-sm text-gray-800">{transcript}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-end space-x-2">
            <Button variant="ghost" size="icon" className="text-gray-500" aria-label="Attach files">
              <Paperclip className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="resize-none w-full border border-gray-300 rounded-bubble py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px]"
                disabled={isLoading}
                rows={1}
              />
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600" 
                aria-label="Generate image"
                onClick={onGenerateImage}
              >
                <Image className="h-5 w-5" />
              </Button>
            </div>
            
            <Button
              disabled={isLoading || !message.trim()}
              onClick={handleSendMessage}
              size="icon"
              className="rounded-full bg-primary text-white hover:bg-primary/90"
              aria-label="Send message"
            >
              <Layers className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        {/* Voice Mode Toggle */}
        {hasVoiceSupport && (
          <div className="absolute top-0 right-0 -mt-10">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleVoiceMode} 
              className={isVoiceMode ? "text-primary" : "text-gray-500"}
              aria-label={isVoiceMode ? "Switch to text mode" : "Switch to voice mode"}
            >
              {isVoiceMode ? <Keyboard className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
          </div>
        )}
        
        {/* Model Attribution */}
        <div className="text-xs text-gray-400 mt-2 flex items-center justify-center">
          <span>Powered by {activeModel.charAt(0).toUpperCase() + activeModel.slice(1)} • Response time: ~2s</span>
        </div>
      </div>
    </div>
  );
}
