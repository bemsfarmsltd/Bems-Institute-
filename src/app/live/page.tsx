"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLMS } from "@/context/LMSContext";
import { apiFetch } from "@/lib/api-client";
import {
  Send,
  Hand,
  ExternalLink,
  Clock,
  Calendar,
  MessageCircle,
  Radio,
  Video
} from "lucide-react";
import { LiveClass } from "@/types/advanced";

function formatSchedule(iso: string): string {
  return new Date(iso).toLocaleString([], {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric"
  });
}

export default function LiveClassesPage() {
  const { user } = useLMS();
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [qaInput, setQaInput] = useState("");
  const [qaStream, setQaStream] = useState<{ id: string; sender: string; text: string; time: string }[]>([]);

  useEffect(() => {
    apiFetch("/api/attendance/live")
      .then((res) => (res.ok ? res.json() : { sessions: [] }))
      .then((data) => setLiveClasses(data.sessions || []))
      .catch(() => setLiveClasses([]))
      .finally(() => setLoading(false));
  }, []);

  const activeClass = liveClasses.find((c) => c.status === "LIVE_NOW") || liveClasses[0];
  const upcoming = liveClasses.filter((c) => c.id !== activeClass?.id);

  const handleSendQa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaInput.trim()) return;

    setQaStream((prev) => [
      ...prev,
      {
        id: `qa-${Date.now()}`,
        sender: user?.name ? `${user.name} (${user.role === "INSTRUCTOR" ? "Instructor" : "Student"})` : "You (Student)",
        text: qaInput,
        time: "Just now"
      }
    ]);
    setQaInput("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-sm text-[#645F80]">Loading live classes…</div>
        <Footer />
      </div>
    );
  }

  if (!activeClass) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
        <Navbar />
        <div className="flex-1 max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
          <Video className="w-12 h-12 text-[#D1C9EB] mx-auto" />
          <h1 className="text-2xl font-black text-[#18143D]">No live classes scheduled right now</h1>
          <p className="text-sm text-[#645F80]">
            Check back soon, or ask your instructor in the Community forum when the next session is happening.
          </p>
          <Link href="/community">
            <Button variant="purple" size="sm">Go to Community</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      {/* Broadcast Header */}
      <div className="bg-[#18143D] text-white py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {activeClass.status === "LIVE_NOW" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black tracking-wider uppercase animate-pulse">
                    <Radio className="w-3.5 h-3.5" /> LIVE NOW
                  </span>
                ) : (
                  <Badge variant="gold">UPCOMING</Badge>
                )}
                <Badge variant="purple">{activeClass.courseTitle}</Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {activeClass.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#A5A0C8] mt-1">
                Instructor: <strong className="text-white">{activeClass.instructor}</strong> ({activeClass.instructorRole}) &middot; {formatSchedule(activeClass.scheduledAt)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {activeClass.meetingUrl ? (
                <a href={activeClass.meetingUrl} target="_blank" rel="noreferrer">
                  <Button className="bg-[#2D8CFF] hover:bg-[#1E74E0] text-white font-bold text-xs shadow-md">
                    <ExternalLink className="w-4 h-4 mr-1.5" /> Join via Zoom / Meet
                  </Button>
                </a>
              ) : (
                <Button disabled className="bg-white/10 text-white/60 font-bold text-xs cursor-not-allowed">
                  Meeting link not yet available
                </Button>
              )}
              <Link href="/dashboard">
                <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10 text-xs">
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
          {/* Session Card & Controls */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl overflow-hidden bg-[#18143D] text-white shadow-2xl border border-[#E6E1F5] p-10 flex flex-col items-center justify-center text-center space-y-4">
              <Video className="w-12 h-12 text-[#A5A0C8]" />
              <div>
                <p className="text-sm font-bold">
                  {activeClass.status === "LIVE_NOW" ? "This session is live now" : "This session hasn't started yet"}
                </p>
                <p className="text-xs text-[#A5A0C8] mt-1">
                  Video is hosted on Zoom/Meet — join with the button above to see and hear the class.
                </p>
              </div>
            </div>

            {/* Interactive Controls Bar */}
            <div className="bg-white rounded-2xl p-5 border border-[#E6E1F5] shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setHandRaised(!handRaised)}
                  variant={handRaised ? "primary" : "outline"}
                  className={`text-xs ${handRaised ? "bg-amber-500 text-[#18143D] border-amber-600 font-bold" : "border-[#D1C9EB]"}`}
                >
                  <Hand className="w-4 h-4 mr-1.5" />
                  {handRaised ? "Hand Raised" : "Raise Hand to Speak"}
                </Button>

                <a href="https://chat.whatsapp.com/BEMS-FutureSkills-2026" target="_blank" rel="noreferrer">
                  <Button variant="outline" className="text-xs text-[#25D366] border-[#25D366]/40 hover:bg-[#25D366]/10">
                    <MessageCircle className="w-4 h-4 mr-1.5" /> WhatsApp Backchannel
                  </Button>
                </a>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#645F80]">
                <Clock className="w-3.5 h-3.5 text-[#7928CA]" /> {formatSchedule(activeClass.scheduledAt)}
              </div>
            </div>
          </div>

          {/* Live Studio Q&A Drawer (local to this browser tab, not persisted) */}
          <div className="bg-white rounded-3xl border border-[#E6E1F5] shadow-xs flex flex-col h-[500px] overflow-hidden">
            <div className="p-4 px-5 bg-[#FAF8FF] border-b border-[#F0EDF9] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#18143D]">
                  Live Studio Q&amp;A
                </h3>
                <p className="text-[11px] text-[#645F80]">
                  Post a question for the instructor to see on screen
                </p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {qaStream.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#8580A3] space-y-2">
                  <MessageCircle className="w-8 h-8 opacity-30" />
                  <p>No questions yet — be the first to ask.</p>
                </div>
              ) : (
                qaStream.map((qa) => (
                  <div key={qa.id} className="p-3.5 rounded-2xl bg-[#FAF8FF] border border-[#E6E1F5] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#18143D]">{qa.sender}</span>
                      <span className="text-[10px] text-[#8580A3]">{qa.time}</span>
                    </div>
                    <p className="text-[#4A4568]">{qa.text}</p>
                  </div>
                ))
              )}
            </div>

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

        {/* Upcoming Sessions */}
        {upcoming.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-[#18143D]">
              Upcoming Live Classes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcoming.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl border border-[#E6E1F5] bg-white shadow-xs flex flex-col justify-between hover:border-[#7928CA]/40 transition-all space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant={c.status === "LIVE_NOW" ? "gold" : "purple"}>
                        {c.status.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-[11px] font-bold text-[#8580A3] flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatSchedule(c.scheduledAt)}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-[#18143D] mb-1">{c.title}</h3>
                    <p className="text-xs text-[#645F80]">
                      {c.instructor} &middot; {c.courseTitle}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F0EDF9] flex items-center justify-end">
                    {c.meetingUrl ? (
                      <a href={c.meetingUrl} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="text-xs">Set Reminder</Button>
                      </a>
                    ) : (
                      <span className="text-[11px] text-[#8580A3]">Link not yet available</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
