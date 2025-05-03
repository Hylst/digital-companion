import { useState, useRef } from "react";
import { X, Upload, Bot } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
import { PERSONALITIES, MAX_COMPANION_NAME_LENGTH, MAX_COMPANION_DESCRIPTION_LENGTH } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCompanionContext } from "@/context/CompanionContext";

interface NewCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(MAX_COMPANION_NAME_LENGTH),
  role: z.string().min(2, "Role must be at least 2 characters"),
  personality: z.string(),
  description: z.string().max(MAX_COMPANION_DESCRIPTION_LENGTH, `Description must be less than ${MAX_COMPANION_DESCRIPTION_LENGTH} characters`),
  avatar: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewCompanionModal({ isOpen, onClose }: NewCompanionModalProps) {
  const { refreshCompanions } = useCompanionContext();
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      role: "",
      personality: PERSONALITIES[0].id,
      description: "",
      avatar: "",
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatarPreview(e.target.result as string);
          form.setValue("avatar", e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAIAvatar = async () => {
    try {
      const name = form.getValues("name") || "AI companion";
      const personality = form.getValues("personality") || PERSONALITIES[0].id;
      
      toast({
        title: "Generating avatar",
        description: "Please wait while we create an avatar for your companion...",
      });

      const response = await apiRequest("POST", "/api/image/generate", {
        prompt: `Avatar for an AI companion named ${name} with a ${personality} personality, digital art style`,
      });

      if (response.ok) {
        const data = await response.json();
        setAvatarPreview(data.imageUrl);
        form.setValue("avatar", data.imageUrl);
      }
    } catch (error) {
      toast({
        title: "Avatar generation failed",
        description: "Could not generate an AI avatar. Please try again or upload an image.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await apiRequest("POST", "/api/companions", values);
      
      if (response.ok) {
        toast({
          title: "Companion created",
          description: `${values.name} has been successfully created!`,
        });
        refreshCompanions();
        onClose();
        form.reset();
        setAvatarPreview("");
      }
    } catch (error) {
      toast({
        title: "Failed to create companion",
        description: "An error occurred while creating your companion. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">Create New Companion</DialogTitle>
          <DialogDescription>
            Create a personalized AI companion with a unique personality.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Personality Type</FormLabel>
              <div className="grid grid-cols-2 gap-3">
                {PERSONALITIES.map((type) => (
                  <div
                    key={type.id}
                    className={`border ${
                      form.watch("personality") === type.id
                        ? "border-primary"
                        : "border-gray-300"
                    } rounded-bubble p-3 hover:border-primary cursor-pointer transition-colors`}
                    onClick={() => form.setValue("personality", type.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-full bg-${type.color} flex items-center justify-center text-white`}>
                        {type.icon === "smile" && <span className="text-lg">😊</span>}
                        {type.icon === "brain" && <span className="text-lg">🧠</span>}
                        {type.icon === "lightbulb" && <span className="text-lg">💡</span>}
                        {type.icon === "dumbbell" && <span className="text-lg">💪</span>}
                      </div>
                      <div>
                        <h3 className="font-medium">{type.name}</h3>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Creative Friend, Study Partner" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel htmlFor="companion-avatar">Avatar</FormLabel>
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 border">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="Avatar preview" />
                  ) : (
                    <AvatarFallback className="bg-secondary">
                      <Bot className="h-8 w-8 text-white" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    onClick={generateAIAvatar}
                    className="text-primary px-0 h-auto flex items-center"
                  >
                    Generate AI avatar
                  </Button>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description & Background</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your companion's personality, interests, and background..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Create Companion
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
