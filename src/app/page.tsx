'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { Language } from '@/lib/mock-data';
import styles from './page.module.css';
import { ChevronRight, Globe, Mail, Lock, Sparkles, Users, Eye, EyeOff } from 'lucide-react';

import { useSession, signIn } from "next-auth/react";
import { useMutation } from '@apollo/client/react';
import { LOGIN_MUTATION, REGISTER_MUTATION, SYNC_GOOGLE_USER_MUTATION } from '@/graphql/mutations';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showLang, setShowLang] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { data: session } = useSession();

  const [login] = useMutation(LOGIN_MUTATION);
  const [register] = useMutation(REGISTER_MUTATION);
  const [syncGoogleUser] = useMutation(SYNC_GOOGLE_USER_MUTATION);

  useEffect(() => {
    if (session?.user?.email) {
      const handleGoogleSync = async () => {
        try {
          const { data }: any = await syncGoogleUser({
            variables: {
              email: session.user?.email,
              name: session.user?.name || session.user?.email?.split('@')[0] || 'User'
            }
          });

          if (data?.syncGoogleUser?.user) {
            localStorage.setItem('user', JSON.stringify(data.syncGoogleUser.user));
            router.push('/dashboard');
          } else if (data?.syncGoogleUser?.error) {
            setErrorMsg(data.syncGoogleUser.error);
          }
        } catch (e) {
          console.error("Google Sync Error", e);
          setErrorMsg(t('failedGoogleSync'));
        }
      };

      const localUser = localStorage.getItem('user');
      if (!localUser) {
        handleGoogleSync();
      } else {
        router.push('/dashboard');
      }
    }
  }, [session, router, syncGoogleUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      if (isLogin) {
        const { data }: any = await login({ variables: { email, password } });
        if (data.login.error) {
          setErrorMsg(data.login.error);
        } else {
          localStorage.setItem('user', JSON.stringify(data.login.user));
          router.push('/dashboard');
        }
      } else {
        const { data }: any = await register({ variables: { email, password, name } });
        if (data.register.error) {
          setErrorMsg(data.register.error);
        } else {
          setIsLogin(true);
          setErrorMsg(t('accountCreated'));
        }
      }
    } catch (err) {
      setErrorMsg(t('errorOccurred'));
      console.error(err);
    }
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
                <Sparkles className={`${styles.headerIcon} gold-glow`} size={32} />
                <h2 className="text-gold">{isLogin ? t('signIn') : t('createAccount')}</h2>
                <p>{isLogin ? t('eliteAccessOnly') : t('joinCommunity')}</p>
              </div>

              {/* Google Sign In Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => signIn('google')}
                className={styles.googleButton}
              >
                <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className={styles.googleIcon} />
                {t('continueGoogle')}
              </motion.button>

              <div className={styles.divider}>
                <div className={styles.dividerLine}></div>
                <span className={styles.dividerText}>{t('or')}</span>
                <div className={styles.dividerLine}></div>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}

                {!isLogin && (
                  <div className={styles.inputBox}>
                    <Users className={styles.inputIcon} size={18} />
                    <input
                      type="text"
                      placeholder={t('fullName')}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className={styles.inputBox}>
                  <Mail className={styles.inputIcon} size={18} />
                  <input
                    type="email"
                    placeholder={t('email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputBox}>
                  <Lock className={styles.inputIcon} size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t('password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.eyeIcon}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
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
