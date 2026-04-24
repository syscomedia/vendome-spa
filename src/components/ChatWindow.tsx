'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Loader2, MessageCircle, CheckCheck } from 'lucide-react';

interface Message {
    id: number;
    content: string;
    created_at: string;
    is_read: boolean;
    sender_id: number;
    sender_name: string;
    sender_image?: string;
    sender_role: string;
}

interface ChatWindowProps {
    currentUserId: number;
    currentUserRole: string;
    currentUserName: string;
    otherUserId: number;
    otherUserName: string;
    otherUserImage?: string;
    adminId: number;
    onClose: () => void;
    onUnreadChange?: (count: number) => void;
    styles: any;
}

export default function ChatWindow({
    currentUserId, currentUserRole, currentUserName,
    otherUserId, otherUserName, otherUserImage,
    adminId, onClose, onUnreadChange, styles
}: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    const clientId = currentUserRole === 'admin' ? otherUserId : currentUserId;
    const lastMessageIdRef = useRef<number>(0);

    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch(`/api/chat/messages?userId=${clientId}&adminId=${adminId}`);
            const data = await res.json();
            if (data.messages) {
                setMessages(data.messages);
                if (data.messages.length > 0) {
                    lastMessageIdRef.current = data.messages[data.messages.length - 1].id;
                }
            }
        } catch {}
        setLoading(false);
    }, [clientId, adminId]);

    const markAsRead = useCallback(() => {
        fetch('/api/chat/messages', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ readerId: currentUserId, clientId }),
        }).then(() => {
            if (onUnreadChange) onUnreadChange(0);
        });
    }, [currentUserId, clientId, onUnreadChange]);

    useEffect(() => {
        fetchMessages();
        inputRef.current?.focus();
        markAsRead();
    }, [fetchMessages, markAsRead]);

    // SSE connection for real-time messages
    useEffect(() => {
        const role = currentUserRole === 'admin' ? 'admin' : 'client';
        let es: EventSource;
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
        let closed = false;

        const connect = () => {
            if (closed) return;
            es = new EventSource(`/api/chat/sse?userId=${currentUserId}&role=${role}`);
            eventSourceRef.current = es;

            es.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);
                    if (data.type === 'new_message') {
                        const msg: Message = data.message;
                        const fromOther = msg.sender_id === otherUserId;
                        // Only add messages FROM the other person — own messages handled by optimistic UI
                        if (fromOther) {
                            setMessages(prev => {
                                if (prev.find(m => m.id === msg.id)) return prev;
                                lastMessageIdRef.current = msg.id;
                                return [...prev, msg];
                            });
                            // Mark as read since we received it while the window is open
                            fetch('/api/chat/messages', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ readerId: currentUserId, clientId }),
                            });
                            if (onUnreadChange) onUnreadChange(0);
                        }
                    } else if (data.type === 'messages_read') {
                        // The client has read our messages — flip all our sent messages to is_read=true
                        const readClientId = data.clientId;
                        if (readClientId === clientId || readClientId === otherUserId || readClientId === currentUserId) {
                            setMessages(prev => prev.map(m =>
                                m.sender_id === currentUserId ? { ...m, is_read: true } : m
                            ));
                        }
                    }
                } catch {}
            };

            es.onerror = () => {
                es.close();
                if (!closed) {
                    reconnectTimer = setTimeout(connect, 3000);
                }
            };
        };

        connect();

        return () => {
            closed = true;
            if (reconnectTimer) clearTimeout(reconnectTimer);
            eventSourceRef.current?.close();
        };
    }, [currentUserId, currentUserRole, otherUserId, onUnreadChange]);

    // Polling fallback: re-fetch messages every 5s to catch anything SSE missed
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/chat/messages?userId=${clientId}&adminId=${adminId}`);
                const data = await res.json();
                if (data.messages) {
                    setMessages(prev => {
                        // Keep any optimistic messages (large temp IDs) that aren't yet confirmed
                        const optimistics = prev.filter(m => !data.messages.find((s: Message) => s.id === m.id) && m.id > 1e10);
                        return [...data.messages, ...optimistics];
                    });
                }
            } catch {}
        }, 5000);
        return () => clearInterval(interval);
    }, [clientId, adminId]);

    // Scroll to bottom on new messages or when chat first loads
    useEffect(() => {
        if (!loading) {
            bottomRef.current?.scrollIntoView({ behavior: messages.length > 1 ? 'smooth' : 'instant' });
        }
    }, [messages, loading]);

    const send = async () => {
        if (!input.trim() || sending) return;
        const content = input.trim();
        setInput('');
        setSending(true);

        // Optimistic UI
        const optimistic: Message = {
            id: Date.now(),
            content,
            created_at: new Date().toISOString(),
            is_read: false,
            sender_id: currentUserId,
            sender_name: currentUserName,
            sender_role: currentUserRole,
        };
        setMessages(prev => [...prev, optimistic]);

        try {
            const res = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: currentUserId,
                    receiverId: otherUserId,
                    content,
                }),
            });
            const data = await res.json();
            if (data.message) {
                // Replace optimistic with real
                setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...data.message } : m));
            }
        } catch {
            // Remove optimistic on error
            setMessages(prev => prev.filter(m => m.id !== optimistic.id));
            setInput(content);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
        if (d.toDateString() === yesterday.toDateString()) return 'Hier';
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    };

    // Group messages by date
    const grouped: { date: string; msgs: Message[] }[] = [];
    messages.forEach(msg => {
        const date = formatDate(msg.created_at);
        const last = grouped[grouped.length - 1];
        if (last && last.date === date) last.msgs.push(msg);
        else grouped.push({ date, msgs: [msg] });
    });

    return (
        <motion.div
            className={styles.chatWindow}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25 }}
        >
            {/* Header */}
            <div className={styles.chatHeader}>
                <div className={styles.chatHeaderAvatar}>
                    {otherUserImage
                        ? <img src={otherUserImage} alt={otherUserName} />
                        : <span>{otherUserName?.[0]?.toUpperCase()}</span>
                    }
                    <span className={styles.chatOnlineDot} />
                </div>
                <div className={styles.chatHeaderInfo}>
                    <span className={styles.chatHeaderName}>{otherUserName}</span>
                    <span className={styles.chatHeaderStatus}>En ligne</span>
                </div>
                <button className={styles.chatCloseBtn} onClick={onClose}><X size={18} /></button>
            </div>

            {/* Messages */}
            <div className={styles.chatBody}>
                {loading ? (
                    <div className={styles.chatLoading}><Loader2 size={24} className="animate-spin" /></div>
                ) : messages.length === 0 ? (
                    <div className={styles.chatEmpty}>
                        <MessageCircle size={36} />
                        <p>Démarrez la conversation</p>
                    </div>
                ) : (
                    grouped.map(group => (
                        <div key={group.date}>
                            <div className={styles.chatDateSep}>
                                <span>{group.date}</span>
                            </div>
                            {group.msgs.map(msg => {
                                const isMine = msg.sender_id === currentUserId;
                                return (
                                    <div key={msg.id} className={`${styles.chatMsgRow} ${isMine ? styles.chatMsgRowMine : ''}`}>
                                        {!isMine && (
                                            <div className={styles.chatMsgAvatar}>
                                                {otherUserImage
                                                    ? <img src={otherUserImage} alt="" />
                                                    : <span>{otherUserName?.[0]?.toUpperCase()}</span>
                                                }
                                            </div>
                                        )}
                                        <div className={`${styles.chatBubble} ${isMine ? styles.chatBubbleMine : styles.chatBubbleOther}`}>
                                            <p>{msg.content}</p>
                                            <div className={styles.chatBubbleMeta}>
                                                <span>{formatTime(msg.created_at)}</span>
                                                {isMine && <CheckCheck size={12} className={msg.is_read ? styles.chatReadIcon : styles.chatSentIcon} />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className={styles.chatInputBar}>
                <input
                    ref={inputRef}
                    className={styles.chatInput}
                    placeholder="Écrire un message..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                />
                <button
                    className={styles.chatSendBtn}
                    onClick={send}
                    disabled={!input.trim() || sending}
                >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </div>
        </motion.div>
    );
}
