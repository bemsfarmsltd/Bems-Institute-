"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Check, Video, Award, Flame, CreditCard } from "lucide-react";
import { useLMS } from "@/context/LMSContext";
import { AppNotification } from "@/types/advanced";

export function NotificationBell() {
  const { user, notifications, markNotificationRead, refreshNotifications } = useLMS();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleOpen = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen && user) {
      refreshNotifications();
    }
  };

  const getCategoryIcon = (category: AppNotification["category"]) => {
    switch (category) {
      case "CLASS":
        return <Video className="w-4 h-4 text-purple-600" />;
      case "GRADING":
        return <Award className="w-4 h-4 text-emerald-600" />;
      case "GAMIFICATION":
        return <Flame className="w-4 h-4 text-amber-500" />;
      case "PAYMENT":
        return <CreditCard className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggleOpen}
        aria-label="View notifications"
        className="relative p-2 rounded-xl text-[#18143D] hover:bg-[#FAF8FF] hover:text-[#7928CA] transition-colors border border-[#E6E1F5] cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E6E1F5] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3.5 px-4 bg-[#FAF8FF] border-b border-[#F0EDF9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-[#18143D]">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-[#7928CA] text-white px-2 py-0.2 rounded-full font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markNotificationRead()}
                className="text-[11px] font-bold text-[#7928CA] hover:text-[#581c87] flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="divide-y divide-[#F0EDF9] max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#645F80]">
                No notifications yet. Activity from enrollments, quizzes, and capstone grading will appear here.
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.linkUrl || "/dashboard"}
                  onClick={() => {
                    if (!n.read) markNotificationRead(n.id);
                    setIsOpen(false);
                  }}
                  className={`p-3.5 flex items-start gap-3 transition-colors hover:bg-[#FAF8FF] block ${
                    !n.read ? "bg-purple-50/40" : ""
                  }`}
                >
                  <div className="mt-0.5 p-2 rounded-xl bg-white border border-[#E6E1F5] shadow-xs flex-shrink-0">
                    {getCategoryIcon(n.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold text-[#18143D] truncate">{n.title}</h4>
                      <span className="text-[10px] text-[#8580A3] whitespace-nowrap">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-[#645F80] line-clamp-2 leading-relaxed">{n.message}</p>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="p-2.5 bg-[#FAF8FF] border-t border-[#F0EDF9] text-center">
            <Link
              href={user?.role === "INSTRUCTOR" || user?.role === "ADMIN" ? "/instructor/grading" : "/dashboard"}
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-[#7928CA] hover:text-[#581c87]"
            >
              {user?.role === "INSTRUCTOR" || user?.role === "ADMIN"
                ? "Open Instructor Grading Studio →"
                : "View Full Student Activity Stream →"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

