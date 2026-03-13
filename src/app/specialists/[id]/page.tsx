'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '@/components/LoadingScreen';
import { useState, useEffect } from 'react';
import { PRESTATAIRES } from '@/lib/mock-data';
import { useLanguage } from '@/lib/LanguageContext';
import styles from './specialist-detail.module.css';
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
    Activity
} from 'lucide-react';

export default function SpecialistDetail() {
    const params = useParams();
    const router = useRouter();
    const { t } = useLanguage();
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const staff = PRESTATAIRES.find(p => p.id === params.id);

    if (!staff) {
        return <div className={styles.error}>Specialist not found</div>;
    }

    if (!mounted) return <LoadingScreen />;

    const expertise = [
        { name: "Technique", val: 98 },
        { name: "Hospitalité", val: 100 },
        { name: "Précision", val: 95 }
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
                <motion.button
                    whileHover={{ x: -10 }}
                    onClick={() => router.back()}
                    className={styles.backBtn}
                >
                    <ArrowLeft size={20} />
                    <span>{t('backToDashboard')}</span>
                </motion.button>
            </nav>

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
                                <span>{t('bestSpecialist2025')}</span>
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
                                <span className={styles.statVal}>1.2k</span>
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
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={styles.awardBadge}
                            >
                                <Sparkles size={14} /> {t('vendomeExclusivity')}
                            </motion.div>
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
                        </header>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className={styles.glassCard}
                        >
                            <div className={styles.cardHeader}>
                                <Activity size={24} className="text-gold" />
                                <h3>{t('journeyOfExcellence')}</h3>
                            </div>
                            <p className={styles.bioText}>
                                {t('staffBioTemplate', { name: staff.name, specialty: staff.specialty })}
                            </p>

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

            {/* Decorative Orbs */}
            <div className={styles.orbOne} />
            <div className={styles.orbTwo} />
        </div>
    );
}
