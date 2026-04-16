import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_CLIENT_NOTES, GET_DASHBOARD_DATA } from '@/graphql/queries';
import { ADD_CLIENT_NOTE_MUTATION } from '@/graphql/mutations';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User as UserIcon, Calendar, Trash2, PenLine, Sparkles, MessageSquare } from 'lucide-react';
import Swal from 'sweetalert2';

interface NotesTabProps {
    user: any;
    styles: any;
    t: any;
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
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', opacity: 0.7 }}>SÉLECTIONNER UN CLIENT</label>
                            <select 
                                className={styles.luxuryInput}
                                value={selectedClientId || ''}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                                style={{ background: 'var(--bg-cream)', border: '1px solid rgba(0,0,0,0.05)' }}
                            >
                                <option value="">--- Choisir un client ---</option>
                                {clients.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                                ))}
                            </select>
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
