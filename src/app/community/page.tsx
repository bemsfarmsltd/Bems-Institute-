"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Hash,
  Send,
  Heart,
  Code,
  Share2,
  Users,
  Search,
  Sparkles,
  Info
} from "lucide-react";
import Button from "@/components/ui/button";
import { mockChannels, mockMessages } from "@/data/advanced-data";
import { CommunityChannel, CommunityMessage } from "@/types/advanced";

export default function CommunityPage() {
  const [selectedChannel, setSelectedChannel] = useState<CommunityChannel>(mockChannels[1]);
  const [messages, setMessages] = useState<CommunityMessage[]>(mockMessages);
  const [newMessageText, setNewMessageText] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);

  const channelMessages = messages.filter((m) => m.channelId === selectedChannel.id);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() && !codeSnippet.trim()) return;

    const newMsg: CommunityMessage = {
      id: `msg-${Date.now()}`,
      channelId: selectedChannel.id,
      senderName: "Chukwudi Nwachukwu",
      senderRole: "STUDENT",
      content: newMessageText.trim(),
      codeSnippet: codeSnippet.trim() ? codeSnippet.trim() : undefined,
      likes: 0,
      timestamp: "Just now"
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessageText("");
    setCodeSnippet("");
    setShowCodeInput(false);
  };

  const handleLike = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, likes: m.likes + 1 } : m))
    );
  };

  return (
    <div className="min-h-screen bg-brand-light/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-navy via-brand-dark to-purple-900 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-purple/30 border border-brand-purple/40 text-purple-200 text-xs font-semibold uppercase">
              <Users className="w-3.5 h-3.5" />
              <span>BEMS Peer Network • October 2026 Cohort</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black">Cohort Community & Peer Exchange</h1>
            <p className="text-xs md:text-sm text-purple-100/80">
              Collaborate, debug code snippets, share freelance gigs, and connect with faculty across all accelerator tracks.
            </p>
          </div>
          <div className="text-xs bg-white/10 px-4 py-2.5 rounded-xl border border-white/20 text-purple-100 flex items-center space-x-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>128 Trainees & Instructors Active</span>
          </div>
        </div>

        {/* Community Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[720px]">
          {/* Sidebar Channels */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Campus Hub */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">
                  Campus Hub
                </p>
                <div className="space-y-1">
                  {mockChannels
                    .filter((c) => c.category === "CAMPUS_HUB")
                    .map((channel) => (
                      <button
                        key={channel.id}
                        onClick={() => setSelectedChannel(channel)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                          selectedChannel.id === channel.id
                            ? "bg-brand-purple text-white shadow-xs"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span className="truncate">{channel.name}</span>
                        {channel.unreadCount && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white">
                            {channel.unreadCount}
                          </span>
                        )}
                      </button>
                    ))}
                </div>
              </div>

              {/* Class Tracks */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">
                  Class Tracks
                </p>
                <div className="space-y-1">
                  {mockChannels
                    .filter((c) => c.category === "CLASS_TRACKS")
                    .map((channel) => (
                      <button
                        key={channel.id}
                        onClick={() => setSelectedChannel(channel)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                          selectedChannel.id === channel.id
                            ? "bg-brand-purple text-white shadow-xs"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span className="truncate">{channel.name}</span>
                        {channel.unreadCount && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white">
                            {channel.unreadCount}
                          </span>
                        )}
                      </button>
                    ))}
                </div>
              </div>

              {/* Career & Jobs */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">
                  Career & Gigs
                </p>
                <div className="space-y-1">
                  {mockChannels
                    .filter((c) => c.category === "CAREER")
                    .map((channel) => (
                      <button
                        key={channel.id}
                        onClick={() => setSelectedChannel(channel)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                          selectedChannel.id === channel.id
                            ? "bg-brand-purple text-white shadow-xs"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span className="truncate">{channel.name}</span>
                        {channel.unreadCount && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white">
                            {channel.unreadCount}
                          </span>
                        )}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 text-[11px] text-gray-400">
              BEMS FutureSkills Rules: Be respectful, share reproducible code snippets, and celebrate peer wins!
            </div>
          </div>

          {/* Main Messages Forum */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/80 shadow-sm flex flex-col h-full overflow-hidden">
            {/* Channel Header */}
            <div className="px-6 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-dark flex items-center space-x-1.5">
                  <Hash className="w-4 h-4 text-brand-purple" />
                  <span>{selectedChannel.name}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{selectedChannel.description}</p>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-6 overflow-y-auto space-y-5">
              {channelMessages.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <MessageSquare className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="text-sm font-semibold text-gray-600">No messages in this channel yet</p>
                  <p className="text-xs text-gray-400">Be the first to share an update, question, or project link!</p>
                </div>
              ) : (
                channelMessages.map((msg) => (
                  <div key={msg.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-white ${
                            msg.senderRole === "INSTRUCTOR"
                              ? "bg-brand-purple"
                              : msg.senderRole === "ALUMNI"
                              ? "bg-emerald-600"
                              : "bg-brand-navy"
                          }`}
                        >
                          {msg.senderName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-brand-dark">{msg.senderName}</span>
                          <span
                            className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              msg.senderRole === "INSTRUCTOR"
                                ? "bg-purple-100 text-purple-800"
                                : msg.senderRole === "ALUMNI"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {msg.senderRole}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                    </div>

                    <p className="text-xs md:text-sm text-gray-700 leading-relaxed">{msg.content}</p>

                    {msg.codeSnippet && (
                      <div className="rounded-xl bg-brand-navy p-3 text-white font-mono text-xs overflow-x-auto shadow-inner">
                        <pre>{msg.codeSnippet}</pre>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 pt-1 text-xs text-gray-500">
                      <button
                        onClick={() => handleLike(msg.id)}
                        className="flex items-center space-x-1.5 hover:text-red-500 transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>{msg.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-brand-purple transition-colors">
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Composer */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white space-y-3">
              {showCodeInput && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="font-semibold text-brand-purple">Attach Code Snippet:</span>
                    <button
                      type="button"
                      onClick={() => setShowCodeInput(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    placeholder="// Paste JavaScript, HTML, CSS, or Python code here..."
                    className="w-full p-3 rounded-xl border border-gray-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-purple/30 bg-gray-50"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder={`Post message to ${selectedChannel.name}...`}
                  className="flex-1 px-4 py-2.5 text-xs md:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                />
                <button
                  type="button"
                  onClick={() => setShowCodeInput(!showCodeInput)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    showCodeInput
                      ? "bg-brand-purple/10 border-brand-purple text-brand-purple"
                      : "border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Attach Code"
                >
                  <Code className="w-4 h-4" />
                </button>
                <Button type="submit" variant="purple" className="shrink-0 px-4 py-2.5 text-xs">
                  <Send className="w-3.5 h-3.5 mr-1" />
                  <span>Send</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
