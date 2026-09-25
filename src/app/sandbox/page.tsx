"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Code2,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  Monitor,
  CheckCircle2,
  FileCode,
  Copy
} from "lucide-react";
import Button from "@/components/ui/button";

const DEFAULT_HTML = `<div class="card">
  <div class="badge">BEMS FutureSkills 2026</div>
  <h1>Interactive Sandbox</h1>
  <p>Edit HTML, CSS, and JS in real-time to test frontend components before deploying to Vercel.</p>
  <button id="cta-btn" onclick="handleClick()">Click Me</button>
  <div id="output"></div>
</div>`;

const DEFAULT_CSS = `body {
  font-family: system-ui, -apple-system, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  background: #FAF8FF;
}

.card {
  background: white;
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(24, 20, 61, 0.08);
  max-width: 400px;
  text-align: center;
  border: 1px solid rgba(121, 40, 202, 0.15);
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  background: #7928CA;
  color: white;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 12px;
}

h1 {
  color: #18143D;
  font-size: 24px;
  margin: 0 0 8px;
}

p {
  color: #666;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 20px;
}

button {
  background: #18143D;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover {
  background: #7928CA;
  transform: translateY(-2px);
}

#output {
  margin-top: 16px;
  font-size: 12px;
  color: #16a34a;
  font-weight: 600;
}`;

const DEFAULT_JS = `let count = 0;

function handleClick() {
  count++;
  console.log("Button clicked! Current count: " + count);
  const out = document.getElementById("output");
  if (out) {
    out.innerText = "⚡ Click registered " + count + " time(s)!";
  }
}`;

export default function SandboxPage() {
  const [htmlCode, setHtmlCode] = useState(DEFAULT_HTML);
  const [cssCode, setCssCode] = useState(DEFAULT_CSS);
  const [jsCode, setJsCode] = useState(DEFAULT_JS);
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");
  const [srcDoc, setSrcDoc] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Compile runner
  const runCode = () => {
    setLogs([]);
    const compiled = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
          <script>
            (function() {
              const oldLog = console.log;
              console.log = function(...args) {
                window.parent.postMessage({ type: 'CONSOLE_LOG', message: args.join(' ') }, '*');
                oldLog.apply(console, args);
              };
            })();
            try {
              ${jsCode}
            } catch(e) {
              console.log("Error: " + e.message);
            }
          </script>
        </body>
      </html>
    `;
    setSrcDoc(compiled);
  };

  useEffect(() => {
    runCode();
  }, []);

  // Listen to iframe console messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "CONSOLE_LOG") {
        setLogs((prev) => [...prev, event.data.message]);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleReset = () => {
    setHtmlCode(DEFAULT_HTML);
    setCssCode(DEFAULT_CSS);
    setJsCode(DEFAULT_JS);
    runCode();
  };

  const handleCopyCode = () => {
    const currentCode =
      activeTab === "html" ? htmlCode : activeTab === "css" ? cssCode : jsCode;
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-brand-light/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-navy via-brand-dark to-purple-900 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-purple/30 border border-brand-purple/40 text-purple-200 text-xs font-semibold uppercase">
              <Code2 className="w-3.5 h-3.5" />
              <span>BEMS Browser IDE • Instant Sandbox</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black">Interactive Code Playground</h1>
            <p className="text-xs md:text-sm text-purple-100/80">
              Prototype HTML5, CSS Grid, and JavaScript components with real-time DOM rendering and console output.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Button variant="purple" onClick={runCode} className="px-5">
              <Play className="w-4 h-4 mr-2" />
              <span>Run Code</span>
            </Button>
            <Button variant="outline" onClick={handleReset} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Link href="/ai?tab=tutor">
              <Button variant="secondary" className="text-xs">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-purple" />
                <span>Ask AI Co-Pilot</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Workspace Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[700px]">
          {/* Editor Left Column */}
          <div className="bg-brand-navy rounded-2xl border border-gray-800 shadow-xl flex flex-col overflow-hidden">
            {/* Editor Tabs */}
            <div className="px-4 py-3 bg-brand-dark/90 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab("html")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === "html" ? "bg-orange-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  HTML5
                </button>
                <button
                  onClick={() => setActiveTab("css")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === "css" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  CSS3
                </button>
                <button
                  onClick={() => setActiveTab("js")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === "js" ? "bg-amber-500 text-brand-dark" : "text-gray-400 hover:text-white"
                  }`}
                >
                  JavaScript
                </button>
              </div>

              <button
                onClick={handleCopyCode}
                className="text-xs text-gray-400 hover:text-purple-300 flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>

            {/* Code Textarea */}
            <div className="flex-1 p-4 bg-brand-navy font-mono text-xs">
              {activeTab === "html" && (
                <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  className="w-full h-full bg-transparent text-emerald-300 resize-none focus:outline-none leading-relaxed"
                  spellCheck={false}
                />
              )}
              {activeTab === "css" && (
                <textarea
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  className="w-full h-full bg-transparent text-sky-300 resize-none focus:outline-none leading-relaxed"
                  spellCheck={false}
                />
              )}
              {activeTab === "js" && (
                <textarea
                  value={jsCode}
                  onChange={(e) => setJsCode(e.target.value)}
                  className="w-full h-full bg-transparent text-amber-200 resize-none focus:outline-none leading-relaxed"
                  spellCheck={false}
                />
              )}
            </div>

            {/* Editor Footer Status */}
            <div className="px-4 py-2 bg-brand-dark border-t border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
              <span>BEMS FutureSkills IDE • V8 Virtualized Runner</span>
              <span className="text-emerald-400 font-semibold">● Ready</span>
            </div>
          </div>

          {/* Preview & Console Right Column */}
          <div className="flex flex-col gap-4 h-full">
            {/* Live Render Frame */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-200/80 shadow-md flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center space-x-2 font-semibold">
                  <Monitor className="w-3.5 h-3.5 text-brand-purple" />
                  <span>Live Browser DOM Preview</span>
                </div>
                <span className="text-[10px] text-gray-400">Sandboxed Iframe</span>
              </div>
              <iframe
                title="sandbox-preview"
                srcDoc={srcDoc}
                className="w-full flex-1 border-none bg-white"
                sandbox="allow-scripts allow-modals"
              />
            </div>

            {/* Terminal Console Log */}
            <div className="h-44 bg-brand-dark rounded-2xl border border-gray-800 p-3 shadow-md flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-800 pb-1.5 mb-2 text-xs text-gray-400">
                <div className="flex items-center space-x-1.5 font-bold">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Console Output</span>
                </div>
                <button
                  onClick={() => setLogs([])}
                  className="text-[10px] text-gray-500 hover:text-gray-300"
                >
                  Clear Console
                </button>
              </div>

              <div className="flex-1 overflow-y-auto font-mono text-xs text-emerald-300 space-y-1">
                {logs.length === 0 ? (
                  <span className="text-gray-600 italic">No console logs yet. Call console.log() in JavaScript to view outputs.</span>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <span className="text-gray-500">{">"}</span>
                      <span>{log}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
