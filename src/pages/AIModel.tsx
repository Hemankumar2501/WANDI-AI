import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { Send, Menu, Plus, Globe, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Role = "user" | "assistant";
interface Message {
  role: Role;
  content: string;
}

const generateSessionId = () => {
  return "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
};

export default function AIModel() {
  const [sessionId, setSessionId] = useState(generateSessionId());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();
  const hasAutoQueried = useRef(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (location.state?.autoQuery && !hasAutoQueried.current) {
      hasAutoQueried.current = true;
      sendMessage(location.state.autoQuery);
    }
  }, [location.state]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  };

  const startNewChat = () => {
    setSessionId(generateSessionId());
    setMessages([]);
    setSidebarOpen(false);
  };

  const suggestions = [
    { text: "🗺️ Trip to Bali", query: "Plan a 5-day trip to Bali for a couple on a budget" },
    { text: "🍜 Bangkok Street Food", query: "Best street food in Bangkok under $5" },
    { text: "🚄 Paris to Amsterdam", query: "How to travel from Paris to Amsterdam by train?" },
    { text: "🏛️ Taj Mahal History", query: "Tell me the history of the Taj Mahal" },
    { text: "✈️ Delhi to Singapore", query: "Cheapest flights from Delhi to Singapore" },
    { text: "🍽️ Eiffel Tower Dining", query: "Best restaurants near the Eiffel Tower" },
    { text: "🧳 Switzerland Packing", query: "What should I pack for a winter trip to Switzerland?" },
    { text: "🛡️ Safety Tips", query: "Safety tips for solo female travelers in Southeast Asia" },
  ];

  const welcomeFeatures = [
    { icon: "🍽️", label: "Restaurants", query: "Recommend the best restaurants in Tokyo" },
    { icon: "🏛️", label: "History", query: "Tell me the history of the Colosseum in Rome" },
    { icon: "✈️", label: "Flights", query: "Find cheap flights from Mumbai to Dubai" },
    { icon: "🚄", label: "Transport", query: "Best way to travel around Europe by train" },
    { icon: "🗺️", label: "Trip Plans", query: "Plan a 7-day honeymoon trip to Maldives" },
    { icon: "💰", label: "Budget", query: "Budget breakdown for 5 days in Bali" },
  ];

  const sendMessage = async (override?: string) => {
    const text = override || input.trim();
    if (!text) return;
    
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      // 1. We insert a placeholder message to be streamed into
      let botResponse = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const response = await fetch("/ollama/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          model: "wandi", 
          prompt: text,
          stream: true
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to connect to Offline Wandi");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              botResponse += parsed.response;
              
              // Update the absolute last message in the state (our placeholder) with the new chunk
              setMessages((prev) => {
                const arr = [...prev];
                arr[arr.length - 1] = { role: "assistant", content: botResponse };
                return arr;
              });
            } else if (parsed.error) {
               throw new Error(parsed.error);
            }
          } catch (e) {
            // Ignore parse errors on partial chunks
          }
        }
      }
    } catch (e: any) {
       console.error("Stream error", e);
       setMessages((prev) => {
         const arr = [...prev];
         arr[arr.length - 1] = { 
           role: "assistant", 
           content: "⚠️ **Connection Error**: I couldn't reach my cloud brain right now. Make sure your server and API keys are running." 
         };
         return arr;
       });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <TopNavBar />

      {/* Main Container below navbar */}
      <main className="flex-1 container mx-auto px-4 md:px-8 py-8 flex items-center justify-center mt-16 max-w-7xl">
        
        {/* ChatGPT Style Box Window */}
        <div className="flex w-full h-[82vh] min-h-[600px] bg-white rounded-3xl shadow-2xl shadow-emerald-900/5 ring-1 ring-gray-200 overflow-hidden relative">
          
          {/* Mobile Overlay Background */}
          {sidebarOpen && (
            <div 
              className="absolute inset-0 bg-gray-900/20 z-20 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside className={`absolute md:relative z-30 h-full w-[260px] bg-gray-50 border-r border-gray-200 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
             
             {/* Sidebar Header */}
             <div className="p-4 border-b border-gray-200">
               <div className="flex items-center gap-2 mb-6 ml-2 mt-2">
                 <Globe className="text-emerald-600 h-6 w-6" />
                 <div>
                   <h1 className="font-bold text-gray-900 leading-tight">WanderWise</h1>
                   <div className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">AI Concierge</div>
                 </div>
               </div>
               
               <button 
                 onClick={startNewChat}
                 className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-emerald-600 hover:text-emerald-700 font-medium py-2.5 px-4 rounded-xl shadow-sm transition-all text-sm group"
               >
                 <Plus className="w-4 h-4 text-emerald-600 group-hover:rotate-90 transition-transform" />
                 New Chat
               </button>
             </div>

             {/* Sidebar Suggestions */}
             <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">Try asking about</p>
               {suggestions.map((s, i) => (
                 <button 
                   key={i}
                   onClick={() => {
                     setSidebarOpen(false);
                     sendMessage(s.query);
                   }}
                   className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors truncate border border-transparent hover:border-emerald-100"
                 >
                   {s.text}
                 </button>
               ))}
             </div>

             {/* Sidebar Footer */}
             <div className="p-4 border-t border-gray-200 bg-gray-100/50">
               <div className="text-xs text-gray-500 flex items-center justify-center gap-1.5 font-medium">
                 <Sparkles className="w-3 h-3 text-amber-500" />
                 Powered by <span className="font-bold text-gray-800">Agent AI</span>
               </div>
             </div>
          </aside>

          {/* Main Chat View */}
          <section className="flex-1 flex flex-col bg-white w-full h-full relative">
            
            {/* Header */}
            <header className="h-[60px] border-b border-gray-100 flex items-center px-4 md:px-6 bg-white/80 backdrop-blur-sm z-10 shrink-0">
               <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 mr-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                 <Menu className="w-5 h-5" />
               </button>
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-lg shadow-inner ring-2 ring-white">
                   🧳
                 </div>
                 <div>
                   <h2 className="font-semibold text-gray-900 text-[15px] leading-tight">Wandi</h2>
                   <div className="flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-[1px]"></span>
                     <span className="text-[11px] text-gray-500 font-medium">Ready to help you travel</span>
                   </div>
                 </div>
               </div>
            </header>

            {/* Scrollable Messages Area */}
            <div className="flex-1 overflow-y-auto w-full">
              
              {messages.length === 0 ? (
                // Welcome Screen inside chat
                <div className="h-full flex flex-col items-center justify-center p-6 md:p-12 text-center animate-in fade-in duration-500 slide-in-from-bottom-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-3xl shadow-xl shadow-emerald-900/20 mb-6">
                    🌍
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                    Hello! I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Wandi</span>
                  </h2>
                  <p className="text-gray-500 mb-10 max-w-md text-sm md:text-base">
                    Your personal AI Travel Concierge. I can help you plan trips, find restaurants, or discover hidden gems.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-2xl w-full">
                    {welcomeFeatures.map((f, i) => (
                      <button 
                        key={i}
                        onClick={() => sendMessage(f.query)}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 transition-all hover:-translate-y-1 hover:shadow-md"
                      >
                        <span className="text-2xl">{f.icon}</span>
                        <span className="text-sm font-semibold text-gray-700">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // Messages List
                <div className="p-4 md:p-8 flex flex-col gap-6 max-w-4xl mx-auto w-full pb-20">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      {m.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm shrink-0 shadow-sm border border-emerald-50 mt-1 mr-3">
                          🧳
                        </div>
                      )}
                      
                      <div className={`max-w-[85%] md:max-w-[75%] px-5 py-4 rounded-3xl ${
                        m.role === "user" 
                          ? "bg-emerald-600 text-white rounded-tr-sm whitespace-pre-wrap" 
                          : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm prose prose-emerald prose-sm md:prose-base leading-relaxed print:text-black"
                      }`}>
                         {m.role === "user" ? (
                           m.content
                         ) : (
                           // For assistant, render markdown or typing dots
                           m.content === "" && loading && i === messages.length - 1 ? (
                              <div className="flex items-center h-4 gap-1.5 px-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                              </div>
                           ) : (
                             <ReactMarkdown components={{
                               h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2 text-gray-900" {...props} />,
                               h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-4 mb-2 text-gray-900" {...props} />,
                               h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2 text-gray-900" {...props} />,
                               p: ({node, ...props}) => <p className="last:mb-0 mb-3" {...props} />,
                               ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-3 space-y-1" {...props} />,
                               ol: ({node, ...props}) => <ol className="list-decimal ml-5 mb-3 space-y-1" {...props} />,
                               li: ({node, ...props}) => <li className="pl-1" {...props} />,
                               a: ({node, ...props}) => <a className="text-emerald-600 hover:underline font-medium" {...props} />,
                               strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                               table: ({node, ...props}) => <div className="overflow-x-auto w-full"><table className="min-w-full divide-y border mb-4" {...props} /></div>,
                               th: ({node, ...props}) => <th className="px-3 py-2 bg-gray-50 font-semibold" {...props} />,
                               td: ({node, ...props}) => <td className="px-3 py-2 border-t" {...props} />,
                               br: () => <br className="block mb-2" />
                             }}>
                               {m.content}
                             </ReactMarkdown>
                           )
                         )}
                      </div>

                    </div>
                  ))}
                  <div ref={messagesEndRef} className="h-4" />
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-white via-white to-transparent pt-6 pb-4 px-4 md:px-8">
              <div className="max-w-4xl mx-auto w-full">
                <div className="relative flex items-end gap-2 bg-white border-2 border-gray-200 focus-within:border-emerald-500 rounded-2xl shadow-lg shadow-emerald-900/5 transition-colors p-2">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => { setInput(e.target.value); autoResize(); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Ask Wandi about flights, hotels, or trips..."
                    className="flex-1 resize-none bg-transparent py-2.5 pl-3 pr-2 outline-none text-gray-800 text-[15px] placeholder-gray-400 min-h-[44px] max-h-32"
                    rows={1}
                  />
                  <button 
                    onClick={() => sendMessage()}
                    disabled={loading || !input.trim()}
                    className="w-10 h-10 mb-0.5 mr-0.5 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 hover:bg-emerald-700 hover:shadow-md disabled:opacity-50 disabled:hover:shadow-none transition-all disabled:cursor-not-allowed"
                  >
                    <Send size={18} className="translate-x-[1px] translate-y-[1px]" />
                  </button>
                </div>
                <div className="text-center mt-2 pb-1">
                  <p className="text-[11px] text-gray-400 font-medium tracking-wide">
                    Wandi AI can make mistakes. Verify important travel details.
                  </p>
                </div>
              </div>
            </div>

          </section>

        </div>
      </main>
    </div>
  );
}
