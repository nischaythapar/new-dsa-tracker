// "use client";
//
// import { useState } from "react";
//
// export default function Page() {
//   const [input, setInput] = useState("");
//   const [result, setResult] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [source, setSource] = useState("");
//
//   async function explain() {
//     if (!input.trim()) {
//       setError("Please enter a problem name or link.");
//       return;
//     }
//
//     setLoading(true);
//     setError("");
//     setSource("");
//
//     try {
//       const res = await fetch("/api/explain", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userInput: input }),
//       });
//
//       const data = await res.json();
//
//       if (!res.ok) {
//         throw new Error(data.error || "Request failed");
//       }
//
//       setResult(data.result);
//       setSource(data.source || "");
//     } catch (err: any) {
//       setError(err.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   }
//
//   return (
//     <main style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
//       <h1>DSA Mentor</h1>
//       <p style={{ color: "#666" }}>
//         Enter a DSA problem name (e.g. <b>Two Sum</b>) or a LeetCode link.
//       </p>
//
//       <textarea
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//         rows={4}
//         placeholder="Two Sum"
//         style={{
//           width: "100%",
//           padding: 10,
//           fontSize: 14,
//           marginBottom: 10,
//         }}
//       />
//
//       <button
//         onClick={explain}
//         disabled={loading}
//         style={{
//           padding: "8px 16px",
//           cursor: loading ? "not-allowed" : "pointer",
//         }}
//       >
//         {loading ? "Explaining..." : "Explain"}
//       </button>
//
//       {error && (
//         <p style={{ color: "red", marginTop: 12 }}>
//           {error}
//         </p>
//       )}
//
//   {result && (
//     <>
//       <div style={{ marginTop: 12 }}>
//         <AIBadge source={source} />
//       </div>
//
//       <pre
//         style={{
//           marginTop: 10,
//           padding: 16,
//           background: "#f7f7f7",
//           whiteSpace: "pre-wrap",
//           borderRadius: 6,
//         }}
//       >
//         {result}
//       </pre>
//     </>
//   )}
//     </main>
//   );
//
//
//
//   function AIBadge({ source }: { source: string }) {
//     if (!source) return null;
//
//     let label = "";
//     let bg = "";
//
//     switch (source) {
//       case "gemini":
//         label = "🟢 AI Online";
//         bg = "#e6f4ea";
//         break;
//       case "cache":
//         label = "🟡 AI Cached";
//         bg = "#fff7e6";
//         break;
//       case "mock":
//         label = "🔴 AI Offline";
//         bg = "#fdecea";
//         break;
//       default:
//         return null;
//     }
//
//     return (
//       <span
//         style={{
//           display: "inline-block",
//           padding: "4px 10px",
//           borderRadius: 12,
//           fontSize: 12,
//           background: bg,
//           marginBottom: 8,
//         }}
//       >
//         {label}
//       </span>
//     );
//   }
// }
"use client";

    import { useState } from "react";
    import ReactMarkdown from "react-markdown";

    export default function Page() {
      const [input, setInput] = useState("");
      const [response, setResponse] = useState("");

      const handleExplain = async () => {
        const res = await fetch("/api/explain", {
          method: "POST",
          body: JSON.stringify({ userInput: input }),
        });

        const data = await res.json();
        setResponse(data.result);
      };

      return (
        <main className="min-h-screen bg-zinc-950 text-white px-6 py-12">
          <div className="max-w-4xl mx-auto">

            {/* Heading */}
            <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              DSA Mentor
            </h1>

            <p className="text-zinc-400 mb-8">
              Enter a DSA problem name or LeetCode link.
            </p>

            {/* Input Card */}
            <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. Two Sum"
                className="w-full h-32 bg-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={handleExplain}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition"
              >
                Explain
              </button>
            </div>

            {/* Response Card */}
            {response && (
              <div className="mt-10 bg-zinc-900 p-8 rounded-2xl shadow-lg border border-zinc-800 prose prose-invert max-w-none">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            )}
          </div>
        </main>
      );
    }
