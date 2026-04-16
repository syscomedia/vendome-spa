'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Loader2, Search, Users } from 'lucide-react';
import ChatWindow from './ChatWindow';

interface Conversation {
    id: number;
    name: string;
    email: string;
    image?: string;
    tier?: string;
    last_message?: string;
    last_at?: string;
    unread_count: number;
}

interface AdminInboxProps {
    adminId: number;
    adminName: string;
    onClose: () => void;
    styles: any;
    initialChatUser?: Conversation | null;
}

const TIER_COLORS: Record<string, string> = {
    Normal: '#9E9E9E', Silver: '#90CAF9', Gold: '#E2B45C',
    Platinum: '#B2EBF2', Diamond: '#CE93D8',
};

export default function AdminInbox({ adminId, adminName, onClose, styles, initialChatUser = null }: AdminInboxProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeChatUser, setActiveChatUser] = useState<Conversation | null>(initialChatUser);
    const [totalUnread, setTotalUnread] = useState(0);
    const eventSourceRef = useRef<EventSource | null>(null);

    const fetchInbox = async () => {
        try {
            const res = await fetch(`/api/chat/messages?inbox=1&adminId=${adminId}`);
            const data = await res.json();
            if (data.conversations) {
                setConversations(data.conversations);
                setTotalUnread(data.conversations.reduce((acc: number, c: Conversation) => acc + Number(c.unread_count || 0), 0));
            }
        } catch {}
        setLoading(false);
    };

    useEffect(() => {
        fetchInbox();

        // SSE for real-time inbox updates
        const es = new EventSource(`/api/chat/sse?userId=${adminId}&role=admin`);
        eventSourceRef.current = es;

        es.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.type === 'new_message') {
                    // Refresh inbox to get updated unread counts and last messages
                    fetchInbox();
                }
            } catch {}
        };
        es.onerror = () => es.close();

        return () => es.close();
    }, [adminId]);

    const filtered = conversations.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    const formatTime = (iso?: string) => {
        if (!iso) return '';
        const d = new Date(iso);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) {
            return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    return (
        <div className={styles.chatOverlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div
                className={styles.adminInbox}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.3 }}
            >
                <AnimatePresence mode="wait">
                    {activeChatUser ? (
                        /* Full chat with a client */
                        <motion.div key="chat" className={styles.adminInboxChat}
                            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}
                        >
                            <button className={styles.adminInboxBackBtn} onClick={() => { setActiveChatUser(null); fetchInbox(); }}>
                                ← Retour à la messagerie
                            </button>
                            <ChatWindow
                                currentUserId={adminId}
                                currentUserRole="admin"
                                currentUserName={adminName}
                                otherUserId={activeChatUser.id}
                                otherUserName={activeChatUser.name}
                                otherUserImage={activeChatUser.image}
                                adminId={adminId}
                                onClose={() => { setActiveChatUser(null); fetchInbox(); }}
                                styles={styles}
                            />
                        </motion.div>
                    ) : (
                        /* Inbox list */
                        <motion.div key="inbox"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        >
                            {/* Header */}
                            <div className={styles.adminInboxHeader}>
                                <div className={styles.adminInboxHeaderLeft}>
                                    <MessageCircle size={20} />
                                    <div>
                                        <h3>Messagerie</h3>
                                        {totalUnread > 0 && (
                                            <span className={styles.adminInboxUnreadBadge}>{totalUnread} non lu{totalUnread > 1 ? 's' : ''}</span>
                                        )}
                                    </div>
                                </div>
                                <button className={styles.chatCloseBtn} onClick={onClose}><X size={18} /></button>
                            </div>

                            {/* Search */}
                            <div className={styles.adminInboxSearch}>
                                <Search size={15} />
                                <input
                                    placeholder="Rechercher un client..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>

                            {/* List */}
                            <div className={styles.adminInboxList}>
                                {loading ? (
                                    <div className={styles.chatLoading}><Loader2 size={24} className="animate-spin" /></div>
                                ) : filtered.length === 0 ? (
                                    <div className={styles.chatEmpty}>
                                        <Users size={36} />
                                        <p>{search ? 'Aucun résultat' : 'Aucune conversation'}</p>
                                    </div>
                                ) : (
                                    filtered.map(conv => {
                                        const tierColor = TIER_COLORS[conv.tier || ''] || TIER_COLORS.Normal;
                                        const unread = Number(conv.unread_count || 0);
                                        return (
                                            <button
                                                key={conv.id}
                                                className={`${styles.adminInboxItem} ${unread > 0 ? styles.adminInboxItemUnread : ''}`}
                                                onClick={() => setActiveChatUser(conv)}
                                            >
                                                <div className={styles.adminInboxAvatar}>
                                                    {conv.image
                                                        ? <img src={conv.image} alt={conv.name} />
                                                        : <span style={{ background: `${tierColor}33`, color: tierColor }}>{conv.name?.[0]?.toUpperCase()}</span>
                                                    }
                                                    {unread > 0 && (
                                                        <span className={styles.adminInboxBadge}>{unread}</span>
                                                    )}
                                                </div>
                                                <div className={styles.adminInboxItemContent}>
                                                    <div className={styles.adminInboxItemTop}>
                                                        <span className={styles.adminInboxItemName}>{conv.name}</span>
                                                        <span className={styles.adminInboxItemTime}>{formatTime(conv.last_at)}</span>
                                                    </div>
                                                    <span className={styles.adminInboxItemPreview}>
                                                        {conv.last_message || 'Pas encore de message'}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
