import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/navigation/Sidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatArea from "@/components/chat/ChatArea";
import InputArea from "@/components/chat/InputArea";
import NewCompanionModal from "@/components/modals/NewCompanionModal";
import ApiKeysModal from "@/components/modals/ApiKeysModal";
import { useCompanionContext } from "@/context/CompanionContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNewCompanionModal, setShowNewCompanionModal] = useState(false);
  const [showApiKeysModal, setShowApiKeysModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const { messages, sendMessage, isLoading, generateImage } = useCompanionContext();
  const { toast } = useToast();

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      setShowImageModal(true);
      return;
    }

    try {
      const imageUrl = await generateImage(imagePrompt);
      await sendMessage(`Generate an image of: ${imagePrompt}\n\n![Generated Image](${imageUrl})`);
      setImagePrompt("");
      setShowImageModal(false);
    } catch (error) {
      toast({
        title: "Image Generation Failed",
        description: "Could not generate the image. Please check your API key settings.",
        variant: "destructive",
      });
    }
  };

  const handleImagePromptSubmit = async () => {
    if (!imagePrompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a description for the image you want to generate.",
        variant: "destructive",
      });
      return;
    }

    try {
      const imageUrl = await generateImage(imagePrompt);
      await sendMessage(`Generate an image of: ${imagePrompt}\n\n![Generated Image](${imageUrl})`);
      setImagePrompt("");
      setShowImageModal(false);
    } catch (error) {
      toast({
        title: "Image Generation Failed",
        description: "Could not generate the image. Please check your API key settings.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Menu Button */}
      <div className="lg:hidden absolute top-4 left-4 z-10">
        <Button 
          size="icon" 
          variant="default" 
          className="rounded-full shadow-lg" 
          onClick={() => setShowMobileMenu(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar - Desktop (hidden on mobile) and Mobile (controlled by showMobileMenu) */}
      <div className={`${showMobileMenu ? 'block' : 'hidden'} lg:block lg:w-72 lg:flex-shrink-0 z-50`}>
        <Sidebar 
          showMobileMenu={showMobileMenu} 
          onCloseMobileMenu={() => setShowMobileMenu(false)}
          onOpenNewCompanionModal={() => setShowNewCompanionModal(true)}
          onOpenApiKeysModal={() => setShowApiKeysModal(true)}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <ChatHeader 
          onOpenCompanionSettings={() => setShowNewCompanionModal(true)}
          onToggleVoiceMode={() => setIsVoiceMode(!isVoiceMode)}
          isVoiceMode={isVoiceMode}
        />
        
        <ChatArea 
          messages={messages} 
          isLoading={isLoading} 
          className="bg-background"
        />
        
        <InputArea 
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onGenerateImage={handleGenerateImage}
        />
      </main>

      {/* Modals */}
      <NewCompanionModal 
        isOpen={showNewCompanionModal} 
        onClose={() => setShowNewCompanionModal(false)} 
      />
      
      <ApiKeysModal 
        isOpen={showApiKeysModal} 
        onClose={() => setShowApiKeysModal(false)} 
      />
      
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Image</DialogTitle>
            <DialogDescription>
              Describe the image you want to generate in detail.
            </DialogDescription>
          </DialogHeader>
          
          <Input
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            placeholder="E.g. A futuristic city with flying cars and neon lights"
            className="mt-2"
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleImagePromptSubmit}>
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
