'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '@/components/LoadingScreen';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import { useLanguage } from '@/lib/LanguageContext';
import { Prestataire } from '@/lib/mock-data';
import styles from './specialist-detail.module.css';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_SPECIALIST, GET_DASHBOARD_DATA } from '@/graphql/queries';
import { UPDATE_SPECIALIST_MUTATION } from '@/graphql/mutations';
import {
    ArrowLeft,
    Star,
    Award,
    Heart,
    MessageSquare,
    Calendar,
    ShieldCheck,
    Zap,
    Sparkles,
    CheckCircle2,
    Trophy,
    Activity,
    Edit2,
    Clock,
    X,
    Upload
} from 'lucide-react';

export default function SpecialistDetail() {
    const params = useParams() as { id: string };
    const router = useRouter();
    const { data: session } = useSession();
    const { t } = useLanguage();
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<any>(null);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [isEditingHeader, setIsEditingHeader] = useState(false);
    const [bioValue, setBioValue] = useState('');
    const [headerForm, setHeaderForm] = useState({ name: '', role: '', specialty: '' });

    useEffect(() => setMounted(true), []);

    const { data: specialistData, loading: specialistLoading } = useQuery<{ prestataire: Prestataire }>(GET_SPECIALIST, {
        variables: { id: params.id }
    });

    const [updateSpecialist] = useMutation(UPDATE_SPECIALIST_MUTATION, {
        refetchQueries: [{ query: GET_SPECIALIST, variables: { id: params.id } }, { query: GET_DASHBOARD_DATA }]
    });

    const staff = specialistData?.prestataire;

    useEffect(() => {
        if (staff && !editForm) {
            setEditForm({ ...staff });
        }
        if (staff && bioValue === '') {
            setBioValue(staff.historique || t('staffBioTemplate', { name: staff.name, specialty: staff.specialty }));
        }
        if (staff) {
            setHeaderForm({ name: staff.name, role: staff.role, specialty: staff.specialty });
        }
    }, [staff]);

    if (!mounted || specialistLoading) return <LoadingScreen />;

    if (!staff) {
        return <div className={styles.error}>Specialist not found</div>;
    }

    const expertise = [
        { name: "Technique", val: staff.tech_expertise || 95 },
        { name: "Hospitalité", val: staff.hosp_expertise || 95 },
        { name: "Précision", val: staff.prec_expertise || 95 }
    ];

    return (
        <div className={styles.container}>
            {/* Dynamic Immersive Background */}
            <div className={styles.heroBg}>
                <motion.div
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.15 }}
                    transition={{ duration: 1.5 }}
                    className={styles.heroBgImage}
                    style={{ backgroundImage: `url(${staff.image})` }}
                />
                <div className={styles.heroBgOverlay} />
            </div>

            {/* Navigation */}
            <nav className={styles.nav}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <motion.button
                        whileHover={{ x: -10 }}
                        onClick={() => router.back()}
                        className={styles.backBtn}
                    >
                        <ArrowLeft size={20} />
                        <span>{t('backToDashboard')}</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditModalOpen(true)}
                        className={styles.adminUpdateBtn}
                    >
                        <Edit2 size={20} />
                        <span>MODIFIER LE PROFIL</span>
                    </motion.button>
                </div>
            </nav>

            {/* Floating Admin FAB for immediate visibility */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsEditModalOpen(true)}
                className={styles.floatingEditFab}
            >
                <Edit2 size={24} />
            </motion.button>

            <main className={styles.main}>
                <div className={styles.profileLayout}>
                    {/* Visual Column */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className={styles.visualColumn}
                    >
                        <div className={styles.imageCard}>
                            <img src={staff.image} alt={staff.name} className={styles.profileImg} />
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className={styles.floatingBadge}
                            >
                                <Trophy size={18} />
                                <span>{staff.award_badge || t('bestSpecialist2025')}</span>
                            </motion.div>
                        </div>

                        <div className={styles.statsGrid}>
                            <div className={styles.statBox}>
                                <Star className="text-gold" fill="currentColor" size={28} />
                                <span className={styles.statVal}>{staff.rating}</span>
                                <span className={styles.statLabel}>{t('evaluationLabel')}</span>
                            </div>
                            <div className={styles.statBox}>
                                <Heart className="text-gold" fill="currentColor" size={28} />
                                <span className={styles.statVal}>{staff.satisfied_clients || '1.2k'}</span>
                                <span className={styles.statLabel}>{t('satisfiedClients')}</span>
                            </div>
                        </div>

                        <div className={styles.expertiseCard}>
                            <h3>{t('expertiseLevels')}</h3>
                            <div className={styles.expertiseList}>
                                {expertise.map((exp, i) => (
                                    <div key={i} className={styles.expertiseItem}>
                                        <div className={styles.expHeader}>
                                            <span>{t(exp.name.toLowerCase() as any)}</span>
                                            <span>{exp.val}%</span>
                                        </div>
                                        <div className={styles.expBar}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${exp.val}%` }}
                                                transition={{ delay: 0.8 + (i * 0.1), duration: 1 }}
                                                className={styles.expProgress}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Info Column */}
                    <div className={styles.infoColumn}>
                        <header className={styles.header}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={styles.awardBadge}
                                >
                                    <Sparkles size={14} /> {t('vendomeExclusivity')}
                                </motion.div>
                                
                                {!isEditingHeader && (
                                    <button 
                                        onClick={() => setIsEditingHeader(true)}
                                        className={styles.inlineEditBtn}
                                    >
                                        <Edit2 size={16} /> Modifier l'Entête
                                    </button>
                                )}
                            </div>

                            {isEditingHeader ? (
                                <div className={styles.inlineHeaderEdit}>
                                    <input 
                                        className={styles.inlineInputName}
                                        value={headerForm.name}
                                        onChange={(e) => setHeaderForm({ ...headerForm, name: e.target.value })}
                                        placeholder="Nom du Spécialiste"
                                    />
                                    <div className={styles.inlineRow}>
                                        <input 
                                            className={styles.inlineInputSub}
                                            value={headerForm.role}
                                            onChange={(e) => setHeaderForm({ ...headerForm, role: e.target.value })}
                                            placeholder="Rôle"
                                        />
                                        <span>—</span>
                                        <input 
                                            className={styles.inlineInputSub}
                                            value={headerForm.specialty}
                                            onChange={(e) => setHeaderForm({ ...headerForm, specialty: e.target.value })}
                                            placeholder="Spécialité"
                                        />
                                    </div>
                                    <div className={styles.inlineActions} style={{ marginTop: '15px' }}>
                                        <button onClick={() => setIsEditingHeader(false)} className={styles.cancelBtn}>{t('cancel')}</button>
                                        <button 
                                            onClick={async () => {
                                                try {
                                                    await updateSpecialist({
                                                        variables: { 
                                                            id: params.id, 
                                                            ...headerForm 
                                                        }
                                                    });
                                                    setIsEditingHeader(false);
                                                    Swal.fire({ title: 'Succès', text: 'Entête mise à jour !', icon: 'success', confirmButtonColor: '#DFB96D' });
                                                } catch (e) {
                                                    console.error(e);
                                                    Swal.fire({ title: 'Erreur', text: 'Échec de la mise à jour', icon: 'error' });
                                                }
                                            }} 
                                            className={styles.saveBtn}
                                        >
                                            {t('save')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <motion.h1
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className={styles.name}
                                    >
                                        {staff.name}
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className={styles.roleTitle}
                                    >
                                        {staff.role} — <span className="text-gold">{staff.specialty}</span>
                                    </motion.p>
                                </>
                            )}
                        </header>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className={styles.glassCard}
                        >
                            <div className={styles.cardHeader}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                                    <Activity size={24} className="text-gold" />
                                    <h3>{t('journeyOfExcellence')}</h3>
                                </div>
                                {!isEditingBio && (
                                    <button 
                                        onClick={() => setIsEditingBio(true)}
                                        className={styles.inlineEditBtn}
                                    >
                                        <Edit2 size={16} /> {t('edit')}
                                    </button>
                                )}
                            </div>
                            
                            {isEditingBio ? (
                                <div className={styles.inlineBioEdit}>
                                    <textarea
                                        className={styles.bioTextArea}
                                        value={bioValue}
                                        onChange={(e) => setBioValue(e.target.value)}
                                        rows={8}
                                    />
                                    <div className={styles.inlineActions}>
                                        <button onClick={() => { setIsEditingBio(false); setBioValue(staff.historique || ''); }} className={styles.cancelBtn}>{t('cancel')}</button>
                                        <button 
                                            onClick={async () => {
                                                try {
                                                    await updateSpecialist({
                                                        variables: { 
                                                            id: params.id, 
                                                            historique: bioValue 
                                                        }
                                                    });
                                                    setIsEditingBio(false);
                                                    Swal.fire({ title: 'Succès', text: 'Parcours d\'Excellence mis à jour !', icon: 'success', confirmButtonColor: '#DFB96D' });
                                                } catch (e) {
                                                    console.error(e);
                                                    Swal.fire({ title: 'Erreur', text: 'Échec de la mise à jour', icon: 'error' });
                                                }
                                            }} 
                                            className={styles.saveBtn}
                                        >
                                            {t('save')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className={styles.bioText}>
                                    {staff.historique || t('staffBioTemplate', { name: staff.name, specialty: staff.specialty })}
                                </p>
                            )}

                            <div className={styles.quickFeatures}>
                                <div className={styles.qFeature}>
                                    <ShieldCheck size={20} />
                                    <span>{t('cleanEquipment')}</span>
                                </div>
                                <div className={styles.qFeature}>
                                    <Zap size={20} />
                                    <span>{t('immediateEffect')}</span>
                                </div>
                                <div className={styles.qFeature}>
                                    <Sparkles size={20} />
                                    <span>{t('absoluteLuxury')}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Feedback Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className={styles.feedbackSection}
                        >
                            <div className={styles.feedbackHeader}>
                                <div className={styles.feedbackTitle}>
                                    <MessageSquare size={28} className="text-gold" />
                                    <h3>{t('electronicGuestbook')}</h3>
                                </div>
                                <p>{t('shareValuableReview', { name: staff.name })}</p>
                            </div>

                            <div className={styles.ratingInteraction}>
                                <div className={styles.starRow}>
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <motion.button
                                            key={s}
                                            whileHover={{ scale: 1.3, rotate: 10 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setRating(s)}
                                            className={styles.starBtn}
                                        >
                                            <Star
                                                size={40}
                                                fill={rating >= s ? "#E2B45C" : "none"}
                                                color={rating >= s ? "#E2B45C" : "rgba(255,255,255,0.2)"}
                                            />
                                        </motion.button>
                                    ))}
                                </div>

                                <div className={styles.inputGroup}>
                                    <textarea
                                        placeholder={t('whatToSayTo', { name: staff.name })}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className={styles.commentArea}
                                    />
                                    <div className={styles.submitRow}>
                                        <p className={styles.privacyMsg}>{t('publicPrivacyMsg')}</p>
                                        <motion.button
                                            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(226, 180, 92, 0.4)' }}
                                            whileTap={{ scale: 0.95 }}
                                            className={styles.submitBtn}
                                            onClick={() => {
                                                if (rating === 0) {
                                                    alert(t('pleaseRate'));
                                                    return;
                                                }
                                                alert(t('sublimePublished', { name: staff.name }));
                                                setComment('');
                                                setRating(0);
                                            }}
                                        >
                                            {t('publishMyReview')} <Sparkles size={20} />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.testimonials}>
                                <h4>{t('weeklyTestimonials')}</h4>
                                <div className={styles.testimonialCard}>
                                    <div className={styles.tMeta}>
                                        <div className={styles.tStars}>
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill="#E2B45C" color="#E2B45C" />)}
                                        </div>
                                        <span>{t('hoursAgo', { count: 12 })}</span>
                                    </div>
                                    <p>"{t('testimonialStaffOne', { name: staff.name, specialty: staff.specialty })}"</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

        {/* Admin Edit Modal */}
        <AnimatePresence>
            {isEditModalOpen && editForm && (
                <div className={styles.modalOverlay} onClick={() => setIsEditModalOpen(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitleBox}>
                                <Edit2 size={24} className="text-gold" />
                                <h3>Modifier le Profil</h3>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className={styles.closeBtn}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.inputGrid}>
                                <div className={styles.inputGroup}>
                                    <label>Nom Complet</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className={styles.luxuryInput}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Rôle</label>
                                    <input
                                        type="text"
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                        className={styles.luxuryInput}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Spécialité</label>
                                    <input
                                        type="text"
                                        value={editForm.specialty}
                                        onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                                        className={styles.luxuryInput}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Note (0-5)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={editForm.rating}
                                        onChange={(e) => setEditForm({ ...editForm, rating: parseFloat(e.target.value) })}
                                        className={styles.luxuryInput}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Clients Satisfaits</label>
                                    <input
                                        type="text"
                                        value={editForm.satisfied_clients}
                                        onChange={(e) => setEditForm({ ...editForm, satisfied_clients: e.target.value })}
                                        className={styles.luxuryInput}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Badge / Distinction</label>
                                    <input
                                        type="text"
                                        value={editForm.award_badge}
                                        onChange={(e) => setEditForm({ ...editForm, award_badge: e.target.value })}
                                        className={styles.luxuryInput}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Expertise Technique (%)</label>
                                    <input
                                        type="number"
                                        value={editForm.tech_expertise}
                                        onChange={(e) => setEditForm({ ...editForm, tech_expertise: parseInt(e.target.value) })}
                                        className={styles.luxuryInput}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Expertise Hospitalité (%)</label>
                                    <input
                                        type="number"
                                        value={editForm.hosp_expertise}
                                        onChange={(e) => setEditForm({ ...editForm, hosp_expertise: parseInt(e.target.value) })}
                                        className={styles.luxuryInput}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Expertise Précision (%)</label>
                                    <input
                                        type="number"
                                        value={editForm.prec_expertise}
                                        onChange={(e) => setEditForm({ ...editForm, prec_expertise: parseInt(e.target.value) })}
                                        className={styles.luxuryInput}
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup} style={{ marginTop: '20px' }}>
                                <label>Photo du Spécialiste</label>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '10px' }}>
                                    <div 
                                        style={{ 
                                            width: '100px', 
                                            height: '100px', 
                                            borderRadius: '15px', 
                                            background: '#fff', 
                                            border: '2px dashed rgba(223, 185, 109, 0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            flexShrink: 0
                                        }}
                                    >
                                        {editForm.image ? (
                                            <img src={editForm.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <Upload color="#DFB96D" size={24} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setEditForm({ ...editForm, image: reader.result as string });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            style={{ display: 'none' }}
                                            id="specialist-edit-image-upload"
                                        />
                                        <label 
                                            htmlFor="specialist-edit-image-upload" 
                                            className={styles.saveBtn}
                                            style={{ display: 'inline-flex', padding: '10px 20px', fontSize: '0.85rem', cursor: 'pointer' }}
                                        >
                                            {editForm.image ? 'Changer la photo' : 'Choisir une photo'}
                                        </label>
                                        <p style={{ fontSize: '0.75rem', color: '#73685F', marginTop: '8px' }}>
                                            Format recommandé : Carré, max 2Mo
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.inputGroup} style={{ marginTop: '20px' }}>
                                <label>Parcours d'Excellence (Biographie)</label>
                                <textarea
                                    value={editForm.historique}
                                    onChange={(e) => setEditForm({ ...editForm, historique: e.target.value })}
                                    className={`${styles.luxuryInput} ${styles.textArea}`}
                                    rows={5}
                                    placeholder="Racontez le parcours d'excellence de ce spécialiste..."
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className={styles.cancelBtn}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            await updateSpecialist({
                                                variables: {
                                                    id: params.id,
                                                    name: editForm.name,
                                                    role: editForm.role,
                                                    image: editForm.image,
                                                    specialty: editForm.specialty,
                                                    rating: editForm.rating,
                                                    historique: editForm.historique,
                                                    satisfied_clients: editForm.satisfied_clients,
                                                    tech_expertise: editForm.tech_expertise,
                                                    hosp_expertise: editForm.hosp_expertise,
                                                    prec_expertise: editForm.prec_expertise,
                                                    award_badge: editForm.award_badge
                                                }
                                            });
                                            Swal.fire({
                                                title: 'Succès',
                                                text: 'Informations mises à jour !',
                                                icon: 'success',
                                                confirmButtonColor: '#DFB96D'
                                            });
                                            setIsEditModalOpen(false);
                                        } catch (e) {
                                            console.error(e);
                                            Swal.fire({
                                                title: 'Erreur',
                                                text: 'Échec de la mise à jour',
                                                icon: 'error'
                                            });
                                        }
                                    }}
                                    className={styles.saveBtn}
                                >
                                    Enregistrer les Modifications
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* Decorative Orbs */}
        <div className={styles.orbOne} />
        <div className={styles.orbTwo} />
      </div>
    );
}
