"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Hash,
  Send,
  Code2,
  ThumbsUp,
  MessageCircle,
  Users,
  Search,
  Sparkles,
  Paperclip
} from "lucide-react";
import { COMMUNITY_CHANNELS, INITIAL_COMMUNITY_MESSAGES } from "@/data/advanced-data";
import { CommunityChannel, CommunityMessage } from "@/types/advanced";

export default function CommunityPage() {
  const [channels] = useState<CommunityChannel[]>(COMMUNITY_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>("chan-web-dev");
  const [messages, setMessages] = useState<CommunityMessage[]>(INITIAL_COMMUNITY_MESSAGES);
  const [messageText, setMessageText] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const channelMessages = messages.filter((m) => m.channelId === activeChannelId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !codeSnippet.trim()) return;

    const newMsg: CommunityMessage = {
      id: `msg-${Date.now()}`,
      channelId: activeChannelId,
      senderName: "Chinedu Okeke",
      senderRole: "STUDENT",
      content: messageText,
      codeSnippet: codeSnippet.trim() ? codeSnippet : undefined,
      likes: 0,
      timestamp: "Just now"
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessageText("");
    setCodeSnippet("");
    setShowCodeInput(false);
  };

  const handleLike = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, likes: m.likes + 1 } : m))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-[#18143D] text-white py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="purple">PHASE 5 COMMUNITY & PEER LEARNING</Badge>
              <Badge variant="gold">OCTOBER 2026 COHORT</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              BEMS FutureSkills Community Forum
            </h1>
            <p className="text-xs sm:text-sm text-[#A5A0C8]">
              Collaborate with fellow students, discuss lab code with instructors, and share project wins.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://chat.whatsapp.com/BEMS-FutureSkills-2026"
              target="_blank"
              rel="noreferrer"
            >
              <Button className="bg-[#25D366] hover:bg-[#20bd5a] text-[#18143D] font-bold text-xs shadow-md">
                <MessageCircle className="w-4 h-4 mr-1.5" /> WhatsApp Community Link
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Main Forum Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-white rounded-3xl border border-[#E6E1F5] shadow-xs overflow-hidden h-[700px]">
          {/* Left Channels Sidebar */}
          <div className="p-4 border-r border-[#F0EDF9] bg-[#FAF8FF] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="px-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#645F80]">
                  Cohort Channels
                </span>
              </div>

              <div className="space-y-1">
                {channels.map((chan) => (
                  <button
                    key={chan.id}
                    onClick={() => setActiveChannelId(chan.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      activeChannelId === chan.id
                        ? "bg-[#7928CA] text-white shadow-xs"
                        : "text-[#4A4568] hover:bg-white hover:text-[#18143D]"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Hash className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                      <span className="truncate">{chan.name}</span>
                    </div>
                    {chan.unreadCount ? (
                      <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px]">
                        {chan.unreadCount}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-[#E6E1F5] text-xs space-y-1.5">
              <span className="font-bold text-[#18143D] block">Physical Lab Support</span>
              <p className="text-[11px] text-[#645F80]">
                Umuahia Lab workstations are available weekdays 8 AM - 6 PM.
              </p>
            </div>
          </div>

          {/* Right Message Stream */}
          <div className="lg:col-span-3 flex flex-col justify-between">
            {/* Channel Header */}
            <div className="p-4 px-6 border-b border-[#F0EDF9] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-[#7928CA]" />
                <div>
                  <h3 className="font-black text-sm text-[#18143D]">
                    {activeChannel.name}
                  </h3>
                  <p className="text-[11px] text-[#645F80]">
                    {activeChannel.description}
                  </p>
                </div>
              </div>

              <Badge variant="purple">Channel Active</Badge>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {channelMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#8580A3] space-y-2">
                  <MessageCircle className="w-10 h-10 opacity-30" />
                  <p className="text-xs">No messages yet in this channel. Be the first to start the discussion!</p>
                </div>
              ) : (
                channelMessages.map((msg) => (
                  <div key={msg.id} className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#E6E1F5] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-[#18143D] text-white flex items-center justify-center text-xs font-bold">
                          {msg.senderName.substring(0, 2)}
                        </span>
                        <span className="font-bold text-xs text-[#18143D]">
                          {msg.senderName}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                            msg.senderRole === "INSTRUCTOR"
                              ? "bg-purple-100 text-[#7928CA]"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {msg.senderRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8580A3]">{msg.timestamp}</span>
                    </div>

                    <p className="text-xs text-[#4A4568] leading-relaxed">{msg.content}</p>

                    {msg.codeSnippet && (
                      <div className="bg-[#18143D] text-[#E6E1F5] p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                        <pre>{msg.codeSnippet}</pre>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleLike(msg.id)}
                        className="inline-flex items-center gap-1 text-[11px] text-[#645F80] hover:text-[#7928CA] font-semibold bg-white px-2.5 py-1 rounded-lg border border-[#E6E1F5] transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3 h-3 text-[#7928CA]" />
                        <span>{msg.likes}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Composer */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[#F0EDF9] bg-white space-y-3">
              {showCodeInput && (
                <div>
                  <label className="block text-[11px] font-bold text-[#645F80] mb-1">
                    Attach Code Snippet
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Paste HTML, CSS, or JavaScript code..."
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#D1C9EB] font-mono text-xs text-[#18143D] focus:outline-hidden"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCodeInput(!showCodeInput)}
                  title="Attach code snippet"
                  className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                    showCodeInput
                      ? "bg-[#7928CA] text-white border-[#7928CA]"
                      : "border-[#D1C9EB] text-[#645F80] hover:bg-[#FAF8FF]"
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder={`Message #${activeChannel.name}...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#D1C9EB] text-xs text-[#18143D] focus:border-[#7928CA] focus:outline-hidden"
                />

                <Button type="submit" variant="purple" size="sm" className="px-4">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

