import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_CLIENT_NOTES, GET_DASHBOARD_DATA } from '@/graphql/queries';
import { ADD_CLIENT_NOTE_MUTATION } from '@/graphql/mutations';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User as UserIcon, Calendar, Trash2, PenLine, Sparkles, MessageSquare, ChevronDown, Search, X } from 'lucide-react';
import Swal from 'sweetalert2';

interface NotesTabProps {
    user: any;
    styles: any;
    t: any;
}

function ClientDropdown({ clients, selectedClientId, onSelect }: { clients: any[]; selectedClientId: string | null; onSelect: (id: string | null) => void }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const selected = clients.find((c) => c.id === selectedClientId);
    const filtered = clients.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase())
    );

    const updatePanelPosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const goUp = spaceBelow < 280 && rect.top > spaceBelow;
        setPanelStyle({
            position: 'fixed',
            left: rect.left,
            width: rect.width,
            zIndex: 99999,
            ...(goUp
                ? { bottom: window.innerHeight - rect.top + 6, top: 'auto' }
                : { top: rect.bottom + 6, bottom: 'auto' }),
        });
    };

    const handleToggle = () => {
        if (open) { setOpen(false); return; }
        updatePanelPosition();
        setOpen(true);
    };

    useEffect(() => {
        if (!open) return;
        const close = (e: MouseEvent) => {
            if (!triggerRef.current?.contains(e.target as Node) && !panelRef.current?.contains(e.target as Node))
                setOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => {
            document.removeEventListener('mousedown', close);
        };
    }, [open]);

    useEffect(() => {
        if (open && searchRef.current) searchRef.current.focus();
    }, [open]);

    const panel = (
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={panelRef}
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    style={{
                        ...panelStyle,
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
                        border: '1px solid rgba(223,185,109,0.2)',
                        overflow: 'hidden',
                    }}
                >
                    {/* Search input */}
                    <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F5F1E9', borderRadius: '10px', padding: '8px 12px' }}>
                            <Search size={14} style={{ color: '#999', flexShrink: 0 }} />
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Rechercher un client..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    outline: 'none',
                                    fontSize: '0.85rem',
                                    width: '100%',
                                    color: 'var(--text-main)',
                                    fontFamily: 'inherit',
                                }}
                            />
                            {search && (
                                <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#999' }}>
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Client list */}
                    <div style={{ maxHeight: '220px', overflowY: 'auto', padding: '8px' }}>
                        {filtered.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>Aucun client trouvé</div>
                        ) : (
                            filtered.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => { onSelect(c.id); setSearch(''); setOpen(false); }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: selectedClientId === c.id ? 'rgba(223,185,109,0.1)' : 'transparent',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'background 0.15s',
                                        fontFamily: 'inherit',
                                    }}
                                    onMouseEnter={(e) => { if (selectedClientId !== c.id) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.03)'; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = selectedClientId === c.id ? 'rgba(223,185,109,0.1)' : 'transparent'; }}
                                >
                                    <span style={{
                                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                                        background: selectedClientId === c.id ? 'rgba(223,185,109,0.25)' : '#F5F1E9',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <UserIcon size={14} style={{ color: selectedClientId === c.id ? 'var(--accent)' : '#aaa' }} />
                                    </span>
                                    <span style={{ overflow: 'hidden' }}>
                                        <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: selectedClientId === c.id ? 700 : 500, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email}</span>
                                    </span>
                                    {selectedClientId === c.id && (
                                        <span style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* Trigger button */}
            <button
                ref={triggerRef}
                type="button"
                onClick={handleToggle}
                style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '14px',
                    border: open ? '1.5px solid var(--accent)' : '1.5px solid rgba(0,0,0,0.08)',
                    background: 'var(--bg-cream, #F5F1E9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    color: selected ? 'var(--text-main)' : '#999',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxShadow: open ? '0 0 0 3px rgba(223,185,109,0.15)' : 'none',
                    textAlign: 'left',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    {selected ? (
                        <>
                            <span style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                background: 'rgba(223,185,109,0.2)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <UserIcon size={14} style={{ color: 'var(--accent)' }} />
                            </span>
                            <span style={{ overflow: 'hidden' }}>
                                <span style={{ display: 'block', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selected.name}</span>
                                <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selected.email}</span>
                            </span>
                        </>
                    ) : (
                        <span>--- Choisir un client ---</span>
                    )}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '8px' }}>
                    {selected && (
                        <span
                            role="button"
                            onClick={(e) => { e.stopPropagation(); onSelect(null); setSearch(''); }}
                            style={{ display: 'flex', alignItems: 'center', padding: '2px', borderRadius: '50%', color: '#999' }}
                        >
                            <X size={14} />
                        </span>
                    )}
                    <ChevronDown size={16} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: '#999' }} />
                </span>
            </button>

            {/* Portal: renders outside all overflow:hidden parents */}
            {typeof document !== 'undefined' && createPortal(panel, document.body)}
        </div>
    );
}

export default function NotesTab({ user, styles, t }: NotesTabProps) {
    const [noteContent, setNoteContent] = useState('');
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    
    // For admin, we might want to fetch all notes or notes for a selected client
    const { data, loading, refetch } = useQuery<any>(GET_CLIENT_NOTES, {
        variables: { clientId: user.role === 'admin' ? selectedClientId : user.id },
        fetchPolicy: 'network-only'
    });

    const { data: dashboardData } = useQuery<any>(GET_DASHBOARD_DATA);
    const clients = dashboardData?.clients || [];

    const [addNote, { loading: adding }] = useMutation(ADD_CLIENT_NOTE_MUTATION, {
        onCompleted: () => {
            setNoteContent('');
            refetch();
            Swal.fire({
                title: 'Note enregistrée',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        },
        onError: (err) => {
            Swal.fire({
                title: 'Erreur',
                text: err.message,
                icon: 'error',
                confirmButtonColor: '#DFB96D'
            });
        }
    });

    const handleAddNote = () => {
        if (!noteContent.trim()) return;
        if (user.role === 'admin' && !selectedClientId) {
            Swal.fire({ title: 'Attention', text: 'Veuillez sélectionner un client', icon: 'warning' });
            return;
        }

        addNote({
            variables: {
                clientId: user.role === 'admin' ? selectedClientId : user.id,
                authorId: user.id,
                content: noteContent
            }
        });
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className={styles.section}
        >
            <div className={styles.sectionHeader}>
                <h2>{user.role === 'admin' ? 'Gestion des Notes Client' : 'Mon Carnet de Notes'}</h2>
                <div className={styles.headerLine}></div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                {/* Note Creation Area */}
                <div className={styles.serviceCard} style={{ padding: '30px', marginBottom: '40px', background: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div className={styles.statIconLux} style={{ background: 'rgba(223, 185, 109, 0.1)', width: '40px', height: '40px' }}>
                            <PenLine className="text-gold" size={20} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Ajouter une nouvelle note</h3>
                    </div>

                    {user.role === 'admin' && (
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', opacity: 0.7, letterSpacing: '0.05em' }}>SÉLECTIONNER UN CLIENT</label>
                            <ClientDropdown
                                clients={clients}
                                selectedClientId={selectedClientId}
                                onSelect={setSelectedClientId}
                            />
                        </div>
                    )}

                    <textarea
                        className={styles.luxuryInput}
                        style={{ minHeight: '120px', padding: '20px', background: 'var(--bg-cream)', border: 'none', marginBottom: '20px' }}
                        placeholder="Rédigez votre note ici... Preferences, envies, retours..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                            className={styles.btnSaveLux} 
                            onClick={handleAddNote}
                            disabled={adding || !noteContent.trim() || (user.role === 'admin' && !selectedClientId)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 30px' }}
                        >
                            {adding ? 'Enregistrement...' : <>Enregistrer <Send size={18} /></>}
                        </button>
                    </div>
                </div>

                {/* Notes List Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '10px' }}>
                         Historique des notes {user.role === 'admin' && selectedClientId ? `pour ${clients.find((c: any) => c.id === selectedClientId)?.name}` : ''}
                    </h3>
                    
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>Chargement des notes...</div>
                    ) : (
                        <AnimatePresence>
                            {(data as any)?.clientNotes?.length === 0 ? (
                                <div className={styles.serviceCard} style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.5)', borderStyle: 'dashed' }}>
                                    <MessageSquare size={40} style={{ opacity: 0.2, marginBottom: '15px' }} />
                                    <p style={{ opacity: 0.5 }}>Aucune note trouvée.</p>
                                </div>
                            ) : (
                                (data as any)?.clientNotes?.map((note: any, idx: number) => (
                                    <motion.div
                                        key={note.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={styles.serviceCard}
                                        style={{ padding: '25px', background: 'white', borderLeft: note.author.role === 'admin' ? '4px solid var(--accent)' : '4px solid #AAA' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
                                                    <UserIcon size={16} opacity={0.6} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{note.author.name}</div>
                                                    <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                        {note.author.role === 'admin' ? 'Expert de l\'Elite' : 'Client Privilégié'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', opacity: 0.4 }}>
                                                <Calendar size={14} />
                                                {new Date(note.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        
                                        <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                                            {note.content}
                                        </p>
                                        
                                        {user.role === 'admin' && !selectedClientId && (
                                            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(0,0,0,0.03)', fontSize: '0.75rem', opacity: 0.6 }}>
                                                Note concernant : <span style={{ fontWeight: 700 }}>{note.client.name}</span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            <style jsx>{`
                .text-gold {
                    color: var(--accent);
                }
            `}</style>
        </motion.div>
    );
}
