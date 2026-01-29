'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { Language } from '@/lib/mock-data';
import styles from './page.module.css';
import { ChevronRight, Globe, Mail, Lock, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showLang, setShowLang] = useState(false);
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  const languages = [
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
    { code: 'es', label: 'Español' },
    { code: 'ru', label: 'Русский' },
    { code: 'zh', label: '中文' },
  ];

  return (
    <div className={styles.container}>
      {/* Background with Parallax effect */}
      <div className={styles.visualSection}>
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2 }}
          className={styles.bgImage}
        />
        <div className={styles.overlay} />

        <div className={styles.contentWrapper}>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className={styles.logoBadge}
          >
            <img src="/logo.png" alt="Vendôme" className={styles.mainLogo} />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className={styles.heroTitle}
          >
            {t('welcome')}
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className={styles.heroSubtitle}
          >
            {t('tagline')}
          </motion.p>
        </div>

        <div className={styles.langWrapper} onClick={() => setShowLang(!showLang)}>
          <Globe className={styles.langIcon} size={18} />
          <span className={styles.langLabel}>{language.toUpperCase()}</span>
          <AnimatePresence>
            {showLang && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={styles.langDropdown}
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`${styles.langOption} ${language === lang.code ? styles.langOptionActive : ''}`}
                    onClick={() => setLanguage(lang.code as Language)}
                  >
                    {lang.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.formCard}>
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={styles.formInner}
            >
              <div className={styles.formHeader}>
                <Sparkles className={styles.headerIcon} />
                <h2>{isLogin ? t('signIn') : t('createAccount')}</h2>
                <p>{isLogin ? 'Elite Access Only' : 'Join our exclusive community'}</p>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputBox}>
                  <Mail className={styles.inputIcon} size={18} />
                  <input type="email" placeholder={t('email')} required />
                </div>

                <div className={styles.inputBox}>
                  <Lock className={styles.inputIcon} size={18} />
                  <input type="password" placeholder={t('password')} required />
                </div>

                {isLogin && <a href="#" className={styles.forgot}>{t('forgot')}</a>}

                <button type="submit" className={styles.buttonPremium}>
                  {isLogin ? t('signIn') : t('signUp')}
                  <ChevronRight size={18} />
                </button>
              </form>

              <div className={styles.switchBox}>
                <span>{isLogin ? t('noAccount') : t('haveAccount')}</span>
                <button onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? t('createAccount') : t('signIn')}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
