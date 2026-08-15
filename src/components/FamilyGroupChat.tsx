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
  Sparkles,
  RefreshCw,
  Users,
  Clock,
  X,
  ArrowRight,
  Maximize2,
} from 'lucide-react';
import { ChatMessage, FamilyBranch } from '../types';
import { api } from '../services/api';
import {
  getNotificationPreference,
  setNotificationPreference,
  isNotificationSupported,
  requestNotificationPermission,
  triggerMessageNotification,
  playNotificationTone,
} from '../lib/notificationService';

interface FamilyGroupChatProps {
  branches?: FamilyBranch[];
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  onOpenChatPage?: () => void;
}

export const FamilyGroupChat: React.FC<FamilyGroupChatProps> = ({
  branches = [],
  isAdmin = false,
  onOpenAdminLogin,
  onOpenChatPage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state - simplified strictly by name as requested
  const [senderName, setSenderName] = useState(() => {
    return localStorage.getItem('mzk_chat_sender_name') || '';
  });
  const [messageText, setMessageText] = useState('');
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Notifications state
  const [notificationsEnabled, setNotificationsEnabled] = useState(getNotificationPreference());
  const [permState, setPermState] = useState<NotificationPermission>(() => {
    return isNotificationSupported() ? Notification.permission : 'denied';
  });
  const [showPermPrompt, setShowPermPrompt] = useState(false);

  // Copied message state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Reference for previous messages count to detect newly arrived messages
  const lastKnownMessageIdRef = useRef<string | null>(null);
  const isFirstLoadRef = useRef(true);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Check notification permission on mount
  useEffect(() => {
    if (isNotificationSupported()) {
      setPermState(Notification.permission);
      if (Notification.permission === 'default') {
        setShowPermPrompt(true);
      }
    }
  }, []);

  // Fetch messages from server
  const fetchMessages = async (isManual = false) => {
    try {
      const list = await api.getMessages();
      
      // Sort messages: pinned first, then chronological
      const sorted = [...list].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });

      // Detect if a brand new message arrived from another user
      if (!isFirstLoadRef.current && list.length > 0) {
        const newest = list[list.length - 1];
        if (lastKnownMessageIdRef.current && newest.id !== lastKnownMessageIdRef.current) {
          // Check if sender is not current user
          if (newest.senderName !== senderName) {
            triggerMessageNotification(newest.senderName, newest.text);
          }
        }
      }

      if (list.length > 0) {
        lastKnownMessageIdRef.current = list[list.length - 1].id;
      }
      isFirstLoadRef.current = false;
      setMessages(sorted);
    } catch (e) {
      console.error('Failed to load messages:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load + Real-time Polling every 4 seconds
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages();
    }, 4000);
    return () => clearInterval(interval);
  }, [senderName]);

  // Scroll to bottom when modal opens or new messages arrive
  useEffect(() => {
    if (isModalOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [isModalOpen, messages]);

  // Toggle Notification Preference
  const handleToggleNotifications = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!notificationsEnabled) {
      setNotificationPreference(true);
      setNotificationsEnabled(true);

      if (isNotificationSupported() && Notification.permission !== 'granted') {
        const p = await requestNotificationPermission();
        setPermState(p);
      }
      playNotificationTone();
      setStatusFeedback('نوٹیفکیشنز آن کر دی گئی ہیں۔ (Notifications Enabled)');
      setTimeout(() => setStatusFeedback(null), 3000);
    } else {
      setNotificationPreference(false);
      setNotificationsEnabled(false);
      setStatusFeedback('نوٹیفکیشنز بند کر دی گئی ہیں۔ (Notifications Muted)');
      setTimeout(() => setStatusFeedback(null), 3000);
    }
  };

  const handleRequestPermissionBanner = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const p = await requestNotificationPermission();
    setPermState(p);
    setShowPermPrompt(false);
    if (p === 'granted') {
      setNotificationPreference(true);
      setNotificationsEnabled(true);
      playNotificationTone();
    }
  };

  // Send Message - only by Name and Text as requested
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim()) {
      setStatusFeedback('براہ کرم اپنا نام درج کریں۔ (Please enter your name)');
      return;
    }
    if (!messageText.trim()) {
      return;
    }

    setIsSending(true);
    setStatusFeedback(null);

    // Auto-save name in localStorage for instant convenience
    localStorage.setItem('mzk_chat_sender_name', senderName.trim());

    try {
      await api.sendMessage(senderName, messageText);
      setMessageText('');
      await fetchMessages();

      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 100);
    } catch (e: any) {
      setStatusFeedback('میسج بھیجنے میں مسئلہ: ' + (e.message || 'Error'));
    } finally {
      setIsSending(false);
    }
  };

  // Quick Preset Messages
  const handleQuickInsert = (text: string) => {
    setMessageText((prev) => (prev ? prev + ' ' + text : text));
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

  // Delete message
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('کیا آپ واقعی یہ پیغام ڈیلیٹ کرنا چاہتے ہیں؟')) return;
    try {
      await api.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setStatusFeedback('پیغام ڈیلیٹ کر دیا گیا۔');
      setTimeout(() => setStatusFeedback(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Pin message
  const handleTogglePin = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.togglePinMessage(id);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, pinned: res.pinned } : m))
      );
      fetchMessages();
    } catch (e) {
      console.error(e);
    }
  };

  // Copy message text
  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Time formatter
  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'ابھی (Just now)';
      if (diffMins < 60) return `${diffMins} منٹ پہلے`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} گھنٹے پہلے`;

      return d.toLocaleDateString('ur-PK', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. HOMEPAGE COMPACT BANNER (Matches user uploaded image layout)           */}
      {/* ========================================================================= */}
      <div className="bg-white border-2 border-amber-900/20 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4 text-[#1a1a1a]">
        
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="label-caps text-[#c2410c] text-[11px] sm:text-xs font-bold tracking-wider">
            LIVE FAMILY COMMUNITY
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            لائیو چیٹ اور اعلانات
          </span>
        </div>

        {/* Title and Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] text-white flex items-center justify-center shadow-md shrink-0">
              <MessageSquare className="w-6 h-6 text-[#c2410c]" />
            </div>
            <div>
              <h2 className="serif text-xl sm:text-2xl font-bold text-[#1a1a1a] leading-snug">
                خاندانی گروپ میسجز اور نوٹس بورڈ
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                کل پیغامات: <strong className="text-gray-800 font-bold">{messages.length}</strong>
                {lastMessage && ` • آخری پیغام: ${lastMessage.senderName} (${formatTime(lastMessage.timestamp)})`}
              </p>
            </div>
          </div>

          {/* Action Buttons: Notification Switch & Open Chat Button */}
          <div className="flex items-center gap-2.5 flex-wrap">
            
            {/* Notification Toggle Button */}
            <button
              onClick={handleToggleNotifications}
              id="family-chat-notification-toggle"
              title={notificationsEnabled ? 'نوٹیفکیشنز آن ہیں (Click to mute)' : 'نوٹیفکیشنز بند ہیں (Click to enable)'}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                notificationsEnabled
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300'
              }`}
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="w-4 h-4 text-[#c2410c]" />
                  <span>(Active) نوٹیفکیشن: آن</span>
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4 text-gray-500" />
                  <span>(Muted) نوٹیفکیشن: آف</span>
                </>
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => fetchMessages(true)}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 text-xs transition-colors"
              title="میسجز ریفریش کریں"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>

            {/* Open Group Chat Page Button */}
            <button
              onClick={() => {
                if (onOpenChatPage) {
                  onOpenChatPage();
                } else {
                  setIsModalOpen(true);
                }
              }}
              id="open-family-group-chat-modal-btn"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-bold transition-all shadow-md active:scale-98"
            >
              <span>Open Family Chat</span>
              <ArrowRight className="w-4 h-4 text-[#c2410c]" />
            </button>
          </div>
        </div>

        {/* Mobile Notification Permission Banner */}
        {showPermPrompt && permState === 'default' && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#c2410c] shrink-0" />
              <span>موبائل پر میسج الرٹ حاصل کرنے کے لیے نوٹیفکیشن کی اجازت دیں۔</span>
            </div>
            <button
              onClick={handleRequestPermissionBanner}
              className="px-3 py-1 bg-[#c2410c] hover:bg-[#ea580c] text-white font-bold rounded-lg text-xs shrink-0 shadow-2xs"
            >
              اجازت دیں (Allow)
            </button>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 2. FULL MODAL: FAMILY CHAT STREAM & SENDER FORM (Opens upon click)        */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-gray-300 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-[#1a1a1a]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-200 bg-[#fcfaf7] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] text-white flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-5 h-5 text-[#c2410c]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="serif text-lg sm:text-xl font-bold text-[#1a1a1a]">
                      خاندانی گروپ چیٹ و پیغامات
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                      {messages.length} پیغامات
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    یہاں موجود تمام پیغامات ہر فیملی ممبر کو نظر آتے ہیں۔
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-gray-500 hover:text-black hover:bg-gray-200 transition-colors"
                title="بند کریں"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification & Status bar inside Modal */}
            {statusFeedback && (
              <div className="p-2.5 bg-emerald-50 text-emerald-900 border-b border-emerald-200 text-xs font-semibold flex items-center gap-2 px-4 shrink-0">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{statusFeedback}</span>
              </div>
            )}

            {/* Messages Stream Scroll Area */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#fcfaf7] space-y-3.5 divide-y divide-gray-200/60 min-h-[220px]"
            >
              {isLoading ? (
                <div className="py-16 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#c2410c]" />
                  <span>پیغامات لوڈ ہو رہے ہیں...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="py-16 text-center text-xs text-gray-500 space-y-2">
                  <Users className="w-10 h-10 mx-auto text-gray-400 opacity-60" />
                  <p className="font-bold text-[#1a1a1a] text-sm">ابھی تک کوئی پیغام موجود نہیں ہے۔</p>
                  <p className="text-xs">سب سے پہلا پیغام بھیج کر خاندانی گفتگو کا آغاز کریں!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isPinned = msg.pinned;
                  const isSelf = senderName && msg.senderName.trim().toLowerCase() === senderName.trim().toLowerCase();

                  return (
                    <div
                      key={msg.id}
                      className={`pt-3.5 first:pt-0 transition-all ${
                        isPinned ? 'bg-amber-100/70 -mx-2 px-3 py-3 rounded-xl border border-amber-300/80 my-1 shadow-2xs' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        
                        {/* Sender Avatar & Info */}
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center serif font-bold text-xs shrink-0 shadow-2xs ${
                            isPinned 
                              ? 'bg-[#1a1a1a] text-amber-300' 
                              : 'bg-amber-100 border border-amber-300 text-[#c2410c]'
                          }`}>
                            {msg.senderName ? msg.senderName.charAt(0).toUpperCase() : 'M'}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs sm:text-sm text-[#1a1a1a]">
                                {msg.senderName}
                              </span>

                              {isPinned && (
                                <span className="flex items-center gap-0.5 text-[9px] font-bold bg-[#c2410c] text-white px-1.5 py-0.2 rounded-full shadow-2xs">
                                  <Pin className="w-2.5 h-2.5 fill-current" />
                                  <span>پن شدہ اعلان</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span>{formatTime(msg.timestamp)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions (Like, Pin, Copy, Delete) */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Copy */}
                          <button
                            onClick={(e) => handleCopy(msg.text, msg.id, e)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                            title="کاپی کریں"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Share2 className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Like */}
                          <button
                            onClick={(e) => handleLike(msg.id, e)}
                            className="flex items-center gap-1 px-1.5 py-1 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 text-xs transition-colors"
                            title="پسند کریں"
                          >
                            <Heart className={`w-3.5 h-3.5 ${msg.likes ? 'text-red-500 fill-red-500' : ''}`} />
                            {msg.likes ? <span className="text-[10px] font-bold">{msg.likes}</span> : null}
                          </button>

                          {/* Admin Pin Toggle */}
                          {isAdmin && (
                            <button
                              onClick={(e) => handleTogglePin(msg.id, e)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isPinned ? 'text-amber-700 bg-amber-200' : 'text-gray-400 hover:text-gray-700'
                              }`}
                              title={isPinned ? 'Unpin message' : 'Pin message as announcement'}
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete button (Admin or Sender) */}
                          {(isAdmin || isSelf) && (
                            <button
                              onClick={(e) => handleDelete(msg.id, e)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="پیغام ڈیلیٹ کریں"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                      </div>

                      {/* Message Body */}
                      <p className="text-xs sm:text-sm text-gray-800 leading-relaxed pt-2 whitespace-pre-wrap pl-10 pr-2">
                        {msg.text}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Simplified Sender Form (Only Name & Message as requested) */}
            <form onSubmit={handleSendMessage} className="p-4 sm:p-5 bg-white border-t border-gray-200 space-y-3 shrink-0">
              
              {/* Name Input */}
              <div>
                <label className="block text-gray-700 font-bold mb-1 text-xs">
                  آپ کا نام (Your Name) *
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="اپنا نام درج کریں (مثلاً: احمد خان / علی رضا)"
                  className="w-full bg-[#fcfaf7] border border-gray-300 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-[#1a1a1a] focus:outline-none focus:border-[#c2410c]"
                  required
                />
              </div>

              {/* Message Input with Send Button */}
              <div>
                <label className="block text-gray-700 font-bold mb-1 text-xs">
                  پیغام (Message) *
                </label>
                <div className="relative">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="اپنا پیغام، خاندانی اطلاع یا مبارکباد یہاں لکھیں..."
                    rows={2}
                    className="w-full bg-[#fcfaf7] border border-gray-300 rounded-xl p-3 text-xs sm:text-sm text-[#1a1a1a] focus:outline-none focus:border-[#c2410c] resize-none pr-12"
                    required
                  />

                  <button
                    type="submit"
                    disabled={isSending || !messageText.trim()}
                    className="absolute right-2.5 bottom-3.5 p-2 rounded-lg bg-[#c2410c] hover:bg-[#ea580c] disabled:opacity-40 text-white transition-all shadow-md active:scale-95 flex items-center justify-center"
                    title="پیغام بھیجیں (Send Message)"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Preset Message Pills */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] pt-0.5">
                <span className="text-gray-500 font-medium flex items-center gap-1 text-[10px]">
                  <Sparkles className="w-3 h-3 text-[#c2410c]" />
                  فوری:
                </span>
                {[
                  'السلام علیکم و رحمۃ اللہ!',
                  'ماشاءاللہ! شاندار شجرہ نسب تیار ہوا ہے۔',
                  'تمام خاندان کو دلی مبارکباد!',
                ].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => handleQuickInsert(quick)}
                    className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-medium transition-colors"
                  >
                    + {quick}
                  </button>
                ))}
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
};
