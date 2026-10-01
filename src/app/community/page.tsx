"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLMS } from "@/context/LMSContext";
import { apiFetch } from "@/lib/api-client";
import {
  Hash,
  Send,
  Code2,
  ThumbsUp,
  MessageCircle,
  Lock
} from "lucide-react";
import { COMMUNITY_CHANNELS } from "@/data/advanced-data";
import { CommunityChannel, CommunityMessage } from "@/types/advanced";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function CommunityPage() {
  const { user } = useLMS();
  const [channels] = useState<CommunityChannel[]>(COMMUNITY_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>("chan-web-dev");
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [sending, setSending] = useState(false);

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];

  const loadMessages = useCallback(async (channelId: string) => {
    setLoading(true);
    const res = await apiFetch(`/api/community/messages?channelId=${encodeURIComponent(channelId)}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMessages(activeChannelId);
  }, [activeChannelId, loadMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!messageText.trim() && !codeSnippet.trim())) return;

    setSending(true);
    const res = await apiFetch("/api/community/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId: activeChannelId,
        content: messageText,
        codeSnippet: codeSnippet.trim() || undefined
      })
    });
    setSending(false);
    if (!res.ok) return;

    const data = await res.json();
    setMessages((prev) => [...prev, data.message]);
    setMessageText("");
    setCodeSnippet("");
    setShowCodeInput(false);
  };

  const handleLike = async (msgId: string) => {
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, likes: m.likes + 1 } : m)));
    await apiFetch(`/api/community/messages/${msgId}/like`, { method: "POST" }).catch(() => {});
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-[#303654] text-white py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="purple">COMMUNITY &amp; PEER LEARNING</Badge>
              <Badge variant="gold">OCTOBER 2026 COHORT</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              BEMS FutureSkills Community Forum
            </h1>
            <p className="text-xs sm:text-sm text-[#C6BDD3]">
              Collaborate with fellow students, discuss lab code with instructors, and share project wins.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://chat.whatsapp.com/BEMS-FutureSkills-2026"
              target="_blank"
              rel="noreferrer"
            >
              <Button className="bg-[#25D366] hover:bg-[#20bd5a] text-[#303654] font-bold text-xs shadow-md">
                <MessageCircle className="w-4 h-4 mr-1.5" /> WhatsApp Community Link
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Main Forum Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-white rounded-3xl border border-[#F1E2F5] shadow-xs overflow-hidden h-[700px]">
          {/* Left Channels Sidebar */}
          <div className="p-4 border-r border-[#F7EDF9] bg-[#FAF8FF] flex flex-col justify-between">
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
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      activeChannelId === chan.id
                        ? "bg-[#AE54C6] text-white shadow-xs"
                        : "text-[#4A4568] hover:bg-white hover:text-[#303654]"
                    }`}
                  >
                    <Hash className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                    <span className="truncate">{chan.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-[#F1E2F5] text-xs space-y-1.5">
              <span className="font-bold text-[#303654] block">Physical Lab Support</span>
              <p className="text-[11px] text-[#645F80]">
                Umuahia Lab workstations are available weekdays 8 AM - 6 PM.
              </p>
            </div>
          </div>

          {/* Right Message Stream */}
          <div className="lg:col-span-3 flex flex-col justify-between min-h-0">
            {/* Channel Header */}
            <div className="p-4 px-6 border-b border-[#F7EDF9] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-[#AE54C6]" />
                <div>
                  <h3 className="font-black text-sm text-[#303654]">
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
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-[#8580A3]">
                  Loading messages…
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#8580A3] space-y-2">
                  <MessageCircle className="w-10 h-10 opacity-30" />
                  <p className="text-xs">No messages yet in this channel. Be the first to start the discussion!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#F1E2F5] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-[#303654] text-white flex items-center justify-center text-xs font-bold">
                          {msg.senderName.substring(0, 2).toUpperCase()}
                        </span>
                        <span className="font-bold text-xs text-[#303654]">
                          {msg.senderName}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                            msg.senderRole === "INSTRUCTOR" || msg.senderRole === "ADMIN"
                              ? "bg-purple-100 text-[#AE54C6]"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {msg.senderRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8580A3]">{formatTime(msg.createdAt)}</span>
                    </div>

                    <p className="text-xs text-[#4A4568] leading-relaxed">{msg.content}</p>

                    {msg.codeSnippet && (
                      <div className="bg-[#303654] text-[#F1E2F5] p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                        <pre>{msg.codeSnippet}</pre>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleLike(msg.id)}
                        className="inline-flex items-center gap-1 text-[11px] text-[#645F80] hover:text-[#AE54C6] font-semibold bg-white px-2.5 py-1 rounded-lg border border-[#F1E2F5] transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3 h-3 text-[#AE54C6]" />
                        <span>{msg.likes}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Composer */}
            {user ? (
              <form onSubmit={handleSendMessage} className="p-4 border-t border-[#F7EDF9] bg-white space-y-3">
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
                      className="w-full p-2.5 rounded-xl border border-[#E5C8ED] font-mono text-xs text-[#303654] focus:outline-hidden"
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
                        ? "bg-[#AE54C6] text-white border-[#AE54C6]"
                        : "border-[#E5C8ED] text-[#645F80] hover:bg-[#FAF8FF]"
                    }`}
                  >
                    <Code2 className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder={`Message #${activeChannel.name}...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#E5C8ED] text-xs text-[#303654] focus:border-[#AE54C6] focus:outline-hidden"
                  />

                  <Button type="submit" variant="purple" size="sm" className="px-4" disabled={sending}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-4 border-t border-[#F7EDF9] bg-white flex items-center justify-center gap-2 text-xs text-[#645F80] font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>Log in to join the conversation</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
