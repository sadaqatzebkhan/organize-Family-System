// Notification and Sound Service for Mazid Khail Family Portal

const NOTIF_PREF_KEY = 'mzk_family_notifications_enabled';

// Play a pleasant chime tone using Web Audio API
export function playNotificationTone() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Smooth dual tone (chime)
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.2); // D6

    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.05);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
  } catch (e) {
    // Audio might be blocked until first user interaction, ignore
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPreference(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem(NOTIF_PREF_KEY);
  // Default is true (ON) as requested by user
  return saved === null ? true : saved === 'true';
}

export function setNotificationPreference(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIF_PREF_KEY, String(enabled));
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    return 'denied';
  }
}

export function triggerMessageNotification(sender: string, text: string) {
  const isEnabled = getNotificationPreference();
  if (!isEnabled) return;

  // 1. Play Soft Audio Chime
  playNotificationTone();

  // 2. Mobile Vibration (if supported on Android/PWA)
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([150, 80, 150]);
    } catch (e) {
      // ignore vibration errors
    }
  }

  // 3. System Push Notification (Mobile Status Bar / Browser)
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const notif = new Notification(`Family Chat — ${sender}`, {
        body: text.length > 80 ? text.slice(0, 80) + '...' : text,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'mzk-family-message',
      });
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (e) {
      // In some mobile browsers, service worker registration is required for notifications
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(`Family Chat — ${sender}`, {
            body: text,
            icon: '/icon-192.png',
            tag: 'mzk-family-message',
          });
        }).catch(() => {});
      }
    }
  }
}
