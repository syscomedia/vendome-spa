export type Language = 'fr' | 'ar' | 'es' | 'ru' | 'zh';

export const TRANSLATIONS = {
    fr: {
        welcome: "Bienvenue chez Vendôme",
        subtitle: "Beauté . Spa",
        tagline: "Où l'élégance rencontre la tranquillité",
        signIn: "Se connecter",
        signUp: "S'inscrire",
        email: "Adresse Email",
        password: "Mot de passe",
        forgot: "Mot de passe oublié ?",
        noAccount: "Pas de compte ?",
        haveAccount: "Déjà un compte ?",
        createAccount: "Créer un compte",
        dashboard: "Tableau de bord",
        specialists: "Spécialistes",
        history: "Historique",
        points: "Points de fidélité",
        nextReward: "Prochaine récompense",
        recommendations: "Pour votre prochaine venue",
        recentVisits: "Visites récentes",
        addComment: "Ajouter un commentaire",
        bookNow: "Réserver",
        services: "Nos Services d'Exception",
        luxuryAmenities: "Aménagements de Luxe",
        signOut: "Se déconnecter",
        ptsAway: "pts restants"
    },
    ar: {
        welcome: "مرحباً بكم في فاندوم",
        subtitle: "تجميل . سبا",
        tagline: "حيث تلتقي الأناقة بالهدوء",
        signIn: "تسجيل الدخول",
        signUp: "إنشاء حساب",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        forgot: "نسيت كلمة المرور؟",
        noAccount: "ليس لديك حساب؟",
        haveAccount: "لديك حساب بالفعل؟",
        createAccount: "أنشئ حساباً",
        dashboard: "لوحة التحكم",
        specialists: "المتخصصون",
        history: "السجل",
        points: "نقاط الولاء",
        nextReward: "المكافأة التالية",
        recommendations: "مقترحات لزيارتك القادمة",
        recentVisits: "الزيارات الأخيرة",
        addComment: "إضافة تعليق",
        bookNow: "احجز الآن",
        services: "خدماتنا المتميزة",
        luxuryAmenities: "مرافق فاخرة",
        signOut: "تسجيل الخروج",
        ptsAway: "نقطة متبقية"
    },
    es: {
        welcome: "Bienvenido a Vendôme",
        subtitle: "Belleza . Spa",
        tagline: "Donde la elegancia se encuentra con la tranquilidad",
        signIn: "Iniciar sesión",
        signUp: "Registrarse",
        email: "Correo electrónico",
        password: "Contraseña",
        forgot: "¿Olvidaste tu contraseña?",
        noAccount: "¿No tienes cuenta?",
        haveAccount: "¿Ya tienes cuenta?",
        createAccount: "Crear cuenta",
        dashboard: "Panel de control",
        specialists: "Especialistas",
        history: "Historial",
        points: "Puntos de fidelidad",
        nextReward: "Próxima recompensa",
        recommendations: "Para su próxima visita",
        recentVisits: "Visitas recientes",
        addComment: "Añadir comentario",
        bookNow: "Reservar ahora",
        services: "Nuestros Servicios Excepcionales",
        luxuryAmenities: "Instalaciones de Lujo",
        signOut: "Cerrar sesión",
        ptsAway: "pts restantes"
    },
    ru: {
        welcome: "Добро пожаловать в Vendôme",
        subtitle: "Красота . Спа",
        tagline: "Где элегантность встречается с умиротворением",
        signIn: "Войти",
        signUp: "Зарегистрироваться",
        email: "Электронная почта",
        password: "Пароль",
        forgot: "Забыли пароль?",
        noAccount: "Нет аккаунта?",
        haveAccount: "Уже есть аккаунт?",
        createAccount: "Создать аккаунт",
        dashboard: "Панель управления",
        specialists: "Специалисты",
        history: "История",
        points: "Бонусные баллы",
        nextReward: "Следующая награда",
        recommendations: "Рекомендации на следующий визит",
        recentVisits: "Последние визиты",
        addComment: "Добавить отзыв",
        bookNow: "Забронировать",
        services: "Наши исключительные услуги",
        luxuryAmenities: "Роскошные удобства",
        signOut: "Выйти",
        ptsAway: "баллов осталось"
    },
    zh: {
        welcome: "欢迎来到 Vendôme",
        subtitle: "美容 . 水疗",
        tagline: "优雅与宁静的邂逅之地",
        signIn: "登录",
        signUp: "注册",
        email: "电子邮件",
        password: "密码",
        forgot: "忘记密码？",
        noAccount: "没有账号？",
        haveAccount: "已有账号？",
        createAccount: "创建账号",
        dashboard: "仪表板",
        specialists: "专家",
        history: "历史记录",
        points: "忠诚度积分",
        nextReward: "下一阶段奖励",
        recommendations: "下次访问建议",
        recentVisits: "最近访问",
        addComment: "发表评论",
        bookNow: "现在预订",
        services: "我们的卓越服务",
        luxuryAmenities: "豪华设施",
        signOut: "登出",
        ptsAway: "积分还差"
    }
};

export interface Prestataire {
    id: string;
    name: string;
    role: string;
    image: string;
    rating: number;
    specialty: string;
}

export interface Service {
    id: string;
    name: string;
    description: string;
    price: string;
    image: string;
    duration: string;
}

export const SERVICES: Service[] = [
    {
        id: 's1',
        name: 'Massage Royal Vendôme',
        description: 'Une expérience de détente ultime utilisant des huiles essentielles rares et des pierres chaudes volcaniques.',
        price: '180€',
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
        duration: '90 min'
    },
    {
        id: 's2',
        name: 'Soin Visage Or Pur',
        description: 'Traitement anti-âge d\'exception aux particules d\'or 24 carats pour un éclat incomparable.',
        price: '250€',
        image: 'https://images.pexels.com/photos/3985338/pexels-photo-3985338.jpeg?auto=compress&cs=tinysrgb&w=800',
        duration: '75 min'
    },
    {
        id: 's3',
        name: 'Hammam Privé Signature',
        description: 'Rituel de purification traditionnel dans un cadre luxueux avec gommage au savon noir et enveloppement au rhassoul.',
        price: '120€',
        image: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800&q=80',
        duration: '60 min'
    },
    {
        id: 's4',
        name: 'Manucure Diamant',
        description: 'Soin complet des mains et des ongles avec finition joaillerie et modelage relaxant.',
        price: '95€',
        image: 'https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=800',
        duration: '45 min'
    }
];

export const PRESTATAIRES: Prestataire[] = [
    {
        id: '1',
        name: 'Elena Rodriguez',
        role: 'Maître Esthéticienne',
        image: 'https://images.pexels.com/photos/3762871/pexels-photo-3762871.jpeg?auto=compress&cs=tinysrgb&w=800',
        rating: 4.9,
        specialty: 'HydraFacial & Anti-Âge'
    },
    {
        id: '2',
        name: 'Sarah Chen',
        role: 'Massothérapeute Experte',
        image: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        specialty: 'Tissus Profonds & Pierres Chaudes'
    },
    {
        id: '3',
        name: 'Sophie Laurent',
        role: 'Artist Ongulaire Luxe',
        image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80',
        rating: 5.0,
        specialty: 'Manucure Russe & Nail Art'
    }
];

export const AMENITIES = [
    {
        name: 'Piscine à Débordement',
        image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80'
    },
    {
        name: 'Bar à Tisanes Bio',
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80'
    },
    {
        name: 'Suite de Méditation',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80'
    }
];

export const USER_LOYALTY = {
    points: 1250,
    tier: 'Membre Gold',
    nextReward: 1500
};

export const SERVICE_HISTORY = [
    {
        id: 'h1',
        date: '2025-12-15',
        service: 'Signature Facial',
        prestataireId: '1',
        points: 50,
    }
];

export const RECOMMENDATIONS = [
    { id: '2', reason: 'Idéal pour votre récupération après le sport' },
    { id: '3', reason: 'Nouveau design saisonnier disponible' }
];
