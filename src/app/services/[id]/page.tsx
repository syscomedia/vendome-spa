'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LoadingScreen from '@/components/LoadingScreen';
import { useQuery } from '@apollo/client/react';
import { GET_SERVICE } from '@/graphql/queries';
import { useLanguage } from '@/lib/LanguageContext';
import styles from './service-detail.module.css';
import { ArrowLeft, Clock, Zap, Star, ShieldCheck, Calendar, Sparkles } from 'lucide-react';

interface ServiceData {
    service: {
        id: string;
        name: string;
        description: String;
        price: number;
        image: string;
        duration: string;
    };
}

export default function ServiceDetail() {
    const params = useParams();
    const router = useRouter();
    const { t } = useLanguage();

    const { data, loading, error } = useQuery<ServiceData>(GET_SERVICE, {
        variables: { id: params.id }
    });

    if (loading) {
        return <LoadingScreen />;
    }

    if (error || !data?.service) {
        return <div className={styles.error}>Service not found</div>;
    }

    const service = data.service;

    return (
        <div className={styles.container}>
            {/* Dynamic Background */}
            <div className={styles.bgWrapper}>
                <div className={styles.bgImage} style={{ backgroundImage: service.image ? `url(${service.image})` : 'linear-gradient(135deg, #FDFCFB 0%, #E2D1C3 100%)' }} />
                <div className={styles.bgOverlay} />
            </div>

            {/* Content Header */}
            <nav className={styles.nav}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    <ArrowLeft size={24} />
                    <span>{t('dashboard')}</span>
                </button>
            </nav>

            <main className={styles.main}>
                <div className={styles.contentGrid}>
                    {/* Left Column: Visuals */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={styles.visualCol}
                    >
                        <div className={styles.mainImageWrapper}>
                            {service.image ? (
                                <img src={service.image} alt={service.name} className={styles.mainImage} />
                            ) : (
                                <div style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FDFCFB 0%, #E2D1C3 100%)' }}>
                                    <Sparkles size={100} color="rgba(223, 185, 109, 0.5)" />
                                </div>
                            )}
                            <div className={styles.priceTag}>{service.price} DT</div>
                        </div>
                    </motion.div>

                    {/* Right Column: Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={styles.infoCol}
                    >
                        <div className={styles.badge}>{t('exclusiveRitual')}</div>
                        <h1 className={styles.title}>{service.name}</h1>

                        <div className={styles.metaRow}>
                            <div className={styles.metaItem}>
                                <Clock size={20} className="text-gold" />
                                <span>{service.duration}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <Star size={20} className="text-gold" fill="currentColor" />
                                <span>4.9 ({t('recentReviews')})</span>
                            </div>
                        </div>

                        <p className={styles.description}>{service.description}</p>

                        <div className={styles.benefits}>
                            <h3>{t('whatToExpect')}</h3>
                            <div className={styles.benefitList}>
                                <div className={styles.benefitItem}>
                                    <Zap size={18} />
                                    <span>{t('immediateRejuvenation')}</span>
                                </div>
                                <div className={styles.benefitItem}>
                                    <ShieldCheck size={18} />
                                    <span>{t('premiumOrganic')}</span>
                                </div>
                                <div className={styles.benefitItem}>
                                    <Calendar size={18} />
                                    <span>{t('personalizedConsultation')}</span>
                                </div>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-lux"
                            style={{ width: '100%', marginTop: '40px' }}
                        >
                            {t('bookNow')} — {service.price} DT
                        </motion.button>
                    </motion.div>
                </div>
            </main>

            {/* Background Decorative Text */}
            <div className={styles.floatingText}>{service.name.split(' ')[0]}</div>
        </div>
    );
}
