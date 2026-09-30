"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play,
  RotateCcw,
  Sparkles,
  Code2,
  Eye,
  FileCode,
  Terminal,
  ExternalLink,
  Laptop
} from "lucide-react";

const TEMPLATES: Record<string, { html: string; css: string; js: string }> = {
  "bems-hero": {
    html: `<div class="card">
  <div class="badge">BEMS FutureSkills 2026</div>
  <h1>Build Web Apps That Employers Pay For</h1>
  <p>Hands-on practical training in Umuahia, Abia State & Live Zoom.</p>
  <button id="cta-btn">Click to Enroll Today</button>
  <div id="output"></div>
</div>`,
    css: `body {
  font-family: system-ui, -apple-system, sans-serif;
  background-color: #FAF8FF;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  margin: 0;
}
.card {
  background: white;
  padding: 2.5rem;
  border-radius: 1.5rem;
  border: 1px solid #E6E1F5;
  box-shadow: 0 10px 25px rgba(24, 20, 61, 0.05);
  max-width: 450px;
  text-align: center;
}
.badge {
  display: inline-block;
  background: #FAF8FF;
  color: #7928CA;
  border: 1px solid #E6E1F5;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  margin-bottom: 1rem;
}
h1 {
  color: #18143D;
  font-size: 1.5rem;
  font-weight: 900;
  margin: 0 0 0.5rem 0;
}
p {
  color: #645F80;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
}
button {
  background: linear-gradient(135deg, #7928CA, #18143D);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}
button:hover {
  transform: translateY(-2px);
}
#output {
  margin-top: 1rem;
  font-size: 0.85rem;
  font-weight: bold;
  color: #25D366;
}`,
    js: `const btn = document.getElementById('cta-btn');
const output = document.getElementById('output');

btn.addEventListener('click', () => {
  output.textContent = '🎉 Awesome! Redirecting to BEMS WhatsApp Community...';
  console.log('Button clicked successfully at ' + new Date().toLocaleTimeString());
});`
  },
  "flexbox-grid": {
    html: `<div class="grid-container">
  <div class="box">AI & Automation</div>
  <div class="box">Web Development</div>
  <div class="box">Product Design</div>
  <div class="box">Cybersecurity</div>
</div>`,
    css: `.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  padding: 2rem;
  background: #18143D;
  min-height: 80vh;
}
.box {
  background: #7928CA;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  font-weight: bold;
  font-size: 0.9rem;
  text-align: center;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}
.box:hover {
  transform: scale(1.05);
  background: #8B5CF6;
}`,
    js: `console.log("CSS Grid layout initialized with 4 BEMS tracks.");`
  }
};

export default function CodingSandboxPage() {
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");
  const [htmlCode, setHtmlCode] = useState(TEMPLATES["bems-hero"].html);
  const [cssCode, setCssCode] = useState(TEMPLATES["bems-hero"].css);
  const [jsCode, setJsCode] = useState(TEMPLATES["bems-hero"].js);
  const [srcDoc, setSrcDoc] = useState("");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  const runCode = () => {
    setConsoleLogs([]);
    const combined = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
          <script>
            // Capture console.log
            const originalLog = console.log;
            console.log = function(...args) {
              window.parent.postMessage({ type: 'CONSOLE_LOG', log: args.join(' ') }, '*');
              originalLog.apply(console, args);
            };
            try {
              ${jsCode}
            } catch (err) {
              console.log('Error: ' + err.message);
            }
          <\/script>
        </body>
      </html>
    `;
    setSrcDoc(combined);
  };

  useEffect(() => {
    runCode();

    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "CONSOLE_LOG") {
        setConsoleLogs((prev) => [...prev, e.data.log]);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const loadTemplate = (key: string) => {
    if (TEMPLATES[key]) {
      setHtmlCode(TEMPLATES[key].html);
      setCssCode(TEMPLATES[key].css);
      setJsCode(TEMPLATES[key].js);
      setTimeout(runCode, 50);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      {/* Sandbox Header Bar */}
      <div className="bg-[#18143D] text-white py-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="purple">PHASE 5 BROWSER IDE</Badge>
              <Badge variant="gold">INTERACTIVE LAB SANDBOX</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              BEMS In-Browser Code Playground
            </h1>
            <p className="text-xs text-[#A5A0C8]">
              Write and preview HTML5, CSS3, and JavaScript in real-time right in your browser without local setup.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              onChange={(e) => loadTemplate(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-hidden"
            >
              <option value="bems-hero" className="text-[#18143D]">Template: BEMS Hero Card</option>
              <option value="flexbox-grid" className="text-[#18143D]">Template: Responsive CSS Grid</option>
            </select>

            <Button
              onClick={runCode}
              variant="purple"
              size="sm"
              className="shadow-md text-xs font-bold"
            >
              <Play className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Run Code
            </Button>

            <Link href="/ai?tab=tutor" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-white/20 text-white hover:bg-white/10 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-300" /> Review with AI Tutor
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* IDE Split Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[720px]">
          {/* Left Column: Code Editors */}
          <div className="bg-[#18143D] rounded-3xl border border-white/10 shadow-xl flex flex-col overflow-hidden">
            {/* Editor Tabs */}
            <div className="flex items-center justify-between p-2 px-4 border-b border-white/10 bg-black/30">
              <div className="flex items-center gap-1">
                {[
                  { id: "html", label: "index.html", color: "text-amber-400" },
                  { id: "css", label: "styles.css", color: "text-blue-400" },
                  { id: "js", label: "app.js", color: "text-yellow-400" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === t.id
                        ? "bg-white/15 text-white shadow-xs"
                        : "text-[#A5A0C8] hover:text-white"
                    }`}
                  >
                    <FileCode className={`w-3.5 h-3.5 ${t.color}`} />
                    {t.label}
                  </button>
                ))}
              </div>

              <span className="text-[10px] text-[#A5A0C8] font-mono">
                UTF-8 &middot; Live Sync
              </span>
            </div>

            {/* Code Input Area */}
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto">
              {activeTab === "html" && (
                <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  className="w-full h-full bg-transparent text-[#FAF8FF] font-mono text-xs focus:outline-hidden resize-none leading-relaxed"
                  spellCheck={false}
                />
              )}
              {activeTab === "css" && (
                <textarea
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  className="w-full h-full bg-transparent text-[#FAF8FF] font-mono text-xs focus:outline-hidden resize-none leading-relaxed"
                  spellCheck={false}
                />
              )}
              {activeTab === "js" && (
                <textarea
                  value={jsCode}
                  onChange={(e) => setJsCode(e.target.value)}
                  className="w-full h-full bg-transparent text-[#FAF8FF] font-mono text-xs focus:outline-hidden resize-none leading-relaxed"
                  spellCheck={false}
                />
              )}
            </div>

            {/* Editor Footer Status */}
            <div className="p-2.5 px-4 bg-black/40 border-t border-white/10 flex items-center justify-between text-[11px] text-[#A5A0C8]">
              <span>Press <strong>Run Code</strong> to re-render preview</span>
              <button
                onClick={() => loadTemplate("bems-hero")}
                className="hover:text-white text-xs underline cursor-pointer"
              >
                Reset Defaults
              </button>
            </div>
          </div>

          {/* Right Column: Live Output & Console */}
          <div className="flex flex-col gap-4">
            {/* Live Preview Iframe */}
            <div className="flex-1 bg-white rounded-3xl border border-[#E6E1F5] shadow-xs flex flex-col overflow-hidden">
              <div className="p-3 px-5 border-b border-[#F0EDF9] bg-[#FAF8FF] flex items-center justify-between text-xs font-bold text-[#18143D]">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#7928CA]" />
                  <span>Real-Time Output Preview</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#8580A3]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Sandboxed Iframe</span>
                </div>
              </div>

              <iframe
                title="Sandbox Preview"
                srcDoc={srcDoc}
                sandbox="allow-scripts allow-modals"
                className="w-full flex-1 border-none bg-white"
              />
            </div>

            {/* Console Output Drawer */}
            <div className="h-40 bg-[#18143D] rounded-2xl border border-white/10 shadow-xs flex flex-col overflow-hidden text-xs">
              <div className="p-2.5 px-4 bg-black/40 border-b border-white/10 flex items-center justify-between text-[#A5A0C8]">
                <div className="flex items-center gap-2 font-mono font-bold">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Browser Console Output</span>
                </div>
                <button
                  onClick={() => setConsoleLogs([])}
                  className="text-[10px] hover:text-white cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>

              <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] text-[#C4BDE7] space-y-1">
                {consoleLogs.length === 0 ? (
                  <span className="text-[#8580A3]">No logs yet. Trigger events to see output.</span>
                ) : (
                  consoleLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

