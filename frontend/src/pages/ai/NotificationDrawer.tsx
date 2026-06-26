import React from 'react';
import type { NotificationItem } from '../../services/aiService';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkRead,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="pointer-events-auto w-screen max-w-md">
          <div className="flex h-full flex-col overflow-y-scroll border-l border-emerald-500/20 bg-slate-950 p-6 shadow-2xl shadow-emerald-500/10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  Notification Center
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400 mt-1">Live security alerts and scan progress logs</p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="flex justify-end py-3 border-b border-slate-900">
                <button
                  onClick={onClearAll}
                  className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  🗑️ Clear All
                </button>
              </div>
            )}

            {/* List */}
            <div className="flex-1 divide-y divide-slate-900 overflow-y-auto py-2">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <span className="text-4xl mb-2">🔔</span>
                  <p className="text-sm">No notifications yet</p>
                  <p className="text-xs text-slate-600 mt-1">System events will appear here in real-time</p>
                </div>
              ) : (
                notifications.map((item) => {
                  let icon = 'ℹ️';

                  if (item.type === 'CRITICAL') {
                    icon = '🚨';
                  } else if (item.type === 'WARNING') {
                    icon = '⚠️';
                  } else if (item.type === 'SUCCESS') {
                    icon = '✅';
                  }

                  return (
                    <div
                      key={item.id}
                      className={`py-4 transition-all ${
                        !item.isRead ? 'bg-emerald-500/[0.02]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg mt-0.5">{icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3
                              className={`text-sm font-medium ${
                                !item.isRead ? 'text-white' : 'text-slate-300'
                              }`}
                            >
                              {item.title}
                            </h3>
                            <span className="text-[10px] text-slate-500 shrink-0">
                              {new Date(item.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {item.message}
                          </p>

                          {!item.isRead && (
                            <button
                              onClick={() => onMarkRead(item.id)}
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors mt-2 cursor-pointer"
                            >
                              ✓ Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
