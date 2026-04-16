import express from "express";
import cors from "cors";
import { handleAgentRequest } from "./src/api/agent/route.ts";
import { config } from "dotenv";
import path from "path";
import Stripe from "stripe";
import { Resend } from "resend";

// Load environment variables — .env first, then .env.local overrides
config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

if (process.env.GEMINI_API_KEY) {
  process.env.OPENAI_API_KEY = process.env.GEMINI_API_KEY;
}
process.env.OPENAI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/";

// ── Startup Diagnostics ──────────────────────────────────
const geminiKey = process.env.GEMINI_API_KEY || "";
const groqKey = process.env.GROQ_API_KEY || "";
console.log("\n╔══════════════════════════════════════════════╗");
console.log("║       WanderWise AI — Server Starting        ║");
console.log("╚══════════════════════════════════════════════╝");
console.log(`  🔑 Gemini API Key: ${geminiKey ? `${geminiKey.substring(0, 10)}...✓` : "❌ NOT SET"}`);
console.log(`  🔑 Groq API Key:   ${groqKey ? `${groqKey.substring(0, 10)}...✓` : "⬜ NOT SET (optional fallback)"}`);
console.log(`  🗄️  Supabase URL:  ${process.env.VITE_SUPABASE_URL ? "✓" : "❌ NOT SET"}`);
console.log(`  📦 Redis URL:      ${process.env.UPSTASH_REDIS_URL ? "✓" : "❌ NOT SET"}`);
if (!geminiKey && !groqKey) {
  console.log("\n  ⚠️  No AI provider configured! Add at least one:");
  console.log("  • Gemini (free): https://aistudio.google.com/app/apikey");
  console.log("  • Groq (free):   https://console.groq.com/keys");
  console.log("  Then add to .env: GEMINI_API_KEY=xxx or GROQ_API_KEY=xxx\n");
} else if (geminiKey && !groqKey) {
  console.log("  💡 Tip: Add GROQ_API_KEY for automatic fallback if Gemini fails");
  console.log("     Get free key at: https://console.groq.com/keys");
}

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize SDKs
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", { apiVersion: "2024-10-28.acacia" as any });
const resend = new Resend(process.env.RESEND_API_KEY || "re_mock");

// Middleware
app.use(cors());

// Stripe Webhook MUST come before express.json() to read raw buffer
app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(req.body, sig as string, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("Payment successful for session:", session.id);
    
    // Trigger Resend Email Confirmation
    try {
      if (process.env.RESEND_API_KEY) {
         await resend.emails.send({
          from: "WanderWise <bookings@wanderwise.ai>",
          to: [session.customer_details?.email || "customer@example.com"],
          subject: "Your WanderWise Booking Confirmation",
          html: `<h1>Pack your bags!</h1><p>Your trip is officially confirmed. Reference: ${session.id}</p>`
        });
        console.log("Confirmation email sent via Resend!");
      } else {
        console.log("[Mock] Would send email to:", session.customer_details?.email);
      }
    } catch(e) {
      console.error("Email sending failed:", e);
    }
  }

  res.json({ received: true });
});

app.use(express.json());

// Main Agent Endpoint
app.post("/api/agent", async (req, res) => {
  try {
    const { message, session_id, attachments } = req.body;

    // Call the generic agent handler
    const response = await handleAgentRequest({
      headers: req.headers as Record<string, string>,
      body: { message, session_id, attachments },
    });

    // Set headers returned by the agent
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    res.status(response.status);

    // If it's a string (like an error), send it directly
    if (typeof response.body === "string") {
      res.send(response.body);
      return;
    }

    // It is a ReadableStream (Server-Sent Events)
    const stream = response.body as ReadableStream;
    const reader = stream.getReader();

    // Clean up if client drops connection
    req.on("close", () => {
      reader.cancel();
      res.end();
    });

    // Pipe the standard web ReadableStream to the Express Response
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
      // Ensure the chunks are immediately flushed
      if (typeof (res as any).flush === "function") {
        (res as any).flush();
      } else if (typeof res.flushHeaders === "function") {
        res.flushHeaders();
      }
    }

    res.end();
  } catch (error) {
    console.error("Server error handling /api/agent:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Basic health check
app.get("/api/health", (req, res) => {
  const hasKey = !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV,
    ai: {
      keyConfigured: hasKey,
      model: "gemini-2.0-flash",
    },
  });
});

// AI-specific health check — tests the actual Gemini API
app.get("/api/health/ai", async (req, res) => {
  const key = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "";
  if (!key) {
    res.status(503).json({
      status: "error",
      message: "No GEMINI_API_KEY configured. Get one free at https://aistudio.google.com/app/apikey",
    });
    return;
  }

  try {
    const testRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "gemini-2.0-flash",
          messages: [{ role: "user", content: "Say OK" }],
          max_tokens: 5,
        }),
      },
    );

    if (testRes.ok) {
      res.json({ status: "ok", message: "Gemini API is working ✓" });
    } else {
      const body = await testRes.text();
      res.status(testRes.status).json({
        status: "error",
        code: testRes.status,
        message:
          testRes.status === 429
            ? "API quota exceeded — wait a minute or generate a new key at https://aistudio.google.com/app/apikey"
            : `Gemini API returned ${testRes.status}`,
        detail: body.substring(0, 300),
      });
    }
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Travel APIs (Amadeus mock proxy)
app.get("/api/flights", (req, res) => {
  const { origin, destination, date, adults } = req.query;
  // In a real app, this would deeply integrate with Amadeus API
  res.json({
    status: "success",
    data: [
      {
        airline: "Japan Airlines", code: "JAL", depart: "10:20", arrive: "08:00", departCode: origin || "LHR", arriveCode: destination || "NRT",
        duration: "13h 40m", stops: "Direct", price: "£942", class: "Economy", picked: true,
        perks: ["Free Wi-Fi", "Meal included", "23kg Check-in"],
        logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHG8V-vx2Bxyyts1RSV3rMl7GZFwejSPR_6kzWQ6wVNqaEjRsvTUPRgWeJ-nccLLewbIRTL1FnpTd3M0ZoZqoCuv_ooYgBUMAEKmeczyL6BbUB-cwnoXXWCRfY6XS8cesjiRALT823Lf-oJ7URbK6gZuE-GkZawfVj38fwrlj8C4a8UdpzpPy0GMLoUPON2E8zh2RdbX9x0V44YVzZq6nOaGMwTF4WZuOUrZQ-t-zf5yVE5sVaOccZmmC0XCb3uHSQhbq9pUjvocw"
      },
      {
        airline: "British Airways", code: "BA", depart: "13:50", arrive: "12:05", departCode: origin || "LHR", arriveCode: destination || "NRT",
        duration: "14h 15m", stops: "Direct", price: "£1,050", class: "Economy",
        logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBU0iqxZnkpHomLeN1aqqS9EB9HQB6Rzz8vXGCwyyGlpz9iV7OJV3_ncEVH4XDVjMf5utUPw6L9uPAdaZAPKvBCOSxKnIiFhjubLo6nNoDwbr8bEg-BzyNO5DN3METogtk-BX0jGRbZeorw1lspJynPOjS44CEAlvlnNC4xLZRycmx5jZdXk7c3f8GloxM_7ASn_FwNpp307NOylA1PYIz7ivdXJVOdaZIv-N9KfMQbXxvR3uxLYwi4YMGZUyM_OeI0-xaC5mlYpxc"
      },
      {
        airline: "Finnair", code: "AY", depart: "07:20", arrive: "09:05", departCode: origin || "LHR", arriveCode: destination || "NRT",
        duration: "17h 45m", stops: "1 Stop (HEL)", price: "£645", class: "Economy", hasStop: true,
        logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDG2FLmxZvgZApYM-Hpxy5oCu_xjAVZsbdMD0-4-vIiA99zTqu3kvcVipw9OsnCbH6jR7dzltwSkVTRkqQ9rrQnb7QP7eOD24458i8eISkIgQ-PER7Bw5Z6ztNbuDPbRHUVJ5f2FmP2D6I4DMXAZNNeMqkwq7jvuD_fFygar1B1CUiiqPInJOBnb4YRisxmAe5HauFyBXbkCSMSPQ8SKm6Hu4ql4Zbo_77XVtD6-7fmu3K7C-g8-m84alS3YKgqd-szhbGR9YV53VY"
      },
      {
        airline: "ANA", code: "NH", depart: "19:00", arrive: "16:35", departCode: origin || "LHR", arriveCode: destination || "NRT",
        duration: "13h 35m", stops: "Direct", price: "£988", class: "Economy",
        logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCn6ckClYlhgfBz7Elb8euKvW2rTChNr-xxg708BwlNb_yXK0pvLoD75vvbnKygri4_4w3D3GUylSu6Q4ttQbOmv9Edf6eCcOyrUhF7r3Kdn3nlNPYwnk7gZLZKfOwEycVG0PJ6NXiIUldPzKjQ4W_Km-qMSn2h-iuXLZugR2wOSi7DdYDUmqh2ep0IPNJ0-4ECAXpQy0XE2spe__apMASNPWTRONi7Al1xdFs0HjFbujlgFCRw-hEkPJFjdEAJcw067ufx6XVPx2I"
      }
    ]
  });
});

app.get("/api/hotels", (req, res) => {
  const { city } = req.query;
  res.json({
    status: "success",
    data: [
      {
        name: "Park Hyatt Tokyo", rating: "5.0", location: "Shinjuku Park Tower, Nishi-Shinjuku",
        total: "£867", perNight: "£289/night", badge: "Top Choice",
        amenities: [{ icon: "pool", label: "Pool" }, { icon: "spa", label: "Spa" }, { icon: "fitness_center", label: "Gym" }],
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDbtRvHZd8b5AUdwFfDi1feW8os9ikuYtMguSR2zyHWGV9ZpP4JAmFdliiFvgiA3jIHLIW10bzT5QpIal7AIDUTnuTObdMSmkASyvKqfSLOv2k3pwZjvFPrprg6mzECc6xmH1gPjMbpzuoj-QvySkul0HtQqIZhdLwwjztf80QKi7YiWX01iDucekavESHhZkkQjhgRJGPgeop8zn0-rZ4qzLImoIG8nYUy4R3HVQgkkiX_rHFdqWTLXbDgRF0Mgx3JuKm8tVTG_Y",
      },
      {
        name: "Keio Plaza Hotel", rating: "4.5", location: "2-chome Nishi-Shinjuku",
        total: "£567", perNight: "£189/night",
        amenities: [{ icon: "wifi", label: "Free WiFi" }, { icon: "restaurant", label: "11 Restaurants" }],
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkyhkPisqaEZNm3tRkbtn8aTBqkZ6qwHjSEGh8dmQSTVJWkxdv2cMwMWU0oDqjgqQYbSiSAbmUfHM9V__TjbXCKl7jK6bqBBriHsqsg0vZasgb7PtAC0KyrknN2vHuEn4tJ4Gl8EjfjjuUT3X-VZFJJbEfgW1b5zpkGu80LBpWn05c4btE_g-nX1eC6B_2x-OFEZg9sVeUvhk9SFk3Xw7t5pElWEEm4st-2L8T0fMb1nanIdn30R12oZxQepNf8UqWRdHfj-slU94",
      },
      {
        name: "Shinjuku Granbell Hotel", rating: "4.3", location: "Kabukicho, Shinjuku",
        total: "£447", perNight: "£149/night",
        amenities: [{ icon: "local_bar", label: "Rooftop Bar" }, { icon: "coffee", label: "Cafe" }],
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_nqGr9opdUiB8L1IDDss5iSPHPwGjpMv9tnLbvK3PXiJfcgGCrCoQYTRMnXSVq3_LFEHOmyFYq28_N8qm4qk9_nfi4a6S-QVbid8cct9VJvzkum3AupQh9wZqRzNyebU2fJWOEgnbWWng0Xog5c_XXozzdgWbqTvWs8BxnDJDP9wnnmHDrRviglAi-jmxjCm4CWB-okUzTKKKlzPRmLTrCWRe4ZzI4wOPeWuKNHcJ0UlZzS9vpfoE5k4Lu1KFg6FVGRTNjWdgkfs",
      }
    ]
  });
});

// Stripe Checkout Session API
app.post("/api/checkout", async (req, res) => {
  try {
    const { item_name, amount_gbp } = req.body;
    
    // If no live key is set, simulate a successful redirect right away
    if (!process.env.STRIPE_SECRET_KEY) {
      res.json({ url: `${req.headers.origin}/#/booking/confirm` });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { name: item_name || "WanderWise Booking" },
            unit_amount: Math.round((amount_gbp || 100) * 100), // Convert to pence
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.origin}/#/booking/confirm`,
      cancel_url: `${req.headers.origin}/#/flights`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// Invite API (Send Email via Resend)
app.post("/api/invite", async (req, res) => {
  try {
    const { email, link } = req.body;
    
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    // Since users may use a temporary or unverified domain, testing with Resend only supports 'delivered' to verified emails if using default domains.
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_mock") {
       const { data, error } = await resend.emails.send({
        from: "WanderWise <onboarding@resend.dev>", // using Resend's default test sandboxed sender domain
        to: [email],
        subject: "You've been invited to a WanderWise Trip! ✈️",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">WanderWise</h1>
            <h2>You've been invited!</h2>
            <p>Your friend has invited you to join their travel group on WanderWise.</p>
            <p>View the itinerary, add your own suggestions, and start packing!</p>
            <div style="margin: 30px 0;">
              <a href="${link || 'https://wanderwise.ai'}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Trip</a>
            </div>
          </div>
        `
      });

      if (error) {
        console.error("Resend API Error:", error);
        res.status(400).json({ error: error.message });
        return;
      }

      console.log("Invite sent via Resend to:", email, data);
      res.json({ success: true, message: "Invite sent successfully", data });
    } else {
      console.log(`[Mock] Would send invite email to: ${email}`);
      await new Promise(r => setTimeout(r, 800)); // Simulate delay
      res.json({ success: true, mock: true });
    }
  } catch (error) {
    console.error("Invite Error:", error);
    res.status(500).json({ error: "Failed to send invite" });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Ensure the server keeps running
server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
