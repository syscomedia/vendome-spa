'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import {
    PRESTATAIRES,
    SERVICE_HISTORY,
    RECOMMENDATIONS,
    USER_LOYALTY,
    SERVICES,
    AMENITIES,
    Language
} from '@/lib/mock-data';
import styles from './dashboard.module.css';
import {
    Users,
    Clock,
    LayoutDashboard as DashIcon,
    LogOut,
    Star,
    Gift,
    MessageSquare,
    ChevronRight,
    Sparkles,
    Award,
    Calendar,
    Layers,
    Globe,
    ArrowUpRight,
    Heart
} from 'lucide-react';

export default function Dashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
    const [comment, setComment] = useState('');
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [rating, setRating] = useState(0);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { t, language, setLanguage } = useLanguage();

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <div className={styles.container}>
            {/* Sidebar - Extraordinary Glass Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarInner}>
                    <div className={styles.brandContainer}>
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.8 }}
                            className={styles.sidebarLogoWrapper}
                        >
                            <img src="/logo.png" alt="Vendôme" className={styles.sidebarLogo} />
                        </motion.div>
                        <h2 className={styles.brandName}>Vendôme</h2>
                    </div>

                    <nav className={styles.desktopNav}>
                        {[
                            { id: 'overview', icon: <DashIcon size={22} />, label: t('dashboard') },
                            { id: 'providers', icon: <Users size={22} />, label: t('specialists') },
                            { id: 'history', icon: <Clock size={22} />, label: t('history') }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
                            >
                                <div className={styles.navIcon}>{item.icon}</div>
                                <span className={styles.navLabel}>{item.label}</span>
                                {activeTab === item.id && (
                                    <motion.div
                                        layoutId="sidebarActiveDesktop"
                                        className={styles.navActiveIndicator}
                                    />
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className={styles.sidebarFooter}>
                        <div
                            className={styles.langSwitch}
                            onClick={() => setShowLangMenu(!showLangMenu)}
                        >
                            <Globe size={18} className={styles.langIcon} />
                            <span className={styles.langLabel}>{language.toUpperCase()}</span>
                            <motion.div
                                animate={{ rotate: showLangMenu ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
                            </motion.div>

                            <AnimatePresence>
                                {showLangMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className={styles.langDropdown}
                                    >
                                        {(['fr', 'ar', 'es', 'ru', 'zh'] as Language[]).map((lang) => (
                                            <button
                                                key={lang}
                                                className={`${styles.langOption} ${language === lang ? styles.active : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setLanguage(lang);
                                                    setShowLangMenu(false);
                                                }}
                                            >
                                                {lang.toUpperCase()} — {
                                                    lang === 'fr' ? 'Français' :
                                                        lang === 'ar' ? 'العربية' :
                                                            lang === 'es' ? 'Español' :
                                                                lang === 'ru' ? 'Русский' : '中文'
                                                }
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button className={styles.logoutBtn} onClick={() => window.location.href = '/'}>
                            <LogOut size={20} />
                            <span>{t('signOut')}</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Navigation Dock - Floating Elite Interface */}
            <nav className={styles.nav}>
                {[
                    { id: 'overview', icon: <DashIcon size={22} />, label: t('dashboard') },
                    { id: 'providers', icon: <Users size={22} />, label: t('specialists') },
                    { id: 'history', icon: <Clock size={22} />, label: t('history') }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
                    >
                        <div className={styles.navIcon}>{item.icon}</div>
                        <span className={styles.navLabel}>{item.label}</span>
                        {activeTab === item.id && (
                            <motion.div
                                layoutId="sidebarActive"
                                className={styles.navActiveIndicator}
                            />
                        )}
                    </button>
                ))}
            </nav>

            {/* Main Content */}
            <main className={styles.main}>
                {/* Dynamic Header Wallpaper */}
                <div className={styles.heroBanner}>
                    <div className={styles.heroOverlay} />
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.heroContent}
                    >
                        <div className={styles.tierBadge}>
                            <Award size={16} />
                            <span>{USER_LOYALTY.tier}</span>
                        </div>
                        <h1 className={styles.welcomeText}>
                            Welcome, <span className="text-gold">Monta</span>
                        </h1>
                        <p className={styles.heroSub}>{t('tagline')}</p>
                    </motion.div>

                    <div className={styles.loyaltyOrb}>
                        <div className={styles.orbInner}>
                            <span className={styles.orbPoints}>{USER_LOYALTY.points}</span>
                            <span className={styles.orbLabel}>POINTS</span>
                        </div>
                        <svg className={styles.orbProgress}>
                            <circle cx="60" cy="60" r="54" />
                            <motion.circle
                                cx="60" cy="60" r="54"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: USER_LOYALTY.points / USER_LOYALTY.nextReward }}
                                transition={{ duration: 2, ease: "easeOut" }}
                            />
                        </svg>
                    </div>
                </div>

                <div className={styles.contentWrapper}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={styles.tabContent}
                            >
                                {/* Horizontal Scrolling Luxury Services */}
                                <section className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2>{t('services')}</h2>
                                        <div className={styles.headerLine} />
                                    </div>
                                    <div className={styles.servicesGrid}>
                                        {SERVICES.map((service, idx) => (
                                            <motion.div
                                                key={service.id}
                                                initial={{ opacity: 0, x: 50 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className={styles.serviceCard}
                                                onClick={() => router.push(`/services/${service.id}`)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className={styles.serviceImgWrapper}>
                                                    <img src={service.image} alt={service.name} />
                                                    <div className={styles.servicePrice}>{service.price}</div>
                                                </div>
                                                <div className={styles.serviceInfo}>
                                                    <h3>{service.name}</h3>
                                                    <p>{service.description}</p>
                                                    <div className={styles.serviceFooter}>
                                                        <span className={styles.duration}><Clock size={14} /> {service.duration}</span>
                                                        <button className="btn-lux" onClick={(e) => e.stopPropagation()}>
                                                            {t('bookNow')} <ArrowUpRight size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>

                                <div className={styles.infoRow}>
                                    {/* Recommendations */}
                                    <div className={styles.recSection}>
                                        <h2 className={styles.subTitle}>{t('recommendations')}</h2>
                                        <div className={styles.recsList}>
                                            {RECOMMENDATIONS.map((rec) => {
                                                const staff = PRESTATAIRES.find(p => p.id === rec.id);
                                                return (
                                                    <motion.div
                                                        key={rec.id}
                                                        whileHover={{ x: 10 }}
                                                        className={styles.recItem}
                                                    >
                                                        <img src={staff?.image} alt={staff?.name} />
                                                        <div className={styles.recDetails}>
                                                            <h4>{staff?.name}</h4>
                                                            <p>{rec.reason}</p>
                                                        </div>
                                                        <button className={styles.recButton}>
                                                            <Calendar size={18} />
                                                        </button>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Amenities Gallery */}
                                    <div className={styles.amenitiesSection}>
                                        <h2 className={styles.subTitle}>{t('luxuryAmenities')}</h2>
                                        <div className={styles.amenitiesGrid}>
                                            {AMENITIES.map((amenity, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    whileHover={{ scale: 1.05 }}
                                                    className={styles.amenityCard}
                                                >
                                                    <img src={amenity.image} alt={amenity.name} />
                                                    <div className={styles.amenityLabel}>{amenity.name}</div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'providers' && (
                            <motion.div
                                key="providers"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={styles.tabContent}
                            >
                                <div className={styles.sectionHeader}>
                                    <h2>{t('specialists')}</h2>
                                    <div className={styles.headerLine} />
                                </div>
                                <div className={styles.staffGrid}>
                                    {PRESTATAIRES.map((staff, idx) => (
                                        <motion.div
                                            key={staff.id}
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={styles.staffLargeCard}
                                        >
                                            <div className={styles.staffMain}>
                                                <div className={styles.staffImgContainer}>
                                                    <img src={staff.image} alt={staff.name} />
                                                    <div className={styles.staffScore}>
                                                        <Star size={14} fill="currentColor" />
                                                        <span>{staff.rating}</span>
                                                    </div>
                                                </div>
                                                <div
                                                    className={styles.staffBody}
                                                    onClick={() => router.push(`/specialists/${staff.id}`)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <span className={styles.staffRole}>{staff.role}</span>
                                                    <h3>{staff.name}</h3>
                                                    <p>{staff.specialty}</p>
                                                    <div className={styles.staffActions}>
                                                        <button
                                                            className="btn-lux"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Handle booking
                                                            }}
                                                        >
                                                            {t('bookNow')}
                                                        </button>
                                                        <button
                                                            className={styles.iconBtn}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedStaff(staff.id);
                                                                setIsRatingModalOpen(true);
                                                            }}
                                                        >
                                                            <Heart size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'history' && (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className={styles.tabContent}
                            >
                                <div className={styles.sectionHeader}>
                                    <h2>{t('recentVisits')}</h2>
                                    <div className={styles.headerLine} />
                                </div>
                                <div className={styles.historyTimeline}>
                                    {SERVICE_HISTORY.map((visit) => {
                                        const staff = PRESTATAIRES.find(p => p.id === visit.prestataireId);
                                        return (
                                            <div key={visit.id} className={styles.timelineItem}>
                                                <div className={styles.timelinePoint} />
                                                <div className={styles.timelineCard}>
                                                    <div className={styles.timeMeta}>
                                                        <Clock size={16} />
                                                        <span>{new Date(visit.date).toLocaleDateString(language, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                    </div>
                                                    <div className={styles.timeContent}>
                                                        <div className={styles.timeTitle}>
                                                            <h3>{visit.service}</h3>
                                                            <p>with {staff?.name}</p>
                                                        </div>
                                                        <div className={styles.timePoints}>+{visit.points} PTS</div>
                                                    </div>
                                                    <button
                                                        className={styles.addCommentLink}
                                                        onClick={() => setSelectedStaff(staff?.id || null)}
                                                    >
                                                        <MessageSquare size={16} /> {t('addComment')}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Extraordinary Modal */}
                <AnimatePresence>
                    {selectedStaff && (
                        <div className={styles.modalOverlay}>
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                                className={styles.modal}
                            >
                                <div className={styles.modalHeader}>
                                    <Sparkles className="text-gold" />
                                    <h3>Your Thoughts</h3>
                                    <button className={styles.closeModal} onClick={() => setSelectedStaff(null)}>×</button>
                                </div>
                                <p className={styles.modalDesc}>How was your session with {PRESTATAIRES.find(p => p.id === selectedStaff)?.name}?</p>

                                <div className={styles.starRating}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <motion.button
                                            key={star}
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setRating(star)}
                                            className={styles.starBtn}
                                        >
                                            <Star
                                                size={32}
                                                fill={rating >= star ? "#E2B45C" : "none"}
                                                color={rating >= star ? "#E2B45C" : "rgba(255,255,255,0.2)"}
                                            />
                                        </motion.button>
                                    ))}
                                </div>

                                <textarea
                                    placeholder="Share your experience..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className={styles.modalTextarea}
                                />
                                <div className={styles.modalActions}>
                                    <button className={styles.btnCancel} onClick={() => {
                                        setSelectedStaff(null);
                                        setRating(0);
                                        setComment('');
                                    }}>Dismiss</button>
                                    <button className="btn-lux" onClick={() => {
                                        alert(`Thank you for your ${rating}-star review!`);
                                        setSelectedStaff(null);
                                        setRating(0);
                                        setComment('');
                                    }}>Share Feedback</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
