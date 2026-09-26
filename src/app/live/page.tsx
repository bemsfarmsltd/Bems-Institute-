"use client";

import React, { useState } from "react";
import {
  Video,
  Radio,
  Users,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  MessageSquare,
  Send,
  Hand,
  CheckCircle,
  PlayCircle
} from "lucide-react";
import Button from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { mockLiveClasses } from "@/data/advanced-data";
import { LiveClass } from "@/types/advanced";

export default function LiveClassroomPage() {
  const [activeClass, setActiveClass] = useState<LiveClass>(mockLiveClasses[0]);
  const [raisedHand, setRaisedHand] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { id: string; user: string; text: string; time: string; isInstructor?: boolean }[]
  >([
    {
      id: "cm-1",
      user: "Mr. Victor Okeke",
      text: "Welcome everyone in Umuahia Lab 1 and on Zoom! Open your Next.js project from yesterday.",
      time: "4:01 PM",
      isInstructor: true
    },
    {
      id: "cm-2",
      user: "Chukwudi Nwachukwu",
      text: "Audio and screen share are crystal clear, sir!",
      time: "4:03 PM"
    },
    {
      id: "cm-3",
      user: "Amina Yusuf",
      text: "Question: Will server actions work with React 19 useActionState hook?",
      time: "4:05 PM"
    }
  ]);
  const [newChatText, setNewChatText] = useState("");

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        id: `cm-${Date.now()}`,
        user: "You (Cohort Trainee)",
        text: newChatText.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setNewChatText("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-light/30">
      <Navbar />
      <div className="max-w-7xl mx-auto w-full flex-1 py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-brand-navy via-brand-dark to-purple-900 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping mr-1" />
              <span>BEMS Live Studio • Physical & Virtual Hybrid</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
              Live Classroom Broadcasts & Clinics
            </h1>
            <p className="text-sm md:text-base text-purple-100/90 leading-relaxed">
              Connect directly with BEMS faculty broadcasting live from Tech Lab 1 (Umuahia) and interactive Zoom rooms. Ask questions, raise your hand, and build production projects together.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href={activeClass.zoomJoinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-brand-purple hover:bg-purple-600 text-white shadow-lg transition-transform hover:-translate-y-0.5"
            >
              <Video className="w-4 h-4" />
              <span>Launch Zoom Video Room</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        </div>

        {/* Main Broadcasting Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player & Class Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-brand-navy rounded-2xl overflow-hidden shadow-xl border border-gray-800">
              {/* Video Frame */}
              <div className="relative aspect-video bg-black flex items-center justify-center">
                {activeClass.status === "LIVE_NOW" ? (
                  <video
                    src={activeClass.streamVideoUrl}
                    controls
                    autoPlay
                    muted
                    loop
                    className="w-full h-full object-cover"
                  />
                ) : activeClass.status === "RECORDED" && activeClass.recordingUrl ? (
                  <video
                    src={activeClass.recordingUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-8 space-y-4">
                    <Clock className="w-12 h-12 text-brand-purple mx-auto animate-pulse" />
                    <div>
                      <h3 className="text-lg font-bold text-white">Broadcast Starts {activeClass.startTime}</h3>
                      <p className="text-xs text-gray-400 mt-1">Instructor will go live from BEMS Tech Lab 1</p>
                    </div>
                  </div>
                )}

                {/* Badge Overlay */}
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  {activeClass.status === "LIVE_NOW" ? (
                    <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span>ON AIR</span>
                    </span>
                  ) : activeClass.status === "UPCOMING" ? (
                    <span className="px-3 py-1 rounded-full bg-amber-500/90 text-white text-xs font-bold uppercase">
                      UPCOMING
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold uppercase flex items-center space-x-1">
                      <PlayCircle className="w-3.5 h-3.5 mr-1" />
                      <span>RECORDING</span>
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{activeClass.currentAttendees} watching</span>
                  </span>
                </div>
              </div>

              {/* Broadcast Meta bar */}
              <div className="p-6 bg-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-xs font-bold text-brand-purple uppercase tracking-wider">
                      {activeClass.courseTitle}
                    </span>
                    <h2 className="text-xl font-black text-brand-dark mt-1">{activeClass.title}</h2>
                    <p className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-brand-purple" />
                      <span>{activeClass.location}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => setRaisedHand(!raisedHand)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shrink-0 ${
                      raisedHand
                        ? "bg-amber-500 text-white shadow-md animate-bounce"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <Hand className="w-4 h-4" />
                    <span>{raisedHand ? "Hand Raised (Notified)" : "Raise Hand to Speak"}</span>
                  </button>
                </div>

                {/* Session Agenda */}
                <div>
                  <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">
                    Live Session Agenda & Learning Objectives
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {activeClass.agenda.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-brand-lavender/30 border border-brand-purple/10 text-xs text-brand-dark flex items-start space-x-2"
                      >
                        <CheckCircle className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Other Classes & Archives */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4">
              <h3 className="font-bold text-brand-dark text-base flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-brand-purple" />
                <span>All Scheduled Sessions & Recordings</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockLiveClasses.map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => setActiveClass(cls)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      activeClass.id === cls.id
                        ? "border-brand-purple bg-brand-purple/5 shadow-sm"
                        : "border-gray-200 hover:border-brand-purple/30 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cls.status === "LIVE_NOW"
                              ? "bg-red-100 text-red-700"
                              : cls.status === "UPCOMING"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {cls.status === "LIVE_NOW" ? "LIVE NOW" : cls.status === "UPCOMING" ? "UPCOMING" : "RECORDING"}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">{cls.duration}</span>
                      </div>
                      <h4 className="text-sm font-bold text-brand-dark mt-2 line-clamp-1">{cls.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{cls.instructor}</p>
                    </div>

                    <div className="text-[11px] text-brand-purple font-semibold flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{cls.startTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Chat & Classroom Q&A */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200/80 shadow-sm flex flex-col h-[650px] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-brand-purple" />
                <h3 className="text-sm font-bold text-brand-dark">Live Q&A Chat</h3>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl text-xs space-y-1 ${
                    msg.isInstructor
                      ? "bg-purple-50 border border-brand-purple/20 text-brand-dark"
                      : "bg-gray-50 border border-gray-100 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${msg.isInstructor ? "text-brand-purple" : "text-brand-navy"}`}>
                      {msg.user} {msg.isInstructor && "(Instructor)"}
                    </span>
                    <span className="text-[10px] text-gray-400">{msg.time}</span>
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-gray-100 flex items-center space-x-2">
              <input
                type="text"
                value={newChatText}
                onChange={(e) => setNewChatText(e.target.value)}
                placeholder="Ask instructor a question..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-brand-purple hover:bg-purple-700 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
