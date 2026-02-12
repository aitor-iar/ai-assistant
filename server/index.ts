const elevenLabs = require("elevenlabs-js");

const PORT = 3002;

// Initialize ElevenLabs client
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVENLABS_API_KEY) {
  console.warn("[!] WARNING: ELEVENLABS_API_KEY not found in environment variables");
} else {
  elevenLabs.setApiKey(ELEVENLABS_API_KEY);
  console.log("[OK] ElevenLabs API Key configured");
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // GET /api/voices - Fetch available voices
    if (path === "/api/voices" && req.method === "GET") {
      try {
        const voicesData = await elevenLabs.getVoices();
        
        // Simplify the response
        const simplifiedVoices = voicesData.voices.map((voice: any) => ({
          id: voice.voice_id,
          name: voice.name,
          category: voice.category || "general",
          preview_url: voice.preview_url || "",
        }));

        return new Response(JSON.stringify(simplifiedVoices), {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      } catch (error: any) {
        console.error("Error fetching voices:", error);
        return new Response(
          JSON.stringify({ error: error.message || "Failed to fetch voices" }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    // POST /api/speak - Streaming TTS
    if (path === "/api/speak" && req.method === "POST") {
      try {
        const body = await req.json();
        const { text, voiceId } = body;

        if (!text || !voiceId) {
          return new Response(
            JSON.stringify({ error: "Missing text or voiceId" }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              },
            }
          );
        }

        // Generate audio stream from ElevenLabs
        const audioStream = await elevenLabs.textToSpeech(
          voiceId,
          text,
          "eleven_monolingual_v1",
          {
            stability: 0.95,
            similarity_boost: 0.75,
          }
        );

        // Return the stream directly to the client
        return new Response(audioStream as any, {
          headers: {
            ...corsHeaders,
            "Content-Type": "audio/mpeg",
          },
        });
      } catch (error: any) {
        console.error("Error generating speech:", error);
        return new Response(
          JSON.stringify({ error: error.message || "Failed to generate speech" }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    // GET /api/conversation-signature - For Conversational AI
    if (path === "/api/conversation-signature" && req.method === "GET") {
      try {
        const agentId = process.env.ELEVENLABS_AGENT_ID;
        
        if (!agentId) {
          return new Response(
            JSON.stringify({ error: "ELEVENLABS_AGENT_ID not configured" }),
            {
              status: 500,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              },
            }
          );
        }

        // For the @elevenlabs/react SDK, we need to provide configuration
        // The SDK handles the connection to the conversational AI
        return new Response(
          JSON.stringify({
            agentId,
            apiKey: ELEVENLABS_API_KEY, // Note: In production, use a more secure method
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error: any) {
        console.error("Error getting conversation signature:", error);
        return new Response(
          JSON.stringify({ error: error.message || "Failed to get conversation signature" }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    // Health check
    if (path === "/" || path === "/health") {
      return new Response(JSON.stringify({ status: "ok", service: "elevenlabs-voice" }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    return new Response("Not Found", { 
      status: 404,
      headers: corsHeaders,
    });
  },
});

console.log(`🎙️  ElevenLabs Voice Server running on http://localhost:${PORT}`);
