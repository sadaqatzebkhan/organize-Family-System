import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Bell,
  BellOff,
  Pin,
  Trash2,
  Heart,
  Share2,
  Check,
  RefreshCw,
  ArrowLeft,
  User,
  Edit2,
  Key,
  ShieldCheck,
  ShieldAlert,
  Ban,
  UserX,
  X,
  AlertCircle,
  Users,
} from 'lucide-react';
import { ChatMessage, FamilyBranch, RestrictedUser } from '../types';
import { api } from '../services/api';
import {
  getNotificationPreference,
  setNotificationPreference,
  isNotificationSupported,
  requestNotificationPermission,
  triggerMessageNotification,
  playNotificationTone,
} from '../lib/notificationService';

// Official Verified Blue Checkmark Badge
export const BlueVerifiedBadge: React.FC<{ size?: string; className?: string }> = ({
  size = 'w-4 h-4',
  className = '',
}) => (
  <span className={`inline-flex items-center align-middle ${className}`} title="Verified Official Account">
    <svg className={`${size} text-[#1d9bf0] shrink-0 fill-current`} viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  </span>
);

interface FamilyChatPageProps {
  branches?: FamilyBranch[];
  isAdmin?: boolean;
  onNavigate: (page: 'home' | 'tree' | 'people' | 'branches' | 'chat' | 'admin') => void;
  onRefreshGlobal?: () => Promise<void> | void;
}

export const FamilyChatPage: React.FC<FamilyChatPageProps> = ({
  isAdmin = false,
  onNavigate,
  onRefreshGlobal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Sender Name & Verification PIN
  const [senderName, setSenderName] = useState(() => {
    return localStorage.getItem('mzk_chat_sender_name') || '';
  });
  const [isEditingName, setIsEditingName] = useState(() => {
    return !localStorage.getItem('mzk_chat_sender_name');
  });

  const [enteredPin, setEnteredPin] = useState(() => {
    return localStorage.getItem('mzk_chat_user_pin') || '';
  });
  const [isVerifiedUser, setIsVerifiedUser] = useState(() => {
    const savedPin = localStorage.getItem('mzk_chat_user_pin');
    return savedPin === '0000000000';
  });

  // Moderator state
  const isModerator = isVerifiedUser || isAdmin;

  // PIN modal state (Always opens empty)
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInputValue, setPinInputValue] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Restricted users management modal state
  const [restrictedUsers, setRestrictedUsers] = useState<RestrictedUser[]>([]);
  const [showRestrictedModal, setShowRestrictedModal] = useState(false);

  // Custom Delete & Restrict Confirmation Modals (Replacing blocked native confirm)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; senderName: string; text: string } | null>(null);
  const [restrictTarget, setRestrictTarget] = useState<string | null>(null);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [isRestrictingUser, setIsRestrictingUser] = useState(false);

  const [messageText, setMessageText] = useState('');
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Notifications state
  const [notificationsEnabled, setNotificationsEnabled] = useState(getNotificationPreference());
  const [permState, setPermState] = useState<NotificationPermission>(() => {
    return isNotificationSupported() ? Notification.permission : 'denied';
  });

  // Copied message state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Reference for messages
  const lastKnownMessageIdRef = useRef<string | null>(null);
  const isFirstLoadRef = useRef(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  // Check notification permission on mount
  useEffect(() => {
    if (isNotificationSupported()) {
      setPermState(Notification.permission);
    }
  }, []);

  // Load restricted users list
  const loadRestrictedUsers = async () => {
    try {
      const list = await api.getRestrictedUsers();
      setRestrictedUsers(list || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isModerator) {
      loadRestrictedUsers();
    }
  }, [isModerator]);

  // Fetch messages from server
  const fetchMessages = async (silent = false) => {
    if (!silent && messages.length === 0) setIsLoading(true);
    try {
      const list = await api.getMessages();

      // Sort messages: pinned first, then chronological
      const sorted = [...list].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });

      // Detect if new message arrived from another user
      if (!isFirstLoadRef.current && list.length > 0) {
        const newest = list[list.length - 1];
        if (lastKnownMessageIdRef.current && newest.id !== lastKnownMessageIdRef.current) {
          if (newest.senderName !== senderName) {
            triggerMessageNotification(newest.senderName, newest.text);
          }
          setTimeout(() => scrollToBottom(true), 150);
        }
      }

      if (list.length > 0) {
        lastKnownMessageIdRef.current = list[list.length - 1].id;
      }

      if (isFirstLoadRef.current) {
        setTimeout(() => scrollToBottom(false), 150);
      }

      isFirstLoadRef.current = false;
      setMessages(sorted);
    } catch (e) {
      console.error('Failed to load messages:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Background Full Refresh on button click (Silent, no popups)
  const handleSilentRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        fetchMessages(true),
        onRefreshGlobal ? onRefreshGlobal() : Promise.resolve(),
        isModerator ? loadRestrictedUsers() : Promise.resolve(),
      ]);
    } catch (err) {
      console.error('Silent refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Real-time Fast Auto-Sync (Every 1.5 seconds) + Focus event
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 1500);

    const handleFocus = () => {
      fetchMessages(true);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [senderName]);

  // Toggle Notification Preference
  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      setNotificationPreference(true);
      setNotificationsEnabled(true);

      if (isNotificationSupported() && Notification.permission !== 'granted') {
        const p = await requestNotificationPermission();
        setPermState(p);
      }
      playNotificationTone();
      setStatusFeedback('Notifications enabled');
      setTimeout(() => setStatusFeedback(null), 2500);
    } else {
      setNotificationPreference(false);
      setNotificationsEnabled(false);
      setStatusFeedback('Notifications muted');
      setTimeout(() => setStatusFeedback(null), 2500);
    }
  };

  // Handle PIN verification
  const handleApplyPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pin = pinInputValue.trim();
    setPinError(null);

    if (pin === '0000000000') {
      const officialName = 'Sadaqat Zeb Khan';
      setSenderName(officialName);
      setIsVerifiedUser(true);
      setEnteredPin('0000000000');
      localStorage.setItem('mzk_chat_sender_name', officialName);
      localStorage.setItem('mzk_chat_user_pin', '0000000000');
      setIsEditingName(false);
      setShowPinModal(false);
      setPinInputValue('');
      setPinError(null);
      setStatusFeedback('Verified as Sadaqat Zeb Khan (Official Account - Privileges Enabled)');
      setTimeout(() => setStatusFeedback(null), 3500);
      loadRestrictedUsers();
    } else if (!pin) {
      setPinError('Please enter a PIN.');
    } else {
      setPinError('Wrong PIN. Please enter the correct PIN.');
    }
  };

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveName = isVerifiedUser ? 'Sadaqat Zeb Khan' : senderName.trim();

    if (!effectiveName) {
      setIsEditingName(true);
      setStatusFeedback('Please enter your name first');
      return;
    }
    if (!messageText.trim()) {
      return;
    }

    setIsSending(true);
    setStatusFeedback(null);

    // Save name in localStorage
    localStorage.setItem('mzk_chat_sender_name', effectiveName);
    setIsEditingName(false);

    try {
      await api.sendMessage(
        effectiveName,
        messageText,
        undefined,
        isVerifiedUser,
        isVerifiedUser ? '0000000000' : enteredPin
      );
      setMessageText('');
      await fetchMessages(true);
      setTimeout(() => scrollToBottom(true), 100);
    } catch (e: any) {
      setStatusFeedback(e.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Like message
  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.likeMessage(id);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, likes: (m.likes || 0) + 1 } : m))
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Prompt Delete Confirmation Modal
  const handleDeleteClick = (id: string, senderNameOfMsg: string, textOfMsg: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget({ id, senderName: senderNameOfMsg, text: textOfMsg });
  };

  // Execute Permanent Delete Message for All Users
  const executeDeleteMessage = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    setIsDeletingMessage(true);

    // Optimistic UI update immediately
    setMessages((prev) => prev.filter((m) => m.id !== targetId));
    setDeleteTarget(null);

    try {
      await api.deleteMessage(targetId, isVerifiedUser ? '0000000000' : enteredPin);
      setStatusFeedback('Message permanently deleted from database for all users.');
      setTimeout(() => setStatusFeedback(null), 2500);
      fetchMessages(true);
    } catch (e: any) {
      console.error('Delete failed:', e);
      setStatusFeedback('Failed to delete: ' + (e.message || 'Error'));
    } finally {
      setIsDeletingMessage(false);
    }
  };

  // Toggle Pin message
  const handleTogglePin = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.togglePinMessage(id, isVerifiedUser ? '0000000000' : enteredPin);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, pinned: res.pinned } : m))
      );
      setStatusFeedback(res.pinned ? 'Message pinned as announcement' : 'Message unpinned');
      setTimeout(() => setStatusFeedback(null), 2000);
      fetchMessages(true);
    } catch (e: any) {
      setStatusFeedback('Failed to pin: ' + (e.message || 'Error'));
    }
  };

  // Prompt Restrict User Modal
  const handleRestrictClick = (targetUserName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (targetUserName.trim().toLowerCase() === 'sadaqat zeb khan') {
      setStatusFeedback('Cannot restrict official administrator.');
      setTimeout(() => setStatusFeedback(null), 2500);
      return;
    }
    setRestrictTarget(targetUserName);
  };

  // Execute Restrict User
  const executeRestrictUser = async () => {
    if (!restrictTarget) return;
    const targetName = restrictTarget;
    setIsRestrictingUser(true);
    setRestrictTarget(null);

    try {
      const res = await api.restrictUser(
        targetName,
        'Restricted by Sadaqat Zeb Khan',
        isVerifiedUser ? '0000000000' : enteredPin
      );
      setRestrictedUsers(res.restrictedUsers || []);
      setStatusFeedback(`User "${targetName}" has been restricted from sending messages.`);
      setTimeout(() => setStatusFeedback(null), 3000);
    } catch (err: any) {
      setStatusFeedback('Failed to restrict: ' + (err.message || 'Error'));
    } finally {
      setIsRestrictingUser(false);
    }
  };

  // Unrestrict / Unban User
  const handleUnrestrictUser = async (targetUserName: string) => {
    try {
      const res = await api.unrestrictUser(targetUserName, isVerifiedUser ? '0000000000' : enteredPin);
      setRestrictedUsers(res.restrictedUsers || []);
      setStatusFeedback(`User "${targetUserName}" restriction lifted.`);
      setTimeout(() => setStatusFeedback(null), 2500);
    } catch (err: any) {
      setStatusFeedback('Failed to unrestrict: ' + (err.message || 'Error'));
    }
  };

  // Copy message text
  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // English Time Formatter
  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;

      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden text-[#1a1a1a]">
      
      {/* ========================================================================= */}
      {/* 1. WHATSAPP-STYLE SINGLE LINE HEADER WITH SINGLE BLUE BADGE               */}
      {/* ========================================================================= */}
      <div className="px-3 sm:px-4 py-2.5 bg-[#f5f2eb] border-b border-gray-300 flex items-center justify-between gap-2 shrink-0 shadow-2xs">
        
        {/* Left Side: Back Arrow + Icon + Single-Line Title with Blue Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => onNavigate('home')}
            id="chat-back-btn"
            className="p-1.5 rounded-full hover:bg-black/5 text-gray-700 transition-colors shrink-0"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5 text-[#c2410c]" />
          </button>

          <div className="w-9 h-9 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            <MessageSquare className="w-4 h-4 text-amber-400" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="font-bold text-sm sm:text-base text-[#1a1a1a] truncate">
                Family Group Chat
              </h1>
              <BlueVerifiedBadge size="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ml-0.5" title="Active"></span>
            </div>
            <p className="text-[11px] text-gray-500 truncate">
              {messages.length} {messages.length === 1 ? 'message' : 'messages'} • For all family members
            </p>
          </div>
        </div>

        {/* Right Side: Notification + Background Refresh */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Notification Toggle */}
          <button
            onClick={handleToggleNotifications}
            id="chat-notification-btn"
            className={`p-2 rounded-full transition-colors ${
              notificationsEnabled
                ? 'text-[#c2410c] hover:bg-amber-100 bg-amber-50'
                : 'text-gray-500 hover:bg-black/5'
            }`}
            title={notificationsEnabled ? 'Notifications: On' : 'Notifications: Off'}
          >
            {notificationsEnabled ? (
              <Bell className="w-4 h-4 fill-current" />
            ) : (
              <BellOff className="w-4 h-4" />
            )}
          </button>

          {/* Background Silent Refresh (No popup, just spins) */}
          <button
            onClick={handleSilentRefresh}
            className="p-2 rounded-full text-gray-600 hover:bg-black/5 transition-colors"
            title="Sync latest data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing || isLoading ? 'animate-spin text-[#c2410c]' : ''}`} />
          </button>
        </div>

      </div>

      {/* Optional feedback banner */}
      {statusFeedback && (
        <div className="py-1 px-3 bg-amber-100 border-b border-amber-300 text-amber-950 text-[11px] font-semibold text-center shrink-0 animate-in fade-in">
          {statusFeedback}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CHAT MESSAGES STREAM (Full Screen Clean Area)                          */}
      {/* ========================================================================= */}
      <div
        className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#efeae2] space-y-2.5"
        style={{
          backgroundImage: 'radial-gradient(#dcd5c9 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-500 text-xs py-12">
            <RefreshCw className="w-5 h-5 animate-spin text-[#c2410c]" />
            <span>Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-gray-600">
            <div className="w-12 h-12 rounded-full bg-white/80 border border-gray-300 flex items-center justify-center text-[#c2410c]">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="font-bold text-sm text-[#1a1a1a]">Welcome to Family Group Chat!</p>
            <p className="text-xs text-gray-500">Send a message to start the conversation.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isPinned = msg.pinned;
            const isSelf =
              senderName &&
              msg.senderName.trim().toLowerCase() === senderName.trim().toLowerCase();
            const isMsgVerified =
              msg.isVerified || msg.senderName.trim().toLowerCase() === 'sadaqat zeb khan';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
              >
                {/* Bubble Container */}
                <div
                  className={`relative max-w-[88%] sm:max-w-[75%] rounded-xl px-3.5 py-2 shadow-2xs text-xs sm:text-sm border transition-all ${
                    isPinned
                      ? 'bg-[#fff9db] border-amber-300 text-gray-900 shadow-xs'
                      : isSelf
                      ? 'bg-[#dcf8c6] border-emerald-300 text-gray-900 rounded-tr-none'
                      : 'bg-white border-gray-200 text-gray-900 rounded-tl-none'
                  }`}
                >
                  {/* Pin Banner */}
                  {isPinned && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#c2410c] mb-1">
                      <Pin className="w-3 h-3 fill-current" />
                      <span>Pinned Announcement</span>
                    </div>
                  )}

                  {/* Header info in bubble */}
                  <div className="flex items-center justify-between gap-3 text-[11px] pb-1 border-b border-black/5 mb-1">
                    
                    {/* Sender Name + Blue Verified Badge */}
                    <div className="flex items-center gap-1 font-bold text-[#c2410c] truncate">
                      <span className="truncate">{msg.senderName}</span>
                      {isMsgVerified && <BlueVerifiedBadge size="w-3.5 h-3.5" />}
                      {isSelf && <span className="font-normal text-gray-500 text-[10px] ml-0.5">(You)</span>}
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
                      {/* Copy */}
                      <button
                        onClick={(e) => handleCopy(msg.text, msg.id, e)}
                        className="hover:text-gray-800"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Share2 className="w-3 h-3" />
                        )}
                      </button>

                      {/* Like */}
                      <button
                        onClick={(e) => handleLike(msg.id, e)}
                        className="hover:text-red-500 flex items-center gap-0.5"
                        title="Like"
                      >
                        <Heart className={`w-3 h-3 ${msg.likes ? 'text-red-500 fill-red-500' : ''}`} />
                        {msg.likes ? <span className="text-[9px] font-bold text-red-500">{msg.likes}</span> : null}
                      </button>

                      {/* Moderator / Sadaqat Zeb Khan Pin Control */}
                      {isModerator && (
                        <button
                          onClick={(e) => handleTogglePin(msg.id, e)}
                          className={isPinned ? 'text-amber-700 font-bold' : 'hover:text-amber-700'}
                          title={isPinned ? 'Unpin announcement' : 'Pin as announcement'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
                        </button>
                      )}

                      {/* Moderator / Sadaqat Zeb Khan Restrict User Control */}
                      {isModerator && !isMsgVerified && !isSelf && (
                        <button
                          onClick={(e) => handleRestrictClick(msg.senderName, e)}
                          className="hover:text-red-700 text-gray-400"
                          title={`Restrict "${msg.senderName}" from chatting`}
                        >
                          <Ban className="w-3.5 h-3.5 text-amber-700" />
                        </button>
                      )}

                      {/* Permanent Delete for All Users (Sadaqat Zeb Khan / Admin can delete any, users delete their own) */}
                      {(isModerator || isSelf) && (
                        <button
                          onClick={(e) => handleDeleteClick(msg.id, msg.senderName, msg.text, e)}
                          className="hover:text-red-600"
                          title={isModerator ? "Permanently delete message for all users" : "Delete your message"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Text */}
                  <p className="leading-relaxed whitespace-pre-wrap text-[#1a1a1a]">
                    {msg.text}
                  </p>

                  {/* Timestamp bottom */}
                  <div className="text-[10px] text-gray-400 text-right font-mono mt-1 pt-0.5">
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ========================================================================= */}
      {/* 3. CLEAN BOTTOM BAR: NAME / VERIFIED BADGE + MESSAGE INPUT                */}
      {/* ========================================================================= */}
      <div className="p-2 sm:p-3 bg-[#f0f2f5] border-t border-gray-300 space-y-2 shrink-0">
        
        {/* Name Bar: Auto-detected or Editable */}
        <div className="flex items-center justify-between gap-2 px-1">
          {isEditingName && !isVerifiedUser ? (
            <div className="flex items-center gap-2 w-full max-w-sm">
              <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
                Your Name:
              </span>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                onBlur={() => {
                  if (senderName.trim()) {
                    localStorage.setItem('mzk_chat_sender_name', senderName.trim());
                    setIsEditingName(false);
                  }
                }}
                placeholder="Enter your name..."
                className="flex-1 bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#c2410c]"
                autoFocus={!senderName}
              />
              {senderName.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('mzk_chat_sender_name', senderName.trim());
                    setIsEditingName(false);
                  }}
                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-md text-[11px] font-bold"
                >
                  Save
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="text-gray-500">Sender:</span>
              
              {/* Sender Name Pill */}
              <div className="font-bold text-gray-900 bg-white px-2.5 py-0.5 rounded-md border border-gray-300 flex items-center gap-1.5 shadow-2xs">
                {isVerifiedUser ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Sadaqat Zeb Khan</span>
                    <BlueVerifiedBadge size="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3 text-[#c2410c]" />
                    <span>{senderName || 'Anonymous'}</span>
                  </>
                )}
              </div>

              {/* Change name or clear verification */}
              <button
                type="button"
                onClick={() => {
                  if (isVerifiedUser) {
                    setIsVerifiedUser(false);
                    setEnteredPin('');
                    localStorage.removeItem('mzk_chat_user_pin');
                    setIsEditingName(true);
                  } else {
                    setIsEditingName(true);
                  }
                }}
                className="text-[#c2410c] hover:underline text-[11px] flex items-center gap-0.5 font-medium"
                title="Change sender name"
              >
                <Edit2 className="w-3 h-3" />
                <span>Change</span>
              </button>

              {/* Quick PIN action */}
              {!isVerifiedUser && (
                <button
                  type="button"
                  onClick={() => {
                    setPinInputValue('');
                    setPinError(null);
                    setShowPinModal(true);
                  }}
                  className="text-blue-600 hover:underline text-[11px] flex items-center gap-1 font-medium ml-1"
                >
                  <Key className="w-3 h-3" />
                  <span>Verify with PIN</span>
                </button>
              )}

              {/* Privileged Moderator Controls: Restricted users management */}
              {isModerator && (
                <button
                  type="button"
                  onClick={() => {
                    loadRestrictedUsers();
                    setShowRestrictedModal(true);
                  }}
                  className="ml-auto text-[11px] bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded flex items-center gap-1 font-semibold"
                  title="Manage Restricted Users"
                >
                  <UserX className="w-3 h-3" />
                  <span>Restricted Users {restrictedUsers.length > 0 ? `(${restrictedUsers.length})` : ''}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message... (Press Enter to send)"
            className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2.5 text-xs sm:text-sm text-[#1a1a1a] focus:outline-none focus:border-[#c2410c] shadow-2xs"
            required
          />

          <button
            type="submit"
            disabled={isSending || !messageText.trim()}
            id="chat-send-btn"
            className="w-10 h-10 rounded-full bg-[#c2410c] hover:bg-[#ea580c] disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0"
            title="Send"
          >
            {isSending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 ml-0.5" />
            )}
          </button>
        </form>

      </div>

      {/* ========================================================================= */}
      {/* 4. PIN VERIFICATION MODAL (Empty Box, Exact Match Validation)            */}
      {/* ========================================================================= */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[#1a1a1a]">Enter Verification PIN</h3>
              </div>
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPinError(null);
                }}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Enter your verification PIN to access the official verified account (<strong>Sadaqat Zeb Khan</strong>) with administrative moderation privileges.
            </p>

            <form onSubmit={handleApplyPin} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-700 block">
                  Verification PIN:
                </label>
                <input
                  type="password"
                  value={pinInputValue}
                  onChange={(e) => {
                    setPinInputValue(e.target.value);
                    if (pinError) setPinError(null);
                  }}
                  placeholder="Enter PIN..."
                  className={`w-full bg-[#fcfaf7] border rounded-lg px-3 py-2 text-sm font-mono text-center tracking-widest text-[#1a1a1a] focus:outline-none ${
                    pinError
                      ? 'border-red-500 focus:border-red-600 bg-red-50/40'
                      : 'border-gray-300 focus:border-blue-600'
                  }`}
                  autoFocus
                />

                {/* Error Message if wrong PIN */}
                {pinError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold pt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setPinError(null);
                  }}
                  className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Verify Account
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. RESTRICTED USERS MANAGEMENT MODAL (For Sadaqat Zeb Khan / Moderator)    */}
      {/* ========================================================================= */}
      {showRestrictedModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[#1a1a1a]">Manage Restricted Users</h3>
              </div>
              <button
                onClick={() => setShowRestrictedModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Users listed below are currently restricted from posting in the Family Group Chat.
            </p>

            <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-lg">
              {restrictedUsers.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500 space-y-1">
                  <Users className="w-6 h-6 mx-auto text-gray-400" />
                  <p>No users are currently restricted.</p>
                </div>
              ) : (
                restrictedUsers.map((user) => (
                  <div key={user.name} className="p-3 flex items-center justify-between gap-3 text-xs bg-white">
                    <div>
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-[10px] text-gray-500">
                        Restricted on {new Date(user.restrictedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleUnrestrictUser(user.name)}
                      className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-xs font-semibold"
                    >
                      Unrestrict
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowRestrictedModal(false)}
                className="px-4 py-1.5 bg-[#1a1a1a] hover:bg-[#333] text-white text-xs font-bold rounded-lg"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PERMANENT DELETE CONFIRMATION MODAL (Reliable, No Browser Popups)     */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1a1a1a]">Permanently Delete Message?</h3>
                <p className="text-[11px] text-gray-500">
                  By <strong className="text-gray-800">{deleteTarget.senderName}</strong>
                </p>
              </div>
            </div>

            {/* Message Preview Box */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 max-h-24 overflow-y-auto italic">
              "{deleteTarget.text}"
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              This message will be <strong>permanently deleted from the database</strong> for all family members. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeletingMessage}
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingMessage}
                onClick={executeDeleteMessage}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
              >
                {isDeletingMessage ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Delete for Everyone</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. RESTRICT USER CONFIRMATION MODAL                                       */}
      {/* ========================================================================= */}
      {restrictTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1a1a1a]">Restrict User from Chat?</h3>
                <p className="text-xs text-amber-900 font-semibold">{restrictTarget}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to prevent <strong>{restrictTarget}</strong> from sending any new messages in the Family Group Chat? You can unrestrict them at any time.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isRestrictingUser}
                onClick={() => setRestrictTarget(null)}
                className="px-3.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRestrictingUser}
                onClick={executeRestrictUser}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
              >
                {isRestrictingUser ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Ban className="w-3.5 h-3.5" />
                )}
                <span>Restrict User</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
