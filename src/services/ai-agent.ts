import { supabase } from "@/lib/supabase";
import { StreamChunk } from "@/lib/types";

const API_URL = "/api/agent";

export class AiAgentService {
  private static sessionId: string = crypto.randomUUID();

  static async *sendMessage(message: string, attachments: any[] = []): AsyncGenerator<StreamChunk> {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      yield { type: "error", code: "UNAUTHORIZED", message: "Please sign in to use the AI concierge." };
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message,
          session_id: this.sessionId,
          attachments
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to connect to AI agent");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE format: data: {...}\n\n
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep the incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (dataStr === "[DONE]") continue;
            
            try {
              const chunk = JSON.parse(dataStr) as StreamChunk;
              yield chunk;
            } catch (e) {
              console.error("Failed to parse SSE chunk", e, dataStr);
            }
          }
        }
      }
    } catch (error: any) {
      console.error("AiAgentService Error:", error);
      yield { 
        type: "error", 
        code: "AGENT_ERROR", 
        message: error.message || "I'm having trouble connecting to my brain right now." 
      };
    }
  }

  static resetSession() {
    this.sessionId = crypto.randomUUID();
  }
}
