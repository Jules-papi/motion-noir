import React from 'react';
import { 
  Bell, 
  Coins, 
  Calendar, 
  MessageSquare, 
  ShieldCheck, 
  X, 
  CheckCheck 
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onSelectNotification: (notification: AppNotification) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'ppv_unlock':
        return <Coins className="w-3.5 h-3.5 text-amber-300" />;
      case 'event_reminder':
        return <Calendar className="w-3.5 h-3.5 text-stone-300" />;
      case 'chat_message':
        return <MessageSquare className="w-3.5 h-3.5 text-amber-300" />;
      case 'forum_reply':
        return <MessageSquare className="w-3.5 h-3.5 text-stone-300" />;
      case 'kyc':
        return <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-sm bg-[#09090b] h-full shadow-2xl border-l border-white/[0.08] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="font-serif text-lg text-stone-100 font-medium">
              Transmissions & Dispatches
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono tracking-wider bg-[#161512] text-amber-200 border border-amber-600/30 uppercase">
                {unreadCount} unread
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                title="Mark all dispatches read"
                className="p-1.5 text-stone-400 hover:text-stone-200 rounded-xs border border-white/[0.06] hover:border-white/20 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-200 rounded-xs border border-white/[0.06] hover:border-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-xs font-serif italic">
              No incoming dispatches recorded.
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => onSelectNotification(notif)}
                className={`p-4 transition-colors cursor-pointer hover:bg-white/[0.02] flex gap-3.5 ${
                  !notif.isRead ? 'bg-[#121215]/80' : ''
                }`}
              >
                <div className="p-2 rounded-xs bg-[#141417] border border-white/[0.06] shrink-0 h-fit">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="font-serif text-xs text-stone-200 truncate font-medium">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] font-mono text-stone-400 shrink-0">
                      {notif.createdAt}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 font-sans font-light line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 self-center" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-white/[0.08] bg-[#0c0c0e] text-center">
          <p className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
            Confidential Transmission Channel Sealed
          </p>
        </div>
      </div>
    </div>
  );
};
