"use client";

import React, { useState, useEffect } from "react";
import styles from "./FeatureModal.module.css";
import { Sparkles, RotateCcw, Trophy, Zap, AlertCircle, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";

export default function FeatureModal() {
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState(1);
    const [storageKey, setStorageKey] = useState(null);

    useEffect(() => {
        const session = getSession();
        if (!session) return;

        // Create a unique key for this user/version combo
        const userKey = `seen_onboarding_final_${session.id}`;
        setStorageKey(userKey);

        // Check if this specific user has seen this update
        const hasSeen = localStorage.getItem(userKey);
        if (!hasSeen) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const nextStep = () => {
        setStep(2);
    };

    const handleClose = () => {
        if (storageKey) {
            localStorage.setItem(storageKey, "true");
        }
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {step === 1 ? (
                    <>
                        <div className={styles.iconContainer}>
                            <Sparkles size={40} />
                        </div>

                        <h2 className={styles.title}>System Upgrade Complete!</h2>

                        <p className={styles.description}>
                            We've added major new capabilities to improve workflow flexibility and performance tracking across the team.
                        </p>

                        <div className={styles.features}>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}><RotateCcw size={18} /></div>
                                <span><b>Task Rollback:</b> Return tasks for rework with a single click if needed.</span>
                            </div>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}><Trophy size={18} /></div>
                                <span><b>Department Leaderboard:</b> Track performance and celebrate successes.</span>
                            </div>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}><Zap size={18} /></div>
                                <span><b>Instant Chat Loading:</b> Ultra-fast transitions between conversations.</span>
                            </div>
                        </div>

                        <button className={styles.button} onClick={nextStep} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            Next <ArrowRight size={18} />
                        </button>
                    </>
                ) : (
                    <>
                        <div className={styles.iconContainer} style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399' }}>
                            <AlertCircle size={40} />
                        </div>

                        <h2 className={styles.title}>System Migration Notice</h2>

                        <p className={styles.description} style={{ textAlign: 'justify' }}>
                            <b>Attention Team:</b> We are scheduled to migrate fully to this management system tomorrow, <b>In Sha Allah</b>.
                            <br /><br />
                            We kindly request all members to test their accounts, explore all pages and features, and ensure you are comfortable with the new workflow today.
                            <br /><br />
                            Thank you for your cooperation!
                        </p>

                        <button className={styles.button} onClick={handleClose}>
                            Got it, I'll check everything!
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
