import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const PORT = 3002;

// 1. Inicialización del Cliente (según documentación oficial)
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
  console.warn("[!] WARNING: ELEVENLABS_API_KEY not found");
}

const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY // Si no se pasa, lo busca en env por defecto, pero es mejor ser explícito
});

console.log("[OK] ElevenLabs Client initialized");

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    const corsHeaders = {
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // GET /api/voices
    if (path === "/api/voices" && req.method === "GET") {
      try {
        // ACTUALIZADO: Método moderno para obtener voces
        const response = await client.voices.getAll();
        const voices = response.voices;

        const simplifiedVoices = voices.map((voice) => ({
          id: voice.voiceId,
          name: voice.name,
          category: voice.category || "general",
          preview_url: voice.previewUrl || "",
        }));

        return new Response(JSON.stringify(simplifiedVoices), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error: any) {
        console.error("Error fetching voices:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // POST /api/speak
    if (path === "/api/speak" && req.method === "POST") {
      try {
        const body = await req.json() as { text?: string; voiceId?: string };
        const { text, voiceId } = body;

        if (!text || !voiceId) {
          return new Response(JSON.stringify({ error: "Missing text or voiceId" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // ACTUALIZADO: Método moderno para TTS
        // El nuevo SDK retorna un stream o buffer dependiendo de la configuración
        const audioStream = await client.textToSpeech.convert(voiceId, {
          text: text,
          modelId: "eleven_turbo_v2_5",
          voiceSettings: {
            stability: 0.95,
            similarityBoost: 0.75,
          },
        });

        // Bun puede manejar el stream/buffer directamente
        return new Response(audioStream as any, {
          headers: { ...corsHeaders, "Content-Type": "audio/mpeg" },
        });
      } catch (error: any) {
        console.error("Error generating speech:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // GET /api/conversation-signature
    if (path === "/api/conversation-signature" && req.method === "GET") {
      // (Esta lógica se mantiene igual ya que depende de variables de entorno)
      const agentId = process.env.ELEVENLABS_AGENT_ID;
      if (!agentId) {
        return new Response(JSON.stringify({ error: "ELEVENLABS_AGENT_ID not configured" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ agentId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Health check
    if (path === "/" || path === "/health") {
      return new Response(JSON.stringify({ status: "ok", service: "elevenlabs-voice" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
});

console.log(`🎙️  ElevenLabs Voice Server running on http://localhost:${PORT}`);