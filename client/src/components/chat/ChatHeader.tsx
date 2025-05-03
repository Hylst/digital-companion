import { Settings, Mic, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Bot } from "lucide-react";
import { useCompanionContext } from "@/context/CompanionContext";

interface ChatHeaderProps {
  onOpenCompanionSettings: () => void;
  onToggleVoiceMode: () => void;
  isVoiceMode: boolean;
}

export default function ChatHeader({ 
  onOpenCompanionSettings, 
  onToggleVoiceMode, 
  isVoiceMode 
}: ChatHeaderProps) {
  const { activeCompanion } = useCompanionContext();

  if (!activeCompanion) {
    return (
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <Bot className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <h2 className="font-heading font-medium">Select a companion</h2>
            <p className="text-xs text-gray-500">Choose or create a companion to start chatting</p>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Avatar className="w-10 h-10 border">
          <AvatarImage src={activeCompanion.avatar} alt={activeCompanion.name} />
          <AvatarFallback className="bg-secondary">
            <Bot className="h-5 w-5 text-white" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-heading font-medium">{activeCompanion.name}</h2>
          <p className="text-xs text-gray-500">
            {activeCompanion.role} • {activeCompanion.isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onToggleVoiceMode} 
          aria-label="Toggle voice mode"
          className={isVoiceMode ? "text-primary" : "text-gray-500"}
        >
          <Mic className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenCompanionSettings}
          aria-label="Companion settings"
        >
          <Settings className="h-5 w-5 text-gray-500" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More options">
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Clear conversation</DropdownMenuItem>
            <DropdownMenuItem>Export chat history</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Delete companion</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
