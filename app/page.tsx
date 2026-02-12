"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

// --- Types ---
type HistoryItem = {
  id: string;
  title: string;
  query: string;
  response: string;
  timestamp: number;
};

export default function Page() {
  // --- Auth State ---
  const [user, setUser] = useState<{ name: string } | null>(null);

  // --- App State ---
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- Effects ---
  useEffect(() => {
    const savedUser = localStorage.getItem("dsa-user");
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedHistory = localStorage.getItem("dsa-history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("History parse error", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dsa-history", JSON.stringify(history));
  }, [history]);

  // --- Handlers ---
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    if (name) {
      const newUser = { name };
      setUser(newUser);
      localStorage.setItem("dsa-user", JSON.stringify(newUser));
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("dsa-user");
    setResponse("");
    setInput("");
  };

  const handleExplain = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        body: JSON.stringify({ userInput: input }),
      });

      const data = await res.json();

      let textResult = data.result;

      // Convert legacy object response to string if needed
      if (typeof textResult === 'object') {
         textResult = `**${textResult.summary}**\n\n${textResult.insight}\n\n${textResult.approach}`;
      }

      setResponse(textResult);

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        title: input.length > 20 ? input.substring(0, 20) + "..." : input,
        query: input,
        response: textResult,
        timestamp: Date.now(),
      };

      setHistory((prev) => {
        const filtered = prev.filter((item) => item.query.toLowerCase() !== input.toLowerCase());
        return [newItem, ...filtered];
      });

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setInput(item.query);

    if (typeof item.response === 'object') {
        const legacy = item.response as any;
        setResponse(`## ${legacy.summary}\n\n${legacy.approach}`);
    } else {
        setResponse(item.response);
    }

    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // --- Login Screen ---
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900 p-8 rounded-2xl shadow-2xl border border-zinc-800 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Welcome to DSA Mentor by Nischay Thapar
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">What should we call you?</label>
              <input
                name="name"
                type="text"
                required
                placeholder="Enter your name"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors">
              Start Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Main App ---
  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className={`flex-shrink-0 bg-zinc-900 border-r border-zinc-800 transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-72" : "w-0"} flex flex-col`}>
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <div>
              <h2 className="font-semibold text-zinc-200">History</h2>
              <p className="text-xs text-zinc-500">Session: {user.name}</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-zinc-500 hover:text-white"><ArrowLeftIcon /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {history.map((item) => (
            <div key={item.id} onClick={() => loadHistoryItem(item)} className="group flex justify-between p-3 rounded-lg hover:bg-zinc-800 cursor-pointer">
              <span className="truncate text-sm text-zinc-300">{item.title}</span>
              <button onClick={(e) => deleteHistoryItem(e, item.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:bg-zinc-700 p-1 rounded"><TrashIcon /></button>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-zinc-800">
            <button onClick={handleLogout} className="w-full text-sm text-zinc-400 hover:text-white flex items-center justify-center gap-2">Log Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="p-4 flex items-center">
          {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-zinc-800 rounded-md text-zinc-300"><MenuIcon /></button>}
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">DSA Mentor</h1>
            <p className="text-zinc-400 mb-8">Hello, {user.name}. What are we solving today?</p>

            <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. Two Sum"
                className="w-full h-32 bg-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="mt-4 flex justify-end">
                <button onClick={handleExplain} disabled={loading || !input.trim()} className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 rounded-xl font-semibold text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                   {loading ? "Thinking..." : "Explain"}
                </button>
              </div>
            </div>

            {response && (
              <div className="mt-10 bg-zinc-900 p-8 rounded-2xl shadow-lg border border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* FIXED: Wrapped ReactMarkdown in a div to handle styling */}
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{response}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Icons ---
function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}