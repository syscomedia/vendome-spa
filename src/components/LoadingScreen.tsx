'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import styles from './LoadingScreen.module.css';

const LoadingScreen = () => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <div className={styles.loaderContainer}>
            <div className={styles.particles}>
                {mounted && [...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={styles.particle}
                        initial={{
                            left: Math.random() * 100 + '%',
                            top: Math.random() * 100 + '%',
                            scale: Math.random() * 0.5 + 0.5,
                            opacity: 0
                        }}
                        animate={{
                            y: [0, Math.random() * -100 - 50],
                            opacity: [0, 0.8, 0]
                        }}
                        transition={{
                            duration: Math.random() * 5 + 5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            width: Math.random() * 4 + 1 + 'px',
                            height: Math.random() * 4 + 1 + 'px',
                        }}
                    />
                ))}
            </div>

            <motion.div
                className={styles.logoWrapper}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <motion.img
                    src="/logo.png"
                    alt="Vendôme Logo"
                    className={styles.logo}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
            </motion.div>

            <motion.h1
                className={styles.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
            >
                VENDÔME
            </motion.h1>

            <div className={styles.progressContainer}>
                <motion.div
                    className={styles.progressBar}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
        </div>
    );
};

export default LoadingScreen;
