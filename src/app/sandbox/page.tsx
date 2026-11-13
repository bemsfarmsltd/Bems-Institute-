"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play,
  Sparkles,
  Code2,
  Eye,
  FileCode,
  Terminal,
  Download,
  Copy,
  Check,
  Smartphone,
  Tablet,
  Monitor,
  Loader2,
  X
} from "lucide-react";

const TEMPLATE_META: Record<string, { label: string; icon: string; description: string }> = {
  "bems-hero":       { label: "BEMS Hero Card",        icon: "🃏", description: "Interactive enrollment card with button events" },
  "flexbox-grid":    { label: "Responsive CSS Grid",   icon: "📐", description: "4-column auto-fit grid with hover effects" },
  "counter":         { label: "State Counter",         icon: "🔢", description: "DOM state with dynamic colours & limits" },
  "dark-mode":       { label: "Dark / Light Toggle",   icon: "🌓", description: "CSS variables + JS theme switcher" },
  "task-tracker":    { label: "Task Tracker",          icon: "📝", description: "Add, complete, and delete tasks dynamically" },
  "form-validator":  { label: "Form Validator",        icon: "🛡️", description: "Real-time regex email & name validation" },
};

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
  border: 1px solid #F1E2F5;
  box-shadow: 0 10px 25px rgba(24, 20, 61, 0.05);
  max-width: 450px;
  text-align: center;
}
.badge {
  display: inline-block;
  background: #FAF8FF;
  color: #AE54C6;
  border: 1px solid #F1E2F5;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  margin-bottom: 1rem;
}
h1 {
  color: #303654;
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
  background: linear-gradient(135deg, #AE54C6, #303654);
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
  background: #303654;
  min-height: 80vh;
}
.box {
  background: #AE54C6;
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
  background: #C591E9;
}`,
    js: `console.log("CSS Grid layout initialized with 4 BEMS tracks.");`
  },
  "counter": {
    html: `<div class="card">
  <div class="badge">DOM State Lab</div>
  <h1>Interactive Counter</h1>
  <div id="display">0</div>
  <div class="controls">
    <button id="dec">− Decrease</button>
    <button id="reset">↺ Reset</button>
    <button id="inc">+ Increase</button>
  </div>
  <p id="msg"></p>
</div>`,
    css: `body{font-family:system-ui,sans-serif;background:#FAF8FF;display:flex;justify-content:center;align-items:center;min-height:90vh;margin:0;}
.card{background:#fff;padding:2.5rem;border-radius:1.5rem;border:1px solid #F1E2F5;box-shadow:0 10px 25px rgba(24,20,61,.05);max-width:400px;text-align:center;}
.badge{display:inline-block;background:#FAF8FF;color:#AE54C6;border:1px solid #F1E2F5;font-size:.75rem;font-weight:800;padding:.25rem .75rem;border-radius:9999px;margin-bottom:1rem;}
h1{color:#303654;font-size:1.4rem;font-weight:900;margin:0 0 1rem;}
#display{font-size:5rem;font-weight:900;color:#303654;line-height:1;margin-bottom:1.5rem;transition:color .3s;}
.controls{display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;}
button{padding:.6rem 1.2rem;border:none;border-radius:.75rem;font-weight:700;font-size:.85rem;cursor:pointer;transition:transform .2s;}
#inc{background:#AE54C6;color:#fff;} #dec{background:#303654;color:#fff;} #reset{background:#F1E2F5;color:#303654;}
button:hover{transform:translateY(-2px);}
#msg{margin-top:1rem;font-size:.85rem;font-weight:700;min-height:1.2em;}`,
    js: `const display=document.getElementById('display');
const msg=document.getElementById('msg');
let count=0;
const MAX=10, MIN=-10;
function update(){
  display.textContent=count;
  display.style.color=count>0?'#AE54C6':count<0?'#EF4444':'#303654';
  msg.textContent=count===MAX?'🎉 Maximum reached!':count===MIN?'⚠️ Minimum reached!':'';
  msg.style.color=count===MAX?'#AE54C6':'#EF4444';
  console.log('Counter updated to: '+count);
}
document.getElementById('inc').addEventListener('click',()=>{if(count<MAX){count++;update();}});
document.getElementById('dec').addEventListener('click',()=>{if(count>MIN){count--;update();}});
document.getElementById('reset').addEventListener('click',()=>{count=0;update();console.log('Counter reset.');});`
  },
  "dark-mode": {
    html: `<div class="page">
  <div class="card">
    <div class="badge">CSS Variables Lab</div>
    <h1>Dark / Light Mode</h1>
    <p>Toggle the button to switch themes. CSS custom properties make this instant.</p>
    <button id="toggle">🌙 Switch to Dark Mode</button>
    <div class="swatch-row">
      <div class="swatch" id="s1"></div>
      <div class="swatch" id="s2"></div>
      <div class="swatch" id="s3"></div>
    </div>
  </div>
</div>`,
    css: `:root{--bg:#FAF8FF;--card:#fff;--text:#303654;--sub:#645F80;--accent:#AE54C6;--border:#F1E2F5;}
.dark{--bg:#1A1A2E;--card:#22223B;--text:#E9E6F0;--sub:#A09BC0;--accent:#C591E9;--border:#3A3A5C;}
body{margin:0;transition:background .4s;}
.page{background:var(--bg);min-height:90vh;display:flex;justify-content:center;align-items:center;transition:background .4s;}
.card{background:var(--card);padding:2.5rem;border-radius:1.5rem;border:1px solid var(--border);box-shadow:0 10px 25px rgba(0,0,0,.08);max-width:420px;text-align:center;transition:background .4s,border .4s;}
.badge{display:inline-block;background:var(--bg);color:var(--accent);border:1px solid var(--border);font-size:.75rem;font-weight:800;padding:.25rem .75rem;border-radius:9999px;margin-bottom:1rem;}
h1{color:var(--text);font-size:1.5rem;font-weight:900;margin:0 0 .5rem;}
p{color:var(--sub);font-size:.875rem;line-height:1.6;margin:0 0 1.5rem;}
button{background:linear-gradient(135deg,var(--accent),#303654);color:#fff;border:none;padding:.75rem 1.5rem;font-weight:700;border-radius:.75rem;cursor:pointer;transition:transform .2s;}
button:hover{transform:translateY(-2px);}
.swatch-row{display:flex;gap:.75rem;justify-content:center;margin-top:1.5rem;}
.swatch{width:48px;height:48px;border-radius:.75rem;border:2px solid var(--border);}
#s1{background:var(--bg);}#s2{background:var(--accent);}#s3{background:var(--card);}`,
    js: `const btn=document.getElementById('toggle');
const page=document.querySelector('.page');
let dark=false;
btn.addEventListener('click',()=>{
  dark=!dark;
  document.documentElement.classList.toggle('dark',dark);
  page.classList.toggle('dark',dark);
  document.querySelectorAll('.card,.badge,.swatch').forEach(el=>el.classList.toggle('dark',dark));
  btn.textContent=dark?'☀️ Switch to Light Mode':'🌙 Switch to Dark Mode';
  console.log('Theme switched to: '+(dark?'Dark':'Light'));
});`
  },
  "task-tracker": {
    html: `<div class="app">
  <div class="card">
    <div class="badge">DOM Manipulation Lab</div>
    <h1>📝 Task Tracker</h1>
    <div class="input-row">
      <input id="task-input" type="text" placeholder="Add a new task..." maxlength="60"/>
      <button id="add-btn">Add</button>
    </div>
    <ul id="task-list"></ul>
    <p id="summary"></p>
  </div>
</div>`,
    css: `body{font-family:system-ui,sans-serif;background:#FAF8FF;display:flex;justify-content:center;align-items:center;min-height:90vh;margin:0;}
.card{background:#fff;padding:2rem;border-radius:1.5rem;border:1px solid #F1E2F5;box-shadow:0 10px 25px rgba(24,20,61,.05);width:100%;max-width:420px;}
.badge{display:inline-block;background:#FAF8FF;color:#AE54C6;border:1px solid #F1E2F5;font-size:.75rem;font-weight:800;padding:.2rem .7rem;border-radius:9999px;margin-bottom:.75rem;}
h1{color:#303654;font-size:1.3rem;font-weight:900;margin:0 0 1.25rem;}
.input-row{display:flex;gap:.5rem;margin-bottom:1rem;}
input{flex:1;padding:.6rem .9rem;border:1px solid #E5C8ED;border-radius:.75rem;font-size:.875rem;outline:none;color:#303654;}
input:focus{border-color:#AE54C6;}
button{background:#AE54C6;color:#fff;border:none;padding:.6rem 1rem;border-radius:.75rem;font-weight:700;cursor:pointer;}
ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.5rem;}
li{display:flex;align-items:center;gap:.75rem;padding:.6rem .9rem;background:#FAF8FF;border-radius:.75rem;border:1px solid #F1E2F5;font-size:.875rem;color:#303654;}
li.done{opacity:.5;text-decoration:line-through;}
li .check{cursor:pointer;font-size:1rem;}
li .del{margin-left:auto;cursor:pointer;color:#EF4444;font-size:.8rem;font-weight:700;}
#summary{margin-top:.75rem;font-size:.8rem;color:#8580A3;text-align:center;}`,
    js: `const input=document.getElementById('task-input');
const addBtn=document.getElementById('add-btn');
const list=document.getElementById('task-list');
const summary=document.getElementById('summary');
let tasks=[];
function render(){
  list.innerHTML='';
  tasks.forEach((t,i)=>{
    const li=document.createElement('li');
    if(t.done)li.classList.add('done');
    li.innerHTML='<span class="check">'+(t.done?'✅':'⬜')+'</span><span>'+t.text+'</span><span class="del">✕</span>';
    li.querySelector('.check').onclick=()=>{tasks[i].done=!tasks[i].done;render();console.log((tasks[i].done?'Completed':'Uncompleted')+': '+tasks[i].text);};
    li.querySelector('.del').onclick=()=>{console.log('Deleted: '+tasks[i].text);tasks.splice(i,1);render();};
    list.appendChild(li);
  });
  const done=tasks.filter(t=>t.done).length;
  summary.textContent=tasks.length?done+' of '+tasks.length+' tasks completed':'No tasks yet. Add one above!';
}
function addTask(){
  const val=input.value.trim();
  if(!val)return;
  tasks.push({text:val,done:false});
  input.value='';
  render();
  console.log('Task added: '+val);
}
addBtn.addEventListener('click',addTask);
input.addEventListener('keydown',e=>{if(e.key==='Enter')addTask();});
render();`
  },
  "form-validator": {
    html: `<div class="page">
  <form class="card" id="form" novalidate>
    <div class="badge">Form Validation Lab</div>
    <h1>🛡️ Sign Up Form</h1>
    <div class="field">
      <label>Full Name</label>
      <input id="name" type="text" placeholder="e.g. Chukwuemeka Obi"/>
      <span class="err" id="name-err"></span>
    </div>
    <div class="field">
      <label>Email Address</label>
      <input id="email" type="email" placeholder="e.g. chukwu@bems.ng"/>
      <span class="err" id="email-err"></span>
    </div>
    <button type="submit">Create Account</button>
    <p id="success"></p>
  </form>
</div>`,
    css: `body{font-family:system-ui,sans-serif;background:#FAF8FF;display:flex;justify-content:center;align-items:center;min-height:90vh;margin:0;}
.card{background:#fff;padding:2rem;border-radius:1.5rem;border:1px solid #F1E2F5;box-shadow:0 10px 25px rgba(24,20,61,.05);max-width:420px;width:100%;}
.badge{display:inline-block;background:#FAF8FF;color:#AE54C6;border:1px solid #F1E2F5;font-size:.75rem;font-weight:800;padding:.2rem .7rem;border-radius:9999px;margin-bottom:.75rem;}
h1{color:#303654;font-size:1.3rem;font-weight:900;margin:0 0 1.5rem;}
.field{margin-bottom:1rem;display:flex;flex-direction:column;gap:.35rem;}
label{font-size:.8rem;font-weight:700;color:#303654;}
input{padding:.65rem .9rem;border:1.5px solid #E5C8ED;border-radius:.75rem;font-size:.875rem;color:#303654;outline:none;transition:border .2s;}
input:focus{border-color:#AE54C6;}
input.valid{border-color:#25D366;}
input.invalid{border-color:#EF4444;}
.err{font-size:.75rem;color:#EF4444;min-height:1em;font-weight:600;}
button{width:100%;padding:.8rem;background:linear-gradient(135deg,#AE54C6,#303654);color:#fff;border:none;border-radius:.75rem;font-weight:700;cursor:pointer;margin-top:.5rem;transition:opacity .2s;}
button:hover{opacity:.9;}
#success{text-align:center;font-weight:700;color:#25D366;margin-top:.75rem;font-size:.875rem;min-height:1.2em;}`,
    js: `const nameIn=document.getElementById('name');
const emailIn=document.getElementById('email');
const nameErr=document.getElementById('name-err');
const emailErr=document.getElementById('email-err');
const success=document.getElementById('success');
const nameRe=/^[A-Za-z\\s]{3,50}$/;
const emailRe=/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
function validate(input,re,err,msg){
  const ok=re.test(input.value.trim());
  input.className=input.value?ok?'valid':'invalid':'';
  err.textContent=input.value&&!ok?msg:'';
  return ok;
}
nameIn.addEventListener('input',()=>validate(nameIn,nameRe,nameErr,'Min 3 letters, no special chars.'));
emailIn.addEventListener('input',()=>validate(emailIn,emailRe,emailErr,'Enter a valid email address.'));
document.getElementById('form').addEventListener('submit',e=>{
  e.preventDefault();
  const nOk=validate(nameIn,nameRe,nameErr,'Min 3 letters, no special chars.');
  const eOk=validate(emailIn,emailRe,emailErr,'Enter a valid email address.');
  if(nOk&&eOk){
    success.textContent='🎉 Account created! Welcome to BEMS FutureSkills.';
    console.log('Form submitted — Name: '+nameIn.value.trim()+', Email: '+emailIn.value.trim());
  } else {
    console.log('Validation failed. Fix errors and retry.');
  }
});`
  }
};

export default function CodingSandboxPage() {
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [htmlCode, setHtmlCode] = useState(TEMPLATES["bems-hero"].html);
  const [cssCode, setCssCode] = useState(TEMPLATES["bems-hero"].css);
  const [jsCode, setJsCode] = useState(TEMPLATES["bems-hero"].js);
  const [activeTemplate, setActiveTemplate] = useState("bems-hero");
  const [srcDoc, setSrcDoc] = useState("");
  const [consoleLogs, setConsoleLogs] = useState<{ text: string; level: string; time: string }[]>([]);
  const [autoRun, setAutoRun] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReview, setAiReview] = useState("");
  const autoRunTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildSrcDoc = useCallback((html: string, css: string, js: string) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>${css}</style>
  </head>
  <body>
    ${html}
    <script>
      const _log = console.log, _warn = console.warn, _error = console.error;
      function _send(level, args) {
        window.parent.postMessage({ type: 'CONSOLE_LOG', log: args.join(' '), level }, '*');
      }
      console.log   = (...a) => { _send('log',   a); _log.apply(console, a); };
      console.warn  = (...a) => { _send('warn',  a); _warn.apply(console, a); };
      console.error = (...a) => { _send('error', a); _error.apply(console, a); };
      window.onerror = (msg, src, line) => {
        window.parent.postMessage({ type: 'CONSOLE_LOG', log: 'Error (line '+line+'): '+msg, level: 'error' }, '*');
      };
      try { ${js} } catch(err) { console.error(err.message); }
    <\/script>
  </body>
</html>`, []);

  const runCode = useCallback(() => {
    setConsoleLogs([]);
    setSrcDoc(buildSrcDoc(htmlCode, cssCode, jsCode));
  }, [htmlCode, cssCode, jsCode, buildSrcDoc]);

  useEffect(() => { runCode(); }, []);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "CONSOLE_LOG") {
        const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setConsoleLogs(prev => [...prev, { text: e.data.log, level: e.data.level || "log", time: now }]);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    if (!autoRun) return;
    if (autoRunTimer.current) clearTimeout(autoRunTimer.current);
    autoRunTimer.current = setTimeout(() => setSrcDoc(buildSrcDoc(htmlCode, cssCode, jsCode)), 800);
    return () => { if (autoRunTimer.current) clearTimeout(autoRunTimer.current); };
  }, [htmlCode, cssCode, jsCode, autoRun, buildSrcDoc]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); runCode(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [runCode]);

  const loadTemplate = (key: string) => {
    if (!TEMPLATES[key]) return;
    setHtmlCode(TEMPLATES[key].html);
    setCssCode(TEMPLATES[key].css);
    setJsCode(TEMPLATES[key].js);
    setActiveTemplate(key);
    setConsoleLogs([]);
    setTimeout(() => setSrcDoc(buildSrcDoc(TEMPLATES[key].html, TEMPLATES[key].css, TEMPLATES[key].js)), 50);
  };

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const val = ta.value;
      const newVal = val.substring(0, start) + "  " + val.substring(end);
      const setter = activeTab === "html" ? setHtmlCode : activeTab === "css" ? setCssCode : setJsCode;
      setter(newVal);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
    }
  };

  const copyCode = () => {
    const code = activeTab === "html" ? htmlCode : activeTab === "css" ? cssCode : jsCode;
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  };

  const downloadHtml = () => {
    const blob = new Blob([buildSrcDoc(htmlCode, cssCode, jsCode)], { type: "text/html" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "bems-sandbox.html"; a.click(); URL.revokeObjectURL(a.href);
  };

  const reviewWithAI = async () => {
    setAiOpen(true); setAiLoading(true); setAiReview("");
    try {
      const { apiFetch } = await import("@/lib/api-client");
      const res = await apiFetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "tutor",
          prompt: `Review this student's sandbox code and give concise feedback covering: correctness, best practices, and 2-3 specific improvements.\n\n## HTML\n\`\`\`html\n${htmlCode}\n\`\`\`\n## CSS\n\`\`\`css\n${cssCode}\n\`\`\`\n## JavaScript\n\`\`\`js\n${jsCode}\n\`\`\``,
          courseTrack: "web-dev",
        }),
      });
      const data = await res.json();
      setAiReview(data.message || data.error || "No response from AI.");
    } catch {
      setAiReview("Could not reach AI Tutor. Please check your connection.");
    } finally { setAiLoading(false); }
  };

  const currentCode = activeTab === "html" ? htmlCode : activeTab === "css" ? cssCode : jsCode;
  const setCurrentCode = activeTab === "html" ? setHtmlCode : activeTab === "css" ? setCssCode : setJsCode;

  const viewportWidth = viewport === "mobile" ? "375px" : viewport === "tablet" ? "768px" : "100%";

  const logColor = (level: string) =>
    level === "error" ? "text-red-400" : level === "warn" ? "text-yellow-400" : "text-emerald-400";

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      {/* AI Review Drawer */}
      {aiOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAiOpen(false)} />
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col z-10">
            <div className="p-4 border-b border-[#F1E2F5] flex items-center justify-between bg-[#FAF8FF]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#AE54C6]" />
                <span className="font-black text-sm text-[#303654]">AI Code Review</span>
              </div>
              <button onClick={() => setAiOpen(false)} className="text-[#8580A3] hover:text-[#303654] cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 text-sm text-[#303654] leading-relaxed">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-[#8580A3]">
                  <Loader2 className="w-8 h-8 animate-spin text-[#AE54C6]" />
                  <span className="text-xs font-semibold">Analysing your code…</span>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">{aiReview}</pre>
              )}
            </div>
            {!aiLoading && aiReview && (
              <div className="p-4 border-t border-[#F1E2F5]">
                <Button onClick={reviewWithAI} variant="purple" size="sm" className="w-full text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Re-review Code
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sandbox Header Bar */}
      <div className="bg-[#303654] text-white py-5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="purple">PHASE 5 BROWSER IDE</Badge>
              <Badge variant="gold">INTERACTIVE LAB SANDBOX</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">BEMS In-Browser Code Playground</h1>
            <p className="text-xs text-[#C6BDD3]">Write and preview HTML5, CSS3 & JavaScript live — no setup needed. <span className="opacity-60">Ctrl+Enter to run.</span></p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Template Picker */}
            <select
              value={activeTemplate}
              onChange={(e) => loadTemplate(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-hidden"
            >
              {Object.entries(TEMPLATE_META).map(([key, m]) => (
                <option key={key} value={key} className="text-[#303654]">{m.icon} {m.label}</option>
              ))}
            </select>

            <Button onClick={runCode} variant="purple" size="sm" className="shadow-md text-xs font-bold">
              <Play className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Run
            </Button>

            <Button onClick={downloadHtml} variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs font-bold">
              <Download className="w-3.5 h-3.5 mr-1" /> Export
            </Button>

            <Button onClick={reviewWithAI} variant="outline" size="sm" className="bg-white text-[#303654] hover:text-[#AE54C6] hover:bg-[#FAF8FF] hover:border-[#AE54C6] font-bold text-xs shadow-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-[#AE54C6]" /> AI Review
            </Button>
          </div>
        </div>
      </div>

      {/* IDE Split Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">

        {/* Mobile View Toggle */}
        <div className="lg:hidden flex items-center p-1 rounded-2xl bg-white border border-[#F1E2F5] shadow-xs mb-4">
          <button type="button" onClick={() => setMobileView("editor")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${mobileView === "editor" ? "bg-[#303654] text-white shadow-xs" : "text-[#645F80] hover:text-[#303654]"}`}>
            <Code2 className="w-3.5 h-3.5" /><span>Code Editor</span>
          </button>
          <button type="button" onClick={() => setMobileView("preview")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${mobileView === "preview" ? "bg-[#AE54C6] text-white shadow-xs" : "text-[#645F80] hover:text-[#303654]"}`}>
            <Eye className="w-3.5 h-3.5" /><span>Live Output</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[560px] sm:h-[620px] lg:h-[720px]">

          {/* LEFT: Code Editor */}
          <div className={`${mobileView === "editor" ? "flex" : "hidden"} lg:flex bg-[#303654] rounded-3xl border border-white/10 shadow-xl flex-col overflow-hidden`}>

            {/* Tab bar */}
            <div className="flex items-center justify-between p-2 px-3 border-b border-white/10 bg-black/30">
              <div className="flex items-center gap-1">
                {[{ id: "html", label: "index.html", color: "text-amber-400" },
                  { id: "css",  label: "styles.css",  color: "text-blue-400"   },
                  { id: "js",   label: "app.js",      color: "text-yellow-400" }
                ].map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id as "html"|"css"|"js")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === t.id ? "bg-white/15 text-white" : "text-[#C6BDD3] hover:text-white"}`}>
                    <FileCode className={`w-3.5 h-3.5 ${t.color}`} />{t.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {/* Auto-run toggle */}
                <button onClick={() => setAutoRun(v => !v)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer ${autoRun ? "bg-emerald-500/20 text-emerald-400" : "text-[#C6BDD3] hover:text-white"}`}>
                  {autoRun ? "⚡ Auto" : "Auto"}
                </button>
                {/* Copy button */}
                <button onClick={copyCode} className="text-[#C6BDD3] hover:text-white cursor-pointer transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Textarea */}
            <div className="flex-1 p-4 overflow-y-auto">
              <textarea
                value={currentCode}
                onChange={e => setCurrentCode(e.target.value)}
                onKeyDown={handleTabKeyDown}
                className="w-full h-full bg-transparent text-[#FAF8FF] font-mono text-xs focus:outline-hidden resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Footer */}
            <div className="p-2.5 px-4 bg-black/40 border-t border-white/10 flex items-center justify-between text-[11px] text-[#C6BDD3]">
              <span>Tab = indent &middot; Ctrl+Enter = run</span>
              <button onClick={() => loadTemplate("bems-hero")} className="hover:text-white underline cursor-pointer">Reset</button>
            </div>
          </div>

          {/* RIGHT: Preview + Console */}
          <div className={`${mobileView === "preview" ? "flex" : "hidden"} lg:flex flex-col gap-4`}>

            {/* Preview panel */}
            <div className="flex-1 bg-white rounded-3xl border border-[#F1E2F5] shadow-xs flex flex-col overflow-hidden">
              {/* Preview toolbar */}
              <div className="p-2.5 px-4 border-b border-[#F7EDF9] bg-[#FAF8FF] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#303654]">
                  <Eye className="w-3.5 h-3.5 text-[#AE54C6]" /><span>Live Preview</span>
                </div>
                {/* Viewport switcher */}
                <div className="flex items-center gap-1 bg-white border border-[#F1E2F5] rounded-xl p-0.5">
                  {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([vp, Icon]) => (
                    <button key={vp} onClick={() => setViewport(vp)}
                      className={`p-1.5 rounded-lg cursor-pointer transition-all ${viewport === vp ? "bg-[#303654] text-white" : "text-[#8580A3] hover:text-[#303654]"}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>
              {/* iframe wrapper — constrained by viewport */}
              <div className="flex-1 overflow-auto flex justify-center bg-[#f0eff5]">
                <div style={{ width: viewportWidth, minWidth: 0 }} className="h-full bg-white transition-all duration-300">
                  <iframe title="Sandbox Preview" srcDoc={srcDoc} sandbox="allow-scripts allow-modals"
                    className="w-full h-full border-none" />
                </div>
              </div>
            </div>

            {/* Console */}
            <div className="h-40 bg-[#303654] rounded-2xl border border-white/10 shadow-xs flex flex-col overflow-hidden text-xs">
              <div className="p-2.5 px-4 bg-black/40 border-b border-white/10 flex items-center justify-between text-[#C6BDD3]">
                <div className="flex items-center gap-2 font-mono font-bold">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" /><span>Console</span>
                  {consoleLogs.length > 0 && <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full">{consoleLogs.length}</span>}
                </div>
                <button onClick={() => setConsoleLogs([])} className="text-[10px] hover:text-white cursor-pointer">Clear</button>
              </div>
              <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] text-[#E5DDEF] space-y-1">
                {consoleLogs.length === 0 ? (
                  <span className="text-[#8580A3]">No logs yet. Trigger events to see output here.</span>
                ) : consoleLogs.map((entry, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`mt-px ${logColor(entry.level)}`}>&gt;</span>
                    <span className={logColor(entry.level)}>{entry.text}</span>
                    <span className="ml-auto text-[#8580A3] text-[9px] shrink-0">{entry.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

