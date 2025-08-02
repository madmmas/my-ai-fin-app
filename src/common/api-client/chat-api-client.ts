import { API_NAME } from "../constants";
import { ApiClientBase } from "./api-client-base";

// Ollama API types
export interface OllamaChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaChatMessage[];
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
  };
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: OllamaChatMessage;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export class ChatApiClient extends ApiClientBase {
  private model: string;
  private baseUrl: string;

  constructor(model: string = "llama3.2", baseUrl: string = "http://localhost:11434") {
    super();
    this.model = model;
    this.baseUrl = baseUrl;
  }

  async chat(message: string, systemPrompt?: string): Promise<OllamaChatResponse> {
    const headers = await this.getHeaders();

    const messages: OllamaChatMessage[] = [];
    
    // Add system message if provided
    if (systemPrompt) {
      messages.push({
        role: "system",
        content: systemPrompt
      });
    }
    
    // Add user message
    messages.push({
      role: "user",
      content: message
    });

    const requestBody: OllamaChatRequest = {
      model: this.model,
      messages,
      stream: false, // Set to true if you want streaming responses
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 1000
      }
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data: OllamaChatResponse = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error calling Ollama API:", error);
      throw error;
    }
  }

  // Method to get available models
  async listModels(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching models:", error);
      throw error;
    }
  }

  // Method to pull a model if not available
  async pullModel(modelName: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: modelName }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error pulling model:", error);
      throw error;
    }
  }

  // Method to set a different model
  setModel(model: string) {
    this.model = model;
  }

  // Method to set a different base URL
  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
}