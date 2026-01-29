'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SERVICES } from '@/lib/mock-data';
import { useLanguage } from '@/lib/LanguageContext';
import styles from './service-detail.module.css';
import { ArrowLeft, Clock, Zap, Star, ShieldCheck, Calendar } from 'lucide-react';

export default function ServiceDetail() {
    const params = useParams();
    const router = useRouter();
    const { t } = useLanguage();

    const service = SERVICES.find(s => s.id === params.id);

    if (!service) {
        return <div className={styles.error}>Service not found</div>;
    }

    return (
        <div className={styles.container}>
            {/* Dynamic Background */}
            <div className={styles.bgWrapper}>
                <div className={styles.bgImage} style={{ backgroundImage: `url(${service.image})` }} />
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
                            <img src={service.image} alt={service.name} className={styles.mainImage} />
                            <div className={styles.priceTag}>{service.price}</div>
                        </div>
                    </motion.div>

                    {/* Right Column: Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={styles.infoCol}
                    >
                        <div className={styles.badge}>Exclusive Ritual</div>
                        <h1 className={styles.title}>{service.name}</h1>

                        <div className={styles.metaRow}>
                            <div className={styles.metaItem}>
                                <Clock size={20} className="text-gold" />
                                <span>{service.duration}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <Star size={20} className="text-gold" fill="currentColor" />
                                <span>4.9 (Recent Reviews)</span>
                            </div>
                        </div>

                        <p className={styles.description}>{service.description}</p>

                        <div className={styles.benefits}>
                            <h3>What to expect:</h3>
                            <div className={styles.benefitList}>
                                <div className={styles.benefitItem}>
                                    <Zap size={18} />
                                    <span>Immediate Rejuvenation</span>
                                </div>
                                <div className={styles.benefitItem}>
                                    <ShieldCheck size={18} />
                                    <span>Premium Organic Products</span>
                                </div>
                                <div className={styles.benefitItem}>
                                    <Calendar size={18} />
                                    <span>Personalized Consultation</span>
                                </div>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-lux"
                            style={{ width: '100%', marginTop: '40px' }}
                        >
                            {t('bookNow')} — {service.price}
                        </motion.button>
                    </motion.div>
                </div>
            </main>

            {/* Background Decorative Text */}
            <div className={styles.floatingText}>{service.name.split(' ')[0]}</div>
        </div>
    );
}
