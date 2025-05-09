import { useState, useEffect } from "react";
import { Eye, EyeOff, Link2, X, Info } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  gemini: z.string().optional(),
  deepseek: z.string().optional(),
  stability: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ApiKeysModal({ isOpen, onClose }: ApiKeysModalProps) {
  const [showGemini, setShowGemini] = useState(false);
  const [showDeepseek, setShowDeepseek] = useState(false);
  const [showStability, setShowStability] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    gemini: false,
    deepseek: false,
    stability: false,
  });
  
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gemini: "",
      deepseek: "",
      stability: "",
    },
  });

  // Load API keys on open
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const response = await apiRequest("GET", "/api/settings/api-keys", undefined);
        if (response.ok) {
          const data = await response.json();
          
          // Only set the form values, don't show the actual keys
          form.setValue("gemini", data.gemini ? "●●●●●●●●●●●●●●●●●●●●" : "");
          form.setValue("deepseek", data.deepseek ? "●●●●●●●●●●●●●●●●●●●●" : "");
          form.setValue("stability", data.stability ? "●●●●●●●●●●●●●●●●●●●●" : "");
          
          // Update status
          setApiStatus({
            gemini: !!data.gemini,
            deepseek: !!data.deepseek,
            stability: !!data.stability,
          });
          
          // Reset visibility states when loading masked keys
          setShowGemini(false);
          setShowDeepseek(false);
          setShowStability(false);
        }
      } catch (error) {
        console.error("Failed to fetch API keys", error);
      }
    };

    if (isOpen) {
      fetchApiKeys();
    }
  }, [isOpen, form]);

  const onSubmit = async (values: FormValues) => {
    // Don't send masked values to the server
    const keysToUpdate: any = {};
    
    if (values.gemini && values.gemini !== "●●●●●●●●●●●●●●●●●●●●") {
      keysToUpdate.gemini = values.gemini;
    }
    
    if (values.deepseek && values.deepseek !== "●●●●●●●●●●●●●●●●●●●●") {
      keysToUpdate.deepseek = values.deepseek;
    }
    
    if (values.stability && values.stability !== "●●●●●●●●●●●●●●●●●●●●") {
      keysToUpdate.stability = values.stability;
    }
    
    try {
      const response = await apiRequest("POST", "/api/settings/api-keys", keysToUpdate);
      
      if (response.ok) {
        const data = await response.json();
        
        // Update status
        setApiStatus({
          gemini: !!data.gemini,
          deepseek: !!data.deepseek,
          stability: !!data.stability,
        });
        
        // Reset masked values
        if (keysToUpdate.gemini) form.setValue("gemini", "●●●●●●●●●●●●●●●●●●●●");
        if (keysToUpdate.deepseek) form.setValue("deepseek", "●●●●●●●●●●●●●●●●●●●●");
        if (keysToUpdate.stability) form.setValue("stability", "●●●●●●●●●●●●●●●●●●●●");
        
        // Reset visibility states after saving
        setShowGemini(false);
        setShowDeepseek(false);
        setShowStability(false);
        
        // Show success
        toast({
          title: "Clés API enregistrées",
          description: "Vos clés API ont été enregistrées avec succès.",
        });
        
        onClose();
      }
    } catch (error) {
      toast({
        title: "Échec de l'enregistrement des clés API",
        description: "Une erreur s'est produite lors de l'enregistrement de vos clés API. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">API Key Settings</DialogTitle>
          <DialogDescription>
            Connect to AI services by providing your API keys
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="gemini"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Gemini API Key</FormLabel>
                    <span className={`text-xs ${apiStatus.gemini ? 'text-green-600' : 'text-red-600'}`}>
                      {apiStatus.gemini ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showGemini ? "text" : "password"}
                        placeholder="Enter your Gemini API key"
                        {...field}
                        onChange={(e) => {
                          // Only update if it's not the masked value
                          if (e.target.value !== "●●●●●●●●●●●●●●●●●●●●") {
                            field.onChange(e);
                          }
                        }}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowGemini(!showGemini)}
                    >
                      {showGemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Get your Gemini API key from{" "}
                    <a
                      href="https://ai.google.dev/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      ai.google.dev
                    </a>
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deepseek"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>DeepSeek API Key</FormLabel>
                    <span className={`text-xs ${apiStatus.deepseek ? 'text-green-600' : 'text-red-600'}`}>
                      {apiStatus.deepseek ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showDeepseek ? "text" : "password"}
                        placeholder="Enter your DeepSeek API key"
                        {...field}
                        onChange={(e) => {
                          if (e.target.value !== "●●●●●●●●●●●●●●●●●●●●") {
                            field.onChange(e);
                          }
                        }}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowDeepseek(!showDeepseek)}
                    >
                      {showDeepseek ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Get your DeepSeek API key from{" "}
                    <a
                      href="https://deepseek.ai/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      deepseek.ai
                    </a>
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stability"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Stability AI Key (Images)</FormLabel>
                    <span className={`text-xs ${apiStatus.stability ? 'text-green-600' : 'text-red-600'}`}>
                      {apiStatus.stability ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showStability ? "text" : "password"}
                        placeholder="Enter your Stability API key"
                        {...field}
                        onChange={(e) => {
                          if (e.target.value !== "●●●●●●●●●●●●●●●●●●●●") {
                            field.onChange(e);
                          }
                        }}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowStability(!showStability)}
                    >
                      {showStability ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    For image generation. Get from{" "}
                    <a
                      href="https://stability.ai/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      stability.ai
                    </a>
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert className="bg-yellow-50 border-yellow-200">
              <Info className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm text-yellow-800">
                API keys are stored securely and are used only to connect to the respective AI services. Your API usage is billed directly by the service providers.
              </AlertDescription>
            </Alert>

            <DialogFooter className="flex justify-between flex-row">
              <div>
                <Button type="button" variant="outline" onClick={onClose}>
                  Back to Chat
                </Button>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
