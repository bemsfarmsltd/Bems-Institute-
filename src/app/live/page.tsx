"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Video,
  Users,
  Send,
  Hand,
  ExternalLink,
  Clock,
  Calendar,
  Sparkles,
  PlayCircle,
  MessageCircle,
  Radio,
  CheckCircle2
} from "lucide-react";
import { INITIAL_LIVE_CLASSES } from "@/data/advanced-data";
import { LiveClass } from "@/types/advanced";

export default function LiveClassesPage() {
  const [liveClasses] = useState<LiveClass[]>(INITIAL_LIVE_CLASSES);
  const activeClass = liveClasses.find((c) => c.status === "LIVE_NOW") || liveClasses[0];

  const [handRaised, setHandRaised] = useState(false);
  const [qaInput, setQaInput] = useState("");
  const [qaStream, setQaStream] = useState([
    {
      id: "qa-1",
      sender: "Chinedu Okeke",
      text: "Mr. Victor, how does `flex-shrink: 0` prevent image distortion in row cards?",
      time: "2 mins ago",
      answered: true,
      answer: "Mr. Victor: `flex-shrink: 0` stops flex items from compressing below their intrinsic size when the parent wraps."
    },
    {
      id: "qa-2",
      sender: "Ngozi Eze",
      text: "Is there a difference in performance between media query breakpoints in CSS vs Tailwind?",
      time: "Just now",
      answered: false
    }
  ]);

  const handleSendQa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaInput.trim()) return;

    setQaStream((prev) => [
      ...prev,
      {
        id: `qa-${Date.now()}`,
        sender: "You (Student)",
        text: qaInput,
        time: "Just now",
        answered: false
      }
    ]);
    setQaInput("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      {/* Broadcast Header */}
      <div className="bg-[#18143D] text-white py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black tracking-wider uppercase animate-pulse">
                  <Radio className="w-3.5 h-3.5" /> LIVE STREAMING NOW
                </span>
                <Badge variant="purple">UMUAHIA LAB 1 + ZOOM HYBRID</Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {activeClass.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#A5A0C8] mt-1">
                Instructor: <strong className="text-white">{activeClass.instructor}</strong> ({activeClass.instructorRole}) &middot; {activeClass.location}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={activeClass.zoomJoinUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Button className="bg-[#2D8CFF] hover:bg-[#1E74E0] text-white font-bold text-xs shadow-md">
                  <ExternalLink className="w-4 h-4 mr-1.5" /> Launch Native Zoom App
                </Button>
              </a>
              <Link href="/dashboard">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-xs">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Arena */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Stream & Controls */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl overflow-hidden bg-black shadow-2xl border border-[#E6E1F5] aspect-video relative group">
              <video
                key={activeClass.streamVideoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                poster="/images/hero-classroom.png"
              >
                <source src={activeClass.streamVideoUrl} type="video/mp4" />
                Live video stream is initializing...
              </video>

              {/* Live Overlay Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white text-xs font-bold pointer-events-none">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span>LIVE BROADCAST</span>
                <span className="text-[#A5A0C8] border-l border-white/20 pl-2 ml-1 flex items-center gap-1 font-normal">
                  <Users className="w-3.5 h-3.5" /> {activeClass.currentAttendees} Online
                </span>
              </div>
            </div>

            {/* Interactive Stream Controls Bar */}
            <div className="bg-white rounded-2xl p-5 border border-[#E6E1F5] shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setHandRaised(!handRaised)}
                  variant={handRaised ? "primary" : "outline"}
                  className={`text-xs ${
                    handRaised
                      ? "bg-amber-500 text-[#18143D] border-amber-600 font-bold"
                      : "border-[#D1C9EB]"
                  }`}
                >
                  <Hand className="w-4 h-4 mr-1.5" />
                  {handRaised ? "Hand Raised (Queued #3)" : "Raise Hand to Speak"}
                </Button>

                <a
                  href="https://chat.whatsapp.com/BEMS-FutureSkills-2026"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="outline" className="text-xs text-[#25D366] border-[#25D366]/40 hover:bg-[#25D366]/10">
                    <MessageCircle className="w-4 h-4 mr-1.5" /> WhatsApp Backchannel
                  </Button>
                </a>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#645F80]">
                <Clock className="w-3.5 h-3.5 text-[#7928CA]" /> Session Time: 34:10 / 90:00
              </div>
            </div>

            {/* Class Agenda & Key Links */}
            <div className="bg-white rounded-2xl p-6 border border-[#E6E1F5] shadow-xs space-y-4">
              <h3 className="text-base font-black text-[#18143D]">
                Today&apos;s Live Studio Agenda
              </h3>
              <ul className="space-y-2 text-xs text-[#4A4568]">
                {activeClass.agenda.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Live Studio Q&A Drawer */}
          <div className="bg-white rounded-3xl border border-[#E6E1F5] shadow-xs flex flex-col h-[650px] overflow-hidden">
            <div className="p-4 px-5 bg-[#FAF8FF] border-b border-[#F0EDF9] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#18143D]">
                  Live Studio Q&A & Code Help
                </h3>
                <p className="text-[11px] text-[#645F80]">
                  Questions answered live by Mr. Victor on screen
                </p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>

            {/* Questions stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {qaStream.map((qa) => (
                <div key={qa.id} className="p-3.5 rounded-2xl bg-[#FAF8FF] border border-[#E6E1F5] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#18143D]">{qa.sender}</span>
                    <span className="text-[10px] text-[#8580A3]">{qa.time}</span>
                  </div>
                  <p className="text-[#4A4568]">{qa.text}</p>
                  {qa.answered && (
                    <div className="mt-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
                      <strong className="block text-emerald-950 font-bold">Answered Live:</strong>
                      {qa.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Q&A input form */}
            <form onSubmit={handleSendQa} className="p-3 border-t border-[#F0EDF9] bg-white flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask a technical question to the live room..."
                value={qaInput}
                onChange={(e) => setQaInput(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-[#D1C9EB] text-xs text-[#18143D] focus:outline-hidden"
              />
              <Button type="submit" variant="purple" size="sm" className="px-3.5">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>

        {/* Upcoming Sessions & Recording Archive */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-[#18143D]">
            Upcoming Live Classes & Masterclasses
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {liveClasses.filter((c) => c.status !== "LIVE_NOW").map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-[#E6E1F5] bg-white shadow-xs flex flex-col justify-between hover:border-[#7928CA]/40 transition-all space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant={c.status === "UPCOMING" ? "purple" : "gold"}>
                      {c.status.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-[11px] font-bold text-[#8580A3] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {c.duration}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#18143D] mb-1">
                    {c.title}
                  </h3>
                  <p className="text-xs text-[#645F80]">
                    {c.instructor} &middot; {c.startTime}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F0EDF9] flex items-center justify-between">
                  <span className="text-[11px] text-[#8580A3]">
                    {c.location}
                  </span>
                  <a href={c.zoomJoinUrl} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" className="text-xs">
                      {c.status === "RECORDED" ? "Watch Replay" : "Set Reminder"}
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

