import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpSupportModal({ isOpen, onClose }: HelpSupportModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">Aide & Support</DialogTitle>
          <DialogDescription>
            Guide d'utilisation et informations sur l'application
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="guide">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="guide">Guide d'utilisation</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="about">À propos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="guide" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Démarrage rapide</h3>
              <p className="text-sm text-gray-600 mb-2">
                DigitalCompanion est une application qui vous permet de créer et d'interagir avec des compagnons IA personnalisés.
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 pl-4">
                <li>Configurez vos clés API dans la section "API Keys" pour activer les fonctionnalités d'IA</li>
                <li>Créez un nouveau compagnon en cliquant sur "Create New Companion" dans la barre latérale</li>
                <li>Sélectionnez un compagnon dans la liste pour commencer à discuter avec lui</li>
                <li>Utilisez le champ de texte en bas de l'écran pour envoyer des messages</li>
              </ol>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Configuration des clés API</h3>
              <p className="text-sm text-gray-600 mb-2">
                Pour utiliser toutes les fonctionnalités de l'application, vous devez configurer vos clés API :
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 pl-4">
                <li><strong>Gemini API</strong> : Permet d'utiliser le modèle Gemini pour les conversations</li>
                <li><strong>DeepSeek API</strong> : Active le modèle DeepSeek pour des réponses avancées</li>
                <li><strong>Stability AI</strong> : Permet la génération d'images dans les conversations</li>
              </ul>
              <p className="text-sm text-gray-600 mt-2">
                Vous pouvez obtenir ces clés sur les sites officiels des fournisseurs et les configurer dans la section "API Keys".
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Création de compagnons</h3>
              <p className="text-sm text-gray-600 mb-2">
                Personnalisez vos compagnons IA selon vos besoins :
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 pl-4">
                <li>Donnez un nom et un rôle à votre compagnon</li>
                <li>Ajoutez une description détaillée pour définir sa personnalité</li>
                <li>Personnalisez son apparence en ajoutant un avatar</li>
                <li>Définissez des instructions spécifiques pour guider ses réponses</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="faq" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Questions fréquentes</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Comment mes données sont-elles utilisées ?</h4>
                  <p className="text-sm text-gray-600">
                    Vos conversations sont stockées localement et ne sont pas partagées avec des tiers. Les clés API sont utilisées uniquement pour communiquer avec les services d'IA respectifs.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Puis-je utiliser l'application sans clés API ?</h4>
                  <p className="text-sm text-gray-600">
                    Certaines fonctionnalités de base sont disponibles, mais pour profiter pleinement de l'application, il est recommandé de configurer au moins une clé API.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Comment supprimer un compagnon ?</h4>
                  <p className="text-sm text-gray-600">
                    Accédez aux paramètres du compagnon et utilisez l'option de suppression. Cette action est irréversible.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Les modèles d'IA sont-ils gratuits ?</h4>
                  <p className="text-sm text-gray-600">
                    L'utilisation des modèles d'IA nécessite des clés API qui peuvent être soumises à des frais par les fournisseurs de services. Consultez leurs sites web pour plus d'informations sur la tarification.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="about" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">À propos de DigitalCompanion</h3>
              <p className="text-sm text-gray-600 mb-4">
                DigitalCompanion est une application de création et d'interaction avec des compagnons IA personnalisés. Elle permet de créer des assistants virtuels adaptés à vos besoins spécifiques.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium mb-2">Informations sur le créateur</h4>
                <p className="text-sm text-gray-600">
                  <strong>Développeur :</strong> Geoffroy Streit - Hylst<br />
                  <strong>Année :</strong> 2024<br />
                  <strong>Version :</strong> 1.0.0
                </p>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Technologies utilisées</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 pl-4">
                  <li>React avec TypeScript</li>
                  <li>Node.js et Express</li>
                  <li>Intégrations API avec Gemini, DeepSeek et Stability AI</li>
                  <li>WebSockets pour les communications en temps réel</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}