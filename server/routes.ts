import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import { generateLLMResponse, generateImage } from "./llm";
import { getApiKey } from "./utils";

interface Client {
  id: string;
  userId?: number;
  socket: WebSocket;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const clients: Client[] = [];
  
  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (socket) => {
    const clientId = Math.random().toString(36).substring(2, 15);
    const client: Client = { id: clientId, socket };
    clients.push(client);
    
    console.log(`WebSocket client connected: ${clientId}`);
    
    socket.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Handle different message types
        if (message.type === 'user_message' && message.companionId) {
          const response = await generateLLMResponse({
            prompt: message.content,
            companionId: message.companionId,
            model: message.model || 'gemini'
          });
          
          // Send typing indicator
          socket.send(JSON.stringify({
            type: 'typing_indicator',
            companionId: message.companionId,
            isTyping: true
          }));
          
          // Simulate AI thinking time
          setTimeout(() => {
            socket.send(JSON.stringify({
              type: 'companion_message',
              content: response.text,
              companionId: message.companionId
            }));
            
            // Stop typing indicator
            socket.send(JSON.stringify({
              type: 'typing_indicator',
              companionId: message.companionId,
              isTyping: false
            }));
          }, 1500);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    socket.on('close', () => {
      const index = clients.findIndex(c => c.id === clientId);
      if (index !== -1) {
        clients.splice(index, 1);
      }
      console.log(`WebSocket client disconnected: ${clientId}`);
    });
  });

  // API Routes
  const apiPrefix = '/api';
  
  // Companions API
  app.get(`${apiPrefix}/companions`, async (req, res) => {
    try {
      const companions = await storage.getCompanions();
      res.json(companions);
    } catch (error) {
      console.error('Error fetching companions:', error);
      res.status(500).json({ error: 'Failed to fetch companions' });
    }
  });
  
  app.get(`${apiPrefix}/companions/:id`, async (req, res) => {
    try {
      const companion = await storage.getCompanionById(parseInt(req.params.id));
      if (!companion) {
        return res.status(404).json({ error: 'Companion not found' });
      }
      res.json(companion);
    } catch (error) {
      console.error(`Error fetching companion ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to fetch companion' });
    }
  });
  
  app.post(`${apiPrefix}/companions`, async (req, res) => {
    try {
      const newCompanion = await storage.createCompanion(req.body);
      res.status(201).json(newCompanion);
    } catch (error) {
      console.error('Error creating companion:', error);
      res.status(500).json({ error: 'Failed to create companion' });
    }
  });
  
  // Conversations API
  app.get(`${apiPrefix}/conversations/:companionId/messages`, async (req, res) => {
    try {
      const messages = await storage.getConversationMessages(parseInt(req.params.companionId));
      res.json(messages);
    } catch (error) {
      console.error(`Error fetching messages for companion ${req.params.companionId}:`, error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });
  
  app.post(`${apiPrefix}/conversations/:companionId/messages`, async (req, res) => {
    try {
      const { content, model = 'gemini' } = req.body;
      const companionId = parseInt(req.params.companionId);
      
      // Save user message
      const userMessage = await storage.saveMessage({
        companionId,
        content,
        role: 'user'
      });
      
      // Generate AI response
      const response = await generateLLMResponse({
        prompt: content,
        companionId,
        model
      });
      
      // Extract image URL if present in the message
      let imageUrl;
      const imageMatch = response.text.match(/!\[.*?\]\((.*?)\)/);
      if (imageMatch && imageMatch[1]) {
        imageUrl = imageMatch[1];
        // Remove the markdown image syntax from the response
        response.text = response.text.replace(/!\[.*?\]\((.*?)\)/, '');
      }
      
      // Save AI response
      const assistantMessage = await storage.saveMessage({
        companionId,
        content: response.text,
        role: 'assistant',
        imageUrl
      });
      
      res.json({
        userMessage,
        assistantMessage
      });
    } catch (error) {
      console.error(`Error processing message for companion ${req.params.companionId}:`, error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  });
  
  // Image Generation API
  app.post(`${apiPrefix}/image/generate`, async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }
      
      const apiKey = await getApiKey('stability');
      
      // Fall back to huggingface if no stability API key
      const imageUrl = await generateImage(prompt, apiKey);
      
      res.json({ imageUrl, prompt });
    } catch (error) {
      console.error('Error generating image:', error);
      res.status(500).json({ error: 'Failed to generate image' });
    }
  });
  
  // API Keys Management
  app.get(`${apiPrefix}/settings/api-keys`, async (req, res) => {
    try {
      const keys = await storage.getApiKeys();
      
      // Only return which providers have keys, not the actual keys
      const keyStatus = {
        gemini: keys.some(k => k.provider === 'gemini' && k.isValid),
        deepseek: keys.some(k => k.provider === 'deepseek' && k.isValid),
        stability: keys.some(k => k.provider === 'stability' && k.isValid)
      };
      
      res.json(keyStatus);
    } catch (error) {
      console.error('Erreur lors de la récupération des clés API:', error);
      res.status(500).json({ error: 'Échec de la récupération des clés API' });
    }
  });
  
  app.post(`${apiPrefix}/settings/api-keys`, async (req, res) => {
    try {
      const { gemini, deepseek, stability } = req.body;
      
      console.log('Requête de sauvegarde des clés API reçue:', { 
        gemini: gemini ? '***' : undefined, 
        deepseek: deepseek ? '***' : undefined, 
        stability: stability ? '***' : undefined 
      });
      
      // Validation des clés
      const keysToSave = [];
      if (gemini !== undefined) keysToSave.push({ provider: 'gemini', key: gemini });
      if (deepseek !== undefined) keysToSave.push({ provider: 'deepseek', key: deepseek });
      if (stability !== undefined) keysToSave.push({ provider: 'stability', key: stability });
      
      if (keysToSave.length === 0) {
        return res.status(400).json({ error: 'Aucune clé API fournie' });
      }
      
      // Sauvegarder chaque clé individuellement pour une meilleure gestion des erreurs
      let hasErrors = false;
      for (const keyData of keysToSave) {
        try {
          await storage.saveApiKey(keyData);
          console.log(`Clé API pour ${keyData.provider} sauvegardée avec succès`);
        } catch (keyError) {
          hasErrors = true;
          console.error(`Erreur lors de la sauvegarde de la clé ${keyData.provider}:`, keyError);
          // Continuer avec les autres clés même si une échoue
        }
      }
      
      // Récupérer les clés mises à jour
      const keys = await storage.getApiKeys();
      
      // Return status, not the actual keys
      const keyStatus = {
        gemini: keys.some(k => k.provider === 'gemini' && k.isValid),
        deepseek: keys.some(k => k.provider === 'deepseek' && k.isValid),
        stability: keys.some(k => k.provider === 'stability' && k.isValid)
      };
      
      console.log('Statut des clés API après sauvegarde:', keyStatus);
      
      if (hasErrors) {
        res.status(207).json({
          message: 'Certaines clés API ont été sauvegardées avec des erreurs',
          status: keyStatus
        });
      } else {
        res.json(keyStatus);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des clés API:', error);
      res.status(500).json({ 
        error: 'Échec de la sauvegarde des clés API', 
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  });

  return httpServer;
}
