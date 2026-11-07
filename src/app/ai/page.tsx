"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Bot,
  BrainCircuit,
  Calendar,
  FileCheck,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Code2,
  BookOpen,
  Award,
  RefreshCw,
  Trophy,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  XCircle,
  Zap,
  Check,
  HelpCircle
} from "lucide-react";
import Button from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatMarkdown } from "@/components/ChatMarkdown";
import { useLMS } from "@/context/LMSContext";
import { LearningInsights } from "@/components/LearningInsights";
import { apiFetch } from "@/lib/api-client";
import {
  AIChatMessage,
  GeneratedQuiz,
  AIStudyPlan,
  AIFeedbackResult,
  PersonalizedRecommendation
} from "@/types/ai";

const TRACK_PRESETS: Record<string, { label: string; topics: string[] }> = {
  "web-dev": {
    label: "Web Development",
    topics: [
      "Modern JavaScript & ES6",
      "React Hooks & State",
      "CSS Flexbox & Responsive Grid",
      "Next.js App Router & SSR",
      "REST APIs & Paystack Webhooks",
      "SQL & Database Schemas"
    ]
  },
  "ai-automation": {
    label: "Applied AI & Automation",
    topics: [
      "Prompt Engineering & Few-Shot",
      "LLM Hallucinations & Grounding",
      "Make & Zapier Automations",
      "Vector DBs & RAG Architecture",
      "Autonomous AI Agents"
    ]
  },
  "product-design": {
    label: "Product Design (UI/UX)",
    topics: [
      "Figma Auto-Layout & Tokens",
      "WCAG Accessibility & Contrast",
      "User Journey & Usability Tests",
      "Mobile-First Prototyping",
      "Design Systems & Reusable UI"
    ]
  },
  "cybersecurity": {
    label: "Cybersecurity Defense",
    topics: [
      "SQL Injection & XSS Defense",
      "Authentication & JWT Security",
      "Password Hashing & Salts",
      "Network Port Scanning",
      "Zero-Trust Architecture"
    ]
  }
};

function AIHubContent() {
  const searchParams = useSearchParams();
  const { user, getCourseProgress } = useLMS();
  const initialTab = searchParams.get("tab") || "tutor";
  const initialCourse = searchParams.get("courseId") || searchParams.get("course") || "web-dev";
  const initialLessonTitle = searchParams.get("lessonTitle") || "";

  const [activeTab, setActiveTab] = useState<"tutor" | "quiz" | "study-plan" | "feedback" | "recommendations">(
    (initialTab as any) || "tutor"
  );

  // 1. AI Tutor State
  const [tutorName, setTutorName] = useState(
    initialCourse === "ai-automation"
      ? "Dr. Amaka"
      : initialCourse === "digital-marketing"
      ? "Mrs. Funke"
      : initialCourse === "graphic-design"
      ? "Mr. Tunde"
      : "Mr. Victor"
  );
  const [track, setTrack] = useState(initialCourse);
  const [tutorInput, setTutorInput] = useState("");
  const [tutorMessages, setTutorMessages] = useState<AIChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: initialLessonTitle
        ? `Hello! I see you're studying "${initialLessonTitle}". Ask me to explain any concept from this lesson, walk through code examples, or test you with a quick question!`
        : "Hello! I'm Mr. Victor Okeke, Lead Web Development Instructor at BEMS Institute of Technology. What are you building or debugging today? Ask me any question about HTML, CSS, JavaScript, Next.js, or your capstone!",
      timestamp: "Just now"
    }
  ]);
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(
    initialLessonTitle
      ? [
          `Explain "${initialLessonTitle}" simply with a real-world analogy`,
          `Give me a practical code example for "${initialLessonTitle}"`,
          `Quiz me with 1 question on "${initialLessonTitle}"`
        ]
      : [
          "How do I center a div using CSS Flexbox vs Grid?",
          "Explain async/await with a real Paystack API fetch example",
          "What are the requirements to pass the Capstone project?"
        ]
  );
  const [ragSources, setRagSources] = useState<
    { id: string; title: string; sourceType: string; lessonUrl?: string }[]
  >([]);
  const [weakConcepts, setWeakConcepts] = useState<string[]>([]);

  // 2. Quiz Generator State
  const [quizTrack, setQuizTrack] = useState<string>("web-dev");
  const [quizTopic, setQuizTopic] = useState("Modern JavaScript & ES6");
  const [quizDifficulty, setQuizDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [quizCount, setQuizCount] = useState<number>(3);
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizError, setQuizError] = useState<string | null>(null);

  // 3. Study Plan State
  const [studentName, setStudentName] = useState(user?.name || "Chinedu Okeke");
  const [studyHours, setStudyHours] = useState(8);
  const [studyPace, setStudyPace] = useState<"Accelerated" | "Standard" | "Flexible Weekend">("Standard");
  const [studyPlan, setStudyPlan] = useState<AIStudyPlan | null>(null);
  const [isStudyLoading, setIsStudyLoading] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setStudentName(user.name);
    }
  }, [user?.name]);

  // 4. Code Feedback State
  const [codeSubmission, setCodeSubmission] = useState(
    `// BEMS Capstone Submission\n// GitHub: https://github.com/chinedu/bems-ecommerce\n// Live Demo: https://bems-store.vercel.app\n\nasync function verifyPayment(reference) {\n  const res = await fetch('/api/verify?ref=' + reference);\n  return res.json();\n}`
  );
  const [feedbackResult, setFeedbackResult] = useState<AIFeedbackResult | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  // 5. Recommendations State
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [isRecsLoading, setIsRecsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "recommendations" && recommendations.length === 0) {
      loadRecommendations();
    }
  }, [activeTab]);

  // Handler: Tutor Send
  const handleSendTutorMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || tutorInput.trim();
    if (!textToSend || isTutorLoading) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setTutorMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setTutorInput("");
    setIsTutorLoading(true);

    try {
      const res = await apiFetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "tutor",
          prompt: textToSend,
          courseTrack: track,
          tutorName: tutorName,
          history: tutorMessages
        })
      });

      if (!res.ok) throw new Error("Tutor failed to respond");
      const data = await res.json();

      const botMsg: AIChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setTutorMessages((prev) => [...prev, botMsg]);
      if (data.suggestedPrompts && data.suggestedPrompts.length > 0) {
        setSuggestedPrompts(data.suggestedPrompts);
      }
      if (Array.isArray(data.ragSources)) {
        setRagSources(data.ragSources);
      }
      if (Array.isArray(data.weakConcepts)) {
        setWeakConcepts(data.weakConcepts);
      }
    } catch (err) {
      console.error(err);
      setTutorMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: "assistant",
          content: "I ran into a temporary connection issue. Please check your internet connection and try asking again.",
          timestamp: "Just now"
        }
      ]);
    } finally {
      setIsTutorLoading(false);
    }
  };

  // Handler: Generate Quiz
  const handleGenerateQuiz = async (overrideTopic?: string) => {
    const topicToUse = (overrideTopic || quizTopic).trim();
    if (!topicToUse) return;

    setIsQuizLoading(true);
    setQuizError(null);
    setGeneratedQuiz(null);
    setQuizAnswers({});
    setShowQuizResults(false);
    setQuizQuestionIndex(0);

    const trackLabel = TRACK_PRESETS[quizTrack]?.label || "Web Development";

    try {
      const res = await apiFetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "quiz",
          topic: topicToUse,
          difficulty: quizDifficulty,
          count: quizCount,
          track: trackLabel
        })
      });

      if (!res.ok) throw new Error("Quiz generation failed. Please try again.");
      const data = await res.json();
      setGeneratedQuiz(data);
    } catch (err: any) {
      console.error(err);
      setQuizError(err?.message || "Failed to generate quiz. Please check your connection and try again.");
    } finally {
      setIsQuizLoading(false);
    }
  };

  // Handler: Ask AI Tutor about missed or tricky question
  const handleAskTutorAboutQuestion = (q: any, selectedOptionIndex?: number) => {
    const selectedText =
      selectedOptionIndex !== undefined && q.options[selectedOptionIndex]
        ? `I chose option (${String.fromCharCode(65 + selectedOptionIndex)}): "${q.options[selectedOptionIndex]}"`
        : "I wasn't sure how to answer";

    const promptText = `Hi ${tutorName}, I was taking a practice quiz on "${generatedQuiz?.topic || quizTopic}" and encountered this question:

> **"${q.prompt}"**

${selectedText}, but the correct answer is option (${String.fromCharCode(65 + q.correctOption)}): "${q.options[q.correctOption]}".

Could you please explain the concept in simple terms, why the correct answer is right, and what mental model I should use so I never miss this on the official Capstone?`;

    setActiveTab("tutor");
    handleSendTutorMessage(promptText);
  };

  // Handler: Generate Study Plan
  const handleGenerateStudyPlan = async () => {
    setIsStudyLoading(true);
    try {
      const res = await apiFetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "study-plan",
          studentName,
          trackTitle: track === "web-dev" ? "Full-Stack Web Development" : "Generative AI & Automation",
          hoursPerWeek: studyHours,
          learningPace: studyPace
        })
      });

      if (!res.ok) throw new Error("Plan generation failed");
      const data = await res.json();
      setStudyPlan(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsStudyLoading(false);
    }
  };

  // Handler: Code Feedback
  const handleEvaluateCode = async () => {
    setIsFeedbackLoading(true);
    try {
      const res = await apiFetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "feedback",
          submissionContent: codeSubmission,
          track: "Web Development"
        })
      });

      if (!res.ok) throw new Error("Evaluation failed");
      const data = await res.json();
      setFeedbackResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  // Handler: Recommendations
  const loadRecommendations = async () => {
    setIsRecsLoading(true);
    try {
      const liveProgress = getCourseProgress(track)?.percent || 50;
      const res = await apiFetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "recommendations",
          courseId: track,
          progressPercent: liveProgress,
          quizScore: 88
        })
      });

      if (!res.ok) throw new Error("Recommendations failed");
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-light/30">
      <Navbar />
      <div className="max-w-7xl mx-auto w-full flex-1 py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Hero */}
        <div className="rounded-3xl bg-gradient-to-r from-brand-navy via-brand-dark to-purple-900 text-white p-6 sm:p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-brand-purple/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-purple/30 border border-brand-purple/40 text-purple-200 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>BEMS AI Academic Suite • Phase 4</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight">
              AI Technical Tutor &amp; Learning Companion
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-purple-100/90 leading-relaxed">
              Powered by Google Gemini and custom-trained on the BEMS FutureSkills curriculum. Get 24/7 technical tutoring, custom practice quizzes, pre-submission capstone audits, and personalized study roadmaps.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-gray-200 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab("tutor")}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === "tutor"
                ? "bg-brand-navy text-white shadow-md"
                : "text-gray-600 hover:text-brand-dark hover:bg-gray-100"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Tutor Chat</span>
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === "quiz"
                ? "bg-brand-navy text-white shadow-md"
                : "text-gray-600 hover:text-brand-dark hover:bg-gray-100"
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>AI Quiz Generator</span>
          </button>

          <button
            onClick={() => setActiveTab("study-plan")}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === "study-plan"
                ? "bg-brand-navy text-white shadow-md"
                : "text-gray-600 hover:text-brand-dark hover:bg-gray-100"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>AI Study Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab("feedback")}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === "feedback"
                ? "bg-brand-navy text-white shadow-md"
                : "text-gray-600 hover:text-brand-dark hover:bg-gray-100"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Capstone Pre-Review</span>
          </button>

          <button
            onClick={() => setActiveTab("recommendations")}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === "recommendations"
                ? "bg-brand-navy text-white shadow-md"
                : "text-gray-600 hover:text-brand-dark hover:bg-gray-100"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Personalized Next Steps</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: AI TUTOR CHAT */}
        {/* ========================================================================= */}
        {activeTab === "tutor" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Controls */}
            <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
              <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4">
                <h3 className="font-bold text-brand-dark text-sm flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-brand-purple" />
                  <span>Choose Faculty Persona</span>
                </h3>

                <div className="space-y-2">
                  {[
                    { name: "Mr. Victor", role: "Web Dev & Next.js Lead", avatar: "VO" },
                    { name: "Timi", role: "AI & Automation Engineer", avatar: "TA" },
                    { name: "Temi", role: "UI/UX Product Design Lead", avatar: "TE" },
                    { name: "Specialist Faculty", role: "Cybersecurity Auditor", avatar: "SF" }
                  ].map((tutor) => (
                    <button
                      key={tutor.name}
                      onClick={() => setTutorName(tutor.name)}
                      className={`w-full text-left p-3 rounded-xl flex items-center space-x-3 transition-all ${
                        tutorName === tutor.name
                          ? "bg-brand-purple/10 border-2 border-brand-purple text-brand-dark"
                          : "bg-gray-50 border border-gray-100 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {tutor.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{tutor.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{tutor.role}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-700 block mb-2">Subject Context</label>
                  <select
                    value={track}
                    onChange={(e) => setTrack(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                  >
                    <option value="web-dev">Full-Stack Web Development</option>
                    <option value="ai-prompt">AI & Prompt Engineering</option>
                    <option value="ui-ux">UI/UX Product Design</option>
                    <option value="cybersecurity">Cybersecurity & Defense</option>
                  </select>
                </div>
              </div>

              {/* Fast Prompt Suggestions */}
              <div className="bg-brand-lavender/30 rounded-2xl p-5 border border-brand-purple/10 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-brand-navy">
                  <Lightbulb className="w-4 h-4 text-brand-purple" />
                  <span>Suggested Questions</span>
                </div>
                <div className="space-y-2">
                  {suggestedPrompts.map((promptText, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendTutorMessage(promptText)}
                      className="w-full text-left p-2.5 rounded-lg bg-white border border-brand-purple/10 text-xs text-gray-700 hover:border-brand-purple hover:text-brand-purple transition-colors shadow-2xs"
                    >
                      {promptText}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Conversation Area */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/80 shadow-sm flex flex-col h-[560px] sm:h-[650px] overflow-hidden order-1 lg:order-2">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-bold text-brand-dark">{tutorName} (BEMS AI Tutor)</h3>
                    <p className="text-[11px] text-gray-500">October 2026 Cohort • Active Workspace</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setTutorMessages([
                      {
                        id: "welcome-reset",
                        role: "assistant",
                        content: `Hello! I am ${tutorName}. How can I assist your coding journey today?`,
                        timestamp: "Just now"
                      }
                    ])
                  }
                  className="text-xs text-gray-400 hover:text-brand-purple flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Clear Chat</span>
                </button>
              </div>

              {/* Message List */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {tutorMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-3 ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        msg.role === "user" ? "bg-brand-purple text-white" : "bg-brand-navy text-white"
                      }`}
                    >
                      {msg.role === "user" ? "ME" : tutorName.substring(0, 2).toUpperCase()}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed shadow-xs ${
                        msg.role === "user"
                          ? "bg-brand-navy text-white rounded-tr-none"
                          : "bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-none"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                      ) : (
                        <ChatMarkdown content={msg.content} />
                      )}
                      <span className={`block text-[10px] mt-2 ${msg.role === "user" ? "text-purple-200" : "text-gray-400"}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isTutorLoading && (
                  <div className="flex items-center space-x-3 text-gray-400 text-xs py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-purple" />
                    <span>{tutorName} is thinking and formulating guidance...</span>
                  </div>
                )}
                {ragSources.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-purple-50/70 border border-brand-purple/20 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-purple flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        Grounded in BEMS Course Material (RAG)
                      </span>
                      {weakConcepts.length > 0 && (
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          Targeting weak concepts: {weakConcepts.join(", ")}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ragSources.map((src) =>
                        src.lessonUrl ? (
                          <a
                            key={src.id}
                            href={src.lessonUrl}
                            className="text-xs px-2.5 py-1 rounded-lg bg-white border border-brand-purple/20 text-brand-dark hover:border-brand-purple hover:text-brand-purple font-medium transition-colors"
                          >
                            📖 {src.title} &rarr;
                          </a>
                        ) : (
                          <span
                            key={src.id}
                            className="text-xs px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700"
                          >
                            📝 {src.title}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* LearnIQ Pedagogical Quick-Action Pills + Input Box */}
              <div className="p-4 border-t border-gray-100 bg-white space-y-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    {
                      label: "Explain simpler",
                      prompt: "Explain that last concept in simpler beginner terms using a real-world analogy."
                    },
                    {
                      label: "Give me an example",
                      prompt: "Give me a clean, practical code example I can run in the BEMS Sandbox."
                    },
                    {
                      label: "Quiz me",
                      prompt: "Ask me 1 quick diagnostic question on this concept to test my understanding."
                    },
                    {
                      label: "Give me a hint",
                      prompt: "Give me a step-by-step hint without revealing the full answer right away."
                    },
                    {
                      label: "Show me where I went wrong",
                      prompt: "Based on my weak concepts and quiz history, show me where I might be going wrong and how to fix my mental model."
                    }
                  ].map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      disabled={isTutorLoading}
                      onClick={() => handleSendTutorMessage(action.prompt)}
                      className="px-3 py-1.5 rounded-full bg-brand-lavender/50 hover:bg-brand-purple hover:text-white border border-brand-purple/20 text-brand-dark text-xs font-semibold transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendTutorMessage();
                  }}
                  className="flex items-center space-x-3"
                >
                  <input
                    type="text"
                    value={tutorInput}
                    onChange={(e) => setTutorInput(e.target.value)}
                    placeholder={`Ask ${tutorName} a technical question (e.g. Next.js, CSS Flexbox, APIs)...`}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/40"
                    disabled={isTutorLoading}
                  />
                  <Button
                    type="submit"
                    variant="purple"
                    disabled={isTutorLoading || !tutorInput.trim()}
                    className="shrink-0 px-5"
                  >
                    {isTutorLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: AI QUIZ GENERATOR */}
        {/* ========================================================================= */}
        {activeTab === "quiz" && (
          <div className="bg-white rounded-3xl border border-[#F1E2F5] shadow-xs p-6 md:p-8 space-y-8">
            {/* Top Generator Configuration Card */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-2xl bg-purple-50 text-[#AE54C6] border border-purple-200/60 shadow-2xs">
                    <BrainCircuit className="w-6 h-6" />
                  </span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#303654]">
                      Dynamic Practice Quiz Generator
                    </h2>
                    <p className="text-xs sm:text-sm text-[#645F80]">
                      Generate syllabus-aligned, interactive exam questions to test your comprehension before official Capstones.
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 text-[#AE54C6] border border-purple-200 text-xs font-bold shadow-2xs self-start sm:self-auto shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#AE54C6]" />
                  <span>Powered by Gemini 2.5 Flash</span>
                </span>
              </div>

              {/* Form Controls */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
                {/* Track Selector */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-[#303654] mb-1.5">
                    Course Track
                  </label>
                  <select
                    value={quizTrack}
                    onChange={(e) => {
                      const newTrack = e.target.value;
                      setQuizTrack(newTrack);
                      const firstPreset = TRACK_PRESETS[newTrack]?.topics[0];
                      if (firstPreset) setQuizTopic(firstPreset);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F1E2F5] bg-white text-xs font-semibold text-[#303654] focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/30 shadow-2xs"
                  >
                    <option value="web-dev">Full-Stack Web Development</option>
                    <option value="ai-automation">Applied AI &amp; Automation</option>
                    <option value="product-design">Product Design (UI/UX)</option>
                    <option value="cybersecurity">Cybersecurity &amp; Defense</option>
                  </select>
                </div>

                {/* Difficulty Selector */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-[#303654] mb-1.5">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["Beginner", "Intermediate", "Advanced"] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setQuizDifficulty(diff)}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center cursor-pointer ${
                          quizDifficulty === diff
                            ? "bg-[#AE54C6] text-white border-[#AE54C6] shadow-xs"
                            : "bg-[#FAF8FF] text-[#645F80] border-[#F1E2F5] hover:border-purple-200 hover:bg-white"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Count Selector */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-[#303654] mb-1.5">
                    Question Count
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { count: 3, label: "3 Sprint" },
                      { count: 5, label: "5 Standard" },
                      { count: 10, label: "10 Exam" }
                    ].map((item) => (
                      <button
                        key={item.count}
                        type="button"
                        onClick={() => setQuizCount(item.count)}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center cursor-pointer ${
                          quizCount === item.count
                            ? "bg-[#303654] text-white border-[#303654] shadow-xs"
                            : "bg-[#FAF8FF] text-[#645F80] border-[#F1E2F5] hover:border-slate-300 hover:bg-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topic Input with Quick Preset Chips */}
                <div className="md:col-span-12 space-y-2">
                  <label className="block text-xs font-bold text-[#303654]">
                    Topic or Specific Concept
                  </label>
                  <input
                    type="text"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    placeholder="e.g. React Hooks, CSS Flexbox, Next.js SSR, Paystack Webhooks, SQL Joins..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#F1E2F5] text-sm text-[#303654] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#AE54C6]/30 shadow-2xs"
                  />

                  {/* Syllabus Topic Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] font-bold text-[#8580A3] mr-1">
                      Quick Topics:
                    </span>
                    {(TRACK_PRESETS[quizTrack]?.topics || TRACK_PRESETS["web-dev"].topics).map((topicItem) => {
                      const isSelected = quizTopic.trim().toLowerCase() === topicItem.toLowerCase();
                      return (
                        <button
                          key={topicItem}
                          type="button"
                          onClick={() => setQuizTopic(topicItem)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-purple-100 text-[#AE54C6] border-purple-300 font-bold"
                              : "bg-white text-[#645F80] border-[#F1E2F5] hover:border-purple-200 hover:text-[#AE54C6]"
                          }`}
                        >
                          {topicItem}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="purple"
                  onClick={() => handleGenerateQuiz()}
                  disabled={isQuizLoading || !quizTopic.trim()}
                  className="font-bold shadow-md text-xs px-6 py-2.5"
                >
                  {isQuizLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Synthesizing Questions with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      <span>Generate Practice Quiz</span>
                    </>
                  )}
                </Button>

                {generatedQuiz && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGeneratedQuiz(null);
                      setQuizAnswers({});
                      setShowQuizResults(false);
                      setQuizQuestionIndex(0);
                    }}
                    className="bg-white text-[#303654] font-bold text-xs shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-[#AE54C6]" />
                    <span>Reset Quiz</span>
                  </Button>
                )}
              </div>

              {quizError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-800 flex items-center justify-between">
                  <span>{quizError}</span>
                  <button
                    type="button"
                    onClick={() => handleGenerateQuiz()}
                    className="underline text-red-900 font-black"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            {/* ================================================================= */}
            {/* ACTIVE QUIZ RUNNER (STEP-BY-STEP OR ALL QUESTIONS) */}
            {/* ================================================================= */}
            {generatedQuiz && !showQuizResults && (
              <div className="pt-6 border-t border-[#F7EDF9] space-y-6">
                {/* Quiz Header & Progress Bar */}
                <div className="bg-[#FAF8FF] p-5 rounded-2xl border border-[#F1E2F5] space-y-4 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-[#AE54C6] border border-purple-200 font-bold">
                          {generatedQuiz.track}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-white text-[#303654] border border-[#F1E2F5] font-bold">
                          {generatedQuiz.difficulty}
                        </span>
                        <span className="text-xs text-[#8580A3] font-semibold">
                          {generatedQuiz.questions.length} Questions
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-[#303654]">
                        {generatedQuiz.topic}
                      </h3>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xs font-extrabold text-[#AE54C6] block">
                        {Object.keys(quizAnswers).length} of {generatedQuiz.questions.length} Answered
                      </span>
                      <span className="text-[11px] text-[#8580A3]">
                        {Math.round((Object.keys(quizAnswers).length / generatedQuiz.questions.length) * 100)}% Complete
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-[#F1E2F5]">
                    <div
                      className="h-full bg-gradient-to-r from-[#AE54C6] to-[#7B2CBF] transition-all duration-300 rounded-full"
                      style={{
                        width: `${Math.round(
                          (Object.keys(quizAnswers).length / generatedQuiz.questions.length) * 100
                        )}%`
                      }}
                    />
                  </div>

                  {/* Question Stepper Dots */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {generatedQuiz.questions.map((q, idx) => {
                      const isAnswered = quizAnswers[q.id] !== undefined;
                      const isCurrent = idx === quizQuestionIndex;

                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => setQuizQuestionIndex(idx)}
                          className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                            isCurrent
                              ? "bg-[#303654] text-white ring-2 ring-[#303654]/30 shadow-xs scale-105"
                              : isAnswered
                              ? "bg-purple-100 text-[#AE54C6] border border-purple-300 font-extrabold"
                              : "bg-white text-[#8580A3] border border-[#F1E2F5] hover:border-purple-200"
                          }`}
                        >
                          {isAnswered && !isCurrent ? (
                            <Check className="w-3.5 h-3.5 text-[#AE54C6]" />
                          ) : (
                            idx + 1
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Current Question View */}
                {(() => {
                  const currentQ = generatedQuiz.questions[quizQuestionIndex] || generatedQuiz.questions[0];
                  const selectedOpt = quizAnswers[currentQ.id];

                  return (
                    <div className="p-6 sm:p-7 rounded-3xl border border-[#F1E2F5] bg-white shadow-xs space-y-6">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-[#AE54C6] px-3 py-1 rounded-lg bg-purple-50 border border-purple-100">
                          Question {quizQuestionIndex + 1} of {generatedQuiz.questions.length}
                        </span>
                        <span className="text-xs text-[#8580A3] font-semibold">
                          Select one correct answer
                        </span>
                      </div>

                      <p className="text-base sm:text-lg font-black text-[#303654] leading-relaxed">
                        {currentQ.prompt}
                      </p>

                      {/* 4 Large Interactive Option Cards */}
                      <div className="space-y-3">
                        {currentQ.options.map((option, optIdx) => {
                          const isSelected = selectedOpt === optIdx;
                          const letter = String.fromCharCode(65 + optIdx);

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => {
                                setQuizAnswers((prev) => ({ ...prev, [currentQ.id]: optIdx }));
                              }}
                              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                                isSelected
                                  ? "border-[#AE54C6] bg-purple-50/70 text-[#303654] ring-2 ring-[#AE54C6]/20 font-bold shadow-xs"
                                  : "border-[#F1E2F5] hover:border-purple-300 hover:bg-[#FAF8FF] text-[#4A4568]"
                              }`}
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <span
                                  className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected
                                      ? "bg-[#AE54C6] text-white"
                                      : "bg-white text-[#645F80] border border-[#F1E2F5]"
                                  }`}
                                >
                                  {letter}
                                </span>
                                <span className="text-xs sm:text-sm leading-relaxed">{option}</span>
                              </div>

                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? "border-[#AE54C6] bg-[#AE54C6] text-white"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Navigation Controls */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#F7EDF9]">
                        <Button
                          variant="outline"
                          onClick={() => setQuizQuestionIndex((prev) => Math.max(0, prev - 1))}
                          disabled={quizQuestionIndex === 0}
                          className="bg-white text-[#303654] font-bold text-xs shadow-xs"
                        >
                          <ChevronLeft className="w-4 h-4 mr-1 text-[#AE54C6]" />
                          <span>Previous Question</span>
                        </Button>

                        <div className="flex items-center gap-2">
                          {quizQuestionIndex < generatedQuiz.questions.length - 1 ? (
                            <Button
                              variant="purple"
                              onClick={() =>
                                setQuizQuestionIndex((prev) =>
                                  Math.min(generatedQuiz.questions.length - 1, prev + 1)
                                )
                              }
                              className="font-bold text-xs shadow-xs"
                            >
                              <span>Next Question</span>
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          ) : (
                            <Button
                              variant="purple"
                              onClick={() => setShowQuizResults(true)}
                              disabled={Object.keys(quizAnswers).length < generatedQuiz.questions.length}
                              className="font-bold text-xs shadow-md"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1.5" />
                              <span>Submit Quiz &amp; Grade Answers</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ================================================================= */}
            {/* CELEBRATORY RESULTS & QUESTION-BY-QUESTION REVIEW */}
            {/* ================================================================= */}
            {generatedQuiz && showQuizResults && (() => {
              const totalQ = generatedQuiz.questions.length;
              const correctCount = generatedQuiz.questions.filter(
                (q) => quizAnswers[q.id] === q.correctOption
              ).length;
              const scorePct = Math.round((correctCount / totalQ) * 100);
              const isPassed = scorePct >= 70;
              const earnedXP = correctCount * 20;

              return (
                <div className="pt-6 border-t border-[#F7EDF9] space-y-8">
                  {/* Score Celebration Hero Banner */}
                  <div
                    className={`p-6 sm:p-8 rounded-3xl border text-center space-y-4 shadow-sm ${
                      isPassed
                        ? "bg-gradient-to-br from-purple-50 via-[#FAF8FF] to-emerald-50/50 border-purple-200"
                        : "bg-gradient-to-br from-[#FAF8FF] to-amber-50/50 border-amber-200"
                    }`}
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-2 border-purple-200 shadow-md mx-auto">
                      {scorePct === 100 ? (
                        <Trophy className="w-9 h-9 text-amber-500 fill-amber-400" />
                      ) : isPassed ? (
                        <Award className="w-9 h-9 text-[#AE54C6]" />
                      ) : (
                        <Zap className="w-9 h-9 text-amber-500 fill-amber-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-3xl sm:text-5xl font-black text-[#303654]">
                          {scorePct}%
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[#8580A3]">
                          ({correctCount}/{totalQ} Correct)
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-[#303654]">
                        {scorePct === 100
                          ? "🏆 Flawless Victory! Complete Mastery!"
                          : isPassed
                          ? "🌟 Capstone Ready! Great Technical Comprehension!"
                          : "💪 Good Practice Run! Keep Building Your Mental Model!"}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#645F80] max-w-lg mx-auto mt-1">
                        {isPassed
                          ? "You demonstrated strong understanding of the core concepts tested in this module. Review the breakdown below to reinforce key details."
                          : "Review the question explanations below, then ask your AI Tutor to clarify any tricky points before your next attempt."}
                      </p>
                    </div>

                    {/* Gamified Reward Banner */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-purple-200 text-xs font-black text-[#AE54C6] shadow-2xs">
                      <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>+{earnedXP} XP Earned towards BEMS Scholar Rank</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <Button
                        variant="purple"
                        onClick={() => handleGenerateQuiz()}
                        className="font-bold text-xs shadow-xs px-5"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        <span>Generate Similar Quiz</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setQuizAnswers({});
                          setShowQuizResults(false);
                          setQuizQuestionIndex(0);
                        }}
                        className="bg-white text-[#303654] font-bold text-xs shadow-xs px-5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-[#AE54C6]" />
                        <span>Retake This Quiz</span>
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => {
                          setGeneratedQuiz(null);
                          setQuizAnswers({});
                          setShowQuizResults(false);
                          setQuizQuestionIndex(0);
                        }}
                        className="text-[#645F80] text-xs font-bold"
                      >
                        Change Topic / Settings
                      </Button>
                    </div>
                  </div>

                  {/* Question Breakdown Header */}
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <h4 className="text-base font-black text-[#303654] flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#AE54C6]" />
                      <span>Detailed Answer Breakdown &amp; Explanations</span>
                    </h4>
                    <span className="text-xs text-[#8580A3] font-semibold">
                      {totalQ} Questions Reviewed
                    </span>
                  </div>

                  {/* Question Review Cards */}
                  <div className="space-y-6">
                    {generatedQuiz.questions.map((q, qIndex) => {
                      const selected = quizAnswers[q.id];
                      const isCorrect = selected === q.correctOption;

                      return (
                        <div
                          key={q.id}
                          className={`p-6 rounded-3xl border transition-all ${
                            isCorrect
                              ? "bg-white border-emerald-200/80 shadow-2xs"
                              : "bg-white border-rose-200 shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-xs font-bold text-[#8580A3]">
                              Question {qIndex + 1} of {totalQ}
                            </span>
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                                isCorrect
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-rose-100 text-rose-800 border border-rose-200"
                              }`}
                            >
                              {isCorrect ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Correct (+20 XP)</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Needs Review</span>
                                </>
                              )}
                            </span>
                          </div>

                          <p className="font-black text-sm sm:text-base text-[#303654] mb-4">
                            {q.prompt}
                          </p>

                          {/* Options Breakdown */}
                          <div className="space-y-2 mb-4">
                            {q.options.map((option, optIdx) => {
                              const isThisCorrect = optIdx === q.correctOption;
                              const isThisSelected = selected === optIdx;
                              const letter = String.fromCharCode(65 + optIdx);

                              let cardStyle = "border-slate-200 bg-slate-50/50 text-slate-600";
                              if (isThisCorrect) {
                                cardStyle =
                                  "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500/30";
                              } else if (isThisSelected && !isThisCorrect) {
                                cardStyle =
                                  "border-rose-400 bg-rose-50 text-rose-950 font-semibold line-through";
                              }

                              return (
                                <div
                                  key={optIdx}
                                  className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 ${cardStyle}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                                        isThisCorrect
                                          ? "bg-emerald-600 text-white"
                                          : isThisSelected
                                          ? "bg-rose-500 text-white"
                                          : "bg-white text-slate-500 border border-slate-200"
                                      }`}
                                    >
                                      {letter}
                                    </span>
                                    <span>{option}</span>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-1.5 text-xs">
                                    {isThisCorrect && (
                                      <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span className="hidden sm:inline">Correct Answer</span>
                                      </span>
                                    )}
                                    {isThisSelected && !isThisCorrect && (
                                      <span className="text-rose-700 font-extrabold flex items-center gap-1">
                                        <XCircle className="w-4 h-4 text-rose-600" />
                                        <span className="hidden sm:inline">Your Selection</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Pedagogical Explanation */}
                          <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#F1E2F5] text-xs text-[#4A4568] space-y-1.5 mb-4">
                            <div className="flex items-center gap-1.5 font-bold text-[#AE54C6]">
                              <Lightbulb className="w-4 h-4 text-amber-500" />
                              <span>Instructor Explanation &amp; Core Principle:</span>
                            </div>
                            <p className="leading-relaxed pl-5 text-[#303654]">
                              {q.explanation}
                            </p>
                          </div>

                          {/* Ask AI Tutor 1-Click Action */}
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleAskTutorAboutQuestion(q, selected)}
                              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200/80 text-xs font-bold text-[#AE54C6] transition-all cursor-pointer hover:scale-[1.02]"
                            >
                              <Bot className="w-4 h-4 text-[#AE54C6]" />
                              <span>Ask AI Tutor ({tutorName}) to Explain This</span>
                              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: AI STUDY ASSISTANT */}
        {/* ========================================================================= */}
        {activeTab === "study-plan" && (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 md:p-8 space-y-6">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-xl font-bold text-brand-dark flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-brand-purple" />
                <span>AI Study Schedule & Pace Architect</span>
              </h2>
              <p className="text-sm text-gray-600">
                Create a custom 12-week study roadmap calibrated to your available hours and learning preference, with lab workstations and milestone deliverables.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Available Hours / Week</label>
                  <input
                    type="number"
                    min={4}
                    max={30}
                    value={studyHours}
                    onChange={(e) => setStudyHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Schedule Mode</label>
                  <select
                    value={studyPace}
                    onChange={(e) => setStudyPace(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30 bg-white"
                  >
                    <option value="Standard">Standard Weekday</option>
                    <option value="Flexible Weekend">Weekend Intensive</option>
                    <option value="Accelerated">Accelerated (Fast-Track)</option>
                  </select>
                </div>
              </div>

              <Button
                variant="purple"
                onClick={handleGenerateStudyPlan}
                disabled={isStudyLoading}
              >
                {isStudyLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Structuring Weekly Schedule...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span>Generate Custom Study Roadmap</span>
                  </>
                )}
              </Button>
            </div>

            {studyPlan && (
              <div className="mt-8 pt-8 border-t border-gray-100 space-y-6">
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/80 flex items-start space-x-3">
                  <Lightbulb className="w-5 h-5 text-brand-purple shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider">Tutor Guidance</h4>
                    <p className="text-xs text-gray-700 mt-1">{studyPlan.tutorTip}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {studyPlan.weeks.map((week) => (
                    <div
                      key={week.weekNumber}
                      className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-4 hover:border-brand-purple/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md bg-brand-navy text-white text-[11px] font-bold">
                          Week {week.weekNumber}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">{week.estimatedHours} hrs</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-brand-dark">{week.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{week.focusArea}</p>
                      </div>

                      <div className="space-y-2 border-t border-gray-100 pt-3">
                        {week.dailyBreakdown.map((item, idx) => (
                          <div key={idx} className="text-xs flex items-start space-x-2">
                            <span className="font-bold text-brand-purple shrink-0">{item.day}:</span>
                            <span className="text-gray-600">{item.task} ({item.duration})</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-2.5 rounded-lg bg-brand-lavender/30 text-[11px] text-brand-dark font-medium border border-brand-purple/10">
                        <span className="font-bold text-brand-purple block">Milestone Goal:</span>
                        {week.milestoneProject}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PRE-SUBMISSION CAPSTONE REVIEW */}
        {/* ========================================================================= */}
        {activeTab === "feedback" && (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 md:p-8 space-y-6">
            <div className="max-w-3xl space-y-4">
              <h2 className="text-xl font-bold text-brand-dark flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-brand-purple" />
                <span>Pre-Submission Capstone Review & Audit</span>
              </h2>
              <p className="text-sm text-gray-600">
                Run automated pre-flight verification on your code or live URLs against the 4 official BEMS Capstone rubrics before Mr. Victor posts your permanent certification grade.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Paste Code Snippet or Repository & Live URLs
                </label>
                <textarea
                  rows={6}
                  value={codeSubmission}
                  onChange={(e) => setCodeSubmission(e.target.value)}
                  className="w-full p-4 rounded-xl border border-gray-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-purple/30 bg-gray-50"
                />
              </div>

              <Button
                variant="purple"
                onClick={handleEvaluateCode}
                disabled={isFeedbackLoading || !codeSubmission.trim()}
              >
                {isFeedbackLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Analyzing Rubric Standards...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span>Run AI Pre-Flight Audit</span>
                  </>
                )}
              </Button>
            </div>

            {feedbackResult && (
              <div className="mt-8 pt-8 border-t border-gray-100 space-y-6">
                <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-navy to-purple-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-purple-200 font-semibold">
                      Audit Readiness Verdict
                    </span>
                    <h3 className="text-2xl font-black mt-1">
                      {feedbackResult.readinessVerdict === "READY_FOR_GRADING"
                        ? "✅ Ready for Formal Faculty Evaluation"
                        : "⚠️ Minor Revisions Recommended"}
                    </h3>
                    <p className="text-xs text-purple-100 mt-2 max-w-xl">{feedbackResult.summary}</p>
                  </div>
                  <div className="text-center md:text-right shrink-0 bg-white/10 p-4 rounded-xl border border-white/20">
                    <span className="text-xs text-purple-200 font-medium block">Estimated Score</span>
                    <span className="text-3xl font-black text-white">{feedbackResult.overallScore} / 100</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {feedbackResult.criteriaAnalysis.map((c, i) => (
                    <div key={i} className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-brand-dark">{c.criteria}</h4>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {c.scoreEstimate} / 25
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{c.feedback}</p>
                    </div>
                  ))}
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    <span>Recommended Polish Items Before Final Submission</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-900">
                    {feedbackResult.actionItems.map((action, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="font-bold">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PERSONALIZED NEXT STEPS */}
        {/* ========================================================================= */}
        {activeTab === "recommendations" && (
          <div className="space-y-6">
            <LearningInsights />
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 md:p-8 space-y-6">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-xl font-bold text-brand-dark flex items-center space-x-2">
                <Award className="w-5 h-5 text-brand-purple" />
                <span>Personalized Career &amp; Academic Milestones</span>
              </h2>
              <p className="text-sm text-gray-600">
                Tailored recommendations synthesized from your completed modules, exam performance, and career aspirations.
              </p>
            </div>

            {isRecsLoading ? (
              <div className="py-12 text-center text-sm text-gray-400 flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-brand-purple" />
                <span>Synthesizing smart recommendations...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-6 rounded-2xl border border-gray-200 hover:border-brand-purple/40 transition-all bg-white shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-purple/10 text-brand-purple">
                          {rec.badge}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            rec.urgency === "HIGH" ? "text-red-600" : "text-brand-navy"
                          }`}
                        >
                          {rec.urgency} Priority
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-brand-dark">{rec.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{rec.reason}</p>
                    </div>

                    <a
                      href={rec.actionUrl}
                      className="inline-flex items-center text-xs font-bold text-brand-purple hover:text-brand-navy pt-2 group"
                    >
                      <span>Take Action</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function AIPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-brand-light/30">
          <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
        </div>
      }
    >
      <AIHubContent />
    </Suspense>
  );
}

