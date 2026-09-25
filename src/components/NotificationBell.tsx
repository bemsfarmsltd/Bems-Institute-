"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Check, X, ExternalLink } from "lucide-react";
import { mockNotifications } from "@/data/advanced-data";
import { AppNotification } from "@/types/advanced";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);
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

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-brand-dark/70 hover:text-brand-purple hover:bg-brand-lavender/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-brand-purple/10 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 pb-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-brand-dark text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-brand-purple/10 text-brand-purple">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-brand-purple hover:text-brand-navy font-medium flex items-center space-x-1"
              >
                <Check className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                No notifications right now
              </div>
            ) : (
              notifications.map((item) => {
                const content = (
                  <div
                    key={item.id}
                    onClick={() => {
                      markAsRead(item.id);
                      if (item.linkUrl) setIsOpen(false);
                    }}
                    className={`px-4 py-3 hover:bg-brand-lavender/30 transition-colors cursor-pointer flex items-start space-x-3 ${
                      !item.read ? "bg-brand-lavender/10" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-semibold ${!item.read ? "text-brand-dark" : "text-gray-600"}`}>
                          {item.title}
                        </p>
                        <span className="text-[10px] text-gray-400 shrink-0 ml-2">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                      {item.linkUrl && (
                        <div className="mt-1 flex items-center text-[11px] font-medium text-brand-purple">
                          <span>View details</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => clearNotification(item.id, e)}
                      className="text-gray-300 hover:text-gray-500 p-1 rounded-md"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );

                return item.linkUrl ? (
                  <Link key={item.id} href={item.linkUrl} className="block">
                    {content}
                  </Link>
                ) : (
                  <div key={item.id}>{content}</div>
                );
              })
            )}
          </div>

          <div className="px-4 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>BEMS FutureSkills Accelerator</span>
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-brand-purple hover:underline font-medium"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
