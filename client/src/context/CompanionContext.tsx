import React, { createContext, useState, useContext, useEffect } from "react";
import { Companion, Message, AIModel } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CompanionContextType {
  companions: Companion[];
  activeCompanion: Companion | null;
  activeModel: AIModel;
  setActiveCompanion: (companion: Companion) => void;
  setActiveModel: (model: AIModel) => void;
  refreshCompanions: () => Promise<void>;
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  generateImage: (prompt: string) => Promise<string>;
}

const CompanionContext = createContext<CompanionContextType | undefined>(undefined);

export const CompanionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [activeCompanion, setActiveCompanion] = useState<Companion | null>(null);
  const [activeModel, setActiveModel] = useState<AIModel>("gemini");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch companions on mount
  useEffect(() => {
    refreshCompanions();
  }, []);

  // Fetch messages when active companion changes
  useEffect(() => {
    if (activeCompanion) {
      fetchMessages(activeCompanion.id);
    } else {
      setMessages([]);
    }
  }, [activeCompanion]);

  const refreshCompanions = async () => {
    try {
      const response = await apiRequest("GET", "/api/companions", undefined);
      if (response.ok) {
        const data = await response.json();
        setCompanions(data);
        
        // If there are companions but no active one, set the first one
        if (data.length > 0 && !activeCompanion) {
          setActiveCompanion(data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch companions", error);
      toast({
        title: "Error",
        description: "Failed to load companions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchMessages = async (companionId: number) => {
    try {
      const response = await apiRequest("GET", `/api/conversations/${companionId}/messages`, undefined);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
      toast({
        title: "Error",
        description: "Failed to load conversation history.",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (content: string) => {
    if (!activeCompanion) return;
    
    try {
      setIsLoading(true);
      
      // Add user message to state immediately for better UX
      const tempUserMsg: Message = {
        id: Date.now(),
        conversationId: activeCompanion.id,
        content,
        role: "user",
        createdAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, tempUserMsg]);
      
      const response = await apiRequest("POST", `/api/conversations/${activeCompanion.id}/messages`, {
        content,
        model: activeModel
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Replace temp message and add AI response
        setMessages(prev => [
          ...prev.filter(m => m.id !== tempUserMsg.id),
          data.userMessage,
          data.assistantMessage
        ]);
      } else {
        // If failed, keep the user message but show an error
        toast({
          title: "Message Failed",
          description: "Failed to send your message. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to send message", error);
      toast({
        title: "Error",
        description: "An error occurred while sending your message.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateImage = async (prompt: string): Promise<string> => {
    try {
      const response = await apiRequest("POST", "/api/image/generate", { prompt });
      
      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      } else {
        throw new Error("Failed to generate image");
      }
    } catch (error) {
      console.error("Failed to generate image", error);
      toast({
        title: "Image Generation Failed",
        description: "Could not generate the requested image. Please check your API keys.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <CompanionContext.Provider
      value={{
        companions,
        activeCompanion,
        activeModel,
        setActiveCompanion,
        setActiveModel,
        refreshCompanions,
        messages,
        sendMessage,
        isLoading,
        generateImage
      }}
    >
      {children}
    </CompanionContext.Provider>
  );
};

export const useCompanionContext = () => {
  const context = useContext(CompanionContext);
  if (context === undefined) {
    throw new Error("useCompanionContext must be used within a CompanionProvider");
  }
  return context;
};
