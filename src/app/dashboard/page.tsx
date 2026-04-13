'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/LoadingScreen';
import FicheClientTab from '@/components/FicheClientTab';
import AdminInbox from '@/components/AdminInbox';
import ChatWindow from '@/components/ChatWindow';
import Swal from 'sweetalert2';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import {
    Language
} from '@/lib/mock-data';
import styles from './dashboard.module.css';
import {
    DollarSign,
    UserCheck,
    Users,
    Clock,
    ClipboardList,
    LayoutDashboard as DashIcon,
    LogOut,
    Star,
    Gift,
    MessageSquare,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Award,
    Calendar,
    Layers,
    Globe,
    ArrowUpRight,
    Heart,
    ShoppingBag,
    Trash2,
    ChevronDown,
    Edit2,
    Upload,
    Loader2,
    TrendingUp,
    Briefcase,
    BarChart3,
    Activity,
    Search,
    Plus
} from 'lucide-react';

import { useQuery, useMutation } from '@apollo/client/react';
import { GET_DASHBOARD_DATA, GET_PRODUCTS, GET_WAITING_DATA, GET_ALL_FEEDBACK } from '@/graphql/queries';
import {
    CREATE_RESERVATION_MUTATION,
    ADD_WAITING_COMMENT_MUTATION,
    ADD_TIP_MUTATION,
    APPLY_REFERRAL_MUTATION,
    ADD_PERSONNEL_EVALUATION_MUTATION,
    DELETE_RESERVATION_MUTATION,
    TOGGLE_SERVICE_MUTATION,
    REMOVE_SERVICE_MUTATION,
    UPDATE_USER_ROLE_MUTATION,
    REMOVE_USER_MUTATION,
    ADD_SERVICE_MUTATION,
    UPDATE_USER_MUTATION,
    UPDATE_SERVICE_MUTATION,
    ADD_PRODUCT_MUTATION,
    UPDATE_PRODUCT_MUTATION,
    REMOVE_PRODUCT_MUTATION,
    UPDATE_RESERVATION_STATUS_MUTATION,
    UPDATE_SPECIALIST_MUTATION
} from '@/graphql/mutations';
import { signOut } from 'next-auth/react';

interface DashboardData {
    services: any[];
    prestataires: any[];
    amenities: any[];
    userLoyalty: {
        points: number;
        tier: string;
        nextReward: number;
    };
    serviceHistory: any[];
    recommendations: any[];
    clients: any[];
    allReservations: any[];
}

interface ProductsData {
    products: any[];
}

interface WaitingData {
    waitingComments: any[];
    myReservations?: any[];
}

interface FeedbackData {
    waitingComments: any[];
    personnelEvaluations: any[];
}

export default function Dashboard() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);

    const { data, loading, error } = useQuery<DashboardData>(GET_DASHBOARD_DATA);
    const { data: productsData } = useQuery<ProductsData>(GET_PRODUCTS);
    const { data: waitingData } = useQuery<WaitingData>(GET_WAITING_DATA, {
        variables: { userId: user?.id }
    });
    const { data: feedbackData } = useQuery<FeedbackData>(GET_ALL_FEEDBACK, { skip: user?.role !== 'admin' });
    const [createReservation] = useMutation(CREATE_RESERVATION_MUTATION, {
        refetchQueries: [{ query: GET_WAITING_DATA, variables: { userId: user?.id } }]
    });
    const [addWaitingComment] = useMutation(ADD_WAITING_COMMENT_MUTATION);
    const [addTip] = useMutation(ADD_TIP_MUTATION);
    const [applyReferral] = useMutation(APPLY_REFERRAL_MUTATION);
    const [addPersonnelEvaluation] = useMutation(ADD_PERSONNEL_EVALUATION_MUTATION);
    const [deleteReservation] = useMutation(DELETE_RESERVATION_MUTATION, {
        refetchQueries: [{ query: GET_WAITING_DATA, variables: { userId: user?.id } }]
    });

    const [toggleService] = useMutation(TOGGLE_SERVICE_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });
    const [removeService] = useMutation(REMOVE_SERVICE_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });
    const [updateUserRole] = useMutation(UPDATE_USER_ROLE_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });
    const [removeUser] = useMutation(REMOVE_USER_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });
    const [addService] = useMutation(ADD_SERVICE_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });
    const [updateUser] = useMutation(UPDATE_USER_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });
    const [updateService] = useMutation(UPDATE_SERVICE_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });
    const [addProduct] = useMutation(ADD_PRODUCT_MUTATION, { refetchQueries: [{ query: GET_PRODUCTS }] });
    const [updateProduct] = useMutation(UPDATE_PRODUCT_MUTATION, { refetchQueries: [{ query: GET_PRODUCTS }] });
    const [removeProduct] = useMutation(REMOVE_PRODUCT_MUTATION, { refetchQueries: [{ query: GET_PRODUCTS }] });
    const [updateReservationStatus] = useMutation(UPDATE_RESERVATION_STATUS_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });
    const [updateSpecialist] = useMutation(UPDATE_SPECIALIST_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });

    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
    const [comment, setComment] = useState('');
    const [waitingComment, setWaitingComment] = useState('');
    const [cart, setCart] = useState<any[]>([]);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [openTierDropdownId, setOpenTierDropdownId] = useState<string | null>(null);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [selectedDayLine, setSelectedDayLine] = useState<string>('');
    const [selectedTimeLine, setSelectedTimeLine] = useState<string>('');
    const [currentDisplayMonth, setCurrentDisplayMonth] = useState(new Date());
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [rating, setRating] = useState(0);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingService, setBookingService] = useState<any>(null);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingStaff, setBookingStaff] = useState('');
    const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
    const [newService, setNewService] = useState({ name: '', description: '', price: '', image: '', duration: '' });
    const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<any>(null);
    const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);
    const [isClientsModalOpen, setIsClientsModalOpen] = useState(false);
    const [isSpecialistsModalOpen, setIsSpecialistsModalOpen] = useState(false);
    const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
    const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
    const [agendaSearch, setAgendaSearch] = useState('');
    const [agendaServiceFilter, setAgendaServiceFilter] = useState('');
    const [revenueDateRange, setRevenueDateRange] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [selectedClientForDetails, setSelectedClientForDetails] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', image: '' });
    const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [isFicheModalOpen, setIsFicheModalOpen] = useState(false);
    const [selectedClientForFiche, setSelectedClientForFiche] = useState<any>(null);
    const [isHistoriqueModalOpen, setIsHistoriqueModalOpen] = useState(false);
    const [selectedSpecialistForHistorique, setSelectedSpecialistForHistorique] = useState<any>(null);
    const [isAdminInboxOpen, setIsAdminInboxOpen] = useState(false);
    const [isClientChatOpen, setIsClientChatOpen] = useState(false);
    const [chatUnreadCount, setChatUnreadCount] = useState(0);
    const [adminUnreadCount, setAdminUnreadCount] = useState(0);
    const chatSseRef = useRef<EventSource | null>(null);
    const { t, language, setLanguage } = useLanguage();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'new' | 'edit' | 'newProduct' | 'editProduct' | 'ficheClient') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                if (type === 'new') {
                    setNewService({ ...newService, image: data.url });
                } else if (type === 'edit') {
                    setEditingService({ ...editingService, image: data.url });
                } else if (type === 'newProduct') {
                    setNewProduct({ ...newProduct, image: data.url });
                } else if (type === 'editProduct') {
                    setEditingProduct({ ...editingProduct, image: data.url });
                } else if (type === 'ficheClient') {
                    setSelectedClientForFiche({ ...selectedClientForFiche, image: data.url });
                }
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error(error);
            alert('Error uploading file');
        } finally {
            setIsUploading(false);
        }
    };

    const getClientMonthlyPayments = (clientId: string) => {
        const clientReservations = data?.allReservations?.filter((res: any) => res.user?.id === clientId && res.status === 'confirmed') || [];
        const paymentsByMonth: Record<string, number> = {};

        clientReservations.forEach((res: any) => {
            if (!res.service?.price || !res.date) return;
            const date = new Date(res.date);
            if (isNaN(date.getTime())) return;
            const monthYear = date.toLocaleDateString(language, { month: 'long', year: 'numeric' });
            paymentsByMonth[monthYear] = (paymentsByMonth[monthYear] || 0) + (res.service.price || 0);
        });

        return Object.entries(paymentsByMonth).map(([month, amount]) => ({ month, amount }));
    };

    const getBusinessPulse = () => {
        if (!data?.allReservations) return [];
        return [...data.allReservations]
            .filter(r => r.date && !isNaN(new Date(r.date).getTime()))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
    };

    const getTopClients = () => {
        if (!data?.allReservations || !data?.clients) return [];
        const spending: Record<string, number> = {};
        data.allReservations.forEach(r => {
            if (r.status === 'confirmed' && r.user?.id) {
                spending[r.user.id] = (spending[r.user.id] || 0) + (r.service?.price || 0);
            }
        });
        return data.clients
            .map(c => ({ ...c, totalSpent: spending[c.id] || 0 }))
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 3);
    };

    const getPeakHours = () => {
        if (!data?.allReservations || data?.allReservations.length === 0) return "Données insuffisantes";
        const hours: Record<number, number> = {};
        data.allReservations.forEach(r => {
            const d = new Date(r.date);
            if (!isNaN(d.getTime())) {
                const h = d.getHours();
                hours[h] = (hours[h] || 0) + 1;
            }
        });
        const peak = Object.entries(hours).sort((a, b) => b[1] - a[1])[0];
        return peak ? `${peak[0]}h:00` : "Non défini";
    };

    const getTodaysAgenda = () => {
        if (!data?.allReservations) return [];
        const now = new Date();
        return data.allReservations.filter((r: any) => {
            if (!r.date) return false;
            const d = new Date(r.date);
            if (isNaN(d.getTime())) return false;
            return d.getDate() === now.getDate() &&
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear();
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const getStaffRevenueReport = () => {
        if (!data?.allReservations) return [];
        const filtered = data.allReservations.filter(r => {
            if (!r.date) return false;
            const dateObj = new Date(r.date);
            if (isNaN(dateObj.getTime())) return false;
            const d = dateObj.toISOString().split('T')[0];
            return r.status === 'confirmed' && d >= revenueDateRange.start && d <= revenueDateRange.end;
        });

        const breakdown: Record<string, { count: number, total: number }> = {};
        filtered.forEach(r => {
            const name = r.prestataire?.name || 'Non assigné';
            if (!breakdown[name]) breakdown[name] = { count: 0, total: 0 };
            breakdown[name].count++;
            breakdown[name].total += (r.service?.price || 0);
        });

        return Object.entries(breakdown).map(([name, stats]) => ({ name, ...stats }));
    };

    const getRevenueReport = () => {
        if (!data?.allReservations) return [];
        const filtered = data.allReservations.filter(r => {
            if (!r.date) return false;
            const dateObj = new Date(r.date);
            if (isNaN(dateObj.getTime())) return false;
            const d = dateObj.toISOString().split('T')[0];
            return r.status === 'confirmed' && d >= revenueDateRange.start && d <= revenueDateRange.end;
        });

        const breakdown: Record<string, { count: number, total: number }> = {};
        filtered.forEach(r => {
            const name = r.service?.name || 'Service Inconnu';
            if (!breakdown[name]) breakdown[name] = { count: 0, total: 0 };
            breakdown[name].count++;
            breakdown[name].total += (r.service?.price || 0);
        });

        return Object.entries(breakdown).map(([name, stats]) => ({ name, ...stats }));
    };

    const closeAllModals = () => {
        setIsBookingModalOpen(false);
        setIsAddServiceModalOpen(false);
        setIsEditServiceModalOpen(false);
        setIsAddProductModalOpen(false);
        setIsEditProductModalOpen(false);
        setIsCartModalOpen(false);
        setIsRatingModalOpen(false);
        setIsClientsModalOpen(false);
        setIsSpecialistsModalOpen(false);
        setIsRevenueModalOpen(false);
        setIsAgendaModalOpen(false);
        setIsEditClientModalOpen(false);
        setIsFicheModalOpen(false);
        setBookingService(null);
        setSelectedClientForFiche(null);
    };

    const handleLogout = async () => {
        localStorage.clear();
        await signOut({ callbackUrl: '/' });
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeAllModals();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // SSE: real-time unread message badges
    useEffect(() => {
        if (!user?.id) return;

        const isAdmin = user?.role === 'admin';
        const role = isAdmin ? 'admin' : 'client';

        // Fetch initial unread count
        fetch(`/api/chat/unread?userId=${user.id}`)
            .then(r => r.json())
            .then(d => {
                if (isAdmin) setAdminUnreadCount(d.count || 0);
                else setChatUnreadCount(d.count || 0);
            })
            .catch(() => {});

        const es = new EventSource(`/api/chat/sse?userId=${user.id}&role=${role}`);
        chatSseRef.current = es;
        es.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.type === 'new_message' && data.message?.sender_id !== Number(user.id)) {
                    if (isAdmin) {
                        setAdminUnreadCount(prev => prev + 1);
                    } else {
                        setChatUnreadCount(prev => prev + 1);
                    }
                }
            } catch {}
        };
        es.onerror = () => es.close();
        return () => { es.close(); chatSseRef.current = null; };
    }, [user?.id, user?.role]);



    if (!mounted || loading) return <LoadingScreen />;
    if (error) return <div className={styles.error}>Error loading dashboard data</div>;

    const {
        services = [],
        prestataires = [],
        amenities = [],
        userLoyalty = { points: 0, tier: 'Guest', nextReward: 100 },
        serviceHistory = [],
        recommendations = []
    } = data || {} as DashboardData;


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
                            ...(user?.role === 'admin' ? [
                                { id: 'manage_services', icon: <Layers size={22} />, label: t('manageServices') },
                                { id: 'clients', icon: <Users size={22} />, label: t('clients') },
                                { id: 'feedback', icon: <Star size={22} />, label: t('feedback') }
                            ] : []),
                            { id: 'providers', icon: <Users size={22} />, label: t('specialists') },
                            ...(user?.role === 'admin' ? [{ id: 'caisse', icon: <DollarSign size={22} />, label: 'Caisse' }] : []),
                            { id: 'history', icon: <Clock size={22} />, label: t('history') },
                            { id: 'maintenant', icon: <Sparkles size={22} />, label: t('maintenant') },
                            { id: 'products', icon: <Gift size={22} />, label: t('products') },
                            ...(user?.role !== 'admin' ? [{ id: 'fiche', icon: <ClipboardList size={22} />, label: 'Ma Fiche' }] : []),
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

                        {user?.role !== 'admin' && (
                            <button
                                className={styles.logoutBtn}
                                style={{ color: 'var(--accent)', justifyContent: 'flex-start' }}
                                onClick={() => setIsCartModalOpen(true)}
                            >
                                <ShoppingBag size={20} />
                                <span>{t('cart')} ({cart.length + (waitingData?.myReservations?.filter((r: any) => r.status === 'pending').length || 0)})</span>
                            </button>
                        )}

                        <button className={styles.logoutBtn} onClick={handleLogout}>
                            <LogOut size={20} />
                            <span>{t('signOut')}</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Navigation Dock - Floating Elite Interface */}
            <nav className={styles.nav}>
                {
                    [
                        { id: 'overview', icon: <DashIcon size={22} />, label: t('dashboard') },
                        ...(user?.role === 'admin' ? [
                            { id: 'manage_services', icon: <Layers size={22} />, label: t('manageServices') },
                            { id: 'clients', icon: <Users size={22} />, label: t('clients') },
                            { id: 'feedback', icon: <Star size={22} />, label: t('feedback') },
                            { id: 'caisse', icon: <DollarSign size={22} />, label: 'Caisse' }
                        ] : []),
                        { id: 'providers', icon: <Users size={22} />, label: t('specialists') },
                        { id: 'history', icon: <Clock size={22} />, label: t('history') },
                        ...(user?.role !== 'admin' ? [{ id: 'fiche', icon: <ClipboardList size={22} />, label: 'Fiche' }] : []),
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
                    ))
                }
            </nav >

            {/* Main Content */}
            < main className={styles.main} >
                {/* Dynamic Header Wallpaper */}
                < div className={styles.heroBanner} >
                    <div className={styles.heroOverlay} />
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.heroContent}
                    >
                        <div className={styles.tierBadge}>
                            <Award size={16} />
                            <span>{userLoyalty.tier}</span>
                        </div>
                        <h1 className={styles.welcomeText}>
                            {t('welcomeBack')}<span className="text-gold">{user?.name || 'Guest'}</span>
                        </h1>
                        <p className={styles.heroSub}>{t('tagline')}</p>
                    </motion.div>

                    {user?.role !== 'admin' && (
                        <div className={styles.loyaltyOrb}>
                            <div className={styles.orbInner}>
                                <span className={styles.orbPoints}>{userLoyalty.points}</span>
                                <span className={styles.orbLabel}>POINTS</span>
                            </div>
                            <svg className={styles.orbProgress} viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="54" />
                                <motion.circle
                                    cx="60" cy="60" r="54"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: userLoyalty.points / userLoyalty.nextReward }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                />
                            </svg>
                        </div>
                    )}
                </div >

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
                                {user?.role === 'admin' && (
                                    <>
                                        <div className={styles.sectionHeader}>
                                            <h2>{t('platformStatistics')}</h2>
                                            <div className={styles.headerLine} />
                                        </div>
                                        <div className={styles.statsGrid}>
                                            <motion.div
                                                whileHover={{ y: -10 }}
                                                className={styles.statCardLux}
                                                onClick={() => setIsClientsModalOpen(true)}
                                            >
                                                <div className={styles.statIconLux} style={{ background: 'rgba(226, 180, 92, 0.1)' }}>
                                                    <Users color="var(--accent)" size={28} />
                                                </div>
                                                <div className={styles.statInfoLux}>
                                                    <span className={styles.statValueLux}>{data?.clients?.length || 0}</span>
                                                    <span className={styles.statLabelLux}>{t('totalClients')}</span>
                                                    <div className={styles.statTrendLux}>
                                                        <TrendingUp size={14} /> <span>+12% {t('maintenant')}</span>
                                                    </div>
                                                </div>
                                                <Activity className={styles.statGraphIcon} size={60} />
                                            </motion.div>

                                            <motion.div
                                                whileHover={{ y: -10 }}
                                                className={styles.statCardLux}
                                                onClick={() => setIsSpecialistsModalOpen(true)}
                                            >
                                                <div className={styles.statIconLux} style={{ background: 'rgba(45, 106, 79, 0.1)' }}>
                                                    <Briefcase color="#2D6A4F" size={28} />
                                                </div>
                                                <div className={styles.statInfoLux}>
                                                    <span className={styles.statValueLux}>{prestataires.length}</span>
                                                    <span className={styles.statLabelLux}>{t('totalSpecialists')}</span>
                                                    <div className={styles.statTrendLux} style={{ color: '#2D6A4F' }}>
                                                        <UserCheck size={14} /> <span>{t('active')}</span>
                                                    </div>
                                                </div>
                                                <Activity className={styles.statGraphIcon} size={60} style={{ color: '#2D6A4F' }} />
                                            </motion.div>

                                            <motion.div
                                                whileHover={{ y: -10 }}
                                                className={styles.statCardLux}
                                                onClick={() => setIsRevenueModalOpen(true)}
                                            >
                                                <div className={styles.statIconLux} style={{ background: 'rgba(214, 40, 40, 0.1)' }}>
                                                    <DollarSign color="#D62828" size={28} />
                                                </div>
                                                <div className={styles.statInfoLux}>
                                                    <span className={styles.statValueLux}>
                                                        {data?.allReservations?.reduce((acc: number, res: any) => acc + (res.status === 'confirmed' ? res.service.price : 0), 0).toLocaleString()} <small>DT</small>
                                                    </span>
                                                    <span className={styles.statLabelLux}>Total Revenue</span>
                                                    <div className={styles.statTrendLux} style={{ color: '#D62828' }}>
                                                        <BarChart3 size={14} /> <span>+5.4%</span>
                                                    </div>
                                                </div>
                                                <Activity className={styles.statGraphIcon} size={60} style={{ color: '#D62828' }} />
                                            </motion.div>

                                            <motion.div
                                                whileHover={{ y: -10 }}
                                                className={styles.statCardLux}
                                                onClick={() => { setIsAdminInboxOpen(true); setAdminUnreadCount(0); }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className={styles.statIconLux} style={{ background: adminUnreadCount > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(10, 10, 255, 0.1)', position: 'relative' }}>
                                                    <MessageSquare color={adminUnreadCount > 0 ? '#ef4444' : '#0A0AFF'} size={28} />
                                                    {adminUnreadCount > 0 && (
                                                        <span style={{
                                                            position: 'absolute', top: -6, right: -6,
                                                            background: '#ef4444', color: 'white',
                                                            borderRadius: '999px', fontSize: '0.65rem',
                                                            fontWeight: 700, padding: '1px 5px',
                                                            border: '2px solid white', minWidth: 18,
                                                            textAlign: 'center', lineHeight: '16px'
                                                        }}>{adminUnreadCount}</span>
                                                    )}
                                                </div>
                                                <div className={styles.statInfoLux}>
                                                    <span className={styles.statValueLux} style={{ color: adminUnreadCount > 0 ? '#ef4444' : undefined }}>
                                                        {adminUnreadCount}
                                                    </span>
                                                    <span className={styles.statLabelLux}>MESSAGES NON LUS</span>
                                                    <div className={styles.statTrendLux} style={{ color: '#0A0AFF' }}>
                                                        <MessageSquare size={14} /> <span>Ouvrir la messagerie</span>
                                                    </div>
                                                </div>
                                                <Activity className={styles.statGraphIcon} size={60} style={{ color: '#0A0AFF' }} />
                                            </motion.div>
                                        </div>

                                        {/* Admin Intel: Today's Agenda & Insights */}
                                        <div className={styles.adminIntelRow}>
                                            <div className={styles.intelCard} onClick={() => setIsAgendaModalOpen(true)} style={{ cursor: 'pointer' }}>
                                                <div className={styles.intelHeader}>
                                                    <Calendar size={20} color="var(--accent)" />
                                                    <h3>Agenda du Jour</h3>
                                                    <div className={styles.pulseIndicator}>LIVE</div>
                                                </div>
                                                <div className={styles.intelList}>
                                                    {getTodaysAgenda().slice(0, 3).map((res: any) => (
                                                        <div key={res.id} className={styles.intelItem}>
                                                            <div className={styles.intelTime}>
                                                                {new Date(res.date).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                            <div className={styles.intelDetails}>
                                                                <div className={styles.serviceClientInfo}>
                                                                    <strong>{res.service?.name || 'Service Inconnu'}</strong>
                                                                    <span className={styles.clientSub}>{res.user?.name || 'Client Anonyme'}</span>
                                                                </div>
                                                                <div className={styles.specialistBadge}>
                                                                    {res.prestataire?.name && (
                                                                        <>
                                                                            <UserCheck size={12} />
                                                                            <span>{res.prestataire.name}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className={styles.agendaActions}>
                                                                <button className={styles.checkBtn} title="Check-in">
                                                                    <UserCheck size={14} />
                                                                </button>
                                                                <div className={`${styles.intelStatus} ${styles[res.status]}`}>
                                                                    {res.status}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {getTodaysAgenda().length === 0 && (
                                                        <p className={styles.emptyIntel}>Aucune réservation pour aujourd'hui.</p>
                                                    )}
                                                    {getTodaysAgenda().length > 3 && (
                                                        <div className={styles.viewMoreAgenda}>
                                                            Voir les {getTodaysAgenda().length - 3} autres réservations...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={styles.intelCard}>
                                                <div className={styles.intelHeader}>
                                                    <TrendingUp size={20} color="var(--accent)" />
                                                    <h3>Services les Plus Demandés</h3>
                                                </div>
                                                <div className={styles.topServicesList}>
                                                    {(() => {
                                                        const serviceCounts = data?.allReservations?.reduce((acc: any, r: any) => {
                                                            if (r.service?.name) acc[r.service.name] = (acc[r.service.name] || 0) + 1;
                                                            return acc;
                                                        }, {}) || {};
                                                        const entries = Object.entries(serviceCounts).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3);
                                                        const maxCount = entries.length > 0 ? entries[0][1] as number : 1;

                                                        return entries.map(([name, count]: any, idx) => (
                                                            <div key={idx} className={styles.topServiceItem}>
                                                                <div className={styles.topServiceRank}>#{idx + 1}</div>
                                                                <div className={styles.topServiceInfo}>
                                                                    <strong>{name}</strong>
                                                                    <span>{count} Réservations</span>
                                                                </div>
                                                                <div className={styles.topServiceBar}>
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${(count / maxCount) * 100}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ));
                                                    })()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.adminIntelRow} style={{ marginTop: '30px' }}>
                                            <div className={styles.intelCard}>
                                                <div className={styles.intelHeader}>
                                                    <Award size={20} color="var(--accent)" />
                                                    <h3>VIP Clients (Top Spending)</h3>
                                                </div>
                                                <div className={styles.intelList}>
                                                    {getTopClients().map((client, idx) => (
                                                        <div key={client.id} className={styles.intelItem}>
                                                            <div className={styles.avatarMini}>{client.name ? client.name[0] : 'U'}</div>
                                                            <div className={styles.intelDetails}>
                                                                <strong>{client.name}</strong>
                                                                <span>{client.email}</span>
                                                            </div>
                                                            <div className={styles.clientSpendBadge}>
                                                                {client.totalSpent} DT
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className={styles.intelCard} style={{ background: 'linear-gradient(135deg, #1A130F 0%, #2A1F18 100%)', color: 'white' }}>
                                                <div className={styles.intelHeader}>
                                                    <Sparkles size={20} color="var(--accent)" />
                                                    <h3 style={{ color: 'white' }}>AI Business Health</h3>
                                                </div>
                                                <div className={styles.aiInsights}>
                                                    <div className={styles.aiItem}>
                                                        <Clock size={16} color="var(--accent)" />
                                                        <div>
                                                            <p>Heure de pointe aujourd'hui</p>
                                                            <strong>{getPeakHours()}</strong>
                                                        </div>
                                                    </div>
                                                    <div className={styles.aiItem}>
                                                        <Star size={16} color="var(--accent)" />
                                                        <div>
                                                            <p>Score de satisfaction Spa</p>
                                                            <strong>9.8 / 10</strong>
                                                        </div>
                                                    </div>
                                                    <div className={styles.aiItem}>
                                                        <Activity size={16} color="var(--accent)" />
                                                        <div>
                                                            <p>Taux d'occupation</p>
                                                            <strong>{(() => {
                                                                const now = new Date();
                                                                const todaysRes = data?.allReservations?.filter((r: any) => {
                                                                    if (!r.date) return false;
                                                                    const d = new Date(r.date);
                                                                    return d.getDate() === now.getDate() &&
                                                                        d.getMonth() === now.getMonth() &&
                                                                        d.getFullYear() === now.getFullYear();
                                                                }) || [];
                                                                return Math.min(100, Math.round((todaysRes.length / 8) * 100));
                                                            })()}%</strong>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={styles.aiRecommendations}>
                                                    <h4>💡 Intelligence Proactive</h4>
                                                    <ul>
                                                        <li>Forte demande sur <strong>{Object.keys(data?.allReservations?.reduce((acc: any, r: any) => { if (r.service?.name) acc[r.service.name] = (acc[r.service.name] || 0) + 1; return acc; }, {}) || {}).sort((a, b) => (data?.allReservations?.filter((r: any) => r.service?.name === b).length || 0) - (data?.allReservations?.filter((r: any) => r.service?.name === a).length || 0))[0] || 'vos services'}</strong>. Pensez à ajuster le planning.</li>
                                                        <li>Le créneau de <strong>{getPeakHours()}</strong> est saturé cette semaine.</li>
                                                        <li>3 clients VIP n'ont pas réservé depuis 1 mois. Relancez-les ?</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Luxury Services - Client ONLY */}
                                {user?.role !== 'admin' && (
                                    <section className={styles.section}>
                                        <div className={styles.sectionHeader}>
                                            <h2>{t('services')}</h2>
                                            <div className={styles.headerLine} />
                                        </div>
                                        <div className={styles.servicesGrid}>
                                            {services.filter((s: any) => s.enabled !== false).map((service: any, idx: number) => (
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
                                                            <button className="btn-lux" onClick={(e) => {
                                                                e.stopPropagation();
                                                                setBookingService(service);
                                                                setIsBookingModalOpen(true);
                                                            }}>
                                                                {t('bookNow')} <ArrowUpRight size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {user?.role !== 'admin' && (
                                    <div className={styles.infoRow}>
                                        {/* Recommendations */}
                                        <div className={styles.recSection}>
                                            <h2 className={styles.subTitle}>{t('recommendations')}</h2>
                                            <div className={styles.recsList}>
                                                {recommendations.map((rec: any) => {
                                                    const staff = prestataires.find((p: any) => p.id === rec.id);
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

                                        {/* Referral Section */}
                                        <div className={styles.recSection} style={{ marginBottom: '20px' }}>
                                            <h2 className={styles.subTitle}>{t('referrals')}</h2>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px' }}>
                                                <p style={{ marginBottom: '10px' }}>{t('getRefCode')}</p>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <input id="refInput" type="text" placeholder="CODE123" className={styles.modalTextarea} style={{ marginBottom: 0, height: '40px' }} />
                                                    <button className="btn-lux" onClick={async () => {
                                                        const code = (document.getElementById('refInput') as HTMLInputElement).value;
                                                        if (code) {
                                                            await applyReferral({ variables: { userId: user?.id, code } });
                                                            alert("Code applied!");
                                                        }
                                                    }}>{t('apply')}</button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Amenities Gallery */}
                                        <div className={styles.amenitiesSection}>
                                            <h2 className={styles.subTitle}>{t('luxuryAmenities')}</h2>
                                            <div className={styles.amenitiesGrid}>
                                                {amenities.map((amenity: any, idx: number) => (
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
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'manage_services' && user?.role === 'admin' && (
                            <motion.div
                                key="manage_services"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={styles.tabContent}
                            >
                                <section className={styles.section}>
                                    <div className={styles.sectionHeader} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <h2>{t('manageServices')}</h2>
                                        <div className={styles.headerLine} style={{ width: '100px', margin: '15px auto' }} />
                                        <button className="btn-lux" style={{ marginTop: '20px' }} onClick={() => setIsAddServiceModalOpen(true)}>{t('addService')}</button>
                                    </div>
                                    <div className={styles.servicesGrid}>
                                        {services.map((service: any) => (
                                            <div key={service.id} className={styles.serviceCard} style={{ opacity: service.enabled === false ? 0.6 : 1 }}>
                                                <div className={styles.serviceImgWrapper}>
                                                    <img src={service.image} alt={service.name} />
                                                    <div className={styles.servicePrice}>{service.price}</div>
                                                    <div style={{ position: 'absolute', top: '25px', left: '25px' }}>
                                                        <span className={`${styles.serviceStatus} ${service.enabled !== false ? styles.statusActive : styles.statusDisabled}`}>
                                                            {service.enabled !== false ? t('active') : t('disabled')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={styles.serviceInfo}>
                                                    <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>{service.name}</h3>
                                                    <p style={{ textAlign: 'center', minHeight: '60px' }}>{service.description}</p>
                                                    <div className={styles.modalActions} style={{ marginTop: '15px', flexWrap: 'wrap' }}>
                                                        <button
                                                            className={styles.btnSaveLux}
                                                            style={{ flex: '1 1 120px' }}
                                                            onClick={() => {
                                                                setEditingService(service);
                                                                setIsEditServiceModalOpen(true);
                                                            }}
                                                        >
                                                            {t('edit')}
                                                        </button>
                                                        <button
                                                            className={styles.btnCancel}
                                                            style={{ flex: '1 1 120px' }}
                                                            onClick={async () => {
                                                                await toggleService({ variables: { id: service.id, enabled: service.enabled === false } });
                                                            }}
                                                        >
                                                            {service.enabled === false ? t('enable') : t('disable')}
                                                        </button>
                                                        <button
                                                            className={styles.btnDeleteLux}
                                                            style={{ flex: '1 1 100%' }}
                                                            onClick={async () => {
                                                                if (confirm(t('confirmDeleteService'))) {
                                                                    await removeService({ variables: { id: service.id } });
                                                                }
                                                            }}
                                                        >
                                                            {t('remove')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </motion.div>
                        )}

                        {activeTab === 'providers' && (
                            <motion.div
                                key="providers"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={styles.tabContent}
                            >
                                <section className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2>{t('specialists')}</h2>
                                        <div className={styles.headerLine} />
                                    </div>
                                    <div className={styles.staffGrid}>
                                        {prestataires.map((staff: any, idx: number) => (
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
                                                        <div className={styles.staffActions} style={{ gap: '10px' }}>
                                                            <button
                                                                className={styles.iconBtn}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedStaff(staff.id);
                                                                    setIsRatingModalOpen(true);
                                                                }}
                                                            >
                                                                <Star size={20} />
                                                            </button>
                                                            {user?.role === 'admin' && (
                                                                <button
                                                                    className={styles.iconBtn}
                                                                    style={{ background: 'rgba(223, 185, 109, 0.1)' }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedSpecialistForHistorique({ ...staff });
                                                                        setIsHistoriqueModalOpen(true);
                                                                    }}
                                                                >
                                                                    <Clock size={20} color="var(--accent)" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>
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
                                    {serviceHistory.map((visit: any) => {
                                        const staff = prestataires.find((p: any) => p.id === visit.prestataireId);
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
                                                            <p>{t('with')} {staff?.name}</p>
                                                        </div>
                                                        <div className={styles.timePoints}>+{visit.points} PTS</div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '15px' }}>
                                                        <button
                                                            className={styles.addCommentLink}
                                                            onClick={() => setSelectedStaff(staff?.id || null)}
                                                        >
                                                            <MessageSquare size={16} /> {t('addComment')}
                                                        </button>
                                                        <button
                                                            className={styles.addCommentLink}
                                                            onClick={async () => {
                                                                const amount = prompt(t('tipAmount'));
                                                                if (amount) {
                                                                    await addTip({ variables: { userId: user?.id, prestataireId: staff?.id, amount: parseFloat(amount) } });
                                                                    alert(t('tipSent'));
                                                                }
                                                            }}
                                                        >
                                                            <Gift size={16} /> {t('tip')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'maintenant' && (
                            <motion.div
                                key="maintenant"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={styles.tabContent}
                            >
                                <div className={styles.sectionHeader}>
                                    <h2>{t('liveLounge')}</h2>
                                    <div className={styles.headerLine} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className={styles.card}>
                                        <h3>{t('currentQueue')}</h3>
                                        <p className="text-gold">{t('estWait')}: 15 mins</p>
                                        <div style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                                            {waitingData?.waitingComments?.map((c: any) => (
                                                <div key={c.id} style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                    <strong style={{ color: '#DFB96D' }}>{c.user.name}</strong>
                                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>{c.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.card}>
                                        <h3>{t('joinConversation')}</h3>
                                        <textarea
                                            placeholder={t('shareThought')}
                                            value={waitingComment}
                                            onChange={(e) => setWaitingComment(e.target.value)}
                                            className={styles.modalTextarea}
                                            style={{ height: '100px', marginTop: '1rem' }}
                                        />
                                        <button className="btn-lux" style={{ marginTop: '1rem', width: '100%' }} onClick={async () => {
                                            if (!waitingComment) return;
                                            await addWaitingComment({ variables: { userId: user?.id, comment: waitingComment } });
                                            setWaitingComment('');
                                            window.location.reload(); // Quick refresh for demo
                                        }}>{t('post')}</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'products' && (
                            <motion.div
                                key="products"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={styles.tabContent}
                            >
                                <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h2>{t('boutique')}</h2>
                                        <div className={styles.headerLine} />
                                    </div>
                                    {user?.role === 'admin' && (
                                        <button className="btn-lux" onClick={() => setIsAddProductModalOpen(true)}>
                                            <Plus size={18} /> {t('addProduct') || 'Ajouter Produit'}
                                        </button>
                                    )}
                                </div>
                                <div className={styles.servicesGrid}>
                                    {productsData?.products?.map((prod: any) => (
                                        <motion.div
                                            key={prod.id}
                                            className={styles.serviceCard}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <div className={styles.serviceImgWrapper}>
                                                <img src={prod.image} alt={prod.name} />
                                                <div className={styles.servicePrice}>{prod.price} DT</div>
                                                {/* Admin overlay removed as actions are now at the bottom */}
                                            </div>
                                            <div className={styles.serviceInfo}>
                                                <h3>{prod.name}</h3>
                                                <p>{prod.description}</p>
                                                {user?.role === 'admin' ? (
                                                    <div className={styles.modalActions} style={{ marginTop: '15px' }}>
                                                        <button
                                                            className={styles.btnSaveLux}
                                                            style={{ flex: 1 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingProduct({ ...prod });
                                                                setIsEditProductModalOpen(true);
                                                            }}
                                                        >
                                                            {t('edit')}
                                                        </button>
                                                        <button
                                                            className={styles.btnDeleteLux}
                                                            style={{ flex: 1 }}
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (confirm(t('confirmDelete') || 'Supprimer ce produit ?')) {
                                                                    await removeProduct({ variables: { id: prod.id } });
                                                                }
                                                            }}
                                                        >
                                                            {t('remove')}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button className="btn-lux" style={{ width: '100%', marginTop: '10px' }} onClick={() => {
                                                        setCart([...cart, prod]);
                                                        alert(`${t('addedToCart')}: ${prod.name}`);
                                                    }}>
                                                        {t('addToCart')} <Gift size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'fiche' && user?.role !== 'admin' && (
                            <motion.div
                                key="fiche"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={styles.tabContent}
                            >
                                <FicheClientTab
                                    client={(() => {
                                        const c = data?.clients?.find((c: any) => c.id === user?.id);
                                        return c || { ...user };
                                    })()}
                                    prestataires={prestataires}
                                    services={services}
                                    updateUser={updateUser}
                                    handleFileUpload={handleFileUpload}
                                    isUploading={isUploading}
                                    t={t}
                                    styles={styles}
                                />
                            </motion.div>
                        )}

                        {activeTab === 'clients' && user?.role === 'admin' && (
                            <motion.div
                                key="clients"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={styles.tabContent}
                            >
                                <section className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2>{t('clients')}</h2>
                                        <div className={styles.headerLine} />
                                    </div>
                                    <div className={styles.clientsList}>
                                        {data?.clients && data.clients.length > 0 ? (
                                            data.clients.map((client: any) => (
                                                <div
                                                    key={client.id}
                                                    className={`${styles.clientCard} ${openDropdownId === client.id ? styles.clientCardActive : ''}`}
                                                >
                                                    <div className={styles.clientIcon} style={{ overflow: 'hidden', width: '45px', height: '45px', border: '1px solid rgba(223, 185, 109, 0.2)' }}>
                                                        {client.image ? (
                                                            <img src={client.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <Users size={20} />
                                                        )}
                                                    </div>
                                                    <div
                                                        className={styles.clientInfo}
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => {
                                                            setSelectedClientForFiche({ ...client });
                                                            setIsFicheModalOpen(true);
                                                        }}
                                                    >
                                                        <h4>{client.name}</h4>
                                                        <p>{client.email}</p>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                        <div className={styles.customDropdown}>
                                                            <button
                                                                className={styles.dropdownTrigger}
                                                                onClick={() => {
                                                                    setOpenTierDropdownId(openTierDropdownId === client.id ? null : client.id);
                                                                    setOpenDropdownId(null);
                                                                }}
                                                                style={{ minWidth: '140px', background: client.tier === 'Membre Gold' ? 'rgba(223, 185, 109, 0.15)' : 'rgba(255,255,255,0.05)' }}
                                                            >
                                                                <Star size={14} className={client.tier === 'Membre Gold' ? 'text-gold' : ''} style={{ marginRight: '8px' }} />
                                                                <span>{client.tier === 'Membre Gold' ? t('goldMember') : t('normalMember')}</span>
                                                                <ChevronDown
                                                                    size={16}
                                                                    className={styles.selectIcon}
                                                                    style={{ transform: openTierDropdownId === client.id ? 'rotate(180deg)' : 'none' }}
                                                                />
                                                            </button>

                                                            <AnimatePresence>
                                                                {openTierDropdownId === client.id && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: -10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: -10 }}
                                                                        className={styles.dropdownMenu}
                                                                    >
                                                                        {[
                                                                            { value: 'Normal', label: t('normalMember') },
                                                                            { value: 'Membre Gold', label: t('goldMember') }
                                                                        ].map((tier) => (
                                                                            <button
                                                                                key={tier.value}
                                                                                className={`${styles.dropdownItem} ${client.tier === tier.value ? styles.dropdownItemActive : ''}`}
                                                                                onClick={async () => {
                                                                                    await updateUser({ variables: { userId: client.id, tier: tier.value } });
                                                                                    setOpenTierDropdownId(null);
                                                                                }}
                                                                            >
                                                                                {tier.label}
                                                                            </button>
                                                                        ))}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                        <div className={styles.customDropdown}>
                                                            <button
                                                                className={styles.dropdownTrigger}
                                                                onClick={() => {
                                                                    setOpenDropdownId(openDropdownId === client.id ? null : client.id);
                                                                    setOpenTierDropdownId(null);
                                                                }}
                                                            >
                                                                <span>{client.role.toUpperCase()}</span>
                                                                <ChevronDown
                                                                    size={16}
                                                                    className={styles.selectIcon}
                                                                    style={{ transform: openDropdownId === client.id ? 'rotate(180deg)' : 'none' }}
                                                                />
                                                            </button>

                                                            <AnimatePresence>
                                                                {openDropdownId === client.id && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: -10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: -10 }}
                                                                        className={styles.dropdownMenu}
                                                                    >
                                                                        {['client', 'admin', 'provider'].map((role) => (
                                                                            <button
                                                                                key={role}
                                                                                className={`${styles.dropdownItem} ${client.role === role ? styles.dropdownItemActive : ''}`}
                                                                                onClick={async () => {
                                                                                    await updateUserRole({ variables: { userId: client.id, role } });
                                                                                    setOpenDropdownId(null);
                                                                                }}
                                                                            >
                                                                                {role.toUpperCase()}
                                                                            </button>
                                                                        ))}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                        <button
                                                            className={styles.btnCancel}
                                                            style={{ padding: '8px 20px', fontSize: '0.75rem', minWidth: '80px', height: 'auto', border: '1px solid var(--accent)' }}
                                                            onClick={() => {
                                                                setSelectedClientForFiche({ ...client });
                                                                setIsFicheModalOpen(true);
                                                            }}
                                                        >
                                                            {t('ficheClient')}
                                                        </button>
                                                        <button
                                                            className={styles.btnSaveLux}
                                                            style={{ padding: '8px 20px', fontSize: '0.75rem', minWidth: '100px' }}
                                                            onClick={() => {
                                                                setEditingClient({ ...client, password: '' });
                                                                setIsEditClientModalOpen(true);
                                                            }}
                                                        >
                                                            {t('edit') || 'Modifier'}
                                                        </button>
                                                        <button
                                                            className={styles.btnDeleteLux}
                                                            style={{ padding: '8px 20px', fontSize: '0.75rem', minWidth: '100px' }}
                                                            onClick={async () => {
                                                                if (confirm(t('confirmDeleteUser'))) {
                                                                    await removeUser({ variables: { userId: client.id } });
                                                                }
                                                            }}
                                                        >
                                                            {t('delete')}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className={styles.emptyState}>{t('noClients')}</div>
                                        )}
                                    </div>
                                </section>
                            </motion.div>
                        )}

                        {activeTab === 'caisse' && user?.role === 'admin' && (
                            <motion.div
                                key="caisse"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={styles.tabContent}
                            >
                                <section className={styles.section}>
                                    <div className={styles.sectionHeader} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div className={styles.statIconLux} style={{ background: 'rgba(223, 185, 109, 0.1)', width: '50px', height: '50px' }}>
                                            <DollarSign className="text-gold" />
                                        </div>
                                        <div>
                                            <h2 style={{ margin: 0 }}>Caisse & Facturation</h2>
                                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Suivi des consommations et règlements</p>
                                        </div>
                                    </div>
                                    <div className={styles.headerLine} style={{ margin: '20px 0 40px' }} />

                                    <div className={styles.clientsList}>
                                        {(data?.allReservations?.filter((r: any) => r.status === 'confirmed' || r.status === 'pending') || []).length > 0 ? (
                                            data?.allReservations?.filter((r: any) => r.status === 'confirmed' || r.status === 'pending').map((res: any) => (
                                                <div key={res.id} className={styles.clientCard} style={{ borderLeft: res.status === 'confirmed' ? '4px solid #DFB96D' : '4px solid #ccc' }}>
                                                    <div className={styles.clientIcon}>
                                                        <Clock size={20} />
                                                    </div>
                                                    <div className={styles.clientInfo}>
                                                        <h4>{res.user?.name || 'Client Inconnu'}</h4>
                                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'baseline' }}>
                                                            <p style={{ fontWeight: 600 }}>{res.service?.name}</p>
                                                            <span className="text-gold" style={{ fontWeight: 700 }}>{res.service?.price} DT</span>
                                                        </div>
                                                        <small style={{ color: 'var(--text-dim)' }}>{new Date(res.date).toLocaleString(language, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                        <span className={`${styles.statusBadge} ${res.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending}`}>
                                                            {res.status === 'confirmed' ? 'À Encaisser' : 'En Attente'}
                                                        </span>
                                                        <button
                                                            className={styles.btnSaveLux}
                                                            style={{ padding: '10px 25px', fontSize: '0.75rem' }}
                                                            onClick={async () => {
                                                                if (confirm(`Confirmer le règlement de ${res.service?.price} DT par ${res.user?.name}?`)) {
                                                                    await updateReservationStatus({ variables: { id: res.id, status: 'paid' } });
                                                                }
                                                            }}
                                                        >
                                                            Payer
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className={styles.emptyState}>Aucun service à encaisser pour le moment.</div>
                                        )}
                                    </div>
                                </section>

                                {/* Historical view */}
                                <section className={styles.section} style={{ marginTop: '60px' }}>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '25px', color: 'var(--text-main)' }}>Historique des Recettes (Aujourd'hui)</h3>
                                    <div className={styles.clientsList} style={{ opacity: 0.8 }}>
                                        {(data?.allReservations?.filter((r: any) => r.status === 'paid') || []).slice(0, 5).map((res: any) => (
                                            <div key={res.id} className={styles.clientCard} style={{ background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(223, 185, 109, 0.1)' }}>
                                                <div className={styles.clientIcon} style={{ background: 'rgba(45, 106, 79, 0.1)', color: '#2d6a4f' }}>
                                                    <UserCheck size={20} />
                                                </div>
                                                <div className={styles.clientInfo}>
                                                    <h4>{res.user?.name}</h4>
                                                    <p>{res.service?.name}</p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div className="text-gold" style={{ fontSize: '1.1rem', fontWeight: 800 }}>+{res.service?.price} DT</div>
                                                    <small style={{ color: '#2d6a4f', fontWeight: 600 }}>ENCASSÉ</small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
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
                                    <h3>{t('evaluateSpecialist')}</h3>
                                    <button className={styles.closeModal} onClick={() => setSelectedStaff(null)}>×</button>
                                </div>
                                <p className={styles.modalDesc}>{t('howWasSession', { name: prestataires.find((p: any) => p.id === selectedStaff)?.name })}</p>

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
                                                fill={rating >= star ? "#DFB96D" : "none"}
                                                color={rating >= star ? "#DFB96D" : "rgba(255,255,255,0.2)"}
                                            />
                                        </motion.button>
                                    ))}
                                </div>

                                <textarea
                                    placeholder={t('shareExperience')}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className={styles.modalTextarea}
                                />
                                <div className={styles.modalActions}>
                                    <button className={styles.btnCancel} onClick={() => {
                                        setSelectedStaff(null);
                                        setRating(0);
                                        setComment('');
                                    }}>{t('dismiss')}</button>
                                    <button className={styles.btnSaveLux} onClick={() => {
                                        alert(t('thankYouReview', { rating }));
                                        setSelectedStaff(null);
                                        setRating(0);
                                        setComment('');
                                    }}>{t('shareFeedback')}</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Booking Modal */}
                <AnimatePresence>
                    {isBookingModalOpen && (
                        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeAllModals()}>
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                                className={styles.modal}
                            >
                                <div className={styles.modalHeader}>
                                    <Sparkles className="text-gold" />
                                    <h3>{t('confirmReservation')}</h3>
                                    <button className={styles.closeModal} onClick={() => setIsBookingModalOpen(false)}>×</button>
                                </div>

                                <div className={styles.modalBody}>
                                    <h4 style={{ marginBottom: '10px' }}>{bookingService?.name}</h4>
                                    <p className="text-gold" style={{ marginBottom: '20px' }}>{bookingService?.price} DT • {bookingService?.duration}</p>

                                    <label className={styles.pickerLabel}>{t('selectDate')}</label>
                                    <div className={styles.calendarWrapper}>
                                        <div className={styles.calendarHeader}>
                                            <button className={styles.monthNavBtn} onClick={() => {
                                                const newDate = new Date(currentDisplayMonth);
                                                newDate.setMonth(newDate.getMonth() - 1);
                                                setCurrentDisplayMonth(newDate);
                                            }}><ChevronLeft size={16} /></button>
                                            <span className={styles.monthLabel}>
                                                {currentDisplayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                            </span>
                                            <button className={styles.monthNavBtn} onClick={() => {
                                                const newDate = new Date(currentDisplayMonth);
                                                newDate.setMonth(newDate.getMonth() + 1);
                                                setCurrentDisplayMonth(newDate);
                                            }}><ChevronRight size={16} /></button>
                                        </div>

                                        <div className={styles.calendarGrid}>
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                                <div key={i} className={styles.dayLabel}>{d}</div>
                                            ))}
                                            {(() => {
                                                const days = [];
                                                const year = currentDisplayMonth.getFullYear();
                                                const month = currentDisplayMonth.getMonth();
                                                const firstDay = new Date(year, month, 1).getDay();
                                                const daysInMonth = new Date(year, month + 1, 0).getDate();

                                                // Empty slots
                                                for (let i = 0; i < firstDay; i++) {
                                                    days.push(<div key={`empty-${i}`} className={`${styles.calendarDay} ${styles.empty}`} />);
                                                }

                                                // Days
                                                for (let i = 1; i <= daysInMonth; i++) {
                                                    const d = new Date(year, month, i);
                                                    const dateStr = d.toISOString().split('T')[0];
                                                    const isSelected = selectedDayLine === dateStr;
                                                    const isToday = new Date().toISOString().split('T')[0] === dateStr;
                                                    const isPast = d < new Date(new Date().setHours(0, 0, 0, 0));

                                                    days.push(
                                                        <div
                                                            key={i}
                                                            className={`
                                                                ${styles.calendarDay} 
                                                                ${isSelected ? styles.selected : ''} 
                                                                ${isToday ? styles.today : ''}
                                                                ${isPast ? styles.disabled : ''}
                                                            `}
                                                            onClick={() => {
                                                                if (!isPast) {
                                                                    setSelectedDayLine(dateStr);
                                                                    setSelectedTimeLine('');
                                                                    setBookingDate('');
                                                                }
                                                            }}
                                                        >
                                                            {i}
                                                        </div>
                                                    );
                                                }
                                                return days;
                                            })()}
                                        </div>
                                    </div>

                                    {selectedDayLine && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                            <label className={styles.pickerLabel}>{t('availableTime')}</label>
                                            <div className={styles.timeGrid}>
                                                {['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                                                    <div
                                                        key={time}
                                                        className={`${styles.timeChip} ${selectedTimeLine === time ? styles.active : ''}`}
                                                        onClick={() => {
                                                            setSelectedTimeLine(time);
                                                            // Set the full ISO string expected by the mutation
                                                            const fullDate = `${selectedDayLine}T${time}:00.000Z`; // simplified ISO
                                                            setBookingDate(fullDate);
                                                        }}
                                                    >
                                                        {time}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    <label className={styles.pickerLabel}>{t('selectSpecialist')}</label>
                                    <div className={styles.specialistGrid}>
                                        {prestataires.map((p: any) => (
                                            <div
                                                key={p.id}
                                                onClick={() => setBookingStaff(p.id)}
                                                style={{
                                                    border: bookingStaff === p.id ? '1px solid #DFB96D' : '1px solid rgba(255,255,255,0.1)',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    background: bookingStaff === p.id ? 'rgba(223, 185, 109, 0.2)' : 'transparent'
                                                }}
                                            >
                                                <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginBottom: '5px' }} />
                                                <div className={styles.specialistName}>{p.name}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={styles.modalActions}>
                                        <button className={styles.btnCancel} onClick={() => setIsBookingModalOpen(false)}>{t('cancel')}</button>
                                        <button className={styles.btnSaveLux} onClick={async () => {
                                            if (!bookingDate || !bookingStaff) {
                                                alert(t('availableTime')); // Or a specific error
                                                return;
                                            }
                                            try {
                                                await createReservation({
                                                    variables: {
                                                        userId: user?.id,
                                                        serviceId: bookingService?.id,
                                                        prestataireId: bookingStaff,
                                                        date: bookingDate
                                                    }
                                                });
                                                alert(t('resConfirmed'));
                                                setIsBookingModalOpen(false);
                                            } catch (e) {
                                                console.error(e);
                                                alert(t('bookingFailed'));
                                            }
                                        }}>{t('confirmBooking')}</button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Cart Modal */}
                <AnimatePresence>
                    {isCartModalOpen && (
                        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeAllModals()}>
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                                className={styles.modal}
                            >
                                <div className={styles.modalHeader}>
                                    <ShoppingBag className="text-gold" />
                                    <h3>{t('cart')}</h3>
                                    <button className={styles.closeModal} onClick={() => setIsCartModalOpen(false)}>×</button>
                                </div>

                                <div className={styles.modalBody} style={{ padding: '0 20px', maxHeight: '500px', overflowY: 'auto' }}>
                                    {/* Products */}
                                    {cart.length > 0 && (
                                        <div style={{ marginBottom: '20px' }}>
                                            <h4 style={{ marginBottom: '10px', fontSize: '1.2rem' }}>{t('products')}</h4>
                                            {cart.map((item, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                                    <span>{item.name}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                        <span style={{ fontWeight: '600' }}>{item.price} DT</span>
                                                        <button
                                                            onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                                                            style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '5px' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Unpaid Reservations */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <h4 style={{ marginBottom: '10px', fontSize: '1.2rem' }}>{t('pendingServices')}</h4>
                                        {/* Filter for pending reservations if status exists, otherwise show all recent */}
                                        {waitingData?.myReservations?.filter((r: any) => r.status === 'pending').map((r: any) => (
                                            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                                <div>
                                                    <div style={{ fontWeight: '500' }}>{r.service.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(r.date.includes('-') ? r.date : parseInt(r.date)).toLocaleDateString()}</div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <span style={{ fontWeight: '600' }}>{r.service.price} DT</span>
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm(t('cancelRes'))) {
                                                                const res = await deleteReservation({ variables: { id: r.id } });
                                                                if ((res.data as any)?.deleteReservation) {
                                                                    alert(t('resCancelled'));
                                                                } else {
                                                                    alert(t('failCancel'));
                                                                }
                                                            }
                                                        }}
                                                        style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '5px' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {(!waitingData?.myReservations || waitingData.myReservations.length === 0) && <p>{t('noPending')}</p>}
                                    </div>

                                    {/* Total */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #DFB96D', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                        <span>{t('total')}</span>
                                        <span>
                                            {(
                                                cart.reduce((sum, item) => sum + (parseFloat(item.price) || item.price || 0), 0) +
                                                (waitingData?.myReservations?.filter((r: any) => r.status === 'pending').reduce((sum: number, r: any) => sum + (parseFloat(r.service.price) || r.service.price || 0), 0) || 0)
                                            ).toFixed(2)} DT
                                        </span>
                                    </div>

                                    <div className={styles.modalActions} style={{ marginTop: '30px' }}>
                                        <button className={styles.btnCancel} onClick={() => setIsCartModalOpen(false)}>{t('continueShopping')}</button>
                                        <button className={styles.btnSaveLux} onClick={() => alert('Proceeding to payment gateway...')}>
                                            {t('pay')} <ArrowUpRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Rating Modal */}
                <AnimatePresence>
                    {isRatingModalOpen && (
                        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeAllModals()}>
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className={styles.modal}
                            >
                                <div className={styles.modalHeader}>
                                    <Star className="text-gold" />
                                    <h3>{t('evaluateSpecialist')}</h3>
                                    <button className={styles.closeModal} onClick={() => setIsRatingModalOpen(false)}>×</button>
                                </div>
                                <div className={styles.modalBody}>
                                    <div className={styles.starRating}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                className={styles.starBtn}
                                                onClick={() => setRating(star)}
                                                style={{ color: star <= rating ? '#DFB96D' : '#ddd' }}
                                            >
                                                <Star size={32} fill={star <= rating ? '#DFB96D' : 'none'} />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        className={styles.modalTextarea}
                                        placeholder={t('shareThought')}
                                        value={waitingComment}
                                        onChange={(e) => setWaitingComment(e.target.value)}
                                    />
                                    <div className={styles.modalActions}>
                                        <button className={styles.btnCancel} onClick={() => setIsRatingModalOpen(false)}>{t('cancel')}</button>
                                        <button className={styles.btnSaveLux} onClick={async () => {
                                            if (!selectedStaff) return;
                                            try {
                                                await addPersonnelEvaluation({
                                                    variables: {
                                                        userId: user?.id,
                                                        personnelId: selectedStaff,
                                                        rating: rating,
                                                        comment: waitingComment
                                                    }
                                                });
                                                Swal.fire({ title: t('success'), text: t('evalSaved'), icon: 'success', confirmButtonColor: '#DFB96D', background: '#F8F5F0' });
                                                setIsRatingModalOpen(false);
                                                setRating(0);
                                                setWaitingComment('');
                                            } catch (e) {
                                                console.error(e);
                                                Swal.fire({ title: t('error'), text: t('evalFailed'), icon: 'error', confirmButtonColor: '#DFB96D', background: '#F8F5F0' });
                                            }
                                        }}>{t('saveEvaluation')}</button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {activeTab === 'feedback' && user?.role === 'admin' && (
                        <motion.div
                            key="feedback"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className={styles.tabContent}
                        >
                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2>{t('feedback')}</h2>
                                    <div className={styles.headerLine} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
                                    <div>
                                        <h3>{t('evaluateSpecialist')}</h3>
                                        <div className={styles.feedbackGrid}>
                                            {feedbackData?.personnelEvaluations && feedbackData.personnelEvaluations.length > 0 ? (
                                                feedbackData.personnelEvaluations.map((evalItem: any) => (
                                                    <div key={evalItem.id} className={styles.feedbackCard}>
                                                        <div className={styles.feedbackHeader}>
                                                            <div>
                                                                <div className={styles.feedbackUser}>{evalItem.user.name}</div>
                                                                <div className={styles.feedbackSub}>{t('with')} {evalItem.prestataire.name}</div>
                                                            </div>
                                                            <div className={styles.starRatingSmall}>
                                                                {[1, 2, 3, 4, 5].map(s => (
                                                                    <Star key={s} size={14} fill={s <= evalItem.rating ? '#DFB96D' : 'none'} color={s <= evalItem.rating ? '#DFB96D' : '#ddd'} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className={styles.feedbackText}>"{evalItem.comment}"</p>
                                                        <div className={styles.feedbackDate}>
                                                            <Clock size={12} style={{ marginRight: '5px' }} />
                                                            {new Date(parseInt(evalItem.createdAt)).toLocaleDateString(language, { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className={styles.emptyState}>{t('noPending')}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3>{t('liveLounge')}</h3>
                                        <div className={styles.feedbackGrid}>
                                            {feedbackData?.waitingComments && feedbackData.waitingComments.length > 0 ? (
                                                feedbackData.waitingComments.map((comment: any) => (
                                                    <div key={comment.id} className={styles.feedbackCard}>
                                                        <div className={styles.feedbackHeader}>
                                                            <div>
                                                                <div className={styles.feedbackUser}>{comment.user.name}</div>
                                                                <div className={styles.feedbackSub}>{comment.user.email}</div>
                                                            </div>
                                                        </div>
                                                        <p className={styles.feedbackText}>{comment.comment}</p>
                                                        <div className={styles.feedbackDate}>
                                                            <Clock size={12} style={{ marginRight: '5px' }} />
                                                            {new Date(parseInt(comment.createdAt)).toLocaleDateString(language, { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className={styles.emptyState}>{t('noPending')}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Clients Management Modal */}
                <AnimatePresence>
                    {isClientsModalOpen && (
                        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeAllModals()}>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                                className={styles.modalWide}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className={styles.modalHeader}>
                                    <div className={styles.statIconLux} style={{ background: 'rgba(223, 185, 109, 0.15)', width: '45px', height: '45px' }}>
                                        <Users color="var(--accent)" size={20} />
                                    </div>
                                    <h3>{t('manageClients')}</h3>
                                    <button onClick={() => setIsClientsModalOpen(false)} className={styles.closeBtn}>×</button>
                                </div>
                                <div className={styles.modalBody}>
                                    <div className={styles.clientListTable}>
                                        <div className={styles.tableHeader} style={{ gridTemplateColumns: '1.5fr 1.5fr 0.8fr 1fr' }}>
                                            <span>{t('name')}</span>
                                            <span>{t('email')}</span>
                                            <span>Points</span>
                                            <span>Action</span>
                                        </div>
                                        {data?.clients?.map((client: any) => (
                                            <div key={client.id} className={styles.tableRow} style={{ gridTemplateColumns: '1.5fr 1.5fr 0.8fr 1fr' }} onClick={() => {
                                                setSelectedClientForFiche({ ...client });
                                                setIsFicheModalOpen(true);
                                            }}>
                                                <div className={styles.tableName}>
                                                    <div className={styles.avatarMini} style={{ overflow: 'hidden' }}>
                                                        {client.image ? (
                                                            <img src={client.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            client.name ? client.name[0] : 'U'
                                                        )}
                                                    </div>
                                                    <span>{client.name || 'Unknown User'}</span>
                                                </div>
                                                <span style={{ opacity: 0.7, fontSize: '0.85rem' }}>{client.email}</span>
                                                <div className={styles.clientPointBadge}>
                                                    <Sparkles size={12} />
                                                    <span>{client.points || 0}</span>
                                                </div>
                                                <button className={styles.viewBtn} onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingClient(client);
                                                    setIsEditClientModalOpen(true);
                                                }}>{t('edit')}</button>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedClientForDetails && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={styles.clientDetailsPanel}
                                        >
                                            <div className={styles.detailsGrid}>
                                                <div className={styles.detailsSection}>
                                                    <h4>Historique Financier</h4>
                                                    <div className={styles.monthlyRevenueGrid}>
                                                        {getClientMonthlyPayments(selectedClientForDetails.id).map((item, idx) => (
                                                            <div key={idx} className={styles.monthlyPaymentCard}>
                                                                <span className={styles.monthName}>{item.month}</span>
                                                                <span className={styles.monthAmount}>{item.amount.toLocaleString()} <small style={{ fontSize: '0.6em' }}>DT</small></span>
                                                            </div>
                                                        ))}
                                                        {getClientMonthlyPayments(selectedClientForDetails.id).length === 0 && (
                                                            <div className={styles.noDataText}>
                                                                <Activity size={32} style={{ marginBottom: '10px', opacity: 0.2 }} />
                                                                <p>Aucun paiement confirmé.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className={styles.detailsSection}>
                                                    <h4>Services Réservés</h4>
                                                    <div className={styles.intelList} style={{ background: 'transparent', padding: 0 }}>
                                                        {data?.allReservations?.filter((res: any) => res.user.id === selectedClientForDetails.id).map((res: any) => (
                                                            <div key={res.id} className={styles.intelItem} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', padding: '10px 0' }}>
                                                                <div className={styles.intelTime} style={{ width: 'auto', minWidth: '100px' }}>
                                                                    {new Date(res.date).toLocaleDateString(language)}
                                                                </div>
                                                                <div className={styles.intelDetails}>
                                                                    <strong>{res.service.name}</strong>
                                                                    <span>{res.status}</span>
                                                                </div>
                                                                <div style={{ fontWeight: 'bold' }}>{res.service.price} DT</div>
                                                            </div>
                                                        ))}
                                                        {data?.allReservations?.filter((res: any) => res.user.id === selectedClientForDetails.id).length === 0 && (
                                                            <p className={styles.emptyIntel}>Aucune réservation.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Specialists Management Modal */}
                <AnimatePresence>
                    {isSpecialistsModalOpen && (
                        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeAllModals()}>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                                className={styles.modalWide}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className={styles.modalHeader}>
                                    <div className={styles.statIconLux} style={{ background: 'rgba(223, 185, 109, 0.15)', width: '45px', height: '45px' }}>
                                        <Briefcase color="#2D6A4F" size={20} />
                                    </div>
                                    <h3>{t('totalSpecialists')}</h3>
                                    <button onClick={() => setIsSpecialistsModalOpen(false)} className={styles.closeBtn}>×</button>
                                </div>
                                <div className={styles.modalBody}>
                                    <div className={styles.clientListTable}>
                                        <div className={styles.tableHeader} style={{ gridTemplateColumns: '0.5fr 2fr 2fr 1fr' }}>
                                            <span>Img</span>
                                            <span>{t('name')}</span>
                                            <span>{t('expertiseLevels')}</span>
                                            <span>Rating</span>
                                        </div>
                                        {prestataires.map((staff: any) => (
                                            <div key={staff.id} className={styles.tableRow} style={{ gridTemplateColumns: '0.5fr 2fr 2fr 1fr' }}>
                                                <img src={staff.image} style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
                                                <div className={styles.tableName}>
                                                    <span>{staff.name}</span>
                                                </div>
                                                <span style={{ opacity: 0.7 }}>{staff.specialty}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', color: 'var(--accent)' }}>
                                                    <Star size={14} fill="currentColor" />
                                                    <span>{staff.rating}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Revenue Management Modal */}
                <AnimatePresence>
                    {isRevenueModalOpen && (
                        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeAllModals()}>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                                className={styles.modalWide}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className={styles.modalHeader}>
                                    <div className={styles.statIconLux} style={{ background: 'rgba(223, 185, 109, 0.15)', width: '45px', height: '45px' }}>
                                        <DollarSign color="#D62828" size={20} />
                                    </div>
                                    <h3>Analyse Détaillée des Revenus</h3>
                                    <button onClick={() => setIsRevenueModalOpen(false)} className={styles.closeBtn}>×</button>
                                </div>
                                <div className={styles.modalBody}>
                                    <div className={styles.revenueFilterRow}>
                                        <div className={styles.datePickerGroup}>
                                            <div className={styles.dateField}>
                                                <label>Date Début</label>
                                                <input
                                                    type="date"
                                                    value={revenueDateRange.start}
                                                    onChange={(e) => setRevenueDateRange(prev => ({ ...prev, start: e.target.value }))}
                                                />
                                            </div>
                                            <div className={styles.dateField}>
                                                <label>Date Fin</label>
                                                <input
                                                    type="date"
                                                    value={revenueDateRange.end}
                                                    onChange={(e) => setRevenueDateRange(prev => ({ ...prev, end: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.quickFilterGroup}>
                                            <button className={styles.quickFilterBtn} onClick={() => setRevenueDateRange({ start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] })}>Aujourd'hui</button>
                                            <button className={styles.quickFilterBtn} onClick={() => {
                                                const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
                                                const end = new Date().toISOString().split('T')[0];
                                                setRevenueDateRange({ start, end });
                                            }}>Ce Mois</button>
                                        </div>
                                    </div>

                                    <div className={styles.revenueStatsBanner}>
                                        <div className={styles.bannerMain}>
                                            <span>Total Période</span>
                                            <strong>{getRevenueReport().reduce((acc, curr) => acc + curr.total, 0).toLocaleString()} DT</strong>
                                        </div>
                                        <div className={styles.bannerSub}>
                                            <span>Transactions</span>
                                            <strong>{getRevenueReport().reduce((acc, curr) => acc + curr.count, 0)}</strong>
                                        </div>
                                    </div>

                                    {/* Revenue Goal Progress */}
                                    <div className={styles.goalContainer}>
                                        <div className={styles.goalHeader}>
                                            <span>Objectif Mensuel</span>
                                            <span>{Math.round((getRevenueReport().reduce((acc, curr) => acc + curr.total, 0) / 15000) * 100)}%</span>
                                        </div>
                                        <div className={styles.goalBar}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, (getRevenueReport().reduce((acc, curr) => acc + curr.total, 0) / 15000) * 100)}%` }}
                                                className={styles.goalFill}
                                            />
                                        </div>
                                        <p className={styles.goalText}>Cible: 15,000 DT</p>
                                    </div>

                                    <div className={styles.clientListTable}>
                                        <div className={styles.tableHeader} style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                                            <span>Service / Produit</span>
                                            <span>Ventes</span>
                                            <span>Total (DT)</span>
                                        </div>
                                        {getRevenueReport().map((item, idx) => (
                                            <div key={idx} className={styles.tableRow} style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                                                <div className={styles.tableName}>
                                                    <div className={styles.avatarMini} style={{ background: '#F8F5F0', color: 'var(--accent)' }}>
                                                        <ShoppingBag size={14} />
                                                    </div>
                                                    <span>{item.name}</span>
                                                </div>
                                                <span style={{ fontWeight: 'bold' }}>{item.count}</span>
                                                <span style={{ color: '#2D6A4F', fontWeight: 'bold' }}>{item.total.toLocaleString()} DT</span>
                                            </div>
                                        ))}
                                        {getRevenueReport().length === 0 && (
                                            <div className={styles.noDataText}>Aucune donnée pour cette période.</div>
                                        )}
                                    </div>

                                    <div className={styles.modalSubHeader} style={{ marginTop: '40px' }}>
                                        <h4>Répartition par Spécialiste</h4>
                                    </div>

                                    <div className={styles.clientListTable}>
                                        <div className={styles.tableHeader} style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                                            <span>Spécialiste</span>
                                            <span>Prestations</span>
                                            <span>Revenu Généré</span>
                                        </div>
                                        {getStaffRevenueReport().map((item, idx) => (
                                            <div key={idx} className={styles.tableRow} style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                                                <div className={styles.tableName}>
                                                    <div className={styles.avatarMini} style={{ background: 'rgba(45, 106, 79, 0.1)', color: '#2D6A4F' }}>
                                                        <UserCheck size={14} />
                                                    </div>
                                                    <span>{item.name}</span>
                                                </div>
                                                <span style={{ fontWeight: 'bold' }}>{item.count}</span>
                                                <span style={{ color: '#2D6A4F', fontWeight: 'bold' }}>{item.total.toLocaleString()} DT</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Agenda Management Modal */}
                <AnimatePresence>
                    {isAgendaModalOpen && (
                        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeAllModals()}>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                                className={styles.modalWide}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className={styles.modalHeader}>
                                    <div className={styles.statIconLux} style={{ background: 'rgba(223, 185, 109, 0.15)', width: '45px', height: '45px' }}>
                                        <Calendar color="var(--accent)" size={20} />
                                    </div>
                                    <h3>Agenda Complet du Jour</h3>
                                    <button onClick={() => setIsAgendaModalOpen(false)} className={styles.closeBtn}>×</button>
                                </div>
                                <div className={styles.modalBody}>
                                    <div className={styles.revenueFilterRow}>
                                        <div className={styles.searchGroup}>
                                            <Search size={18} color="var(--text-dim)" />
                                            <input
                                                type="text"
                                                placeholder="Rechercher un client ou prestataire..."
                                                value={agendaSearch}
                                                onChange={(e) => setAgendaSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.dateField}>
                                            <label>Filtrer par Service</label>
                                            <select
                                                value={agendaServiceFilter}
                                                onChange={(e) => setAgendaServiceFilter(e.target.value)}
                                                className={styles.filterSelect}
                                            >
                                                <option value="">Tous les services</option>
                                                {Array.from(new Set(getTodaysAgenda().map((r: any) => r.service?.name).filter(Boolean))).map((name: any) => (
                                                    <option key={name} value={name}>{name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className={styles.clientListTable}>
                                        <div className={styles.tableHeader} style={{ gridTemplateColumns: '1fr 2fr 1.5fr 1fr' }}>
                                            <span>Heure</span>
                                            <span>Service / Client</span>
                                            <span>Spécialiste</span>
                                            <span>Statut</span>
                                        </div>
                                        {getTodaysAgenda().filter((res: any) => {
                                            const matchesSearch =
                                                (res.user?.name || '').toLowerCase().includes(agendaSearch.toLowerCase()) ||
                                                (res.prestataire?.name || '').toLowerCase().includes(agendaSearch.toLowerCase());
                                            const matchesService = !agendaServiceFilter || res.service?.name === agendaServiceFilter;
                                            return matchesSearch && matchesService;
                                        }).map((res: any) => (
                                            <div key={res.id} className={styles.tableRow} style={{ gridTemplateColumns: '1fr 2fr 1.5fr 1fr' }}>
                                                <div className={styles.agendaTimeCell}>
                                                    {new Date(res.date).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className={styles.tableName}>
                                                    <div className={styles.serviceClientInfo}>
                                                        <strong>{res.service?.name || 'Service Inconnu'}</strong>
                                                        <span className={styles.clientSub}>{res.user?.name || 'Client Anonyme'}</span>
                                                    </div>
                                                </div>
                                                <div className={styles.specialistBadge}>
                                                    <UserCheck size={12} />
                                                    <span>{res.prestataire?.name || 'Non assigné'}</span>
                                                </div>
                                                <div className={`${styles.intelStatus} ${styles[res.status]}`} style={{ width: 'fit-content' }}>
                                                    {res.status}
                                                </div>
                                            </div>
                                        ))}
                                        {getTodaysAgenda().length === 0 && (
                                            <div className={styles.noDataText}>Aucun rendez-vous aujourd'hui.</div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Edit & Action Modals (Placed at the end for correct layering) */}
                <AnimatePresence>
                    {isEditClientModalOpen && editingClient && (
                        <div className={styles.modalOverlay} style={{ zIndex: 2000 }} onClick={(e) => e.target === e.currentTarget && setIsEditClientModalOpen(false)}>
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className={styles.modal}
                            >
                                <div className={styles.modalHeader}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '15px' }}>
                                        <Edit2 className="text-gold" />
                                        <h3 style={{ margin: 0 }}>{t('editUser') || 'Modifier Utilisateur'}</h3>
                                        <div className={styles.headerLine} style={{ width: '60px' }} />
                                    </div>
                                    <button className={styles.closeModal} onClick={() => setIsEditClientModalOpen(false)}>×</button>
                                </div>
                                <div className={styles.modalBody}>
                                    <div style={{ display: 'grid', gap: '20px' }}>
                                        <div className={styles.inputGroup}>
                                            <label>{t('name')}</label>
                                            <input
                                                type="text"
                                                className={styles.luxuryInput}
                                                value={editingClient.name}
                                                onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('email')}</label>
                                            <input
                                                type="email"
                                                className={styles.luxuryInput}
                                                value={editingClient.email}
                                                onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('memberStatus')}</label>
                                            <select
                                                className={styles.luxuryInput}
                                                value={editingClient.tier || 'Normal'}
                                                onChange={(e) => setEditingClient({ ...editingClient, tier: e.target.value })}
                                                style={{ background: 'var(--primary)', color: 'white' }}
                                            >
                                                <option value="Normal">{t('normalMember')}</option>
                                                <option value="Membre Gold">{t('goldMember')}</option>
                                            </select>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('password')} ({t('leaveEmpty') || 'Laisser vide pour ne pas changer'})</label>
                                            <input
                                                type="password"
                                                className={styles.luxuryInput}
                                                value={editingClient.password || ''}
                                                onChange={(e) => setEditingClient({ ...editingClient, password: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.modalActions} style={{ marginTop: '40px' }}>
                                        <button className={styles.btnCancel} onClick={() => setIsEditClientModalOpen(false)}>{t('cancel')}</button>
                                        <button className={styles.btnSaveLux} onClick={async () => {
                                            try {
                                                const vars: any = {
                                                    userId: editingClient.id,
                                                    name: editingClient.name,
                                                    email: editingClient.email,
                                                    role: editingClient.role,
                                                    tier: editingClient.tier
                                                };
                                                if (editingClient.password) {
                                                    vars.password = editingClient.password;
                                                }
                                                await updateUser({ variables: vars });
                                                Swal.fire({ title: 'Succès', text: 'Utilisateur mis à jour !', icon: 'success', confirmButtonColor: '#DFB96D', background: '#F8F5F0' });
                                                setIsEditClientModalOpen(false);
                                            } catch (e) {
                                                console.error(e);
                                                Swal.fire({ title: 'Erreur', text: 'Erreur lors de la mise à jour', icon: 'error', confirmButtonColor: '#DFB96D', background: '#F8F5F0' });
                                            }
                                        }}>{t('save')}</button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Edit Service Modal */}
                    {isEditServiceModalOpen && editingService && (
                        <div className={styles.modalOverlay} style={{ zIndex: 2000 }} onClick={(e) => e.target === e.currentTarget && setIsEditServiceModalOpen(false)}>
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className={styles.modal}
                            >
                                <div className={styles.modalHeader}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '15px' }}>
                                        <Edit2 className="text-gold" />
                                        <h3 style={{ margin: 0 }}>{t('editService') || 'Modifier Service'}</h3>
                                        <div className={styles.headerLine} style={{ width: '60px' }} />
                                    </div>
                                    <button className={styles.closeModal} onClick={() => setIsEditServiceModalOpen(false)}>×</button>
                                </div>
                                <div className={styles.modalBody}>
                                    <div style={{ display: 'grid', gap: '20px' }}>
                                        <div className={styles.uploadContainer}>
                                            <div className={styles.previewTile} onClick={() => document.getElementById('edit-service-upload')?.click()}>
                                                {editingService.image ? (
                                                    <img src={editingService.image} alt="Preview" />
                                                ) : (
                                                    <div className={styles.previewPlaceholder}>
                                                        <Upload className="text-gold" />
                                                        <span>{t('uploadImage') || 'Télécharger une image'}</span>
                                                    </div>
                                                )}
                                                <div className={styles.uploadOverlay}>
                                                    <Upload size={24} />
                                                    <span>{t('changeImage') || 'Changer l\'image'}</span>
                                                </div>
                                                {isUploading && (
                                                    <div className={styles.uploadLoading}>
                                                        <Loader2 className="animate-spin text-gold" />
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                id="edit-service-upload"
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleFileUpload(e, 'edit')}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('name')}</label>
                                            <input
                                                type="text"
                                                className={styles.luxuryInput}
                                                value={editingService.name}
                                                onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('description')}</label>
                                            <textarea
                                                className={`${styles.luxuryInput} ${styles.textArea}`}
                                                value={editingService.description}
                                                onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                            <div className={styles.inputGroup}>
                                                <label>{t('price')} (DT)</label>
                                                <input
                                                    type="number"
                                                    className={styles.luxuryInput}
                                                    value={editingService.price}
                                                    onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>{t('duration')}</label>
                                                <input
                                                    type="text"
                                                    className={styles.luxuryInput}
                                                    value={editingService.duration}
                                                    onChange={(e) => setEditingService({ ...editingService, duration: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.modalActions} style={{ marginTop: '30px' }}>
                                        <button className={styles.btnCancel} onClick={() => setIsEditServiceModalOpen(false)}>{t('cancel')}</button>
                                        <button className={styles.btnSaveLux} onClick={async () => {
                                            try {
                                                await updateService({
                                                    variables: {
                                                        id: editingService.id,
                                                        name: editingService.name,
                                                        description: editingService.description,
                                                        price: parseFloat(editingService.price),
                                                        image: editingService.image,
                                                        duration: editingService.duration
                                                    }
                                                });
                                                Swal.fire({ title: 'Succès', text: 'Service mis à jour !', icon: 'success', confirmButtonColor: '#DFB96D', background: '#F8F5F0' });
                                                setIsEditServiceModalOpen(false);
                                            } catch (e) {
                                                console.error(e);
                                                Swal.fire({ title: 'Erreur', text: 'Erreur lors de la mise à jour du service', icon: 'error', confirmButtonColor: '#DFB96D', background: '#F8F5F0' });
                                            }
                                        }}>{t('save')}</button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Add Product Modal */}
                    {isAddProductModalOpen && (
                        <div className={styles.modalOverlay} style={{ zIndex: 2000 }} onClick={(e) => e.target === e.currentTarget && setIsAddProductModalOpen(false)}>
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className={styles.modal}
                            >
                                <div className={styles.modalHeader}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '15px' }}>
                                        <Gift className="text-gold" />
                                        <h3 style={{ margin: 0 }}>{t('addProduct') || 'Ajouter un Produit'}</h3>
                                        <div className={styles.headerLine} style={{ width: '60px' }} />
                                    </div>
                                    <button className={styles.closeModal} onClick={() => setIsAddProductModalOpen(false)}>×</button>
                                </div>
                                <div className={styles.modalBody}>
                                    <div style={{ display: 'grid', gap: '20px' }}>
                                        <div className={styles.uploadContainer}>
                                            <div className={styles.previewTile} onClick={() => document.getElementById('new-product-upload')?.click()}>
                                                {newProduct.image ? (
                                                    <img src={newProduct.image} alt="Preview" />
                                                ) : (
                                                    <div className={styles.previewPlaceholder}>
                                                        <Upload className="text-gold" />
                                                        <span>{t('uploadImage') || 'Télécharger une image'}</span>
                                                    </div>
                                                )}
                                                {isUploading && (
                                                    <div className={styles.uploadLoading}>
                                                        <Loader2 className="animate-spin text-gold" />
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                id="new-product-upload"
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleFileUpload(e, 'newProduct')}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('name')}</label>
                                            <input
                                                type="text"
                                                className={styles.luxuryInput}
                                                placeholder="Sérum Éclat"
                                                value={newProduct.name}
                                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('description')}</label>
                                            <textarea
                                                className={`${styles.luxuryInput} ${styles.textArea}`}
                                                placeholder="Description du produit..."
                                                value={newProduct.description}
                                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('price')} (DT)</label>
                                            <input
                                                type="number"
                                                className={styles.luxuryInput}
                                                placeholder="85"
                                                value={newProduct.price}
                                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.modalActions} style={{ marginTop: '30px' }}>
                                        <button className={styles.btnCancel} onClick={() => setIsAddProductModalOpen(false)}>{t('cancel')}</button>
                                        <button className={styles.btnSaveLux} onClick={async () => {
                                            try {
                                                await addProduct({
                                                    variables: {
                                                        name: newProduct.name,
                                                        description: newProduct.description,
                                                        price: parseFloat(newProduct.price),
                                                        image: newProduct.image
                                                    }
                                                });
                                                Swal.fire({ title: 'Succès', text: t('productAdded') || 'Produit ajouté !', icon: 'success', confirmButtonColor: '#DFB96D', background: '#F8F5F0' });
                                                setIsAddProductModalOpen(false);
                                                setNewProduct({ name: '', description: '', price: '', image: '' });
                                            } catch (e) {
                                                console.error(e);
                                                Swal.fire({ title: 'Erreur', text: 'Erreur lors de l\'ajout du produit', icon: 'error', confirmButtonColor: '#DFB96D', background: '#F8F5F0' });
                                            }
                                        }}>{t('save')}</button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Edit Product Modal */}
                    {isEditProductModalOpen && editingProduct && (
                        <div className={styles.modalOverlay} style={{ zIndex: 2000 }} onClick={(e) => e.target === e.currentTarget && setIsEditProductModalOpen(false)}>
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className={styles.modal}
                            >
                                <div className={styles.modalHeader}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '15px' }}>
                                        <Edit2 className="text-gold" />
                                        <h3 style={{ margin: 0 }}>{t('editProduct') || 'Modifier Produit'}</h3>
                                        <div className={styles.headerLine} style={{ width: '60px' }} />
                                    </div>
                                    <button className={styles.closeModal} onClick={() => setIsEditProductModalOpen(false)}>×</button>
                                </div>
                                <div className={styles.modalBody}>
                                    <div style={{ display: 'grid', gap: '20px' }}>
                                        <div className={styles.uploadContainer}>
                                            <div className={styles.previewTile} onClick={() => document.getElementById('edit-product-upload')?.click()}>
                                                {editingProduct.image ? (
                                                    <img src={editingProduct.image} alt="Preview" />
                                                ) : (
                                                    <div className={styles.previewPlaceholder}>
                                                        <Upload className="text-gold" />
                                                        <span>{t('uploadImage') || 'Télécharger une image'}</span>
                                                    </div>
                                                )}
                                                <div className={styles.uploadOverlay}>
                                                    <Upload size={24} />
                                                    <span>{t('changeImage') || 'Changer l\'image'}</span>
                                                </div>
                                                {isUploading && (
                                                    <div className={styles.uploadLoading}>
                                                        <Loader2 className="animate-spin text-gold" />
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                id="edit-product-upload"
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleFileUpload(e, 'editProduct')}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('name')}</label>
                                            <input
                                                type="text"
                                                className={styles.luxuryInput}
                                                value={editingProduct.name}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('description')}</label>
                                            <textarea
                                                className={`${styles.luxuryInput} ${styles.textArea}`}
                                                value={editingProduct.description}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('price')} (DT)</label>
                                            <input
                                                type="number"
                                                className={styles.luxuryInput}
                                                value={editingProduct.price}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.modalActions} style={{ marginTop: '30px' }}>
                                        <button className={styles.btnCancel} onClick={() => setIsEditProductModalOpen(false)}>{t('cancel')}</button>
                                        <button className={styles.btnSaveLux} onClick={async () => {
                                            try {
                                                await updateProduct({
                                                    variables: {
                                                        id: editingProduct.id,
                                                        name: editingProduct.name,
                                                        description: editingProduct.description,
                                                        price: parseFloat(editingProduct.price),
                                                        image: editingProduct.image
                                                    }
                                                });
                                                Swal.fire({ title: 'Succès', text: t('productUpdated') || 'Produit mis à jour !', icon: 'success', confirmButtonColor: '#DFB96D', background: '#F8F5F0' });
                                                setIsEditProductModalOpen(false);
                                            } catch (e) {
                                                console.error(e);
                                                Swal.fire({ title: 'Erreur', text: 'Erreur lors de la mise à jour du produit', icon: 'error', confirmButtonColor: '#DFB96D', background: '#F8F5F0' });
                                            }
                                        }}>{t('save')}</button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                    {/* Fiche Client Modal starts here */}
                    {isFicheModalOpen && selectedClientForFiche && (
                        <div className={styles.modalOverlay} style={{ zIndex: 1100 }} onClick={(e) => e.target === e.currentTarget && setIsFicheModalOpen(false)}>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                                className={styles.modal}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className={styles.modalHeader}>
                                    <div className={styles.statIconLux} style={{ background: 'rgba(223, 185, 109, 0.15)', width: '60px', height: '60px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }} onClick={() => document.getElementById('fiche-client-upload')?.click()}>
                                        {selectedClientForFiche.image ? (
                                            <img src={selectedClientForFiche.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <UserCheck color="var(--accent)" size={24} />
                                        )}
                                        {isUploading && (
                                            <div className={styles.uploadLoading} style={{ background: 'rgba(0,0,0,0.4)' }}>
                                                <Loader2 className="animate-spin text-white" size={20} />
                                            </div>
                                        )}
                                        <div className={styles.uploadOverlay} style={{ opacity: 0 }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                                            <Upload color="white" size={16} />
                                        </div>
                                    </div>
                                    <input
                                        id="fiche-client-upload"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleFileUpload(e, 'ficheClient')}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginLeft: '15px' }}>
                                        <h3 style={{ margin: 0 }}>{t('ficheClient')}</h3>
                                        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>{selectedClientForFiche.name}</span>
                                    </div>
                                    <button onClick={() => setIsFicheModalOpen(false)} className={styles.closeBtn}>×</button>
                                </div>
                                <div className={styles.modalBody}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className={styles.inputGroup}>
                                            <label>{t('hairColorPref')}</label>
                                            <input type="text" className={styles.luxuryInput} placeholder="Blond polaire, Châtain doré..."
                                                value={selectedClientForFiche.hair_color_pref || ''}
                                                onChange={(e) => setSelectedClientForFiche({ ...selectedClientForFiche, hair_color_pref: e.target.value })} />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Coupe favorite</label>
                                            <input type="text" className={styles.luxuryInput} placeholder="Carré plongeant, Dégradé..."
                                                value={selectedClientForFiche.favorite_coupe || ''}
                                                onChange={(e) => setSelectedClientForFiche({ ...selectedClientForFiche, favorite_coupe: e.target.value })} />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Couleur faux ongles</label>
                                            <input type="text" className={styles.luxuryInput} placeholder="Rose nude, Rouge cerise..."
                                                value={selectedClientForFiche.nail_color_pref || ''}
                                                onChange={(e) => setSelectedClientForFiche({ ...selectedClientForFiche, nail_color_pref: e.target.value })} />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Type de peau</label>
                                            <input type="text" className={styles.luxuryInput} placeholder="Normale, Sèche, Mixte..."
                                                value={selectedClientForFiche.skin_type || ''}
                                                onChange={(e) => setSelectedClientForFiche({ ...selectedClientForFiche, skin_type: e.target.value })} />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Musique préférée</label>
                                            <input type="text" className={styles.luxuryInput} placeholder="Jazz, Lounge, Nature..."
                                                value={selectedClientForFiche.music_pref || ''}
                                                onChange={(e) => setSelectedClientForFiche({ ...selectedClientForFiche, music_pref: e.target.value })} />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Boisson favorite</label>
                                            <input type="text" className={styles.luxuryInput} placeholder="Thé vert, Eau infusée..."
                                                value={selectedClientForFiche.drink_pref || ''}
                                                onChange={(e) => setSelectedClientForFiche({ ...selectedClientForFiche, drink_pref: e.target.value })} />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('coffeePref')}</label>
                                            <input type="text" className={styles.luxuryInput} placeholder="Espresso, Cappuccino..."
                                                value={selectedClientForFiche.coffee_pref || ''}
                                                onChange={(e) => setSelectedClientForFiche({ ...selectedClientForFiche, coffee_pref: e.target.value })} />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('employeePref')}</label>
                                            <input type="text" className={styles.luxuryInput} placeholder="Elena Rodriguez..."
                                                value={selectedClientForFiche.employee_pref || ''}
                                                onChange={(e) => setSelectedClientForFiche({ ...selectedClientForFiche, employee_pref: e.target.value })} />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Téléphone</label>
                                            <input type="text" className={styles.luxuryInput} placeholder="+216 XX XXX XXX"
                                                value={selectedClientForFiche.phone || ''}
                                                onChange={(e) => setSelectedClientForFiche({ ...selectedClientForFiche, phone: e.target.value })} />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Date de naissance</label>
                                            <input type="date" className={styles.luxuryInput}
                                                value={selectedClientForFiche.birthday || ''}
                                                onChange={(e) => setSelectedClientForFiche({ ...selectedClientForFiche, birthday: e.target.value })} />
                                        </div>
                                        <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                                            <label>{t('allergies')}</label>
                                            <input type="text" className={styles.luxuryInput} placeholder="Allergie aux huiles, latex..."
                                                value={selectedClientForFiche.allergies || ''}
                                                onChange={(e) => setSelectedClientForFiche({ ...selectedClientForFiche, allergies: e.target.value })} />
                                        </div>
                                        <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                                            <label>{t('lastVisitNotes')}</label>
                                            <textarea className={`${styles.luxuryInput} ${styles.textArea}`} placeholder="Notes sur la dernière visite..."
                                                value={selectedClientForFiche.last_visit_notes || ''}
                                                onChange={(e) => setSelectedClientForFiche({ ...selectedClientForFiche, last_visit_notes: e.target.value })}
                                                style={{ minHeight: '80px' }} />
                                        </div>
                                    </div>
                                    <div className={styles.modalActions}>
                                        <button className={styles.btnCancel} onClick={() => setIsFicheModalOpen(false)}>{t('cancel')}</button>
                                        <button className={styles.btnSaveLux} onClick={async () => {
                                            try {
                                                await updateUser({
                                                    variables: {
                                                        userId: selectedClientForFiche.id,
                                                        hair_color_pref: selectedClientForFiche.hair_color_pref,
                                                        favorite_coupe: selectedClientForFiche.favorite_coupe,
                                                        nail_color_pref: selectedClientForFiche.nail_color_pref,
                                                        skin_type: selectedClientForFiche.skin_type,
                                                        music_pref: selectedClientForFiche.music_pref,
                                                        drink_pref: selectedClientForFiche.drink_pref,
                                                        coffee_pref: selectedClientForFiche.coffee_pref,
                                                        employee_pref: selectedClientForFiche.employee_pref,
                                                        favourite_service: selectedClientForFiche.favourite_service,
                                                        allergies: selectedClientForFiche.allergies,
                                                        last_visit_notes: selectedClientForFiche.last_visit_notes,
                                                        birthday: selectedClientForFiche.birthday,
                                                        phone: selectedClientForFiche.phone,
                                                        image: selectedClientForFiche.image
                                                    }
                                                });
                                                Swal.fire({ title: t('success'), text: 'Fiche client mise à jour !', icon: 'success', confirmButtonColor: '#DFB96D' });
                                                setIsFicheModalOpen(false);
                                            } catch (e) {
                                                console.error(e);
                                                Swal.fire({ title: t('error'), text: 'Une erreur est survenue.', icon: 'error' });
                                            }
                                        }}>{t('save')}</button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Specialist Historique Modal */}
                    {isHistoriqueModalOpen && selectedSpecialistForHistorique && (
                        <div className={styles.modalOverlay} style={{ zIndex: 1100 }} onClick={(e) => e.target === e.currentTarget && setIsHistoriqueModalOpen(false)}>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                                className={styles.modal}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className={styles.modalHeader}>
                                    <div className={styles.statIconLux} style={{ background: 'rgba(223, 185, 109, 0.15)', width: '45px', height: '45px' }}>
                                        <Clock color="var(--accent)" size={20} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginLeft: '15px' }}>
                                        <h3 style={{ margin: 0 }}>Historique Spécialiste</h3>
                                        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>{selectedSpecialistForHistorique.name}</span>
                                    </div>
                                    <button onClick={() => setIsHistoriqueModalOpen(false)} className={styles.closeBtn}>×</button>
                                </div>
                                <div className={styles.modalBody}>
                                    <div className={styles.inputGroup} style={{ marginTop: '10px' }}>
                                        <label>Notes & Historique de Travail</label>
                                        <textarea
                                            className={`${styles.luxuryInput} ${styles.textArea}`}
                                            placeholder="Saisissez l'historique de travail, les records de performance, etc..."
                                            value={selectedSpecialistForHistorique.historique || ''}
                                            onChange={(e) => setSelectedSpecialistForHistorique({ ...selectedSpecialistForHistorique, historique: e.target.value })}
                                            style={{ minHeight: '250px' }}
                                        />
                                    </div>
                                    <div className={styles.modalActions} style={{ marginTop: '30px' }}>
                                        <button className={styles.btnCancel} onClick={() => setIsHistoriqueModalOpen(false)}>{t('cancel')}</button>
                                        <button className={styles.btnSaveLux} onClick={async () => {
                                            try {
                                                await updateSpecialist({
                                                    variables: {
                                                        id: selectedSpecialistForHistorique.id,
                                                        historique: selectedSpecialistForHistorique.historique
                                                    }
                                                });
                                                Swal.fire({ title: t('success'), text: 'Historique mis à jour !', icon: 'success', confirmButtonColor: '#DFB96D' });
                                                setIsHistoriqueModalOpen(false);
                                            } catch (e) {
                                                console.error(e);
                                                Swal.fire({ title: t('error'), text: 'Une erreur est survenue.', icon: 'error' });
                                            }
                                        }}>{t('save')}</button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main >

            {/* ── ADMIN INBOX MODAL ── */}
            <AnimatePresence>
                {isAdminInboxOpen && user?.role === 'admin' && (
                    <AdminInbox
                        adminId={Number(user.id)}
                        adminName={user.name || 'Admin'}
                        onClose={() => {
                            setIsAdminInboxOpen(false);
                            // Re-fetch accurate unread count after closing inbox
                            fetch(`/api/chat/unread?userId=${user.id}`)
                                .then(r => r.json())
                                .then(d => setAdminUnreadCount(d.count || 0))
                                .catch(() => {});
                        }}
                        styles={styles}
                    />
                )}
            </AnimatePresence>

            {/* ── CLIENT FLOATING CHAT BUTTON + WINDOW ── */}
            {user?.role !== 'admin' && (
                <>
                    <AnimatePresence>
                        {isClientChatOpen && (
                            <ChatWindow
                                currentUserId={Number(user.id)}
                                currentUserRole={user.role || 'client'}
                                currentUserName={user.name || 'Client'}
                                otherUserId={1}
                                otherUserName="Vendôme Spa"
                                adminId={1}
                                onClose={() => { setIsClientChatOpen(false); setChatUnreadCount(0); }}
                                onUnreadChange={setChatUnreadCount}
                                styles={styles}
                            />
                        )}
                    </AnimatePresence>

                    <motion.button
                        className={styles.chatFloatBtn}
                        onClick={() => { setIsClientChatOpen(v => !v); if (!isClientChatOpen) setChatUnreadCount(0); }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1, type: 'spring' }}
                    >
                        <MessageSquare size={22} />
                        {chatUnreadCount > 0 && (
                            <span className={styles.chatFloatBadge}>{chatUnreadCount}</span>
                        )}
                    </motion.button>
                </>
            )}
        </div >
    );
}
