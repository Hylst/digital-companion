import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "./use-toast";

export const useWebSocket = (
  path = "/ws",
  onMessage?: (data: any) => void,
  reconnectInterval = 3000
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;
    
    try {
      // Create WebSocket connection
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}${path}`;
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        setIsConnected(true);
        setConnectionAttempts(0);
      };
      
      socket.onclose = () => {
        setIsConnected(false);
        socketRef.current = null;
        
        // Attempt to reconnect with exponential backoff
        const delay = Math.min(30000, reconnectInterval * Math.pow(1.5, connectionAttempts));
        setTimeout(() => {
          setConnectionAttempts(prev => prev + 1);
          connect();
        }, delay);
      };
      
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        socket.close();
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) onMessage(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };
      
      socketRef.current = socket;
    } catch (error) {
      console.error("WebSocket connection error:", error);
    }
  }, [path, onMessage, connectionAttempts, reconnectInterval]);
  
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);
  
  const sendMessage = useCallback(
    (data: any) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(data));
        return true;
      } else {
        toast({
          title: "Connection Error",
          description: "Not connected to server. Your message couldn't be sent.",
          variant: "destructive",
        });
        return false;
      }
    },
    [toast]
  );
  
  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);
  
  return {
    isConnected,
    sendMessage,
    reconnect: connect,
    disconnect,
  };
};
