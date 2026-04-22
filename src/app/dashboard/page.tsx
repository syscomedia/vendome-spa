'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/LoadingScreen';
import FicheClientTab from '@/components/FicheClientTab';
import NotesTab from '@/components/NotesTab';
import AdminInbox from '@/components/AdminInbox';
import ChatWindow from '@/components/ChatWindow';
import DayMonthPicker from '@/components/DayMonthPicker';
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
    Plus,
    Mail,
    Camera,
    Banknote,
    Ticket,
    CreditCard,
    Percent,
    PenLine,
    Phone,
    RefreshCcw,
    X,
    Eye,
    EyeOff,
    Check
} from 'lucide-react';

const GOOGLE_CALENDAR_COLORS = [
    { id: '1', hex: '#7986cb', name: 'Lavender' },
    { id: '2', hex: '#33b679', name: 'Sage' },
    { id: '3', hex: '#8e24aa', name: 'Grape' },
    { id: '4', hex: '#e67c73', name: 'Flamingo' },
    { id: '5', hex: '#f6bf26', name: 'Banana' },
    { id: '6', hex: '#f4511e', name: 'Tangerine' },
    { id: '7', hex: '#039be5', name: 'Peacock' },
    { id: '8', hex: '#616161', name: 'Graphite' },
    { id: '9', hex: '#3f51b5', name: 'Blueberry' },
    { id: '10', hex: '#0b8043', name: 'Basil' },
    { id: '11', hex: '#d50000', name: 'Tomato' },
];

import { useQuery, useMutation } from '@apollo/client/react';
import { GET_DASHBOARD_DATA, GET_PRODUCTS, GET_WAITING_DATA, GET_ALL_FEEDBACK, GET_CLIENT_NOTES } from '@/graphql/queries';
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
    UPDATE_SPECIALIST_MUTATION,
    REGISTER_MUTATION,
    ADD_PRESTATAIRE_MUTATION,
    DELETE_SPECIALIST_MUTATION,
    DEDUCT_POINTS_MUTATION,
    ADD_CLIENT_NOTE_MUTATION,
    UPDATE_RESERVATION_DATE_MUTATION,
    SYNC_GOOGLE_CALENDAR_MUTATION,
    CONVERT_EXTERNAL_TO_RESERVATION_MUTATION,
    PURCHASE_PRODUCT_MUTATION
} from '@/graphql/mutations';
import { signOut, signIn } from 'next-auth/react';

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
    externalEvents: any[];
}

interface ExternalEvent {
    id: string;
    google_event_id: string;
    title: string;
    startDate: string;
    endDate: string;
    reservationId?: number;
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

const formatLocalDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const swalLux = (icon: 'success' | 'error' | 'warning' | 'info' | 'question', title: string, text?: string, options: any = {}) => {
    return Swal.fire({
        icon,
        title,
        text,
        customClass: {
            popup: styles.swalPopup,
            title: styles.swalTitle,
            htmlContainer: styles.swalText,
            confirmButton: styles.swalConfirmButton,
            cancelButton: styles.swalCancelButton,
            input: styles.swalSelect
        },
        buttonsStyling: false,
        confirmButtonText: 'OK',
        background: '#1A0F0A',
        color: '#ffffff',
        didOpen: (popup) => {
            // Force high z-index to stay above other modals on mobile
            const container = Swal.getContainer();
            if (container) container.style.zIndex = '3000';
            if (options.didOpen) options.didOpen(popup);
        },
        ...options
    });
};

export default function Dashboard() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);

    const { data, loading, error } = useQuery<DashboardData>(GET_DASHBOARD_DATA, {
        variables: { userId: user?.id }
    });
    const { data: productsData } = useQuery<ProductsData>(GET_PRODUCTS);
    const { data: waitingData } = useQuery<WaitingData>(GET_WAITING_DATA, {
        variables: { userId: user?.id }
    });
    const { data: feedbackData } = useQuery<FeedbackData>(GET_ALL_FEEDBACK, { skip: user?.role !== 'admin' });
    const [createReservation] = useMutation(CREATE_RESERVATION_MUTATION, {
        refetchQueries: [
            { query: GET_WAITING_DATA, variables: { userId: user?.id } },
            { query: GET_DASHBOARD_DATA, variables: { userId: user?.id } }
        ]
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

    const [removeUser] = useMutation(REMOVE_USER_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });
    const [addService] = useMutation(ADD_SERVICE_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });
    const [updateUser] = useMutation(UPDATE_USER_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });
    const [updateService] = useMutation(UPDATE_SERVICE_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });
    const [addProduct] = useMutation(ADD_PRODUCT_MUTATION, { refetchQueries: [{ query: GET_PRODUCTS }] });
    const [updateProduct] = useMutation(UPDATE_PRODUCT_MUTATION, { refetchQueries: [{ query: GET_PRODUCTS }] });
    const [removeProduct] = useMutation(REMOVE_PRODUCT_MUTATION, { refetchQueries: [{ query: GET_PRODUCTS }] });
    const [updateReservationStatus] = useMutation(UPDATE_RESERVATION_STATUS_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }, { query: GET_WAITING_DATA, variables: { userId: user?.id } }] });
    const [updateReservationDate] = useMutation(UPDATE_RESERVATION_DATE_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });
    const [updateSpecialist] = useMutation(UPDATE_SPECIALIST_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });
    const [deleteSpecialist] = useMutation(DELETE_SPECIALIST_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });
    const [deductPoints] = useMutation(DEDUCT_POINTS_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });
    const [registerClient] = useMutation(REGISTER_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });
    const [addSpecialist] = useMutation(ADD_PRESTATAIRE_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });
    const [syncGoogleCalendar] = useMutation(SYNC_GOOGLE_CALENDAR_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });
    const [convertExternalToReservation] = useMutation(CONVERT_EXTERNAL_TO_RESERVATION_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });
    const [purchaseProduct] = useMutation(PURCHASE_PRODUCT_MUTATION, { refetchQueries: [{ query: GET_DASHBOARD_DATA }] });

    const getColorHex = (id: string) => GOOGLE_CALENDAR_COLORS.find(c => c.id === id)?.hex || 'transparent';

    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
    const [waitingComment, setWaitingComment] = useState('');
    const [cart, setCart] = useState<any[]>([]);

    const [visiblePasswordId, setVisiblePasswordId] = useState<string | null>(null);
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
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedReservationForPayment, setSelectedReservationForPayment] = useState<any>(null);
    const [paymentModeLine, setPaymentModeLine] = useState('');
    const [pointsToDeduct, setPointsToDeduct] = useState<string>('');
    const [usePointsCombo, setUsePointsCombo] = useState(false);
    const [secondaryPaymentMode, setSecondaryPaymentMode] = useState('');
    const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
    const [newService, setNewService] = useState({ name: '', description: '', price: '', image: '', duration: '' });
    const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<any>(null);
    const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', email: '', password: '', role: 'client', tier: 'Normal', phone: '', birthday: '', image: '' });
    const [isClientsModalOpen, setIsClientsModalOpen] = useState(false);
    const [isSpecialistsModalOpen, setIsSpecialistsModalOpen] = useState(false);
    const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
    const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
    const [agendaSearch, setAgendaSearch] = useState('');
    const [agendaServiceFilter, setAgendaServiceFilter] = useState('');
    const [revenueDateRange, setRevenueDateRange] = useState({
        start: formatLocalDate(new Date()),
        end: formatLocalDate(new Date())
    });
    const [selectedClientForDetails, setSelectedClientForDetails] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', image: '' });
    const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
    const [isAddSpecialistModalOpen, setIsAddSpecialistModalOpen] = useState(false);
    const [newSpecialist, setNewSpecialist] = useState({ 
        name: '', 
        role: '', 
        specialty: '', 
        image: '', 
        rating: 5.0,
        satisfied_clients: '1.2k',
        tech_expertise: 95,
        hosp_expertise: 95,
        prec_expertise: 95,
        award_badge: 'Meilleur Spécialiste',
        historique: '',
        calendar_color_id: '1'
    });
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [isFicheModalOpen, setIsFicheModalOpen] = useState(false);
    const [selectedClientForFiche, setSelectedClientForFiche] = useState<any>(null);
    const [isHistoriqueModalOpen, setIsHistoriqueModalOpen] = useState(false);
    const [selectedSpecialistForHistorique, setSelectedSpecialistForHistorique] = useState<any>(null);
    const [isAdminInboxOpen, setIsAdminInboxOpen] = useState(false);
    const [initialChatUserForInbox, setInitialChatUserForInbox] = useState<any>(null);
    const [isAddReservationModalOpen, setIsAddReservationModalOpen] = useState(false);
    const [manualReservation, setManualReservation] = useState({
        userId: '',
        serviceId: '',
        prestataireId: '',
        date: ''
    });
    const [isClientChatOpen, setIsClientChatOpen] = useState(false);
    const [chatUnreadCount, setChatUnreadCount] = useState(0);
    const [adminUnreadCount, setAdminUnreadCount] = useState(0);
    const chatSseRef = useRef<EventSource | null>(null);
    const [isManualClientSearchOpen, setIsManualClientSearchOpen] = useState(false);
    const [isManualServiceSearchOpen, setIsManualServiceSearchOpen] = useState(false);
    const [isManualSpecialistSearchOpen, setIsManualSpecialistSearchOpen] = useState(false);
    const [isManualDatePickerOpen, setIsManualDatePickerOpen] = useState(false);
    const [manualClientSearch, setManualClientSearch] = useState('');
    const [manualServiceSearch, setManualServiceSearch] = useState('');
    const [manualSpecialistSearch, setManualSpecialistSearch] = useState('');
    const [selectedManualDate, setSelectedManualDate] = useState(new Date());
    const [selectedManualTime, setSelectedManualTime] = useState('09:00');
    const { t, language, setLanguage } = useLanguage();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'new' | 'edit' | 'newProduct' | 'editProduct' | 'ficheClient' | 'newClient' | 'editClient' | 'editSpecialist') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (optional but recommended for base64 in DB)
        if (file.size > 2 * 1024 * 1024) {
            swalLux('warning', 'Fichier trop volumineux', 'Veuillez choisir une image de moins de 2 Mo.');
            return;
        }

        setIsUploading(true);

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            
            if (type === 'new') {
                setNewService({ ...newService, image: base64String });
            } else if (type === 'edit') {
                setEditingService({ ...editingService, image: base64String });
            } else if (type === 'newProduct') {
                setNewProduct({ ...newProduct, image: base64String });
            } else if (type === 'editProduct') {
                setEditingProduct({ ...editingProduct, image: base64String });
            } else if (type === 'ficheClient') {
                setSelectedClientForFiche({ ...selectedClientForFiche, image: base64String });
            } else if (type === 'newClient') {
                setNewClient({ ...newClient, image: base64String });
            } else if (type === 'editClient') {
                setEditingClient({ ...editingClient, image: base64String });
            } else if (type === 'editSpecialist') {
                setSelectedSpecialistForHistorique({ ...selectedSpecialistForHistorique, image: base64String });
            }
            setIsUploading(false);
        };
        reader.onerror = () => {
            console.error('FileReader error');
            swalLux('error', 'Erreur', 'Erreur lors de la lecture du fichier');
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
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
        const today = formatLocalDate(new Date());
        
        const internal = (data?.allReservations || []).filter((res: any) => {
            const dateObj = new Date(res.date);
            if (isNaN(dateObj.getTime())) return false;
            return formatLocalDate(dateObj) === today;
        }).map(r => ({ ...r, type: 'internal' }));

        const external = (data?.externalEvents || []).filter((event: any) => {
            if (event.reservationId) return false; // Already converted
            const dateObj = new Date(event.startDate);
            if (isNaN(dateObj.getTime())) return false;
            return formatLocalDate(dateObj) === today;
        }).map(e => ({
            id: e.id,
            date: e.startDate,
            title: e.title,
            status: 'external',
            type: 'external',
            raw: e
        }));

        return [...internal, ...external].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const getUpcomingBirthdays = () => {
        if (!data?.clients) return [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return data.clients.filter((client: any) => {
            if (!client.birthday) return false;
            const bdayDate = new Date(client.birthday);
            if (isNaN(bdayDate.getTime())) return false;

            const thisYearBday = new Date(today.getFullYear(), bdayDate.getMonth(), bdayDate.getDate());
            if (thisYearBday < today) {
                thisYearBday.setFullYear(today.getFullYear() + 1);
            }

            const diffTime = thisYearBday.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return diffDays >= 0 && diffDays <= 3;
        }).sort((a: any, b: any) => {
            const bdayA = new Date(a.birthday);
            const bdayB = new Date(b.birthday);
            
            const nextA = new Date(today.getFullYear(), bdayA.getMonth(), bdayA.getDate());
            if (nextA < today) nextA.setFullYear(today.getFullYear() + 1);
            
            const nextB = new Date(today.getFullYear(), bdayB.getMonth(), bdayB.getDate());
            if (nextB < today) nextB.setFullYear(today.getFullYear() + 1);
            
            return nextA.getTime() - nextB.getTime();
        });
    };

    const getStaffRevenueReport = () => {
        if (!data?.allReservations) return [];
        const filtered = data.allReservations.filter(r => {
            if (!r.date) return false;
            const dateObj = new Date(r.date);
            if (isNaN(dateObj.getTime())) return false;
            const d = formatLocalDate(dateObj);
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
            const d = formatLocalDate(dateObj);
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
        setIsManualClientSearchOpen(false);
        setIsManualServiceSearchOpen(false);
        setIsManualSpecialistSearchOpen(false);
        setIsManualDatePickerOpen(false);
    };

    const closeAllManualSelects = () => {
        setIsManualClientSearchOpen(false);
        setIsManualServiceSearchOpen(false);
        setIsManualSpecialistSearchOpen(false);
        setIsManualDatePickerOpen(false);
    };

    const handleSync = async () => {
        try {
            await syncGoogleCalendar();
            swalLux('success', 'Synchronisé !', 'Votre calendrier Google a été mis à jour.');
        } catch (err) {
            console.error(err);
            swalLux('error', 'Erreur', 'Impossible de synchroniser le calendrier.');
        }
    };

    const handleConvertEvent = async (event: ExternalEvent) => {
        const { value: formValues } = await Swal.fire({
            title: `<span style="font-family: 'Playfair Display', serif; font-size: 1.8rem; color: #1a1a1a;">Planifier l'événement</span>`,
            html: `
                <div style="padding: 10px 0; text-align: left; font-family: 'Outfit', sans-serif; min-height: 400px;">
                    <p style="color: #888; margin-bottom: 25px; font-size: 0.9rem;">Configurez les détails pour : <strong>"${event.title}"</strong></p>
                    
                    <!-- CUSTOM SELECT: CLIENT -->
                    <div style="margin-bottom: 25px; position: relative;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #666; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">Client</label>
                        <div id="custom-select-client" style="width: 100%; padding: 15px; border-radius: 12px; border: 1.5px solid #eee; background: #fff; font-size: 0.95rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;">
                            <span id="selected-client-text">Choisir un client...</span>
                            <span style="color: #DFB96D; font-size: 0.8rem;">▼</span>
                        </div>
                        <input type="hidden" id="swal-client" value="">
                        <div id="dropdown-client" style="display: none; position: absolute; top: 100%; left: 0; right: 0; z-index: 1000; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #eee; margin-top: 5px; max-height: 200px; overflow-y: auto; padding: 10px;">
                            <input type="text" id="search-client" placeholder="Rechercher un client..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 10px; outline: none; font-size: 0.85rem;">
                            <div id="list-client">
                                ${data?.clients.map(c => `<div class="dropdown-item" data-id="${c.id}" data-name="${c.name}" style="padding: 10px 15px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-size: 0.9rem; color: #444;">${c.name} <small style="color: #999; margin-left: 5px;">(${c.email})</small></div>`).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- CUSTOM SELECT: SERVICE -->
                    <div style="margin-bottom: 25px; position: relative;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #666; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">Service</label>
                        <div id="custom-select-service" style="width: 100%; padding: 15px; border-radius: 12px; border: 1.5px solid #eee; background: #fff; font-size: 0.95rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;">
                            <span id="selected-service-text">Choisir un service...</span>
                            <span style="color: #DFB96D; font-size: 0.8rem;">▼</span>
                        </div>
                        <input type="hidden" id="swal-service" value="">
                        <div id="dropdown-service" style="display: none; position: absolute; top: 100%; left: 0; right: 0; z-index: 999; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #eee; margin-top: 5px; max-height: 200px; overflow-y: auto; padding: 10px;">
                            <div id="list-service">
                                ${data?.services.map(s => `<div class="dropdown-item" data-id="${s.id}" data-name="${s.name}" style="padding: 10px 15px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-size: 0.9rem; color: #444;">${s.name} <span style="float: right; color: #DFB96D; font-weight: 600;">${s.price} DT</span></div>`).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- CUSTOM SELECT: PRESTATAIRE -->
                    <div style="margin-bottom: 10px; position: relative;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #666; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">Spécialiste</label>
                        <div id="custom-select-specialist" style="width: 100%; padding: 15px; border-radius: 12px; border: 1.5px solid #eee; background: #fff; font-size: 0.95rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;">
                            <span id="selected-specialist-text">Choisir un spécialiste...</span>
                            <span style="color: #DFB96D; font-size: 0.8rem;">▼</span>
                        </div>
                        <input type="hidden" id="swal-specialist" value="">
                        <div id="dropdown-specialist" style="display: none; position: absolute; top: 100%; left: 0; right: 0; z-index: 998; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #eee; margin-top: 5px; max-height: 200px; overflow-y: auto; padding: 10px;">
                            <div id="list-specialist">
                                ${data?.prestataires.map(p => `<div class="dropdown-item" data-id="${p.id}" data-name="${p.name}" style="padding: 10px 15px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-size: 0.9rem; color: #444;">${p.name}</div>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `,
            background: '#ffffff',
            padding: '2.5rem',
            showCancelButton: true,
            confirmButtonText: 'Enregistrer la Réservation',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#DFB96D',
            cancelButtonColor: '#f8f9fa',
            preConfirm: () => {
                const clientId = (document.getElementById('swal-client') as HTMLInputElement).value;
                const serviceId = (document.getElementById('swal-service') as HTMLInputElement).value;
                const specialistId = (document.getElementById('swal-specialist') as HTMLInputElement).value;
                if (!clientId || !serviceId || !specialistId) {
                    Swal.showValidationMessage('Veuillez sélectionner tous les champs');
                    return false;
                }
                return { clientId, serviceId, specialistId };
            },
            didOpen: () => {
                const popup = Swal.getPopup();
                if (popup) popup.style.borderRadius = '28px';

                const setupDropdown = (id: string) => {
                    const select = document.getElementById(`custom-select-${id}`);
                    const dropdown = document.getElementById(`dropdown-${id}`);
                    const list = document.getElementById(`list-${id}`);
                    const input = document.getElementById(`swal-${id}`) as HTMLInputElement;
                    const text = document.getElementById(`selected-${id}-text`);
                    const searchInput = document.getElementById(`search-${id}`) as HTMLInputElement;

                    if (!select || !dropdown || !list || !input || !text) return;

                    select.onclick = () => {
                        const isOpen = dropdown.style.display === 'block';
                        // Close others
                        ['client', 'service', 'specialist'].forEach(key => {
                            const d = document.getElementById(`dropdown-${key}`);
                            if (d) d.style.display = 'none';
                        });
                        dropdown.style.display = isOpen ? 'none' : 'block';
                        if (!isOpen) select.style.borderColor = '#DFB96D';
                    };

                    const items = list.querySelectorAll('.dropdown-item');
                    items.forEach((item: any) => {
                        item.onmouseover = () => { item.style.background = 'rgba(223, 185, 109, 0.08)'; item.style.color = '#DFB96D'; };
                        item.onmouseout = () => { item.style.background = 'transparent'; item.style.color = '#444'; };
                        item.onclick = () => {
                            input.value = item.dataset.id;
                            text.innerText = item.dataset.name;
                            text.style.color = '#1a1a1a';
                            text.style.fontWeight = '600';
                            dropdown.style.display = 'none';
                            select.style.borderColor = '#eee';
                        };
                    });

                    if (searchInput) {
                        searchInput.oninput = (e: any) => {
                            const val = e.target.value.toLowerCase();
                            items.forEach((item: any) => {
                                const name = item.dataset.name.toLowerCase();
                                item.style.display = name.includes(val) ? 'block' : 'none';
                            });
                        };
                    }
                };

                ['client', 'service', 'specialist'].forEach(setupDropdown);

                // Style buttons
                const confirmBtn = Swal.getConfirmButton();
                if (confirmBtn) {
                    confirmBtn.style.borderRadius = '35px';
                    confirmBtn.style.padding = '18px 40px';
                    confirmBtn.style.fontWeight = '700';
                    confirmBtn.style.boxShadow = '0 10px 25px rgba(223, 185, 109, 0.3)';
                }
                const cancelBtn = Swal.getCancelButton();
                if (cancelBtn) {
                    cancelBtn.style.borderRadius = '35px';
                    cancelBtn.style.padding = '18px 40px';
                    cancelBtn.style.color = '#999';
                }
            }
        });

        if (formValues) {
            try {
                await convertExternalToReservation({
                    variables: {
                        externalId: event.id,
                        userId: formValues.clientId,
                        serviceId: formValues.serviceId,
                        prestataireId: formValues.specialistId
                    }
                });
                swalLux('success', 'Converti !', 'L\'événement a été transformé en réservation.');
            } catch (err) {
                console.error(err);
                swalLux('error', 'Erreur', 'Impossible de convertir l\'événement.');
            }
        }
    };

    const handleLogout = async () => {
        localStorage.clear();
        await signOut({ callbackUrl: '/' });
    };

    const handleStatusChange = async (resId: string, currentStatus: string) => {
        swalLux('question', 'Modifier le statut', 'Choisissez le nouveau statut du rendez-vous', {
            html: `
                <div class="${styles.statusSelectionGrid}">
                    <button id="btn-pending" class="${styles.statusOptionBtn} ${styles.pending}">
                        <span>⏳</span> En attente
                    </button>
                    <button id="btn-confirmed" class="${styles.statusOptionBtn} ${styles.confirmed}">
                        <span>✅</span> Accepté
                    </button>
                    <button id="btn-cancelled" class="${styles.statusOptionBtn} ${styles.cancelled}">
                        <span>❌</span> Annulé
                    </button>
                </div>
            `,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'Fermer',
            didOpen: () => {
                const popup = Swal.getPopup();
                if (!popup) return;

                const updateStatus = async (status: string) => {
                    Swal.showLoading();
                    try {
                        await updateReservationStatus({ variables: { id: resId, status } });
                        Swal.close();
                        swalLux('success', 'Mis à jour', 'Le statut a été mis à jour avec succès.');
                    } catch (e) {
                        console.error(e);
                        swalLux('error', 'Erreur', 'Impossible de mettre à jour le statut');
                    }
                };

                popup.querySelector('#btn-pending')?.addEventListener('click', () => updateStatus('pending'));
                popup.querySelector('#btn-confirmed')?.addEventListener('click', () => updateStatus('confirmed'));
                popup.querySelector('#btn-cancelled')?.addEventListener('click', () => updateStatus('cancelled'));
            }
        });
    };

    const handleTimeChange = async (resId: string, currentDate: string) => {
        const currentD = new Date(currentDate);
        const availableHours = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        
        swalLux('question', 'Modifier l\'heure', `Sélectionnez une nouvelle heure pour cette séance`, {
            html: `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
                    ${availableHours.map(h => `
                        <button id="time-${h.replace(':', '-')}" class="${styles.statusOptionBtn}" style="padding: 12px; border-radius: 30px; font-size: 1rem; ${(h === `${currentD.getHours()}:00` || h === `${currentD.getHours().toString().padStart(2, '0')}:00`) ? 'border-color: #DFB96D; background: rgba(223, 185, 109, 0.1); font-weight: bold;' : ''}">
                            🕒 ${h}
                        </button>
                    `).join('')}
                </div>
            `,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'Fermer',
            didOpen: () => {
                const popup = Swal.getPopup();
                if (!popup) return;
                availableHours.forEach(h => {
                    const safeId = h.replace(':', '-');
                    popup.querySelector(`#time-${safeId}`)?.addEventListener('click', async () => {
                        const [hh] = h.split(':').map(Number);
                        const newDate = new Date(currentD);
                        newDate.setHours(hh, 0, 0, 0);
                        
                        Swal.showLoading();
                        try {
                            await updateReservationDate({ variables: { id: resId, date: newDate.toISOString() } });
                            Swal.close();
                            swalLux('success', 'Mis à jour', 'L\'heure du rendez-vous a été modifiée.');
                        } catch (e) {
                            console.error(e);
                            swalLux('error', 'Erreur', 'Impossible de modifier l\'heure.');
                        }
                    });
                });
            }
        });
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

    useEffect(() => {
        if (mounted && user?.role === 'admin') {
            syncGoogleCalendar();
        }
    }, [mounted, user]);

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
                                { id: 'feedback', icon: <Star size={22} />, label: t('feedback') },
                                { id: 'notes', icon: <PenLine size={22} />, label: 'Notes Client' }
                            ] : []),
                            { id: 'providers', icon: <Users size={22} />, label: t('specialists') },
                            ...(user?.role === 'admin' ? [{ id: 'caisse', icon: <DollarSign size={22} />, label: 'Caisse' }] : []),
                            { id: 'history', icon: <Clock size={22} />, label: t('history') },
                            { id: 'maintenant', icon: <Sparkles size={22} />, label: t('maintenant') },
                            { id: 'products', icon: <Gift size={22} />, label: t('products') },
                            ...(user?.role !== 'admin' ? [
                                { id: 'fiche', icon: <ClipboardList size={22} />, label: 'Ma Fiche' },
                                { id: 'notes', icon: <PenLine size={22} />, label: 'Mes Notes' }
                            ] : []),
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
                            { id: 'notes', icon: <PenLine size={22} />, label: 'Notes Client' },
                            { id: 'caisse', icon: <DollarSign size={22} />, label: 'Caisse' }
                        ] : []),
                        { id: 'providers', icon: <Users size={22} />, label: t('specialists') },
                        { id: 'history', icon: <Clock size={22} />, label: t('history') },
                        { id: 'maintenant', icon: <Sparkles size={22} />, label: t('maintenant') },
                        { id: 'products', icon: <Gift size={22} />, label: t('products') },
                        ...(user?.role !== 'admin' ? [
                            { id: 'fiche', icon: <ClipboardList size={22} />, label: 'Fiche' },
                            { id: 'notes', icon: <PenLine size={22} />, label: 'Mes Notes' }
                        ] : []),
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
                        {user?.role !== 'admin' && (
                            <div className={styles.tierBadge}>
                                <Award size={16} />
                                <span>{userLoyalty.tier}</span>
                            </div>
                        )}
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
                                                <div className={styles.intelHeader} style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <Calendar size={20} color="#DFB96D" />
                                                        <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: '1.4rem' }}>Agenda du Jour</h3>
                                                        <div style={{ 
                                                            background: 'rgba(255, 71, 87, 0.1)', 
                                                            color: '#ff4757', 
                                                            fontSize: '0.65rem', 
                                                            padding: '4px 10px', 
                                                            borderRadius: '20px', 
                                                            fontWeight: 'bold',
                                                            letterSpacing: '1px'
                                                        }}>LIVE</div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setIsAddReservationModalOpen(true); }}
                                                            className={styles.agendaBtn}
                                                        >
                                                            <Plus size={16} />
                                                            <span>Ajouter</span>
                                                        </button>
                                                        <button 
                                                            onClick={handleSync}
                                                            className={styles.agendaBtnAlt}
                                                        >
                                                            <RefreshCcw size={14} color="#DFB96D" />
                                                            <span>Synchroniser</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            <div className={styles.intelList}>
                                                    {getTodaysAgenda().slice(0, 3).map((res: any) => (
                                                        <div key={res.id} className={styles.intelItem} style={res.type === 'external' ? {
                                                            background: 'linear-gradient(135deg, rgba(223, 185, 109, 0.03) 0%, rgba(223, 185, 109, 0.08) 100%)',
                                                            border: '1px solid rgba(223, 185, 109, 0.2)',
                                                            borderRadius: '16px',
                                                            padding: '15px',
                                                            marginBottom: '10px'
                                                        } : {}}>
                                                            <div 
                                                                className={styles.intelTime}
                                                                onClick={() => user?.role === 'admin' && handleTimeChange(res.id, res.date)}
                                                                style={{ 
                                                                    cursor: user?.role === 'admin' ? 'pointer' : 'default',
                                                                    color: res.type === 'external' ? '#DFB96D' : 'inherit',
                                                                    fontWeight: res.type === 'external' ? 'bold' : 'normal'
                                                                }}
                                                            >
                                                                {new Date(res.date).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                            <div className={styles.intelDetails}>
                                                                <div className={styles.serviceClientInfo}>
                                                                    <strong style={{ fontSize: '0.95rem', color: '#1a1a1a' }}>{res.type === 'external' ? res.title : (res.externalTitle || res.service?.name || 'Service Inconnu')}</strong>
                                                                    <span className={styles.clientSub} style={{ fontSize: '0.75rem', color: '#999' }}>{res.type === 'external' ? 'Importé de Google' : (res.user?.name || 'Client Anonyme')}</span>
                                                                </div>
                                                                <div className={styles.specialistBadge}>
                                                                    {res.type === 'external' ? (
                                                                        <span style={{ 
                                                                            background: 'rgba(223, 185, 109, 0.1)', 
                                                                            color: '#DFB96D', 
                                                                            fontSize: '0.6rem', 
                                                                            padding: '2px 8px', 
                                                                            borderRadius: '4px',
                                                                            textTransform: 'uppercase',
                                                                            fontWeight: 'bold'
                                                                        }}>Non Planifié</span>
                                                                    ) : res.prestataire?.name && (
                                                                        <>
                                                                            <UserCheck size={12} color="#DFB96D" />
                                                                            <span>{res.prestataire.name}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className={styles.agendaActions}>
                                                                {res.type === 'external' ? (
                                                                    <button 
                                                                        className={styles.convertBtnLux} 
                                                                        style={{ 
                                                                            padding: '6px 15px', 
                                                                            fontSize: '0.7rem', 
                                                                            background: '#DFB96D', 
                                                                            color: 'white',
                                                                            borderRadius: '20px',
                                                                            border: 'none',
                                                                            fontWeight: '700',
                                                                            cursor: 'pointer',
                                                                            boxShadow: '0 4px 10px rgba(223, 185, 109, 0.3)',
                                                                            transition: 'all 0.3s ease'
                                                                        }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleConvertEvent(res.raw);
                                                                        }}
                                                                    >
                                                                        PLANIFIER
                                                                    </button>
                                                                ) : (
                                                                    <>
                                                                        <div 
                                                                            className={`${styles.intelStatus} ${styles[res.status]}`} 
                                                                            style={{ 
                                                                                cursor: user?.role === 'admin' ? 'pointer' : 'default',
                                                                                padding: '4px 12px',
                                                                                borderRadius: '20px',
                                                                                fontSize: '0.65rem',
                                                                                fontWeight: '800'
                                                                            }}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                if (user?.role === 'admin') handleStatusChange(res.id, res.status);
                                                                            }}
                                                                        >
                                                                            {res.status?.toUpperCase()}
                                                                        </div>
                                                                    </>
                                                                )}
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
                                                    <Gift size={20} color="var(--accent)" />
                                                    <h3 style={{ color: 'white' }}>Les Anniversaires</h3>
                                                </div>
                                                <div className={styles.intelList}>
                                                    {getUpcomingBirthdays().map((client: any) => (
                                                        <div key={client.id} className={styles.intelItem} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                            <div className={styles.avatarMini}>{client.name ? client.name[0] : 'U'}</div>
                                                            <div className={styles.intelDetails}>
                                                                <strong style={{ color: 'white' }}>{client.name}</strong>
                                                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{client.email}</span>
                                                                <div className={styles.birthdayDate}>
                                                                    🎂 {new Date(client.birthday).toLocaleDateString(language, { day: 'numeric', month: 'long' })}
                                                                </div>
                                                            </div>
                                                            <div className={styles.birthdayActions}>
                                                                <button 
                                                                    className={styles.actionBtn}
                                                                    onClick={() => {
                                                                        setInitialChatUserForInbox({
                                                                            id: Number(client.id),
                                                                            name: client.name,
                                                                            email: client.email,
                                                                            image: client.image,
                                                                            tier: client.tier
                                                                        });
                                                                        setIsAdminInboxOpen(true);
                                                                    }}
                                                                    title="Envoyer un message"
                                                                >
                                                                    <MessageSquare size={16} />
                                                                </button>
                                                                <a 
                                                                    href={`mailto:${client.email}?subject=Joyeux Anniversaire !&body=Toute l'équipe de Vendôme Spa vous souhaite un excellent anniversaire !`} 
                                                                    className={styles.actionBtn}
                                                                    title="Envoyer un email"
                                                                >
                                                                    <Mail size={16} />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {getUpcomingBirthdays().length === 0 && (
                                                        <p className={styles.emptyIntel} style={{ color: 'rgba(255,255,255,0.4)' }}>Aucun anniversaire dans les 3 prochains jours.</p>
                                                    )}
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
                                                            swalLux('success', 'Code appliqué !');
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
                                    <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h2>{t('specialists')}</h2>
                                            <div className={styles.headerLine} />
                                        </div>
                                        {user?.role === 'admin' && (
                                            <button className={styles.btnSaveLux} onClick={() => setIsAddSpecialistModalOpen(true)}>
                                                <Plus size={16} style={{ marginRight: '8px' }} />
                                                Ajouter Spécialiste
                                            </button>
                                        )}
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
                                                        {staff.image ? (
                                                            <img src={staff.image} alt={staff.name} />
                                                        ) : (
                                                            <div className={styles.staffImgPlaceholder} style={{ background: '#F8F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                                                                <UserCheck color="var(--accent)" size={48} opacity={0.3} />
                                                            </div>
                                                        )}
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
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <h3>{staff.name}</h3>
                                                            {user?.role === 'admin' && staff.calendar_color_id && (
                                                                <div 
                                                                    title="Couleur Agenda"
                                                                    style={{ 
                                                                        width: '12px', 
                                                                        height: '12px', 
                                                                        borderRadius: '50%', 
                                                                        background: getColorHex(staff.calendar_color_id),
                                                                        boxShadow: '0 0 5px rgba(0,0,0,0.2)'
                                                                    }} 
                                                                />
                                                            )}
                                                        </div>
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
                                                                    <Edit2 size={18} />
                                                                </button>
                                                            )}
                                                            {user?.role === 'admin' && (
                                                                <button
                                                                    className={styles.iconBtn}
                                                                    style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        const result = await swalLux('warning', 'Êtes-vous sûr ?', 'Vous ne pourrez pas revenir en arrière !', {
                                                                            showCancelButton: true,
                                                                            confirmButtonText: 'Oui, supprimer !',
                                                                            cancelButtonText: 'Annuler'
                                                                        });
 
                                                                        if (result.isConfirmed) {
                                                                            try {
                                                                                await deleteSpecialist({ variables: { id: staff.id } });
                                                                                swalLux('success', 'Supprimé !', 'Le spécialiste a été supprimé.');
                                                                            } catch (error) {
                                                                                console.error(error);
                                                                                swalLux('error', 'Erreur', "Une erreur est survenue lors de la suppression.");
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    <Trash2 size={20} color="#dc2626" />
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
                                    <h2>Toutes les Réservations</h2>
                                    <div className={styles.headerLine} />
                                </div>
                                <div className={styles.historyTimeline}>
                                    {(() => {
                                        const allRes = user?.role === 'admin'
                                            ? [...(data?.allReservations || [])].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                            : [...(waitingData?.myReservations || [])].sort((a: any, b: any) => {
                                                const da = new Date(a.date.includes?.('-') ? a.date : parseInt(a.date)).getTime();
                                                const db = new Date(b.date.includes?.('-') ? b.date : parseInt(b.date)).getTime();
                                                return db - da;
                                            });

                                        if (allRes.length === 0) return (
                                            <p style={{ opacity: 0.5, textAlign: 'center', padding: '40px' }}>Aucune réservation trouvée.</p>
                                        );

                                        return allRes.map((res: any) => (
                                            <div key={res.id} className={styles.timelineItem}>
                                                <div className={styles.timelinePoint} style={{ background: res.status === 'confirmed' ? '#D1FAE5' : res.status === 'cancelled' ? '#FEE2E2' : res.status === 'paid' ? '#DFE8FF' : '#FEF3C7' }} />
                                                <div className={styles.timelineCard}>
                                                    <div className={styles.timeMeta}>
                                                        <Calendar size={16} />
                                                        <span>{new Date(res.date).toLocaleDateString(language, { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                        <span style={{ 
                                                            marginLeft: 'auto', 
                                                            fontSize: '0.7rem', 
                                                            fontWeight: 'bold', 
                                                            padding: '2px 8px', 
                                                            borderRadius: '10px',
                                                            background: res.status === 'confirmed' ? '#D1FAE5' : res.status === 'cancelled' ? '#FEE2E2' : res.status === 'paid' ? '#DFE8FF' : '#FEF3C7',
                                                            color: res.status === 'confirmed' ? '#065F46' : res.status === 'cancelled' ? '#991B1B' : res.status === 'paid' ? '#1E40AF' : '#92400E'
                                                        }}>
                                                            {res.status?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className={styles.timeContent}>
                                                        <div className={styles.timeTitle}>
                                                            <h3>{res.service?.name || res.externalTitle || 'Service'}</h3>
                                                            <p>{t('with')} {res.prestataire?.name || 'N/A'} {user?.role === 'admin' && res.user?.name ? `· Client: ${res.user.name}` : ''}</p>
                                                        </div>
                                                        <div className={styles.timePoints} style={{ color: '#DFB96D' }}>{res.service?.price || 0} DT</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ));
                                    })()}
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
                                {user?.role === 'admin' ? (() => {
                                    /* ── ADMIN: reservations in the current hour slot ── */
                                    const now = new Date();
                                    const slotStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
                                    const slotEnd   = new Date(slotStart.getTime() + 60 * 60 * 1000);
                                    const slotLabel = `${slotStart.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })} – ${slotEnd.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}`;

                                    const parseDate = (raw: string) => new Date(raw.includes('-') || raw.includes('T') ? raw : parseInt(raw));

                                    const slotRes = (data?.allReservations || []).filter((r: any) => {
                                        try {
                                            const d = parseDate(r.date).getTime();
                                            return d >= slotStart.getTime() && d < slotEnd.getTime();
                                        } catch { return false; }
                                    }).sort((a: any, b: any) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

                                    const statusMeta = (status: string) => {
                                        switch (status?.toLowerCase()) {
                                            case 'confirmed': return { label: 'CONFIRMÉ',   bg: '#D1FAE5', color: '#065F46', dot: '#10B981' };
                                            case 'cancelled': return { label: 'ANNULÉ',     bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' };
                                            case 'arrived':   return { label: 'ARRIVÉ',     bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' };
                                            default:          return { label: 'EN ATTENTE', bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' };
                                        }
                                    };

                                    return (
                                        <>
                                            {/* Live clock header */}
                                            <div style={{ background: 'linear-gradient(135deg, #1A0F0A 0%, #2D1A0E 100%)', borderRadius: '20px', padding: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 0 3px rgba(16,185,129,0.3)' }} />
                                                        <span style={{ fontSize: '0.68rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: '#10B981' }}>EN DIRECT</span>
                                                    </div>
                                                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', color: '#FFFDF9', fontWeight: '700', lineHeight: 1.2 }}>
                                                        Créneau actuel
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: '#DFB96D', fontWeight: '700', marginTop: '4px' }}>{slotLabel}</div>
                                                </div>
                                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                    <div style={{ fontSize: '2.2rem', fontWeight: '800', fontFamily: 'monospace', color: '#DFB96D', lineHeight: 1 }}>
                                                        {now.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,253,249,0.5)', marginTop: '4px', textTransform: 'capitalize' }}>
                                                        {now.toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'long' })}
                                                    </div>
                                                </div>
                                            </div>

                                            {slotRes.length > 0 ? (
                                                <>
                                                    <div style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#9a8878', marginBottom: '14px' }}>
                                                        {slotRes.length} réservation{slotRes.length > 1 ? 's' : ''} dans ce créneau
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                                        {slotRes.map((r: any, idx: number) => {
                                                            const meta = statusMeta(r.status);
                                                            const rDate = parseDate(r.date);
                                                            return (
                                                                <motion.div
                                                                    key={r.id}
                                                                    initial={{ opacity: 0, y: 16 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: idx * 0.06 }}
                                                                    style={{
                                                                        background: r.status === 'arrived'
                                                                            ? 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)'
                                                                            : 'linear-gradient(135deg, #FFFDF9 0%, #FDF6E8 100%)',
                                                                        border: r.status === 'arrived'
                                                                            ? '1px solid rgba(59,130,246,0.35)'
                                                                            : '1px solid rgba(223,185,109,0.22)',
                                                                        borderRadius: '18px',
                                                                        overflow: 'hidden',
                                                                        boxShadow: r.status === 'arrived'
                                                                            ? '0 4px 20px rgba(59,130,246,0.12)'
                                                                            : '0 4px 20px rgba(0,0,0,0.05)',
                                                                        position: 'relative',
                                                                    }}
                                                                >
                                                                    {/* Left accent bar — blue for arrived, gold otherwise */}
                                                                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: r.status === 'arrived' ? '#3B82F6' : '#DFB96D' }} />

                                                                    <div style={{ padding: '16px 16px 16px 20px' }}>
                                                                        {/* Row 1: time + service name + status */}
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                                                            <span style={{ fontSize: '1.05rem', fontWeight: '800', fontFamily: 'monospace', color: '#DFB96D', flexShrink: 0 }}>
                                                                                {rDate.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
                                                                            </span>
                                                                            <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: '700', color: '#1A0F0A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                                {r.service?.name}
                                                                            </span>
                                                                            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px', background: meta.bg, color: meta.color, borderRadius: '20px', padding: '4px 10px', fontSize: '0.68rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                                                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: meta.dot, flexShrink: 0 }} />
                                                                                {meta.label}
                                                                            </div>
                                                                        </div>

                                                                        {/* Row 2: avatar + client · specialist · duration */}
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                            {r.prestataire?.image ? (
                                                                                <img src={r.prestataire.image} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid #DFB96D', flexShrink: 0, objectFit: 'cover' }} />
                                                                            ) : (
                                                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid rgba(223,185,109,0.4)', background: '#F8F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                                    <UserCheck color="#DFB96D" size={16} />
                                                                                </div>
                                                                            )}
                                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#2A211C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                                    {r.user?.name || 'Client'}
                                                                                </div>
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'nowrap', overflow: 'hidden' }}>
                                                                                    {r.prestataire?.name && (
                                                                                        <span style={{ fontSize: '0.78rem', color: '#73685F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.prestataire.name}</span>
                                                                                    )}
                                                                                    {r.service?.duration && (
                                                                                        <>
                                                                                            <span style={{ color: '#DFB96D', fontSize: '0.65rem', flexShrink: 0 }}>•</span>
                                                                                            <span style={{ fontSize: '0.75rem', color: '#9a8878', flexShrink: 0 }}>{r.service.duration}</span>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className={styles.card} style={{ textAlign: 'center', padding: '60px 20px' }}>
                                                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🕐</div>
                                                    <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Aucune réservation sur ce créneau</h3>
                                                    <p style={{ color: '#888', maxWidth: '340px', margin: '0 auto', fontSize: '0.9rem' }}>
                                                        Pas de rendez-vous entre {slotLabel} aujourd'hui.
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    );
                                })() : (() => {
                                    /* ── CLIENT: their own reservations for today ── */
                                    const now = new Date();
                                    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                                    const endOfToday = startOfToday + 24 * 60 * 60 * 1000;

                                    const todayRes = waitingData?.myReservations?.filter((r: any) => {
                                        try {
                                            const rawDate = r.date;
                                            const d = new Date(rawDate.includes('-') || rawDate.includes('T') ? rawDate : parseInt(rawDate)).getTime();
                                            return d >= startOfToday && d < endOfToday;
                                        } catch (e) { return false; }
                                    });

                                    if (todayRes && todayRes.length > 0) {
                                        return (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                                {todayRes.sort((a: any, b: any) => {
                                                    const da = new Date(a.date.includes('-') ? a.date : parseInt(a.date));
                                                    const db = new Date(b.date.includes('-') ? b.date : parseInt(b.date));
                                                    return da.getTime() - db.getTime();
                                                }).map((r: any) => (
                                                    <motion.div
                                                        key={r.id}
                                                        initial={{ y: 20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        className={styles.card}
                                                        style={{
                                                            background: 'linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%)',
                                                            border: '1px solid #DFB96D',
                                                            padding: '40px',
                                                            borderRadius: '30px',
                                                            boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                                                            textAlign: 'center',
                                                            position: 'relative',
                                                        }}
                                                    >
                                                        {(() => {
                                                            const status = r.status?.toLowerCase();
                                                            let label = 'EN ATTENTE';
                                                            let bg = '#FEF3C7';
                                                            let color = '#92400E';
                                                            if (status === 'confirmed') { label = 'CONFIRMÉ'; bg = '#D1FAE5'; color = '#065F46'; }
                                                            else if (status === 'cancelled') { label = 'ANNULÉ'; bg = '#FEE2E2'; color = '#991B1B'; }
                                                            else if (status === 'arrived') { label = 'ARRIVÉ'; bg = '#DBEAFE'; color = '#1E40AF'; }
                                                            else if (r.status) { label = r.status.toUpperCase(); bg = '#F3F4F6'; color = '#374151'; }
                                                            return (
                                                                <div style={{ position: 'absolute', top: 0, right: 0, padding: '15px 30px', background: bg, color: color, borderRadius: '0 0 0 30px', fontWeight: '800', letterSpacing: '1px', fontSize: '0.8rem' }}>
                                                                    {label}
                                                                </div>
                                                            );
                                                        })()}
                                                        <div style={{ margin: '0 auto 25px', width: '100px', height: '100px', borderRadius: '50%', background: '#F8F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', boxShadow: 'inset 0 0 20px rgba(223, 185, 109, 0.2)' }}>
                                                            {r.service.name.toLowerCase().includes('massage') ? '💆‍♀️' : '✨'}
                                                        </div>
                                                        <h2 style={{ fontSize: '2.5rem', marginBottom: '5px', color: 'var(--primary)' }}>{r.service.name}</h2>
                                                        <div style={{ fontSize: '1rem', color: '#666', marginBottom: '15px', fontWeight: '500', opacity: 0.8 }}>
                                                            {new Date(r.date.includes('-') ? r.date : parseInt(r.date)).toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'long' })}
                                                        </div>
                                                        <div style={{ fontSize: '1.2rem', color: '#DFB96D', fontWeight: '600', marginBottom: '30px' }}>
                                                            {new Date(r.date.includes('-') ? r.date : parseInt(r.date)).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', alignItems: 'center', paddingTop: '30px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                                            <div style={{ textAlign: 'left' }}>
                                                                <div style={{ fontSize: '0.8rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>Praticien</div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                                                                    {r.prestataire.image ? (
                                                                        <img src={r.prestataire.image} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #DFB96D' }} />
                                                                    ) : (
                                                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #DFB96D', background: '#F8F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                            <UserCheck color="#DFB96D" size={18} />
                                                                        </div>
                                                                    )}
                                                                    <span style={{ fontWeight: '700' }}>{r.prestataire.name}</span>
                                                                </div>
                                                            </div>
                                                            <div style={{ textAlign: 'left' }}>
                                                                <div style={{ fontSize: '0.8rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>Durée Est.</div>
                                                                <div style={{ fontWeight: '700', marginTop: '5px', fontSize: '1.1rem' }}>{r.service.duration || '60 mins'}</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                                            {r.status === 'arrived' ? (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#DBEAFE', color: '#1E40AF', borderRadius: '50px', padding: '14px 32px', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '1px' }}>
                                                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3B82F6' }} />
                                                                    VOUS ÊTES SIGNALÉ(E) ARRIVÉ(E)
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    className="btn-lux"
                                                                    style={{ padding: '15px 40px', fontSize: '1rem' }}
                                                                    onClick={async () => {
                                                                        const result = await Swal.fire({
                                                                            title: 'Signaler votre arrivée ?',
                                                                            text: 'Confirmer que vous êtes bien arrivé(e) au spa.',
                                                                            icon: 'question',
                                                                            showCancelButton: true,
                                                                            confirmButtonColor: '#DFB96D',
                                                                            cancelButtonColor: '#73685F',
                                                                            confirmButtonText: 'Oui, je suis là !',
                                                                            cancelButtonText: 'Annuler',
                                                                            background: '#F8F5F0',
                                                                            color: '#433422',
                                                                        });
                                                                        if (result.isConfirmed) {
                                                                            try {
                                                                                await updateReservationStatus({ variables: { id: r.id, status: 'arrived' } });
                                                                                Swal.fire({
                                                                                    title: 'Bienvenue ! 🌿',
                                                                                    text: "Votre arrivée a été signalée. L'équipe Vendôme vous accueille.",
                                                                                    icon: 'success',
                                                                                    confirmButtonColor: '#DFB96D',
                                                                                    background: '#F8F5F0',
                                                                                    color: '#433422',
                                                                                });
                                                                            } catch {
                                                                                swalLux('error', 'Erreur', "Impossible de signaler l'arrivée.");
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    SIGNALER MON ARRIVÉE
                                                                </button>
                                                            )}
                                                            <a href="tel:+21671000000" className="btn-lux" style={{ padding: '15px 40px', fontSize: '1rem', background: 'transparent', border: '1px solid #DFB96D', color: '#DFB96D', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                                                                <Phone size={18} /> APPELEZ
                                                            </a>
                                                            {r.status === 'pending' && (
                                                                <button className="btn-lux" style={{ padding: '15px 40px', fontSize: '1rem', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', color: '#ff4444' }}
                                                                    onClick={async () => {
                                                                        Swal.fire({ title: 'Annuler la séance ?', text: 'Voulez-vous vraiment annuler votre rendez-vous ?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff4444', cancelButtonColor: '#DFB96D', confirmButtonText: 'Oui, annuler', cancelButtonText: 'Non, garder', background: '#F8F5F0', color: '#433422' })
                                                                            .then(async (result) => { if (result.isConfirmed) { await deleteReservation({ variables: { id: r.id } }); swalLux('success', 'Rendez-vous annulé'); } });
                                                                    }}
                                                                >
                                                                    ANNULER
                                                                </button>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className={styles.card} style={{ textAlign: 'center', padding: '100px 20px' }}>
                                            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🗓️</div>
                                            <h3 style={{ fontSize: '1.8rem' }}>Aucune séance prévue aujourd'hui</h3>
                                            <p style={{ color: '#888', maxWidth: '400px', margin: '20px auto' }}>Vous n'avez pas de rendez-vous pour cette journée. Envie d'une pause bien-être ?</p>
                                            <button className="btn-lux" onClick={() => setActiveTab('services')}>RÉSERVER UNE SÉANCE</button>
                                        </div>
                                    );
                                })()}
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
                                                        swalLux('success', t('addedToCart'), prod.name);
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

                        {activeTab === 'notes' && (
                            <motion.div
                                key="notes"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={styles.tabContent}
                            >
                                <NotesTab user={user} styles={styles} t={t} />
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
                                    <div className={`${styles.sectionHeader} ${styles.clientsPageHeader} clients-page-header`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h2>{t('clients')}</h2>
                                            <div className={styles.headerLine} />
                                        </div>
                                        <button className="btn-lux" onClick={() => setIsAddClientModalOpen(true)}>
                                            <Plus size={18} /> {t('addClient') || 'Ajouter Client'}
                                        </button>
                                    </div>
                                    <div className={styles.clientsList}>
                                        {data?.clients && data.clients.length > 0 ? (
                                            data.clients.map((client: any) => (
                                                <div
                                                    key={client.id}
                                                    className={`${styles.clientCard} ${client.tier === 'Membre Gold' ? styles.clientCardGold : ''} ${client.is_blocked ? styles.clientCardBlocked : ''}`}
                                                >
                                                    <div className={styles.clientCardTop}>
                                                        <div className={styles.clientIcon} style={{ overflow: 'hidden', width: '45px', height: '45px', border: '1px solid rgba(223, 185, 109, 0.2)' }}>
                                                            {client.image ? (
                                                                <img src={client.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <Users size={20} />
                                                            )}
                                                        </div>
                                                        <div className={styles.clientInfo}>
                                                            <h4
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    setSelectedClientForFiche({ ...client });
                                                                    setIsFicheModalOpen(true);
                                                                }}
                                                            >
                                                                {client.name}
                                                                {client.tier === 'Membre Gold' && (
                                                                    <span className={styles.goldBadge}><Star size={9} /> GOLD</span>
                                                                )}
                                                            </h4>
                                                            <p>{client.email}</p>
                                                            <div className={styles.clientPasswordRow}>
                                                                <span className={styles.clientPasswordLabel}>MDP:</span>
                                                                <span
                                                                    className={styles.clientPasswordValue}
                                                                    style={{ cursor: 'pointer' }}
                                                                    title="Cliquer pour copier"
                                                                    onClick={() => {
                                                                        if (client.password) {
                                                                            navigator.clipboard.writeText(client.password);
                                                                            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Mot de passe copié !', showConfirmButton: false, timer: 1500, timerProgressBar: true });
                                                                        }
                                                                    }}
                                                                >
                                                                    {visiblePasswordId === client.id ? (client.password || '—') : '••••••••'}
                                                                </span>
                                                                <button
                                                                    className={styles.clientPasswordToggle}
                                                                    onClick={() => setVisiblePasswordId(visiblePasswordId === client.id ? null : client.id)}
                                                                    title={visiblePasswordId === client.id ? 'Masquer' : 'Afficher'}
                                                                >
                                                                    {visiblePasswordId === client.id ? <EyeOff size={13} /> : <Eye size={13} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={styles.clientCardActions} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

                                                        <button
                                                            className={styles.btnSaveLux}
                                                            style={{ 
                                                                padding: '8px 20px', 
                                                                fontSize: '0.75rem', 
                                                                minWidth: '120px', 
                                                                background: 'rgba(223, 185, 109, 0.1)', 
                                                                color: 'var(--accent)',
                                                                border: '1px solid rgba(223, 185, 109, 0.3)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '8px'
                                                            }}
                                                            onClick={() => {
                                                                setInitialChatUserForInbox({
                                                                    id: Number(client.id),
                                                                    name: client.name,
                                                                    email: client.email,
                                                                    image: client.image,
                                                                    tier: client.tier
                                                                });
                                                                setIsAdminInboxOpen(true);
                                                            }}
                                                        >
                                                            <MessageSquare size={14} />
                                                            MESSAGERIE
                                                        </button>
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
                                                            <p style={{ fontWeight: 600 }}>{res.externalTitle || res.service?.name}</p>
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
                                                            onClick={() => {
                                                                setSelectedReservationForPayment(res);
                                                                setIsPaymentModalOpen(true);
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
                                                    <p>{res.externalTitle || res.service?.name}</p>
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
                                                    const dateStr = formatLocalDate(d);
                                                    const isSelected = selectedDayLine === dateStr;
                                                    const today = new Date();
                                                    const isToday = formatLocalDate(today) === dateStr;
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
                                                            // Robust date construction using local parts to ensure correct UTC offset calculation
                                                            const [y, m, d] = selectedDayLine.split('-').map(Number);
                                                            const [hh, mm] = time.split(':').map(Number);
                                                            const dateObj = new Date(y, m - 1, d, hh, mm);
                                                            setBookingDate(dateObj.toISOString());
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
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    {p.image ? (
                                                        <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginBottom: '5px' }} />
                                                    ) : (
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F8F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '5px' }}>
                                                            <UserCheck color="var(--accent)" size={20} opacity={0.5} />
                                                        </div>
                                                    )}
                                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1A0F0A' }}>{p.name.split(' ')[0]}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={styles.modalActions}>
                                        <button className={styles.btnCancel} onClick={() => setIsBookingModalOpen(false)}>{t('cancel')}</button>
                                        <button className={styles.btnSaveLux} onClick={async () => {
                                            if (!bookingDate || !bookingStaff) {
                                                swalLux('warning', t('availableTime'));
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
                                                swalLux('success', t('resConfirmed'));
                                                setIsBookingModalOpen(false);
                                            } catch (e) {
                                                console.error(e);
                                                swalLux('error', t('bookingFailed'));
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
                                                                    swalLux('success', t('resCancelled'));
                                                                } else {
                                                                    swalLux('error', t('failCancel'));
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
                                        <button className={styles.btnSaveLux} onClick={async () => {
                                            if (cart.length === 0 && (!waitingData?.myReservations || waitingData.myReservations.filter((r: any) => r.status === 'pending').length === 0)) {
                                                return swalLux('info', t('cartEmpty'));
                                            }
                                            
                                            swalLux('info', 'Paiement', t('paymentProcessing'), { showConfirmButton: false, allowOutsideClick: false });
                                            
                                            try {
                                                // Process Products
                                                for (const prod of cart) {
                                                    await purchaseProduct({ variables: { userId: user?.id, productId: prod.id } });
                                                }
                                                
                                                // Process Pending Services
                                                const pendingRes = waitingData?.myReservations?.filter((r: any) => r.status === 'pending') || [];
                                                for (const res of pendingRes) {
                                                    await updateReservationStatus({ variables: { id: res.id, status: 'confirmed' } });
                                                }
                                                
                                                setCart([]);
                                                setIsCartModalOpen(false);
                                                swalLux('success', t('success'), t('paymentSuccess'));
                                            } catch (err) {
                                                console.error(err);
                                                swalLux('error', t('error'), t('paymentError'));
                                            }
                                        }}>
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
                                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                                className={styles.modal}
                            >
                                <div className={styles.modalHeader}>
                                    <Sparkles className="text-gold" />
                                    <h3>{t('evaluateSpecialist')}</h3>
                                    <button className={styles.closeModal} onClick={() => {
                                        setIsRatingModalOpen(false);
                                        setSelectedStaff(null);
                                    }}>×</button>
                                </div>
                                <div className={styles.modalBody}>
                                    <p className={styles.modalDesc}>
                                        {t('howWasSession', { name: prestataires.find((p: any) => p.id === selectedStaff)?.name || '' })}
                                    </p>
                                    <div className={styles.starRating}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <motion.button
                                                key={star}
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                className={styles.starBtn}
                                                onClick={() => setRating(star)}
                                                style={{ color: star <= rating ? '#DFB96D' : 'rgba(223, 185, 109, 0.4)' }}
                                            >
                                                <Star 
                                                    size={32} 
                                                    fill={star <= rating ? '#DFB96D' : 'none'} 
                                                    strokeWidth={2}
                                                />
                                            </motion.button>
                                        ))}
                                    </div>
                                    <textarea
                                        className={styles.modalTextarea}
                                        placeholder={t('shareThought')}
                                        value={waitingComment}
                                        onChange={(e) => setWaitingComment(e.target.value)}
                                    />
                                    <div className={styles.modalActions}>
                                        <button className={styles.btnCancel} onClick={() => {
                                            setIsRatingModalOpen(false);
                                            setSelectedStaff(null);
                                            setRating(0);
                                            setWaitingComment('');
                                        }}>{t('dismiss')}</button>
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
                                                setSelectedStaff(null);
                                                setRating(0);
                                                setWaitingComment('');
                                            } catch (e) {
                                                console.error(e);
                                                Swal.fire({ title: t('error'), text: t('evalFailed'), icon: 'error', confirmButtonColor: '#DFB96D', background: '#F8F5F0' });
                                            }
                                        }}>{t('shareFeedback')}</button>
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

                                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                                    <div>
                                        <h3 style={{ textAlign: 'center', marginBottom: '30px' }}>{t('evaluateSpecialist')}</h3>
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
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    {staff.image ? (
                                                        <img src={staff.image} style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F8F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <UserCheck color="var(--accent)" size={18} opacity={0.5} />
                                                        </div>
                                                    )}
                                                </div>
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
                                            <button className={styles.quickFilterBtn} onClick={() => setRevenueDateRange({ start: formatLocalDate(new Date()), end: formatLocalDate(new Date()) })}>Aujourd'hui</button>
                                            <button className={styles.quickFilterBtn} onClick={() => {
                                                const start = formatLocalDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
                                                const end = formatLocalDate(new Date());
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
                                    <div className={styles.mobileGrabHandle}></div>
                                    <div className={styles.statIconLux} style={{ background: 'rgba(223, 185, 109, 0.15)', width: '45px', height: '45px' }}>
                                        <Calendar color="var(--accent)" size={20} />
                                    </div>
                                    <h3>Agenda Complet du Jour</h3>
                                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <button onClick={() => setIsAgendaModalOpen(false)} className={styles.closeBtn}>×</button>
                                    </div>
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
                                                <div 
                                                    className={styles.agendaTimeCell}
                                                    onClick={() => user?.role === 'admin' && handleTimeChange(res.id, res.date)}
                                                    style={{ cursor: user?.role === 'admin' ? 'pointer' : 'default', fontWeight: '800' }}
                                                    title={user?.role === 'admin' ? 'Cliquer pour modifier l\'heure' : ''}
                                                >
                                                    {new Date(res.date).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className={styles.tableName}>
                                                    <div className={styles.serviceClientInfo}>
                                                        <strong>{res.externalTitle || res.service?.name || 'Service Inconnu'}</strong>
                                                        <span className={styles.clientSub}>{res.user?.name || 'Client Anonyme'}</span>
                                                    </div>
                                                </div>
                                                <div className={styles.specialistBadge}>
                                                    <UserCheck size={12} />
                                                    <span>{res.prestataire?.name || 'Non assigné'}</span>
                                                </div>
                                                <div 
                                                    className={`${styles.intelStatus} ${styles[res.status]}`} 
                                                    style={{ width: 'fit-content', cursor: user?.role === 'admin' ? 'pointer' : 'default' }}
                                                    onClick={() => {
                                                        if (user?.role === 'admin') handleStatusChange(res.id, res.status);
                                                    }}
                                                >
                                                    {res.status?.toUpperCase()}
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
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '25px' }}>
                                        <div 
                                            className={styles.statIconLux} 
                                            style={{ 
                                                width: '100px', 
                                                height: '100px', 
                                                position: 'relative', 
                                                overflow: 'hidden', 
                                                cursor: 'pointer', 
                                                borderRadius: '50%',
                                                border: '2px solid var(--accent)',
                                                background: 'rgba(223, 185, 109, 0.05)'
                                            }}
                                            onClick={() => document.getElementById('edit-client-upload')?.click()}
                                        >
                                            {editingClient.image ? (
                                                <img src={editingClient.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <Users color="var(--accent)" size={40} />
                                            )}
                                            <div style={{ 
                                                position: 'absolute', 
                                                bottom: 0, 
                                                width: '100%', 
                                                background: 'rgba(26, 15, 10, 0.6)', 
                                                padding: '4px 0',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}>
                                                <Camera color="white" size={14} />
                                            </div>
                                        </div>
                                        <input
                                            id="edit-client-upload"
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleFileUpload(e, 'editClient')}
                                        />
                                        <p style={{ fontSize: '0.75rem', marginTop: '8px', opacity: 0.6 }}>{t('changePhoto') || 'Changer la photo'}</p>
                                    </div>
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
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                {[
                                                    { value: 'Normal', label: t('normalMember') || 'Normal' },
                                                    { value: 'Membre Gold', label: t('goldMember') || 'Membre Gold' }
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => setEditingClient({ ...editingClient, tier: opt.value })}
                                                        style={{
                                                            flex: 1,
                                                            padding: '12px 16px',
                                                            borderRadius: '14px',
                                                            border: (editingClient.tier || 'Normal') === opt.value
                                                                ? '2px solid #DFB96D'
                                                                : '1.5px solid rgba(223,185,109,0.2)',
                                                            background: (editingClient.tier || 'Normal') === opt.value
                                                                ? opt.value === 'Membre Gold'
                                                                    ? 'linear-gradient(135deg, #C9973A, #DFB96D)'
                                                                    : 'rgba(223,185,109,0.12)'
                                                                : 'rgba(255,255,255,0.6)',
                                                            color: (editingClient.tier || 'Normal') === opt.value
                                                                ? opt.value === 'Membre Gold' ? '#fff' : '#1A0F0A'
                                                                : 'var(--text-dim)',
                                                            fontWeight: 700,
                                                            fontSize: '0.85rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.25s ease',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '6px',
                                                            boxShadow: (editingClient.tier || 'Normal') === opt.value && opt.value === 'Membre Gold'
                                                                ? '0 4px 14px rgba(223,185,109,0.4)'
                                                                : 'none'
                                                        }}
                                                    >
                                                        {opt.value === 'Membre Gold' && <Star size={13} />}
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
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
                                        <div className={styles.inputGroup} style={{ marginTop: '10px' }}>
                                            <button
                                                type="button"
                                                onClick={() => setEditingClient({ ...editingClient, is_blocked: !editingClient.is_blocked })}
                                                style={{
                                                    padding: '12px 20px',
                                                    borderRadius: '12px',
                                                    background: editingClient.is_blocked ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                                                    border: `1.5px solid ${editingClient.is_blocked ? '#2ecc71' : '#e74c3c'}`,
                                                    color: editingClient.is_blocked ? '#27ae60' : '#c0392b',
                                                    fontWeight: 700,
                                                    fontSize: '0.9rem',
                                                    cursor: 'pointer',
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '10px',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {editingClient.is_blocked ? 'Débloquer cet utilisateur' : 'Bloquer cet utilisateur'}
                                            </button>
                                        </div>
                                    <div className={styles.modalActions} style={{ marginTop: '30px' }}>
                                        <button className={styles.btnCancel} onClick={() => setIsEditClientModalOpen(false)}>{t('cancel')}</button>
                                        <button className={styles.btnSaveLux} onClick={async () => {
                                            try {
                                                const vars: any = {
                                                    userId: editingClient.id,
                                                    name: editingClient.name,
                                                    email: editingClient.email,
                                                    role: editingClient.role,
                                                    tier: editingClient.tier,
                                                    image: editingClient.image,
                                                    is_blocked: editingClient.is_blocked
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

                    {isAddClientModalOpen && (
                        <div className={styles.modalOverlay} style={{ zIndex: 2000 }} onClick={(e) => e.target === e.currentTarget && setIsAddClientModalOpen(false)}>
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className={styles.modal}
                            >
                                <div className={styles.modalHeader}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '15px' }}>
                                        <Plus className="text-gold" />
                                        <h3 style={{ margin: 0 }}>{t('addClient') || 'Ajouter Client'}</h3>
                                        <div className={styles.headerLine} style={{ width: '60px' }} />
                                    </div>
                                    <button className={styles.closeModal} onClick={() => setIsAddClientModalOpen(false)}>×</button>
                                </div>
                                <div className={styles.modalBody}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '25px' }}>
                                        <div 
                                            className={styles.statIconLux} 
                                            style={{ 
                                                width: '100px', 
                                                height: '100px', 
                                                position: 'relative', 
                                                overflow: 'hidden', 
                                                cursor: 'pointer', 
                                                borderRadius: '50%',
                                                border: '2px solid var(--accent)',
                                                background: 'rgba(223, 185, 109, 0.05)'
                                            }}
                                            onClick={() => document.getElementById('new-client-upload')?.click()}
                                        >
                                            {newClient.image ? (
                                                <img src={newClient.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <Users color="var(--accent)" size={40} />
                                            )}
                                            <div style={{ 
                                                position: 'absolute', 
                                                bottom: 0, 
                                                width: '100%', 
                                                background: 'rgba(26, 15, 10, 0.6)', 
                                                padding: '4px 0',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}>
                                                <Camera color="white" size={14} />
                                            </div>
                                        </div>
                                        <input
                                            id="new-client-upload"
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleFileUpload(e, 'newClient')}
                                        />
                                        <p style={{ fontSize: '0.75rem', marginTop: '8px', opacity: 0.6 }}>{t('uploadPhoto') || 'Télécharger une photo'}</p>
                                    </div>
                                    <div style={{ display: 'grid', gap: '20px' }}>
                                        <div className={styles.inputGroup}>
                                            <label>{t('name')}</label>
                                            <input
                                                type="text"
                                                className={styles.luxuryInput}
                                                placeholder="Nom complet"
                                                value={newClient.name}
                                                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('email')}</label>
                                            <input
                                                type="email"
                                                className={styles.luxuryInput}
                                                placeholder="email@example.com"
                                                value={newClient.email}
                                                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('password')}</label>
                                            <input
                                                type="password"
                                                className={styles.luxuryInput}
                                                placeholder="••••••••"
                                                value={newClient.password}
                                                onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('memberStatus')}</label>
                                            <select
                                                className={styles.luxuryInput}
                                                value={newClient.tier}
                                                onChange={(e) => setNewClient({ ...newClient, tier: e.target.value })}
                                                style={{ background: 'var(--primary)', color: 'white' }}
                                            >
                                                <option value="Normal">{t('normalMember')}</option>
                                                <option value="Membre Gold">{t('goldMember')}</option>
                                            </select>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('phone') || 'Téléphone'}</label>
                                            <input
                                                type="text"
                                                className={styles.luxuryInput}
                                                placeholder="+216 XX XXX XXX"
                                                value={newClient.phone}
                                                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('birthday') || 'Date de naissance'}</label>
                                            <DayMonthPicker
                                                value={newClient.birthday}
                                                onChange={(val) => setNewClient({ ...newClient, birthday: val })}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.modalActions} style={{ marginTop: '40px' }}>
                                        <button className={styles.btnCancel} onClick={() => setIsAddClientModalOpen(false)}>{t('cancel')}</button>
                                        <button className={styles.btnSaveLux} onClick={async () => {
                                            if (!newClient.name || !newClient.email || !newClient.password) {
                                                Swal.fire({ title: 'Erreur', text: 'Veuillez remplir tous les champs obligatoires', icon: 'error', confirmButtonColor: '#DFB96D' });
                                                return;
                                            }
                                            try {
                                                const { data: regData }: any = await registerClient({
                                                    variables: {
                                                        name: newClient.name,
                                                        email: newClient.email,
                                                        password: newClient.password
                                                    }
                                                });

                                                if (regData?.register?.error) {
                                                    Swal.fire({ title: 'Erreur', text: regData.register.error, icon: 'error', confirmButtonColor: '#DFB96D' });
                                                    return;
                                                }

                                                // If extra fields are provided, update the user
                                                if ((newClient.tier !== 'Normal' || newClient.phone || newClient.birthday || newClient.image) && regData?.register?.user?.id) {
                                                    await updateUser({
                                                        variables: {
                                                            userId: regData.register.user.id,
                                                            tier: newClient.tier,
                                                            phone: newClient.phone,
                                                            birthday: newClient.birthday,
                                                            image: newClient.image
                                                        }
                                                    });
                                                }

                                                Swal.fire({ title: 'Succès', text: 'Client ajouté avec succès !', icon: 'success', confirmButtonColor: '#DFB96D', background: '#F8F5F0' });
                                                setIsAddClientModalOpen(false);
                                                setNewClient({ name: '', email: '', password: '', role: 'client', tier: 'Normal', phone: '', birthday: '', image: '' });
                                            } catch (e) {
                                                console.error(e);
                                                Swal.fire({ title: 'Erreur', text: 'Erreur lors de l\'ajout du client', icon: 'error', confirmButtonColor: '#DFB96D' });
                                            }
                                        }}>{t('add') || 'Ajouter'}</button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {isAddSpecialistModalOpen && (
                        <div className={styles.modalOverlay} style={{ zIndex: 2000 }} onClick={(e) => e.target === e.currentTarget && setIsAddSpecialistModalOpen(false)}>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className={styles.modal}
                                style={{ maxWidth: '600px', width: '90%', background: '#F8F5F0' }}
                            >
                                <div className={styles.modalHeader}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div className={styles.statIconLux} style={{ background: 'rgba(223, 185, 109, 0.1)', width: '40px', height: '40px' }}>
                                            <Sparkles className="text-gold" size={20} />
                                        </div>
                                        <h3 style={{ margin: 0 }}>Ajouter un Spécialiste</h3>
                                    </div>
                                    <button className={styles.closeModal} onClick={() => setIsAddSpecialistModalOpen(false)}>×</button>
                                </div>

                                <div className={styles.modalBody} style={{ padding: '30px' }}>
                                    <div className={styles.luxuryFormGrid} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                                            <label>Nom Complet</label>
                                            <input
                                                type="text"
                                                className={styles.luxuryInput}
                                                placeholder="ex: Elena Rodriguez"
                                                value={newSpecialist.name}
                                                onChange={(e) => setNewSpecialist({ ...newSpecialist, name: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Titre / Rôle</label>
                                            <input
                                                type="text"
                                                className={styles.luxuryInput}
                                                placeholder="ex: Maître Esthéticienne"
                                                value={newSpecialist.role}
                                                onChange={(e) => setNewSpecialist({ ...newSpecialist, role: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Spécialité</label>
                                            <input
                                                type="text"
                                                className={styles.luxuryInput}
                                                placeholder="ex: HydraFacial & Anti-Âge"
                                                value={newSpecialist.specialty}
                                                onChange={(e) => setNewSpecialist({ ...newSpecialist, specialty: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
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
                                                    {newSpecialist.image ? (
                                                        <img src={newSpecialist.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                                                    setNewSpecialist({ ...newSpecialist, image: reader.result as string });
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                        style={{ display: 'none' }}
                                                        id="specialist-image-upload"
                                                    />
                                                    <label 
                                                        htmlFor="specialist-image-upload" 
                                                        className={styles.btnSaveLux}
                                                        style={{ display: 'inline-flex', padding: '10px 20px', fontSize: '0.85rem', cursor: 'pointer' }}
                                                    >
                                                        {newSpecialist.image ? 'Changer la photo' : 'Choisir une photo'}
                                                    </label>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                                                        Format recommandé : Carré, max 2Mo
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Note Initiale (0-5)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="5"
                                                className={styles.luxuryInput}
                                                onChange={(e) => setNewSpecialist({ ...newSpecialist, rating: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Clients Satisfaits (ex: 1.2k)</label>
                                            <input
                                                type="text"
                                                className={styles.luxuryInput}
                                                value={newSpecialist.satisfied_clients}
                                                onChange={(e) => setNewSpecialist({ ...newSpecialist, satisfied_clients: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Badge / Distinction</label>
                                            <input
                                                type="text"
                                                className={styles.luxuryInput}
                                                value={newSpecialist.award_badge}
                                                onChange={(e) => setNewSpecialist({ ...newSpecialist, award_badge: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Expertise Technique (%)</label>
                                            <input
                                                type="number"
                                                className={styles.luxuryInput}
                                                value={newSpecialist.tech_expertise}
                                                onChange={(e) => setNewSpecialist({ ...newSpecialist, tech_expertise: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Expertise Hospitalité (%)</label>
                                            <input
                                                type="number"
                                                className={styles.luxuryInput}
                                                value={newSpecialist.hosp_expertise}
                                                onChange={(e) => setNewSpecialist({ ...newSpecialist, hosp_expertise: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Expertise Précision (%)</label>
                                            <input
                                                type="number"
                                                className={styles.luxuryInput}
                                                value={newSpecialist.prec_expertise}
                                                onChange={(e) => setNewSpecialist({ ...newSpecialist, prec_expertise: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                                            <label>Couleur Agenda (Google Calendar)</label>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                                                {GOOGLE_CALENDAR_COLORS.map(c => (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => setNewSpecialist({...newSpecialist, calendar_color_id: c.id})}
                                                        style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            background: c.hex,
                                                            border: newSpecialist.calendar_color_id === c.id ? '2px solid #1A0F0A' : '1px solid rgba(0,0,0,0.1)',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            padding: 0
                                                        }}
                                                        title={c.name}
                                                    >
                                                        {newSpecialist.calendar_color_id === c.id && <Check size={14} color="white" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                                            <label>Historique & Biographie</label>
                                            <textarea
                                                className={`${styles.luxuryInput} ${styles.textArea}`}
                                                style={{ minHeight: '100px' }}
                                                placeholder="Racontez le parcours d'excellence de ce spécialiste..."
                                                value={newSpecialist.historique}
                                                onChange={(e) => setNewSpecialist({ ...newSpecialist, historique: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.modalActions} style={{ padding: '20px 30px', background: 'rgba(223, 185, 109, 0.05)', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                                    <button className={styles.btnCancel} onClick={() => setIsAddSpecialistModalOpen(false)}>{t('cancel')}</button>
                                    <button className={styles.btnSaveLux} onClick={async () => {
                                        if (!newSpecialist.name || !newSpecialist.role) {
                                            Swal.fire({ title: 'Attention', text: 'Le nom et le rôle sont obligatoires.', icon: 'warning', confirmButtonColor: '#DFB96D' });
                                            return;
                                        }
                                        try {
                                            await addSpecialist({
                                                variables: {
                                                    name: newSpecialist.name,
                                                    role: newSpecialist.role,
                                                    specialty: newSpecialist.specialty,
                                                    image: newSpecialist.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
                                                    rating: newSpecialist.rating,
                                                    satisfied_clients: newSpecialist.satisfied_clients,
                                                    tech_expertise: newSpecialist.tech_expertise,
                                                    hosp_expertise: newSpecialist.hosp_expertise,
                                                    prec_expertise: newSpecialist.prec_expertise,
                                                    award_badge: newSpecialist.award_badge,
                                                    calendar_color_id: newSpecialist.calendar_color_id,
                                                    historique: newSpecialist.historique
                                                }
                                            });
                                            Swal.fire({ title: 'Succès', text: 'Spécialiste ajouté avec succès !', icon: 'success', confirmButtonColor: '#DFB96D' });
                                            setIsAddSpecialistModalOpen(false);
                                            setNewSpecialist({ 
                                                name: '', role: '', specialty: '', image: '', rating: 5.0,
                                                satisfied_clients: '1.2k', tech_expertise: 95, hosp_expertise: 95, prec_expertise: 95, award_badge: 'Meilleur Spécialiste',
                                                historique: '',
                                                calendar_color_id: '1'
                                            });
                                        } catch (e) {
                                            console.error(e);
                                            Swal.fire({ title: 'Erreur', text: 'Erreur lors de l\'ajout du spécialiste', icon: 'error', confirmButtonColor: '#DFB96D' });
                                        }
                                    }}>
                                        Ajouter Spécialiste
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Add Service Modal */}
                    {isAddServiceModalOpen && (
                        <div className={styles.modalOverlay} style={{ zIndex: 2000 }} onClick={(e) => e.target === e.currentTarget && setIsAddServiceModalOpen(false)}>
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className={styles.modal}
                            >
                                <div className={styles.modalHeader}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '15px' }}>
                                        <Plus className="text-gold" />
                                        <h3 style={{ margin: 0 }}>{t('addService') || 'Ajouter un Service'}</h3>
                                        <div className={styles.headerLine} style={{ width: '60px' }} />
                                    </div>
                                    <button className={styles.closeModal} onClick={() => setIsAddServiceModalOpen(false)}>×</button>
                                </div>
                                <div className={styles.modalBody}>
                                    <div style={{ display: 'grid', gap: '20px' }}>
                                        <div className={styles.uploadContainer}>
                                            <div className={styles.previewTile} onClick={() => document.getElementById('new-service-upload')?.click()}>
                                                {newService.image ? (
                                                    <img src={newService.image} alt="Preview" />
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
                                                id="new-service-upload"
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleFileUpload(e, 'new')}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('name')}</label>
                                            <input
                                                type="text"
                                                className={styles.luxuryInput}
                                                placeholder="Massage Royal"
                                                value={newService.name}
                                                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('description')}</label>
                                            <textarea
                                                className={`${styles.luxuryInput} ${styles.textArea}`}
                                                placeholder="Une expérience sensorielle unique..."
                                                value={newService.description}
                                                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                            <div className={styles.inputGroup}>
                                                <label>{t('price')} (DT)</label>
                                                <input
                                                    type="number"
                                                    className={styles.luxuryInput}
                                                    placeholder="120"
                                                    value={newService.price}
                                                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>{t('duration')}</label>
                                                <input
                                                    type="text"
                                                    className={styles.luxuryInput}
                                                    placeholder="60 mins"
                                                    value={newService.duration}
                                                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.modalActions} style={{ marginTop: '30px' }}>
                                        <button className={styles.btnCancel} onClick={() => setIsAddServiceModalOpen(false)}>{t('cancel')}</button>
                                        <button className={styles.btnSaveLux} onClick={async () => {
                                            if (!newService.name || !newService.price || !newService.image) {
                                                Swal.fire({ title: 'Attention', text: 'Nom, prix et image sont obligatoires', icon: 'warning', confirmButtonColor: '#DFB96D' });
                                                return;
                                            }
                                            try {
                                                await addService({
                                                    variables: {
                                                        name: newService.name,
                                                        description: newService.description,
                                                        price: parseFloat(newService.price),
                                                        image: newService.image,
                                                        duration: newService.duration
                                                    }
                                                });
                                                Swal.fire({ title: 'Succès', text: 'Service ajouté avec succès !', icon: 'success', confirmButtonColor: '#DFB96D', background: '#F8F5F0' });
                                                setIsAddServiceModalOpen(false);
                                                setNewService({ name: '', description: '', price: '', image: '', duration: '' });
                                            } catch (e) {
                                                console.error(e);
                                                Swal.fire({ title: 'Erreur', text: 'Erreur lors de l\'ajout du service', icon: 'error', confirmButtonColor: '#DFB96D', background: '#F8F5F0' });
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
                                            <DayMonthPicker
                                                value={selectedClientForFiche.birthday || ''}
                                                onChange={(val) => setSelectedClientForFiche({ ...selectedClientForFiche, birthday: val })} />
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
                                        <Edit2 color="var(--accent)" size={20} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginLeft: '15px' }}>
                                        <h3 style={{ margin: 0 }}>Modifier le Profil</h3>
                                        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>{selectedSpecialistForHistorique.name}</span>
                                    </div>
                                    <button onClick={() => setIsHistoriqueModalOpen(false)} className={styles.closeBtn}>×</button>
                                </div>
                                <div className={styles.modalBody}>
                                    <div className={styles.inputGrid} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className={styles.inputGroup}>
                                            <label>Nom complet</label>
                                            <input 
                                                type="text" 
                                                className={styles.luxuryInput} 
                                                value={selectedSpecialistForHistorique.name || ''} 
                                                onChange={(e) => setSelectedSpecialistForHistorique({...selectedSpecialistForHistorique, name: e.target.value})}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Rôle</label>
                                            <input 
                                                type="text" 
                                                className={styles.luxuryInput} 
                                                value={selectedSpecialistForHistorique.role || ''} 
                                                onChange={(e) => setSelectedSpecialistForHistorique({...selectedSpecialistForHistorique, role: e.target.value})}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Spécialité</label>
                                            <input 
                                                type="text" 
                                                className={styles.luxuryInput} 
                                                value={selectedSpecialistForHistorique.specialty || ''} 
                                                onChange={(e) => setSelectedSpecialistForHistorique({...selectedSpecialistForHistorique, specialty: e.target.value})}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Note (0-5)</label>
                                            <input 
                                                type="number" 
                                                step="0.1"
                                                className={styles.luxuryInput} 
                                                value={selectedSpecialistForHistorique.rating || 5} 
                                                onChange={(e) => setSelectedSpecialistForHistorique({...selectedSpecialistForHistorique, rating: parseFloat(e.target.value)})}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Clients Satisfaits</label>
                                            <input 
                                                type="text" 
                                                className={styles.luxuryInput} 
                                                value={selectedSpecialistForHistorique.satisfied_clients || ''} 
                                                onChange={(e) => setSelectedSpecialistForHistorique({...selectedSpecialistForHistorique, satisfied_clients: e.target.value})}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Badge / Distinction</label>
                                            <input 
                                                type="text" 
                                                className={styles.luxuryInput} 
                                                value={selectedSpecialistForHistorique.award_badge || ''} 
                                                onChange={(e) => setSelectedSpecialistForHistorique({...selectedSpecialistForHistorique, award_badge: e.target.value})}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Expertise Technique (%)</label>
                                            <input 
                                                type="number" 
                                                className={styles.luxuryInput} 
                                                value={selectedSpecialistForHistorique.tech_expertise || 95} 
                                                onChange={(e) => setSelectedSpecialistForHistorique({...selectedSpecialistForHistorique, tech_expertise: parseInt(e.target.value)})}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Expertise Hospitalité (%)</label>
                                            <input 
                                                type="number" 
                                                className={styles.luxuryInput} 
                                                value={selectedSpecialistForHistorique.hosp_expertise || 95} 
                                                onChange={(e) => setSelectedSpecialistForHistorique({...selectedSpecialistForHistorique, hosp_expertise: parseInt(e.target.value)})}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Expertise Précision (%)</label>
                                            <input 
                                                type="number" 
                                                className={styles.luxuryInput} 
                                                value={selectedSpecialistForHistorique.prec_expertise || 95} 
                                                onChange={(e) => setSelectedSpecialistForHistorique({...selectedSpecialistForHistorique, prec_expertise: parseInt(e.target.value)})}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.inputGroup} style={{ marginTop: '20px' }}>
                                        <label>Couleur Agenda (Google Calendar)</label>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                                            {GOOGLE_CALENDAR_COLORS.map(c => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => setSelectedSpecialistForHistorique({...selectedSpecialistForHistorique, calendar_color_id: c.id})}
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        background: c.hex,
                                                        border: selectedSpecialistForHistorique.calendar_color_id === c.id ? '2px solid #1A0F0A' : '1px solid rgba(0,0,0,0.1)',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: 0,
                                                        transition: 'transform 0.2s'
                                                    }}
                                                    title={c.name}
                                                >
                                                    {selectedSpecialistForHistorique.calendar_color_id === c.id && <Check size={16} color="white" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.inputGroup} style={{ marginTop: '20px' }}>
                                        <label>Image du Spécialiste</label>
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '10px' }}>
                                            <div 
                                                className={styles.statIconLux} 
                                                style={{ 
                                                    width: '100px', 
                                                    height: '100px', 
                                                    position: 'relative', 
                                                    overflow: 'hidden', 
                                                    borderRadius: '20px',
                                                    border: '2px dashed var(--accent)',
                                                    background: 'rgba(223, 185, 109, 0.05)',
                                                    flexShrink: 0
                                                }}
                                            >
                                                {selectedSpecialistForHistorique.image ? (
                                                    <img src={selectedSpecialistForHistorique.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <Camera color="var(--accent)" size={32} opacity={0.3} />
                                                )}
                                                {isUploading && (
                                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Loader2 className="animate-spin" size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <button 
                                                    type="button"
                                                    className="btn-lux" 
                                                    style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                                                    onClick={() => document.getElementById('edit-specialist-upload')?.click()}
                                                >
                                                    <Upload size={14} style={{ marginRight: '8px' }} /> {selectedSpecialistForHistorique.image ? 'Changer l\'image' : 'Télécharger'}
                                                </button>
                                                
                                                {selectedSpecialistForHistorique.image && (
                                                    <button 
                                                        type="button"
                                                        className="btn-lux" 
                                                        style={{ 
                                                            padding: '10px 20px', 
                                                            fontSize: '0.85rem', 
                                                            background: 'rgba(255, 68, 68, 0.1)', 
                                                            border: '1px solid #ff4444', 
                                                            color: '#ff4444' 
                                                        }}
                                                        onClick={() => setSelectedSpecialistForHistorique({...selectedSpecialistForHistorique, image: ''})}
                                                    >
                                                        <Trash2 size={14} style={{ marginRight: '8px' }} /> Supprimer
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <input
                                            id="edit-specialist-upload"
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleFileUpload(e, 'editSpecialist')}
                                        />
                                    </div>

                                    <div className={styles.inputGroup} style={{ marginTop: '20px' }}>
                                        <label>Notes & Historique de Travail</label>
                                        <textarea
                                            className={`${styles.luxuryInput} ${styles.textArea}`}
                                            placeholder="Saisissez l'historique de travail, les records de performance, etc..."
                                            value={selectedSpecialistForHistorique.historique || ''}
                                            onChange={(e) => setSelectedSpecialistForHistorique({ ...selectedSpecialistForHistorique, historique: e.target.value })}
                                            style={{ minHeight: '150px' }}
                                        />
                                    </div>
                                    <div className={styles.modalActions} style={{ marginTop: '30px' }}>
                                        <button className={styles.btnCancel} onClick={() => setIsHistoriqueModalOpen(false)}>{t('cancel')}</button>
                                        <button className={styles.btnSaveLux} onClick={async () => {
                                            try {
                                                await updateSpecialist({
                                                    variables: {
                                                        id: selectedSpecialistForHistorique.id,
                                                        name: selectedSpecialistForHistorique.name,
                                                        role: selectedSpecialistForHistorique.role,
                                                        specialty: selectedSpecialistForHistorique.specialty,
                                                        image: selectedSpecialistForHistorique.image,
                                                        rating: selectedSpecialistForHistorique.rating,
                                                        historique: selectedSpecialistForHistorique.historique,
                                                        satisfied_clients: selectedSpecialistForHistorique.satisfied_clients,
                                                        tech_expertise: selectedSpecialistForHistorique.tech_expertise,
                                                        hosp_expertise: selectedSpecialistForHistorique.hosp_expertise,
                                                        prec_expertise: selectedSpecialistForHistorique.prec_expertise,
                                                        award_badge: selectedSpecialistForHistorique.award_badge,
                                                        calendar_color_id: selectedSpecialistForHistorique.calendar_color_id
                                                    }
                                                });
                                                Swal.fire({ title: t('success'), text: 'Profil mis à jour !', icon: 'success', confirmButtonColor: '#DFB96D' });
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
                    {/* Add Reservation Modal */}
                    {isAddReservationModalOpen && (
                        <div className={styles.modalOverlay} onClick={() => { setIsAddReservationModalOpen(false); closeAllManualSelects(); }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className={styles.modal}
                                style={{ maxWidth: '600px' }}
                                onClick={(e) => { e.stopPropagation(); closeAllManualSelects(); }}
                            >
                                <div className={styles.modalHeader}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div className={styles.modalIconBox} style={{ background: 'rgba(223, 185, 109, 0.1)' }}>
                                            <Plus size={24} color="#DFB96D" />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontFamily: "'Playfair Display', serif" }}>Nouvelle Réservation</h3>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#73685F' }}>Créer une réservation manuellement</p>
                                        </div>
                                    </div>
                                    <button className={styles.closeBtn} onClick={() => setIsAddReservationModalOpen(false)}>
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className={styles.modalBody} style={{ paddingBottom: '8px' }}>
                                    <div className={styles.inputGrid}>
                                        {/* CUSTOM CLIENT SELECT */}
                                        <div className={styles.inputGroup} style={{ position: 'relative' }}>
                                            <label>Client</label>
                                            <div
                                                className={styles.luxuryInput}
                                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                                                onClick={(e) => { e.stopPropagation(); closeAllManualSelects(); setIsManualClientSearchOpen(!isManualClientSearchOpen); }}
                                            >
                                                <span style={{ color: manualReservation.userId ? '#1A0F0A' : '#9a8878' }}>
                                                    {manualReservation.userId
                                                        ? (data?.clients?.find((c: any) => c.id === manualReservation.userId)?.name || 'Client')
                                                        : 'Sélectionner un client'}
                                                </span>
                                                <motion.div animate={{ rotate: isManualClientSearchOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                                    <ChevronDown size={16} color="#DFB96D" />
                                                </motion.div>
                                            </div>
                                            <AnimatePresence>
                                                {isManualClientSearchOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                                        transition={{ duration: 0.15 }}
                                                        className={styles.reservationDropdownMenu}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className={styles.reservationDropdownSearch}>
                                                            <input
                                                                autoFocus
                                                                type="text"
                                                                placeholder="Rechercher un client..."
                                                                value={manualClientSearch}
                                                                onChange={(e) => setManualClientSearch(e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        <div className={styles.reservationDropdownList}>
                                                            {(data?.clients || [])
                                                                .filter((c: any) => c.name.toLowerCase().includes(manualClientSearch.toLowerCase()) || c.email.toLowerCase().includes(manualClientSearch.toLowerCase()))
                                                                .map((c: any) => (
                                                                    <div
                                                                        key={c.id}
                                                                        className={styles.reservationDropdownItem}
                                                                        onClick={() => {
                                                                            setManualReservation({ ...manualReservation, userId: c.id });
                                                                            setIsManualClientSearchOpen(false);
                                                                            setManualClientSearch('');
                                                                        }}
                                                                    >
                                                                        <span className={styles.itemName}>{c.name}</span>
                                                                        <span className={styles.itemSub}>{c.email}</span>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* CUSTOM SERVICE SELECT */}
                                        <div className={styles.inputGroup} style={{ position: 'relative' }}>
                                            <label>Service</label>
                                            <div
                                                className={styles.luxuryInput}
                                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                                                onClick={(e) => { e.stopPropagation(); closeAllManualSelects(); setIsManualServiceSearchOpen(!isManualServiceSearchOpen); }}
                                            >
                                                <span style={{ color: manualReservation.serviceId ? '#1A0F0A' : '#9a8878' }}>
                                                    {manualReservation.serviceId
                                                        ? (data?.services?.find((s: any) => s.id === manualReservation.serviceId)?.name || 'Service')
                                                        : 'Sélectionner un service'}
                                                </span>
                                                <motion.div animate={{ rotate: isManualServiceSearchOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                                    <ChevronDown size={16} color="#DFB96D" />
                                                </motion.div>
                                            </div>
                                            <AnimatePresence>
                                                {isManualServiceSearchOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                                        transition={{ duration: 0.15 }}
                                                        className={styles.reservationDropdownMenu}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className={styles.reservationDropdownList}>
                                                            {(data?.services || []).map((s: any) => (
                                                                <div
                                                                    key={s.id}
                                                                    className={styles.reservationDropdownItem}
                                                                    onClick={() => {
                                                                        setManualReservation({ ...manualReservation, serviceId: s.id });
                                                                        setIsManualServiceSearchOpen(false);
                                                                    }}
                                                                >
                                                                    <span className={styles.itemName}>{s.name}</span>
                                                                    <span className={styles.itemPrice}>{s.price} DT</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* CUSTOM SPECIALIST SELECT */}
                                        <div className={styles.inputGroup} style={{ position: 'relative' }}>
                                            <label>Spécialiste</label>
                                            <div
                                                className={styles.luxuryInput}
                                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                                                onClick={(e) => { e.stopPropagation(); closeAllManualSelects(); setIsManualSpecialistSearchOpen(!isManualSpecialistSearchOpen); }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {manualReservation.prestataireId && (() => {
                                                        const p = data?.prestataires?.find((p: any) => p.id === manualReservation.prestataireId);
                                                        return p?.calendar_color_id ? <div className={styles.itemDot} style={{ background: getColorHex(p.calendar_color_id) }} /> : null;
                                                    })()}
                                                    <span style={{ color: manualReservation.prestataireId ? '#1A0F0A' : '#9a8878' }}>
                                                        {manualReservation.prestataireId
                                                            ? (data?.prestataires?.find((p: any) => p.id === manualReservation.prestataireId)?.name || 'Spécialiste')
                                                            : 'Sélectionner un spécialiste'}
                                                    </span>
                                                </div>
                                                <motion.div animate={{ rotate: isManualSpecialistSearchOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                                    <ChevronDown size={16} color="#DFB96D" />
                                                </motion.div>
                                            </div>
                                            <AnimatePresence>
                                                {isManualSpecialistSearchOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                                        transition={{ duration: 0.15 }}
                                                        className={styles.reservationDropdownMenu}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className={styles.reservationDropdownList}>
                                                            {(data?.prestataires || []).map((p: any) => (
                                                                <div
                                                                    key={p.id}
                                                                    className={styles.reservationDropdownItem}
                                                                    onClick={() => {
                                                                        setManualReservation({ ...manualReservation, prestataireId: p.id });
                                                                        setIsManualSpecialistSearchOpen(false);
                                                                    }}
                                                                >
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                        {p.calendar_color_id && (
                                                                            <div className={styles.itemDot} style={{ background: getColorHex(p.calendar_color_id) }} />
                                                                        )}
                                                                        <span className={styles.itemName}>{p.name}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* DATE & TIME — inline panel, no floating dropdown */}
                                        <div className={styles.inputGroup} style={{ position: 'relative' }}>
                                            <label>Date et Heure</label>
                                            <div
                                                className={styles.luxuryInput}
                                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                                                onClick={(e) => { e.stopPropagation(); closeAllManualSelects(); setIsManualDatePickerOpen(!isManualDatePickerOpen); }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <Calendar size={16} color="#DFB96D" />
                                                    <span style={{ color: '#1A0F0A' }}>{selectedManualDate.toLocaleDateString(language, { day: '2-digit', month: 'long', year: 'numeric' })} à {selectedManualTime}</span>
                                                </div>
                                                <motion.div animate={{ rotate: isManualDatePickerOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                                    <ChevronDown size={16} color="#DFB96D" />
                                                </motion.div>
                                            </div>
                                            <AnimatePresence>
                                                {isManualDatePickerOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                                        transition={{ duration: 0.18 }}
                                                        className={styles.reservationDatePanel}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {/* Calendar header */}
                                                        <div className={styles.reservationCalHeader}>
                                                            <button
                                                                className={styles.reservationCalNavBtn}
                                                                onClick={() => { const d = new Date(selectedManualDate); d.setMonth(d.getMonth() - 1); setSelectedManualDate(d); }}
                                                            >
                                                                <ChevronLeft size={16} />
                                                            </button>
                                                            <strong>
                                                                {selectedManualDate.toLocaleDateString(language, { month: 'long', year: 'numeric' })}
                                                            </strong>
                                                            <button
                                                                className={styles.reservationCalNavBtn}
                                                                onClick={() => { const d = new Date(selectedManualDate); d.setMonth(d.getMonth() + 1); setSelectedManualDate(d); }}
                                                            >
                                                                <ChevronRight size={16} />
                                                            </button>
                                                        </div>

                                                        {/* Day grid */}
                                                        <div className={styles.reservationCalGrid}>
                                                            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                                                                <div key={i} className={styles.reservationCalDayLabel}>{d}</div>
                                                            ))}
                                                            {(() => {
                                                                const year = selectedManualDate.getFullYear();
                                                                const month = selectedManualDate.getMonth();
                                                                const firstDay = new Date(year, month, 1).getDay();
                                                                const daysInMonth = new Date(year, month + 1, 0).getDate();
                                                                const days = [];
                                                                for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);
                                                                for (let d = 1; d <= daysInMonth; d++) {
                                                                    const isSelected = selectedManualDate.getDate() === d;
                                                                    days.push(
                                                                        <div
                                                                            key={d}
                                                                            className={`${styles.reservationCalDay} ${isSelected ? styles.reservationCalDaySelected : ''}`}
                                                                            onClick={() => { const nd = new Date(selectedManualDate); nd.setDate(d); setSelectedManualDate(nd); }}
                                                                        >
                                                                            {d}
                                                                        </div>
                                                                    );
                                                                }
                                                                return days;
                                                            })()}
                                                        </div>

                                                        {/* Time slots */}
                                                        <div className={styles.reservationTimeGrid}>
                                                            {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map(t => (
                                                                <div
                                                                    key={t}
                                                                    className={`${styles.reservationTimeSlot} ${selectedManualTime === t ? styles.reservationTimeSlotSelected : ''}`}
                                                                    onClick={() => { setSelectedManualTime(t); setIsManualDatePickerOpen(false); }}
                                                                >
                                                                    {t}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                </div>

                                {/* Actions footer — outside modalBody so it's always visible */}
                                <div className={styles.modalActions}>
                                    <button className={styles.btnCancel} onClick={() => setIsAddReservationModalOpen(false)}>{t('cancel')}</button>
                                    <button
                                        className={styles.btnSaveLux}
                                        onClick={async () => {
                                            if (!manualReservation.userId || !manualReservation.serviceId || !manualReservation.prestataireId) {
                                                Swal.fire({ title: 'Attention', text: 'Veuillez remplir tous les champs.', icon: 'warning', confirmButtonColor: '#DFB96D' });
                                                return;
                                            }
                                            const finalDate = new Date(selectedManualDate);
                                            const [hours, minutes] = selectedManualTime.split(':');
                                            finalDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                            try {
                                                await createReservation({
                                                    variables: {
                                                        userId: manualReservation.userId,
                                                        serviceId: manualReservation.serviceId,
                                                        prestataireId: manualReservation.prestataireId,
                                                        date: finalDate.toISOString()
                                                    }
                                                });
                                                Swal.fire({ title: 'Succès', text: 'Réservation créée avec succès !', icon: 'success', confirmButtonColor: '#DFB96D' });
                                                setIsAddReservationModalOpen(false);
                                                setManualReservation({ userId: '', serviceId: '', prestataireId: '', date: '' });
                                            } catch (e) {
                                                console.error(e);
                                                Swal.fire({ title: 'Erreur', text: 'Échec de la création', icon: 'error' });
                                            }
                                        }}
                                    >
                                        Confirmer la Réservation
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                    {/* Payment Mode Selection Modal */}
                    {isPaymentModalOpen && selectedReservationForPayment && (
                        <div className={styles.modalOverlay} style={{ zIndex: 3000 }} onClick={(e) => { if (e.target === e.currentTarget) { setIsPaymentModalOpen(false); setPaymentModeLine(''); setPointsToDeduct(''); } }}>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className={styles.modal}
                                style={{ maxWidth: '500px', width: '90%', background: '#F8F5F0' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className={styles.modalHeader}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div className={styles.statIconLux} style={{ background: 'rgba(223, 185, 109, 0.1)', width: '40px', height: '40px' }}>
                                            <DollarSign className="text-gold" size={20} />
                                        </div>
                                        <h3 style={{ margin: 0 }}>Mode de Paiement</h3>
                                    </div>
                                    <button className={styles.closeModal} onClick={() => { setIsPaymentModalOpen(false); setPaymentModeLine(''); setPointsToDeduct(''); }}>×</button>
                                </div>

                                <div className={styles.modalBody} style={{ padding: '30px' }}>
                                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{selectedReservationForPayment.user?.name}</h4>
                                        <p style={{ margin: 0, opacity: 0.7 }}>{selectedReservationForPayment.service?.name}</p>
                                        <div className="text-gold" style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '10px' }}>
                                            {selectedReservationForPayment.service?.price} DT
                                        </div>
                                    </div>

                                    {/* ── Step 1: regular payment methods ── */}
                                    {(() => {
                                        const clientPoints = data?.clients?.find((c: any) => c.id === selectedReservationForPayment?.user?.id)?.points ?? 0;
                                        const totalPrice = selectedReservationForPayment?.service?.price ?? 0;
                                        const pts = parseInt(pointsToDeduct) || 0;
                                        const ptsCapped = Math.min(pts, clientPoints);
                                        const pointsValue = +(ptsCapped / 10).toFixed(2);
                                        const remaining = Math.max(0, +(totalPrice - pointsValue).toFixed(2));
                                        const maxUsablePoints = Math.min(clientPoints, totalPrice * 10);
                                        const isOver = pts > clientPoints;
                                        const fullyCovered = usePointsCombo && pts > 0 && remaining === 0;
                                        const needsSecondary = usePointsCombo && pts > 0 && !isOver && remaining > 0;
                                        const canConfirm = !usePointsCombo
                                            ? !!paymentModeLine
                                            : (pts > 0 && !isOver && (fullyCovered || !!secondaryPaymentMode));

                                        return (
                                            <>
                                                {/* Regular methods grid */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                                    {[
                                                        { id: 'Espèce', label: 'Espèce', icon: <Banknote size={24} /> },
                                                        { id: 'Chèque', label: 'Chèque', icon: <Ticket size={24} /> },
                                                        { id: 'Carte Bancaire', label: 'Carte Bancaire', icon: <CreditCard size={24} /> },
                                                        { id: 'Chèque Cadeau', label: 'Cadeau', icon: <Gift size={24} /> },
                                                        { id: 'Offre', label: 'Offre', icon: <Percent size={24} /> },
                                                    ].map((mode) => {
                                                        const active = !usePointsCombo ? paymentModeLine === mode.id : secondaryPaymentMode === mode.id;
                                                        const dimmed = usePointsCombo && fullyCovered;
                                                        return (
                                                            <button
                                                                key={mode.id}
                                                                className={styles.luxuryOptionBtn}
                                                                style={{
                                                                    padding: '20px 10px', borderRadius: '16px',
                                                                    border: active ? '2px solid var(--accent)' : '1px solid rgba(0,0,0,0.05)',
                                                                    background: active ? 'var(--accent)' : 'white',
                                                                    color: 'var(--primary)', cursor: dimmed ? 'not-allowed' : 'pointer',
                                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                                                                    boxShadow: active ? '0 10px 25px rgba(223,185,109,0.3)' : '0 4px 12px rgba(0,0,0,0.03)',
                                                                    gridColumn: mode.id === 'Offre' ? 'span 2' : 'auto',
                                                                    transition: 'all 0.3s ease',
                                                                    opacity: dimmed ? 0.35 : 1,
                                                                }}
                                                                onClick={() => {
                                                                    if (dimmed) return;
                                                                    if (!usePointsCombo) { setPaymentModeLine(mode.id); }
                                                                    else { setSecondaryPaymentMode(secondaryPaymentMode === mode.id ? '' : mode.id); }
                                                                }}
                                                            >
                                                                <div style={{ opacity: active ? 1 : 0.6 }}>{mode.icon}</div>
                                                                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{mode.label}</span>
                                                            </button>
                                                        );
                                                    })}

                                                    {/* Solde Points toggle tile */}
                                                    <button
                                                        className={styles.luxuryOptionBtn}
                                                        style={{
                                                            padding: '20px 10px', borderRadius: '16px',
                                                            border: usePointsCombo ? '2px solid #C9973A' : '1px solid rgba(0,0,0,0.05)',
                                                            background: usePointsCombo ? 'linear-gradient(135deg, #C9973A, #DFB96D)' : 'white',
                                                            color: usePointsCombo ? '#fff' : 'var(--primary)',
                                                            cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                                            alignItems: 'center', gap: '12px',
                                                            boxShadow: usePointsCombo ? '0 10px 25px rgba(223,185,109,0.35)' : '0 4px 12px rgba(0,0,0,0.03)',
                                                            transition: 'all 0.3s ease',
                                                        }}
                                                        onClick={() => {
                                                            setUsePointsCombo(v => !v);
                                                            setPointsToDeduct('');
                                                            setSecondaryPaymentMode('');
                                                            if (usePointsCombo) setPaymentModeLine('');
                                                        }}
                                                    >
                                                        <div style={{ opacity: usePointsCombo ? 1 : 0.6 }}><Star size={24} /></div>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Solde Points</span>
                                                    </button>
                                                </div>

                                                {/* ── Points calculator panel ── */}
                                                <AnimatePresence>
                                                    {usePointsCombo && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            style={{ overflow: 'hidden', marginTop: '16px' }}
                                                        >
                                                            <div style={{
                                                                background: 'linear-gradient(135deg, rgba(223,185,109,0.08), rgba(223,185,109,0.15))',
                                                                border: '1.5px solid rgba(223,185,109,0.3)',
                                                                borderRadius: '16px', padding: '18px 20px',
                                                                display: 'flex', flexDirection: 'column', gap: '14px'
                                                            }}>
                                                                {/* Balance */}
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1A0F0A' }}>Points disponibles</span>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <span style={{ background: 'linear-gradient(135deg,#C9973A,#DFB96D)', color: '#fff', fontWeight: 800, fontSize: '0.85rem', padding: '3px 12px', borderRadius: '50px' }}>{clientPoints} pts</span>
                                                                        <span style={{ fontSize: '0.78rem', color: '#8B7355' }}>= {(clientPoints / 10).toFixed(2)} DT</span>
                                                                    </div>
                                                                </div>

                                                                {/* Input + MAX */}
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    <Star size={16} color="#DFB96D" style={{ flexShrink: 0 }} />
                                                                    <input
                                                                        type="number" min={1} max={maxUsablePoints}
                                                                        placeholder="Points à utiliser..."
                                                                        value={pointsToDeduct}
                                                                        onChange={e => { setPointsToDeduct(e.target.value); setSecondaryPaymentMode(''); }}
                                                                        style={{
                                                                            flex: 1, border: `1.5px solid ${isOver ? '#ff4444' : 'rgba(223,185,109,0.4)'}`,
                                                                            borderRadius: '12px', padding: '10px 14px', fontSize: '0.95rem',
                                                                            fontWeight: 700, outline: 'none', background: '#fff',
                                                                            color: isOver ? '#ff4444' : '#1A0F0A'
                                                                        }}
                                                                    />
                                                                    <button onClick={() => { setPointsToDeduct(String(Math.floor(maxUsablePoints))); setSecondaryPaymentMode(''); }}
                                                                        style={{ flexShrink: 0, padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(223,185,109,0.4)', background: 'rgba(223,185,109,0.1)', color: '#C9973A', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}>MAX</button>
                                                                </div>
                                                                {isOver && <span style={{ fontSize: '0.75rem', color: '#ff4444', fontWeight: 600 }}>⚠ Max {clientPoints} pts disponibles</span>}

                                                                {/* Breakdown */}
                                                                {pts > 0 && !isOver && (
                                                                    <div style={{ background: '#fff', borderRadius: '12px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(223,185,109,0.2)' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#555' }}>
                                                                            <span>Total service</span><span style={{ fontWeight: 700 }}>{totalPrice} DT</span>
                                                                        </div>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#C9973A' }}>
                                                                            <span>Points ({ptsCapped} pts × 0.1)</span><span style={{ fontWeight: 700 }}>− {pointsValue} DT</span>
                                                                        </div>
                                                                        <div style={{ height: '1px', background: 'rgba(223,185,109,0.2)' }} />
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                                                                            <span style={{ fontWeight: 800, color: '#1A0F0A' }}>Reste à payer</span>
                                                                            <span style={{ fontWeight: 900, color: fullyCovered ? '#2D6A4F' : '#1A0F0A', fontSize: '1.1rem' }}>
                                                                                {fullyCovered ? '✓ 0.00 DT' : `${remaining.toFixed(2)} DT`}
                                                                            </span>
                                                                        </div>
                                                                        {fullyCovered && <div style={{ fontSize: '0.75rem', color: '#2D6A4F', fontWeight: 600, textAlign: 'center' }}>✓ Entièrement couvert par les points</div>}
                                                                    </div>
                                                                )}

                                                                {/* ── Step 2: pick method for remaining ── */}
                                                                {needsSecondary && (
                                                                    <div>
                                                                        <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1A0F0A', margin: '0 0 10px 0' }}>
                                                                            Reste <span style={{ color: '#C9973A' }}>{remaining.toFixed(2)} DT</span> — choisir le mode de paiement :
                                                                        </p>
                                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                                                            {[
                                                                                { id: 'Espèce', label: 'Espèce', icon: <Banknote size={18} /> },
                                                                                { id: 'Chèque', label: 'Chèque', icon: <Ticket size={18} /> },
                                                                                { id: 'Carte Bancaire', label: 'Carte', icon: <CreditCard size={18} /> },
                                                                                { id: 'Chèque Cadeau', label: 'Cadeau', icon: <Gift size={18} /> },
                                                                                { id: 'Offre', label: 'Offre', icon: <Percent size={18} /> },
                                                                            ].map(m => (
                                                                                <button key={m.id}
                                                                                    onClick={() => setSecondaryPaymentMode(secondaryPaymentMode === m.id ? '' : m.id)}
                                                                                    style={{
                                                                                        padding: '12px 6px', borderRadius: '12px',
                                                                                        border: secondaryPaymentMode === m.id ? '2px solid var(--accent)' : '1px solid rgba(0,0,0,0.06)',
                                                                                        background: secondaryPaymentMode === m.id ? 'var(--accent)' : '#fff',
                                                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                                                                                        cursor: 'pointer', transition: 'all 0.2s ease',
                                                                                        boxShadow: secondaryPaymentMode === m.id ? '0 6px 16px rgba(223,185,109,0.25)' : 'none',
                                                                                        gridColumn: m.id === 'Offre' ? 'span 2' : 'auto',
                                                                                    }}>
                                                                                    <div style={{ opacity: secondaryPaymentMode === m.id ? 1 : 0.5 }}>{m.icon}</div>
                                                                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)' }}>{m.label}</span>
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {/* ── Confirm ── */}
                                                <div className={styles.modalActions} style={{ marginTop: '30px', background: 'transparent', padding: 0 }}>
                                                    <button className={styles.btnCancel} style={{ flex: 1 }} onClick={() => { setIsPaymentModalOpen(false); setPaymentModeLine(''); setPointsToDeduct(''); setUsePointsCombo(false); setSecondaryPaymentMode(''); }}>Annuler</button>
                                                    <button
                                                        className={styles.btnSaveLux}
                                                        disabled={!canConfirm}
                                                        style={{ flex: 2, opacity: canConfirm ? 1 : 0.5 }}
                                                        onClick={async () => {
                                                            if (!canConfirm) return;
                                                            try {
                                                                const finalMode = usePointsCombo
                                                                    ? fullyCovered
                                                                        ? `Solde Points (-${ptsCapped} pts)`
                                                                        : `Solde Points (-${ptsCapped} pts) + ${secondaryPaymentMode} (${remaining.toFixed(2)} DT)`
                                                                    : paymentModeLine;

                                                                await updateReservationStatus({ variables: { id: selectedReservationForPayment.id, status: 'paid', paymentMode: finalMode } });

                                                                if (usePointsCombo && selectedReservationForPayment?.user?.id) {
                                                                    await deductPoints({ variables: { userId: selectedReservationForPayment.user.id, points: ptsCapped } });
                                                                }

                                                                Swal.fire({
                                                                    title: 'Paiement Confirmé',
                                                                    text: usePointsCombo
                                                                        ? fullyCovered
                                                                            ? `${ptsCapped} points déduits. Paiement entièrement couvert.`
                                                                            : `${ptsCapped} pts déduits + ${remaining.toFixed(2)} DT par ${secondaryPaymentMode}.`
                                                                        : `${selectedReservationForPayment.service?.price} DT par ${paymentModeLine}.`,
                                                                    icon: 'success', confirmButtonColor: '#DFB96D', background: '#F8F5F0', timer: 3000
                                                                });

                                                                setIsPaymentModalOpen(false);
                                                                setSelectedReservationForPayment(null);
                                                                setPaymentModeLine('');
                                                                setPointsToDeduct('');
                                                                setUsePointsCombo(false);
                                                                setSecondaryPaymentMode('');
                                                            } catch (e) {
                                                                console.error(e);
                                                                Swal.fire({ title: 'Erreur', text: 'Impossible d\'enregistrer le paiement.', icon: 'error', confirmButtonColor: '#DFB96D' });
                                                            }
                                                        }}
                                                    >
                                                        Confirmer le Paiement
                                                    </button>
                                                </div>
                                            </>
                                        );
                                    })()}
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
                        initialChatUser={initialChatUserForInbox}
                        onClose={() => {
                            setIsAdminInboxOpen(false);
                            setInitialChatUserForInbox(null);
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
