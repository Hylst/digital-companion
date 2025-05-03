import { useState } from "react";
import { Link } from "wouter";
import { 
  Cog, X, User, Bot, PlusCircle, 
  Key, HelpCircle, ChevronRight
} from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMobile } from "@/hooks/use-mobile";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCompanionContext } from "@/context/CompanionContext";
import { Companion } from "@/lib/types";
import { AI_MODELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SidebarProps {
  showMobileMenu: boolean;
  onCloseMobileMenu: () => void;
  onOpenNewCompanionModal: () => void;
  onOpenApiKeysModal: () => void;
}

export default function Sidebar({ 
  showMobileMenu, 
  onCloseMobileMenu,
  onOpenNewCompanionModal,
  onOpenApiKeysModal
}: SidebarProps) {
  const isMobile = useMobile();
  const { companions, activeCompanion, setActiveCompanion, activeModel, setActiveModel } = useCompanionContext();
  
  const handleCompanionClick = (companion: Companion) => {
    setActiveCompanion(companion);
    if (isMobile) {
      onCloseMobileMenu();
    }
  };

  const Sidebar = (
    <div className="flex flex-col w-72 bg-white border-r border-gray-200 h-full overflow-y-auto">
      {/* App Logo */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Bot className="text-white h-5 w-5" />
          </div>
          <h1 className="font-heading font-semibold text-xl">CompanionAI</h1>
        </div>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onCloseMobileMenu}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      {/* User Profile */}
      <div className="p-4 border-b flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="text-gray-500 h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">User</p>
          <p className="text-sm text-gray-500">Free Plan</p>
        </div>
      </div>
      
      {/* Companions Section */}
      <div className="p-4 border-b">
        <h2 className="font-heading font-medium text-sm uppercase text-gray-500 mb-3">Your Companions</h2>
        
        {companions.map((companion) => (
          <div 
            key={companion.id}
            className={cn(
              "rounded-bubble bg-light p-3 mb-3 cursor-pointer hover:bg-gray-100 transition-colors flex items-center space-x-3",
              activeCompanion?.id === companion.id && "bg-light/80"
            )}
            onClick={() => handleCompanionClick(companion)}
          >
            <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0 overflow-hidden flex items-center justify-center text-white">
              {companion.avatar ? (
                <img 
                  src={companion.avatar} 
                  alt={companion.name} 
                  className="object-cover w-full h-full" 
                />
              ) : (
                <Bot className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{companion.name}</p>
              <p className="text-xs text-gray-500 truncate">{companion.role}</p>
            </div>
            <div className={`w-2 h-2 rounded-full ${companion.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          className="w-full py-2 px-4 rounded-bubble border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50"
          onClick={onOpenNewCompanionModal}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          <span>Create New Companion</span>
        </Button>
      </div>
      
      {/* LLM Integrations */}
      <div className="p-4 border-b">
        <h2 className="font-heading font-medium text-sm uppercase text-gray-500 mb-3">AI Models</h2>
        
        <div className="rounded-bubble bg-light p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Active Model</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
              {activeModel}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {AI_MODELS.map((model) => (
              <Button
                key={model.id}
                variant={activeModel === model.id ? "default" : "outline"}
                className={cn(
                  "py-1 px-2 h-auto rounded-bubble text-sm",
                  activeModel === model.id ? "bg-primary text-white" : "bg-white"
                )}
                onClick={() => setActiveModel(model.id)}
              >
                {model.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="mt-auto p-4 border-t">
        <nav>
          <ul className="space-y-2">
            <li>
              <Link href="/settings">
                <a className="flex items-center space-x-3 px-3 py-2 rounded-bubble hover:bg-light transition-colors">
                  <Cog className="text-gray-500 h-5 w-5" />
                  <span>Settings</span>
                </a>
              </Link>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start px-3 py-2 rounded-bubble hover:bg-light transition-colors h-auto"
                onClick={onOpenApiKeysModal}
              >
                <Key className="text-gray-500 h-5 w-5 mr-3" />
                <span>API Keys</span>
              </Button>
            </li>
            <li>
              <Link href="/help">
                <a className="flex items-center space-x-3 px-3 py-2 rounded-bubble hover:bg-light transition-colors">
                  <HelpCircle className="text-gray-500 h-5 w-5" />
                  <span>Help & Support</span>
                </a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Sheet open={showMobileMenu} onOpenChange={onCloseMobileMenu}>
          <SheetContent side="left" className="p-0 w-80">
            {Sidebar}
          </SheetContent>
        </Sheet>
      ) : (
        Sidebar
      )}
    </>
  );
}
